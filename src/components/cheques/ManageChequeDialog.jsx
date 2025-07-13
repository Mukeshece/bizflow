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
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { ChevronsUpDown } from "lucide-react";

export default function ManageChequeDialog({ open, onClose, onSubmit, cheque, parties }) {
  const [formData, setFormData] = useState({});
  const [partySearchOpen, setPartySearchOpen] = useState(false);

  useEffect(() => {
    if (cheque) {
      setFormData({
        ...cheque,
        issue_date: cheque.issue_date ? new Date(cheque.issue_date).toISOString().split('T')[0] : '',
        due_date: cheque.due_date ? new Date(cheque.due_date).toISOString().split('T')[0] : '',
      });
    } else {
      setFormData({
        type: 'Received',
        status: 'Pending',
        issue_date: new Date().toISOString().split('T')[0],
        due_date: new Date().toISOString().split('T')[0],
        amount: 0,
        cheque_number: '',
        party_id: '',
        party_name: '',
        bank_name: '',
        notes: ''
      });
    }
  }, [cheque, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePartySelect = (party) => {
    setFormData(prev => ({
        ...prev,
        party_id: party.id,
        party_name: party.name,
    }));
    setPartySearchOpen(false);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const dataToSubmit = {
      ...formData,
      amount: Number(formData.amount),
    };
    onSubmit(dataToSubmit);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{cheque ? 'Edit Cheque' : 'Add New Cheque'}</DialogTitle>
          <DialogDescription>
            {cheque ? 'Update the details for this cheque.' : 'Record a new cheque received or issued.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleFormSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Cheque Type</Label>
                    <Select value={formData.type} onValueChange={(v) => handleSelectChange('type', v)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Received">Received</SelectItem>
                            <SelectItem value="Issued">Issued</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label>Status</Label>
                    <Select value={formData.status} onValueChange={(v) => handleSelectChange('status', v)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Pending">Pending</SelectItem>
                            <SelectItem value="Deposited">Deposited</SelectItem>
                            <SelectItem value="Cleared">Cleared</SelectItem>
                            <SelectItem value="Bounced">Bounced</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
            
            <div className="space-y-2">
                <Label htmlFor="party_name">Party</Label>
                <Popover open={partySearchOpen} onOpenChange={setPartySearchOpen}>
                    <PopoverTrigger asChild>
                        <Button variant="outline" role="combobox" className="w-full justify-between font-normal">
                            {formData.party_name || "Select Party"}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[450px] p-0">
                        <Command>
                        <CommandInput placeholder="Search party..." />
                        <CommandList>
                            <CommandEmpty>No party found.</CommandEmpty>
                            <CommandGroup>
                            {parties.map((party) => (
                                <CommandItem key={party.id} onSelect={() => handlePartySelect(party)}>
                                    {party.name}
                                </CommandItem>
                            ))}
                            </CommandGroup>
                        </CommandList>
                        </Command>
                    </PopoverContent>
                </Popover>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cheque_number">Cheque Number</Label>
                <Input id="cheque_number" name="cheque_number" value={formData.cheque_number} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                  <Label htmlFor="amount">Amount</Label>
                  <Input id="amount" name="amount" type="number" value={formData.amount} onChange={handleChange} required />
              </div>
            </div>
            
            <div className="space-y-2">
                <Label htmlFor="bank_name">Bank Name</Label>
                <Input id="bank_name" name="bank_name" value={formData.bank_name} onChange={handleChange} placeholder="e.g., HDFC, ICICI Bank" />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="issue_date">Issue Date</Label>
                    <Input id="issue_date" name="issue_date" type="date" value={formData.issue_date} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="due_date">Due Date</Label>
                    <Input id="due_date" name="due_date" type="date" value={formData.due_date} onChange={handleChange} required/>
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea id="notes" name="notes" value={formData.notes} onChange={handleChange} placeholder="Optional notes about the cheque." />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit">{cheque ? 'Save Changes' : 'Add Cheque'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}