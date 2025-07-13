import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { PurchaseInvoice } from "@/api/entities";
import { format } from "date-fns";

export default function LinkPaymentDialog({ open, onClose, onSubmit, vendor, paymentAmount = 0, type = "purchase" }) {
  const [invoices, setInvoices] = useState([]);
  const [selectedLinks, setSelectedLinks] = useState([]);
  const [discount, setDiscount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open && vendor?.id) {
      loadInvoices();
    }
  }, [open, vendor]);

  const loadInvoices = async () => {
    setIsLoading(true);
    try {
      const invoicesData = await PurchaseInvoice.filter({ vendor_id: vendor.id });
      const unpaidInvoices = (invoicesData || []).filter(inv => 
        inv.payment_status !== 'paid' && inv.balance_amount > 0
      );
      setInvoices(unpaidInvoices);
    } catch (error) {
      console.error("Error loading invoices:", error);
      setInvoices([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInvoiceSelect = (invoice, isSelected) => {
    if (isSelected) {
      const remainingAmount = paymentAmount - selectedLinks.reduce((sum, link) => sum + link.amount, 0);
      const linkAmount = Math.min(remainingAmount, invoice.balance_amount);
      
      setSelectedLinks(prev => [...prev, {
        invoice_id: invoice.id,
        invoice_number: invoice.invoice_number,
        amount: linkAmount
      }]);
    } else {
      setSelectedLinks(prev => prev.filter(link => link.invoice_id !== invoice.id));
    }
  };

  const handleAmountChange = (invoiceId, newAmount) => {
    const amount = parseFloat(newAmount) || 0;
    setSelectedLinks(prev => prev.map(link => 
      link.invoice_id === invoiceId ? { ...link, amount } : link
    ));
  };

  const handleSubmit = () => {
    onSubmit({
      links: selectedLinks,
      discount: discount
    });
  };

  const totalLinked = selectedLinks.reduce((sum, link) => sum + link.amount, 0);
  const remainingAmount = paymentAmount - totalLinked - discount;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Link Payment to Purchase Bills</DialogTitle>
          <p className="text-sm text-gray-500">
            Select purchase bills to link this payment of ₹{paymentAmount.toLocaleString()}
          </p>
        </DialogHeader>

        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-8">Loading invoices...</div>
          ) : invoices.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No unpaid purchase bills found for this vendor.
            </div>
          ) : (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12"></TableHead>
                    <TableHead>Bill Number</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Total Amount</TableHead>
                    <TableHead>Balance</TableHead>
                    <TableHead>Payment Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((invoice) => {
                    const isSelected = selectedLinks.some(link => link.invoice_id === invoice.id);
                    const linkedAmount = selectedLinks.find(link => link.invoice_id === invoice.id)?.amount || 0;
                    
                    return (
                      <TableRow key={invoice.id}>
                        <TableCell>
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={(checked) => handleInvoiceSelect(invoice, checked)}
                          />
                        </TableCell>
                        <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
                        <TableCell>{format(new Date(invoice.invoice_date), "dd MMM yyyy")}</TableCell>
                        <TableCell>₹{invoice.total_amount?.toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-red-600">
                            ₹{invoice.balance_amount?.toLocaleString()}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {isSelected ? (
                            <Input
                              type="number"
                              value={linkedAmount}
                              onChange={(e) => handleAmountChange(invoice.id, e.target.value)}
                              max={Math.min(remainingAmount + linkedAmount, invoice.balance_amount)}
                              className="w-32"
                            />
                          ) : (
                            <span className="text-gray-400">₹0</span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <Label>Discount</Label>
              <Input
                type="number"
                value={discount}
                onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Payment Amount:</span>
                <span>₹{paymentAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Amount Linked:</span>
                <span>₹{totalLinked.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Discount:</span>
                <span>₹{discount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>Remaining:</span>
                <span className={remainingAmount < 0 ? "text-red-600" : ""}>
                  ₹{remainingAmount.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={selectedLinks.length === 0 || remainingAmount < 0}
          >
            Link Payment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}