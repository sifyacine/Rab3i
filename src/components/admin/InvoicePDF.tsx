import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font } from '@react-pdf/renderer';

Font.register({
  family: 'Cairo',
  src: 'https://fonts.gstatic.com/s/cairo/v22/SXpc3gV1eZBF3Q-a2-Sh5_esM2r4FjT6OQ.ttf'
});

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Cairo',
    fontSize: 10,
    direction: 'rtl',
    textAlign: 'right'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30
  },
  logoSection: {
    flex: 1
  },
  logo: {
    width: 120,
    height: 40,
    objectFit: 'contain'
  },
  storeName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginTop: 8
  },
  storeInfo: {
    color: '#666',
    marginTop: 4,
    lineHeight: 1.5
  },
  invoiceInfo: {
    textAlign: 'left'
  },
  invoiceTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#e63946'
  },
  invoiceNumber: {
    color: '#666',
    marginTop: 4
  },
  statusBadge: {
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
    backgroundColor: '#e63946',
    color: 'white'
  },
  statusPaid: {
    backgroundColor: '#22c55e'
  },
  section: {
    marginBottom: 20
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 4
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  label: {
    color: '#666'
  },
  value: {
    color: '#1a1a1a',
    fontWeight: 'medium'
  },
  table: {
    marginTop: 20,
    marginBottom: 20
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    padding: 10,
    borderTopWidth: 2,
    borderTopColor: '#e63946'
  },
  tableHeaderCell: {
    fontWeight: 'bold',
    color: '#1a1a1a',
    fontSize: 9
  },
  tableRow: {
    flexDirection: 'row',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  tableCell: {
    color: '#333'
  },
  descriptionCol: { flex: 3, textAlign: 'right' },
  qtyCol: { flex: 1, textAlign: 'center' },
  priceCol: { flex: 1, textAlign: 'left' },
  totalCol: { flex: 1, textAlign: 'left' },

  totalsSection: {
    marginTop: 20,
    alignItems: 'flex-end'
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 200,
    paddingVertical: 6
  },
  totalLabel: {
    color: '#666'
  },
  totalValue: {
    color: '#1a1a1a',
    fontWeight: 'medium'
  },
  grandTotal: {
    borderTopWidth: 2,
    borderTopColor: '#e63946',
    paddingTop: 8,
    marginTop: 4,
    fontSize: 14,
    fontWeight: 'bold'
  },
  vatSection: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
    marginTop: 20
  },
  vatRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6
  },
  bankSection: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 8
  },
  bankTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1a1a1a'
  },
  footer: {
    marginTop: 40,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    textAlign: 'center',
    color: '#999',
    fontSize: 9
  }
});

interface InvoiceItem {
  description: string;
  quantity: number;
  price: number;
}

