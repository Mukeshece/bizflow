
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { ArrowLeft, Settings, Plus, Trash2, X, Calculator, Delete } from 'lucide-react'; // Changed Backspace to Delete
import { useNavigate } from 'react-router-dom';
import { Product } from '@/api/entities';
import { SalesInvoice } from '@/api/entities';

const VirtualKeyboard = ({ onKeyPress, onClear, onBackspace, onEnter }) => {
  const keys = [
    ['1', '2', '3'],
    ['4', '5', '6'], 
    ['7', '8', '9'],
    ['0', '.', 'C']
  ];

  return (
    <div className="bg-slate-800 p-4 rounded-lg">
      <div className="grid grid-cols-4 gap-2 mb-3">
        {keys.flat().map(key => (
          <Button
            key={key}
            variant="secondary"
            className="h-12 bg-slate-700 hover:bg-slate-600 text-white font-semibold"
            onClick={() => {
              if (key === 'C') onClear();
              else onKeyPress(key);
            }}
          >
            {key}
          </Button>
        ))}
        <Button
          variant="secondary"
          className="h-12 bg-slate-700 hover:bg-slate-600 text-white"
          onClick={onBackspace}
        >
          <Delete className="w-4 h-4" /> {/* Changed Backspace to Delete */}
        </Button>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Button
          variant="secondary"
          className="h-12 bg-red-600 hover:bg-red-700 text-white font-semibold"
          onClick={onClear}
        >
          Clear
        </Button>
        <Button
          variant="secondary"
          className="h-12 bg-green-600 hover:bg-green-700 text-white font-semibold"
          onClick={onEnter}
        >
          Enter
        </Button>
      </div>
    </div>
  );
};

