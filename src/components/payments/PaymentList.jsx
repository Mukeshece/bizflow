import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Printer, Share2, MoreHorizontal, ArrowUpDown } from 'lucide-react';
import { format } from 'date-fns';
import { Skeleton } from "@/components/ui/skeleton";

export default function PaymentList({ payments, isLoading, paymentType }) {

    const getStatusBadge = (status) => {
        switch (status) {
            case "used":
                return <Badge variant="outline" className="text-green-600 border-green-200">Used</Badge>;
            case "partial":
                return <Badge variant="outline" className="text-blue-600 border-blue-200">Partial</Badge>;
            case "available":
                return <Badge variant="outline" className="text-orange-600 border-orange-200">Available</Badge>;
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    if (isLoading) {
        return (
          <div className="space-y-2 p-4">
            {Array(10).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        );
    }
    
    return (
        <Table>
            <TableHeader className="bg-gray-50">
                <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead><Button variant="ghost" size="sm">DATE <ArrowUpDown className="w-3 h-3 ml-1" /></Button></TableHead>
                    <TableHead><Button variant="ghost" size="sm">REF NO. <ArrowUpDown className="w-3 h-3 ml-1" /></Button></TableHead>
                    <TableHead><Button variant="ghost" size="sm">PARTY NAME <ArrowUpDown className="w-3 h-3 ml-1" /></Button></TableHead>
                    <TableHead><Button variant="ghost" size="sm">CATEGORY <ArrowUpDown className="w-3 h-3 ml-1" /></Button></TableHead>
                    <TableHead>TYPE</TableHead>
                    <TableHead className="text-right"><Button variant="ghost" size="sm">TOTAL <ArrowUpDown className="w-3 h-3 ml-1" /></Button></TableHead>
                    <TableHead className="text-right">{paymentType === 'payment_in' ? 'RECEIVED' : 'PAID'}</TableHead>
                    <TableHead className="text-right"><Button variant="ghost" size="sm">BALANCE <ArrowUpDown className="w-3 h-3 ml-1" /></Button></TableHead>
                    <TableHead><Button variant="ghost" size="sm">STATUS <ArrowUpDown className="w-3 h-3 ml-1" /></Button></TableHead>
                    <TableHead className="text-center">PRINT/SHARE</TableHead>
                    <TableHead></TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {(payments || []).map((p, index) => (
                    <TableRow key={p.id}>
                        <TableCell className="text-gray-500">{index + 1}</TableCell>
                        <TableCell>{p.payment_date ? format(new Date(p.payment_date), 'dd/MM/yyyy') : '--'}</TableCell>
                        <TableCell className="font-medium">{p.payment_number}</TableCell>
                        <TableCell>{p.party_name}</TableCell>
                        <TableCell className="text-gray-400">--</TableCell>
                        <TableCell>{p.payment_type === 'payment_in' ? 'Payment-In' : 'Payment-Out'}</TableCell>
                        <TableCell className="text-right font-medium">₹{(p.total_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</TableCell>
                        <TableCell className="text-right">₹{(p.paid_amount || p.total_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</TableCell>
                        <TableCell className="text-right">₹0.00</TableCell>
                        <TableCell>{getStatusBadge(p.status)}</TableCell>
                        <TableCell className="text-center">
                            <div className="flex justify-center items-center gap-1">
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500"><Printer className="w-4 h-4" /></Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500"><Share2 className="w-4 h-4" /></Button>
                            </div>
                        </TableCell>
                        <TableCell>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreHorizontal className="w-4 h-4" />
                                </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem>Edit</DropdownMenuItem>
                                    <DropdownMenuItem className="text-red-500">Delete</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}