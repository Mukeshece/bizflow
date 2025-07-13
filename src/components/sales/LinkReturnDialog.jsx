import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { X, RefreshCcw, Search, HelpCircle } from 'lucide-react';
import { format } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function LinkReturnDialog({
    open,
    onClose,
    onSubmit,
    customer,
    returnAmount,
    initialDiscount,
    initialLinks,
    customerInvoices
}) {
    const [links, setLinks] = useState([]);
    const [discount, setDiscount] = useState(0);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterType, setFilterType] = useState("all");

    useEffect(() => {
        if (open) {
            setLinks(initialLinks || []);
            setDiscount(initialDiscount || 0);
        }
    }, [open, initialLinks, initialDiscount]);

    const calculateTotals = () => {
        const totalLinked = links.reduce((sum, link) => sum + link.applied_amount, 0);
        return {
            totalLinked,
            unusedAmount: returnAmount - totalLinked - discount
        };
    };

    const { totalLinked, unusedAmount } = calculateTotals();

    const handleAutoLink = () => {
        let remainingAmount = returnAmount - discount;
        const newLinks = [];
        const sortedInvoices = [...customerInvoices].sort((a, b) => 
            new Date(a.invoice_date) - new Date(b.invoice_date)
        );

        for (const invoice of sortedInvoices) {
            if (remainingAmount <= 0) break;
            const amountToApply = Math.min(invoice.balance_amount, remainingAmount);
            if (amountToApply > 0) {
                newLinks.push({
                    invoice_id: invoice.id,
                    invoice_number: invoice.invoice_number,
                    invoice_date: invoice.invoice_date,
                    total_amount: invoice.total_amount,
                    balance_amount: invoice.balance_amount,
                    applied_amount: amountToApply
                });
                remainingAmount -= amountToApply;
            }
        }
        setLinks(newLinks);
    };

    const handleInvoiceCheck = (invoice, isChecked) => {
        if (isChecked) {
            const availableAmount = returnAmount - discount - links.reduce((sum, l) => sum + l.applied_amount, 0);
            const amountToApply = Math.min(invoice.balance_amount, availableAmount);
            
            if (amountToApply > 0) {
                setLinks([...links, {
                    invoice_id: invoice.id,
                    invoice_number: invoice.invoice_number,
                    invoice_date: invoice.invoice_date,
                    total_amount: invoice.total_amount,
                    balance_amount: invoice.balance_amount,
                    applied_amount: amountToApply
                }]);
            }
        } else {
            setLinks(links.filter(link => link.invoice_id !== invoice.id));
        }
    };

    const handleAmountChange = (invoiceId, value) => {
        const newAmount = parseFloat(value) || 0;
        const invoice = customerInvoices.find(inv => inv.id === invoiceId);
        const otherLinksTotal = links.filter(l => l.invoice_id !== invoiceId).reduce((sum, l) => sum + l.applied_amount, 0);
        
        const maxApplicable = Math.min(
            invoice.balance_amount, 
            returnAmount - discount - otherLinksTotal
        );
        const appliedAmount = Math.min(newAmount, maxApplicable);
        
        setLinks(links.map(link => 
            link.invoice_id === invoiceId ? { ...link, applied_amount: appliedAmount } : link
        ));
    };

    const handleReset = () => {
        setLinks([]);
        setDiscount(0);
    };

    const handleDone = () => {
        onSubmit({ links, discount });
    };

    const filteredInvoices = customerInvoices.filter(invoice => {
        const matchesSearch = invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterType === "all" || 
            (filterType === "unpaid" && invoice.payment_status === "unpaid") ||
            (filterType === "partial" && invoice.payment_status === "partial");
        return matchesSearch && matchesFilter;
    });

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex justify-between items-center">
                        <DialogTitle className="text-lg font-semibold">Link Payment to Invoices</DialogTitle>
                        <Button variant="ghost" size="icon" onClick={onClose}>
                            <X className="w-4 h-4" />
                        </Button>
                    </div>
                </DialogHeader>

                {/* Customer and Amount Info */}
                <div className="grid grid-cols-4 gap-4 p-4 bg-slate-50 rounded-lg">
                    <div>
                        <Label className="text-sm font-medium">Customer</Label>
                        <p className="font-semibold">{customer.name}</p>
                    </div>
                    <div>
                        <Label className="text-sm font-medium">Return Amount</Label>
                        <p className="font-semibold text-green-600">₹{returnAmount.toLocaleString()}</p>
                    </div>
                    <div>
                        <Label className="text-sm font-medium">Discount</Label>
                        <Input 
                            type="number"
                            value={discount}
                            onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                            className="mt-1"
                            placeholder="0"
                        />
                    </div>
                    <div>
                        <Label className="text-sm font-medium">Available to Link</Label>
                        <p className="font-semibold text-blue-600">₹{(returnAmount - discount).toLocaleString()}</p>
                    </div>
                </div>

                {/* Controls */}
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <Select value={filterType} onValueChange={setFilterType}>
                            <SelectTrigger className="w-40">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Invoices</SelectItem>
                                <SelectItem value="unpaid">Unpaid Only</SelectItem>
                                <SelectItem value="partial">Partial Paid</SelectItem>
                            </SelectContent>
                        </Select>
                        
                        <div className="relative">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                            <Input 
                                placeholder="Search invoices..." 
                                className="pl-10 w-48"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <Button onClick={handleAutoLink} variant="outline">
                            AUTO LINK
                        </Button>
                        <Button variant="ghost" size="icon" onClick={handleReset}>
                            <RefreshCcw className="w-4 h-4" />
                        </Button>
                    </div>
                </div>

                {/* Invoice Table */}
                <div className="border rounded-lg max-h-80 overflow-auto">
                    <Table>
                        <TableHeader className="sticky top-0 bg-white">
                            <TableRow>
                                <TableHead className="w-12"></TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Invoice No.</TableHead>
                                <TableHead className="text-right">Total</TableHead>
                                <TableHead className="text-right">Balance</TableHead>
                                <TableHead className="text-right">Applied Amount</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredInvoices.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                                        No invoices found for this customer.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredInvoices.map(invoice => {
                                    const isLinked = links.some(l => l.invoice_id === invoice.id);
                                    const linkInfo = links.find(l => l.invoice_id === invoice.id);
                                    
                                    return (
                                        <TableRow key={invoice.id} className={isLinked ? "bg-blue-50" : ""}>
                                            <TableCell>
                                                <Checkbox
                                                    checked={isLinked}
                                                    onCheckedChange={(checked) => handleInvoiceCheck(invoice, checked)}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                {format(new Date(invoice.invoice_date), 'dd/MM/yyyy')}
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                {invoice.invoice_number}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                ₹{invoice.total_amount.toLocaleString()}
                                            </TableCell>
                                            <TableCell className="text-right font-medium">
                                                ₹{invoice.balance_amount.toLocaleString()}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {isLinked ? (
                                                    <Input
                                                        type="number"
                                                        value={linkInfo.applied_amount}
                                                        onChange={(e) => handleAmountChange(invoice.id, e.target.value)}
                                                        className="w-28 text-right"
                                                        max={Math.min(invoice.balance_amount, unusedAmount + linkInfo.applied_amount)}
                                                    />
                                                ) : (
                                                    <span className="text-gray-400">-</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={
                                                    invoice.payment_status === 'paid' ? 'default' :
                                                    invoice.payment_status === 'partial' ? 'secondary' : 'destructive'
                                                }>
                                                    {invoice.payment_status}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Summary */}
                <div className="grid grid-cols-3 gap-4 p-4 bg-slate-50 rounded-lg">
                    <div>
                        <Label className="text-sm">Total Linked</Label>
                        <p className="font-semibold text-blue-600">₹{totalLinked.toLocaleString()}</p>
                    </div>
                    <div>
                        <Label className="text-sm">Discount Applied</Label>
                        <p className="font-semibold text-orange-600">₹{discount.toLocaleString()}</p>
                    </div>
                    <div>
                        <Label className="text-sm">Unused Amount</Label>
                        <p className="font-semibold text-red-600">₹{unusedAmount.toLocaleString()}</p>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-between items-center pt-4 border-t">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <HelpCircle className="w-4 h-4" />
                        <span>You can link your received payments to invoices and mark them as Paid</span>
                    </div>
                    <div className="flex gap-3">
                        <Button variant="outline" onClick={onClose}>
                            CANCEL
                        </Button>
                        <Button onClick={handleDone} className="bg-blue-600 hover:bg-blue-700">
                            DONE
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}