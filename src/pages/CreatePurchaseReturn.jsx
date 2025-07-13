
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { PurchaseReturn, Vendor, PurchaseInvoice } from "@/api/entities";
import { Save, ArrowLeft, Check, ChevronsUpDown, Link } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Command, CommandInput, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command";
import LinkPaymentDialog from '../components/purchase/LinkPaymentDialog';

export default function CreatePurchaseReturn() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    return_number: `PR-${Date.now()}`,
    vendor_id: "",
    vendor_name: "",
    original_invoice_id: "",
    original_invoice_number: "",
    return_date: new Date().toISOString().split('T')[0],
    reason: "defective",
    items: [],
    total_amount: 0,
    credit_note_issued: false,
    linked_invoices: [], // New field
    discount_amount: 0,  // New field
  });
  const [vendors, setVendors] = useState([]);
  const [purchaseInvoices, setPurchaseInvoices] = useState([]);
  const [filteredInvoices, setFilteredInvoices] = useState([]);
  const [vendorSearchOpen, setVendorSearchOpen] = useState(false);
  const [showLinkPaymentDialog, setShowLinkPaymentDialog] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      const [vendorsData, invoicesData] = await Promise.all([
        Vendor.list(),
        PurchaseInvoice.list()
      ]);
      setVendors(vendorsData || []);
      setPurchaseInvoices(invoicesData || []);
    };
    loadData();
  }, []);

  const handleVendorSelect = (vendorId) => {
    const vendor = vendors.find(v => v.id === vendorId);
    if (vendor) {
      setFormData(p => ({
        ...p,
        vendor_id: vendor.id,
        vendor_name: vendor.name,
        original_invoice_id: "",
        original_invoice_number: "",
        items: [],
        total_amount: 0,
        linked_invoices: [], // Reset linked invoices on vendor change
        discount_amount: 0,  // Reset discount on vendor change
      }));
      setFilteredInvoices(purchaseInvoices.filter(inv => inv.vendor_id === vendorId));
      setVendorSearchOpen(false);
    }
  };

  const handleInvoiceSelect = (invoiceId) => {
    const invoice = purchaseInvoices.find(inv => inv.id === invoiceId);
    if (invoice) {
      setFormData(p => ({
        ...p,
        original_invoice_id: invoice.id,
        original_invoice_number: invoice.invoice_number,
        items: (invoice.items || []).map(item => ({...item, returned_quantity: item.quantity})),
        total_amount: invoice.total_amount,
        linked_invoices: [], // Reset linked invoices on invoice change
        discount_amount: 0,  // Reset discount on invoice change
      }));
    }
  };

  const calculateTotal = (items) => {
    return items.reduce((sum, item) => sum + ((item.returned_quantity || 0) * (item.rate || 0)), 0);
  }

  const handleItemQuantityChange = (index, quantity) => {
      const newItems = [...formData.items];
      const newQuantity = parseFloat(quantity) || 0;
      if (newQuantity >= 0 && newQuantity <= newItems[index].quantity) {
        newItems[index].returned_quantity = newQuantity;
        const newTotal = calculateTotal(newItems);
        setFormData(p => ({...p, items: newItems, total_amount: newTotal}));
      }
  }

  const handleSave = async () => {
    try {
      await PurchaseReturn.create(formData);
      navigate('/Purchase?view=returns');
    } catch (error) {
      console.error("Error saving purchase return:", error);
      alert("Error saving purchase return. Please check console for details.");
    }
  };

  const handleLinkPayment = () => {
    if (!formData.vendor_id) {
      alert("Please select a vendor first");
      return;
    }
    if (formData.total_amount <= 0) {
      alert("Please add items first or select an invoice with a positive amount.");
      return;
    }
    setShowLinkPaymentDialog(true);
  };

  const handleLinkPaymentSubmit = (linkData) => {
    setFormData(prev => ({
      ...prev,
      linked_invoices: linkData.links,
      discount_amount: linkData.discount || 0
    }));
    setShowLinkPaymentDialog(false);
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" size="icon" onClick={() => navigate('/Purchase?view=returns')}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-slate-900">Create Purchase Return</h1>
          </div>
          {/* Add Link Payment Button */}
          <Button
            variant="outline"
            onClick={handleLinkPayment}
            disabled={!formData.vendor_id || formData.total_amount <= 0}
            className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
          >
              <Link className="w-4 h-4 mr-2" />
              Link Payment
          </Button>
        </div>
        <Card>
          <CardHeader><CardTitle>Return Details</CardTitle></CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Vendor *</Label>
                <Popover open={vendorSearchOpen} onOpenChange={setVendorSearchOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" role="combobox" className="w-full justify-between">
                      {formData.vendor_name || "Select Vendor"}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                    <Command>
                      <CommandInput placeholder="Search vendor..." />
                      <CommandEmpty>No vendor found.</CommandEmpty>
                      <CommandGroup>
                        {(vendors || []).map(v => (
                          <CommandItem key={v.id} onSelect={() => handleVendorSelect(v.id)}>
                            <Check className={`mr-2 h-4 w-4 ${formData.vendor_id === v.id ? "opacity-100" : "opacity-0"}`} />
                            {v.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label>Original Purchase Bill *</Label>
                <Select
                    onValueChange={handleInvoiceSelect}
                    disabled={!formData.vendor_id}
                    value={formData.original_invoice_id}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Purchase Bill" />
                  </SelectTrigger>
                  <SelectContent>
                    {(filteredInvoices || []).map(inv => (
                      <SelectItem key={inv.id} value={inv.id}>
                        {inv.invoice_number} (₹{inv.total_amount})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
                <div className="space-y-2">
                    <Label>Return #</Label>
                    <Input value={formData.return_number} readOnly />
                </div>
                <div className="space-y-2">
                    <Label>Return Date</Label>
                    <Input type="date" value={formData.return_date} onChange={e => setFormData(p => ({...p, return_date: e.target.value}))} />
                </div>
                <div className="space-y-2">
                    <Label>Reason</Label>
                    <Select value={formData.reason} onValueChange={val => setFormData(p => ({...p, reason: val}))}>
                        <SelectTrigger><SelectValue/></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="defective">Defective</SelectItem>
                            <SelectItem value="wrong_item">Wrong Item</SelectItem>
                            <SelectItem value="quality_issue">Quality Issue</SelectItem>
                            <SelectItem value="excess_quantity">Excess Quantity</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <Separator />

            <div>
                <h3 className="mb-2 font-medium">Items to Return</h3>
                <div className="border rounded-md">
                    <table className="w-full text-sm">
                        <thead className="border-b bg-slate-50">
                            <tr className="divide-x">
                                <th className="p-2 text-left font-medium">Item</th>
                                <th className="p-2 text-right font-medium">Rate</th>
                                <th className="p-2 text-center font-medium">Original Qty</th>
                                <th className="p-2 text-center font-medium w-32">Return Qty</th>
                                <th className="p-2 text-right font-medium">Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {(formData.items || []).map((item, index) => (
                                <tr key={index} className="divide-x">
                                    <td className="p-2">{item.product_name}</td>
                                    <td className="p-2 text-right">₹{item.rate.toFixed(2)}</td>
                                    <td className="p-2 text-center">{item.quantity}</td>
                                    <td className="p-2 text-center">
                                        <Input
                                            type="number"
                                            className="w-24 h-8 text-center mx-auto"
                                            value={item.returned_quantity}
                                            max={item.quantity}
                                            min={0}
                                            onChange={e => handleItemQuantityChange(index, e.target.value)}
                                        />
                                    </td>
                                    <td className="p-2 text-right">₹{((item.returned_quantity || 0) * item.rate).toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="flex justify-end">
                <div className="w-80 space-y-2">
                    <div className="flex justify-between font-bold text-lg">
                        <span>Total Return Amount</span>
                        <span>₹{formData.total_amount.toFixed(2)}</span>
                    </div>
                    {formData.linked_invoices.length > 0 && (
                        <div className="text-sm text-right text-muted-foreground">
                            Linked to {formData.linked_invoices.length} {formData.linked_invoices.length === 1 ? 'bill' : 'bills'}
                            {formData.discount_amount > 0 && ` (Discount: ₹${formData.discount_amount.toFixed(2)})`}
                        </div>
                    )}
                </div>
            </div>

          </CardContent>
          <CardFooter className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => navigate('/Purchase?view=returns')}>Cancel</Button>
            <Button onClick={handleSave}>
              <Save className="w-4 h-4 mr-2" /> Save Return
            </Button>
          </CardFooter>
        </Card>

        {/* Add Link Payment Dialog */}
        <LinkPaymentDialog
          open={showLinkPaymentDialog}
          onClose={() => setShowLinkPaymentDialog(false)}
          onSubmit={handleLinkPaymentSubmit}
          vendor={formData.vendor_id ? { id: formData.vendor_id, name: formData.vendor_name } : null}
          paymentAmount={formData.total_amount}
          type="purchase" // Type of transaction being linked (e.g., 'purchase', 'sale')
        />
      </div>
    </div>
  );
}
