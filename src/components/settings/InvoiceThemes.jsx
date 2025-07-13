import React from 'react';
import { 
  TextileBillingTheme, 
  PharmaBillingTheme, 
  ElectronicsBillingTheme, 
  RetailPOSTheme, 
  WholesaleBillingTheme, 
  CustomBrandingTheme 
} from '../invoices/ProductBasedThemes';

// Sample data for previews
const sampleInvoiceData = {
  invoice_number: 'INV-001',
  invoice_date: new Date().toISOString(),
  due_date: new Date(Date.now() + 30*24*60*60*1000).toISOString(),
  items: [
    {
      product_name: 'Sample Product',
      quantity: 2,
      rate: 500,
      gst_rate: 18,
      total: 1000,
      category: 'general'
    }
  ],
  subtotal: 1000,
  gst_amount: 180,
  total_amount: 1180,
  paid_amount: 1180,
  balance_amount: 0
};

const sampleCompanyData = {
  name: 'Sample Company',
  address: 'Sample Address',
  phone: '9876543210',
  email: 'info@company.com',
  gst_number: '27ABCDE1234F1Z5'
};

const sampleCustomerData = {
  name: 'Sample Customer',
  address: 'Customer Address',
  phone: '9876543210',
  gst_number: '27FGHIJ5678K1L0'
};

