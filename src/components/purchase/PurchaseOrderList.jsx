import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

export default function PurchaseOrderList({ orders, isLoading }) {
  const getStatusBadge = (status) => {
    const statusColors = {
      pending: "bg-yellow-100 text-yellow-800",
      confirmed: "bg-blue-100 text-blue-800", 
      received: "bg-green-100 text-green-800",
      partial: "bg-purple-100 text-purple-800",
      cancelled: "bg-red-100 text-red-800"
    };
    
    return (
      <Badge className={statusColors[status] || "bg-slate-100 text-slate-800"}>
        {status}
      </Badge>
    );
  };

  if (isLoading) {
    return Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-12 w-full mb-2" />);
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader className="bg-slate-50">
          <TableRow>
            <TableHead>Order Date</TableHead>
            <TableHead>Order #</TableHead>
            <TableHead>Vendor</TableHead>
            <TableHead>Delivery Date</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell>{format(new Date(order.order_date), "dd MMM yyyy")}</TableCell>
              <TableCell className="font-medium">{order.order_number}</TableCell>
              <TableCell>{order.vendor_name}</TableCell>
              <TableCell>{format(new Date(order.delivery_date), "dd MMM yyyy")}</TableCell>
              <TableCell>₹{order.total_amount?.toLocaleString()}</TableCell>
              <TableCell>{getStatusBadge(order.status)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}