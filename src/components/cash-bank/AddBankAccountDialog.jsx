
import React, { useState, useEffect } from 'react';
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
import { Checkbox } from "@/components/ui/checkbox";

export default function AddBankAccountDialog({ open, onClose, onSubmit, account }) {
  const [formData, setFormData] = useState({
    account_type: 'bank',
    display_name: '',
    opening_balance: 0,
    current_balance: 0,
    as_of_date: new Date().toISOString().split('T')[0],
    print_upi_qr: false,
    print_bank_details: false,
    account_number: '',
    ifsc_code: '',
    upi_id: '',
    bank_name: '',
    account_holder_name: ''
  });

  useEffect(() => {
    if (account) {
      setFormData({
        ...account,
        as_of_date: account.as_of_date ? new Date(account.as_of_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      });
    } else {
      // Reset form when adding a new account
      setFormData({
        account_type: 'bank',
        display_name: '',
        opening_balance: 0,
        current_balance: 0,
        as_of_date: new Date().toISOString().split('T')[0],
        print_upi_qr: false,
        print_bank_details: false,
        account_number: '',
        ifsc_code: '',
        upi_id: '',
        bank_name: '',
        account_holder_name: ''
      });
    }
  }, [account, open]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const dataToSubmit = {
      ...formData,
      opening_balance: Number(formData.opening_balance),
      // If editing, don't override current_balance unless it's a new account
      current_balance: account ? formData.current_balance : Number(formData.opening_balance),
    };
    onSubmit(dataToSubmit);
  };

  const isBank = formData.account_type === 'bank';

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <style>{`
            [role='dialog'] > button.absolute {
                display: none;
            }
        `}</style>
        <DialogHeader>
          <DialogTitle>{account ? 'Edit Account' : 'Add New Account'}</DialogTitle>
          <DialogDescription>
            {account ? 'Update the details for this account.' : 'Add a new cash or bank account to manage transactions.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleFormSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="account_type" className="text-right">Type</Label>
              <div className="col-span-3">
                <Select
                  value={formData.account_type}
                  onValueChange={(value) => handleSelectChange('account_type', value)}
                  disabled={!!account} // Don't allow changing type for existing accounts
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bank">Bank Account</SelectItem>
                    <SelectItem value="cash">Cash Account</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="display_name" className="text-right">Display Name</Label>
              <Input
                id="display_name"
                name="display_name"
                value={formData.display_name}
                onChange={handleChange}
                className="col-span-3"
                required
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="opening_balance" className="text-right">Opening Balance</Label>
              <Input
                id="opening_balance"
                name="opening_balance"
                type="number"
                value={formData.opening_balance}
                onChange={handleChange}
                className="col-span-3"
                disabled={!!account} // Don't allow changing opening balance for existing accounts
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="as_of_date" className="text-right">As of Date</Label>
              <Input
                id="as_of_date"
                name="as_of_date"
                type="date"
                value={formData.as_of_date}
                onChange={handleChange}
                className="col-span-3"
                disabled={!!account}
              />
            </div>
            
            {isBank && (
              <>
                <hr className="col-span-4" />
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="bank_name" className="text-right">Bank Name</Label>
                  <Input id="bank_name" name="bank_name" value={formData.bank_name} onChange={handleChange} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="account_holder_name" className="text-right">Holder Name</Label>
                  <Input id="account_holder_name" name="account_holder_name" value={formData.account_holder_name} onChange={handleChange} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="account_number" className="text-right">Account No.</Label>
                  <Input id="account_number" name="account_number" value={formData.account_number} onChange={handleChange} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="ifsc_code" className="text-right">IFSC Code</Label>
                  <Input id="ifsc_code" name="ifsc_code" value={formData.ifsc_code} onChange={handleChange} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="upi_id" className="text-right">UPI ID</Label>
                  <Input id="upi_id" name="upi_id" value={formData.upi_id} onChange={handleChange} className="col-span-3" />
                </div>
                <hr className="col-span-4" />
                <div className="col-span-4 flex justify-around">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="print_bank_details" name="print_bank_details" checked={formData.print_bank_details} onCheckedChange={(checked) => handleSelectChange('print_bank_details', checked)} />
                    <Label htmlFor="print_bank_details">Print Bank Details on Invoice</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="print_upi_qr" name="print_upi_qr" checked={formData.print_upi_qr} onCheckedChange={(checked) => handleSelectChange('print_upi_qr', checked)} />
                    <Label htmlFor="print_upi_qr">Print UPI QR on Invoice</Label>
                  </div>
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit">{account ? 'Save Changes' : 'Create Account'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
