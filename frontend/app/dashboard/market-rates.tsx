import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  LayoutAnimation,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  UIManager,
  View,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { ChevronDown, X } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  GoldRateSettingsModal,
  GoldRateSettingsRow,
  ScannerCalculationPicker,
  type ScannerCalculationUse,
} from '@/components/dashboard/market-rates/GoldRateSettings';
import {
  GoldEditModalFields,
  GoldIncreaseModalFields,
  GoldRatesTable,
  McxLiveBanner,
} from '@/components/dashboard/market-rates/GoldRatesTable';
import { LabourRatesPanel } from '@/components/dashboard/market-rates/LabourRatesPanel';
import { StoneRatesPanel } from '@/components/dashboard/market-rates/StoneRatesPanel';
import { BottomNav } from '@/components/dashboard/BottomNav';
import { ToastNotification, type ToastType } from '@/components/scanner/ToastNotification';
import { BackgroundPattern } from '@/components/ui/BackgroundPattern';
import { PageHeader } from '@/components/ui/PageHeader';
import { screenStyles } from '@/constants/screenLayout';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useRequireMarketRatesAccess } from '@/hooks/useMarketRatesAccess';
import {
  useGetGoldRatesQuery,
  useUpdateGoldRateMutation,
  useUpdateGoldRateVisibilityMutation,
  useUpdateGoldTaxSettingsMutation,
} from '@/store/goldRatesApi';
import type { GoldIncreaseByType, GoldRate } from '@/types/rates';
import {
  applyGoldIncrease,
  calculateBaseGoldRate,
  computeDisplayGoldRates,
  deriveActiveBaseRate,
  flatIncreaseForFinalRate,
  formatKaratLabel,
  validateFinalRateValue,
  validateIncreaseAmount,
  validatePurityValue,
} from '@/utils/goldRateUtils';

const BUTTON_GREEN = '#1B3022';
const CARAT_ORDER = ['22Kt', '20Kt', '18Kt', '14Kt', '9Kt'];

type RatesTab = 'gold' | 'diamond' | 'colorstone' | 'labour';

const TAB_SCREEN_TITLE: Record<RatesTab, string> = {
  gold: 'Gold Rates',
  diamond: 'Diamond Rates',
  colorstone: 'Colorstone Rates',
  labour: 'Labour Charge Rates',
};

const TABLE_ROW_ANIMATION = {
  duration: 220,
  create: { type: LayoutAnimation.Types.easeInEaseOut, property: LayoutAnimation.Properties.opacity },
  update: { type: LayoutAnimation.Types.easeInEaseOut },
  delete: { type: LayoutAnimation.Types.easeInEaseOut, property: LayoutAnimation.Properties.opacity },
};

const SECTION_ANIMATION = {
  duration: 220,
  create: { type: LayoutAnimation.Types.easeInEaseOut, property: LayoutAnimation.Properties.opacity },
  update: { type: LayoutAnimation.Types.easeInEaseOut },
  delete: { type: LayoutAnimation.Types.easeInEaseOut, property: LayoutAnimation.Properties.opacity },
};

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

function parseTabParam(tab?: string): RatesTab {
  if (tab === 'diamond' || tab === 'colorstone' || tab === 'labour' || tab === 'gold') {
    return tab;
  }
  return 'gold';
}

