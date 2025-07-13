import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Package, AlertTriangle, TrendingDown } from "lucide-react";
import { Product } from "@/api/entities";
import { SalesInvoice } from "@/api/entities";

export default function ItemStockReports({ dateRange, isLoading }) {
  const [data, setData] = useState({
    products: [],
    sales: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [dateRange]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [products, sales] = await Promise.all([
        Product.list(),
        SalesInvoice.list()
      ]);

      setData({
        products: products || [],
        sales: sales || []
      });
    } catch (error) {
      console.error("Error loading stock reports data:", error);
      setData({
        products: [],
        sales: []
      });
    } finally {
      setLoading(false);
    }
  };

  const getProductSalesData = (productId) => {
    const productSales = [];
    data.sales?.forEach(sale => {
      sale.items?.forEach(item => {
        if (item.product_id === productId) {
          productSales.push({
            quantity: item.quantity,
            revenue: item.total
          });
        }
      });
    });
    return productSales;
  };

  const lowStockProducts = data.products?.filter(p => p.current_stock <= p.min_stock) || [];
  const totalStockValue = data.products?.reduce((sum, p) => sum + (p.current_stock * p.purchase_rate), 0) || 0;

  if (loading) {
    return <div className="text-center py-8">Loading stock reports...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Stock Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-500">Total Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.products?.length || 0}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-500">Low Stock Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{lowStockProducts.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-500">Stock Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">₹{totalStockValue.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Alert */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="w-5 h-5" />
            Low Stock Alert
          </CardTitle>
        </CardHeader>
        <CardContent>
          {lowStockProducts.length === 0 ? (
            <p className="text-center text-slate-500 py-8">All products are adequately stocked!</p>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product Name</TableHead>
                    <TableHead>Current Stock</TableHead>
                    <TableHead>Min. Stock</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Reorder Qty</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lowStockProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>{product.current_stock} {product.unit}</TableCell>
                      <TableCell>{product.min_stock} {product.unit}</TableCell>
                      <TableCell>
                        <Badge variant="destructive">
                          <TrendingDown className="w-3 h-3 mr-1" />
                          Low Stock
                        </Badge>
                      </TableCell>
                      <TableCell>{Math.max(product.min_stock * 2 - product.current_stock, 0)} {product.unit}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Product Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Product Performance Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product Name</TableHead>
                  <TableHead>Current Stock</TableHead>
                  <TableHead>B2B Rate</TableHead>
                  <TableHead>B2C Rate</TableHead>
                  <TableHead>Stock Value</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.products?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan="6" className="text-center py-8 text-gray-500">
                      No products found
                    </TableCell>
                  </TableRow>
                ) : (
                  data.products?.slice(0, 10).map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>{product.current_stock} {product.unit}</TableCell>
                      <TableCell>₹{product.b2b_rate?.toLocaleString()}</TableCell>
                      <TableCell>₹{product.b2c_rate?.toLocaleString()}</TableCell>
                      <TableCell>₹{(product.current_stock * product.purchase_rate).toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant={product.current_stock > product.min_stock ? "default" : "destructive"}>
                          {product.current_stock > product.min_stock ? "In Stock" : "Low Stock"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}