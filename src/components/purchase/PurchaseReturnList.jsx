
import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Eye, Link, MoreHorizontal, Edit, Printer, Trash2, Undo2 } from "lucide-react";
import { format } from "date-fns";

export default function PurchaseReturnList({ returns, isLoading, onReturnUpdate, onLinkPayment }) {
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
      pending: "bg-yellow-100 text-yellow-800",
      completed: "bg-green-100 text-green-800"
    };
    
    return (
      <Badge className={statusColors[status] || "bg-slate-100 text-slate-800"}>
        {status}
      </Badge>
    );
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader className="bg-slate-50">
          <TableRow>
            <TableHead>Return Date</TableHead>
            <TableHead>Return #</TableHead>
            <TableHead>Vendor</TableHead>
            <TableHead>Original Bill</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead className="text-center">Status</TableHead>
            <TableHead className="text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {returns.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-12">
                <Undo2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Purchase Returns Found</h3>
                <p className="text-slate-500 mb-4">Create your first purchase return to get started.</p>
              </TableCell>
            </TableRow>
          ) : (
            returns.map((returnItem) => (
              <TableRow key={returnItem.id} className="hover:bg-slate-50">
                <TableCell>
                  {format(new Date(returnItem.return_date), "dd MMM yyyy")}
                </TableCell>
                <TableCell className="font-medium">
                  {returnItem.return_number}
                </TableCell>
                <TableCell>{returnItem.vendor_name}</TableCell>
                <TableCell>{returnItem.original_invoice_number}</TableCell>
                <TableCell className="text-right font-semibold">
                  ₹{returnItem.total_amount?.toLocaleString()}
                </TableCell>
                <TableCell className="text-center">
                  {getStatusBadge(returnItem.status)}
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      title="View Details"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onLinkPayment(returnItem)}
                      className="h-8 w-8 text-orange-600 hover:text-orange-700"
                      title="Link to Bill"
                    >
                      <Link className="h-4 w-4" />
                    </Button>
                    
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
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <Printer className="mr-2 h-4 w-4" />
                          Print
                        </DropdownMenuItem>
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
  );
}
