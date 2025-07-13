import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { BankAccount } from '@/api/entities';

export default function CreateOtherIncomeDialog({ open, onClose, onSubmit, income }) {
    const [formData, setFormData] = useState({
        title: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        category: 'other',
        received_in_account_id: '',
        notes: ''
    });
    const [bankAccounts, setBankAccounts] = useState([]);

    useEffect(() => {
        const fetchBankAccounts = async () => {
            const accounts = await BankAccount.list();
            setBankAccounts(accounts);
            if (accounts.length > 0 && !income) {
                setFormData(prev => ({...prev, received_in_account_id: accounts[0].id}));
            }
        };
        fetchBankAccounts();
    }, [income]);

    useEffect(() => {
        if (income) {
            setFormData({
                title: income.title,
                amount: income.amount,
                date: new Date(income.date).toISOString().split('T')[0],
                category: income.category,
                received_in_account_id: income.received_in_account_id,
                notes: income.notes || ''
            });
        } else {
            setFormData({
                title: '',
                amount: '',
                date: new Date().toISOString().split('T')[0],
                category: 'other',
                received_in_account_id: bankAccounts[0]?.id || '',
                notes: ''
            });
        }
    }, [income, bankAccounts]);

    const handleChange = (field, value) => {
        setFormData(prev => ({...prev, [field]: value}));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({...formData, amount: parseFloat(formData.amount)});
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{income ? 'Edit' : 'Add'} Other Income</DialogTitle>
                    <DialogDescription>Record income from sources other than primary sales.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div>
                        <Label htmlFor="title">Income Title</Label>
                        <Input id="title" value={formData.title} onChange={e => handleChange('title', e.target.value)} required />
                    </div>
                    <div>
                        <Label htmlFor="amount">Amount</Label>
                        <Input id="amount" type="number" value={formData.amount} onChange={e => handleChange('amount', e.target.value)} required />
                    </div>
                    <div>
                        <Label htmlFor="date">Date</Label>
                        <Input id="date" type="date" value={formData.date} onChange={e => handleChange('date', e.target.value)} required />
                    </div>
                    <div>
                        <Label htmlFor="category">Category</Label>
                        <Select value={formData.category} onValueChange={v => handleChange('category', v)}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="interest_income">Interest Income</SelectItem>
                                <SelectItem value="rent_income">Rent Income</SelectItem>
                                <SelectItem value="commission">Commission</SelectItem>
                                <SelectItem value="dividend">Dividend</SelectItem>
                                <SelectItem value="asset_sale">Sale of Asset</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label htmlFor="account">Received in</Label>
                        <Select value={formData.received_in_account_id} onValueChange={v => handleChange('received_in_account_id', v)}>
                            <SelectTrigger><SelectValue placeholder="Select an account" /></SelectTrigger>
                            <SelectContent>
                                {bankAccounts.map(acc => (
                                    <SelectItem key={acc.id} value={acc.id}>{acc.display_name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label htmlFor="notes">Notes</Label>
                        <Textarea id="notes" value={formData.notes} onChange={e => handleChange('notes', e.target.value)} />
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                        <Button type="submit">Save Income</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}