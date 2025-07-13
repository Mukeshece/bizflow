
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export default function AdjustStockDialog({ open, onClose, onSubmit, product }) {
  const [adjustmentType, setAdjustmentType] = useState('add');
  const [quantity, setQuantity] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (!open) {
      setAdjustmentType('add');
      setQuantity('');
      setNotes('');
    }
  }, [open]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!quantity || quantity <= 0) {
      alert("Please enter a valid quantity.");
      return;
    }
    onSubmit({
      adjustment_type: adjustmentType,
      quantity: parseFloat(quantity),
      notes: notes,
    });
  };

  const currentStock = product?.current_stock || 0;
  const newStock =
    adjustmentType === 'add'
      ? currentStock + (parseFloat(quantity) || 0)
      : currentStock - (parseFloat(quantity) || 0);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <style>{`
            [role='dialog'] > button.absolute {
                display: none;
            }
        `}</style>
        <DialogHeader>
          <DialogTitle>Adjust Stock for {product?.name}</DialogTitle>
          <DialogDescription>
            Manually add or reduce stock quantity. This will affect inventory levels.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4 items-end">
            <div className="space-y-2">
                <Label>Current Stock</Label>
                <div className="p-2 border rounded-md bg-slate-100">{currentStock} {product?.unit}</div>
            </div>
            <div className="space-y-2">
                <Label>New Stock</Label>
                <div className={`p-2 border rounded-md font-bold ${newStock < 0 ? 'text-red-500 bg-red-100' : 'bg-slate-100'}`}>
                    {newStock} {product?.unit}
                </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="adjustment-type">Action</Label>
              <Select id="adjustment-type" value={adjustmentType} onValueChange={setAdjustmentType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="add">Add Stock (Stock In)</SelectItem>
                  <SelectItem value="reduce">Reduce Stock (Stock Out)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity to Adjust</Label>
              <Input
                id="quantity"
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="e.g., 10"
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Reason / Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g., Stock correction, received new shipment"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit">Adjust Stock</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
