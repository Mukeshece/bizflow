import React from 'react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';

// Utility function to determine theme based on products
export const getThemeByProducts = (items = []) => {
  if (!items || items.length === 0) return 'retail';
  
  const categories = items.map(item => item.category?.toLowerCase() || '');
  const productNames = items.map(item => item.product_name?.toLowerCase() || '');
  
  // Textile detection
  if (categories.some(cat => ['textile', 'clothing', 'fabric', 'saree', 'kurta'].includes(cat)) ||
      productNames.some(name => ['saree', 'kurta', 'fabric', 'cotton', 'silk'].some(keyword => name.includes(keyword)))) {
    return 'textile';
  }
  
  // Pharma detection
  if (categories.some(cat => ['medicine', 'pharma', 'medical', 'healthcare'].includes(cat)) ||
      productNames.some(name => ['tablet', 'syrup', 'medicine', 'capsule'].some(keyword => name.includes(keyword)))) {
    return 'pharma';
  }
  
  // Electronics detection
  if (categories.some(cat => ['electronics', 'mobile', 'computer', 'appliance'].includes(cat)) ||
      productNames.some(name => ['phone', 'laptop', 'tv', 'mobile', 'electronics'].some(keyword => name.includes(keyword)))) {
    return 'electronics';
  }
  
  // Wholesale detection (based on large quantities)
  if (items.some(item => item.quantity > 50)) {
    return 'wholesale';
  }
  
  return 'retail';
};

