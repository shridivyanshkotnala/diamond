import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, X } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  GoldEditModalFields,
  GoldIncreaseModalFields,
  GoldRatesTable,
  McxLiveBanner,
} from '@/components/dashboard/market-rates/GoldRatesTable';
import { StoneRatesTable } from '@/components/dashboard/market-rates/StoneRatesTable';
import { BottomNav } from '@/components/dashboard/BottomNav';
import { ToastNotification, type ToastType } from '@/components/scanner/ToastNotification';
import { BackgroundPattern } from '@/components/ui/BackgroundPattern';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useRequireMarketRatesAccess } from '@/hooks/useMarketRatesAccess';
import type { GoldIncreaseByType, GoldRate, StoneRate } from '@/types/rates';
import { ApiError } from '@/utils/apiClient';
import {
  applyGoldIncrease,
  calculateBaseGoldRate,
  flatIncreaseForFinalRate,
  formatKaratLabel,
  validateFinalRateValue,
  validateIncreaseAmount,
  validatePurityValue,
} from '@/utils/goldRateUtils';
import {
  fetchColorstoneRates,
  fetchDiamondRates,
  fetchGoldRates,
  updateGoldRate,
  upsertColorstoneRate,
  upsertDiamondRate,
} from '@/utils/ratesApi';

const BUTTON_GREEN = '#1B3022';
const ACCENT_GOLD = '#D4C19C';
const CARAT_ORDER = ['22Kt', '20Kt', '18Kt', '14Kt', '9Kt'];

