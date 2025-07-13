import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PieChart, Receipt } from "lucide-react";
import { format } from "date-fns";
import { Expense } from "@/api/entities";

export default function ExpenseReports({ dateRange, isLoading }) {
  const [data, setData] = useState({
    expenses: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [dateRange]);

  const loadData = async () => {
    setLoading(true);
    try {
      const expenses = await Expense.list();
      setData({
        expenses: expenses || []
      });
    } catch (error) {
      console.error("Error loading expense reports data:", error);
      setData({
        expenses: []
      });
    } finally {
      setLoading(false);
    }
  };

  const expenseByCategory = {};
  const totalExpenses = data.expenses?.reduce((sum, expense) => {
    const category = expense.category || 'other';
    if (!expenseByCategory[category]) expenseByCategory[category] = 0;
    expenseByCategory[category] += expense.amount;
    return sum + expense.amount;
  }, 0) || 0;

  const topCategories = Object.entries(expenseByCategory)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);

  if (loading) {
    return <div className="text-center py-8">Loading expense reports...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Expense Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-500">Total Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">₹{totalExpenses.toLocaleString()}</div>
            <p className="text-xs text-slate-500 mt-1">{data.expenses?.length || 0} transactions</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-500">Average per Day</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">
              ₹{Math.round(totalExpenses / 30).toLocaleString()}
            </div>
            <p className="text-xs text-slate-500 mt-1">Based on last 30 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Category-wise Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="w-5 h-5" />
            Category-wise Expenses
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topCategories.length === 0 ? (
              <p className="text-center text-slate-500 py-8">No expense categories found</p>
            ) : (
              topCategories.map(([category, amount]) => {
                const percentage = (amount / totalExpenses) * 100;
                return (
                  <div key={category} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">{category.replace('_', ' ')}</Badge>
                      <div className="w-48 bg-slate-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">₹{amount.toLocaleString()}</p>
                      <p className="text-xs text-slate-500">{percentage.toFixed(1)}%</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Expenses */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="w-5 h-5" />
            Recent Expenses
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Payment Method</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.expenses?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan="5" className="text-center py-8 text-gray-500">
                      No expenses found
                    </TableCell>
                  </TableRow>
                ) : (
                  data.expenses?.slice(0, 10).map((expense) => (
                    <TableRow key={expense.id}>
                      <TableCell>{format(new Date(expense.date), "dd MMM yyyy")}</TableCell>
                      <TableCell className="font-medium">{expense.title}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{expense.category?.replace('_', ' ')}</Badge>
                      </TableCell>
                      <TableCell className="text-red-600 font-semibold">₹{expense.amount.toLocaleString()}</TableCell>
                      <TableCell>{expense.payment_method}</TableCell>
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