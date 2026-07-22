import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomNav } from '@/components/dashboard/BottomNav';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { Colors, Spacing } from '@/constants/theme';
import { useMarketRatesAccess } from '@/hooks/useMarketRatesAccess';
import type { GoldRate, TaxSettings } from '@/types/rates';
import { ApiError } from '@/utils/apiClient';
import { formatKaratLabel, resolveMcxChangeValue } from '@/utils/goldRateUtils';
import { fetchGoldRates } from '@/utils/ratesApi';
import { useMatricesStore } from '@/store/matricesStore';
import { useSettingsAccess } from '@/hooks/useSettingsAccess';
import type { MatrixKey } from '@/constants/dashboardMatrices';

const CARAT_ORDER = ['22Kt', '20Kt', '18Kt', '14Kt', '9Kt'];

function sortGoldRates(rates: GoldRate[]): GoldRate[] {
  return [...rates].sort((a, b) => {
    const ai = CARAT_ORDER.indexOf(a.carat);
    const bi = CARAT_ORDER.indexOf(b.carat);
    if (ai === -1 && bi === -1) return a.carat.localeCompare(b.carat);
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });
}

const ACCENT_GOLD = '#D4C19C';
const TAB_INACTIVE = '#F2F2F7';

export default function DashboardScreen() {
  const { canEditMarketRates } = useMarketRatesAccess();
  const [loading, setLoading] = useState(true);
  const [mcxLiveRate, setMcxLiveRate] = useState<number | null>(null);
  const [goldRates, setGoldRates] = useState<GoldRate[]>([]);
  const [goldTaxSettings, setGoldTaxSettings] = useState<TaxSettings | undefined>();
  const { employee, userRole } = useSettingsAccess();
  const globalMatrixValues = useMatricesStore((s) => s.values);
  
  // Use employee's granular matrix permissions if logged in as employee, otherwise fallback to global device values
  const matrixValues = userRole === 'employee' && employee 
    ? employee.permissions 
    : globalMatrixValues;
  
  const sortedGoldRates = useMemo(() => sortGoldRates(goldRates), [goldRates]);
  const mcxFinalRate = useMemo(() => {
    const live = mcxLiveRate ?? 0;
    const mcxChangeBy =
      goldTaxSettings?.mcxChangeBy ??
      resolveMcxChangeValue(goldTaxSettings?.mcxChange);
    return goldTaxSettings?.mcxFinalRate ?? live + mcxChangeBy;
  }, [goldTaxSettings?.mcxChange, goldTaxSettings?.mcxChangeBy, goldTaxSettings?.mcxFinalRate, mcxLiveRate]);
  const twentyFourKRate = useMemo(() => {
    const matched = sortedGoldRates.find((rate) => {
      const carat = rate.carat.toLowerCase();
      return carat.includes('24') || Math.abs(rate.purity - 99.9) < 0.2;
    });

    if (matched) return matched;
    if (mcxLiveRate == null && !goldTaxSettings) return null;

    const cashRate = goldTaxSettings?.cashFinalRate ?? mcxFinalRate ?? 0;
    const rtgsRate = goldTaxSettings?.rtgsFinalRate ?? mcxFinalRate ?? 0;

    return {
      id: '24k-synthetic',
      carat: '24Kt',
      purity: 99.9,
      finalRate: rtgsRate,
      cashRate,
      rtgsRate,
      baseRate: mcxFinalRate ?? rtgsRate,
      mcxRate: mcxLiveRate ?? undefined,
    } satisfies GoldRate;
  }, [goldTaxSettings, mcxFinalRate, mcxLiveRate, sortedGoldRates]);
  const show24kMcx = matrixValues['24k_mcx' as MatrixKey] !== false;
  const show24kRtgs = matrixValues['24k_rtgs' as MatrixKey] !== false;
  const show24kCash = matrixValues['24k_cash' as MatrixKey] !== false;
  const show24kRateCard = show24kRtgs || show24kCash;
  const today = new Date();
  const dayLabel = today.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
  const dateNum = today.getDate();

  const loadMarketData = useCallback(async (showLoader = true) => {
    if (showLoader) setLoading(true);
    try {
      const gold = await fetchGoldRates();
      setMcxLiveRate(gold.mcxLiveRate);
      setGoldRates(gold.rates);
      setGoldTaxSettings(gold.taxSettings);
    } catch (error) {
      if (showLoader) {
        const message =
          error instanceof ApiError
            ? error.message
            : 'Failed to load market rates. Showing last known values.';
        Alert.alert('Market Data', message);
      }
    } finally {
      if (showLoader) setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadMarketData();
    }, [loadMarketData]),
  );

  useEffect(() => {
    // Auto-refresh the dashboard every 60 seconds
    const intervalId = setInterval(() => {
      // Pass false to loadMarketData to avoid showing the loading spinner every minute
      void loadMarketData(false);
    }, 60000);
    return () => clearInterval(intervalId);
  }, [loadMarketData]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <DashboardHeader />

        <View style={styles.titleRow}>
          <Text style={styles.pageTitle}>
            Today Market{'\n'}Overview
          </Text>
          <View style={styles.dateBadge}>
            <Text style={styles.dateDay}>{dayLabel}</Text>
            <Text style={styles.dateNum}>{dateNum}</Text>
          </View>
        </View>

        <View style={styles.cardsWrap}>
          {loading ? (
            <View style={styles.loadingWrap}>
              <ActivityIndicator size="large" color={Colors.primaryNav} />
              <Text style={styles.loadingText}>Loading live MCX rates...</Text>
            </View>
          ) : (
            <>
              {mcxLiveRate != null && show24kMcx ? (
                <View style={styles.mcxTopCard}>
                  <Text style={styles.mcxTopLabel}>MCX Gold Rate (24 Kt)</Text>
                  <Text style={styles.mcxTopValue}>₹ {mcxLiveRate.toLocaleString('en-IN')}</Text>
                </View>
              ) : null}

              {twentyFourKRate && show24kRateCard ? (
                <View style={styles.rateCard}>
                  <View style={styles.rateCardHeader}>
                    <Text style={styles.cardKaratLabel}>Gold (24K) 99.9%</Text>
                    {show24kCash && !show24kRtgs ? (
                      <View style={styles.rateBadge}>
                        <Text style={styles.rateBadgeValue}>
                          ₹ {(twentyFourKRate.cashRate ?? twentyFourKRate.finalRate).toLocaleString('en-IN')}
                        </Text>
                        <Text style={styles.rateBadgeLabel}>(Cash Rate)</Text>
                      </View>
                    ) : show24kRtgs && !show24kCash ? (
                      <View style={styles.rateBadge}>
                        <Text style={styles.rateBadgeValue}>
                          ₹ {(twentyFourKRate.rtgsRate ?? twentyFourKRate.finalRate).toLocaleString('en-IN')}
                        </Text>
                        <Text style={styles.rateBadgeLabel}>(RTGS Rate)</Text>
                      </View>
                    ) : null}
                  </View>

                  {show24kCash && show24kRtgs ? (
                    <View style={styles.rateCardBody}>
                      <View style={styles.rateBadge}>
                        <Text style={styles.rateBadgeValue}>
                          ₹ {(twentyFourKRate.cashRate ?? twentyFourKRate.finalRate).toLocaleString('en-IN')}
                        </Text>
                        <Text style={styles.rateBadgeLabel}>(Cash Rate)</Text>
                      </View>
                      <View style={styles.rateBadge}>
                        <Text style={styles.rateBadgeValue}>
                          ₹ {(twentyFourKRate.rtgsRate ?? twentyFourKRate.finalRate).toLocaleString('en-IN')}
                        </Text>
                        <Text style={styles.rateBadgeLabel}>(RTGS Rate)</Text>
                      </View>
                    </View>
                  ) : null}
                </View>
              ) : null}

              {sortedGoldRates.length > 0 ? (
                sortedGoldRates
                  .filter((rate) => {
                    const carat = rate.carat.toLowerCase();
                    return !(carat.includes('24') || Math.abs(rate.purity - 99.9) < 0.2);
                  })
                  .map((rate) => {
                  const karatPrefix = rate.carat.replace('Kt', 'k').toLowerCase();
                  const showCash = matrixValues[`${karatPrefix}_cash` as MatrixKey];
                  const showRtgs = matrixValues[`${karatPrefix}_rtgs` as MatrixKey];
                  const showSingleRate = (showCash && !showRtgs) || (!showCash && showRtgs);
                  
                  if (!showCash && !showRtgs) return null;

                  const purityLabel = formatPurityLabel(rate.purity);
                  const singleRateLabel = showCash ? 'Cash Rate' : 'RTGS Rate';
                  const singleRateValue = showCash ? rate.cashRate : rate.rtgsRate;

                  return (
                    <View key={rate.carat} style={styles.rateCard}>
                      <View style={styles.rateCardHeader}>
                        <Text style={styles.cardKaratLabel}>
                          Gold ({formatKaratLabel(rate.carat)}) {purityLabel}
                        </Text>
                        {showSingleRate ? (
                          <View style={styles.rateBadge}>
                            <Text style={styles.rateBadgeValue}>
                              ₹ {singleRateValue?.toLocaleString('en-IN') || 0}
                            </Text>
                            <Text style={styles.rateBadgeLabel}>({singleRateLabel})</Text>
                          </View>
                        ) : null}
                      </View>

                      {!showSingleRate && (showCash || showRtgs) && (
                        <View style={styles.rateCardBody}>
                          {showCash && (
                            <View style={styles.rateBadge}>
                              <Text style={styles.rateBadgeValue}>
                                ₹ {rate.cashRate?.toLocaleString('en-IN') || 0}
                              </Text>
                              <Text style={styles.rateBadgeLabel}>(Cash Rate)</Text>
                            </View>
                          )}
                          {showRtgs && (
                            <View style={styles.rateBadge}>
                              <Text style={styles.rateBadgeValue}>₹ {rate.rtgsRate?.toLocaleString('en-IN') || 0}</Text>
                              <Text style={styles.rateBadgeLabel}>(RTGS Rate)</Text>
                            </View>
                          )}
                        </View>
                      )}
                    </View>
                  );
                })
              ) : (
                <View style={styles.emptyWrap}>
                  <Text style={styles.emptyText}>No gold rates available</Text>
                </View>
              )}
            </>
          )}
        </View>
      </ScrollView>

      <BottomNav activeRoute="home" />
    </SafeAreaView>
  );
}

