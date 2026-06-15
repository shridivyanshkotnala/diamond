import { useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { CheckCircle2, Printer } from 'lucide-react-native';

import { InvoiceReceipt } from '@/components/scanner/InvoiceReceipt';
import { PrimaryGreenButton } from '@/components/scanner/PrimaryGreenButton';
import { ScanScreenWrapper } from '@/components/scanner/ScanScreenWrapper';
import { MOCK_INVOICE_ITEMS } from '@/constants/scannerData';

type PrintState = 'preparing' | 'printing' | 'success';

export default function PrintInvoiceScreen() {
  const router = useRouter();
  const [printState, setPrintState] = useState<PrintState>('preparing');

  useEffect(() => {
    if (printState === 'preparing') {
      const t = setTimeout(() => setPrintState('printing'), 1200);
      return () => clearTimeout(t);
    }
    if (printState === 'printing') {
      const t = setTimeout(() => setPrintState('success'), 2000);
      return () => clearTimeout(t);
    }
  }, [printState]);

  return (
    <ScanScreenWrapper
      title="Print Invoice"
      scanButtonVariant="green"
      footer={
        printState === 'success' ? (
          <PrimaryGreenButton title="Back to Home" onPress={() => router.push('/dashboard')} />
        ) : undefined
      }
    >
      {printState === 'preparing' || printState === 'printing' ? (
        <View className="mb-6 items-center rounded-2xl border border-border bg-white py-10">
          <ActivityIndicator size="large" color="#1A332E" />
          <View className="mt-4 flex-row items-center gap-2">
            <Printer size={20} color="#1A332E" />
            <Text className="text-base font-semibold text-text-primary">
              {printState === 'preparing' ? 'Preparing invoice...' : 'Sending to printer...'}
            </Text>
          </View>
          <Text className="mt-2 text-sm text-text-secondary">
            Please wait while the invoice is being processed
          </Text>
        </View>
      ) : (
        <View className="mb-6 items-center rounded-2xl bg-success-bg py-6">
          <CheckCircle2 size={48} color="#34A853" />
          <Text className="mt-3 text-lg font-bold text-success-text">Invoice Printed</Text>
          <Text className="mt-1 text-sm text-text-secondary">
            Invoice #PR-2024-002 sent to printer successfully
          </Text>
        </View>
      )}

      <InvoiceReceipt items={MOCK_INVOICE_ITEMS} />
    </ScanScreenWrapper>
  );
}
