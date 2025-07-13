
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from '@/components/ui/switch';
import { Calendar } from "@/components/ui/calendar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2, X, Settings, ChevronDown, Calendar as CalendarIcon, FileText, Image, Paperclip, Search, Landmark, Wallet, Receipt, Save, ArrowLeft, Calculator } from 'lucide-react';
import { format } from 'date-fns';
import { Expense, Vendor, BankAccount, Transaction } from "@/api/entities"; // Added Transaction import

export default function CreateExpense() {
  const navigate = useNavigate();
  const location = useLocation();

  const [expenseId, setExpenseId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    bill_date: new Date().toISOString().split('T')[0],
    expense_number: '',
    vendor_id: null,
    vendor_name: '',
    state_of_supply: '',
    category: 'Other',
    items: [{ item_name: '', quantity: 1, rate: 0, amount: 0 }],
    payment_methods: [{ method: 'Cash', account_id: 'cash', amount: 0, reference_no: '' }],
    subtotal: 0,
    discount_type: 'percentage',
    discount_value: 0,
    discount_amount: 0,
    tax_type: 'NONE',
    tax_percent: 0,
    tax_amount: 0,
    adjustment: 0,
    round_off: false,
    round_off_amount: 0,
    total_amount: 0,
    paid_amount: 0,
    balance_amount: 0,
    payment_status: 'unpaid',
    transport_name: '',
    lr_no: '',
    notes: '',
  });

  const [vendors, setVendors] = useState([]);
  const [accounts, setAccounts] = useState([]); // Represents BankAccount data
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [vendorSearch, setVendorSearch] = useState("");

  const categories = ["AKR_Transport", "Allowance", "Courier", "Cover", "Flower", "Golden_Transport", "House_Expense", "Iron", "Land_Expense", "Laxmi_Cargo", "Payment_in_Discount", "Petrol", "Rent", "Office_Supplies", "Travel", "Utilities", "Salaries", "Marketing", "Maintenance", "Other"];

  const loadInitialData = async () => {
    try {
      const [vendorsData, accountsData] = await Promise.all([
        Vendor.list(),
        BankAccount.list()
      ]);
      setVendors(Array.isArray(vendorsData) ? vendorsData : []);
      setAccounts(Array.isArray(accountsData) ? accountsData : []);
    } catch (error) {
      console.error("Error loading initial data:", error);
    }
  };

  const loadExpenseForEditing = async (id) => {
    try {
      const expense = await Expense.get(id);
      if (expense) {
        setFormData({
          ...expense,
          bill_date: expense.bill_date ? format(new Date(expense.bill_date), 'yyyy-MM-dd') : new Date().toISOString().split('T')[0],
          items: expense.items || [{ item_name: '', quantity: 1, rate: 0, amount: 0 }],
          payment_methods: expense.payment_methods || [{ method: 'Cash', account_id: 'cash', amount: 0, reference_no: '' }],
        });
        if (expense.vendor_id) {
          const vendor = vendors.find(v => v.id === expense.vendor_id);
          if (vendor) setSelectedVendor(vendor);
        }
      }
    } catch (error) {
      console.error("Failed to load expense for editing:", error);
    }
  };

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      await loadInitialData();
      const params = new URLSearchParams(location.search);
      const id = params.get('id');
      if (id) {
        setExpenseId(id);
        await loadExpenseForEditing(id);
      }
      setIsLoading(false);
    };
    init();
  }, [location.search, vendors.length]); // Re-run if vendors are loaded after initial mount

  const handleVendorSelect = (vendor) => {
    setSelectedVendor(vendor);
    setFormData(prev => ({
      ...prev,
      vendor_id: vendor.id,
      vendor_name: vendor.name,
      state_of_supply: vendor.address_state // Assuming state is part of address
    }));
    setVendorSearch("");
  };

  const handleInputChange = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;
    if (field === 'quantity' || field === 'rate') {
      newItems[index].amount = (newItems[index].quantity || 0) * (newItems[index].rate || 0);
    }
    handleInputChange('items', newItems);
  };

  const handleAddItem = () => {
    handleInputChange('items', [...formData.items, { item_name: '', quantity: 1, rate: 0, amount: 0 }]);
  };

  const handleRemoveItem = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    handleInputChange('items', newItems);
  };
  
  const handlePaymentChange = (index, field, value) => {
    const newPayments = [...formData.payment_methods];
    newPayments[index][field] = value;
    if (field === "account_id") {
      if (value === 'cash') {
        newPayments[index].method = 'Cash';
      } else if (value === 'cheque') {
        newPayments[index].method = 'Cheque';
      } else {
        const selectedAccount = accounts.find(acc => acc.id === value);
        newPayments[index].method = selectedAccount?.display_name || 'Bank';
      }
    }
    handleInputChange('payment_methods', newPayments);
  };

  const handleAddPayment = () => {
    handleInputChange('payment_methods', [...formData.payment_methods, { method: 'Cash', account_id: 'cash', amount: 0, reference_no: '' }]);
  };

  const handleRemovePayment = (index) => {
    const newPayments = formData.payment_methods.filter((_, i) => i !== index);
    handleInputChange('payment_methods', newPayments);
  };

  const calculateTotals = useCallback(() => {
    const subtotal = formData.items.reduce((sum, item) => sum + (item.amount || 0), 0);
    
    let discountAmount = 0;
    if (formData.discount_type === 'percentage') {
      discountAmount = subtotal * (formData.discount_value / 100);
    } else {
      discountAmount = formData.discount_value;
    }

    const totalAfterDiscount = subtotal - discountAmount;
    const taxAmount = totalAfterDiscount * (formData.tax_percent / 100);
    const totalAmount = totalAfterDiscount + taxAmount + (Number(formData.adjustment) || 0);
    const finalAmount = formData.round_off ? Math.round(totalAmount) : totalAmount;
    const roundOffAmount = finalAmount - totalAmount;

    const paidAmount = formData.payment_methods.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
    const balanceAmount = finalAmount - paidAmount;

    let paymentStatus = 'unpaid';
    if (balanceAmount <= 0) {
      paymentStatus = 'paid';
    } else if (paidAmount > 0 && balanceAmount > 0) {
      paymentStatus = 'partial';
    }

    setFormData(prev => ({
      ...prev,
      subtotal,
      discount_amount: discountAmount,
      tax_amount: taxAmount,
      total_amount: finalAmount,
      round_off_amount: roundOffAmount,
      paid_amount: paidAmount,
      balance_amount: balanceAmount,
      payment_status: paymentStatus,
    }));
  }, [formData.items, formData.discount_type, formData.discount_value, formData.tax_percent, formData.adjustment, formData.round_off, formData.payment_methods]);

  useEffect(() => {
    calculateTotals();
  }, [calculateTotals]);

  const handleSave = async () => {
    if (!formData.expense_number) {
      alert('Expense number is required.');
      return;
    }
    if (formData.items.length === 0 || !formData.items[0].item_name) {
      alert("Please add at least one expense item.");
      return;
    }

    try {
      const totalPaidAmount = (formData.payment_methods || []).reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);

      const expenseData = {
        ...formData,
        bill_date: formData.bill_date ? format(new Date(formData.bill_date), 'yyyy-MM-dd') : new Date().toISOString().split('T')[0],
        payment_status: totalPaidAmount >= formData.total_amount ? 'paid' : (totalPaidAmount > 0 ? 'partial' : 'unpaid'),
        paid_amount: totalPaidAmount,
        balance_amount: formData.total_amount - totalPaidAmount
      };

      let savedExpense;
      if (expenseId) {
        savedExpense = await Expense.update(expenseId, expenseData);
      } else {
        savedExpense = await Expense.create(expenseData);
      }

      // Handle payment transactions
      for (const payment of expenseData.payment_methods || []) {
        const paymentAmount = parseFloat(payment.amount);
        if (paymentAmount > 0) {
          let targetAccountId = payment.account_id;
          
          // If no specific account is selected or it's 'cash', find or create a cash account
          if (!targetAccountId || targetAccountId === 'cash') {
            let cashAccount = accounts.find(acc => acc.account_type === 'cash');
            
            if (!cashAccount) {
              cashAccount = await BankAccount.create({
                account_type: 'cash',
                display_name: 'Cash In Hand',
                current_balance: 0,
                opening_balance: 0,
                as_of_date: new Date().toISOString().split('T')[0]
              });
              setAccounts(prevAccounts => [...prevAccounts, cashAccount]); // Update local state with new account
            }
            targetAccountId = cashAccount.id;
          }

          // Create transaction record (negative amount for expense)
          await Transaction.create({
            transaction_type: 'expense',
            account_id: targetAccountId,
            reference_id: savedExpense.id,
            reference_number: savedExpense.expense_number,
            party_id: savedExpense.vendor_id,
            party_name: savedExpense.vendor_name || savedExpense.category,
            amount: -paymentAmount, // Negative amount for expense
            date: savedExpense.bill_date,
            payment_method: payment.method || 'Cash',
            description: `Expense payment for ${savedExpense.category}. Method: ${payment.method || 'Cash'}${payment.reference_no ? `, Ref: ${payment.reference_no}` : ''}`
          });

          // Update account balance
          if (targetAccountId) {
            // Find the account in current state, or fetch if necessary (e.g., if newly created and not in state yet)
            const accountToUpdate = accounts.find(acc => acc.id === targetAccountId);
            let currentBalance = accountToUpdate?.current_balance || 0;

            if (!accountToUpdate) {
                // If account not found in local state (e.g., it was just created), fetch it
                const fetchedAccount = await BankAccount.get(targetAccountId);
                if (fetchedAccount) {
                    currentBalance = fetchedAccount.current_balance || 0;
                }
            }

            const newBalance = currentBalance - paymentAmount;
            await BankAccount.update(targetAccountId, { current_balance: newBalance });
            
            // Update the local accounts state to reflect the new balance
            setAccounts(prevAccounts => prevAccounts.map(acc => 
              acc.id === targetAccountId ? { ...acc, current_balance: newBalance } : acc
            ));
          }
        }
      }

      navigate('/Expense'); // Use direct path as createPageUrl is not defined in this context
    } catch (error) {
      console.error('Failed to save expense:', error);
      alert('Failed to save expense. Please try again.');
    }
  };
  
  const paymentOptions = [
    { value: 'cash', label: 'Cash', icon: Wallet },
    { value: 'cheque', label: 'Cheque', icon: Receipt },
    ...accounts.map(acc => ({ 
      value: acc.id, 
      label: `${acc.display_name} (₹${acc.current_balance?.toLocaleString()})`, 
      icon: acc.account_type === 'bank' ? Landmark : Wallet 
    }))
  ];

  if (isLoading) {
    return <div className="p-6 text-center">Loading...</div>;
  }

  return (
    <div className="bg-slate-50 min-h-screen">
      <header className="bg-white p-4 border-b flex justify-between items-center shadow-sm sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/Expense')}>
            <X className="w-6 h-6" />
          </Button>
          <h1 className="text-xl font-semibold text-slate-800">{expenseId ? 'Edit Expense' : 'Create Expense'}</h1>
          <div className="flex items-center gap-2 ml-4">
            <Label htmlFor="gst-toggle" className="text-sm font-medium">GST</Label>
            <Switch id="gst-toggle" />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon"><Settings className="w-5 h-5" /></Button>
          <Button variant="ghost" size="icon"><Calculator className="w-5 h-5" /></Button>
          <Button variant="ghost" size="icon"><Paperclip className="w-5 h-5" /></Button>
        </div>
      </header>

      <main className="p-8">
        <div className="bg-white p-8 rounded-lg shadow-md">
          {/* Top section: Party and Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="space-y-4">
              <Popover>
                <PopoverTrigger asChild>
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by Name/Phone"
                      value={selectedVendor ? selectedVendor.name : vendorSearch}
                      onChange={(e) => setVendorSearch(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                  <Command>
                    <CommandInput placeholder="Search vendor..." />
                    <CommandList>
                      <CommandEmpty>No vendor found.</CommandEmpty>
                      <CommandGroup>
                        {vendors.filter(v => v.name.toLowerCase().includes(vendorSearch.toLowerCase())).map((vendor) => (
                          <CommandItem
                            key={vendor.id}
                            value={vendor.name}
                            onSelect={() => handleVendorSelect(vendor)}
                          >
                            {vendor.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>

              <div>
                <Label>Expense Category *</Label>
                <Select value={formData.category} onValueChange={(v) => handleInputChange('category', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => <SelectItem key={cat} value={cat}>{cat.replace(/_/g, ' ')}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-end gap-4">
                <div className="w-40">
                  <Label>Expense No</Label>
                  <Input value={formData.expense_number} onChange={e => handleInputChange('expense_number', e.target.value)} />
                </div>
                <div className="w-40">
                  <Label>Bill Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant={"outline"} className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.bill_date ? format(new Date(formData.bill_date), "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={new Date(formData.bill_date)}
                        onSelect={date => handleInputChange('bill_date', format(date, 'yyyy-MM-dd'))}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              <div className="flex justify-end">
                <div className="w-40">
                    <Label>State of supply</Label>
                    <Input value={formData.state_of_supply} onChange={e => handleInputChange('state_of_supply', e.target.value)} />
                </div>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="mb-8">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>ITEM</TableHead>
                  <TableHead className="w-32">QTY</TableHead>
                  <TableHead className="w-40">PRICE/UNIT</TableHead>
                  <TableHead className="w-40 text-right">AMOUNT</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {formData.items.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>
                      <Input 
                        placeholder="Enter item name" 
                        value={item.item_name}
                        onChange={e => handleItemChange(index, 'item_name', e.target.value)}
                      />
                    </TableCell>
                    <TableCell>
                      <Input 
                        type="number" 
                        value={item.quantity}
                        onChange={e => handleItemChange(index, 'quantity', e.target.value)}
                      />
                    </TableCell>
                    <TableCell>
                      <Input 
                        type="number" 
                        value={item.rate}
                        onChange={e => handleItemChange(index, 'rate', e.target.value)}
                      />
                    </TableCell>
                    <TableCell className="text-right">₹{item.amount.toFixed(2)}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => handleRemoveItem(index)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Button variant="link" onClick={handleAddItem} className="mt-2"><Plus className="w-4 h-4 mr-2" />Add Row</Button>
          </div>
          
          <div className="flex justify-between items-start">
             {/* Left side: Transport, Payment, Notes */}
             <div className="w-1/2 pr-8 space-y-4">
                <div className="flex gap-4">
                    <div className="flex-1"><Label>Transport Name</Label><Input value={formData.transport_name} onChange={e => handleInputChange('transport_name', e.target.value)} /></div>
                    <div className="flex-1"><Label>LR No</Label><Input value={formData.lr_no} onChange={e => handleInputChange('lr_no', e.target.value)}/></div>
                </div>

                <div>
                    {formData.payment_methods.map((payment, index) => (
                        <div key={index} className="flex gap-4 items-end mb-2">
                           <div className="flex-1">
                                <Label>Payment Type</Label>
                                <Select value={payment.account_id} onValueChange={(val) => handlePaymentChange(index, 'account_id', val)}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {paymentOptions.map(opt => (
                                            <SelectItem key={opt.value} value={opt.value}>
                                                <div className="flex items-center gap-2">
                                                   <opt.icon className="w-4 h-4" /> {opt.label}
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                           </div>
                           <div className="flex-1">
                                <Label>Amount</Label>
                                <Input type="number" value={payment.amount} onChange={(e) => handlePaymentChange(index, 'amount', e.target.value)} />
                           </div>
                           <Button variant="ghost" size="icon" onClick={() => handleRemovePayment(index)}><Trash2 className="w-4 h-4 text-red-500"/></Button>
                        </div>
                    ))}
                    <Button variant="link" onClick={handleAddPayment}><Plus className="w-4 h-4 mr-2" />Add Payment Type</Button>
                </div>
                
                <div>
                  <Label>Notes</Label>
                  <Textarea placeholder="Add any notes for this expense" value={formData.notes} onChange={e => handleInputChange('notes', e.target.value)}/>
                </div>
                
                <div className="flex gap-4">
                    <Button variant="outline"><Image className="w-4 h-4 mr-2"/>Add Image</Button>
                </div>
             </div>

             {/* Right side: Totals */}
             <div className="w-1/3 space-y-2">
                <div className="flex justify-between items-center">
                    <span className="text-sm">Subtotal</span>
                    <span className="text-sm font-medium">₹{formData.subtotal.toFixed(2)}</span>
                </div>
                 <div className="flex justify-between items-center">
                    <Label>Discount</Label>
                    <div className="flex items-center gap-1 w-1/2">
                        <Input type="number" className="text-right" value={formData.discount_value} onChange={e => handleInputChange('discount_value', e.target.value)} />
                        <Select value={formData.discount_type} onValueChange={val => handleInputChange('discount_type', val)}>
                            <SelectTrigger className="w-20"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="percentage">(%)</SelectItem>
                                <SelectItem value="fixed">(₹)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <div className="flex justify-between items-center">
                    <Label>Tax</Label>
                     <div className="flex items-center gap-1 w-1/2">
                        <Input className="text-right" value={formData.tax_amount.toFixed(2)} readOnly />
                        <Select value={formData.tax_type} onValueChange={val => handleInputChange('tax_type', val)}>
                            <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="NONE">NONE</SelectItem>
                                <SelectItem value="GST">GST</SelectItem>
                                <SelectItem value="IGST">IGST</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                 <div className="flex justify-between items-center">
                    <Label>Adjustment</Label>
                    <Input type="number" className="w-1/2 text-right" value={formData.adjustment} onChange={e => handleInputChange('adjustment', e.target.value)}/>
                </div>
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <Checkbox id="round_off" checked={formData.round_off} onCheckedChange={checked => handleInputChange('round_off', checked)} />
                        <Label htmlFor="round_off">Round Off</Label>
                    </div>
                    <Input className="w-1/2 text-right" value={formData.round_off_amount.toFixed(2)} readOnly/>
                </div>
                 <hr/>
                <div className="flex justify-between items-center font-bold text-lg">
                    <span>Total</span>
                    <span>₹{formData.total_amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                    <span>Paid</span>
                    <span className="text-green-600">₹{formData.paid_amount.toFixed(2)}</span>
                </div>
                 <div className="flex justify-between items-center text-sm">
                    <span>Balance</span>
                    <span className="text-red-600">₹{formData.balance_amount.toFixed(2)}</span>
                </div>
             </div>
          </div>
        </div>
      </main>

      <footer className="bg-white p-4 border-t flex justify-end items-center gap-4 sticky bottom-0">
         <Button variant="outline" className="w-32">Print</Button>
         <Button className="w-32" onClick={handleSave}><Save className="w-4 h-4 mr-2"/>{expenseId ? 'Update' : 'Save'}</Button>
      </footer>
    </div>
  );
}
