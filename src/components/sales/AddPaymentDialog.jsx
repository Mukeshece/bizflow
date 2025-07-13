import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Payment, Customer, Vendor, SalesInvoice } from "@/api/entities";
import { Calculator, Settings, X, Plus, Camera, FileText, Trash2, HelpCircle } from 'lucide-react';
import LinkPaymentDialog from './LinkPaymentDialog';

export default function AddPaymentDialog({ open, onClose, onSubmit, paymentType = "payment_in" }) {
  const [formData, setFormData] = useState({});
  const [parties, setParties] = useState([]);
  const [showDescription, setShowDescription] = useState(false);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [partyBalance, setPartyBalance] = useState(0);

  const initializeForm = () => {
    const today = new Date().toISOString().split('T')[0];
    setFormData({
      party_id: '',
      party_name: '',
      payment_type: paymentType,
      payment_methods: [
        { method: 'cash', amount: '', reference_no: '' }
      ],
      total_amount: 0,
      payment_date: today,
      linked_invoices: [],
      notes: ''
    });
    setShowDescription(false);
  };
  
  useEffect(() => {
    if (open) {
      loadParties();
      initializeForm();
    }
  }, [open, paymentType]);

  useEffect(() => {
    const total = formData.payment_methods?.reduce((sum, method) => 
      sum + (parseFloat(method.amount) || 0), 0) || 0;
    setFormData(prev => ({...prev, total_amount: total }));
  }, [formData.payment_methods]);

  const loadParties = async () => {
    try {
      const data = paymentType === 'payment_in' ? await Customer.list() : await Vendor.list();
      setParties(data || []);
    } catch (error) {
      console.error("Error loading parties:", error);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePartySelect = async (partyId) => {
    const party = parties.find(p => p.id === partyId);
    if(party) {
      handleChange('party_id', partyId);
      handleChange('party_name', party.name);
      
      // Calculate party balance
      try {
        const invoices = await SalesInvoice.filter({ customer_id: partyId });
        const balance = invoices.reduce((sum, inv) => sum + (inv.balance_amount || 0), 0);
        setPartyBalance(balance);
      } catch (error) {
        console.error("Error calculating balance:", error);
      }
    }
  };

  const handlePaymentMethodChange = (index, field, value) => {
    const newMethods = [...(formData.payment_methods || [])];
    newMethods[index] = { ...newMethods[index], [field]: value };
    handleChange('payment_methods', newMethods);
  };

  const addPaymentMethod = () => {
    const newMethods = [...(formData.payment_methods || []), 
      { method: 'cash', amount: '', reference_no: '' }];
    handleChange('payment_methods', newMethods);
  };

  const removePaymentMethod = (index) => {
    if (formData.payment_methods?.length > 1) {
      const newMethods = formData.payment_methods.filter((_, i) => i !== index);
      handleChange('payment_methods', newMethods);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!formData.party_id) {
        alert("Please select a party.");
        return;
      }
      
      const paymentData = {
        ...formData,
        payment_number: `${paymentType === 'payment_in' ? 'RCPT' : 'PAY'}-${Date.now()}`
      };
      
      await Payment.create(paymentData);
      onSubmit();
    } catch (error) {
      console.error("Error creating payment:", error);
    }
  };

  const handleLinkPayment = (linkedInvoices) => {
    handleChange('linked_invoices', linkedInvoices);
    setShowLinkDialog(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl p-0 max-h-[90vh] overflow-y-auto">
          <DialogHeader className="flex flex-row items-center justify-between p-4 bg-gray-100 border-b">
            <DialogTitle className="text-lg font-semibold">
              {paymentType === 'payment_in' ? 'Payment-In' : 'Payment-Out'}
            </DialogTitle>
            <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon"><Calculator className="w-4 h-4" /></Button>
                <Button variant="ghost" size="icon"><Settings className="w-4 h-4" /></Button>
                <Button variant="ghost" size="icon" onClick={onClose}><X className="w-4 h-4" /></Button>
            </div>
          </DialogHeader>
          
          <form onSubmit={handleSubmit}>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                {/* Left Column */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="party" className="text-red-600">Party *</Label>
                    <Select onValueChange={handlePartySelect}>
                      <SelectTrigger id="party" className="border-gray-300">
                        <SelectValue placeholder="Select Party" />
                      </SelectTrigger>
                      <SelectContent>
                        {parties.map(party => (
                          <SelectItem key={party.id} value={party.id}>{party.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {partyBalance > 0 && (
                      <p className="text-sm text-green-600 font-medium">BAL: {partyBalance}</p>
                    )}
                  </div>

                  {/* Payment Methods */}
                  <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
                    {(formData.payment_methods || []).map((method, index) => (
                      <div key={index} className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Payment Type</Label>
                          <Select 
                            value={method.method} 
                            onValueChange={(value) => handlePaymentMethodChange(index, 'method', value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="cash">Cash</SelectItem>
                              <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                              <SelectItem value="upi">UPI</SelectItem>
                              <SelectItem value="card">Card</SelectItem>
                              <SelectItem value="cheque">Cheque</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label>Amount</Label>
                            {formData.payment_methods?.length > 1 && (
                              <Button 
                                type="button" 
                                variant="ghost" 
                                size="icon"
                                onClick={() => removePaymentMethod(index)}
                                className="h-6 w-6"
                              >
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </Button>
                            )}
                          </div>
                          <Input
                            type="number"
                            value={method.amount}
                            onChange={(e) => handlePaymentMethodChange(index, 'amount', e.target.value)}
                            placeholder="0"
                          />
                        </div>
                        {(method.method === 'cheque' || method.method === 'bank_transfer') && (
                          <div className="col-span-2 space-y-2">
                            <Label>Reference No.</Label>
                            <Input
                              value={method.reference_no}
                              onChange={(e) => handlePaymentMethodChange(index, 'reference_no', e.target.value)}
                              placeholder="Enter reference number"
                            />
                          </div>
                        )}
                      </div>
                    ))}
                    
                    <div className="flex items-center justify-between pt-2 border-t">
                      <Button type="button" variant="link" onClick={addPaymentMethod} className="text-blue-600 p-0">
                        <Plus className="w-4 h-4 mr-1" /> Add Payment type
                      </Button>
                      <p className="font-semibold">Total payment: {formData.total_amount}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <Button type="button" variant="outline" onClick={() => setShowDescription(!showDescription)}>
                      <FileText className="w-4 h-4 mr-2" /> ADD DESCRIPTION
                    </Button>
                    <Button type="button" variant="ghost" size="icon">
                      <Camera className="w-5 h-5" />
                    </Button>
                  </div>
                  
                  {showDescription && (
                    <Textarea 
                      placeholder="Enter description..."
                      value={formData.notes}
                      onChange={(e) => handleChange('notes', e.target.value)}
                    />
                  )}
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  <div className="flex justify-end items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Label>Receipt No</Label>
                      <Input 
                        value={`${paymentType === 'payment_in' ? 'RCPT' : 'PAY'}-${Date.now()}`} 
                        className="w-32" 
                        readOnly 
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Label>Date</Label>
                      <Input 
                        type="date"
                        value={formData.payment_date}
                        onChange={(e) => handleChange('payment_date', e.target.value)}
                        className="w-36"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <DialogFooter className="flex justify-between p-4 bg-gray-100 border-t">
              <div className="flex items-center gap-3">
                <Button 
                  type="button" 
                  className="bg-green-500 hover:bg-green-600 text-white"
                  onClick={() => setShowLinkDialog(true)}
                  disabled={!formData.party_id}
                >
                  LINK PAYMENT <HelpCircle className="w-4 h-4 ml-2" />
                </Button>
                <Button type="button" variant="outline">
                  PAYMENT HISTORY
                </Button>
              </div>
              <div className="flex items-center gap-3">
                <Button type="button" variant="outline">Print</Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">Save</Button>
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <LinkPaymentDialog
        open={showLinkDialog}
        onClose={() => setShowLinkDialog(false)}
        onSubmit={handleLinkPayment}
        partyId={formData.party_id}
        partyName={formData.party_name}
        paymentAmount={formData.total_amount}
        paymentType={paymentType}
      />
    </>
  );
}