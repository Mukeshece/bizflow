
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge'; // Added
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'; // Added

import {
  Save,
  ArrowLeft,
  ChevronsUpDown,
  FileText,
  // Check, // Not used in the final version based on the outline
  // X, // Not used in the final version based on the outline
  // Settings, // Not used in the final version based on the outline
  Printer,
  Upload,
  Plus,
  Trash2,
  ArrowUp,
  Image,
  File,
  // Info, // Not used in the final version based on the outline
  // Calculator, // Not used in the final version based on the outline
  Wallet,
  Landmark,
  Receipt,
  Link as LinkIcon // Aliased to avoid conflict with react-router-dom's Link
} from "lucide-react";
import { PurchaseInvoice, Vendor, Product, Transaction, BankAccount, User, Company } from "@/api/entities";
import PurchaseItemTable from "../components/purchase/PurchaseItemTable";
import { generateNextInvoiceNumber } from '@/components/utils/invoiceNumberGenerator';
import LinkPaymentDialog from '../components/purchase/LinkPaymentDialog';

export default function CreatePurchaseInvoice() {
  const navigate = useNavigate();
  const location = useLocation();
  const editInvoiceId = new URLSearchParams(location.search).get("edit");
  const [isEditing, setIsEditing] = useState(!!editInvoiceId);
  const [invoiceData, setInvoiceData] = useState({
    invoice_number: '',
    vendor_id: "",
    vendor_name: "",
    vendor_phone: "",
    invoice_date: new Date().toISOString().split('T')[0],
    state_of_supply: "Tamil Nadu",
    items: [],
    payment_methods: [{ method: 'Cash', amount: 0, reference_no: '', account_id: '' }],
    subtotal: 0,
    discount_type: 'percentage',
    discount_value: 0,
    discount_amount: 0,
    tax_amount: 0,
    adjustment: 0,
    round_off: 0,
    total_amount: 0,
    paid_amount: 0,
    balance_amount: 0,
    payment_status: "unpaid",
    transport_name: "",
    lr_no: "",
    notes: "",
    linked_invoices: [], // Added this field
  });

  const [vendors, setVendors] = useState([]);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [vendorSearchOpen, setVendorSearchOpen] = useState(false);
  const [isRoundingEnabled, setIsRoundingEnabled] = useState(false);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [isCash, setIsCash] = useState(false);
  const [showLinkPaymentDialog, setShowLinkPaymentDialog] = useState(false);
  const [companies, setCompanies] = useState([]); // Stored for new invoice number generation
  const [user, setUser] = useState(null); // Stored for new invoice number generation

  const calculateTotals = useCallback((data) => {
    const subtotal = (data.items || []).reduce((sum, item) => sum + (item.total || 0), 0);
    
    let discountAmount = 0;
    if (data.discount_type === 'percentage') {
        discountAmount = subtotal * ((data.discount_value || 0) / 100);
    } else {
        discountAmount = data.discount_value || 0;
    }

    const taxableAmount = subtotal - discountAmount;
    const taxAmount = 0; // Assuming tax is 0 for now as per original code

    let total = taxableAmount + taxAmount + (data.adjustment || 0);
    
    let roundOff = 0;
    if (isRoundingEnabled) {
        const roundedTotal = Math.round(total);
        roundOff = roundedTotal - total;
        total = roundedTotal;
    }

    const paidAmount = (data.payment_methods || []).reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
    const balanceAmount = total - paidAmount;

    return {
        ...data,
        subtotal,
        discount_amount: discountAmount,
        tax_amount: taxAmount,
        total_amount: total,
        round_off: roundOff,
        paid_amount: paidAmount,
        balance_amount: balanceAmount,
        payment_status: paidAmount <= 0 ? "unpaid" : total > paidAmount ? "partial" : "paid"
    };
  }, [isRoundingEnabled]);

  const updateInvoice = (newData) => {
    setInvoiceData(prev => calculateTotals({ ...prev, ...newData }));
  };

  useEffect(() => {
    if (isCash) {
        // When cash is enabled, ensure a single cash payment method with the total amount
        updateInvoice({ payment_methods: [{ method: 'Cash', amount: invoiceData.total_amount, account_id: '', reference_no: '' }] });
    } else {
        // When switching from cash to non-cash, revert to a single cash payment method with amount 0,
        // or a more sophisticated approach would restore previous methods or prompt user.
        // For now, mirroring existing behavior of setting to zero.
        updateInvoice({ payment_methods: [{ method: 'Cash', amount: 0, reference_no: '', account_id: '' }] });
    }
  }, [isCash, invoiceData.total_amount]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [vendorsData, productsData, accountsData, userData, companiesData] = await Promise.all([
          Vendor.list(),
          Product.list(),
          BankAccount.list(),
          User.me(),
          Company.list()
        ]);
        setVendors(Array.isArray(vendorsData) ? vendorsData : []);
        setProducts(Array.isArray(productsData) ? productsData : []);
        setBankAccounts(Array.isArray(accountsData) ? accountsData : []);
        setUser(userData); // Store user data
        setCompanies(companiesData); // Store companies data

        if (!isEditing) {
          try {
            const activeCompany = companiesData?.find(c => c.id === userData?.active_company_id) || companiesData?.[0];
            
            if (activeCompany?.id) {
              const generatedNumber = await generateNextInvoiceNumber(activeCompany.id, 'purchase_invoice');
              setInvoiceData(prev => ({ ...prev, invoice_number: generatedNumber }));
            } else {
              setInvoiceData(prev => ({ ...prev, invoice_number: `BILL-${Date.now()}` }));
            }
          } catch (error) {
            console.error("Error generating invoice number:", error);
            setInvoiceData(prev => ({ ...prev, invoice_number: `BILL-${Date.now()}` }));
          }
        }

        if (isEditing && editInvoiceId) {
          const existingInvoice = await PurchaseInvoice.get(editInvoiceId);
          if (existingInvoice) {
            const vendor = (vendorsData || []).find(v => v.id === existingInvoice.vendor_id);
            setInvoiceData({ 
              ...existingInvoice, 
              items: Array.isArray(existingInvoice.items) ? existingInvoice.items.filter(Boolean) : [],
              payment_methods: Array.isArray(existingInvoice.payment_methods) && existingInvoice.payment_methods.length > 0 
                ? existingInvoice.payment_methods.map(p => ({ ...p, account_id: p.account_id || '' }))
                : [{ method: 'Cash', amount: 0, reference_no: '', account_id: '' }],
              vendor_phone: vendor?.phone || '',
              linked_invoices: Array.isArray(existingInvoice.linked_invoices) ? existingInvoice.linked_invoices : [],
            });
            if(existingInvoice.round_off) setIsRoundingEnabled(true);
            if (existingInvoice.payment_methods.length === 1 && 
                existingInvoice.payment_methods[0].method === 'Cash' &&
                existingInvoice.payment_methods[0].amount === existingInvoice.total_amount) {
                setIsCash(true);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [editInvoiceId, isEditing]);

  useEffect(() => {
    setInvoiceData(prev => calculateTotals(prev));
  }, [invoiceData.items, invoiceData.payment_methods, invoiceData.discount_value, invoiceData.discount_type, invoiceData.adjustment, isRoundingEnabled, calculateTotals]);

  const handleVendorSelect = (vendorId) => {
    const vendor = vendors.find(v => v.id === vendorId);
    if (vendor) {
      updateInvoice({
        vendor_id: vendor.id,
        vendor_name: vendor.name,
        vendor_phone: vendor.phone || ''
      });
      setVendorSearchOpen(false);
    }
  };

  const handleItemsChange = (newItems) => {
    updateInvoice({ items: newItems });
  };

  const handlePaymentChange = (index, field, value) => {
    const newPaymentMethods = [...invoiceData.payment_methods];
    newPaymentMethods[index][field] = value;
    updateInvoice({ payment_methods: newPaymentMethods });
  };
  
  const handlePaymentTypeChange = (index, value) => {
    const newPaymentMethods = [...invoiceData.payment_methods];
    const payment = { ...newPaymentMethods[index] };
    if (value === 'cash-generic') {
        payment.method = 'Cash'; payment.account_id = '';
    } else if (value === 'cheque-generic') {
        payment.method = 'Cheque'; payment.account_id = '';
    } else {
        const acc = bankAccounts.find(a => a.id === value);
        if (acc) { payment.method = acc.account_type === 'bank' ? 'Bank' : 'Cash'; payment.account_id = value; }
    }
    newPaymentMethods[index] = payment;
    updateInvoice({ payment_methods: newPaymentMethods });
  };

  const addPaymentMethod = () => {
    updateInvoice({ 
      payment_methods: [...invoiceData.payment_methods, { method: 'Cash', amount: 0, reference_no: '', account_id: '' }]
    });
  };

  const removePaymentMethod = (index) => {
    const newPaymentMethods = invoiceData.payment_methods.filter((_, i) => i !== index);
    if (newPaymentMethods.length === 0) {
      updateInvoice({ payment_methods: [{ method: 'Cash', amount: 0, reference_no: '', account_id: '' }] });
    } else {
      updateInvoice({ payment_methods: newPaymentMethods });
    }
  };
  
  const handleSave = async (saveAndNew = false) => { // Modified signature
    if (!invoiceData.vendor_id) {
        alert("Please select a Party.");
        return;
    }

    try {
      let oldInvoice = null;
      if (isEditing) {
          oldInvoice = await PurchaseInvoice.get(editInvoiceId);
      }

      const savedInvoice = isEditing
        ? await PurchaseInvoice.update(editInvoiceId, invoiceData).then(() => ({ id: editInvoiceId, ...invoiceData }))
        : await PurchaseInvoice.create(invoiceData);

      // Inventory and Vendor Payable Updates
      const oldItemsMap = new Map(oldInvoice?.items.map(i => [i.product_id, {qty: i.quantity, rate: i.rate}]) || []);
      const newItemsMap = new Map(savedInvoice.items.map(i => [i.product_id, {qty: i.quantity, rate: i.rate}]));
      const allProductIds = new Set([...oldItemsMap.keys(), ...newItemsMap.keys()]);

      for (const productId of allProductIds) {
          const product = await Product.get(productId);
          if (product) {
              const oldQty = oldItemsMap.get(productId)?.qty || 0;
              const newQty = newItemsMap.get(productId)?.qty || 0;
              const qtyChange = newQty - oldQty; 
              
              const newStock = (product.current_stock || 0) + qtyChange;
              const newPurchaseRate = newItemsMap.has(productId) ? newItemsMap.get(productId)?.rate : product.purchase_rate;
              
              await Product.update(productId, {
                  current_stock: newStock,
                  purchase_rate: newPurchaseRate
              });
          }
      }

      if (savedInvoice.vendor_id) {
          const vendor = await Vendor.get(savedInvoice.vendor_id);
          if (vendor) {
              const oldBalance = oldInvoice ? oldInvoice.balance_amount : 0; // oldBalance is 0 if new invoice
              const balanceChange = savedInvoice.balance_amount - oldBalance;
              const newPayable = (vendor.total_payable || 0) + balanceChange;
              await Vendor.update(savedInvoice.vendor_id, { total_payable: newPayable });
          }
      }
      
      // Transaction Reversal for existing invoice if editing
      if(isEditing) {
          const oldTransactions = await Transaction.filter({ reference_id: savedInvoice.id });
          for (const tx of oldTransactions) {
              const account = await BankAccount.get(tx.account_id);
              if (account) {
                  const newBalance = (account.current_balance || 0) + Math.abs(tx.amount); 
                  await BankAccount.update(account.id, { current_balance: newBalance });
              }
              await Transaction.delete(tx.id);
          }
      }

      // Create new transactions for current payments
      for (const payment of savedInvoice.payment_methods || []) {
          if (parseFloat(payment.amount) > 0) { 
              let targetAccountId = payment.account_id;
              
              if (!targetAccountId && (payment.method === 'Cash' || !payment.method)) {
                let cashAccount = bankAccounts.find(acc => acc.account_type === 'cash');
                
                if (!cashAccount) {
                  cashAccount = await BankAccount.create({
                    account_type: 'cash',
                    display_name: 'Cash In Hand',
                    current_balance: 0,
                    opening_balance: 0,
                    as_of_date: new Date().toISOString().split('T')[0]
                  });
                  // Update bankAccounts state with newly created cash account
                  setBankAccounts(prev => [...prev, cashAccount]);
                }
                targetAccountId = cashAccount.id;
              }

              if (targetAccountId) {
                  await Transaction.create({
                      transaction_type: 'purchase',
                      account_id: targetAccountId,
                      reference_id: savedInvoice.id,
                      reference_no: savedInvoice.invoice_number,
                      party_id: savedInvoice.vendor_id,
                      party_name: savedInvoice.vendor_name,
                      amount: -parseFloat(payment.amount), 
                      date: savedInvoice.invoice_date,
                      payment_method: payment.method || 'Cash',
                      description: `Payment made for Purchase ${savedInvoice.invoice_number}. Method: ${payment.method || 'Cash'}${payment.reference_no ? `, Ref: ${payment.reference_no}` : ''}`
                  });

                  const account = await BankAccount.get(targetAccountId);
                  if (account) {
                      const newBalance = (account.current_balance || 0) - parseFloat(payment.amount);
                      await BankAccount.update(account.id, { current_balance: newBalance });
                  }
              }
          }
      }

      // Handle Save & New or navigate
      if (saveAndNew) {
        const activeCompany = companies?.find(c => c.id === user?.active_company_id) || companies?.[0];
        let newInvoiceNumber = `BILL-${Date.now()}`;
        if (activeCompany?.id) {
            newInvoiceNumber = await generateNextInvoiceNumber(activeCompany.id, 'purchase_invoice');
        }
        setInvoiceData({
            invoice_number: newInvoiceNumber,
            vendor_id: "",
            vendor_name: "",
            vendor_phone: "",
            invoice_date: new Date().toISOString().split('T')[0],
            state_of_supply: "Tamil Nadu",
            items: [],
            payment_methods: [{ method: 'Cash', amount: 0, reference_no: '', account_id: '' }],
            subtotal: 0,
            discount_type: 'percentage',
            discount_value: 0,
            discount_amount: 0,
            tax_amount: 0,
            adjustment: 0,
            round_off: 0,
            total_amount: 0,
            paid_amount: 0,
            balance_amount: 0,
            payment_status: "unpaid",
            transport_name: "",
            lr_no: "",
            notes: "",
            linked_invoices: [],
        });
        setIsEditing(false); // Reset editing state
        setIsCash(false); // Reset cash payment state
        setIsRoundingEnabled(false); // Reset rounding state
        alert('Purchase invoice saved successfully! Ready for new invoice.');
      } else {
        navigate('/Purchase');
      }

    } catch (error) {
      console.error("Error saving purchase invoice:", error);
      alert('Failed to save purchase invoice. Please try again.');
    }
  };

  const handleDiscountValueChange = (value) => {
    updateInvoice({ discount_value: parseFloat(value) || 0 });
  };

  const handleDiscountTypeChange = (type) => {
    updateInvoice({ discount_type: type });
  };

  const createPageUrl = useCallback((pageRouteName) => {
    let path = '';
    if (pageRouteName === 'CreatePurchaseReturn') {
      path = '/purchase-return';
    } else {
      path = '/';
    }
    
    if (editInvoiceId) {
      return `${path}?edit=${editInvoiceId}`;
    }
    return path;
  }, [editInvoiceId]);

  const handleLinkPayment = () => {
    if (!invoiceData.vendor_id) {
      alert("Please select a vendor first");
      return;
    }
    // Calculate paidAmount dynamically to ensure it's up-to-date
    const currentPaidAmount = (invoiceData.payment_methods || []).reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
    if (currentPaidAmount <= 0) {
      alert("Please add payment amount first");
      return;
    }
    setShowLinkPaymentDialog(true);
  };

  const handleLinkPaymentSubmit = (linkData) => {
    updateInvoice({
      linked_invoices: linkData.links,
      discount_amount: linkData.discount || 0
    });
    setShowLinkPaymentDialog(false);
  };

  const paidAmount = (invoiceData.payment_methods || []).reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);

  if (isLoading) {
    return (
        <div className="flex justify-center items-center h-screen">
            <p className="text-xl text-gray-600">Loading...</p>
        </div>
    );
  }

  return (
    <div className="p-4 bg-slate-100 min-h-screen">
       <header className="bg-white p-3 rounded-lg shadow-sm mb-4 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/Purchase')}>
                <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-semibold text-slate-800">{isEditing ? 'Edit Purchase' : 'Create Purchase'}</h1>
            <Badge variant={isEditing ? "secondary" : "default"}>{isEditing ? 'Editing' : 'New'}</Badge>
        </div>
        
        <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleLinkPayment} disabled={!invoiceData.vendor_id || paidAmount <= 0}>
                <LinkIcon className="w-4 h-4 mr-2" /> Link Payment
            </Button>
            <Button variant="outline" onClick={() => handleSave(true)}>
                <Save className="w-4 h-4 mr-2" /> Save & New
            </Button>
            <Button onClick={() => handleSave(false)} className="bg-blue-600 hover:bg-blue-700">
                <Save className="w-4 h-4 mr-2" /> Save
            </Button>
        </div>
       </header>

       <main className="grid grid-cols-1 lg:grid-cols-3 gap-6"> {/* Changed to grid layout for main content + sidebar */}
            <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm space-y-8"> {/* Left/Main content area */}
                <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Party</Label>
                            <Popover open={vendorSearchOpen} onOpenChange={setVendorSearchOpen}>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" role="combobox" className="w-full justify-between font-normal">
                                        {invoiceData.vendor_name || "Select Party *"}
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[450px] p-0">
                                    <Command>
                                    <CommandInput placeholder="Search party..." />
                                    <CommandList>
                                        <CommandEmpty>No party found.</CommandEmpty>
                                        <div className="p-2 border-b">
                                            <Button variant="ghost" className="w-full justify-start text-blue-600 hover:text-blue-700">
                                                <Plus className="mr-2 h-4 w-4" /> Add Party
                                            </Button>
                                        </div>
                                        <CommandGroup>
                                        {vendors.map((vendor) => (
                                            <CommandItem key={vendor.id} onSelect={() => handleVendorSelect(vendor.id)}>
                                                <div className="flex justify-between w-full items-center">
                                                    <div>
                                                        <p className="font-medium">{vendor.name}</p>
                                                        <p className="text-xs text-slate-500">{vendor.phone}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-xs text-slate-500">Balance</p>
                                                        <div className="flex items-center gap-1 font-semibold text-sm">
                                                            {vendor.total_payable > 0 ? (
                                                                <>
                                                                    <span>{vendor.total_payable.toLocaleString()}</span>
                                                                    <ArrowUp className="w-4 h-4 text-red-500"/>
                                                                </>
                                                            ) : (
                                                                <span>0</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </CommandItem>
                                        ))}
                                        </CommandGroup>
                                    </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                        </div>
                        <div className="space-y-2">
                            <Label>Phone No.</Label>
                            <Input value={invoiceData.vendor_phone} readOnly disabled />
                        </div>
                    </div>
                    <div className="space-y-2 grid grid-cols-2 gap-4 border-l pl-6">
                        <div>
                            <Label>Bill Number</Label>
                            <Input value={invoiceData.invoice_number} onChange={e => updateInvoice({ invoice_number: e.target.value })}/>
                        </div>
                        <div>
                            <Label>Bill Date</Label>
                            <Input type="date" value={invoiceData.invoice_date} onChange={e => updateInvoice({ invoice_date: e.target.value })}/>
                        </div>
                        <div className="col-span-2">
                            <Label>State of supply</Label>
                            <Select value={invoiceData.state_of_supply} onValueChange={v => updateInvoice({ state_of_supply: v })}>
                                <SelectTrigger><SelectValue/></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Tamil Nadu">Tamil Nadu</SelectItem>
                                    <SelectItem value="Karnataka">Karnataka</SelectItem>
                                    <SelectItem value="Kerala">Kerala</SelectItem>
                                    <SelectItem value="Andhra Pradesh">Andhra Pradesh</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </section>
                
                <section>
                    <PurchaseItemTable
                        items={invoiceData.items}
                        products={products}
                        onItemsChange={handleItemsChange}
                    />
                </section>

                <section className="pt-6 border-t">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Transport Name</Label>
                            <Input placeholder="Enter transport" value={invoiceData.transport_name} onChange={e => updateInvoice({ transport_name: e.target.value })} />
                        </div>
                         <div className="space-y-2">
                            <Label>L R No</Label>
                            <Input placeholder="Enter L R No" value={invoiceData.lr_no} onChange={e => updateInvoice({ lr_no: e.target.value })} />
                        </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                        <Button variant="outline"><File className="w-4 h-4 mr-2"/>ADD DESCRIPTION</Button>
                        <Button variant="outline"><Image className="w-4 h-4 mr-2"/>ADD IMAGE</Button>
                        <Button variant="outline"><FileText className="w-4 h-4 mr-2"/>ADD DOCUMENT</Button>
                    </div>
                </section>
            </div>
            
            {/* RIGHT SIDEBAR */}
            <div className="lg:col-span-1 space-y-6"> {/* Right sidebar area */}
                <Card className="shadow-sm">
                    <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-lg flex items-center justify-between">
                            <span>Payment</span>
                            <div className="flex items-center space-x-2">
                                <Label htmlFor="cash-payment" className="text-sm font-medium">Cash</Label>
                                <Switch id="cash-payment" checked={isCash} onCheckedChange={setIsCash} />
                            </div>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                        {!isCash && (
                            <div className="space-y-3">
                                {invoiceData.payment_methods.map((payment, index) => (
                                    <div key={index} className="grid grid-cols-2 gap-2 items-end">
                                        <div className="flex-1">
                                            <Label className="text-xs">Payment Type</Label>
                                            <Select 
                                                value={payment.account_id || (payment.method === 'Cheque' ? 'cheque-generic' : 'cash-generic')} 
                                                onValueChange={(v) => handlePaymentTypeChange(index, v)} 
                                            >
                                                <SelectTrigger><SelectValue placeholder="Select Type"/></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="cash-generic"><div className="flex items-center gap-2"><Wallet className="w-4 h-4 text-green-600"/><span>Cash</span></div></SelectItem>
                                                    <SelectItem value="cheque-generic"><div className="flex items-center gap-2"><Receipt className="w-4 h-4 text-yellow-600"/><span>Cheque</span></div></SelectItem>
                                                    {bankAccounts.map(acc => <SelectItem key={acc.id} value={acc.id}><div className="flex items-center gap-2">{acc.account_type === 'bank' ? <Landmark className="w-4 h-4 text-blue-600"/>:<Wallet className="w-4 h-4 text-green-600"/>}<span>{acc.display_name}</span></div></SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="flex-1">
                                            <Label className="text-xs">Amount</Label>
                                            <Input 
                                                type="number" 
                                                placeholder="0" 
                                                value={payment.amount || ''} 
                                                onChange={e => handlePaymentChange(index, 'amount', parseFloat(e.target.value) || 0)} 
                                            />
                                        </div>
                                        {/* Reference No. field and Trash button moved to maintain better layout alignment */}
                                        {(payment.method === 'Cheque' || payment.method === 'Bank') ? (
                                            <div className="col-span-2">
                                                <Label className="text-xs">Reference No.</Label>
                                                <div className="flex items-center gap-2">
                                                    <Input 
                                                        type="text" 
                                                        placeholder="Cheque/Txn No."
                                                        value={payment.reference_no || ''} 
                                                        onChange={e => handlePaymentChange(index, 'reference_no', e.target.value)}
                                                    />
                                                    <Button variant="ghost" size="icon" onClick={() => removePaymentMethod(index)} disabled={invoiceData.payment_methods.length === 1}>
                                                        <Trash2 className="w-4 h-4 text-red-500"/>
                                                    </Button>
                                                </div>
                                            </div>
                                        ) : ( // Show trash button for cash/other if no reference no field
                                            <div className="col-span-2 flex justify-end">
                                                <Button variant="ghost" size="icon" onClick={() => removePaymentMethod(index)} disabled={invoiceData.payment_methods.length === 1}>
                                                    <Trash2 className="w-4 h-4 text-red-500"/>
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                                <Button variant="link" onClick={addPaymentMethod} className="p-0 h-auto text-blue-600">
                                    <Plus className="w-4 h-4 mr-1"/> Add Payment type
                                </Button>
                            </div>
                        )}
                        <div className="mt-4 text-right font-semibold">Total payment: ₹{paidAmount.toLocaleString(undefined, {minimumFractionDigits: 2})}</div>
                    </CardContent>
                </Card>

                <Card className="shadow-sm">
                    <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-lg">Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0 space-y-2">
                        <div className="flex justify-between items-center">
                            <Label>Subtotal</Label>
                            <span className="font-medium">₹{invoiceData.subtotal.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <Label>Discount</Label>
                            <div className="flex items-center gap-1">
                                <div className="flex items-center border rounded-md">
                                    <Button size="sm" variant={invoiceData.discount_type === 'percentage' ? 'secondary' : 'ghost'} className="rounded-r-none h-8" onClick={() => handleDiscountTypeChange('percentage')}>%</Button>
                                    <Button size="sm" variant={invoiceData.discount_type === 'fixed' ? 'secondary' : 'ghost'} className="rounded-l-none h-8 border-l" onClick={() => handleDiscountTypeChange('fixed')}>₹</Button>
                                </div>
                                <Input type="number" className="w-24 h-8" value={invoiceData.discount_value} onChange={(e) => handleDiscountValueChange(e.target.value)} />
                            </div>
                        </div>
                         <div className="flex justify-between items-center">
                            <Label>Tax</Label>
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-slate-500">NOVAT</span>
                                <span className="font-medium">₹{invoiceData.tax_amount.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                            </div>
                        </div>
                         <div className="flex justify-between items-center">
                            <Label>Adjustment</Label>
                             <Input type="number" className="w-24 h-8" value={invoiceData.adjustment} onChange={e => updateInvoice({ adjustment: parseFloat(e.target.value) || 0 })} />
                        </div>
                        <div className="flex justify-between items-center">
                            <div className="flex items-center space-x-2">
                               <Checkbox id="round-off" checked={isRoundingEnabled} onCheckedChange={setIsRoundingEnabled}/>
                               <Label htmlFor="round-off">Round Off</Label>
                            </div>
                            <span className="font-medium">{invoiceData.round_off.toFixed(2)}</span>
                        </div>
                        <div className="border-t pt-2 flex justify-between items-center font-bold text-lg">
                            <Label>Total</Label>
                            <span>₹{invoiceData.total_amount.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                        </div>
                    </CardContent>
                </Card>

                {/* Bill / Return Links - Moved from header to sidebar */}
                <div className="bg-white p-4 rounded-lg shadow-sm flex justify-between items-center">
                    <span className="font-medium text-blue-600">Bill</span>
                    <div className="h-4 w-px bg-slate-300"></div>
                    <Link to={createPageUrl('CreatePurchaseReturn')} className="font-medium text-slate-500 cursor-pointer hover:text-blue-600">Return</Link>
                </div>
            </div>
       </main>

       <footer className="bg-white p-3 mt-4 rounded-lg shadow-sm flex justify-between items-center sticky bottom-0">
            <Button variant="outline"><Upload className="w-4 h-4 mr-2" /> Upload Bill</Button>
            <div className="flex items-center gap-2">
                <Button variant="outline"><Printer className="w-4 h-4 mr-2" /> Print</Button>
            </div>
       </footer>

       <LinkPaymentDialog
         open={showLinkPaymentDialog}
         onClose={() => setShowLinkPaymentDialog(false)}
         onSubmit={handleLinkPaymentSubmit}
         vendor={invoiceData.vendor_id ? { id: invoiceData.vendor_id, name: invoiceData.vendor_name } : null}
         paymentAmount={paidAmount}
         type="purchase"
       />
    </div>
  );
}
