import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SalesInvoice } from '@/api/entities';
import { PurchaseInvoice } from '@/api/entities';
import { Expense } from '@/api/entities';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

export default function SalePurchaseReports({ dateRange }) {
  const [reportData, setReportData] = useState({
    sales: [],
    purchases: [],
    expenses: [],
  });
  const [chartData, setChartData] = useState([]);
  const [totals, setTotals] = useState({
    sales: 0,
    purchases: 0,
    expenses: 0,
    netProfit: 0,
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, [dateRange]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // In a real scenario, you'd pass date range filters to the API
      const [sales, purchases, expenses] = await Promise.all([
        SalesInvoice.list(),
        PurchaseInvoice.list(),
        Expense.list(),
      ]);

      const filteredSales = filterByDateRange(sales, dateRange, 'invoice_date');
      const filteredPurchases = filterByDateRange(purchases, dateRange, 'invoice_date');
      const filteredExpenses = filterByDateRange(expenses, dateRange, 'date');
      
      const salesTotal = filteredSales.reduce((sum, item) => sum + (item.total_amount || 0), 0);
      const purchasesTotal = filteredPurchases.reduce((sum, item) => sum + (item.total_amount || 0), 0);
      const expensesTotal = filteredExpenses.reduce((sum, item) => sum + (item.amount || 0), 0);
      
      setReportData({
        sales: filteredSales,
        purchases: filteredPurchases,
        expenses: filteredExpenses,
      });

      setTotals({
        sales: salesTotal,
        purchases: purchasesTotal,
        expenses: expensesTotal,
        netProfit: salesTotal - (purchasesTotal + expensesTotal),
      });

      // Prepare data for charting (e.g., monthly summary)
      const monthlyData = {};
      const addDataToMonthly = (items, key, dateField) => {
        items.forEach(item => {
          const month = new Date(item[dateField]).toLocaleString('default', { month: 'short' });
          if (!monthlyData[month]) {
            monthlyData[month] = { name: month, Sales: 0, Purchases: 0, Expenses: 0 };
          }
          monthlyData[month][key] += item.total_amount || item.amount;
        });
      };
      addDataToMonthly(filteredSales, 'Sales', 'invoice_date');
      addDataToMonthly(filteredPurchases, 'Purchases', 'invoice_date');
      addDataToMonthly(filteredExpenses, 'Expenses', 'date');
      setChartData(Object.values(monthlyData));

    } catch (error) {
      console.error("Failed to fetch report data:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const filterByDateRange = (items, range, dateField) => {
    const now = new Date();
    let startDate = new Date(-8640000000000000); // Far past
    let endDate = new Date(8640000000000000);   // Far future

    switch (range) {
        case 'today':
            startDate = new Date(now.setHours(0, 0, 0, 0));
            endDate = new Date(now.setHours(23, 59, 59, 999));
            break;
        case 'this_week':
            startDate = new Date(now.setDate(now.getDate() - now.getDay()));
            startDate.setHours(0, 0, 0, 0);
            break;
        case 'this_month':
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            break;
        case 'this_fiscal_year':
            const fiscalYearStartMonth = 3; // April
            let year = now.getFullYear();
            if (now.getMonth() < fiscalYearStartMonth) {
                year -= 1;
            }
            startDate = new Date(year, fiscalYearStartMonth, 1);
            break;
        case 'all_time':
        default:
            // No date filter needed
            return items;
    }
    
    return items.filter(item => {
        const itemDate = new Date(item[dateField]);
        return itemDate >= startDate && itemDate <= endDate;
    });
  };

  const formatCurrency = (amount) => `₹${(amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  if (isLoading) {
    return <div>Loading report...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <TrendingUp className="w-4 h-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totals.sales)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Purchases</CardTitle>
            <TrendingDown className="w-4 h-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totals.purchases)}</div>
          </CardContent>
        </Card>
         <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <DollarSign className="w-4 h-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totals.expenses)}</div>
          </CardContent>
        </Card>
        <Card className={totals.netProfit >= 0 ? "bg-green-50" : "bg-red-50"}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Net Profit / Loss</CardTitle>
            <DollarSign className={`w-4 h-4 ${totals.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totals.netProfit >= 0 ? 'text-green-700' : 'text-red-700'}`}>
              {formatCurrency(totals.netProfit)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis tickFormatter={(value) => `₹${value/1000}k`} />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Legend />
              <Bar dataKey="Sales" fill="#22c55e" />
              <Bar dataKey="Purchases" fill="#ef4444" />
              <Bar dataKey="Expenses" fill="#f97316" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      
      {/* Detailed Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Recent Sales</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reportData.sales.slice(0, 5).map(sale => (
                  <TableRow key={sale.id}>
                    <TableCell>{new Date(sale.invoice_date).toLocaleDateString()}</TableCell>
                    <TableCell>{sale.invoice_number}</TableCell>
                    <TableCell>{sale.customer_name}</TableCell>
                    <TableCell className="text-right">{formatCurrency(sale.total_amount)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Recent Purchases</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Bill #</TableHead>
                  <TableHead>Vendor</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reportData.purchases.slice(0, 5).map(purchase => (
                  <TableRow key={purchase.id}>
                    <TableCell>{new Date(purchase.invoice_date).toLocaleDateString()}</TableCell>
                    <TableCell>{purchase.invoice_number}</TableCell>
                    <TableCell>{purchase.vendor_name}</TableCell>
                    <TableCell className="text-right">{formatCurrency(purchase.total_amount)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}