function formatPurityLabel(purity: number): string {
  if (!Number.isFinite(purity)) return '';
  return `${purity.toFixed(1)}%`;
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Spacing.screenBottom + 80,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.screenHorizontal,
    marginTop: Spacing.lg,
  },
  pageTitle: {
    flex: 1,
    fontSize: 28,
    fontWeight: '800',
    lineHeight: 34,
    color: '#000000',
  },
  dateBadge: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: ACCENT_GOLD,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: Spacing.md,
  },
  dateDay: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.white,
    marginBottom: 2,
  },
  dateNum: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.white,
  },
  cardsWrap: {
    paddingHorizontal: Spacing.screenHorizontal,
    marginTop: Spacing.md,
    gap: Spacing.lg,
  },
  loadingWrap: {
    paddingVertical: 40,
    alignItems: 'center',
    gap: Spacing.md,
  },
  loadingText: { 
    fontSize: 14, 
    color: Colors.textMuted 
  },
  emptyWrap: {
    alignItems: 'center',
    marginTop: 32,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textMuted,
  },
  mcxTopCard: {
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1B3022',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  mcxTopLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#D4C19C',
  },
  mcxTopValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  rateCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  rateCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingBottom: Spacing.sm,
    marginBottom: Spacing.sm,
    alignItems: 'center',
  },
  cardKaratLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  rateCardBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rateBadge: {
    backgroundColor: '#1B3022',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 120,
  },
  rateBadgeValue: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.white,
    marginBottom: 2,
  },
  rateBadgeLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.85)',
  },
});
