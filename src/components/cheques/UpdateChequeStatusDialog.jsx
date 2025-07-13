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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export default function UpdateChequeStatusDialog({ open, onClose, onSubmit, cheque }) {
  const [newStatus, setNewStatus] = useState('');

  useEffect(() => {
    if (cheque) {
      setNewStatus(cheque.status);
    }
  }, [cheque]);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (cheque && newStatus) {
      onSubmit(cheque, newStatus);
    }
  };

  if (!cheque) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Update Cheque Status</DialogTitle>
          <DialogDescription>
            Update the status for cheque #{cheque.cheque_number}.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleFormSubmit}>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
                <Label>Current Status</Label>
                <p className="font-semibold">{cheque.status}</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-status">New Status</Label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger id="new-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Deposited">Deposited</SelectItem>
                  <SelectItem value="Cleared">Cleared</SelectItem>
                  <SelectItem value="Bounced">Bounced</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit">Update Status</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}