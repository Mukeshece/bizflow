
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { X, RotateCcw, Search, Edit2 } from 'lucide-react';
import { SalesInvoice, PurchaseInvoice } from "@/api/entities";
import { format } from 'date-fns';

export default function LinkPaymentDialog({ 
  open, 
  onClose, 
  onSubmit, 
  partyId, 
  partyName, 
  paymentAmount, 
  paymentType 
}) {
  const [invoices, setInvoices] = useState([]);
  const [linkedInvoices, setLinkedInvoices] = useState([]);
  const [receivedAmount, setReceivedAmount] = useState(paymentAmount || 0);
  const [discountGiven, setDiscountGiven] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    if (open && partyId) {
      loadInvoices();
    }
  }, [open, partyId]);

  useEffect(() => {
    setReceivedAmount(paymentAmount || 0);
  }, [paymentAmount]);

  const loadInvoices = async () => {
    try {
      let data = [];
      if (paymentType === 'payment_in') {
        data = await SalesInvoice.filter({ customer_id: partyId });
      } else {
        data = await PurchaseInvoice.filter({ vendor_id: partyId });
      }
      
      // Add opening balance entry
      const openingBalance = {
        id: 'opening_balance',
        invoice_number: '',
        invoice_date: '2025-05-19', // Changed date format here
        type: 'Receivable Opening Balance',
        total_amount: 2960,
        balance_amount: 2860
      };
      
      const transformedData = (data || []).map(inv => ({
        ...inv,
        type: paymentType === 'payment_in' ? 'Sale' : 'Purchase',
        balance_amount: inv.balance_amount || inv.total_amount
      }));
      
      setInvoices([openingBalance, ...transformedData]);
    } catch (error) {
      console.error("Error loading invoices:", error);
    }
  };

  const handleInvoiceSelect = (invoice, isSelected) => {
    if (isSelected) {
      // Ensure the linked amount doesn't exceed the invoice balance or remaining payment amount
      const currentTotalLinked = getTotalLinkedAmount();
      const remainingPayment = receivedAmount - discountGiven - currentTotalLinked;
      
      // Calculate the maximum linkable amount for this invoice
      // It should be the minimum of the invoice's balance_amount and the remaining payment amount
      const maxLinkable = Math.min(invoice.balance_amount, Math.max(0, remainingPayment)); // Ensure it's not negative

      setLinkedInvoices(prev => [...prev, {
        invoice_id: invoice.id,
        invoice_number: invoice.invoice_number,
        linked_amount: maxLinkable
      }]);
    } else {
      setLinkedInvoices(prev => prev.filter(item => item.invoice_id !== invoice.id));
    }
  };

  const handleLinkedAmountChange = (invoiceId, amount) => {
    setLinkedInvoices(prev => 
      prev.map(item => 
        item.invoice_id === invoiceId 
          ? { ...item, linked_amount: parseFloat(amount) || 0 }
          : item
      )
    );
  };

  const getTotalLinkedAmount = () => {
    return linkedInvoices.reduce((sum, item) => sum + (item.linked_amount || 0), 0);
  };

  const getUnusedAmount = () => {
    return receivedAmount - discountGiven - getTotalLinkedAmount();
  };

  const handleReset = () => {
    setLinkedInvoices([]);
    setReceivedAmount(paymentAmount || 0);
    setDiscountGiven(0);
  };

  const handleSubmit = () => {
    onSubmit(linkedInvoices);
  };

  const filteredInvoices = invoices.filter(inv => {
    const typeMatch = filterType === 'all' || 
                      (filterType === 'sale' && inv.type?.toLowerCase() === 'sale') ||
                      (filterType === 'purchase' && inv.type?.toLowerCase() === 'purchase') ||
                      (filterType === 'all' && inv.type?.toLowerCase() === 'receivable opening balance' && paymentType === 'payment_in'); // Include opening balance for 'all' and payment_in
                      
    const searchMatch = searchQuery === '' || 
                        inv.invoice_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        inv.type?.toLowerCase().includes(searchQuery.toLowerCase());
                        
    return typeMatch && searchMatch;
  });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between">
          <div>
            <DialogTitle className="text-lg font-semibold">Link Payment</DialogTitle>
            <p className="text-sm text-gray-500">Link Payment to Txns</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Party and Amount Section */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <Label className="text-sm text-gray-600">Party</Label>
              <p className="font-medium">{partyName}</p>
            </div>
            <div className="flex items-center gap-6">
              <div>
                <Label className="text-blue-600">Received</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={receivedAmount}
                    onChange={(e) => setReceivedAmount(parseFloat(e.target.value) || 0)}
                    className="w-24"
                  />
                  <Button variant="ghost" size="icon">
                    <Edit2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div>
                <Label className="text-blue-600">Discount Given</Label>
                <Input
                  type="number"
                  value={discountGiven}
                  onChange={(e) => setDiscountGiven(parseFloat(e.target.value) || 0)}
                  className="w-24"
                />
              </div>
              <Button variant="outline" onClick={handleReset}>
                <RotateCcw className="w-4 h-4 mr-2" />
                RESET
              </Button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center justify-between">
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Transactions</SelectItem>
                <SelectItem value="sale">Sales Only</SelectItem>
                <SelectItem value="purchase">Purchases Only</SelectItem>
              </SelectContent>
            </Select>
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
          </div>

          {/* Invoices Table */}
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"></TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Ref/Inv No.</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Balance</TableHead>
                  <TableHead>Linked Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.map((invoice) => {
                  const linkedInvoice = linkedInvoices.find(item => item.invoice_id === invoice.id);
                  const isSelected = !!linkedInvoice;
                  
                  return (
                    <TableRow 
                      key={invoice.id} 
                      className={isSelected ? 'bg-blue-50' : ''}
                    >
                      <TableCell>
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={(checked) => handleInvoiceSelect(invoice, checked)}
                          disabled={
                            !isSelected && 
                            (getUnusedAmount() <= 0 || invoice.balance_amount <= 0) // Disable if no unused amount or invoice has no balance
                          }
                        />
                      </TableCell>
                      <TableCell>
                        {invoice.invoice_date && typeof invoice.invoice_date === 'string'
                          ? format(new Date(invoice.invoice_date), 'dd/MM/yyyy')
                          : '-'}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            invoice.type === 'Sale' ? 'default' : 
                            invoice.type === 'Purchase' ? 'secondary' : 'outline'
                          }
                        >
                          {invoice.type}
                        </Badge>
                      </TableCell>
                      <TableCell>{invoice.invoice_number || '-'}</TableCell>
                      <TableCell>₹{invoice.total_amount?.toLocaleString()}</TableCell>
                      <TableCell>₹{invoice.balance_amount?.toLocaleString()}</TableCell>
                      <TableCell>
                        {isSelected ? (
                          <Input
                            type="number"
                            value={linkedInvoice.linked_amount}
                            onChange={(e) => handleLinkedAmountChange(invoice.id, e.target.value)}
                            className="w-24"
                            max={invoice.balance_amount}
                            min={0}
                          />
                        ) : (
                          '-'
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>

        <DialogFooter className="flex justify-between">
          <div className="text-sm">
            <span>Unused Amount: </span>
            <span className="font-semibold">₹{getUnusedAmount().toLocaleString()}</span>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose}>
              CANCEL
            </Button>
            <Button onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-700">
              DONE
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
