
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { BookOpen, TrendingUp, TrendingDown } from "lucide-react";
import { format } from "date-fns";

export default function TransactionReports({ data, dateRange, isLoading }) {
  const getDaybook = () => {
    const allTransactions = [];
    const safeSales = Array.isArray(data.sales) ? data.sales : [];
    const safePurchases = Array.isArray(data.purchases) ? data.purchases : [];
    const safeExpenses = Array.isArray(data.expenses) ? data.expenses : [];
    
    // Add sales transactions
    safeSales.forEach(sale => {
      allTransactions.push({
        date: sale.invoice_date,
        type: 'Sale',
        reference: sale.invoice_number,
        party: sale.customer_name,
        debit: sale.total_amount,
        credit: 0,
        balance_effect: sale.total_amount
      });
    });

    // Add purchase transactions  
    safePurchases.forEach(purchase => {
      allTransactions.push({
        date: purchase.invoice_date,
        type: 'Purchase',
        reference: purchase.invoice_number,
        party: purchase.vendor_name,
        debit: 0,
        credit: purchase.total_amount,
        balance_effect: -purchase.total_amount
      });
    });

    // Add expense transactions
    safeExpenses.forEach(expense => {
      allTransactions.push({
        date: expense.date,
        type: 'Expense',
        reference: expense.title,
        party: expense.vendor_name || 'Direct',
        debit: 0,
        credit: expense.amount,
        balance_effect: -expense.amount
      });
    });

    return allTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  const daybook = getDaybook();
  const totalInflow = daybook.reduce((sum, t) => sum + t.debit, 0);
  const totalOutflow = daybook.reduce((sum, t) => sum + t.credit, 0);
  const netCashFlow = totalInflow - totalOutflow;

  return (
    <div className="space-y-6">
      {/* Cash Flow Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-500" />
              Cash Inflow
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">₹{totalInflow.toLocaleString()}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-red-500" />
              Cash Outflow
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">₹{totalOutflow.toLocaleString()}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-500">Net Cash Flow</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ₹{Math.abs(netCashFlow).toLocaleString()}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {netCashFlow >= 0 ? 'Positive' : 'Negative'} cash flow
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Daybook */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Daybook - All Transactions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead>Party</TableHead>
                  <TableHead>Debit</TableHead>
                  <TableHead>Credit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {daybook.slice(0, 20).map((transaction, index) => (
                  <TableRow key={index}>
                    <TableCell>{format(new Date(transaction.date), "dd MMM yyyy")}</TableCell>
                    <TableCell>
                      <Badge variant={transaction.type === 'Sale' ? 'default' : 'secondary'}>
                        {transaction.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">{transaction.reference}</TableCell>
                    <TableCell>{transaction.party}</TableCell>
                    <TableCell className="text-green-600">
                      {transaction.debit > 0 ? `₹${transaction.debit.toLocaleString()}` : '-'}
                    </TableCell>
                    <TableCell className="text-red-600">
                      {transaction.credit > 0 ? `₹${transaction.credit.toLocaleString()}` : '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {daybook.length > 20 && (
            <p className="text-center text-slate-500 mt-4">
              Showing latest 20 transactions. Total: {daybook.length} transactions
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
