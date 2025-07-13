
import React, { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { X, RefreshCcw, Search } from 'lucide-react';
import { format } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function LinkPaymentDialog({
    open,
    onClose,
    onSubmit,
    party,
    paymentAmount,
    initialDiscount,
    initialLinks,
    partyInvoices
}) {
    const [links, setLinks] = useState([]);
    const [discount, setDiscount] = useState(0);

    const calculateTotals = useCallback(() => {
        const totalLinked = links.reduce((sum, link) => sum + link.applied_amount, 0);
        return {
            totalLinked,
            unusedAmount: paymentAmount - totalLinked
        };
    }, [links, paymentAmount]);

    useEffect(() => {
        if (open) {
            setLinks(initialLinks || []);
            setDiscount(initialDiscount || 0);
        }
    }, [open, initialLinks, initialDiscount]);

    const { totalLinked, unusedAmount } = calculateTotals();

    const handleAutoLink = () => {
        let remainingAmount = paymentAmount;
        const newLinks = [];
        const sortedInvoices = [...partyInvoices].sort((a,b) => new Date(a.invoice_date) - new Date(b.invoice_date));

        for (const invoice of sortedInvoices) {
            if (remainingAmount <= 0) break;
            const amountToApply = Math.min(invoice.balance_amount, remainingAmount);
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
        setLinks(newLinks);
    };

    const handleInvoiceCheck = (invoice, isChecked) => {
        if (isChecked) {
            const amountToApply = Math.min(invoice.balance_amount, unusedAmount);
            setLinks([...links, {
                invoice_id: invoice.id,
                invoice_number: invoice.invoice_number,
                invoice_date: invoice.invoice_date,
                total_amount: invoice.total_amount,
                balance_amount: invoice.balance_amount,
                applied_amount: amountToApply
            }]);
        } else {
            setLinks(links.filter(link => link.invoice_id !== invoice.id));
        }
    };
    
    const handleAmountChange = (invoiceId, value) => {
        const newAmount = parseFloat(value) || 0;
        const invoice = partyInvoices.find(inv => inv.id === invoiceId);
        const otherLinksTotal = links.filter(l => l.invoice_id !== invoiceId).reduce((sum, l) => sum + l.applied_amount, 0);
        
        const maxApplicable = Math.min(invoice.balance_amount, paymentAmount - otherLinksTotal);
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
        onClose();
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl">
                <DialogHeader>
                    <div className="flex justify-between items-center">
                        <DialogTitle>Link Payment to Txns</DialogTitle>
                        <Button variant="ghost" size="icon" onClick={onClose}><X className="w-4 h-4" /></Button>
                    </div>
                </DialogHeader>

                <div className="grid grid-cols-3 gap-4 items-center p-4 bg-slate-50 rounded-lg">
                    <div>
                        <Label>Party</Label>
                        <p className="font-medium">{party.name}</p>
                    </div>
                     <div className="flex items-center gap-2">
                        <Label>Received</Label>
                        <Input value={paymentAmount} readOnly className="font-medium" />
                    </div>
                    <div className="flex items-center gap-2">
                        <Label>Discount Given</Label>
                        <Input 
                            type="number"
                            value={discount}
                            onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                            className="font-medium"
                        />
                    </div>
                </div>
                
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <Select defaultValue="all">
                            <SelectTrigger className="w-48"><SelectValue/></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Transactions</SelectItem>
                                <SelectItem value="sale">Sale</SelectItem>
                                <SelectItem value="purchase">Purchase</SelectItem>
                            </SelectContent>
                        </Select>
                        <div className="relative">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400"/>
                            <Input placeholder="Search..." className="pl-10"/>
                        </div>
                    </div>
                    <div>
                         <Button onClick={handleAutoLink}>AUTO LINK</Button>
                         <Button variant="ghost" size="icon" onClick={handleReset}><RefreshCcw className="w-4 h-4"/></Button>
                    </div>
                </div>

                <div className="border rounded-lg max-h-64 overflow-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-12"></TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Ref/Inv No.</TableHead>
                                <TableHead className="text-right">Total</TableHead>
                                <TableHead className="text-right">Balance</TableHead>
                                <TableHead className="text-right">Linked Amount</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {partyInvoices.map(invoice => {
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
                                        <TableCell>{format(new Date(invoice.invoice_date), 'dd/MM/yyyy')}</TableCell>
                                        <TableCell><Badge variant="outline">Sale</Badge></TableCell>
                                        <TableCell>{invoice.invoice_number}</TableCell>
                                        <TableCell className="text-right">₹{invoice.total_amount.toLocaleString()}</TableCell>
                                        <TableCell className="text-right">₹{invoice.balance_amount.toLocaleString()}</TableCell>
                                        <TableCell className="text-right">
                                            {isLinked ? (
                                                <Input
                                                    type="number"
                                                    value={linkInfo.applied_amount}
                                                    onChange={(e) => handleAmountChange(invoice.id, e.target.value)}
                                                    className="w-28 text-right ml-auto"
                                                />
                                            ) : (
                                                <span>-</span>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>
                
                <DialogFooter className="flex justify-between items-center bg-slate-50 p-4 rounded-b-lg">
                    <div>
                        <Label>Unused Amount:</Label>
                        <span className="font-bold ml-2">₹{unusedAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={onClose}>CANCEL</Button>
                        <Button onClick={handleDone}>DONE</Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
