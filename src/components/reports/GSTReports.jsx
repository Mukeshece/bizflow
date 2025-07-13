import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Download, FileText, Percent, TrendingUp, TrendingDown, AlertTriangle, CheckCircle } from "lucide-react";
import { SalesInvoice } from "@/api/entities";
import { PurchaseInvoice } from "@/api/entities";

export default function GSTReports({ dateRange, isLoading }) {
  const [data, setData] = useState({
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
      const [sales, purchases] = await Promise.all([
        SalesInvoice.list(),
        PurchaseInvoice.list()
      ]);

      setData({
        sales: sales || [],
        purchases: purchases || []
      });
    } catch (error) {
      console.error("Error loading GST reports data:", error);
      setData({
        sales: [],
        purchases: []
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateGSTSummary = () => {
    const gstData = {};
    const safeSales = Array.isArray(data?.sales) ? data.sales : [];
    const safePurchases = Array.isArray(data?.purchases) ? data.purchases : [];

    // Process Sales (GSTR-1)
    safeSales.forEach(invoice => {
      const items = Array.isArray(invoice?.items) ? invoice.items : [];
      items.forEach(item => {
        if(!item) return;
        const gstRate = item.gst_rate || 0;
        if (!gstData[gstRate]) gstData[gstRate] = { sales: 0, purchases: 0, gst_collected: 0, gst_paid: 0 };
        
        const itemTotal = (item.quantity || 0) * (item.rate || 0) * (1 - (item.discount || 0) / 100);
        const gstAmount = itemTotal * (gstRate / 100);
        
        gstData[gstRate].sales += itemTotal;
        gstData[gstRate].gst_collected += gstAmount;
      });
    });

    // Process Purchases (GSTR-2)
    safePurchases.forEach(invoice => {
      const items = Array.isArray(invoice?.items) ? invoice.items : [];
      items.forEach(item => {
        if(!item) return;
        const gstRate = item.gst_rate || 0;
        if (!gstData[gstRate]) gstData[gstRate] = { sales: 0, purchases: 0, gst_collected: 0, gst_paid: 0 };
        
        const itemTotal = (item.quantity || 0) * (item.rate || 0) * (1 - (item.discount || 0) / 100);
        const gstAmount = itemTotal * (gstRate / 100);
        
        gstData[gstRate].purchases += itemTotal;
        gstData[gstRate].gst_paid += gstAmount;
      });
    });

    return gstData;
  };

  const getGSTTurnover = () => {
    const safeSales = Array.isArray(data?.sales) ? data.sales : [];
    return safeSales.reduce((sum, invoice) => sum + (invoice.total_amount || 0), 0);
  };

  const getGSTFilingStatus = () => {
    // Mock GST filing status - in real app this would come from GST API
    return {
      gstr1: { filed: true, dueDate: '2025-01-11', status: 'Filed' },
      gstr3b: { filed: false, dueDate: '2025-01-20', status: 'Pending' },
      gstr2a: { filed: true, dueDate: '2025-01-13', status: 'Filed' }
    };
  };

  if (loading) {
    return <div className="text-center py-8">Loading GST reports...</div>;
  }

  const gstSummary = calculateGSTSummary();
  const totalGSTCollected = Object.values(gstSummary).reduce((sum, item) => sum + item.gst_collected, 0);
  const totalGSTPaid = Object.values(gstSummary).reduce((sum, item) => sum + item.gst_paid, 0);
  const netGSTLiability = totalGSTCollected - totalGSTPaid;
  const gstTurnover = getGSTTurnover();
  const gstFilingStatus = getGSTFilingStatus();

  return (
    <div className="space-y-6">
      {/* GST Overview Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium opacity-90">GST Collected (Output)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalGSTCollected.toLocaleString()}</div>
            <div className="flex items-center mt-2 text-sm opacity-90">
              <TrendingUp className="w-4 h-4 mr-1" />
              From sales transactions
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium opacity-90">GST Paid (Input)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalGSTPaid.toLocaleString()}</div>
            <div className="flex items-center mt-2 text-sm opacity-90">
              <TrendingDown className="w-4 h-4 mr-1" />
              From purchase transactions
            </div>
          </CardContent>
        </Card>
        
        <Card className={`bg-gradient-to-r ${netGSTLiability >= 0 ? 'from-red-500 to-red-600' : 'from-green-500 to-green-600'} text-white`}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium opacity-90">Net GST Liability</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{Math.abs(netGSTLiability).toLocaleString()}</div>
            <div className="flex items-center mt-2 text-sm opacity-90">
              {netGSTLiability >= 0 ? 
                <><AlertTriangle className="w-4 h-4 mr-1" />Amount to pay</> :
                <><CheckCircle className="w-4 h-4 mr-1" />Refund available</>
              }
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium opacity-90">GST Turnover</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{gstTurnover.toLocaleString()}</div>
            <div className="flex items-center mt-2 text-sm opacity-90">
              <Percent className="w-4 h-4 mr-1" />
              This period
            </div>
          </CardContent>
        </Card>
      </div>

      {/* GST Filing Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            GST Filing Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(gstFilingStatus).map(([form, status]) => (
              <div key={form} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                <div>
                  <div className="font-semibold text-sm uppercase">{form}</div>
                  <div className="text-xs text-slate-500">Due: {status.dueDate}</div>
                </div>
                <Badge variant={status.filed ? "default" : "destructive"}>
                  {status.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* GST Rate-wise Breakdown */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Percent className="w-5 h-5" />
              GST Rate-wise Analysis
            </CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export GSTR-1
              </Button>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export GSTR-3B
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead className="font-semibold">GST Rate</TableHead>
                  <TableHead className="font-semibold">Taxable Sales</TableHead>
                  <TableHead className="font-semibold">GST Collected</TableHead>
                  <TableHead className="font-semibold">Taxable Purchases</TableHead>
                  <TableHead className="font-semibold">GST Paid</TableHead>
                  <TableHead className="font-semibold">Net Liability</TableHead>
                  <TableHead className="font-semibold">Share</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.keys(gstSummary).length === 0 ? (
                  <TableRow>
                    <TableCell colSpan="7" className="text-center py-8 text-gray-500">
                      No GST data found
                    </TableCell>
                  </TableRow>
                ) : (
                  Object.entries(gstSummary).map(([rate, gstData]) => {
                    const netLiability = gstData.gst_collected - gstData.gst_paid;
                    const sharePercentage = totalGSTCollected > 0 ? (gstData.gst_collected / totalGSTCollected * 100) : 0;
                    
                    return (
                      <TableRow key={rate} className="hover:bg-slate-50">
                        <TableCell className="font-medium">
                          <Badge variant="outline" className="text-sm">
                            {rate}%
                          </Badge>
                        </TableCell>
                        <TableCell>₹{gstData.sales.toLocaleString()}</TableCell>
                        <TableCell className="text-green-600 font-medium">
                          ₹{gstData.gst_collected.toLocaleString()}
                        </TableCell>
                        <TableCell>₹{gstData.purchases.toLocaleString()}</TableCell>
                        <TableCell className="text-blue-600 font-medium">
                          ₹{gstData.gst_paid.toLocaleString()}
                        </TableCell>
                        <TableCell className={`font-semibold ${netLiability >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                          ₹{Math.abs(netLiability).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={sharePercentage} className="w-16 h-2" />
                            <span className="text-xs text-slate-500">{sharePercentage.toFixed(1)}%</span>
                          </div>
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

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Button variant="outline" className="flex items-center gap-2 h-12">
          <FileText className="w-4 h-4" />
          Generate GSTR-1
        </Button>
        <Button variant="outline" className="flex items-center gap-2 h-12">
          <FileText className="w-4 h-4" />
          Generate GSTR-2
        </Button>
        <Button variant="outline" className="flex items-center gap-2 h-12">
          <FileText className="w-4 h-4" />
          Generate GSTR-3B
        </Button>
        <Button variant="outline" className="flex items-center gap-2 h-12">
          <Download className="w-4 h-4" />
          Download Reports
        </Button>
      </div>
    </div>
  );
}