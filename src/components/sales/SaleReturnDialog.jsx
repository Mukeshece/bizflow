import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SaleReturn, Payment } from "@/api/entities";

export default function SaleReturnDialog({ open, onClose, onSubmit, originalInvoice }) {
  const [returnData, setReturnData] = useState({
    return_date: new Date().toISOString().split('T')[0],
    reason: 'customer_request',
    refund_method: 'cash',
    refund_status: 'pending',
    items: []
  });

  useEffect(() => {
    if (originalInvoice && open) {
      setReturnData(prev => ({
        ...prev,
        return_number: `RET-${Date.now()}`,
        original_invoice_id: originalInvoice.id,
        original_invoice_number: originalInvoice.invoice_number,
        customer_id: originalInvoice.customer_id,
        customer_name: originalInvoice.customer_name,
        items: originalInvoice.items?.map(item => ({
          ...item,
          returned_quantity: 0,
          total: 0
        })) || []
      }));
    }
  }, [originalInvoice, open]);

  const handleItemChange = (index, field, value) => {
    const newItems = [...returnData.items];
    newItems[index][field] = value;
    
    if (field === 'returned_quantity') {
      const item = newItems[index];
      const basePrice = item.returned_quantity * item.rate;
      const discountedPrice = basePrice * (1 - (item.discount || 0) / 100);
      const gstAmount = discountedPrice * ((item.gst_rate || 0) / 100);
      newItems[index].total = discountedPrice + gstAmount;
    }

    setReturnData(prev => ({ ...prev, items: newItems }));
  };

  const calculateTotals = () => {
    const subtotal = returnData.items.reduce((sum, item) => sum + (item.returned_quantity * item.rate), 0);
    const gst = returnData.items.reduce((sum, item) => sum + ((item.returned_quantity * item.rate * (1 - (item.discount || 0) / 100)) * ((item.gst_rate || 0) / 100)), 0);
    return { subtotal, gst_amount: gst, total_amount: subtotal + gst };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const totals = calculateTotals();
      const finalReturnData = { ...returnData, ...totals };
      
      await SaleReturn.create(finalReturnData);
      
      // Create refund payment record if cash refund
      if (finalReturnData.refund_method === 'cash') {
        await Payment.create({
          payment_number: `REF-${Date.now()}`,
          payment_type: 'payment_out',
          party_id: finalReturnData.customer_id,
          party_name: finalReturnData.customer_name,
          amount: finalReturnData.total_amount,
          payment_date: finalReturnData.return_date,
          payment_method: 'cash',
          reference_id: finalReturnData.original_invoice_id,
          reference_number: finalReturnData.original_invoice_number,
          notes: 'Sale return refund'
        });
      }
      
      onSubmit();
    } catch (error) {
      console.error("Error creating sale return:", error);
    }
  };

  const totals = calculateTotals();

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Sale Return</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Return Date</Label>
              <Input
                type="date"
                value={returnData.return_date}
                onChange={(e) => setReturnData(prev => ({ ...prev, return_date: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Reason</Label>
              <Select value={returnData.reason} onValueChange={(value) => setReturnData(prev => ({ ...prev, reason: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="defective">Defective</SelectItem>
                  <SelectItem value="wrong_item">Wrong Item</SelectItem>
                  <SelectItem value="customer_request">Customer Request</SelectItem>
                  <SelectItem value="quality_issue">Quality Issue</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">Return Items</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Original Qty</TableHead>
                  <TableHead>Return Qty</TableHead>
                  <TableHead>Rate</TableHead>
                  <TableHead>Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {returnData.items.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.product_name}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        max={item.quantity}
                        value={item.returned_quantity}
                        onChange={(e) => handleItemChange(index, 'returned_quantity', parseInt(e.target.value) || 0)}
                        className="w-20"
                      />
                    </TableCell>
                    <TableCell>₹{item.rate}</TableCell>
                    <TableCell>₹{item.total?.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Refund Method</Label>
              <Select value={returnData.refund_method} onValueChange={(value) => setReturnData(prev => ({ ...prev, refund_method: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="adjust_next_bill">Adjust in Next Bill</SelectItem>
                  <SelectItem value="store_credit">Store Credit</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="font-semibold">Total Refund Amount:</span>
              <span className="text-lg font-bold text-red-600">₹{totals.total_amount.toFixed(2)}</span>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              Process Return
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}