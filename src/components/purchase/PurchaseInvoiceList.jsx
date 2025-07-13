
import React, { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowUpDown, Eye, Link, MoreHorizontal, Edit, Copy, Trash2, Share, Printer, FileText } from "lucide-react";
import { format } from "date-fns";

export default function PurchaseInvoiceList({ invoices, isLoading, onLinkPayment }) {
  const safeInvoices = Array.isArray(invoices) ? invoices : [];

  const [sortField, setSortField] = useState('invoice_date');
  const [sortDirection, setSortDirection] = useState('desc');

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedInvoices = [...safeInvoices].sort((a, b) => {
    const aVal = a[sortField];
    const bVal = b[sortField];
    const multiplier = sortDirection === 'asc' ? 1 : -1;
    
    if (sortField === 'invoice_date') {
      return (new Date(aVal) - new Date(bVal)) * multiplier;
    }
    // Handle string comparison for other fields if needed, otherwise default comparison
    if (typeof aVal === 'string' && typeof bVal === 'string') {
        return aVal.localeCompare(bVal) * multiplier;
    }
    return (aVal < bVal ? -1 : aVal > bVal ? 1 : 0) * multiplier;
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array(5).fill(0).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  const getStatusBadge = (status) => {
    const statusColors = {
      paid: "bg-green-100 text-green-800",
      partial: "bg-yellow-100 text-yellow-800",
      unpaid: "bg-red-100 text-red-800"
    };
    
    return (
      <Badge className={`${statusColors[status] || "bg-slate-100 text-slate-800"} text-xs px-2 py-1`}>
        {status === 'paid' ? 'Paid' : status === 'partial' ? 'Partial' : 'Unpaid'}
      </Badge>
    );
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="overflow-x-auto"> {/* Added for responsive table scrolling */}
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="text-xs font-medium text-gray-600 py-3 px-4">
                <Button variant="ghost" onClick={() => handleSort('invoice_date')} className="h-auto p-0 font-medium text-gray-600 hover:bg-transparent">
                  Date
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead className="text-xs font-medium text-gray-600 py-3 px-4">
                <Button variant="ghost" onClick={() => handleSort('invoice_number')} className="h-auto p-0 font-medium text-gray-600 hover:bg-transparent">
                  Bill No.
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead className="text-xs font-medium text-gray-600 py-3 px-4">Vendor</TableHead>
              <TableHead className="text-xs font-medium text-gray-600 py-3 px-4 text-right">Amount</TableHead>
              <TableHead className="text-xs font-medium text-gray-600 py-3 px-4 text-right">Balance</TableHead>
              <TableHead className="text-xs font-medium text-gray-600 py-3 px-4 text-center">Status</TableHead>
              <TableHead className="text-xs font-medium text-gray-600 py-3 px-4 text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedInvoices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Purchase Bills Found</h3>
                  <p className="text-slate-500 mb-4">Create your first purchase bill to get started.</p>
                </TableCell>
              </TableRow>
            ) : (
              sortedInvoices.map((invoice) => (
                <TableRow key={invoice.id} className="hover:bg-slate-50 border-b border-gray-100">
                  <TableCell className="text-sm py-4 px-4 text-gray-900">
                    {format(new Date(invoice.invoice_date), "dd MMM yyyy")}
                  </TableCell>
                  <TableCell className="text-sm font-medium py-4 px-4 text-blue-600">
                    {invoice.invoice_number}
                  </TableCell>
                  <TableCell className="text-sm py-4 px-4 text-gray-900">{invoice.vendor_name}</TableCell>
                  <TableCell className="text-sm py-4 px-4 font-semibold text-gray-900 text-right">
                    ₹{invoice.total_amount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell className="text-sm py-4 px-4 font-medium text-gray-900 text-right">
                    ₹{(invoice.balance_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell className="py-4 px-4 text-center">
                    {getStatusBadge(invoice.payment_status)}
                  </TableCell>
                  <TableCell className="py-4 px-4">
                    <div className="flex items-center justify-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      
                      {invoice.payment_status !== 'paid' && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onLinkPayment(invoice)}
                          className="h-8 w-8 text-orange-600 hover:text-orange-700"
                          title="Link Payment"
                        >
                          <Link className="h-4 w-4" />
                        </Button>
                      )}
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Copy className="mr-2 h-4 w-4" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <Printer className="mr-2 h-4 w-4" />
                            Print
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Share className="mr-2 h-4 w-4" />
                            Share
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
