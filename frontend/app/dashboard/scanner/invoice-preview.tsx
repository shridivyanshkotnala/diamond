import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { Printer } from 'lucide-react-native';

import { InvoiceReceipt } from '@/components/scanner/InvoiceReceipt';
import { PrimaryGreenButton } from '@/components/scanner/PrimaryGreenButton';
import { ScanScreenWrapper } from '@/components/scanner/ScanScreenWrapper';
import { MOCK_INVOICE_ITEMS } from '@/constants/scannerData';

export default function InvoicePreviewScreen() {
  const router = useRouter();

  return (
    <ScanScreenWrapper
      title="Invoice Preview"
      scanButtonVariant="green"
      footer={
        <PrimaryGreenButton
          title="Print Invoice"
          onPress={() => router.push('/dashboard/scanner/print-invoice')}
          icon={<Printer size={18} color="#FFFFFF" />}
        />
      }
    >
      <InvoiceReceipt items={MOCK_INVOICE_ITEMS} />
    </ScanScreenWrapper>
  );
}
