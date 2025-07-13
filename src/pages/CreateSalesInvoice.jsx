
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from '@/components/ui/switch';
import { Calendar } from "@/components/ui/calendar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Plus,
  Trash2,
  X,
  Settings,
  ChevronDown,
  Calendar as CalendarIcon,
  Scan,
  Printer,
  Check,
  Link as LinkIcon // Renamed to avoid conflict with react-router-dom Link
} from 'lucide-react';
import { format } from "date-fns";
import { createPageUrl } from '@/utils';
import { generateNextInvoiceNumber } from '@/components/utils/invoiceNumberGenerator';
import LinkPaymentDialog from '../components/sales/LinkPaymentDialog'; // New Import
import { SalesInvoice } from '@/api/entities';
import { Customer } from '@/api/entities';
import { Product } from '@/api/entities';
import { AppSettings } from '@/api/entities';
import { Company } from '@/api/entities';
import { User } from '@/api/entities';
import { BankAccount } from '@/api/entities';
import { Transaction } from '@/api/entities';

const createInitialBill = () => ({
  id: `new_${Date.now()}`,
  customer_id: null,
  customer_name: '',
  invoice_number: '',
  invoice_date: new Date(),
  due_date: new Date(),
  invoice_type: 'B2B',
  items: Array(5).fill().map(() => ({ product_name: '', quantity: '', rate: '', amount: '' })),
  subtotal: 0,
  discount_percent: 0,
  discount_amount: 0,
  gst_amount: 0,
  adjustment: 0,
  round_off: 0,
  total_amount: 0,
  paid_amount: 0,
  balance_amount: 0,
  payment_methods: [{ method: 'Cash', amount: 0, reference_no: '', account_id: '' }],
  notes: '',
  state_of_supply: 'Tamil Nadu',
  linked_invoices: [] // Initialize linked_invoices for new bills
});