const POSBillingScreen = () => {
  const navigate = useNavigate();
  const [activeBill, setActiveBill] = useState(0);
  const [bills, setBills] = useState([
    { items: [], discount: 0, additionalCharges: 0, receivedAmount: 0, paymentMethod: 'Cash' }
  ]);
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [showKeyboard, setShowKeyboard] = useState(false);
  const [keyboardTarget, setKeyboardTarget] = useState(null);
  const [keyboardValue, setKeyboardValue] = useState('');
  const searchInputRef = useRef(null);

  // Sample data to match the image exactly
  const sampleItems = [
    { id: 1, name: 'Red Chilli', item_code: '', sp: 95, quantity: 1, unit: 'KGS', gst_rate: 0 },
    { id: 2, name: 'chocolate', item_code: '90109220615l', sp: 200, quantity: 3, unit: 'BOX', gst_rate: 18 },
    { id: 3, name: 'Milk', item_code: '', sp: 100, quantity: 1, unit: 'LTR', gst_rate: 0 },
    { id: 4, name: 'Pen', item_code: '', sp: 10, quantity: 5, unit: 'PCS', gst_rate: 18 }
  ];
  
  const currentBill = bills[activeBill];
  const setCurrentBill = (updater) => {
    const newBills = [...bills];
    newBills[activeBill] = updater(newBills[activeBill]);
    setBills(newBills);
  };

  useEffect(() => {
    Product.list().then(setProducts);
    // Initialize with sample data for demo
    setCurrentBill(() => ({ ...currentBill, items: sampleItems }));
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const lowerCaseQuery = searchQuery.toLowerCase();
      setFilteredProducts(
        products.filter(p =>
          p.name.toLowerCase().includes(lowerCaseQuery) ||
          p.item_code.toLowerCase().includes(lowerCaseQuery)
        )
      );
      setIsSearchOpen(true);
    } else {
      setIsSearchOpen(false);
    }
  }, [searchQuery, products]);

  const addItemToBill = (product) => {
    const existingItemIndex = currentBill.items.findIndex(item => item.id === product.id);
    let newItems;
    if (existingItemIndex > -1) {
      newItems = currentBill.items.map((item, index) => 
        index === existingItemIndex ? { ...item, quantity: item.quantity + 1 } : item
      );
    } else {
      newItems = [...currentBill.items, {
        id: product.id,
        name: product.name,
        item_code: product.item_code,
        sp: product.b2c_rate || 0, // Using B2C rate for all POS sales
        quantity: 1,
        unit: product.unit ? product.unit.toUpperCase() : 'PCS',
        gst_rate: product.gst_rate || 0
      }];
    }
    setCurrentBill(bill => ({ ...bill, items: newItems }));
    setSearchQuery('');
    setIsSearchOpen(false);
    searchInputRef.current?.focus();
  };

  const handleKeyboardInput = (target, initialValue = '') => {
    setKeyboardTarget(target);
    setKeyboardValue(initialValue);
    setShowKeyboard(true);
  };

  const handleKeyPress = (key) => {
    setKeyboardValue(prev => prev + key);
  };

  const handleKeyboardClear = () => {
    setKeyboardValue('');
  };

  const handleKeyboardBackspace = () => {
    setKeyboardValue(prev => prev.slice(0, -1));
  };

  const handleKeyboardEnter = () => {
    if (keyboardTarget) {
      const value = parseFloat(keyboardValue) || 0;
      if (keyboardTarget.type === 'quantity') {
        updateItemQuantity(keyboardTarget.itemId, value);
      } else if (keyboardTarget.type === 'price') {
        updateItemPrice(keyboardTarget.itemId, value);
      } else if (keyboardTarget.type === 'received') {
        setCurrentBill(bill => ({ ...bill, receivedAmount: value }));
      }
    }
    setShowKeyboard(false);
    setKeyboardTarget(null);
    setKeyboardValue('');
  };

  const updateItemQuantity = (itemId, newQuantity) => {
    const newItems = currentBill.items.map(item => 
      item.id === itemId ? { ...item, quantity: newQuantity } : item
    );
    setCurrentBill(bill => ({ ...bill, items: newItems }));
  };

  const updateItemPrice = (itemId, newPrice) => {
    const newItems = currentBill.items.map(item => 
      item.id === itemId ? { ...item, sp: newPrice } : item
    );
    setCurrentBill(bill => ({ ...bill, items: newItems }));
  };

  const removeItem = (itemId) => {
    const newItems = currentBill.items.filter(item => item.id !== itemId);
    setCurrentBill(bill => ({ ...bill, items: newItems }));
  };

  const handleAddNewBill = () => {
    if (bills.length < 4) {
      setBills([...bills, { items: [], discount: 0, additionalCharges: 0, receivedAmount: 0, paymentMethod: 'Cash' }]);
      setActiveBill(bills.length);
    }
  };

  const handleCloseBill = (index) => {
    if (bills.length > 1) {
      const newBills = bills.filter((_, i) => i !== index);
      setBills(newBills);
      setActiveBill(prev => Math.max(0, prev - 1));
    } else {
      setBills([{ items: [], discount: 0, additionalCharges: 0, receivedAmount: 0, paymentMethod: 'Cash' }]);
    }
  };

  const handleSaveBill = async () => {
    if (!currentBill || currentBill.items.length === 0) return;

    const subTotal = (currentBill.items || []).reduce((sum, item) => sum + (item.sp * item.quantity), 0);
    const tax = (currentBill.items || []).reduce((sum, item) => sum + (item.sp * item.quantity * (item.gst_rate / 100)), 0);
    const totalAmount = subTotal + tax;
    
    // All sales generated from the POS screen are flagged as B2C
    const INVOICE_TYPE_B2C = 'B2C';

    const invoiceData = {
      invoice_number: `POS-${Date.now()}`,
      customer_name: 'Walk-in Customer',
      invoice_date: new Date().toISOString().split('T')[0],
      invoice_type: INVOICE_TYPE_B2C,
      payment_type: currentBill.paymentMethod.toLowerCase(),
      items: (currentBill.items || []).map(item => ({
        product_id: item.id,
        product_name: item.name,
        quantity: item.quantity,
        rate: item.sp, // 'sp' is set to b2c_rate when item is added
        gst_rate: item.gst_rate,
        total: item.sp * item.quantity,
      })),
      subtotal: subTotal,
      gst_amount: tax,
      total_amount: totalAmount,
      paid_amount: currentBill.receivedAmount,
      balance_amount: totalAmount - currentBill.receivedAmount,
      payment_status: (totalAmount - currentBill.receivedAmount) <= 0 ? 'paid' : 'partial'
    };
    
    try {
      await SalesInvoice.create(invoiceData);
      handleCloseBill(activeBill);
    } catch(err) {
      console.error("Failed to save bill", err);
    }
  };

  const subTotal = (currentBill.items || []).reduce((sum, item) => sum + (item.sp * item.quantity), 0);
  const tax = (currentBill.items || []).reduce((sum, item) => sum + (item.sp * item.quantity * (item.gst_rate / 100)), 0);
  const total = subTotal + tax;
  
  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-600 via-purple-700 to-blue-600 p-6">
      <div className="max-w-full mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden" style={{ height: 'calc(100vh - 48px)' }}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-white">
          <Button variant="ghost" onClick={() => navigate('/')} className="flex items-center gap-2 text-gray-700 hover:text-gray-900">
            <ArrowLeft className="w-5 h-5" />
            Exit POS (ESC)
          </Button>
          <h1 className="text-2xl font-bold text-gray-800">POS Billing</h1>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="flex items-center gap-2 text-gray-600 border-gray-300">
              <Settings className="w-4 h-4" />
              Settings [CTRL + S]
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setShowKeyboard(!showKeyboard)}
              className={`flex items-center gap-2 ${showKeyboard ? 'bg-blue-100' : ''}`}
            >
              <Calculator className="w-4 h-4" />
              Keypad
            </Button>
          </div>
        </div>

        <div className="flex h-full">
          {/* Main Content */}
          <div className="flex-1 flex flex-col bg-white">
            {/* Billing Screen Tabs */}
            <div className="flex border-b border-gray-200 bg-gray-50">
              {bills.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveBill(index)}
                  className={`px-6 py-4 text-sm font-medium flex items-center gap-2 border-r border-gray-200 ${
                    activeBill === index 
                      ? 'bg-white text-gray-800 border-b-2 border-blue-500' 
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                  }`}
                >
                  Billing Screen {index + 1} [CTRL+{index + 1}]
                  {bills.length > 1 && (
                    <X 
                      className="w-4 h-4 hover:text-red-500 ml-2" 
                      onClick={(e) => { e.stopPropagation(); handleCloseBill(index); }} 
                    />
                  )}
                </button>
              ))}
              {bills.length < 4 && (
                <button onClick={handleAddNewBill} className="px-4 py-4 text-gray-500 hover:text-gray-700 hover:bg-gray-100">
                  <Plus className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Search Bar */}
            <div className="p-4">
              <div className="relative">
                <Popover open={isSearchOpen} onOpenChange={setIsSearchOpen}>
                  <PopoverTrigger asChild>
                    <Input
                      ref={searchInputRef}
                      placeholder="Search by Item Name/Item Code or Scan Barcode"
                      className="h-14 text-base border-2 border-orange-300 focus:border-orange-500 rounded-lg bg-orange-50 focus:bg-white px-4"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                    />
                  </PopoverTrigger>
                  <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                    <div className="max-h-60 overflow-y-auto">
                      {filteredProducts.length > 0 ? filteredProducts.map(p => (
                        <div key={p.id} onClick={() => addItemToBill(p)} className="p-3 hover:bg-gray-100 cursor-pointer text-sm border-b last:border-b-0">
                          <div className="font-medium">{p.name}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            Code: {p.item_code} | Price: ₹{p.b2c_rate} | Stock: {p.current_stock}
                          </div>
                        </div>
                      )) : (
                        <div className="p-3 text-sm text-gray-500 text-center">
                          No products found. Try scanning a barcode or search by name.
                        </div>
                      )}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            
            {/* Items Table */}
            <div className="flex-1 overflow-auto">
              <table className="w-full border-collapse">
                <thead className="bg-gray-100 sticky top-0">
                  <tr>
                    <th className="text-left p-4 font-semibold text-gray-700 border-r border-gray-300 w-16">NO</th>
                    <th className="text-left p-4 font-semibold text-gray-700 border-r border-gray-300">ITEMS</th>
                    <th className="text-left p-4 font-semibold text-gray-700 border-r border-gray-300 w-32">ITEM CODE</th>
                    <th className="text-right p-4 font-semibold text-gray-700 border-r border-gray-300 w-24">RATE (₹)</th>
                    <th className="text-center p-4 font-semibold text-gray-700 border-r border-gray-300 w-28">QUANTITY</th>
                    <th className="text-right p-4 font-semibold text-gray-700 w-32">AMOUNT (₹)</th>
                    <th className="text-center p-4 font-semibold text-gray-700 w-16">ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {(currentBill.items || []).length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center p-8 text-gray-500">
                        No items added yet. Search and add products to start billing.
                      </td>
                    </tr>
                  ) : (
                    (currentBill.items || []).map((item, index) => (
                      <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="p-4 text-gray-700 border-r border-gray-200">{index + 1}</td>
                        <td className="p-4 font-medium text-gray-800 border-r border-gray-200">{item.name}</td>
                        <td className="p-4 text-gray-600 font-mono text-sm border-r border-gray-200">{item.item_code}</td>
                        <td className="p-4 text-right border-r border-gray-200">
                          <button 
                            className="text-blue-600 hover:underline"
                            onClick={() => handleKeyboardInput({ type: 'price', itemId: item.id }, item.sp.toString())}
                          >
                            ₹ {item.sp}
                          </button>
                        </td>
                        <td className="p-4 text-center border-r border-gray-200">
                          <button 
                            className="font-medium text-blue-600 hover:underline"
                            onClick={() => handleKeyboardInput({ type: 'quantity', itemId: item.id }, item.quantity.toString())}
                          >
                            {item.quantity} {item.unit}
                          </button>
                        </td>
                        <td className="p-4 text-right font-semibold text-gray-800">₹ {(item.sp * item.quantity).toFixed(2)}</td>
                        <td className="p-4 text-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItem(item.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Bottom Action Buttons */}
            <div className="flex justify-center gap-4 p-6 border-t border-gray-200 bg-gray-50">
              <Button variant="outline" className="px-8 py-3 text-lg font-medium border-2 border-purple-500 text-purple-600 hover:bg-purple-50 rounded-lg">
                Save & Print [F6]
              </Button>
              <Button onClick={handleSaveBill} className="px-8 py-3 text-lg font-medium bg-purple-600 hover:bg-purple-700 text-white rounded-lg">
                Save Bill [F7]
              </Button>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="w-80 bg-gray-50 border-l border-gray-200 flex flex-col">
            {/* Bill Details */}
            <div className="p-6 border-b">
              <h3 className="text-lg font-bold text-gray-800 mb-6">Bill details</h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Sub Total</span>
                  <span className="font-semibold text-gray-800">₹ {subTotal.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-semibold text-gray-800">₹ {tax.toFixed(2)}</span>
                </div>
                
                <div className="bg-green-100 p-4 rounded-lg border border-green-200">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-green-800">Total Amount</span>
                    <span className="font-bold text-green-800 text-xl">₹ {total.toFixed(2)}</span>
                  </div>
                </div>
                
                <div className="border-t border-gray-300 pt-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-gray-700">Received Amount</span>
                    <span className="text-sm text-gray-500">[F4]</span>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      className="flex-1 h-10 px-3 border border-gray-300 rounded-md bg-white text-right font-semibold text-lg"
                      onClick={() => handleKeyboardInput({ type: 'received' }, currentBill.receivedAmount.toString())}
                    >
                      ₹ {currentBill.receivedAmount.toFixed(2)}
                    </button>
                    <select 
                      value={currentBill.paymentMethod}
                      onChange={e => setCurrentBill(b => ({...b, paymentMethod: e.target.value}))}
                      className="h-10 border border-gray-300 rounded-md px-3 bg-white text-sm"
                    >
                      <option>Cash</option>
                      <option>Card</option>
                      <option>UPI</option>
                    </select>
                  </div>
                  {total - currentBill.receivedAmount > 0 && (
                    <div className="mt-2 text-red-600 text-sm">
                      Balance: ₹ {(total - currentBill.receivedAmount).toFixed(2)}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Virtual Keyboard */}
            {showKeyboard && (
              <div className="p-4">
                <div className="mb-2 text-sm text-gray-600">
                  {keyboardTarget?.type === 'quantity' ? 'Enter Quantity:' : 
                   keyboardTarget?.type === 'price' ? 'Enter Price:' :
                   keyboardTarget?.type === 'received' ? 'Enter Received Amount:' : 'Enter Value:'}
                </div>
                <div className="bg-slate-100 p-2 rounded mb-2 text-right font-mono text-lg">
                  {keyboardValue || '0'}
                </div>
                <VirtualKeyboard
                  onKeyPress={handleKeyPress}
                  onClear={handleKeyboardClear}
                  onBackspace={handleKeyboardBackspace}
                  onEnter={handleKeyboardEnter}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default POSBillingScreen;
