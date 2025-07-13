
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Filter, MoreVertical, Download } from 'lucide-react';

export default function ProductTransactions({ transactions }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Transactions</CardTitle>
          <div className="flex items-center gap-2">
            <Input placeholder="Search..." className="w-48 h-8" />
            <Button variant="outline" size="sm"><Download className="w-3 h-3 mr-2" /> Export</Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Invoice/Ref #</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Price/Unit</TableHead>
                <TableHead>Status</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions && transactions.length > 0 ? (
                transactions.map((tx, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <span className={`inline-block w-2 h-2 rounded-full mr-2 ${tx.type === 'Sale' ? 'bg-green-500' : 'bg-blue-500'}`}></span>
                      {tx.type}
                    </TableCell>
                    <TableCell>{tx.invoice_ref}</TableCell>
                    <TableCell>{tx.name}</TableCell>
                    <TableCell>{new Date(tx.date).toLocaleDateString()}</TableCell>
                    <TableCell>{tx.quantity}</TableCell>
                    <TableCell>{tx.price_unit}</TableCell>
                    <TableCell>{tx.status}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" className="w-8 h-8">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan="8" className="h-24 text-center">
                    No transactions found for this product.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
