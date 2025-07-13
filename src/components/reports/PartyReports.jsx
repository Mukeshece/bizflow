import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Users, Building } from "lucide-react";
import { Customer } from "@/api/entities";
import { Vendor } from "@/api/entities";
import { SalesInvoice } from "@/api/entities";
import { PurchaseInvoice } from "@/api/entities";

export default function PartyReports({ dateRange, isLoading }) {
  const [data, setData] = useState({
    customers: [],
    vendors: [],
    sales: [],
    purchases: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [dateRange]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [customers, vendors, sales, purchases] = await Promise.all([
        Customer.list(),
        Vendor.list(),
        SalesInvoice.list(),
        PurchaseInvoice.list()
      ]);

      setData({
        customers: customers || [],
        vendors: vendors || [],
        sales: sales || [],
        purchases: purchases || []
      });
    } catch (error) {
      console.error("Error loading party reports data:", error);
      setData({
        customers: [],
        vendors: [],
        sales: [],
        purchases: []
      });
    } finally {
      setLoading(false);
    }
  };

  const getCustomerOutstanding = (customerId) => {
    const customerSales = data.sales?.filter(s => s.customer_id === customerId) || [];
    return customerSales.reduce((sum, sale) => sum + (sale.balance_amount || 0), 0);
  };

  const getVendorOutstanding = (vendorId) => {
    const vendorPurchases = data.purchases?.filter(p => p.vendor_id === vendorId) || [];
    return vendorPurchases.reduce((sum, purchase) => sum + (purchase.balance_amount || 0), 0);
  };

  if (loading) {
    return <div className="text-center py-8">Loading party reports...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Customer Outstanding */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Customer Outstanding (Receivables)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer Name</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Outstanding Amount</TableHead>
                  <TableHead>Payment Terms</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.customers?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan="5" className="text-center py-8 text-gray-500">
                      No customers found
                    </TableCell>
                  </TableRow>
                ) : (
                  data.customers?.map((customer) => {
                    const outstanding = getCustomerOutstanding(customer.id);
                    if (outstanding === 0) return null;
                    
                    return (
                      <TableRow key={customer.id}>
                        <TableCell className="font-medium">{customer.name}</TableCell>
                        <TableCell>{customer.phone || customer.email}</TableCell>
                        <TableCell className="text-red-600 font-semibold">
                          ₹{outstanding.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{customer.payment_terms || 'Net 30'}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={outstanding > 50000 ? "destructive" : "secondary"}>
                            {outstanding > 50000 ? "High" : "Normal"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Vendor Outstanding */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="w-5 h-5" />
            Vendor Outstanding (Payables)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vendor Name</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Outstanding Amount</TableHead>
                  <TableHead>Payment Terms</TableHead>
                  <TableHead>Priority</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.vendors?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan="5" className="text-center py-8 text-gray-500">
                      No vendors found
                    </TableCell>
                  </TableRow>
                ) : (
                  data.vendors?.map((vendor) => {
                    const outstanding = getVendorOutstanding(vendor.id);
                    if (outstanding === 0) return null;
                    
                    return (
                      <TableRow key={vendor.id}>
                        <TableCell className="font-medium">{vendor.name}</TableCell>
                        <TableCell>{vendor.phone || vendor.email}</TableCell>
                        <TableCell className="text-orange-600 font-semibold">
                          ₹{outstanding.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{vendor.payment_terms || 'Net 30'}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={outstanding > 100000 ? "destructive" : "secondary"}>
                            {outstanding > 100000 ? "High" : "Normal"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}