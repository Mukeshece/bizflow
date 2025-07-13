import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export default function AdjustCashDialog({ open, onClose, onSubmit, cashAccounts }) {
  const [formData, setFormData] = useState({
    transaction_type: 'deposit', // deposit or withdrawal
    amount: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
    account_id: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!formData.account_id) {
        alert("Please select a cash account to adjust.");
        return;
    }
    
    let finalAmount = Number(formData.amount);
    if (formData.transaction_type === 'withdrawal') {
      finalAmount = -Math.abs(finalAmount);
    } else {
      finalAmount = Math.abs(finalAmount);
    }

    const dataToSubmit = {
      transaction_type: 'balance_adjustment',
      amount: finalAmount,
      date: formData.date,
      description: formData.description || `Manual Cash ${formData.transaction_type}`,
      account_id: formData.account_id
    };
    onSubmit(dataToSubmit);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Adjust Cash Balance</DialogTitle>
          <DialogDescription>
            Manually add or remove cash from one of your cash accounts.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleFormSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="account_id">Cash Account *</Label>
              <Select 
                value={formData.account_id}
                onValueChange={(value) => handleSelectChange('account_id', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a cash account" />
                </SelectTrigger>
                <SelectContent>
                  {cashAccounts.map(acc => (
                    <SelectItem key={acc.id} value={acc.id}>{acc.display_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="transaction_type">Adjustment Type</Label>
              <Select 
                value={formData.transaction_type}
                onValueChange={(value) => handleSelectChange('transaction_type', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="deposit">Add Cash (Deposit)</SelectItem>
                  <SelectItem value="withdrawal">Remove Cash (Withdrawal)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                placeholder="Enter amount"
                value={formData.amount}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                name="date"
                type="date"
                value={formData.date}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description / Reason</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="e.g., Opening cash float, Correction"
                value={formData.description}
                onChange={handleChange}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit">Adjust Balance</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}