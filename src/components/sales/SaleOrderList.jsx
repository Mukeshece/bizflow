import React, { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { MoreHorizontal, ArrowDown, RefreshCw, Plus, Package } from "lucide-react";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function SaleOrderList({ orders = [], isLoading, onRefresh }) {
  const [selectedOrders, setSelectedOrders] = useState([]);
  
  const safeOrders = Array.isArray(orders) ? orders : [];
  const safeSelectedOrders = Array.isArray(selectedOrders) ? selectedOrders : [];
  
  const isAllSelected = safeOrders.length > 0 && safeSelectedOrders.length === safeOrders.length;

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedOrders(safeOrders.map(o => o.id));
    } else {
      setSelectedOrders([]);
    }
  };

  const handleSelectOne = (id, checked) => {
    if (checked) {
      setSelectedOrders(prev => [...(Array.isArray(prev) ? prev : []), id]);
    } else {
      setSelectedOrders(prev => (Array.isArray(prev) ? prev : []).filter(orderId => orderId !== id));
    }
  };
  
  const getStatusBadge = (order) => {
    if (!order) return null;
    
    const isOverdue = order.delivery_date && new Date(order.delivery_date) < new Date() && order.status !== 'converted' && order.status !== 'delivered';
    const status = isOverdue ? 'overdue' : order.status;

    const statusStyles = {
      pending: "bg-yellow-100 text-yellow-800",
      overdue: "bg-red-100 text-red-800",
      converted: "bg-green-100 text-green-800",
      confirmed: "bg-blue-100 text-blue-800",
      shipped: "bg-purple-100 text-purple-800",
      delivered: "bg-green-100 text-green-800",
      cancelled: "bg-gray-100 text-gray-800",
      default: "bg-gray-100 text-gray-800"
    };
    
    return (
      <Badge className={statusStyles[status] || statusStyles.default}>
        {status?.replace('_', ' ')}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Sale Orders</h2>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Loading...
              </Button>
            </div>
          </div>
          <div className="space-y-3">
            {Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Sale Orders</h2>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onRefresh}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Link to={createPageUrl("CreateSaleOrder")}>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Create Sale Order
              </Button>
            </Link>
          </div>
        </div>

        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox 
                    checked={isAllSelected} 
                    onCheckedChange={handleSelectAll} 
                  />
                </TableHead>
                <TableHead>PARTY</TableHead>
                <TableHead>NO.</TableHead>
                <TableHead>DATE <ArrowDown className="w-3 h-3 inline" /></TableHead>
                <TableHead>DUE DATE</TableHead>
                <TableHead>TOTAL AMOUNT</TableHead>
                <TableHead>BALANCE</TableHead>
                <TableHead>TYPE</TableHead>
                <TableHead>STATUS</TableHead>
                <TableHead>ACTION</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {safeOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan="11" className="text-center py-16">
                    <div className="text-gray-500">
                      <Package className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                      <h3 className="text-lg font-semibold mb-2">No Sale Orders Found</h3>
                      <p className="mb-4">Create your first sale order to track upcoming sales.</p>
                      <Link to={createPageUrl("CreateSaleOrder")}>
                        <Button className="bg-blue-600 hover:bg-blue-700">
                          <Plus className="w-4 h-4 mr-2" />
                          Create Sale Order
                        </Button>
                      </Link>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                safeOrders.map((order) => (
                  <TableRow key={order.id} className="hover:bg-slate-50">
                    <TableCell>
                      <Checkbox 
                        checked={safeSelectedOrders.includes(order.id)} 
                        onCheckedChange={(checked) => handleSelectOne(order.id, checked)}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{order.customer_name}</TableCell>
                    <TableCell>{order.order_number}</TableCell>
                    <TableCell>{order.order_date ? format(new Date(order.order_date), "dd/MM/yyyy") : 'N/A'}</TableCell>
                    <TableCell>{order.delivery_date ? format(new Date(order.delivery_date), "dd/MM/yyyy") : 'N/A'}</TableCell>
                    <TableCell>₹{order.total_amount?.toLocaleString() || '0'}</TableCell>
                    <TableCell>₹{order.balance?.toLocaleString() || '0'}</TableCell>
                    <TableCell>Sale Order</TableCell>
                    <TableCell>{getStatusBadge(order)}</TableCell>
                    <TableCell>
                      <Link to={createPageUrl(`CreateSalesInvoice?fromSaleOrder=${order.id}`)}>
                        <Button variant="ghost" className="text-blue-600 hover:text-blue-700">
                          CONVERT TO SALE
                        </Button>
                      </Link>
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
                            <DropdownMenuItem>View</DropdownMenuItem>
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