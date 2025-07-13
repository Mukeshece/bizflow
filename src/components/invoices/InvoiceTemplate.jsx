import React from 'react';
import { format } from 'date-fns';

const InvoiceTemplate = ({ invoiceData, companyData, customerData, theme = 'theme1', type = 'regular' }) => {
  if (!invoiceData || !companyData || !customerData) {
    return <div className="p-4 text-center text-gray-500">Loading invoice data...</div>;
  }

  const {
    invoice_number,
    invoice_date,
    due_date,
    items = [],
    subtotal = 0,
    discount_amount = 0,
    gst_amount = 0,
    total_amount = 0,
    paid_amount = 0,
    balance_amount = 0,
    notes,
    payment_methods = [],
    transport_name,
    lr_no
  } = invoiceData;

  const {
    name: companyName = 'Your Company',
    address: companyAddress = 'Company Address',
    phone: companyPhone = 'Phone Number',
    email: companyEmail = 'Email Address',
    gst_number: companyGst = 'GST Number',
    logo_url: companyLogo
  } = companyData;

  const {
    name: customerName = 'Customer Name',
    address: customerAddress = 'Customer Address',
    phone: customerPhone = 'Customer Phone',
    gst_number: customerGst = 'Customer GST'
  } = customerData;

  // Theme configurations
  const themes = {
    theme1: {
      name: 'Classic Blue',
      headerBg: 'bg-blue-600',
      headerText: 'text-white',
      accentColor: 'text-blue-600',
      tableBg: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    theme2: {
      name: 'Modern Green',
      headerBg: 'bg-green-600',
      headerText: 'text-white',
      accentColor: 'text-green-600',
      tableBg: 'bg-green-50',
      borderColor: 'border-green-200'
    },
    theme3: {
      name: 'Elegant Purple',
      headerBg: 'bg-purple-600',
      headerText: 'text-white',
      accentColor: 'text-purple-600',
      tableBg: 'bg-purple-50',
      borderColor: 'border-purple-200'
    },
    theme4: {
      name: 'Professional Gray',
      headerBg: 'bg-gray-600',
      headerText: 'text-white',
      accentColor: 'text-gray-600',
      tableBg: 'bg-gray-50',
      borderColor: 'border-gray-200'
    },
    theme5: {
      name: 'Corporate Red',
      headerBg: 'bg-red-600',
      headerText: 'text-white',
      accentColor: 'text-red-600',
      tableBg: 'bg-red-50',
      borderColor: 'border-red-200'
    },
    theme6: {
      name: 'Fresh Orange',
      headerBg: 'bg-orange-600',
      headerText: 'text-white',
      accentColor: 'text-orange-600',
      tableBg: 'bg-orange-50',
      borderColor: 'border-orange-200'
    },
    theme7: {
      name: 'Ocean Teal',
      headerBg: 'bg-teal-600',
      headerText: 'text-white',
      accentColor: 'text-teal-600',
      tableBg: 'bg-teal-50',
      borderColor: 'border-teal-200'
    },
    theme8: {
      name: 'Sunset Yellow',
      headerBg: 'bg-yellow-600',
      headerText: 'text-white',
      accentColor: 'text-yellow-600',
      tableBg: 'bg-yellow-50',
      borderColor: 'border-yellow-200'
    },
    theme9: {
      name: 'Royal Indigo',
      headerBg: 'bg-indigo-600',
      headerText: 'text-white',
      accentColor: 'text-indigo-600',
      tableBg: 'bg-indigo-50',
      borderColor: 'border-indigo-200'
    },
    theme10: {
      name: 'Minimal Black',
      headerBg: 'bg-black',
      headerText: 'text-white',
      accentColor: 'text-black',
      tableBg: 'bg-gray-50',
      borderColor: 'border-gray-300'
    }
  };

  const currentTheme = themes[theme] || themes.theme1;

  if (type === 'thermal') {
    return (
      <div className="max-w-sm mx-auto p-2 bg-white text-xs font-mono">
        {/* Thermal Header */}
        <div className="text-center mb-2">
          <div className="font-bold text-sm">{companyName}</div>
          <div className="text-xs">{companyAddress}</div>
          <div className="text-xs">Ph: {companyPhone}</div>
          <div className="text-xs">Email: {companyEmail}</div>
          {companyGst && <div className="text-xs">GSTIN: {companyGst}</div>}
        </div>

        <div className="border-t border-b border-dashed py-1 my-2">
          <div className="text-center font-bold">INVOICE</div>
        </div>

        {/* Invoice Details */}
        <div className="mb-2">
          <div>Invoice No: {invoice_number}</div>
          <div>Date: {format(new Date(invoice_date), 'dd-MM-yyyy')}</div>
          {due_date && <div>Due: {format(new Date(due_date), 'dd-MM-yyyy')}</div>}
        </div>

        {/* Customer Details */}
        <div className="mb-2">
          <div className="font-bold">Bill To:</div>
          <div>{customerName}</div>
          <div>{customerAddress}</div>
          <div>Ph: {customerPhone}</div>
          {customerGst && <div>GSTIN: {customerGst}</div>}
        </div>

        <div className="border-t border-dashed my-2"></div>

        {/* Items */}
        <div className="mb-2">
          {items.map((item, index) => (
            <div key={index} className="mb-1">
              <div className="font-bold">{item.product_name}</div>
              <div className="flex justify-between">
                <span>{item.quantity} x ₹{item.rate}</span>
                <span>₹{item.total.toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-dashed my-2"></div>

        {/* Totals */}
        <div className="mb-2">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>₹{subtotal.toFixed(2)}</span>
          </div>
          {discount_amount > 0 && (
            <div className="flex justify-between">
              <span>Discount:</span>
              <span>-₹{discount_amount.toFixed(2)}</span>
            </div>
          )}
          {gst_amount > 0 && (
            <div className="flex justify-between">
              <span>GST:</span>
              <span>₹{gst_amount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between font-bold border-t pt-1">
            <span>Total:</span>
            <span>₹{total_amount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Paid:</span>
            <span>₹{paid_amount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Balance:</span>
            <span>₹{balance_amount.toFixed(2)}</span>
          </div>
        </div>

        {/* Payment Methods */}
        {payment_methods.length > 0 && (
          <div className="mb-2">
            <div className="font-bold">Payment:</div>
            {payment_methods.map((pm, index) => (
              <div key={index} className="text-xs">
                {pm.method}: ₹{pm.amount.toFixed(2)}
              </div>
            ))}
          </div>
        )}

        {notes && (
          <div className="mb-2">
            <div className="font-bold">Notes:</div>
            <div className="text-xs">{notes}</div>
          </div>
        )}

        <div className="border-t border-dashed my-2"></div>

        <div className="text-center text-xs">
          <div>Thank you for your business!</div>
          <div className="mt-1">Authorized Signatory</div>
        </div>
      </div>
    );
  }

  // Regular Invoice Template
  return (
    <div className="max-w-4xl mx-auto p-8 bg-white shadow-lg">
      {/* Header */}
      <div className={`${currentTheme.headerBg} ${currentTheme.headerText} p-6 rounded-t-lg`}>
        <div className="flex justify-between items-center">
          <div>
            {companyLogo && (
              <img src={companyLogo} alt={companyName} className="h-12 mb-2" />
            )}
            <h1 className="text-2xl font-bold">{companyName}</h1>
            <p className="text-sm opacity-90">{companyAddress}</p>
          </div>
          <div className="text-right">
            <h2 className="text-3xl font-bold">INVOICE</h2>
            <p className="text-lg">#{invoice_number}</p>
          </div>
        </div>
      </div>

      {/* Company & Customer Details */}
      <div className="grid grid-cols-2 gap-8 p-6 bg-gray-50">
        <div>
          <h3 className={`font-semibold ${currentTheme.accentColor} mb-2`}>Company Details</h3>
          <div className="text-sm space-y-1">
            <div>Phone: {companyPhone}</div>
            <div>Email: {companyEmail}</div>
            {companyGst && <div>GSTIN: {companyGst}</div>}
          </div>
        </div>
        <div>
          <h3 className={`font-semibold ${currentTheme.accentColor} mb-2`}>Bill To</h3>
          <div className="text-sm space-y-1">
            <div className="font-medium">{customerName}</div>
            <div>{customerAddress}</div>
            <div>Phone: {customerPhone}</div>
            {customerGst && <div>GSTIN: {customerGst}</div>}
          </div>
        </div>
      </div>

      {/* Invoice Details */}
      <div className="flex justify-between p-6 border-b">
        <div>
          <h3 className={`font-semibold ${currentTheme.accentColor} mb-2`}>Invoice Details</h3>
          <div className="text-sm space-y-1">
            <div>Invoice Date: {format(new Date(invoice_date), 'dd MMM yyyy')}</div>
            {due_date && <div>Due Date: {format(new Date(due_date), 'dd MMM yyyy')}</div>}
            {transport_name && <div>Transport: {transport_name}</div>}
            {lr_no && <div>LR No: {lr_no}</div>}
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="p-6">
        <table className="w-full">
          <thead>
            <tr className={`${currentTheme.tableBg} ${currentTheme.borderColor} border-b`}>
              <th className="text-left p-3 font-semibold">#</th>
              <th className="text-left p-3 font-semibold">Item Name</th>
              <th className="text-right p-3 font-semibold">Qty</th>
              <th className="text-right p-3 font-semibold">Rate</th>
              <th className="text-right p-3 font-semibold">Discount</th>
              <th className="text-right p-3 font-semibold">GST</th>
              <th className="text-right p-3 font-semibold">Amount</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={index} className="border-b">
                <td className="p-3">{index + 1}</td>
                <td className="p-3 font-medium">{item.product_name}</td>
                <td className="p-3 text-right">{item.quantity}</td>
                <td className="p-3 text-right">₹{item.rate?.toFixed(2)}</td>
                <td className="p-3 text-right">{item.discount || 0}%</td>
                <td className="p-3 text-right">{item.gst_rate || 0}%</td>
                <td className="p-3 text-right">₹{item.total?.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="flex justify-end p-6">
        <div className="w-80 space-y-2">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>₹{subtotal.toFixed(2)}</span>
          </div>
          {discount_amount > 0 && (
            <div className="flex justify-between text-red-600">
              <span>Discount:</span>
              <span>-₹{discount_amount.toFixed(2)}</span>
            </div>
          )}
          {gst_amount > 0 && (
            <div className="flex justify-between">
              <span>GST:</span>
              <span>₹{gst_amount.toFixed(2)}</span>
            </div>
          )}
          <div className={`flex justify-between text-xl font-bold ${currentTheme.accentColor} border-t pt-2`}>
            <span>Total:</span>
            <span>₹{total_amount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Paid:</span>
            <span>₹{paid_amount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-semibold">
            <span>Balance:</span>
            <span>₹{balance_amount.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Payment Methods */}
      {payment_methods.length > 0 && (
        <div className="p-6 border-t">
          <h3 className={`font-semibold ${currentTheme.accentColor} mb-2`}>Payment Details</h3>
          <div className="text-sm space-y-1">
            {payment_methods.map((pm, index) => (
              <div key={index}>
                {pm.method}: ₹{pm.amount?.toFixed(2)} {pm.reference_no && `(Ref: ${pm.reference_no})`}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Notes */}
      {notes && (
        <div className="p-6 border-t">
          <h3 className={`font-semibold ${currentTheme.accentColor} mb-2`}>Notes</h3>
          <p className="text-sm">{notes}</p>
        </div>
      )}

      {/* Footer */}
      <div className={`${currentTheme.headerBg} ${currentTheme.headerText} p-6 rounded-b-lg`}>
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm opacity-90">Thank you for your business!</p>
          </div>
          <div className="text-right">
            <p className="text-sm opacity-90">Authorized Signatory</p>
            <div className="h-12 w-32 bg-white bg-opacity-20 rounded mt-2 flex items-center justify-center text-xs">
              [Signature]
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceTemplate;