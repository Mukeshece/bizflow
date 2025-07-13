import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { Wallet, Landmark } from 'lucide-react';

export default function BankTransactionDialog({ open, onClose, onSubmit, transaction, accounts = [], cashAccounts = [] }) {
  const [transactionData, setTransactionData] = useState({
    transaction_type: 'deposit',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
    reference_number: '',
    account_id: ''
  });

  const isEditing = !!transaction;

  useEffect(() => {
    if (isEditing && transaction) {
      const displayAmount = Math.abs(transaction.amount);
      let type;
      if (transaction.transaction_type === 'balance_adjustment') {
          type = transaction.amount > 0 ? 'deposit' : 'withdrawal';
      } else {
          type = transaction.amount > 0 ? 'deposit' : 'withdrawal';
      }
      
      setTransactionData({
        transaction_type: type,
        amount: displayAmount,
        date: transaction.date ? new Date(transaction.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        description: transaction.description || '',
        reference_number: transaction.reference_number || '',
        account_id: transaction.account_id || '',
      });
    } else {
      setTransactionData({
        transaction_type: 'deposit',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        description: '',
        reference_number: '',
        account_id: '',
      });
    }
  }, [transaction, open, isEditing]);

  const handleInputChange = (name, value) => {
    setTransactionData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    let finalAmount = Number(transactionData.amount);
    if (['withdrawal', 'bank_transfer', 'expense'].includes(transactionData.transaction_type)) {
      finalAmount = -Math.abs(finalAmount);
    } else {
      finalAmount = Math.abs(finalAmount);
    }

    const dataToSubmit = {
      ...(isEditing ? transaction : {}),
      amount: finalAmount,
      date: transactionData.date,
      transaction_type: 'balance_adjustment',
      description: transactionData.description || `Manual ${transactionData.transaction_type.replace(/_/g, ' ')}`,
      reference_number: transactionData.reference_number,
      account_id: transactionData.account_id,
    };
    
    onSubmit(dataToSubmit);
  };

  const safeAccounts = Array.isArray(accounts) ? accounts : [];
  const safeCashAccounts = Array.isArray(cashAccounts) ? cashAccounts : [];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Transaction' : 'Add Transaction'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="account_id">Account</Label>
              <Select
                value={transactionData.account_id}
                onValueChange={(value) => handleInputChange('account_id', value)}
                disabled={isEditing} // Don't allow changing account when editing
              >
                <SelectTrigger id="account_id">
                  <SelectValue placeholder="Select Account" />
                </SelectTrigger>
                <SelectContent>
                  {safeCashAccounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      <div className="flex items-center gap-2">
                        <Wallet className="w-4 h-4 text-green-600" />
                        <span>{account.display_name}</span>
                      </div>
                    </SelectItem>
                  ))}
                  {safeAccounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      <div className="flex items-center gap-2">
                        <Landmark className="w-4 h-4 text-blue-600" />
                        <span>{account.display_name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="transaction_type">Transaction Type</Label>
              <Select 
                value={transactionData.transaction_type}
                onValueChange={(value) => handleInputChange('transaction_type', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="deposit">Deposit</SelectItem>
                  <SelectItem value="withdrawal">Withdrawal</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer (Out)</SelectItem>
                  <SelectItem value="expense">Bank Fee / Expense</SelectItem>
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
                value={transactionData.amount}
                onChange={(e) => handleInputChange(e.target.name, e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                name="date"
                type="date"
                value={transactionData.date}
                onChange={(e) => handleInputChange(e.target.name, e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="e.g., Cash Deposit, Bank Charges for June"
                value={transactionData.description}
                onChange={(e) => handleInputChange(e.target.name, e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="reference_number">Reference No. (Optional)</Label>
              <Input
                id="reference_number"
                name="reference_number"
                placeholder="e.g., Cheque No., Txn ID"
                value={transactionData.reference_number}
                onChange={(e) => handleInputChange(e.target.name, e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit">{isEditing ? 'Update Transaction' : 'Save Transaction'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}