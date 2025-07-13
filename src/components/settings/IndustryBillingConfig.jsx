import React from 'react';

// Industry-specific configurations
export const INDUSTRY_CONFIGS = {
  'textile': {
    name: 'Textile & Apparel Store',
    itemColumns: [
      { key: 'item_name', label: 'Item Name', required: true },
      { key: 'design_no', label: 'Design No.', required: false },
      { key: 'size', label: 'Size', required: false },
      { key: 'color', label: 'Color', required: false },
      { key: 'quantity', label: 'Quantity', required: true },
      { key: 'rate', label: 'Rate', required: true },
      { key: 'hsn_code', label: 'HSN Code', required: false },
      { key: 'gst_rate', label: 'GST %', required: true }
    ],
    extraFields: [
      { key: 'transport_name', label: 'Transport Name', required: false },
      { key: 'lr_no', label: 'L.R. No', required: false }
    ],
    toggles: {
      showDiscount: true,
      showHSN: true,
      showItemCode: true,
      allowImageUpload: true,
      showDoctorName: false,
      showBarcode: true,
      showTransport: true,
      showSerialNumber: false
    },
    printFormat: 'A4 Standard GST Invoice',
    theme: 'textile',
    defaultGST: 5,
    invoicePrefix: 'TEX'
  },

  'pharmaceutical': {
    name: 'Pharmaceutical Retail',
    itemColumns: [
      { key: 'medicine_name', label: 'Medicine Name', required: true },
      { key: 'batch_no', label: 'Batch No.', required: true },
      { key: 'expiry_date', label: 'Expiry Date', required: true },
      { key: 'quantity', label: 'Qty', required: true },
      { key: 'rate', label: 'Rate', required: true },
      { key: 'gst_rate', label: 'GST %', required: true },
      { key: 'amount', label: 'Amount', required: true }
    ],
    extraFields: [
      { key: 'doctor_name', label: 'Doctor Name', required: true },
      { key: 'prescription_no', label: 'Prescription Number', required: true },
      { key: 'hsn_code', label: 'HSN Code', required: false }
    ],
    toggles: {
      showDiscount: false,
      showHSN: true,
      showItemCode: true,
      allowImageUpload: false,
      showDoctorName: true,
      showBarcode: true,
      showTransport: false,
      showSerialNumber: false
    },
    printFormat: 'A4 or 80mm Compact',
    theme: 'pharma',
    defaultGST: 12,
    invoicePrefix: 'MED'
  },

  'electronics': {
    name: 'Mobile & Electronics Retail',
    itemColumns: [
      { key: 'item_name', label: 'Item Name', required: true },
      { key: 'brand', label: 'Brand', required: false },
      { key: 'serial_no', label: 'IMEI / Serial Number', required: false },
      { key: 'warranty', label: 'Warranty', required: false },
      { key: 'quantity', label: 'Qty', required: true },
      { key: 'rate', label: 'Rate', required: true },
      { key: 'gst_rate', label: 'Tax %', required: true }
    ],
    extraFields: [
      { key: 'customer_pan', label: 'Customer PAN No.', required: false },
      { key: 'payment_mode', label: 'Payment Mode', required: false, 
        options: ['UPI', 'Cash', 'Finance', 'Card'] }
    ],
    toggles: {
      showDiscount: true,
      showHSN: true,
      showItemCode: true,
      allowImageUpload: true,
      showDoctorName: false,
      showBarcode: true,
      showTransport: false,
      showSerialNumber: true
    },
    printFormat: 'A4 or Compact with QR',
    theme: 'electronics',
    defaultGST: 18,
    invoicePrefix: 'ELEC'
  },

  'general': {
    name: 'General Retail',
    itemColumns: [
      { key: 'item_name', label: 'Item Name', required: true },
      { key: 'quantity', label: 'Quantity', required: true },
      { key: 'rate', label: 'Rate', required: true },
      { key: 'gst_rate', label: 'GST %', required: true },
      { key: 'amount', label: 'Amount', required: true }
    ],
    extraFields: [],
    toggles: {
      showDiscount: true,
      showHSN: true,
      showItemCode: true,
      allowImageUpload: false,
      showDoctorName: false,
      showBarcode: true,
      showTransport: false,
      showSerialNumber: false
    },
    printFormat: 'A4 Standard',
    theme: 'retail',
    defaultGST: 18,
    invoicePrefix: 'INV'
  }
};

// Helper function to get industry config
export const getIndustryConfig = (industryKey) => {
  return INDUSTRY_CONFIGS[industryKey] || INDUSTRY_CONFIGS['general'];
};

// Helper function to detect industry from product categories
export const detectIndustryFromProducts = (products = []) => {
  if (!products.length) return 'general';
  
  const categories = products.map(p => p.category?.toLowerCase() || '');
  const names = products.map(p => p.name?.toLowerCase() || '');
  
  // Check for textile indicators
  if (categories.some(cat => ['textile', 'clothing', 'apparel'].includes(cat)) ||
      names.some(name => ['saree', 'kurta', 'shirt', 'fabric'].some(keyword => name.includes(keyword)))) {
    return 'textile';
  }
  
  // Check for pharmaceutical indicators
  if (categories.some(cat => ['medicine', 'pharma', 'medical'].includes(cat)) ||
      names.some(name => ['tablet', 'syrup', 'medicine', 'capsule'].some(keyword => name.includes(keyword)))) {
    return 'pharmaceutical';
  }
  
  // Check for electronics indicators
  if (categories.some(cat => ['electronics', 'mobile', 'computer'].includes(cat)) ||
      names.some(name => ['phone', 'mobile', 'laptop', 'tv'].some(keyword => name.includes(keyword)))) {
    return 'electronics';
  }
  
  return 'general';
};

export default function IndustryBillingConfig() {
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Industry Billing Configurations</h2>
      <div className="grid gap-4">
        {Object.entries(INDUSTRY_CONFIGS).map(([key, config]) => (
          <div key={key} className="border rounded-lg p-4">
            <h3 className="font-semibold text-lg">{config.name}</h3>
            <p className="text-sm text-gray-600">
              {config.itemColumns.length} columns • {config.printFormat}
            </p>
            <div className="mt-2 flex flex-wrap gap-1">
              {Object.entries(config.toggles)
                .filter(([_, enabled]) => enabled)
                .map(([toggle, _]) => (
                  <span key={toggle} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    {toggle.replace(/([A-Z])/g, ' $1').toLowerCase()}
                  </span>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}