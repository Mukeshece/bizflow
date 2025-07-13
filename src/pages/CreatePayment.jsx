
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import {
  Save,
  ChevronsUpDown,
  Plus,
  Trash2,
  ArrowUp,
  ChevronDown,
  Link,
  ArrowLeft // New import for header navigation
} from "lucide-react";
import { Payment, Customer, Vendor, Transaction, SalesInvoice, BankAccount } from "@/api/entities";
import LinkPaymentDialog from "../components/payments/LinkPaymentDialog";

export default function CreatePayment() {
    const navigate = useNavigate();
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const paymentType = searchParams.get('type') || 'payment_in';

    const [formData, setFormData] = useState({
        payment_type: paymentType,
        payment_number: `PAY-${Date.now()}`,
        party_id: '',
        party_name: '',
        party_phone: '',
        total_amount: 0,
        paid_amount: 0,
        discount: 0,
        payment_date: new Date().toISOString().split('T')[0],
        payment_methods: [{ method: 'Cash', amount: 0, reference_no: '', account_id: '' }],
        linked_invoices: []
    });
    const [parties, setParties] = useState([]);
    const [invoices, setInvoices] = useState([]);
    const [bankAccounts, setBankAccounts] = useState([]);
    const [partySearchOpen, setPartySearchOpen] = useState(false);
    const [showLinkPaymentDialog, setShowLinkPaymentDialog] = useState(false); // Renamed state variable
    const [isLoading, setIsLoading] = useState(false); // New state for loading indicator

    useEffect(() => {
        let isMounted = true; 

        const loadInitialData = async () => {
            try {
                const partyPromise = paymentType === 'payment_in' ? Customer.list() : Vendor.list();
                const invoicesPromise = paymentType === 'payment_in' ? SalesInvoice.list() : Promise.resolve([]); 
                const accountsPromise = BankAccount.list();
                const [partyData, invoicesData, accountsData] = await Promise.all([partyPromise, invoicesPromise, accountsPromise]);
                
                if (isMounted) {
                    setParties(partyData || []);
                    setInvoices(invoicesData || []);
                    setBankAccounts(accountsData || []);
                    
                    const cashAccount = (accountsData || []).find(a => a.account_type === 'cash');
                    
                    if (cashAccount) {
                        setFormData(prev => {
                            const newPaymentMethods = [...prev.payment_methods];
                            if (newPaymentMethods.length > 0) {
                                newPaymentMethods[0] = { 
                                    ...newPaymentMethods[0], 
                                    account_id: cashAccount.id 
                                };
                            }
                            return { ...prev, payment_methods: newPaymentMethods };
                        });
                    }
                }
            } catch (error) {
                console.error("Error loading initial data:", error);
            }
        };

        loadInitialData();

        return () => {
            isMounted = false; 
        };
    }, [paymentType]);
    
    useEffect(() => {
        const paidAmount = formData.payment_methods.reduce((sum, p) => sum + (p.amount || 0), 0);
        setFormData(prev => ({
            ...prev,
            paid_amount: paidAmount,
            total_amount: paidAmount + (prev.discount || 0)
        }));
    }, [formData.payment_methods, formData.discount]);

    const handlePartySelect = (partyId) => {
        const party = parties.find(p => p.id === partyId);
        if (party) {
            setFormData(p => ({
                ...p,
                party_id: party.id,
                party_name: party.name,
                party_phone: party.phone || ''
            }));
            setPartySearchOpen(false);
        }
    };

    const handlePaymentChange = (index, field, value) => {
        const newPaymentMethods = [...formData.payment_methods];
        newPaymentMethods[index][field] = value;

        if (field === 'method' && value === 'Cash') {
            const cashAccount = bankAccounts.find(acc => acc.account_type === 'cash');
            if (cashAccount) {
                newPaymentMethods[index]['account_id'] = cashAccount.id;
            }
        }
        
        if (field === 'method' && value !== 'Cash') {
            newPaymentMethods[index]['account_id'] = '';
        }

        const totalPaid = newPaymentMethods.reduce((sum, p) => sum + (p.amount || 0), 0);
        setFormData(prev => ({
            ...prev,
            payment_methods: newPaymentMethods,
            paid_amount: totalPaid,
            total_amount: totalPaid + prev.discount 
        }));
    };

    const addPaymentMethod = () => {
        const cashAccount = bankAccounts.find(acc => acc.account_type === 'cash');
        setFormData(prev => ({
            ...prev,
            payment_methods: [...prev.payment_methods, { method: 'Cash', amount: 0, reference_no: '', account_id: cashAccount?.id || '' }]
        }));
    };

    const removePaymentMethod = (index) => {
        const newPaymentMethods = formData.payment_methods.filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, payment_methods: newPaymentMethods }));
    };

    // New function to handle submission from LinkPaymentDialog
    const handleLinkPaymentSubmit = (linkedData) => {
        setFormData(prev => ({
            ...prev,
            linked_invoices: linkedData.links,
            discount: linkedData.discount || 0
        }));
        setShowLinkPaymentDialog(false);
    };

    // New function to open LinkPaymentDialog with validation
    const handleLinkPayment = () => {
        if (!formData.party_id) {
          alert("Please select a party first.");
          return;
        }
        if (formData.paid_amount <= 0) {
          alert("Please add a payment amount first.");
          return;
        }
        setShowLinkPaymentDialog(true);
    };

    const handleSave = async (andNew = false) => {
        if (isLoading) return;
        setIsLoading(true);
        try {
            // Basic validation
            if (!formData.party_id) {
                alert("Please select a party.");
                setIsLoading(false);
                return;
            }
            if (formData.paid_amount <= 0 && formData.discount <= 0) {
                alert("Please enter a payment amount or discount.");
                setIsLoading(false);
                return;
            }
            if (formData.payment_methods.some(pm => pm.amount > 0 && !pm.account_id)) {
                alert("Please select a bank account for all payment methods with an amount.");
                setIsLoading(false);
                return;
            }
            
            const newPayment = await Payment.create(formData);
            
            for (const paymentMethod of formData.payment_methods) {
                if (paymentMethod.amount > 0) {
                    const transactionAmount = formData.payment_type === 'payment_in'
                        ? paymentMethod.amount
                        : -paymentMethod.amount;

                    await Transaction.create({
                        transaction_type: formData.payment_type,
                        reference_id: newPayment.id,
                        reference_number: newPayment.payment_number,
                        party_id: newPayment.party_id,
                        party_name: newPayment.party_name,
                        amount: transactionAmount,
                        date: newPayment.payment_date,
                        account_id: paymentMethod.account_id,
                        payment_method: paymentMethod.method,
                        description: `Payment from/to ${newPayment.party_name}`
                    });

                    const account = await BankAccount.get(paymentMethod.account_id);
                    if (account) {
                        await BankAccount.update(account.id, {
                            current_balance: (account.current_balance || 0) + transactionAmount
                        });
                    }
                }
            }

            for (const link of formData.linked_invoices) {
                const invoice = await SalesInvoice.get(link.invoice_id);
                if (invoice) {
                    const newBalance = (invoice.balance_amount || 0) - link.applied_amount;
                    await SalesInvoice.update(invoice.id, {
                        paid_amount: (invoice.paid_amount || 0) + link.applied_amount,
                        balance_amount: newBalance,
                        payment_status: newBalance <= 0 ? 'paid' : 'partial'
                    });
                }
            }

            const partyEntity = formData.payment_type === 'payment_in' ? Customer : Vendor;
            const party = await partyEntity.get(formData.party_id);
            if(party) {
                if(formData.payment_type === 'payment_in') {
                    // Update receivable by the total amount settled (paid amount + discount)
                    await Customer.update(party.id, { total_receivable: (party.total_receivable || 0) - formData.total_amount });
                } else {
                    // Update payable by the total amount settled (paid amount + discount)
                    await Vendor.update(party.id, { total_payable: (party.total_payable || 0) - formData.total_amount });
                }
            }
            
            if (andNew) {
                const cashAccount = bankAccounts.find(a => a.account_type === 'cash');
                setFormData({
                    payment_type: paymentType,
                    payment_number: `PAY-${Date.now()}`,
                    party_id: '', party_name: '', party_phone: '',
                    total_amount: 0, paid_amount: 0, discount: 0,
                    payment_date: new Date().toISOString().split('T')[0],
                    payment_methods: [{ method: 'Cash', amount: 0, reference_no: '', account_id: cashAccount?.id || '' }],
                    linked_invoices: []
                });
            } else {
                navigate('/Payments?type=' + paymentType);
            }
        } catch (error) {
            console.error("Error saving payment:", error);
            alert(`Error saving payment: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    }

    const pageTitle = paymentType === 'payment_in' ? "Payment In" : "Payment Out";
    const pageDescription = paymentType === 'payment_in' ? "Record money received from customers" : "Record money paid to vendors";
    const partyLabel = paymentType === 'payment_in' ? "Customer" : "Party";
    const partyBalance = formData.party_id 
        ? (paymentType === 'payment_in' 
            ? parties.find(p => p.id === formData.party_id)?.total_receivable 
            : parties.find(p => p.id === formData.party_id)?.total_payable) || 0
        : 0;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate(-1)}
                            className="rounded-full hover:bg-gray-100"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">{pageTitle}</h1>
                            <p className="text-sm text-gray-500">{pageDescription}</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        {/* Link Payment Button */}
                        <Button 
                            variant="outline" 
                            onClick={handleLinkPayment}
                            disabled={!formData.party_id || formData.paid_amount <= 0}
                            className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                        >
                            <Link className="w-4 h-4 mr-2" />
                            Link Payment
                        </Button>
                        <Button
                            onClick={() => handleSave(false)}
                            disabled={isLoading}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            <Save className="w-4 h-4 mr-2" />
                            {isLoading ? 'Saving...' : 'Save Payment'}
                        </Button>
                    </div>
                </div>
            </div>
            
            <main className="bg-white p-6 rounded-lg shadow-sm m-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    {/* Left side */}
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <Label>{partyLabel} *</Label>
                                {formData.party_name && <span className="text-sm">BAL: {partyBalance.toLocaleString()}</span>}
                            </div>
                            <Popover open={partySearchOpen} onOpenChange={setPartySearchOpen}>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" role="combobox" className="w-full justify-between font-normal">
                                        {formData.party_name || `Search by Name/Phone *`}
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[400px] p-0">
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
                                        {parties.map((party) => (
                                            <CommandItem key={party.id} onSelect={() => handlePartySelect(party.id)}>
                                                <div className="flex justify-between w-full items-center">
                                                    <div>
                                                        <p className="font-medium">{party.name}</p>
                                                        <p className="text-xs text-slate-500">{party.phone}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-xs text-slate-500">Balance</p>
                                                        <div className="flex items-center gap-1 font-semibold text-sm">
                                                            {(party.total_receivable || party.total_payable) ? (
                                                                <>
                                                                    <span>
                                                                        {(paymentType === 'payment_in' ? party.total_receivable : party.total_payable)?.toLocaleString() || 0}
                                                                    </span>
                                                                    <ArrowUp className={`w-4 h-4 ${paymentType === 'payment_in' ? 'text-green-500' : 'text-red-500'}`}/>
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
                        
                        <div className="border rounded-lg p-4 space-y-4">
                            {formData.payment_methods.map((payment, index) => (
                                <div key={index} className="space-y-2">
                                    <div className="grid grid-cols-12 gap-2 items-end">
                                        <div className="col-span-5">
                                            <Label className="text-xs font-normal">Payment Type</Label>
                                            <Select value={payment.method} onValueChange={(v) => handlePaymentChange(index, 'method', v)}>
                                                <SelectTrigger><SelectValue/></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Cash">Cash</SelectItem>
                                                    <SelectItem value="Cheque">Cheque</SelectItem>
                                                    <SelectItem value="Online">Online</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="col-span-6">
                                            <Label className="text-xs font-normal">Amount</Label>
                                            <Input type="number" placeholder="0" value={payment.amount} onChange={e => handlePaymentChange(index, 'amount', parseFloat(e.target.value) || 0)} />
                                        </div>
                                        <div className="col-span-1">
                                            <Button variant="ghost" size="icon" onClick={() => removePaymentMethod(index)}><Trash2 className="w-4 h-4 text-red-500"/></Button>
                                        </div>
                                    </div>
                                    
                                    {payment.method !== 'Cash' && (
                                        <div className="space-y-1">
                                            <Label className="text-xs font-normal">Bank Account</Label>
                                            <Select value={payment.account_id} onValueChange={(v) => handlePaymentChange(index, 'account_id', v)}>
                                                <SelectTrigger><SelectValue placeholder="Select Bank" /></SelectTrigger>
                                                <SelectContent>
                                                    {(bankAccounts || []).filter(acc => acc.account_type === 'bank').map(acc => (
                                                        <SelectItem key={acc.id} value={acc.id}>{acc.display_name}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}

                                    {payment.method !== 'Cash' && (
                                        <div className="space-y-1">
                                            <Label className="text-xs font-normal">Reference No.</Label>
                                            <Input value={payment.reference_no} onChange={e => handlePaymentChange(index, 'reference_no', e.target.value)} placeholder="Cheque No, Txn ID..."/>
                                        </div>
                                    )}
                                </div>
                            ))}
                            <Button variant="link" onClick={addPaymentMethod} className="p-0 h-auto text-blue-600"><Plus className="w-4 h-4 mr-1"/> Add Payment type</Button>
                        </div>

                        <div>
                            <Button variant="outline" className="w-full justify-start"><Plus className="w-4 h-4 mr-2"/>ADD DESCRIPTION</Button>
                        </div>
                         <div>
                            <Button variant="outline" className="w-full justify-start"><Plus className="w-4 h-4 mr-2"/>ADD IMAGE</Button>
                        </div>
                    </div>
                    {/* Right side */}
                    <div className="space-y-4 border-l pl-8">
                        <div>
                            <Label>Receipt No.</Label>
                            <Input value={formData.payment_number} readOnly />
                        </div>
                        <div>
                            <Label>Date</Label>
                            <Input type="date" value={formData.payment_date} onChange={e => setFormData(p => ({...p, payment_date: e.target.value}))}/>
                        </div>

                        <div className="pt-20 space-y-4">
                            <div className="flex justify-between items-center">
                                <Label>Received</Label>
                                <Input className="w-40" value={formData.paid_amount.toFixed(2)} readOnly/>
                            </div>
                             <div className="flex justify-between items-center">
                                <Label>Discount</Label>
                                <Input 
                                    className="w-40" 
                                    type="number" 
                                    value={formData.discount} 
                                    onChange={e => setFormData(p => ({...p, discount: parseFloat(e.target.value) || 0}))}
                                />
                            </div>
                             <div className="flex justify-between items-center border-t pt-4 font-bold text-lg">
                                <Label>Total</Label>
                                <span>₹ {formData.total_amount.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <footer className="mt-8 flex justify-between items-center gap-2 justify-end"> {/* Adjusted footer alignment */}
                    <div className="flex items-center gap-2">
                         <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline">Print <ChevronDown className="w-4 h-4 ml-2"/></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem>Share</DropdownMenuItem>
                                <DropdownMenuItem>Print</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <Button onClick={() => handleSave(true)} disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
                            Save & New
                        </Button>
                    </div>
                </footer>
            </main>
            {showLinkPaymentDialog && (
                <LinkPaymentDialog
                    open={showLinkPaymentDialog}
                    onClose={() => setShowLinkPaymentDialog(false)}
                    onSubmit={handleLinkPaymentSubmit}
                    party={formData.party_id ? { id: formData.party_id, name: formData.party_name } : null}
                    paymentAmount={formData.paid_amount}
                    initialDiscount={formData.discount}
                    initialLinks={formData.linked_invoices}
                    partyInvoices={invoices.filter(inv => inv.customer_id === formData.party_id && inv.payment_status !== 'paid')}
                    type={formData.payment_type}
                />
            )}
        </div>
    );
}