// Textile Billing Theme
export const TextileBillingTheme = ({ invoiceData, companyData, customerData }) => {
  const {
    invoice_number, invoice_date, due_date, items = [], subtotal = 0,
    discount_amount = 0, gst_amount = 0, total_amount = 0, paid_amount = 0,
    balance_amount = 0, round_off = 0, notes
  } = invoiceData;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg">
      {/* Header */}
      <div className="border-b-4 border-purple-600 pb-4 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-purple-800">{companyData.name}</h1>
            <p className="text-sm text-gray-600">{companyData.address}</p>
            <p className="text-sm text-gray-600">Ph: {companyData.phone} | Email: {companyData.email}</p>
            <p className="text-sm text-gray-600">GSTIN: {companyData.gst_number}</p>
          </div>
          <div className="text-right">
            <div className="bg-purple-100 px-4 py-2 rounded-lg">
              <h2 className="text-2xl font-bold text-purple-800">INVOICE</h2>
              <p className="text-lg"># {invoice_number}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Customer & Invoice Details */}
      <div className="grid grid-cols-2 gap-8 mb-6">
        <div>
          <h3 className="font-semibold text-purple-700 mb-2">Bill To:</h3>
          <p className="font-medium">{customerData.name}</p>
          <p className="text-sm text-gray-600">{customerData.address}</p>
          <p className="text-sm text-gray-600">Ph: {customerData.phone}</p>
          <p className="text-sm text-gray-600">GSTIN: {customerData.gst_number}</p>
        </div>
        <div className="text-right">
          <p><strong>Invoice Date:</strong> {format(new Date(invoice_date), 'dd-MM-yyyy')}</p>
          <p><strong>Due Date:</strong> {format(new Date(due_date), 'dd-MM-yyyy')}</p>
        </div>
      </div>

      {/* Items Table - Textile Specific */}
      <div className="mb-6">
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-purple-100">
              <th className="border p-2 text-left">S.No</th>
              <th className="border p-2 text-left">Item Name</th>
              <th className="border p-2 text-left">Design No.</th>
              <th className="border p-2 text-left">Color</th>
              <th className="border p-2 text-left">Size</th>
              <th className="border p-2 text-right">Qty</th>
              <th className="border p-2 text-right">Rate</th>
              <th className="border p-2 text-right">GST %</th>
              <th className="border p-2 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="border p-2">{index + 1}</td>
                <td className="border p-2">
                  <div className="font-medium">{item.product_name}</div>
                  <Badge variant="outline" className="text-xs mt-1">
                    {item.category || 'Textile'}
                  </Badge>
                </td>
                <td className="border p-2">{item.design_no || item.item_code}</td>
                <td className="border p-2">{item.color || '-'}</td>
                <td className="border p-2">{item.size || '-'}</td>
                <td className="border p-2 text-right">{item.quantity}</td>
                <td className="border p-2 text-right">₹{item.rate?.toFixed(2)}</td>
                <td className="border p-2 text-right">{item.gst_rate}%</td>
                <td className="border p-2 text-right">₹{item.total?.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* GST Summary */}
      <div className="grid grid-cols-2 gap-8 mb-6">
        <div className="bg-purple-50 p-4 rounded">
          <h4 className="font-semibold mb-2">GST Breakdown:</h4>
          <div className="text-sm space-y-1">
            <div className="flex justify-between">
              <span>CGST (9%):</span>
              <span>₹{(gst_amount / 2).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>SGST (9%):</span>
              <span>₹{(gst_amount / 2).toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-semibold border-t pt-1">
              <span>Total GST:</span>
              <span>₹{gst_amount?.toFixed(2)}</span>
            </div>
          </div>
        </div>
        
        <div className="text-right">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>₹{subtotal?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Discount:</span>
              <span>-₹{discount_amount?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>GST:</span>
              <span>₹{gst_amount?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Round Off:</span>
              <span>₹{round_off?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold border-t-2 border-purple-600 pt-2">
              <span>Total:</span>
              <span>₹{total_amount?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-green-600">
              <span>Paid:</span>
              <span>₹{paid_amount?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-red-600">
              <span>Balance:</span>
              <span>₹{balance_amount?.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t pt-4">
        <div className="grid grid-cols-2 gap-8">
          <div>
            {notes && (
              <div>
                <h4 className="font-semibold mb-2">Notes:</h4>
                <p className="text-sm text-gray-600">{notes}</p>
              </div>
            )}
          </div>
          <div className="text-right">
            <div className="mt-8">
              <p className="font-semibold">Authorized Signatory</p>
              <div className="border-t border-gray-400 mt-8 pt-2">
                <p className="text-sm">{companyData.name}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Pharma Billing Theme
export const PharmaBillingTheme = ({ invoiceData, companyData, customerData }) => {
  const {
    invoice_number, invoice_date, due_date, items = [], subtotal = 0,
    discount_amount = 0, gst_amount = 0, total_amount = 0, paid_amount = 0,
    balance_amount = 0, notes
  } = invoiceData;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg">
      {/* Header */}
      <div className="border-b-4 border-green-600 pb-4 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-green-800">{companyData.name}</h1>
            <p className="text-sm text-gray-600">{companyData.address}</p>
            <p className="text-sm text-gray-600">Ph: {companyData.phone} | Email: {companyData.email}</p>
            <p className="text-sm text-gray-600">Drug License: DL-{companyData.license_no || 'XXXXXXX'}</p>
            <p className="text-sm text-gray-600">GSTIN: {companyData.gst_number}</p>
          </div>
          <div className="text-right">
            <div className="bg-green-100 px-4 py-2 rounded-lg">
              <h2 className="text-2xl font-bold text-green-800">MEDICAL BILL</h2>
              <p className="text-lg"># {invoice_number}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Customer & Doctor Details */}
      <div className="grid grid-cols-3 gap-6 mb-6">
        <div>
          <h3 className="font-semibold text-green-700 mb-2">Patient Details:</h3>
          <p className="font-medium">{customerData.name}</p>
          <p className="text-sm text-gray-600">{customerData.address}</p>
          <p className="text-sm text-gray-600">Ph: {customerData.phone}</p>
        </div>
        <div>
          <h3 className="font-semibold text-green-700 mb-2">Doctor Details:</h3>
          <p className="font-medium">Dr. {invoiceData.doctor_name || 'N/A'}</p>
          <p className="text-sm text-gray-600">Reg. No: {invoiceData.doctor_reg || 'N/A'}</p>
          <p className="text-sm text-gray-600">Prescription No: {invoiceData.prescription_no || 'N/A'}</p>
        </div>
        <div className="text-right">
          <p><strong>Bill Date:</strong> {format(new Date(invoice_date), 'dd-MM-yyyy')}</p>
          <p><strong>Time:</strong> {format(new Date(invoice_date), 'HH:mm')}</p>
        </div>
      </div>

      {/* Items Table - Pharma Specific */}
      <div className="mb-6">
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-green-100">
              <th className="border p-2 text-left">S.No</th>
              <th className="border p-2 text-left">Medicine Name</th>
              <th className="border p-2 text-left">Batch No.</th>
              <th className="border p-2 text-left">Expiry</th>
              <th className="border p-2 text-left">HSN</th>
              <th className="border p-2 text-right">Qty</th>
              <th className="border p-2 text-right">MRP</th>
              <th className="border p-2 text-right">GST %</th>
              <th className="border p-2 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="border p-2">{index + 1}</td>
                <td className="border p-2">
                  <div className="font-medium">{item.product_name}</div>
                  <div className="text-xs text-gray-500">{item.composition || 'Generic'}</div>
                </td>
                <td className="border p-2">{item.batch_no || 'B' + Math.random().toString(36).substr(2, 6).toUpperCase()}</td>
                <td className="border p-2">{item.expiry_date || '12/2025'}</td>
                <td className="border p-2">{item.hsn_code || '3004'}</td>
                <td className="border p-2 text-right">{item.quantity}</td>
                <td className="border p-2 text-right">₹{item.rate?.toFixed(2)}</td>
                <td className="border p-2 text-right">{item.gst_rate}%</td>
                <td className="border p-2 text-right">₹{item.total?.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals & Digital Signature */}
      <div className="grid grid-cols-2 gap-8 mb-6">
        <div className="bg-green-50 p-4 rounded">
          <h4 className="font-semibold mb-2">Tax Summary:</h4>
          <div className="text-sm space-y-1">
            <div className="flex justify-between">
              <span>Taxable Amount:</span>
              <span>₹{(subtotal - discount_amount).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>GST:</span>
              <span>₹{gst_amount?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-semibold border-t pt-1">
              <span>Total:</span>
              <span>₹{total_amount?.toFixed(2)}</span>
            </div>
          </div>
        </div>
        
        <div className="text-right">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>₹{subtotal?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Discount:</span>
              <span>-₹{discount_amount?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>GST:</span>
              <span>₹{gst_amount?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold border-t-2 border-green-600 pt-2">
              <span>Total:</span>
              <span>₹{total_amount?.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer with Digital Signature */}
      <div className="border-t pt-4">
        <div className="grid grid-cols-2 gap-8">
          <div>
            <div className="bg-yellow-50 p-3 rounded border-l-4 border-yellow-400">
              <h4 className="font-semibold text-yellow-800 mb-1">Important:</h4>
              <p className="text-xs text-yellow-700">Please check expiry date before use. Keep medicines away from children.</p>
            </div>
          </div>
          <div className="text-right">
            <div className="mt-4">
              <div className="border-2 border-green-200 bg-green-50 p-3 rounded">
                <p className="text-sm font-semibold">Digital Signature</p>
                <p className="text-xs text-gray-600 mt-1">Pharmacist: {companyData.pharmacist_name || 'Licensed Pharmacist'}</p>
                <div className="mt-2 text-xs">
                  <p>Digitally signed on {format(new Date(), 'dd-MM-yyyy HH:mm')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Electronics/FMCG Theme
export const ElectronicsBillingTheme = ({ invoiceData, companyData, customerData }) => {
  const {
    invoice_number, invoice_date, due_date, items = [], subtotal = 0,
    discount_amount = 0, gst_amount = 0, total_amount = 0, paid_amount = 0,
    balance_amount = 0, notes
  } = invoiceData;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 rounded-t-lg">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">{companyData.name}</h1>
            <p className="text-blue-100">{companyData.address}</p>
            <p className="text-blue-100">Ph: {companyData.phone} | Email: {companyData.email}</p>
            <p className="text-blue-100">GSTIN: {companyData.gst_number}</p>
          </div>
          <div className="text-right">
            <div className="bg-white text-blue-800 px-4 py-2 rounded">
              <h2 className="text-2xl font-bold">INVOICE</h2>
              <p className="text-lg"># {invoice_number}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Details */}
      <div className="bg-gray-50 p-4">
        <div className="grid grid-cols-2 gap-8">
          <div>
            <h3 className="font-semibold text-blue-700 mb-2">Bill To:</h3>
            <p className="font-medium">{customerData.name}</p>
            <p className="text-sm text-gray-600">{customerData.address}</p>
            <p className="text-sm text-gray-600">Ph: {customerData.phone}</p>
            <p className="text-sm text-gray-600">GSTIN: {customerData.gst_number}</p>
          </div>
          <div className="text-right">
            <p><strong>Invoice Date:</strong> {format(new Date(invoice_date), 'dd-MM-yyyy')}</p>
            <p><strong>Due Date:</strong> {format(new Date(due_date), 'dd-MM-yyyy')}</p>
          </div>
        </div>
      </div>

      {/* Items Table - Electronics Specific */}
      <div className="mb-6">
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-blue-100">
              <th className="border p-2 text-left">S.No</th>
              <th className="border p-2 text-left">Item</th>
              <th className="border p-2 text-left">Brand</th>
              <th className="border p-2 text-left">Model/Serial</th>
              <th className="border p-2 text-left">Warranty</th>
              <th className="border p-2 text-right">Qty</th>
              <th className="border p-2 text-right">Rate</th>
              <th className="border p-2 text-right">Disc</th>
              <th className="border p-2 text-right">GST</th>
              <th className="border p-2 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="border p-2">{index + 1}</td>
                <td className="border p-2">
                  <div className="font-medium">{item.product_name}</div>
                  <div className="text-xs text-gray-500">{item.description || 'Electronics Item'}</div>
                </td>
                <td className="border p-2">{item.brand || 'Generic'}</td>
                <td className="border p-2">{item.serial_no || item.item_code}</td>
                <td className="border p-2">{item.warranty || '1 Year'}</td>
                <td className="border p-2 text-right">{item.quantity}</td>
                <td className="border p-2 text-right">₹{item.rate?.toFixed(2)}</td>
                <td className="border p-2 text-right">{item.discount || 0}%</td>
                <td className="border p-2 text-right">{item.gst_rate}%</td>
                <td className="border p-2 text-right">₹{item.total?.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Payment & Bank Details */}
      <div className="grid grid-cols-2 gap-8 mb-6">
        <div className="bg-blue-50 p-4 rounded">
          <h4 className="font-semibold mb-2">Bank Details:</h4>
          <div className="text-sm space-y-1">
            <p><strong>Bank:</strong> {companyData.bank_name || 'HDFC Bank'}</p>
            <p><strong>A/c No:</strong> {companyData.bank_account_number || 'XXXX-XXXX-XXXX'}</p>
            <p><strong>IFSC:</strong> {companyData.bank_ifsc || 'HDFC0000XXX'}</p>
          </div>
          <div className="mt-3 bg-white p-2 border border-gray-200 text-center">
            <p className="text-xs">UPI QR Code</p>
            <div className="w-16 h-16 bg-gray-200 mx-auto mt-1 rounded"></div>
            <p className="text-xs mt-1">{companyData.upi_id || 'payment@upi'}</p>
          </div>
        </div>
        
        <div className="text-right">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>₹{subtotal?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Discount:</span>
              <span>-₹{discount_amount?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>GST:</span>
              <span>₹{gst_amount?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold border-t-2 border-blue-600 pt-2">
              <span>Total:</span>
              <span>₹{total_amount?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-green-600">
              <span>Paid:</span>
              <span>₹{paid_amount?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-red-600">
              <span>Balance:</span>
              <span>₹{balance_amount?.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-100 p-4 rounded">
        <div className="grid grid-cols-2 gap-8">
          <div>
            <h4 className="font-semibold mb-2">Terms & Conditions:</h4>
            <div className="text-xs text-gray-600 space-y-1">
              <p>• Goods once sold will not be taken back</p>
              <p>• Warranty as per manufacturer terms</p>
              <p>• Subject to local jurisdiction</p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-semibold">For {companyData.name}</p>
            <div className="mt-8 border-t border-gray-400 pt-2">
              <p className="text-sm">Authorized Signatory</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Retail POS Theme (Thermal Receipt Style)
export const RetailPOSTheme = ({ invoiceData, companyData, customerData }) => {
  const {
    invoice_number, invoice_date, items = [], subtotal = 0,
    discount_amount = 0, gst_amount = 0, total_amount = 0, paid_amount = 0,
    balance_amount = 0, round_off = 0
  } = invoiceData;

  return (
    <div className="max-w-sm mx-auto p-4 bg-white font-mono text-sm border">
      {/* Header */}
      <div className="text-center mb-4">
        <h1 className="text-lg font-bold">{companyData.name}</h1>
        <p className="text-xs">{companyData.address}</p>
        <p className="text-xs">Ph: {companyData.phone}</p>
        <p className="text-xs">GSTIN: {companyData.gst_number}</p>
      </div>

      <div className="border-t border-b border-dashed py-2 my-2 text-center">
        <p className="font-bold">RETAIL RECEIPT</p>
      </div>

      {/* Invoice Details */}
      <div className="mb-2 text-xs">
        <div className="flex justify-between">
          <span>Receipt No:</span>
          <span>{invoice_number}</span>
        </div>
        <div className="flex justify-between">
          <span>Date:</span>
          <span>{format(new Date(invoice_date), 'dd-MM-yyyy HH:mm')}</span>
        </div>
        <div className="flex justify-between">
          <span>Customer:</span>
          <span>{customerData.name}</span>
        </div>
      </div>

      <div className="border-t border-dashed mb-2"></div>

      {/* Items */}
      <div className="mb-2">
        {items.map((item, index) => (
          <div key={index} className="mb-2 text-xs">
            <div className="flex justify-between">
              <span className="truncate flex-1 mr-2">{item.product_name}</span>
              <span>₹{item.total?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>{item.quantity} x ₹{item.rate?.toFixed(2)}</span>
              <span>GST {item.gst_rate}%</span>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-dashed mb-2"></div>

      {/* Totals */}
      <div className="text-xs space-y-1">
        <div className="flex justify-between">
          <span>Subtotal:</span>
          <span>₹{subtotal?.toFixed(2)}</span>
        </div>
        {discount_amount > 0 && (
          <div className="flex justify-between">
            <span>Discount:</span>
            <span>-₹{discount_amount?.toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span>GST:</span>
          <span>₹{gst_amount?.toFixed(2)}</span>
        </div>
        {round_off !== 0 && (
          <div className="flex justify-between">
            <span>Round Off:</span>
            <span>₹{round_off?.toFixed(2)}</span>
          </div>
        )}
        <div className="border-t border-dashed pt-1 font-bold">
          <div className="flex justify-between">
            <span>TOTAL:</span>
            <span>₹{total_amount?.toFixed(2)}</span>
          </div>
        </div>
        <div className="flex justify-between">
          <span>Paid:</span>
          <span>₹{paid_amount?.toFixed(2)}</span>
        </div>
        {balance_amount > 0 && (
          <div className="flex justify-between">
            <span>Balance:</span>
            <span>₹{balance_amount?.toFixed(2)}</span>
          </div>
        )}
      </div>

      <div className="border-t border-dashed mt-2 pt-2 text-center">
        <div className="w-24 h-6 bg-gray-200 mx-auto mb-2 rounded"></div>
        <p className="text-xs">Barcode: {invoice_number}</p>
        <p className="text-xs mt-2">Thank You! Visit Again</p>
        <p className="text-xs">Follow us @{companyData.social_handle || 'ourstore'}</p>
      </div>
    </div>
  );
};

// Wholesale B2B Theme
export const WholesaleBillingTheme = ({ invoiceData, companyData, customerData }) => {
  const {
    invoice_number, invoice_date, due_date, items = [], subtotal = 0,
    discount_amount = 0, gst_amount = 0, total_amount = 0, paid_amount = 0,
    balance_amount = 0, transport_name, lr_no, notes
  } = invoiceData;

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white shadow-lg">
      {/* Header */}
      <div className="border-b-2 border-gray-800 pb-4 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">{companyData.name}</h1>
            <p className="text-sm text-gray-600">{companyData.address}</p>
            <p className="text-sm text-gray-600">Ph: {companyData.phone} | Email: {companyData.email}</p>
            <p className="text-sm text-gray-600">GSTIN: {companyData.gst_number}</p>
          </div>
          <div className="text-right">
            <div className="border-2 border-gray-800 px-4 py-2">
              <h2 className="text-2xl font-bold">TAX INVOICE</h2>
              <p className="text-lg"># {invoice_number}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Billing & Shipping Details */}
      <div className="grid grid-cols-3 gap-6 mb-6">
        <div>
          <h3 className="font-semibold bg-gray-100 p-2 mb-2">Billing Address:</h3>
          <p className="font-medium">{customerData.name}</p>
          <p className="text-sm text-gray-600">{customerData.address}</p>
          <p className="text-sm text-gray-600">Ph: {customerData.phone}</p>
          <p className="text-sm text-gray-600">GSTIN: {customerData.gst_number}</p>
        </div>
        <div>
          <h3 className="font-semibold bg-gray-100 p-2 mb-2">Shipping Address:</h3>
          <p className="font-medium">{customerData.shipping_name || customerData.name}</p>
          <p className="text-sm text-gray-600">{customerData.shipping_address || customerData.address}</p>
          <p className="text-sm text-gray-600">Ph: {customerData.shipping_phone || customerData.phone}</p>
        </div>
        <div>
          <h3 className="font-semibold bg-gray-100 p-2 mb-2">Invoice Details:</h3>
          <p><strong>Date:</strong> {format(new Date(invoice_date), 'dd-MM-yyyy')}</p>
          <p><strong>Due Date:</strong> {format(new Date(due_date), 'dd-MM-yyyy')}</p>
          {transport_name && <p><strong>Transport:</strong> {transport_name}</p>}
          {lr_no && <p><strong>LR No:</strong> {lr_no}</p>}
        </div>
      </div>

      {/* Items Table - Wholesale Specific */}
      <div className="mb-6">
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2 text-left">S.No</th>
              <th className="border p-2 text-left">Item Description</th>
              <th className="border p-2 text-left">HSN Code</th>
              <th className="border p-2 text-right">Qty</th>
              <th className="border p-2 text-right">Rate</th>
              <th className="border p-2 text-right">Disc %</th>
              <th className="border p-2 text-right">Taxable Amt</th>
              <th className="border p-2 text-right">CGST %</th>
              <th className="border p-2 text-right">CGST Amt</th>
              <th className="border p-2 text-right">SGST %</th>
              <th className="border p-2 text-right">SGST Amt</th>
              <th className="border p-2 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => {
              const discountedRate = item.rate * (1 - (item.discount || 0) / 100);
              const taxableAmount = item.quantity * discountedRate;
              const cgstAmount = taxableAmount * (item.gst_rate / 2) / 100;
              const sgstAmount = taxableAmount * (item.gst_rate / 2) / 100;
              
              return (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="border p-2">{index + 1}</td>
                  <td className="border p-2">
                    <div className="font-medium">{item.product_name}</div>
                    <div className="text-xs text-gray-500">{item.description}</div>
                  </td>
                  <td className="border p-2">{item.hsn_code || '1234'}</td>
                  <td className="border p-2 text-right">{item.quantity}</td>
                  <td className="border p-2 text-right">₹{item.rate?.toFixed(2)}</td>
                  <td className="border p-2 text-right">{item.discount || 0}%</td>
                  <td className="border p-2 text-right">₹{taxableAmount.toFixed(2)}</td>
                  <td className="border p-2 text-right">{(item.gst_rate / 2)}%</td>
                  <td className="border p-2 text-right">₹{cgstAmount.toFixed(2)}</td>
                  <td className="border p-2 text-right">{(item.gst_rate / 2)}%</td>
                  <td className="border p-2 text-right">₹{sgstAmount.toFixed(2)}</td>
                  <td className="border p-2 text-right">₹{item.total?.toFixed(2)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Tax Summary Table */}
      <div className="grid grid-cols-2 gap-8 mb-6">
        <div>
          <h4 className="font-semibold mb-2">Tax Summary:</h4>
          <table className="w-full border-collapse border border-gray-300 text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-1">HSN Code</th>
                <th className="border p-1">Taxable Amt</th>
                <th className="border p-1">CGST</th>
                <th className="border p-1">SGST</th>
                <th className="border p-1">Total Tax</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border p-1">Combined</td>
                <td className="border p-1">₹{(subtotal - discount_amount).toFixed(2)}</td>
                <td className="border p-1">₹{(gst_amount / 2).toFixed(2)}</td>
                <td className="border p-1">₹{(gst_amount / 2).toFixed(2)}</td>
                <td className="border p-1">₹{gst_amount?.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div className="text-right">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>₹{subtotal?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Trade Discount:</span>
              <span>-₹{discount_amount?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Taxable Amount:</span>
              <span>₹{(subtotal - discount_amount).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>CGST:</span>
              <span>₹{(gst_amount / 2).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>SGST:</span>
              <span>₹{(gst_amount / 2).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold border-t-2 border-gray-800 pt-2">
              <span>Total Amount:</span>
              <span>₹{total_amount?.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Amount in Words */}
      <div className="mb-6 bg-gray-50 p-3 rounded">
        <p className="font-semibold">Amount in Words: <span className="font-normal">
          {/* You can implement number to words conversion here */}
          {total_amount > 0 ? `Rupees ${Math.floor(total_amount)} and ${Math.round((total_amount % 1) * 100)} Paise Only` : 'Zero Rupees Only'}
        </span></p>
      </div>

      {/* Terms & Signature */}
      <div className="grid grid-cols-2 gap-8">
        <div>
          <h4 className="font-semibold mb-2">Terms & Conditions:</h4>
          <div className="text-sm text-gray-600 space-y-1">
            <p>1. Payment due within {customerData.payment_terms || 30} days</p>
            <p>2. Interest @ 18% p.a. on delayed payments</p>
            <p>3. Subject to local jurisdiction</p>
            <p>4. E-way bill required for transport</p>
          </div>
          {notes && (
            <div className="mt-4">
              <h4 className="font-semibold">Notes:</h4>
              <p className="text-sm text-gray-600">{notes}</p>
            </div>
          )}
        </div>
        <div className="text-right">
          <div className="mt-8">
            <p className="font-semibold">For {companyData.name}</p>
            <div className="border border-gray-300 h-20 w-40 ml-auto mt-4 flex items-center justify-center">
              <span className="text-gray-400 text-xs">Authorized Signature</span>
            </div>
            <p className="text-sm mt-2">Authorized Signatory</p>
          </div>
        </div>
      </div>

      {/* E-way Bill Notice */}
      <div className="mt-6 bg-yellow-50 border-l-4 border-yellow-400 p-3">
        <p className="text-sm text-yellow-800">
          <strong>Note:</strong> This is a computer generated invoice. E-way bill is required for goods transport above ₹50,000.
        </p>
      </div>
    </div>
  );
};

// Custom Branding Theme
export const CustomBrandingTheme = ({ invoiceData, companyData, customerData, brandColor = '#3B82F6' }) => {
  const {
    invoice_number, invoice_date, due_date, items = [], subtotal = 0,
    discount_amount = 0, gst_amount = 0, total_amount = 0, paid_amount = 0,
    balance_amount = 0, notes
  } = invoiceData;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg relative">
      {/* Watermark */}
      <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
        <div className="text-6xl font-bold text-gray-400 transform rotate-45">
          {companyData.name}
        </div>
      </div>

      {/* Header with Branding */}
      <div className="relative z-10">
        <div className="flex items-center mb-6" style={{ borderBottom: `4px solid ${brandColor}` }}>
          <div className="flex-1 pb-4">
            {companyData.logo_url && (
              <img src={companyData.logo_url} alt="Logo" className="h-16 mb-2" />
            )}
            <h1 className="text-3xl font-bold" style={{ color: brandColor }}>{companyData.name}</h1>
            <p className="text-gray-600">{companyData.tagline || 'Your Trusted Business Partner'}</p>
            <div className="mt-2 text-sm text-gray-600">
              <p>{companyData.address}</p>
              <p>Ph: {companyData.phone} | Email: {companyData.email}</p>
              <p>GSTIN: {companyData.gst_number}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="p-4 rounded-lg" style={{ backgroundColor: `${brandColor}20`, border: `2px solid ${brandColor}` }}>
              <h2 className="text-2xl font-bold" style={{ color: brandColor }}>INVOICE</h2>
              <p className="text-lg font-semibold"># {invoice_number}</p>
            </div>
          </div>
        </div>

        {/* Billing & Shipping Addresses */}
        <div className="grid grid-cols-2 gap-8 mb-6">
          <div>
            <div className="p-4 rounded-lg" style={{ backgroundColor: `${brandColor}10` }}>
              <h3 className="font-semibold mb-2" style={{ color: brandColor }}>Billing Address:</h3>
              <p className="font-medium">{customerData.name}</p>
              <p className="text-sm text-gray-600">{customerData.address}</p>
              <p className="text-sm text-gray-600">Ph: {customerData.phone}</p>
              <p className="text-sm text-gray-600">GSTIN: {customerData.gst_number}</p>
            </div>
          </div>
          <div>
            <div className="p-4 rounded-lg" style={{ backgroundColor: `${brandColor}10` }}>
              <h3 className="font-semibold mb-2" style={{ color: brandColor }}>Shipping Address:</h3>
              <p className="font-medium">{customerData.shipping_name || customerData.name}</p>
              <p className="text-sm text-gray-600">{customerData.shipping_address || customerData.address}</p>
              <p className="text-sm text-gray-600">Ph: {customerData.shipping_phone || customerData.phone}</p>
            </div>
          </div>
        </div>

        {/* Invoice Details */}
        <div className="mb-6">
          <div className="grid grid-cols-2 gap-8">
            <div>
              <p><strong>Invoice Date:</strong> {format(new Date(invoice_date), 'dd-MM-yyyy')}</p>
              <p><strong>Due Date:</strong> {format(new Date(due_date), 'dd-MM-yyyy')}</p>
            </div>
            <div className="text-right">
              <p><strong>Payment Terms:</strong> {customerData.payment_terms || 30} days</p>
              <p><strong>Currency:</strong> INR (₹)</p>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="mb-6">
          <table className="w-full border-collapse border border-gray-300 rounded-lg overflow-hidden">
            <thead>
              <tr style={{ backgroundColor: `${brandColor}20` }}>
                <th className="border p-3 text-left">Item</th>
                <th className="border p-3 text-right">Qty</th>
                <th className="border p-3 text-right">Rate</th>
                <th className="border p-3 text-right">GST %</th>
                <th className="border p-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="border p-3">
                    <div className="font-medium">{item.product_name}</div>
                    {item.description && (
                      <div className="text-sm text-gray-500">{item.description}</div>
                    )}
                  </td>
                  <td className="border p-3 text-right">{item.quantity}</td>
                  <td className="border p-3 text-right">₹{item.rate?.toFixed(2)}</td>
                  <td className="border p-3 text-right">{item.gst_rate}%</td>
                  <td className="border p-3 text-right">₹{item.total?.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="flex justify-end mb-6">
          <div className="w-80">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>₹{subtotal?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Discount:</span>
                <span>-₹{discount_amount?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>GST:</span>
                <span>₹{gst_amount?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-2" style={{ borderTop: `2px solid ${brandColor}` }}>
                <span>Total:</span>
                <span>₹{total_amount?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-green-600">
                <span>Paid:</span>
                <span>₹{paid_amount?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-red-600">
                <span>Balance:</span>
                <span>₹{balance_amount?.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Terms & Signature */}
        <div className="grid grid-cols-2 gap-8">
          <div>
            <h4 className="font-semibold mb-2" style={{ color: brandColor }}>Terms & Conditions:</h4>
            <div className="text-sm text-gray-600 space-y-1">
              <p>• Payment due within specified terms</p>
              <p>• Late payments subject to interest charges</p>
              <p>• Subject to local jurisdiction</p>
            </div>
            {notes && (
              <div className="mt-4">
                <h4 className="font-semibold mb-1" style={{ color: brandColor }}>Notes:</h4>
                <p className="text-sm text-gray-600">{notes}</p>
              </div>
            )}
          </div>
          <div className="text-right">
            <div className="mt-8">
              <p className="font-semibold">For {companyData.name}</p>
              <div className="mt-8 pt-2" style={{ borderTop: `1px solid ${brandColor}` }}>
                <p className="text-sm">Authorized Signatory</p>
                <p className="text-xs text-gray-500 mt-1">
                  {companyData.signatory_name || 'Authorized Person'}
                </p>
                <p className="text-xs text-gray-500">
                  {companyData.signatory_title || 'Manager'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-4 text-center text-sm" style={{ borderTop: `1px solid ${brandColor}` }}>
          <p style={{ color: brandColor }}>Thank you for your business!</p>
          <p className="text-gray-500 text-xs mt-1">
            Visit us at {companyData.website || 'www.company.com'} | Follow us @{companyData.social_handle || 'company'}
          </p>
        </div>
      </div>
    </div>
  );
};

// Main component to render theme based on product type
export const ProductBasedInvoiceTemplate = ({ invoiceData, companyData, customerData, forceTheme = null }) => {
  const theme = forceTheme || getThemeByProducts(invoiceData.items);
  
  switch (theme) {
    case 'textile':
      return <TextileBillingTheme invoiceData={invoiceData} companyData={companyData} customerData={customerData} />;
    case 'pharma':
      return <PharmaBillingTheme invoiceData={invoiceData} companyData={companyData} customerData={customerData} />;
    case 'electronics':
      return <ElectronicsBillingTheme invoiceData={invoiceData} companyData={companyData} customerData={customerData} />;
    case 'wholesale':
      return <WholesaleBillingTheme invoiceData={invoiceData} companyData={companyData} customerData={customerData} />;
    case 'custom':
      return <CustomBrandingTheme invoiceData={invoiceData} companyData={companyData} customerData={customerData} />;
    case 'retail':
    default:
      return <RetailPOSTheme invoiceData={invoiceData} companyData={companyData} customerData={customerData} />;
  }
};

export default ProductBasedInvoiceTemplate;