// Theme preview components for Regular Printer
export const RegularThemePreview = ({ themeId, isSelected, onClick }) => {
  const themes = {
    textile: {
      name: 'Textile',
      color: 'purple',
      preview: (
        <div
          onClick={onClick}
          className={`w-24 h-32 border-2 rounded cursor-pointer transition-all ${
            isSelected ? 'border-purple-600 bg-purple-50' : 'border-gray-300 bg-white hover:border-purple-400'
          }`}
        >
          <div className="p-1 h-full flex flex-col text-xs bg-white">
            <div className="bg-purple-600 text-white text-center py-1 mb-1 text-xs font-bold">
              COMPANY
            </div>
            <div className="text-xs text-center mb-1">Textile Invoice</div>
            <div className="flex-1 border border-purple-200 p-1">
              <div className="text-xs grid grid-cols-3 gap-1 mb-1 bg-purple-100 p-1">
                <div>Item</div>
                <div>Color</div>
                <div>Size</div>
              </div>
              <div className="text-xs grid grid-cols-3 gap-1">
                <div>Saree</div>
                <div>Red</div>
                <div>M</div>
              </div>
            </div>
            <div className="bg-purple-100 text-xs p-1 text-center font-semibold">
              Total: ₹1000
            </div>
          </div>
          <div className="text-center mt-1">
            <span className={`text-xs ${isSelected ? 'text-purple-700 font-semibold' : 'text-gray-600'}`}>
              Textile
            </span>
          </div>
        </div>
      )
    },
    pharma: {
      name: 'Pharma',
      color: 'green',
      preview: (
        <div
          onClick={onClick}
          className={`w-24 h-32 border-2 rounded cursor-pointer transition-all ${
            isSelected ? 'border-green-600 bg-green-50' : 'border-gray-300 bg-white hover:border-green-400'
          }`}
        >
          <div className="p-1 h-full flex flex-col text-xs bg-white">
            <div className="bg-green-600 text-white text-center py-1 mb-1 text-xs font-bold">
              MEDICAL STORE
            </div>
            <div className="text-xs text-center mb-1">Medical Bill</div>
            <div className="flex-1 border border-green-200 p-1">
              <div className="text-xs grid grid-cols-3 gap-1 mb-1 bg-green-100 p-1">
                <div>Medicine</div>
                <div>Batch</div>
                <div>Exp</div>
              </div>
              <div className="text-xs grid grid-cols-3 gap-1">
                <div>Tablet</div>
                <div>B123</div>
                <div>12/25</div>
              </div>
            </div>
            <div className="bg-green-100 text-xs p-1 text-center font-semibold">
              Total: ₹150
            </div>
          </div>
          <div className="text-center mt-1">
            <span className={`text-xs ${isSelected ? 'text-green-700 font-semibold' : 'text-gray-600'}`}>
              Pharma
            </span>
          </div>
        </div>
      )
    },
    electronics: {
      name: 'Electronics',
      color: 'blue',
      preview: (
        <div
          onClick={onClick}
          className={`w-24 h-32 border-2 rounded cursor-pointer transition-all ${
            isSelected ? 'border-blue-600 bg-blue-50' : 'border-gray-300 bg-white hover:border-blue-400'
          }`}
        >
          <div className="p-1 h-full flex flex-col text-xs bg-white">
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white text-center py-1 mb-1 text-xs font-bold">
              ELECTRONICS
            </div>
            <div className="text-xs text-center mb-1">Tech Invoice</div>
            <div className="flex-1 border border-blue-200 p-1">
              <div className="text-xs grid grid-cols-3 gap-1 mb-1 bg-blue-100 p-1">
                <div>Item</div>
                <div>Brand</div>
                <div>Qty</div>
              </div>
              <div className="text-xs grid grid-cols-3 gap-1">
                <div>Phone</div>
                <div>Apple</div>
                <div>1</div>
              </div>
            </div>
            <div className="bg-blue-100 text-xs p-1 text-center font-semibold">
              Total: ₹50,000
            </div>
          </div>
          <div className="text-center mt-1">
            <span className={`text-xs ${isSelected ? 'text-blue-700 font-semibold' : 'text-gray-600'}`}>
              Electronics
            </span>
          </div>
        </div>
      )
    },
    retail: {
      name: 'Retail POS',
      color: 'gray',
      preview: (
        <div
          onClick={onClick}
          className={`w-24 h-32 border-2 rounded cursor-pointer transition-all ${
            isSelected ? 'border-gray-600 bg-gray-50' : 'border-gray-300 bg-white hover:border-gray-400'
          }`}
        >
          <div className="p-1 h-full flex flex-col text-xs bg-white font-mono">
            <div className="text-center border-b pb-1 mb-1">
              <div className="font-bold text-xs">RETAIL STORE</div>
            </div>
            <div className="text-xs text-center mb-1">Receipt</div>
            <div className="flex-1 text-xs">
              <div className="mb-1">Item 1: ₹100</div>
              <div className="mb-1">Item 2: ₹200</div>
              <div className="border-t pt-1">Total: ₹300</div>
            </div>
            <div className="text-center text-xs">
              Thank You!
            </div>
          </div>
          <div className="text-center mt-1">
            <span className={`text-xs ${isSelected ? 'text-gray-700 font-semibold' : 'text-gray-600'}`}>
              Retail POS
            </span>
          </div>
        </div>
      )
    },
    wholesale: {
      name: 'Wholesale B2B',
      color: 'indigo',
      preview: (
        <div
          onClick={onClick}
          className={`w-24 h-32 border-2 rounded cursor-pointer transition-all ${
            isSelected ? 'border-indigo-600 bg-indigo-50' : 'border-gray-300 bg-white hover:border-indigo-400'
          }`}
        >
          <div className="p-1 h-full flex flex-col text-xs bg-white">
            <div className="border-b-2 border-indigo-600 pb-1 mb-1">
              <div className="font-bold text-xs">WHOLESALE CO.</div>
            </div>
            <div className="bg-indigo-100 text-xs p-1 mb-1 text-center">TAX INVOICE</div>
            <div className="flex-1 border border-indigo-200 p-1">
              <div className="text-xs grid grid-cols-2 gap-1 mb-1 bg-indigo-100 p-1">
                <div>HSN</div>
                <div>CGST</div>
              </div>
              <div className="text-xs grid grid-cols-2 gap-1">
                <div>1234</div>
                <div>9%</div>
              </div>
            </div>
            <div className="bg-indigo-100 text-xs p-1 text-center font-semibold">
              Total: ₹10,000
            </div>
          </div>
          <div className="text-center mt-1">
            <span className={`text-xs ${isSelected ? 'text-indigo-700 font-semibold' : 'text-gray-600'}`}>
              Wholesale
            </span>
          </div>
        </div>
      )
    },
    custom: {
      name: 'Custom Brand',
      color: 'orange',
      preview: (
        <div
          onClick={onClick}
          className={`w-24 h-32 border-2 rounded cursor-pointer transition-all ${
            isSelected ? 'border-orange-600 bg-orange-50' : 'border-gray-300 bg-white hover:border-orange-400'
          }`}
        >
          <div className="p-1 h-full flex flex-col text-xs bg-white relative">
            <div className="absolute inset-0 flex items-center justify-center opacity-10">
              <div className="text-lg font-bold transform rotate-45">BRAND</div>
            </div>
            <div className="relative z-10">
              <div className="bg-orange-600 text-white text-center py-1 mb-1 text-xs font-bold">
                YOUR BRAND
              </div>
              <div className="text-xs text-center mb-1">Custom Invoice</div>
              <div className="flex-1 border border-orange-200 p-1">
                <div className="text-xs space-y-1">
                  <div>Premium Service</div>
                  <div className="text-right">₹5000</div>
                </div>
              </div>
              <div className="bg-orange-100 text-xs p-1 text-center font-semibold">
                Total: ₹5000
              </div>
            </div>
          </div>
          <div className="text-center mt-1">
            <span className={`text-xs ${isSelected ? 'text-orange-700 font-semibold' : 'text-gray-600'}`}>
              Custom
            </span>
          </div>
        </div>
      )
    }
  };

  const theme = themes[themeId];
  return theme ? theme.preview : null;
};