export default function CreateSalesInvoice() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const invoiceId = searchParams.get('id');

  const [loading, setLoading] = useState(true);
  const [bills, setBills] = useState([]);
  const [activeBillIndex, setActiveBillIndex] = useState(0);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [settings, setSettings] = useState({});
  const [company, setCompany] = useState({});
  const [user, setUser] = useState(null);
  const [showItemSettings, setShowItemSettings] = useState(false);
  const [invoiceNumberError, setInvoiceNumberError] = useState('');
  const [customerSearch, setCustomerSearch] = useState("");
  const [isCustomerPopoverOpen, setIsCustomerPopoverOpen] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [productSearch, setProductSearch] = useState("");
  const [activeProductPopover, setActiveProductPopover] = useState(null);
  const [showLinkPaymentDialog, setShowLinkPaymentDialog] = useState(false); // New State

  const currentBill = useMemo(() => bills[activeBillIndex] || createInitialBill(), [bills, activeBillIndex]);

  // Dynamically calculate paid amount from the payment methods array
  const currentPaidAmount = useMemo(() => {
    if (!currentBill?.payment_methods) return 0;
    return currentBill.payment_methods.reduce((sum, pm) => sum + (parseFloat(pm?.amount) || 0), 0);
  }, [currentBill?.payment_methods]);

  const updateCurrentBill = (updater) => {
    setBills(prev => {
      const newBills = [...prev];
      if (newBills[activeBillIndex]) {
        newBills[activeBillIndex] = typeof updater === 'function' ? updater(newBills[activeBillIndex]) : { ...newBills[activeBillIndex], ...updater };
      }
      return newBills;
    });
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  const createInitialBillWithNumber = async (companyId) => {
    const initialBill = createInitialBill();
    
    if (companyId) {
      try {
        const generatedNumber = await generateNextInvoiceNumber(companyId, 'sales_invoice');
        initialBill.invoice_number = generatedNumber;
      } catch (error) {
        console.error("Error generating invoice number:", error);
        initialBill.invoice_number = `INV-${Date.now()}`;
      }
    } else {
      initialBill.invoice_number = `INV-${Date.now()}`;
    }
    
    initialBill.state_of_supply = company?.state || 'Tamil Nadu'; 
    return initialBill;
  };

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [customersData, productsData, settingsData, companiesData, userData, bankAccountsData] = await Promise.all([
        Customer.list().catch(() => []),
        Product.list().catch(() => []),
        AppSettings.list().catch(() => []),
        Company.list().catch(() => []),
        User.me().catch(() => ({})),
        BankAccount.list().catch(() => [])
      ]);

      const loadedSettings = Array.isArray(settingsData) && settingsData.length > 0 ? settingsData[0] : {};
      const activeCompany = Array.isArray(companiesData) && companiesData.length > 0 
        ? (companiesData.find(c => c.id === userData?.active_company_id) || companiesData[0]) 
        : {};

      setCustomers(Array.isArray(customersData) ? customersData : []);
      setProducts(Array.isArray(productsData) ? productsData : []);
      setSettings(loadedSettings);
      setCompany(activeCompany);
      setUser(userData);
      setBankAccounts(Array.isArray(bankAccountsData) ? bankAccountsData : []);

      if (invoiceId) {
        try {
          const invoice = await SalesInvoice.get(invoiceId);
          if (invoice) {
            const loadedInvoice = {
              ...invoice,
              invoice_date: invoice.invoice_date ? new Date(invoice.invoice_date) : new Date(),
              payment_methods: invoice.payment_methods || [{ method: 'Cash', amount: 0, reference_no: '', account_id: '' }],
              linked_invoices: invoice.linked_invoices || [] // Ensure linked_invoices is loaded
            };
            setBills([loadedInvoice]);
          } else {
            setBills([await createInitialBillWithNumber(activeCompany?.id)]);
          }
        } catch (error) {
          console.error("Error loading invoice:", error);
          setBills([await createInitialBillWithNumber(activeCompany?.id)]);
        }
      } else {
        setBills([await createInitialBillWithNumber(activeCompany?.id)]);
      }
    } catch (err) {
      console.error("Failed to load initial data", err);
      const initialBill = createInitialBill();
      initialBill.invoice_number = `INV-${Date.now()}`;
      setBills([initialBill]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddBill = async () => {
    if (bills.length < 5) {
      const newBill = await createInitialBillWithNumber(company?.id);
      setBills(prev => [...prev, newBill]);
      setActiveBillIndex(bills.length);
    }
  };

  const handleCloseBill = (index, e) => {
    e?.stopPropagation();
    if (bills.length > 1) {
      setBills(prev => prev.filter((_, i) => i !== index));
      setActiveBillIndex(prev => Math.max(0, index === prev ? prev - 1 : prev > index ? prev - 1 : prev));
    } else {
      const newBill = createInitialBill();
      newBill.invoice_number = `INV-${Date.now()}`;
      setBills([newBill]);
      setActiveBillIndex(0);
    }
  };

  const handleCustomerSelect = (customer) => {
    updateCurrentBill({
      customer_id: customer.id,
      customer_name: customer.name,
      customer_phone: customer.phone,
      state_of_supply: customer.state || company.state || 'Tamil Nadu',
    });
    setCustomerSearch("");
    setIsCustomerPopoverOpen(false);
  };

  const updateItem = (index, field, value) => {
    updateCurrentBill(bill => {
      const newItems = [...(bill.items || [])];
      const item = { ...(newItems[index] || {}) };
      item[field] = value;

      if (field === 'quantity' || field === 'rate') {
        const quantity = parseFloat(item.quantity) || 0;
        const rate = parseFloat(item.rate) || 0;
        item.amount = quantity * rate;
      }
      newItems[index] = item;
      return { ...bill, items: newItems };
    });
  };

  const addRow = () => {
    updateCurrentBill(bill => ({
      ...bill,
      items: [...(bill.items || []), { product_name: '', quantity: '', rate: '', amount: '' }]
    }));
  };

  const removeItem = (index) => {
    updateCurrentBill(bill => ({
      ...bill,
      items: (bill.items || []).filter((_, i) => i !== index)
    }));
  };

  const calculateTotals = (items = [], discountPercent = 0, adjustment = 0, roundOff = 0) => {
    const validItems = Array.isArray(items) ? items.filter(item => item && item.product_name && parseFloat(item.quantity || 0) > 0) : [];
    
    const subtotal = validItems.reduce((acc, item) => acc + (parseFloat(item.amount) || 0), 0);
    const discountAmount = subtotal * (parseFloat(discountPercent) / 100 || 0);
    const totalAfterDiscount = subtotal - discountAmount;
    
    const gstAmount = validItems.reduce((acc, item) => {
      const itemAmount = parseFloat(item.amount) || 0;
      const gstRate = parseFloat(item.gst_rate) || 0;
      return acc + (itemAmount * (gstRate / 100));
    }, 0);
    
    let totalAmount = totalAfterDiscount + gstAmount + (parseFloat(adjustment) || 0);

    let roundOffValue = 0;
    if (roundOff) {
        const roundedTotal = Math.round(totalAmount);
        roundOffValue = roundedTotal - totalAmount;
        totalAmount = roundedTotal;
    }

    return { subtotal, discountAmount, gstAmount, totalAmount, roundOffValue };
  };

  const totals = calculateTotals(currentBill.items, currentBill.discount_percent, currentBill.discount_amount, currentBill.round_off);

  const filteredCustomers = useMemo(() => {
    if (!customerSearch) return customers;
    return customers.filter(c =>
      c?.name?.toLowerCase().includes(customerSearch.toLowerCase()) ||
      c?.phone?.includes(customerSearch)
    );
  }, [customers, customerSearch]);

  const updatePaymentMethod = (index, field, value) => {
    updateCurrentBill(bill => {
        const newMethods = [...(bill.payment_methods || [])];
        newMethods[index] = { ...(newMethods[index] || {}), [field]: value };
        return { ...bill, payment_methods: newMethods };
    });
  };

  const addPaymentMethod = () => {
    updateCurrentBill(bill => ({
        ...bill,
        payment_methods: [...(bill.payment_methods || []), { method: 'Cash', amount: 0, reference_no: '', account_id: '' }]
    }));
  };

  const removePaymentMethod = (index) => {
    updateCurrentBill(bill => ({
        ...bill,
        payment_methods: (bill.payment_methods || []).filter((_, i) => i !== index)
    }));
  };

  const handleSave = async (andPrint = false) => {
    const finalTotals = calculateTotals(currentBill.items, currentBill.discount_percent, currentBill.adjustment, currentBill.round_off);
    
    const invoiceData = {
      ...currentBill,
      items: (currentBill.items || []).filter(item => item?.product_name && parseFloat(item?.quantity || 0) > 0),
      subtotal: finalTotals.subtotal,
      discount_amount: finalTotals.discountAmount,
      gst_amount: finalTotals.gstAmount,
      total_amount: finalTotals.totalAmount,
      round_off: finalTotals.roundOffValue,
      paid_amount: currentPaidAmount, // Use the dynamically calculated amount
      balance_amount: finalTotals.totalAmount - currentPaidAmount, // Use the dynamically calculated amount
      payment_status: currentPaidAmount >= finalTotals.totalAmount ? 'paid' : currentPaidAmount > 0 ? 'partial' : 'unpaid',
    };
    
    if (!invoiceData.customer_id) {
      alert("Please select a customer.");
      return;
    }
    if (invoiceData.items.length === 0) {
      alert("Please add at least one item.");
      return;
    }
    if (!invoiceData.invoice_number) {
      alert("Invoice number is required.");
      return;
    }

    setLoading(true);
    try {
      let savedInvoice;
      if (invoiceId) {
        savedInvoice = await SalesInvoice.update(invoiceId, invoiceData);
      } else {
        if (!invoiceData.invoice_number || invoiceData.invoice_number.startsWith('INV-')) {
          invoiceData.invoice_number = await generateNextInvoiceNumber(company?.id, 'sales_invoice');
        }
        savedInvoice = await SalesInvoice.create(invoiceData);
      }

      alert('Invoice saved successfully!');

      if (andPrint) {
          console.log("Printing invoice...", savedInvoice);
      }
      
      handleCloseBill(activeBillIndex);
      
    } catch (error) {
      console.error('Failed to save invoice:', error);
      alert('Error saving invoice. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // New functions for Link Payment
  const handleLinkPayment = () => {
    if (!currentBill.customer_id) {
      alert("Please select a customer first.");
      return;
    }
    if (currentPaidAmount <= 0) { // Use dynamically calculated amount
      alert("Please enter a payment amount first.");
      return;
    }
    setShowLinkPaymentDialog(true);
  };

  const handleLinkPaymentSubmit = (linkData) => {
    // Update the current bill with linked invoice data
    updateCurrentBill(bill => ({ 
      ...bill,
      linked_invoices: linkData.links,
      // discount_amount can be adjusted here if needed from linkData
    }));
    setShowLinkPaymentDialog(false);
  };


  if (loading && bills.length === 0) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-20">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link to={createPageUrl("Sales")} className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </Link>
              <h1 className="text-xl font-semibold text-gray-900 ml-4">
                {invoiceId ? 'Edit Invoice' : 'Create Sales Invoice'}
              </h1>
            </div>
            <div className="flex items-center space-x-4">
                {/* Add Link Payment Button */}
                <Button 
                  variant="outline" 
                  onClick={handleLinkPayment}
                  disabled={!currentBill.customer_id || currentPaidAmount <= 0} // Use calculated paid amount here
                  className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                >
                    <LinkIcon className="w-4 h-4 mr-2" />
                    Link Payment
                </Button>
                <Button variant="outline" onClick={() => handleSave(true)}>
                    <Printer className="w-4 h-4 mr-2" />
                    Save & Print
                </Button>
                <Button onClick={() => handleSave(false)} disabled={loading}>
                    {loading ? 'Saving...' : 'Save Invoice'}
                </Button>
            </div>
          </div>
          {bills.length > 0 && (
            <div className="flex border-t border-gray-200">
              {bills.map((bill, index) => (
                <button
                  key={bill?.id || index}
                  onClick={() => setActiveBillIndex(index)}
                  className={`px-4 py-3 text-sm font-medium flex items-center border-b-2 ${
                    activeBillIndex === index
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {bill?.customer_name || `Bill ${index + 1}`}
                  <X
                    className="w-4 h-4 ml-2 text-gray-400 hover:text-red-500"
                    onClick={(e) => handleCloseBill(index, e)}
                  />
                </button>
              ))}
              {bills.length < 5 && (
                <button
                  onClick={handleAddBill}
                  className="px-4 py-3 text-sm font-medium text-gray-500 hover:text-blue-600 flex items-center"
                >
                  <Plus className="w-4 h-4 mr-1" /> New Bill
                </button>
              )}
            </div>
          )}
        </div>
      </header>
      
      {/* Main Content */}
      <main className="max-w-screen-2xl mx-auto p-4 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Invoice Items */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-lg shadow">
            {/* Customer & Invoice Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              {/* Customer */}
              <div className="space-y-2">
                <Label>Customer *</Label>
                <Popover open={isCustomerPopoverOpen} onOpenChange={setIsCustomerPopoverOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={isCustomerPopoverOpen}
                      className="w-full justify-between font-normal"
                    >
                      <span className="truncate">{currentBill?.customer_name || "Select customer"}</span>
                      <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[400px] p-0">
                    <Command>
                      <CommandInput
                        placeholder="Search customer by name or phone..."
                        value={customerSearch}
                        onValueChange={setCustomerSearch}
                      />
                      <CommandList>
                        <CommandEmpty>No customer found.</CommandEmpty>
                        <CommandGroup>
                          {filteredCustomers.map((customer) => (
                            <CommandItem
                              key={customer.id}
                              onSelect={() => handleCustomerSelect(customer)}
                            >
                              <Check
                                className={`mr-2 h-4 w-4 ${
                                  currentBill?.customer_id === customer.id ? "opacity-100" : "opacity-0"
                                }`}
                              />
                              <div>
                                <p>{customer.name}</p>
                                <p className="text-xs text-gray-500">{customer.phone}</p>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Invoice Number */}
              <div className="space-y-2">
                <Label htmlFor="invoice_number">Invoice Number *</Label>
                <Input
                  id="invoice_number"
                  value={currentBill?.invoice_number || ''}
                  onChange={(e) => updateCurrentBill({ invoice_number: e.target.value })}
                />
              </div>

              {/* Invoice Date */}
              <div className="space-y-2">
                <Label>Invoice Date *</Label>
                <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {currentBill?.invoice_date ? format(new Date(currentBill.invoice_date), "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={currentBill?.invoice_date ? new Date(currentBill.invoice_date) : undefined}
                      onSelect={(date) => {
                        updateCurrentBill({ invoice_date: date });
                        setIsDatePickerOpen(false);
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Items Table */}
            <div className="overflow-x-auto -mx-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-6"></TableHead>
                    <TableHead className="min-w-[250px]">Item</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead>Rate</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead className="text-right w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(currentBill?.items || []).map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="text-gray-400">{index + 1}</TableCell>
                      <TableCell>
                        <Input
                          placeholder="Item name..."
                          value={item?.product_name || ''}
                          onChange={(e) => updateItem(index, 'product_name', e.target.value)}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={item?.quantity || ''}
                          onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                          className="w-20"
                        />
                      </TableCell>
                      <TableCell>
                        <Input value={item?.unit || ''} onChange={(e) => updateItem(index, 'unit', e.target.value)} className="w-20" />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={item?.rate || ''}
                          onChange={(e) => updateItem(index, 'rate', e.target.value)}
                          className="w-24"
                        />
                      </TableCell>
                      <TableCell className="font-medium text-right">₹{(item?.amount || 0).toFixed(2)}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" onClick={() => removeItem(index)}>
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="flex items-center justify-between mt-4">
              <div>
                <Button variant="outline" onClick={addRow}>
                  <Plus className="w-4 h-4 mr-2" /> Add Row
                </Button>
              </div>
              <Button variant="link" onClick={() => setShowItemSettings(!showItemSettings)}>
                <Settings className="w-4 h-4 mr-2" /> Item Settings
              </Button>
            </div>
          </div>
        </div>

        {/* Right Column - Totals & Payment */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-lg shadow space-y-4">
             <h3 className="text-lg font-semibold border-b pb-3 mb-4">Payment</h3>

             {(currentBill?.payment_methods || []).map((pm, index) => (
                <div key={index} className="grid grid-cols-2 gap-4 items-start">
                    <Select value={pm?.method || 'Cash'} onValueChange={(val) => updatePaymentMethod(index, 'method', val)}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Cash">Cash</SelectItem>
                            <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                            <SelectItem value="Cheque">Cheque</SelectItem>
                            <SelectItem value="UPI">UPI</SelectItem>
                            <SelectItem value="Card">Card</SelectItem>
                        </SelectContent>
                    </Select>
                    <Input placeholder="Amount" type="number" value={pm?.amount || ''} onChange={(e) => updatePaymentMethod(index, 'amount', e.target.value)} />
                    
                    {index > 0 && (
                        <div className="col-span-2 -mt-2">
                            <Button variant="link" size="sm" className="text-red-500" onClick={() => removePaymentMethod(index)}>Remove</Button>
                        </div>
                    )}
                </div>
            ))}
            
            <Button variant="outline" size="sm" onClick={addPaymentMethod}>Add Payment Method</Button>

            <div className="space-y-3 pt-4 border-t">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">₹{totals.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Discount</span>
                <div className="flex items-center w-28">
                  <Input
                    type="number"
                    value={currentBill?.discount_percent || ''}
                    onChange={(e) => updateCurrentBill({ discount_percent: e.target.value })}
                    className="h-8 text-right"
                    placeholder="%"
                  />
                </div>
              </div>
              <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">GST</span>
                  <span className="font-medium">₹{totals.gstAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Adjustment</span>
                <Input
                  type="number"
                  value={currentBill?.adjustment || ''}
                  onChange={(e) => updateCurrentBill({ adjustment: e.target.value })}
                  className="h-8 w-28 text-right"
                />
              </div>
              <div className="flex items-center justify-between text-sm">
                  <Label htmlFor="round-off" className="flex items-center space-x-2">
                    <Checkbox id="round-off" checked={currentBill?.round_off || false} onCheckedChange={(checked) => updateCurrentBill({ round_off: checked})} />
                    <span>Round Off</span>
                  </Label>
                  <span className="font-medium">₹{totals.roundOffValue.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center font-bold text-lg border-t pt-3">
                <span>Total</span>
                <span>₹{totals.totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-3">Notes</h3>
              <Textarea 
                placeholder="Add notes for this invoice..."
                value={currentBill?.notes || ''}
                onChange={(e) => updateCurrentBill({ notes: e.target.value })}
              />
          </div>
        </div>
      </main>

      {/* Add Link Payment Dialog */}
      {showLinkPaymentDialog && (
        <LinkPaymentDialog
          open={showLinkPaymentDialog}
          onClose={() => setShowLinkPaymentDialog(false)}
          onSubmit={handleLinkPaymentSubmit}
          customer={currentBill.customer_id ? { id: currentBill.customer_id, name: currentBill.customer_name } : null}
          paymentAmount={currentPaidAmount}
        />
      )}
    </div>
  );
}