type RatesTab = 'gold' | 'diamond' | 'colorstone' | 'labour';

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
  const allowed = useRequireMarketRatesAccess();
  const router = useRouter();
  const { tab } = useLocalSearchParams<{ tab?: string }>();
  const [activeTab, setActiveTab] = useState<RatesTab>(parseTabParam(tab));
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [mcxLiveRate, setMcxLiveRate] = useState(0);
  const [goldRates, setGoldRates] = useState<GoldRate[]>([]);
  const [diamondRates, setDiamondRates] = useState<StoneRate[]>([]);
  const [colorstoneRates, setColorstoneRates] = useState<StoneRate[]>([]);

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

  const [editingStone, setEditingStone] = useState<StoneRate | null>(null);
  const [stoneColor, setStoneColor] = useState('');
  const [stoneClarity, setStoneClarity] = useState('');
  const [stoneRateValue, setStoneRateValue] = useState('');
  const [stoneModalMode, setStoneModalMode] = useState<'diamond' | 'colorstone'>('diamond');
  const [isNewStone, setIsNewStone] = useState(false);

  const sortedGoldRates = useMemo(() => sortGoldRates(goldRates), [goldRates]);

  useEffect(() => {
    if (tab) setActiveTab(parseTabParam(tab));
  }, [tab]);

  const showToast = (message: string, type: ToastType = 'info') => {
    setToast({ visible: true, message, type });
  };

  const loadRates = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const [gold, diamond, colorstone] = await Promise.all([
        fetchGoldRates(),
        fetchDiamondRates(),
        fetchColorstoneRates(),
      ]);
      setMcxLiveRate(gold.mcxLiveRate);
      setGoldRates(gold.rates);
      setDiamondRates(diamond);
      setColorstoneRates(colorstone);
      if (isRefresh) showToast('Rates refreshed successfully', 'success');
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : 'Failed to load market rates. Please try again.';
      showToast(message, 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (allowed) void loadRates();
    }, [allowed, loadRates]),
  );

  if (!allowed) return null;

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

  const handleEditPurityChange = (value: string) => {
    setEditPurity(value);
    const purity = Number(value);
    const purityErr = validatePurityValue(purity);
    setEditPurityError(purityErr);
    if (!purityErr && mcxLiveRate > 0) {
      const recalculated = calculateBaseGoldRate(mcxLiveRate, purity);
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

    const baseRate = calculateBaseGoldRate(mcxLiveRate, purity);
    const increaseByAmount = flatIncreaseForFinalRate(baseRate, finalRate);
    const increaseByType: GoldIncreaseByType = 'FLAT';

    setSaving(true);
    try {
      const updated = await updateGoldRate({
        carat: editingGold.carat,
        purity,
        increaseByAmount,
        increaseByType,
      });
      setGoldRates((prev) =>
        prev.map((row) => (row.carat === updated.carat ? updated : row)),
      );
      setEditingGold(null);
      showToast(`${formatKaratLabel(updated.carat)} rate updated`, 'success');
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : 'Failed to update gold rate. Please try again.';
      showToast(message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleApplyIncrease = async () => {
    if (!increasingGold) return;
    const amount = Number(increaseAmount);
    const amountErr = validateIncreaseAmount(amount);
    setIncreaseError(amountErr);
    if (amountErr) return;

    setSaving(true);
    try {
      const updated = await updateGoldRate({
        carat: increasingGold.carat,
        purity: increasingGold.purity,
        increaseByAmount: amount,
        increaseByType: increaseType,
      });
      setGoldRates((prev) =>
        prev.map((row) => (row.carat === updated.carat ? updated : row)),
      );
      setIncreasingGold(null);
      showToast(`${formatKaratLabel(updated.carat)} rate increased`, 'success');
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : 'Failed to apply increase. Please try again.';
      showToast(message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const increasePreview =
    increasingGold && increaseAmount
      ? applyGoldIncrease(
          calculateBaseGoldRate(mcxLiveRate, increasingGold.purity),
          Number(increaseAmount) || 0,
          increaseType,
        )
      : null;

  const openStoneEdit = (rate: StoneRate, mode: 'diamond' | 'colorstone') => {
    setStoneModalMode(mode);
    setIsNewStone(false);
    setEditingStone(rate);
    setStoneColor(rate.color);
    setStoneClarity(rate.clarity);
    setStoneRateValue(String(rate.rate));
  };

  const openStoneAdd = (mode: 'diamond' | 'colorstone') => {
    setStoneModalMode(mode);
    setIsNewStone(true);
    setEditingStone(null);
    setStoneColor('');
    setStoneClarity('');
    setStoneRateValue('');
  };

  const closeStoneModal = () => {
    setEditingStone(null);
    setIsNewStone(false);
  };

  const handleSaveStone = async () => {
    const color = stoneColor.trim();
    const clarity = stoneClarity.trim();
    const rate = Number(stoneRateValue);

    if (!color || !clarity) {
      showToast('Color and clarity are required.', 'error');
      return;
    }
    if (!Number.isFinite(rate) || rate <= 0) {
      showToast('Please enter a valid rate.', 'error');
      return;
    }

    setSaving(true);
    try {
      const payload = { color, clarity, rate };
      const updated =
        stoneModalMode === 'diamond'
          ? await upsertDiamondRate(payload)
          : await upsertColorstoneRate(payload);

      const setter = stoneModalMode === 'diamond' ? setDiamondRates : setColorstoneRates;
      setter((prev) => {
        const index = prev.findIndex(
          (item) => item.color === updated.color && item.clarity === updated.clarity,
        );
        if (index >= 0) {
          const next = [...prev];
          next[index] = updated;
          return next;
        }
        return [...prev, updated];
      });
      closeStoneModal();
      showToast(`${stoneModalMode === 'diamond' ? 'Diamond' : 'Colorstone'} rate saved`, 'success');
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : 'Failed to save rate. Please try again.';
      showToast(message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const visibleTabs: { key: RatesTab; label: string }[] = [
    { key: 'gold', label: 'Gold' },
    { key: 'diamond', label: 'Diamond' },
    { key: 'colorstone', label: 'Colorstone' },
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <BackgroundPattern />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => void loadRates(true)}
            tintColor={BUTTON_GREEN}
          />
        }
      >
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={8} style={styles.backBtn}>
            <ChevronLeft size={24} color={Colors.textPrimary} strokeWidth={2} />
          </Pressable>
          <Text style={styles.headerTitle}>Market Rates{'\n'}Control</Text>
          <Text style={styles.headerSubtitle}>Settings → Masters → Rates</Text>
        </View>

        <View style={styles.tabPill}>
          {visibleTabs.map(({ key, label }) => (
            <Pressable
              key={key}
              onPress={() => setActiveTab(key)}
              style={[styles.tabBtn, activeTab === key && styles.tabBtnActive]}
            >
              <Text style={[styles.tabText, activeTab === key && styles.tabTextActive]}>
                {label}
              </Text>
            </Pressable>
          ))}
        </View>

        {loading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="large" color={BUTTON_GREEN} />
            <Text style={styles.loadingText}>Loading rates…</Text>
          </View>
        ) : activeTab === 'gold' ? (
          <View style={styles.section}>
            <McxLiveBanner mcxLiveRate={mcxLiveRate} />
            <Text style={styles.sectionTitle}>Gold Karat Rates</Text>
            {sortedGoldRates.length > 0 ? (
              <GoldRatesTable
                rates={sortedGoldRates}
                onEdit={openGoldEdit}
                onIncreaseBy={openGoldIncrease}
              />
            ) : (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyText}>
                  Unable to load gold rates. Pull down to refresh.
                </Text>
              </View>
            )}
          </View>
        ) : activeTab === 'labour' ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>Labour Rates</Text>
            <Text style={styles.emptyText}>
              Labour rate masters will be configured here. Use the scanner Labour section for
              per-item labour charges until this module is enabled.
            </Text>
          </View>
        ) : (
          <View style={styles.section}>
            <StoneRatesTable
              title={activeTab === 'diamond' ? 'Diamond' : 'Colorstone'}
              rates={activeTab === 'diamond' ? diamondRates : colorstoneRates}
              onEdit={(rate) => openStoneEdit(rate, activeTab)}
              onAdd={() => openStoneAdd(activeTab)}
            />
          </View>
        )}
      </ScrollView>

      <ToastNotification
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onDismiss={() => setToast((prev) => ({ ...prev, visible: false }))}
      />

      <BottomNav activeRoute="home" />

      <Modal
        visible={editingGold !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setEditingGold(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Pressable onPress={() => setEditingGold(null)} hitSlop={8} style={styles.modalClose}>
              <X size={20} color={Colors.textSecondary} />
            </Pressable>
            <Text style={styles.modalTitle}>
              Edit {editingGold ? formatKaratLabel(editingGold.carat) : ''} Rate
            </Text>
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
                disabled={saving}
                style={[styles.applyBtn, saving && styles.applyBtnDisabled]}
              >
                {saving ? (
                  <ActivityIndicator color={Colors.white} />
                ) : (
                  <Text style={styles.applyBtnText}>Apply</Text>
                )}
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
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Pressable onPress={() => setIncreasingGold(null)} hitSlop={8} style={styles.modalClose}>
              <X size={20} color={Colors.textSecondary} />
            </Pressable>
            <Text style={styles.modalTitle}>
              Increase {increasingGold ? formatKaratLabel(increasingGold.carat) : ''} Rate
            </Text>
            <GoldIncreaseModalFields
              currentFinalRate={increasingGold?.finalRate ?? 0}
              increaseAmount={increaseAmount}
              increaseType={increaseType}
              increaseError={increaseError}
              onIncreaseAmountChange={setIncreaseAmount}
              onIncreaseTypeChange={setIncreaseType}
            />
            {increasePreview != null ? (
              <Text style={styles.previewText}>
                New rate after apply: ₹{increasePreview.toLocaleString('en-IN')}
              </Text>
            ) : null}
            <View style={styles.modalActions}>
              <Pressable onPress={() => setIncreasingGold(null)} style={styles.cancelBtn}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </Pressable>
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={handleApplyIncrease}
                disabled={saving}
                style={[styles.applyBtn, saving && styles.applyBtnDisabled]}
              >
                {saving ? (
                  <ActivityIndicator color={Colors.white} />
                ) : (
                  <Text style={styles.applyBtnText}>Apply</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={editingStone !== null || isNewStone}
        transparent
        animationType="fade"
        onRequestClose={closeStoneModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Pressable onPress={closeStoneModal} hitSlop={8} style={styles.modalClose}>
              <X size={20} color={Colors.textSecondary} />
            </Pressable>
            <Text style={styles.modalTitle}>
              {isNewStone ? 'Add' : 'Edit'}{' '}
              {stoneModalMode === 'diamond' ? 'Diamond' : 'Colorstone'} Rate
            </Text>
            <Text style={styles.fieldLabel}>Color</Text>
            <TextInput
              value={stoneColor}
              onChangeText={setStoneColor}
              placeholder={stoneModalMode === 'diamond' ? 'IJ' : 'Ruby Red'}
              placeholderTextColor={Colors.placeholder}
              style={styles.modalInput}
            />
            <Text style={styles.fieldLabel}>Clarity</Text>
            <TextInput
              value={stoneClarity}
              onChangeText={setStoneClarity}
              placeholder={stoneModalMode === 'diamond' ? 'VSSI' : 'A1'}
              placeholderTextColor={Colors.placeholder}
              style={styles.modalInput}
            />
            <Text style={styles.fieldLabel}>Rate (₹)</Text>
            <TextInput
              value={stoneRateValue}
              onChangeText={setStoneRateValue}
              keyboardType="decimal-pad"
              placeholder="120000"
              placeholderTextColor={Colors.placeholder}
              style={styles.modalInput}
            />
            <View style={styles.modalActions}>
              <Pressable onPress={closeStoneModal} style={styles.cancelBtn}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </Pressable>
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={handleSaveStone}
                disabled={saving}
                style={[styles.applyBtn, saving && styles.applyBtnDisabled]}
              >
                {saving ? (
                  <ActivityIndicator color={Colors.white} />
                ) : (
                  <Text style={styles.applyBtnText}>Save</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.white },
  scrollContent: { paddingBottom: 120 },
  header: {
    paddingHorizontal: Spacing.screenHorizontal,
    paddingTop: 8,
    paddingBottom: 12,
  },
  backBtn: { width: 32, height: 32, justifyContent: 'center', marginBottom: 8 },
  headerTitle: { fontSize: 28, fontWeight: '700', color: Colors.textPrimary, lineHeight: 34 },
  headerSubtitle: { fontSize: 12, color: Colors.textMuted, marginTop: 4 },
  tabPill: {
    flexDirection: 'row',
    marginHorizontal: Spacing.screenHorizontal,
    marginBottom: 16,
    backgroundColor: '#F2F2F7',
    borderRadius: 24,
    padding: 4,
    gap: 4,
  },
  tabBtn: { flex: 1, alignItems: 'center', paddingVertical: 8, borderRadius: 20 },
  tabBtnActive: { backgroundColor: ACCENT_GOLD },
  tabText: { fontSize: 13, fontWeight: '600', color: Colors.textMuted },
  tabTextActive: { color: Colors.textPrimary },
  loadingWrap: { paddingVertical: 48, alignItems: 'center', gap: 12 },
  loadingText: { fontSize: 14, color: Colors.textMuted },
  section: { marginHorizontal: Spacing.screenHorizontal, gap: 16 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  emptyCard: {
    marginHorizontal: Spacing.screenHorizontal,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.input,
    padding: 20,
    backgroundColor: Colors.white,
  },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary, marginBottom: 8 },
  emptyText: { fontSize: 14, color: Colors.textMuted, lineHeight: 20 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  modal: {
    width: '100%',
    backgroundColor: Colors.white,
    borderRadius: Radius.input,
    padding: 20,
  },
  modalClose: { alignSelf: 'flex-end' },
  modalTitle: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary, marginBottom: 8 },
  fieldLabel: {
    fontSize: 12,
    color: Colors.textMuted,
    marginBottom: 8,
    marginTop: 8,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  modalInput: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.input,
    paddingHorizontal: 14,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  previewText: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 12,
    fontWeight: '600',
  },
  modalActions: { flexDirection: 'row', gap: 10, marginTop: 20 },
  cancelBtn: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.button,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: { fontSize: 15, fontWeight: '600', color: Colors.textSecondary },
  applyBtn: {
    flex: 1,
    height: 48,
    backgroundColor: BUTTON_GREEN,
    borderRadius: Radius.button,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyBtnDisabled: { opacity: 0.7 },
  applyBtnText: { fontSize: 15, fontWeight: '600', color: Colors.white },
});