// Theme preview components for Thermal Printer
export const ThermalThemePreview = ({ themeId, isSelected, onClick }) => {
  const thermalThemes = {
    theme1: {
      name: 'Standard',
      preview: (
        <div
          onClick={onClick}
          className={`w-20 h-28 border-2 rounded cursor-pointer transition-all ${
            isSelected ? 'border-blue-600 bg-blue-50' : 'border-gray-300 bg-white hover:border-blue-400'
          }`}
        >
          <div className="p-1 h-full flex flex-col text-xs bg-white font-mono">
            <div className="text-center border-b border-dashed pb-1 mb-1">
              <div className="font-bold text-xs">STORE</div>
            </div>
            <div className="text-xs text-center mb-1">Receipt</div>
            <div className="flex-1 text-xs">
              <div className="flex justify-between">
                <span>Item</span>
                <span>₹100</span>
              </div>
            </div>
            <div className="border-t border-dashed pt-1 text-xs text-center">
              Total: ₹100
            </div>
          </div>
          <div className="text-center mt-1">
            <span className={`text-xs ${isSelected ? 'text-blue-700 font-semibold' : 'text-gray-600'}`}>
              Standard
            </span>
          </div>
        </div>
      )
    },
    theme2: {
      name: 'Compact',
      preview: (
        <div
          onClick={onClick}
          className={`w-20 h-28 border-2 rounded cursor-pointer transition-all ${
            isSelected ? 'border-green-600 bg-green-50' : 'border-gray-300 bg-white hover:border-green-400'
          }`}
        >
          <div className="p-1 h-full flex flex-col text-xs bg-white font-mono">
            <div className="text-center mb-1">
              <div className="font-bold text-xs">SHOP</div>
            </div>
            <div className="flex-1 text-xs space-y-1">
              <div>Item: ₹100</div>
              <div>Tax: ₹18</div>
            </div>
            <div className="text-xs text-center font-bold">
              ₹118
            </div>
          </div>
          <div className="text-center mt-1">
            <span className={`text-xs ${isSelected ? 'text-green-700 font-semibold' : 'text-gray-600'}`}>
              Compact
            </span>
          </div>
        </div>
      )
    }
  };

  const theme = thermalThemes[themeId];
  return theme ? theme.preview : null;
};

// Invoice Preview Component
export const InvoicePreview = ({ theme, type, invoiceData, companyData, customerData }) => {
  const data = invoiceData || sampleInvoiceData;
  const company = companyData || sampleCompanyData;
  const customer = customerData || sampleCustomerData;

  if (type === 'thermal') {
    return (
      <div className="w-full h-96 overflow-auto border border-gray-300 rounded bg-gray-50">
        <div className="scale-75 origin-top-left">
          <RetailPOSTheme invoiceData={data} companyData={company} customerData={customer} />
        </div>
      </div>
    );
  }

  // For regular printer themes, show the appropriate theme
  const themeComponents = {
    textile: TextileBillingTheme,
    pharma: PharmaBillingTheme,
    electronics: ElectronicsBillingTheme,
    retail: RetailPOSTheme,
    wholesale: WholesaleBillingTheme,
    custom: CustomBrandingTheme
  };

  const ThemeComponent = themeComponents[theme] || themeComponents.retail;

  return (
    <div className="w-full h-96 overflow-auto border border-gray-300 rounded bg-gray-50">
      <div className="scale-50 origin-top-left">
        <ThemeComponent invoiceData={data} companyData={company} customerData={customer} />
      </div>
    </div>
  );
};

export default {
  RegularThemePreview,
  ThermalThemePreview,
  InvoicePreview
};