export default function MarketRatesScreen() {
  const access = useRequireMarketRatesAccess();
  const { tab } = useLocalSearchParams<{ tab?: string }>();
  const activeTab = useMemo(() => parseTabParam(tab), [tab]);

  const {
    data: goldData,
    isLoading: isGoldLoading,
    error: goldError,
  } = useGetGoldRatesQuery(undefined, {
    skip: !access.hasAnyAccess || activeTab !== 'gold',
    pollingInterval: 30000,
    refetchOnMountOrArgChange: true,
    refetchOnReconnect: true,
    refetchOnFocus: true,
  });

  const [updateGoldRateMutation, { isLoading: isUpdatingGoldRate }] = useUpdateGoldRateMutation();
  const [updateGoldRateVisibilityMutation] = useUpdateGoldRateVisibilityMutation();
  const [updateGoldTaxSettingsMutation, { isLoading: isUpdatingTaxSettings }] =
    useUpdateGoldTaxSettingsMutation();

  const [toast, setToast] = useState<{ visible: boolean; message: string; type: ToastType }>({
    visible: false,
    message: '',
    type: 'info',
  });

  const [editingGold, setEditingGold] = useState<GoldRate | null>(null);
  const [editPurity, setEditPurity] = useState('');
  const [editFinalRate, setEditFinalRate] = useState('');
  const [editPurityError, setEditPurityError] = useState<string | null>(null);
  const [editFinalRateError, setEditFinalRateError] = useState<string | null>(null);

  const [increasingGold, setIncreasingGold] = useState<GoldRate | null>(null);
  const [increaseAmount, setIncreaseAmount] = useState('');
  const [increaseType, setIncreaseType] = useState<GoldIncreaseByType>('PERCENTAGE');
  const [increaseError, setIncreaseError] = useState<string | null>(null);

  const [taxSettingsVisible, setTaxSettingsVisible] = useState(false);
  const [hiddenGoldRateIds, setHiddenGoldRateIds] = useState<string[]>([]);
  const [hiddenOverrides, setHiddenOverrides] = useState<Record<string, boolean | undefined>>({});
  const [hiddenSectionOpen, setHiddenSectionOpen] = useState(false);

  const mcxLiveRate = goldData?.mcxLiveRate ?? 0;
  const goldRates = goldData?.rates ?? [];
  const supremeRtgsBase =
    goldData?.supremeChanges?.supremeRtgs ??
    mcxLiveRate + (goldData?.supremeChanges?.rtgsChange ?? 0);
  const supremeCashBase =
    goldData?.supremeChanges?.supremeCash ??
    mcxLiveRate + (goldData?.supremeChanges?.cashChange ?? 0);
  const rtgsChange = goldData?.taxSettings?.rtgsChangeBy ?? 0;
  const cashChange = goldData?.taxSettings?.cashChangeBy ?? 0;
  const scannerCalculationUse: ScannerCalculationUse =
    goldData?.taxSettings?.scannerCalculationUse === 'cash' ? 'cash' : 'rtgs';

  const sortedGoldRates = useMemo(() => sortGoldRates(goldRates), [goldRates]);

  const rtgsFinalRate = supremeRtgsBase + rtgsChange;
  const cashFinalRate = supremeCashBase + cashChange;

  const activeBaseRate = useMemo(
    () => deriveActiveBaseRate(scannerCalculationUse, mcxLiveRate, rtgsFinalRate, cashFinalRate),
    [scannerCalculationUse, mcxLiveRate, rtgsFinalRate, cashFinalRate],
  );

  const displayGoldRates = useMemo(
    () => computeDisplayGoldRates(sortedGoldRates, activeBaseRate),
    [sortedGoldRates, activeBaseRate],
  );

  const goldRateKey = (rate: GoldRate) => rate.id ?? rate.carat;

  const visibleGoldRates = useMemo(
    () =>
      displayGoldRates.filter((rate) => {
        const key = goldRateKey(rate);
        const override = hiddenOverrides[key];
        const isHidden = override ?? rate.isHidden ?? false;
        return !isHidden && !hiddenGoldRateIds.includes(key);
      }),
    [displayGoldRates, hiddenGoldRateIds, hiddenOverrides],
  );

  const hiddenGoldRates = useMemo(
    () =>
      displayGoldRates.filter((rate) => {
        const key = goldRateKey(rate);
        const override = hiddenOverrides[key];
        const isHidden = override ?? rate.isHidden ?? false;
        return isHidden || hiddenGoldRateIds.includes(key);
      }),
    [displayGoldRates, hiddenGoldRateIds, hiddenOverrides],
  );

  const showToast = (message: string, type: ToastType = 'info') => {
    setToast({ visible: true, message, type });
  };

  useEffect(() => {
    if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }, []);

  useEffect(() => {
    const knownKeys = new Set(displayGoldRates.map((rate) => goldRateKey(rate)));
    const serverHidden = new Set(
      displayGoldRates.filter((rate) => rate.isHidden).map((rate) => goldRateKey(rate)),
    );
    const next = Array.from(serverHidden).filter((key) => knownKeys.has(key));
    setHiddenGoldRateIds((prev) =>
      next.length === prev.length && next.every((key, idx) => key === prev[idx]) ? prev : next,
    );
  }, [displayGoldRates]);

  useEffect(() => {
    if (hiddenGoldRates.length === 0 && hiddenSectionOpen) {
      setHiddenSectionOpen(false);
    }
  }, [hiddenGoldRates.length, hiddenSectionOpen]);

  if (!access.hasAnyAccess) return null;

  const isSaving = isUpdatingGoldRate || isUpdatingTaxSettings;
  const showGoldLoading = activeTab === 'gold' && access.canEditGold && isGoldLoading && !goldData;
  const hasGoldError = activeTab === 'gold' && !!goldError && !goldData;

  const openGoldEdit = (rate: GoldRate) => {
    setEditingGold(rate);
    setEditPurity(String(rate.purity));
    setEditFinalRate(String(rate.finalRate));
    setEditPurityError(null);
    setEditFinalRateError(null);
  };

  const openGoldIncrease = (rate: GoldRate) => {
    setIncreasingGold(rate);
    setIncreaseAmount('');
    setIncreaseType('PERCENTAGE');
    setIncreaseError(null);
  };

  const handleHideGoldRate = async (rate: GoldRate) => {
    LayoutAnimation.configureNext(TABLE_ROW_ANIMATION);
    const key = goldRateKey(rate);
    setHiddenOverrides((prev) => ({ ...prev, [key]: true }));
    setHiddenGoldRateIds((prev) => (prev.includes(key) ? prev : [...prev, key]));

    try {
      await updateGoldRateVisibilityMutation({
        id: rate.id,
        carat: rate.carat,
        hidden: true,
      }).unwrap();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to hide gold rate';
      showToast(message, 'error');
      setHiddenOverrides((prev) => ({ ...prev, [key]: undefined }));
      setHiddenGoldRateIds((prev) => prev.filter((id) => id !== key));
      return;
    }

    setHiddenOverrides((prev) => ({ ...prev, [key]: undefined }));
  };

  const handleRestoreGoldRate = async (rate: GoldRate) => {
    LayoutAnimation.configureNext(TABLE_ROW_ANIMATION);
    const key = goldRateKey(rate);
    setHiddenOverrides((prev) => ({ ...prev, [key]: false }));
    setHiddenGoldRateIds((prev) => prev.filter((id) => id !== key));

    try {
      await updateGoldRateVisibilityMutation({
        id: rate.id,
        carat: rate.carat,
        hidden: false,
      }).unwrap();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to restore gold rate';
      showToast(message, 'error');
      setHiddenOverrides((prev) => ({ ...prev, [key]: undefined }));
      setHiddenGoldRateIds((prev) => (prev.includes(key) ? prev : [...prev, key]));
      return;
    }

    setHiddenOverrides((prev) => ({ ...prev, [key]: undefined }));
  };

  const toggleHiddenSection = () => {
    LayoutAnimation.configureNext(SECTION_ANIMATION);
    setHiddenSectionOpen((prev) => !prev);
  };

  const handleEditPurityChange = (value: string) => {
    setEditPurity(value);
    const purity = Number(value);
    const purityErr = validatePurityValue(purity);
    setEditPurityError(purityErr);
    if (!purityErr && activeBaseRate > 0) {
      const recalculated = calculateBaseGoldRate(activeBaseRate, purity);
      setEditFinalRate(String(recalculated));
      setEditFinalRateError(null);
    }
  };

  const handleEditFinalRateChange = (value: string) => {
    setEditFinalRate(value.replace(/[^\d.]/g, ''));
    const finalRate = Number(value);
    setEditFinalRateError(validateFinalRateValue(finalRate));
  };

  const handleSaveGoldEdit = async () => {
    if (!editingGold) return;
    const purity = Number(editPurity);
    const finalRate = Number(editFinalRate);
    const purityErr = validatePurityValue(purity);
    const finalRateErr = validateFinalRateValue(finalRate);
    setEditPurityError(purityErr);
    setEditFinalRateError(finalRateErr);
    if (purityErr || finalRateErr) return;

    const baseRate = calculateBaseGoldRate(activeBaseRate, purity);
    const increaseByAmount = flatIncreaseForFinalRate(baseRate, finalRate);
    const increaseByType: GoldIncreaseByType = 'FLAT';

    try {
      const updated = await updateGoldRateMutation({
        carat: editingGold.carat,
        purity,
        increaseByAmount,
        increaseByType,
      }).unwrap();
      setEditingGold(null);
      showToast(`${formatKaratLabel(updated.carat)} rate updated`, 'success');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update gold rate. Please try again.';
      showToast(message, 'error');
    }
  };

  const handleApplyIncrease = async () => {
    if (!increasingGold) return;
    const amount = Number(increaseAmount);
    const amountErr = validateIncreaseAmount(amount);
    setIncreaseError(amountErr);
    if (amountErr) return;

    try {
      const updated = await updateGoldRateMutation({
        carat: increasingGold.carat,
        purity: increasingGold.purity,
        increaseByAmount: amount,
        increaseByType: increaseType,
      }).unwrap();
      setIncreasingGold(null);
      showToast(`${formatKaratLabel(updated.carat)} rate increased`, 'success');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to apply increase. Please try again.';
      showToast(message, 'error');
    }
  };

  const increasePreview =
    increasingGold && increaseAmount
      ? applyGoldIncrease(
          calculateBaseGoldRate(activeBaseRate, increasingGold.purity),
          Number(increaseAmount) || 0,
          increaseType,
        )
      : null;

  const handleApplyTaxSettings = async (nextRtgsChange: number, nextCashChange: number) => {
    try {
      await updateGoldTaxSettingsMutation({
        rtgsChangeBy: nextRtgsChange,
        cashChangeBy: nextCashChange,
      }).unwrap();
      showToast('Gold rate settings updated', 'success');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save gold rate settings';
      showToast(message, 'error');
    }
  };

  const handleScannerCalculationChange = async (value: ScannerCalculationUse) => {
    try {
      await updateGoldTaxSettingsMutation({ scannerCalculationUse: value }).unwrap();
      showToast('Scanner base updated', 'success');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update scanner base';
      showToast(message, 'error');
    }
  };

  return (
    <SafeAreaView style={screenStyles.safeArea} edges={['top']}>
      <BackgroundPattern />

      <ScrollView contentContainerStyle={screenStyles.scrollContent} showsVerticalScrollIndicator={false}>
        <PageHeader title={TAB_SCREEN_TITLE[activeTab]} />

        {showGoldLoading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="large" color={BUTTON_GREEN} />
            <Text style={styles.loadingText}>Loading rates…</Text>
          </View>
        ) : activeTab === 'gold' ? (
          access.canEditGold ? (
            <View style={screenStyles.screenSection}>
              <McxLiveBanner mcxLiveRate={mcxLiveRate} />
              <GoldRateSettingsRow onPress={() => setTaxSettingsVisible(true)} />
              <ScannerCalculationPicker value={scannerCalculationUse} onChange={handleScannerCalculationChange} />
              <Text style={styles.sectionTitle}>Gold Karat Rates</Text>

              {visibleGoldRates.length > 0 ? (
                <GoldRatesTable
                  rates={visibleGoldRates}
                  onEdit={openGoldEdit}
                  onIncreaseBy={openGoldIncrease}
                  onToggleVisibility={handleHideGoldRate}
                  visibilityAction="hide"
                />
              ) : hiddenGoldRates.length > 0 ? (
                <View style={screenStyles.emptyCard}>
                  <Text style={screenStyles.emptyText}>All gold rates are hidden.</Text>
                </View>
              ) : hasGoldError ? (
                <View style={screenStyles.emptyCard}>
                  <Text style={screenStyles.emptyText}>Unable to load gold rates. Pull down to refresh.</Text>
                </View>
              ) : (
                <View style={screenStyles.emptyCard}>
                  <Text style={screenStyles.emptyText}>No gold rates available.</Text>
                </View>
              )}

              {hiddenGoldRates.length > 0 ? (
                <View style={styles.hiddenSection}>
                  <Pressable onPress={toggleHiddenSection} style={styles.hiddenHeader}>
                    <Text style={styles.hiddenTitle}>Hidden Gold Karat Rates ({hiddenGoldRates.length})</Text>
                    <ChevronDown
                      size={18}
                      color={Colors.textMuted}
                      style={hiddenSectionOpen ? styles.hiddenChevronOpen : undefined}
                    />
                  </Pressable>
                  {hiddenSectionOpen ? (
                    <View style={styles.hiddenTableWrap}>
                      <GoldRatesTable
                        rates={hiddenGoldRates}
                        onEdit={openGoldEdit}
                        onIncreaseBy={openGoldIncrease}
                        onToggleVisibility={handleRestoreGoldRate}
                        visibilityAction="restore"
                        showEditAction={false}
                      />
                    </View>
                  ) : null}
                </View>
              ) : null}
            </View>
          ) : (
            <View style={screenStyles.emptyCard}>
              <Text style={screenStyles.emptyText}>You do not have permission to view or edit Gold Rates.</Text>
            </View>
          )
        ) : activeTab === 'labour' ? (
          access.canEditLabour ? (
            <View style={screenStyles.screenSection}>
              <LabourRatesPanel onToast={showToast} />
            </View>
          ) : (
            <View style={screenStyles.emptyCard}>
              <Text style={screenStyles.emptyText}>You do not have permission to view or edit Labour Charges.</Text>
            </View>
          )
        ) : activeTab === 'diamond' || activeTab === 'colorstone' ? (
          (activeTab === 'diamond' && access.canEditDiamond) ||
          (activeTab === 'colorstone' && access.canEditColorstone) ? (
            <View style={screenStyles.screenSection}>
              <StoneRatesPanel stoneType={activeTab} onToast={showToast} />
            </View>
          ) : (
            <View style={screenStyles.emptyCard}>
              <Text style={screenStyles.emptyText}>
                You do not have permission to view or edit {activeTab === 'diamond' ? 'Diamond' : 'Colorstone'} Rates.
              </Text>
            </View>
          )
        ) : null}
      </ScrollView>

      <ToastNotification
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onDismiss={() => setToast((prev) => ({ ...prev, visible: false }))}
      />

      <BottomNav activeRoute="home" />

      <Modal visible={editingGold !== null} transparent animationType="fade" onRequestClose={() => setEditingGold(null)}>
        <View style={screenStyles.modalOverlay}>
          <View style={screenStyles.modalCard}>
            <Pressable onPress={() => setEditingGold(null)} hitSlop={8} style={styles.modalClose}>
              <X size={20} color={Colors.textSecondary} />
            </Pressable>
            <Text style={styles.modalTitle}>Edit {editingGold ? formatKaratLabel(editingGold.carat) : ''} Rate</Text>
            <GoldEditModalFields
              karatLabel={editingGold ? formatKaratLabel(editingGold.carat) : ''}
              purity={editPurity}
              finalRate={editFinalRate}
              purityError={editPurityError}
              finalRateError={editFinalRateError}
              onPurityChange={handleEditPurityChange}
              onFinalRateChange={handleEditFinalRateChange}
            />
            <View style={styles.modalActions}>
              <Pressable onPress={() => setEditingGold(null)} style={styles.cancelBtn}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </Pressable>
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={handleSaveGoldEdit}
                disabled={isSaving}
                style={[styles.applyBtn, isSaving && styles.applyBtnDisabled]}
              >
                {isSaving ? <ActivityIndicator color={Colors.white} /> : <Text style={styles.applyBtnText}>Apply</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={increasingGold !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setIncreasingGold(null)}
      >
        <View style={screenStyles.modalOverlay}>
          <View style={screenStyles.modalCard}>
            <Pressable onPress={() => setIncreasingGold(null)} hitSlop={8} style={styles.modalClose}>
              <X size={20} color={Colors.textSecondary} />
            </Pressable>
            <Text style={styles.modalTitle}>
              Increase {increasingGold ? formatKaratLabel(increasingGold.carat) : ''} Rate
            </Text>
            <GoldIncreaseModalFields
              currentFinalRate={
                increasingGold ? computeDisplayGoldRates([increasingGold], activeBaseRate)[0]?.finalRate ?? 0 : 0
              }
              increaseAmount={increaseAmount}
              increaseType={increaseType}
              increaseError={increaseError}
              onIncreaseAmountChange={setIncreaseAmount}
              onIncreaseTypeChange={setIncreaseType}
            />
            {increasePreview != null ? (
              <Text style={styles.previewText}>New rate after apply: ₹{increasePreview.toLocaleString('en-IN')}</Text>
            ) : null}
            <View style={styles.modalActions}>
              <Pressable onPress={() => setIncreasingGold(null)} style={styles.cancelBtn}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </Pressable>
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={handleApplyIncrease}
                disabled={isSaving}
                style={[styles.applyBtn, isSaving && styles.applyBtnDisabled]}
              >
                {isSaving ? <ActivityIndicator color={Colors.white} /> : <Text style={styles.applyBtnText}>Apply</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <GoldRateSettingsModal
        visible={taxSettingsVisible}
        mcxLiveRate={mcxLiveRate}
        supremeRtgsRate={supremeRtgsBase}
        supremeCashRate={supremeCashBase}
        rtgsChange={rtgsChange}
        cashChange={cashChange}
        rtgsFinalRate={rtgsFinalRate}
        cashFinalRate={cashFinalRate}
        onClose={() => setTaxSettingsVisible(false)}
        onApply={handleApplyTaxSettings}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loadingWrap: { paddingVertical: 48, alignItems: 'center', gap: Spacing.md },
  loadingText: { fontSize: 14, color: Colors.textMuted },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  hiddenSection: {
    marginTop: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.input,
    backgroundColor: Colors.white,
    overflow: 'hidden',
  },
  hiddenHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    backgroundColor: '#F7F7F7',
  },
  hiddenTitle: { fontSize: 13, fontWeight: '700', color: Colors.textPrimary },
  hiddenChevronOpen: { transform: [{ rotate: '180deg' }] },
  hiddenTableWrap: { padding: Spacing.md },
  modalClose: { alignSelf: 'flex-end' },
  modalTitle: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary, marginBottom: Spacing.sm },
  previewText: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: Spacing.md,
    fontWeight: '600',
  },
  modalActions: { flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.xl },
  cancelBtn: {
    flex: 1,
    height: Spacing.buttonHeight,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.button,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: { fontSize: 15, fontWeight: '600', color: Colors.textSecondary },
  applyBtn: {
    flex: 1,
    height: Spacing.buttonHeight,
    backgroundColor: BUTTON_GREEN,
    borderRadius: Radius.button,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyBtnDisabled: { opacity: 0.7 },
  applyBtnText: { fontSize: 15, fontWeight: '600', color: Colors.white },
});
