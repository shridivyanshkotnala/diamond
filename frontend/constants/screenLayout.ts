import { StyleSheet } from 'react-native';

import { Colors, Radius, Spacing } from '@/constants/theme';

export const Layout = {
  screenPaddingBottom: Spacing.screenBottom,
  sectionGap: Spacing.sectionGap,
  listGap: Spacing.listGap,
} as const;

export const screenStyles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  scrollContent: {
    paddingBottom: Layout.screenPaddingBottom,
  },
  pageHeader: {
    paddingHorizontal: Spacing.screenHorizontal,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.lg,
  },
  backBtn: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.textPrimary,
    lineHeight: 34,
  },
  pageSubtitle: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: Spacing.xs,
    lineHeight: 18,
  },
  screenSection: {
    marginHorizontal: Spacing.screenHorizontal,
    gap: Layout.sectionGap,
  },
  screenBody: {
    marginHorizontal: Spacing.screenHorizontal,
  },
  list: {
    gap: Layout.listGap,
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.input,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    backgroundColor: Colors.white,
  },
  listRowText: {
    flex: 1,
    paddingRight: Spacing.sm,
  },
  listRowTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
    lineHeight: 20,
  },
  listRowSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
    lineHeight: 16,
  },
  emptyCard: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.input,
    padding: Spacing.lg,
    backgroundColor: Colors.white,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textMuted,
    lineHeight: 20,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    marginBottom: Spacing.sm,
    marginTop: Spacing.lg,
  },
  textInput: {
    minHeight: Spacing.inputHeight,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.input,
    paddingHorizontal: Spacing.inputPaddingX,
    fontSize: 16,
    color: Colors.textPrimary,
    backgroundColor: Colors.white,
  },
  primaryButton: {
    height: Spacing.buttonHeight,
    borderRadius: Radius.button,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xxl,
  },
  modalCard: {
    width: '100%',
    backgroundColor: Colors.white,
    borderRadius: Radius.input,
    padding: Spacing.lg,
  },
  table: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.input,
    overflow: 'hidden',
    backgroundColor: Colors.white,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: '#F0F0F0',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
  },
  tableDataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
  },
  tableHeaderCell: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
    textTransform: 'uppercase',
  },
  tableCell: {
    fontSize: 13,
    color: Colors.textPrimary,
  },
  tableRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
});
