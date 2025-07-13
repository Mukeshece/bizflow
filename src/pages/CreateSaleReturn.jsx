
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Save,
  ArrowLeft,
  FileText,
  Plus,
  Trash2,
  Link,
  HelpCircle,
  Calculator,
  Wallet,
  Landmark,
  Receipt
} from "lucide-react";
import { SaleReturn, Customer, SalesInvoice, BankAccount, Transaction } from "@/api/entities";
import LinkReturnDialog from "../components/sales/LinkReturnDialog";

export default function CreateSaleReturn() {
  const navigate = useNavigate();

  const [returnData, setReturnData] = useState({
    return_number: `SR-${Date.now()}`,
    customer_id: "",
    customer_name: "",
    return_date: new Date().toISOString().split('T')[0],
    reason: "customer_request",
    items: [{ product_name: "", quantity: 1, rate: 0, gst_rate: 18, discount: 0, total: 0 }],
    payment_methods: [{ method: 'Cash', amount: 0, reference_no: '', account_id: '' }],
    linked_invoices: [],
    subtotal: 0,
    discount_amount: 0,
    gst_amount: 0,
    adjustment: 0,
    round_off: 0,
    total_amount: 0,
    paid_amount: 0,
    balance_amount: 0,
    notes: ""
  });

  const [customers, setCustomers] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRoundingEnabled, setIsRoundingEnabled] = useState(false);
  const [showLinkPaymentDialog, setShowLinkPaymentDialog] = useState(false); // New state variable

  useEffect(() => {
    const loadData = async () => {
      try {
        const [customersData, invoicesData, accountsData] = await Promise.all([
          Customer.list(),
          SalesInvoice.list(),
          BankAccount.list()
        ]);

        setCustomers(Array.isArray(customersData) ? customersData : []);
        setInvoices(Array.isArray(invoicesData) ? invoicesData : []);
        setBankAccounts(Array.isArray(accountsData) ? accountsData : []);

        // Set default cash account for first payment method
        const cashAccount = (accountsData || []).find(a => a.account_type === 'cash');
        if (cashAccount) {
          setReturnData(prev => ({
            ...prev,
            payment_methods: [{ method: 'Cash', amount: 0, reference_no: '', account_id: cashAccount.id }]
          }));
        }
      } catch (error) {
        console.error("Error loading data:", error);
        setCustomers([]);
        setInvoices([]);
        setBankAccounts([]);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  // Calculate totals whenever items or other values change
  useEffect(() => {
    calculateTotals();
  }, [returnData.items, returnData.payment_methods, returnData.discount_amount, returnData.adjustment, isRoundingEnabled]);

  const calculateTotals = () => {
    const items = returnData.items || [];
    const subtotal = items.reduce((sum, item) => sum + (parseFloat(item.total) || 0), 0);

    const gstAmount = items.reduce((sum, item) => {
      const itemTotal = parseFloat(item.total) || 0;
      const gstRate = parseFloat(item.gst_rate) || 0;
      return sum + (itemTotal * (gstRate / (100 + gstRate)));
    }, 0);

    const discountAmount = parseFloat(returnData.discount_amount) || 0;
    const adjustment = parseFloat(returnData.adjustment) || 0;

    let totalAmount = subtotal - discountAmount + adjustment;

    let roundOffValue = 0;
    if (isRoundingEnabled) {
      const roundedTotal = Math.round(totalAmount);
      roundOffValue = roundedTotal - totalAmount;
      totalAmount = roundedTotal;
    }

    const paidAmount = (returnData.payment_methods || []).reduce((sum, pm) => sum + (parseFloat(pm.amount) || 0), 0);
    const balanceAmount = totalAmount - paidAmount;

    setReturnData(prev => ({
      ...prev,
      subtotal,
      gst_amount: gstAmount,
      total_amount: totalAmount,
      round_off: roundOffValue,
      paid_amount: paidAmount,
      balance_amount: balanceAmount
    }));
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...returnData.items];
    newItems[index] = { ...newItems[index], [field]: value };

    if (field === 'quantity' || field === 'rate' || field === 'discount' || field === 'gst_rate') {
      const quantity = parseFloat(newItems[index].quantity) || 0;
      const rate = parseFloat(newItems[index].rate) || 0;
      const discount = parseFloat(newItems[index].discount) || 0;
      const gstRate = parseFloat(newItems[index].gst_rate) || 0;

      const baseAmount = quantity * rate;
      const discountedAmount = baseAmount * (1 - discount / 100);
      const gstAmount = discountedAmount * (gstRate / 100);
      newItems[index].total = discountedAmount + gstAmount;
    }

    setReturnData({ ...returnData, items: newItems });
  };

  const addItem = () => {
    setReturnData({
      ...returnData,
      items: [...returnData.items, { product_name: "", quantity: 1, rate: 0, gst_rate: 18, discount: 0, total: 0 }]
    });
  };

  const removeItem = (index) => {
    if (returnData.items.length > 1) {
      const newItems = returnData.items.filter((_, i) => i !== index);
      setReturnData({ ...returnData, items: newItems });
    }
  };

  const handlePaymentChange = (index, field, value) => {
    const newPaymentMethods = [...returnData.payment_methods];
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

    setReturnData({ ...returnData, payment_methods: newPaymentMethods });
  };

  const addPaymentMethod = () => {
    const cashAccount = bankAccounts.find(acc => acc.account_type === 'cash');
    setReturnData({
      ...returnData,
      payment_methods: [...returnData.payment_methods, { method: 'Cash', amount: 0, reference_no: '', account_id: cashAccount?.id || '' }]
    });
  };

  const removePaymentMethod = (index) => {
    const newPaymentMethods = returnData.payment_methods.filter((_, i) => i !== index);
    setReturnData({ ...returnData, payment_methods: newPaymentMethods });
  };

  const handleLinkPayment = () => {
    if (!returnData.customer_id) {
      alert("Please select a customer first");
      return;
    }
    if (returnData.paid_amount <= 0) {
      alert("Please add payment amount first");
      return;
    }
    setShowLinkPaymentDialog(true);
  };

  const handleLinkPaymentSubmit = (linkData) => {
    setReturnData(prev => ({
      ...prev,
      linked_invoices: linkData.links,
      discount_amount: linkData.discount || 0
    }));
    setShowLinkPaymentDialog(false);
  };

  const handleSave = async () => {
    if (!returnData.customer_id) {
      alert("Please select a customer");
      return;
    }

    const validItems = returnData.items.filter(item => item.product_name.trim() !== "");
    if (validItems.length === 0) {
      alert("Please add at least one valid item");
      return;
    }

    try {
      const savedReturn = await SaleReturn.create({
        ...returnData,
        items: validItems
      });

      // Create transactions for each payment method
      for (const paymentMethod of returnData.payment_methods || []) {
        if (paymentMethod.amount > 0) {
          if (!paymentMethod.account_id) {
            alert(`Please select a bank account for the ${paymentMethod.method} payment.`);
            return;
          }

          // Positive amount for sale return (money going out to customer)
          await Transaction.create({
            transaction_type: 'sale_return',
            reference_id: savedReturn.id,
            reference_number: savedReturn.return_number,
            party_id: savedReturn.customer_id,
            party_name: savedReturn.customer_name,
            amount: -parseFloat(paymentMethod.amount), // Negative because money is going out
            date: savedReturn.return_date,
            account_id: paymentMethod.account_id,
            payment_method: paymentMethod.method,
            description: `Sale return refund to ${savedReturn.customer_name}`
          });

          // Update bank account balance
          const account = await BankAccount.get(paymentMethod.account_id);
          if (account) {
            await BankAccount.update(account.id, {
              current_balance: (account.current_balance || 0) - parseFloat(paymentMethod.amount)
            });
          }
        }
      }

      // Update linked invoices
      for (const link of returnData.linked_invoices) {
        const invoice = await SalesInvoice.get(link.invoice_id);
        if (invoice) {
          const newBalance = (invoice.balance_amount || 0) - link.applied_amount;
          await SalesInvoice.update(invoice.id, {
            balance_amount: newBalance,
            payment_status: newBalance <= 0 ? 'paid' : 'partial'
          });
        }
      }

      // Update customer balance
      const customer = await Customer.get(returnData.customer_id);
      if (customer) {
        await Customer.update(customer.id, {
          total_receivable: (customer.total_receivable || 0) - returnData.paid_amount
        });
      }

      navigate('/Sales?view=returns');
    } catch (error) {
      console.error("Error saving return:", error);
      alert("Failed to save return. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 min-h-screen">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-8">Loading...</div>
        </div>
      </div>
    );
  }

  const customerBalance = returnData.customer_id
    ? customers.find(c => c.id === returnData.customer_id)?.total_receivable || 0
    : 0;

  const hasPaymentAmount = returnData.paid_amount > 0;
  const canLinkPayment = returnData.customer_id && hasPaymentAmount;

  return (
    <div className="p-4 bg-slate-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" size="icon" onClick={() => navigate('/Sales?view=returns')}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold">Create Sale Return</h1>
          </div>
          {/* Add Link Payment Button */}
          <Button
            variant="outline"
            onClick={handleLinkPayment}
            disabled={!returnData.customer_id || returnData.paid_amount <= 0}
            className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
          >
              <Link className="w-4 h-4 mr-2" />
              Link Payment
          </Button>
        </div>

        <main className="bg-white p-6 rounded-lg shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            {/* Left side */}
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label>Customer *</Label>
                  {returnData.customer_name && <span className="text-sm">BAL: ₹{customerBalance.toLocaleString()}</span>}
                </div>
                <Select value={returnData.customer_id} onValueChange={(value) => {
                  const customer = customers.find(c => c.id === value);
                  setReturnData({
                    ...returnData,
                    customer_id: value,
                    customer_name: customer ? customer.name : ""
                  });
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map(customer => (
                      <SelectItem key={customer.id} value={customer.id}>
                        <div className="flex justify-between w-full">
                          <span>{customer.name}</span>
                          <span className="text-xs text-slate-500">
                            Bal: ₹{(customer.total_receivable || 0).toLocaleString()}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Items Table */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold">Return Items</h3>
                  <Button size="sm" onClick={addItem}>
                    <Plus className="w-4 h-4 mr-2" /> Add Item
                  </Button>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-8">#</TableHead>
                      <TableHead>Item</TableHead>
                      <TableHead>Qty</TableHead>
                      <TableHead>Rate</TableHead>
                      <TableHead>Disc%</TableHead>
                      <TableHead>GST%</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {returnData.items.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell className="text-gray-400">{index + 1}</TableCell>
                        <TableCell>
                          <Input
                            value={item.product_name}
                            onChange={(e) => handleItemChange(index, 'product_name', e.target.value)}
                            placeholder="Item name"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                            className="w-16"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={item.rate}
                            onChange={(e) => handleItemChange(index, 'rate', e.target.value)}
                            className="w-20"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={item.discount}
                            onChange={(e) => handleItemChange(index, 'discount', e.target.value)}
                            className="w-16"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={item.gst_rate}
                            onChange={(e) => handleItemChange(index, 'gst_rate', e.target.value)}
                            className="w-16"
                          />
                        </TableCell>
                        <TableCell className="text-right">₹{(item.total || 0).toFixed(2)}</TableCell>
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

              {/* Payment Methods */}
              <div className="border rounded-lg p-4 space-y-4">
                <h4 className="font-medium">Payment Methods</h4>
                {returnData.payment_methods.map((payment, index) => (
                  <div key={index} className="space-y-2">
                    <div className="grid grid-cols-12 gap-2 items-end">
                      <div className="col-span-5">
                        <Label className="text-xs font-normal">Payment Type</Label>
                        <Select value={payment.method} onValueChange={(v) => handlePaymentChange(index, 'method', v)}>
                          <SelectTrigger><SelectValue/></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Cash">
                              <div className="flex items-center gap-2">
                                <Wallet className="w-4 h-4 text-green-600"/>
                                <span>Cash</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="Cheque">
                              <div className="flex items-center gap-2">
                                <Receipt className="w-4 h-4 text-yellow-600"/>
                                <span>Cheque</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="Online">
                              <div className="flex items-center gap-2">
                                <Landmark className="w-4 h-4 text-blue-600"/>
                                <span>Online</span>
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="col-span-6">
                        <Label className="text-xs font-normal">Amount</Label>
                        <Input
                          type="number"
                          placeholder="0"
                          value={payment.amount}
                          onChange={e => handlePaymentChange(index, 'amount', parseFloat(e.target.value) || 0)}
                        />
                      </div>
                      <div className="col-span-1">
                        <Button variant="ghost" size="icon" onClick={() => removePaymentMethod(index)}>
                          <Trash2 className="w-4 h-4 text-red-500"/>
                        </Button>
                      </div>
                    </div>

                    {payment.method !== 'Cash' && (
                      <div className="space-y-1">
                        <Label className="text-xs font-normal">Bank Account</Label>
                        <Select value={payment.account_id} onValueChange={(v) => handlePaymentChange(index, 'account_id', v)}>
                          <SelectTrigger><SelectValue placeholder="Select Bank" /></SelectTrigger>
                          <SelectContent>
                            {bankAccounts.filter(acc => acc.account_type === 'bank').map(acc => (
                              <SelectItem key={acc.id} value={acc.id}>{acc.display_name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {payment.method !== 'Cash' && (
                      <div className="space-y-1">
                        <Label className="text-xs font-normal">Reference No.</Label>
                        <Input
                          value={payment.reference_no}
                          onChange={e => handlePaymentChange(index, 'reference_no', e.target.value)}
                          placeholder="Cheque No, Txn ID..."
                        />
                      </div>
                    )}
                  </div>
                ))}
                <Button variant="link" onClick={addPaymentMethod} className="p-0 h-auto text-blue-600">
                  <Plus className="w-4 h-4 mr-1"/> Add Payment type
                </Button>
              </div>
            </div>

            {/* Right side */}
            <div className="space-y-4 border-l pl-8">
              <div>
                <Label>Return No.</Label>
                <Input value={returnData.return_number} readOnly />
              </div>
              <div>
                <Label>Date</Label>
                <Input
                  type="date"
                  value={returnData.return_date}
                  onChange={e => setReturnData({...returnData, return_date: e.target.value})}
                />
              </div>
              <div>
                <Label>Reason</Label>
                <Select value={returnData.reason} onValueChange={(value) => setReturnData({...returnData, reason: value})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="defective">Defective Product</SelectItem>
                    <SelectItem value="wrong_item">Wrong Item</SelectItem>
                    <SelectItem value="customer_request">Customer Request</SelectItem>
                    <SelectItem value="quality_issue">Quality Issue</SelectItem>
                    <SelectItem value="price_adjustment">Price Adjustment</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="pt-8 space-y-4">
                <div className="flex justify-between items-center">
                  <Label>Subtotal</Label>
                  <span>₹{returnData.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <Label>GST</Label>
                  <span>₹{returnData.gst_amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <Label>Discount</Label>
                  <Input
                    className="w-32"
                    type="number"
                    value={returnData.discount_amount}
                    onChange={e => setReturnData({...returnData, discount_amount: parseFloat(e.target.value) || 0})}
                  />
                </div>
                <div className="flex justify-between items-center">
                  <Label>Adjustment</Label>
                  <Input
                    className="w-32"
                    type="number"
                    value={returnData.adjustment}
                    onChange={e => setReturnData({...returnData, adjustment: parseFloat(e.target.value) || 0})}
                  />
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="round-off"
                      checked={isRoundingEnabled}
                      onCheckedChange={setIsRoundingEnabled}
                    />
                    <Label htmlFor="round-off">Round Off</Label>
                  </div>
                  <span>₹{returnData.round_off.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center border-t pt-4 font-bold text-lg">
                  <Label>Total</Label>
                  <span>₹{returnData.total_amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <Label>Paid Amount</Label>
                  <span className="text-green-600">₹{returnData.paid_amount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          <footer className="mt-8 flex justify-end items-center gap-2">
            <Button variant="outline" onClick={() => navigate('/Sales?view=returns')}>
              Cancel
            </Button>
            <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
              <Save className="w-4 h-4 mr-2" />
              Save Return
            </Button>
          </footer>
        </main>
      </div>

      {showLinkPaymentDialog && (
        <LinkReturnDialog
          open={showLinkPaymentDialog}
          onClose={() => setShowLinkPaymentDialog(false)}
          onSubmit={handleLinkPaymentSubmit}
          customer={returnData.customer_id ? { id: returnData.customer_id, name: returnData.customer_name } : null}
          paymentAmount={returnData.paid_amount}
          initialDiscount={returnData.discount_amount}
          initialLinks={returnData.linked_invoices}
          customerInvoices={invoices.filter(inv => inv.customer_id === returnData.customer_id && inv.payment_status !== 'paid')}
        />
      )}
    </div>
  );
}
