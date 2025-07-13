
import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { RefreshCw, Plus, Undo2, MoreHorizontal } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export default function SaleReturnList({ returns = [], isLoading, onRefresh }) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Sale Returns</h2>
            <Button variant="outline" size="sm" disabled>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Loading...
            </Button>
          </div>
          <div className="space-y-3">
            {Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
          </div>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      'draft': { class: 'bg-gray-100 text-gray-800', label: 'Draft' },
      'issued': { class: 'bg-blue-100 text-blue-800', label: 'Issued' },
      'partially_applied': { class: 'bg-yellow-100 text-yellow-800', label: 'Partially Applied' },
      'applied': { class: 'bg-green-100 text-green-800', label: 'Applied' },
    };
    
    const config = statusConfig[status] || { class: 'bg-gray-100 text-gray-800', label: status };
    return <Badge className={config.class}>{config.label}</Badge>;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Sale Returns</h2>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onRefresh}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Link to={createPageUrl("CreateSaleReturn")}>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Create Return
              </Button>
            </Link>
          </div>
        </div>

        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead>Return Date</TableHead>
                <TableHead>Return #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Original Invoice</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Balance</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(!returns || returns.length === 0) ? (
                <TableRow>
                  <TableCell colSpan="8" className="text-center py-16">
                    <div className="text-gray-500">
                      <Undo2 className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                      <h3 className="text-lg font-semibold mb-2">No Sale Returns Found</h3>
                      <p className="mb-4">Process returns for damaged or unwanted items.</p>
                      <Link to={createPageUrl("CreateSaleReturn")}>
                        <Button className="bg-blue-600 hover:bg-blue-700">
                          <Plus className="w-4 h-4 mr-2" />
                          Create Return
                        </Button>
                      </Link>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                returns.map((returnItem) => (
                  <TableRow key={returnItem.id}>
                    <TableCell>{returnItem.return_date ? format(new Date(returnItem.return_date), "dd MMM yyyy") : 'N/A'}</TableCell>
                    <TableCell className="font-medium">{returnItem.return_number}</TableCell>
                    <TableCell>{returnItem.customer_name}</TableCell>
                    <TableCell>{returnItem.original_invoice_number || 'N/A'}</TableCell>
                    <TableCell className="text-right font-medium">₹{returnItem.total_amount?.toLocaleString()}</TableCell>
                    <TableCell className="text-right">₹{returnItem.balance_amount?.toLocaleString()}</TableCell>
                    <TableCell>
                      {getStatusBadge(returnItem.status)}
                    </TableCell>
                    <TableCell className="text-center">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                                <Link to={createPageUrl(`CreateSaleReturn?edit=${returnItem.id}`)}>Edit</Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem>Print</DropdownMenuItem>
                            <DropdownMenuItem className="text-red-500">Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