interface InvoicePDFProps {
  invoice: {
    id: string;
    clientName: string;
    clientEmail?: string;
    clientPhone?: string;
    status: 'paid' | 'unpaid' | 'overdue' | 'canceled';
    date: string;
    dueDate: string;
    items: InvoiceItem[];
  };
  businessInfo: {
    storeName: string;
    storeAddress?: string;
    storePhone?: string;
    vatNumber?: string;
    taxNumber?: string;
    crNumber?: string;
    bankName?: string;
    bankIban?: string;
    bankAccountName?: string;
  };
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('ar-SA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const formatCurrency = (amount: number) => {
  return amount.toLocaleString('ar-SA') + ' ⃁';
};

const InvoicePDF: React.FC<InvoicePDFProps> = ({ invoice, businessInfo }) => {
  const subtotal = invoice.items.reduce((acc, item) => acc + (item.quantity * item.price), 0);
  const vatRate = 0.15;
  const vatAmount = subtotal * vatRate;
  const total = subtotal + vatAmount;

  const statusLabels: Record<string, string> = {
    paid: 'مدفوعة',
    unpaid: 'غير مدفوعة',
    overdue: 'متأخرة',
    canceled: 'ملغاة'
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>

        <View style={styles.header}>
          <View style={styles.logoSection}>
            <Text style={styles.storeName}>{businessInfo.storeName || 'شركة ربيعي'}</Text>
            {businessInfo.storeAddress && (
              <Text style={styles.storeInfo}>{businessInfo.storeAddress}</Text>
            )}
            {businessInfo.storePhone && (
              <Text style={styles.storeInfo}>{businessInfo.storePhone}</Text>
            )}
            {businessInfo.vatNumber && (
              <Text style={styles.storeInfo}>الرقم الضريبي: {businessInfo.vatNumber}</Text>
            )}
            {businessInfo.crNumber && (
              <Text style={styles.storeInfo}>س.ت: {businessInfo.crNumber}</Text>
            )}
          </View>
          <View style={styles.invoiceInfo}>
            <Text style={styles.invoiceTitle}>فاتورة ضريبية</Text>
            <Text style={styles.invoiceNumber}>رقم الفاتورة: {invoice.id}</Text>
            <View style={[
              styles.statusBadge,
              invoice.status === 'paid' && styles.statusPaid
            ]}>
              <Text style={{ color: 'white', fontSize: 9 }}>{statusLabels[invoice.status]}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>معلومات العميل</Text>
          <View style={styles.row}>
            <View>
              <Text style={styles.label}>العميل:</Text>
              <Text style={styles.value}>{invoice.clientName}</Text>
            </View>
            <View>
              <Text style={styles.label}>التاريخ:</Text>
              <Text style={styles.value}>{formatDate(invoice.date)}</Text>
            </View>
            <View>
              <Text style={styles.label}>تاريخ الاستحقاق:</Text>
              <Text style={styles.value}>{formatDate(invoice.dueDate)}</Text>
            </View>
          </View>
          {invoice.clientEmail && (
            <Text style={{ marginTop: 8, color: '#666' }}>البريد الإلكتروني: {invoice.clientEmail}</Text>
          )}
          {invoice.clientPhone && (
            <Text style={{ marginTop: 4, color: '#666' }}>الهاتف: {invoice.clientPhone}</Text>
          )}
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, styles.descriptionCol]}>الوصف</Text>
            <Text style={[styles.tableHeaderCell, styles.qtyCol]}>الكمية</Text>
            <Text style={[styles.tableHeaderCell, styles.priceCol]}>السعر</Text>
            <Text style={[styles.tableHeaderCell, styles.totalCol]}>المجموع</Text>
          </View>
          {invoice.items.map((item, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.descriptionCol]}>{item.description}</Text>
              <Text style={[styles.tableCell, styles.qtyCol]}>{item.quantity}</Text>
              <Text style={[styles.tableCell, styles.priceCol]}>{formatCurrency(item.price)}</Text>
              <Text style={[styles.tableCell, styles.totalCol]}>{formatCurrency(item.quantity * item.price)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.totalsSection}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>المجموع الفرعي:</Text>
            <Text style={styles.totalValue}>{formatCurrency(subtotal)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>ضريبة القيمة المضافة (15%):</Text>
            <Text style={styles.totalValue}>{formatCurrency(vatAmount)}</Text>
          </View>
          <View style={[styles.totalRow, styles.grandTotal]}>
            <Text style={{ fontWeight: 'bold' }}>الإجمالي:</Text>
            <Text style={{ fontWeight: 'bold' }}>{formatCurrency(total)}</Text>
          </View>
        </View>

        <View style={styles.vatSection}>
          <Text style={{ fontWeight: 'bold', marginBottom: 10, color: '#1a1a1a' }}>تفاصيل الضريبة</Text>
          <View style={styles.vatRow}>
            <Text style={styles.label}>نسبة الضريبة:</Text>
            <Text style={styles.value}>15%</Text>
          </View>
          <View style={styles.vatRow}>
            <Text style={styles.label}>صافي الضريبة:</Text>
            <Text style={styles.value}>{formatCurrency(vatAmount)}</Text>
          </View>
          {businessInfo.taxNumber && (
            <View style={styles.vatRow}>
              <Text style={styles.label}>الرقم الضريبي:</Text>
              <Text style={styles.value}>{businessInfo.taxNumber}</Text>
            </View>
          )}
        </View>

        {businessInfo.bankName && (
          <View style={styles.bankSection}>
            <Text style={styles.bankTitle}>معلومات الحساب البنكي</Text>
            <View style={styles.vatRow}>
              <Text style={styles.label}>البنك:</Text>
              <Text style={styles.value}>{businessInfo.bankName}</Text>
            </View>
            <View style={styles.vatRow}>
              <Text style={styles.label}>اسم الحساب:</Text>
              <Text style={styles.value}>{businessInfo.bankAccountName || '-'}</Text>
            </View>
            <View style={styles.vatRow}>
              <Text style={styles.label}>IBAN:</Text>
              <Text style={styles.value}>{businessInfo.bankIban || '-'}</Text>
            </View>
          </View>
        )}

        <View style={styles.footer}>
          <Text>شكراً لتعاملكم معانا</Text>
          <Text style={{ marginTop: 4 }}>هذا مستند أصلي تم إنشاؤه إلكترونياً</Text>
        </View>
      </Page>
    </Document>
  );
};

export default InvoicePDF;