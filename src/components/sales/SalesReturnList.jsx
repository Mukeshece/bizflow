
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Edit, Trash2, Undo2, Eye, Link, Printer } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { format } from "date-fns";
import { SaleReturn } from '@/api/entities';
import { Skeleton } from "@/components/ui/skeleton"; // Added Skeleton

export default function SalesReturnList({ returns, isLoading, onRefresh, onLinkPayment }) { // Added onLinkPayment
  const navigate = useNavigate();

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this sale return?")) {
        try {
            await SaleReturn.delete(id);
            if (typeof onRefresh === 'function') {
                onRefresh();
            }
        } catch (error) {
            console.error("Failed to delete sale return:", error);
            alert("Failed to delete sale return.");
        }
    }
  };

  // Replaced getStatusVariant with getStatusBadge
  const getStatusBadge = (status) => {
    const statusColors = {
      draft: "bg-gray-100 text-gray-800",
      issued: "bg-blue-100 text-blue-800",
      applied: "bg-green-100 text-green-800",
      partially_applied: "bg-yellow-100 text-yellow-800"
    };
    
    return (
      <Badge className={statusColors[status] || "bg-slate-100 text-slate-800"}>
        {status?.replace('_', ' ')}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array(5).fill(0).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <Table>
        <TableHeader className="bg-slate-50">
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Return No.</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Original Invoice</TableHead> {/* New column */}
            <TableHead className="text-right">Amount</TableHead>
            <TableHead className="text-right">Balance</TableHead>
            <TableHead className="text-center">Status</TableHead>
            <TableHead className="text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {returns.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-12">
                <Undo2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Sale Returns Found</h3>
                <p className="text-slate-500 mb-4">Create your first sale return to get started.</p>
              </TableCell>
            </TableRow>
          ) : (
            returns.map((returnItem) => (
              <TableRow key={returnItem.id} className="hover:bg-slate-50">
                <TableCell>
                  {returnItem.return_date ? format(new Date(returnItem.return_date), "dd MMM yyyy") : 'N/A'}
                </TableCell>
                <TableCell className="font-medium">
                  {returnItem.return_number || 'N/A'}
                </TableCell>
                <TableCell>{returnItem.customer_name || 'N/A'}</TableCell>
                <TableCell>{returnItem.original_invoice_number || 'N/A'}</TableCell> {/* New column data */}
                <TableCell className="text-right font-semibold">
                  ₹{(returnItem.total_amount || 0).toLocaleString()}
                </TableCell>
                <TableCell className="text-right font-medium">
                  ₹{(returnItem.balance_amount || 0).toLocaleString()}
                </TableCell>
                <TableCell className="text-center">
                  {getStatusBadge(returnItem.status?.toLowerCase())} {/* Use new getStatusBadge */}
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      title="View Details"
                      onClick={() => navigate(createPageUrl(`ViewSaleReturn?id=${returnItem.id}`))} // Assuming a view page
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    
                    {returnItem.balance_amount > 0 && typeof onLinkPayment === 'function' && ( // Conditional Link button
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onLinkPayment(returnItem)}
                        className="h-8 w-8 text-green-600 hover:text-green-700"
                        title="Link Payment" // Changed from "Link to Invoice" for clarity based on context
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
                        <DropdownMenuItem onClick={() => navigate(createPageUrl(`CreateSaleReturn?edit=${returnItem.id}`))}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator /> {/* Added separator */}
                        <DropdownMenuItem onClick={() => console.log("Print clicked for", returnItem.id)}> {/* Placeholder for Print functionality */}
                          <Printer className="mr-2 h-4 w-4" />
                          Print
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(returnItem.id)}>
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
  );
}
