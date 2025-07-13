
import React, { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, MoreVertical, ArrowUp, Edit, Trash2 } from "lucide-react";
import { Expense } from "@/api/entities";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export default function ExpensePage() {
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categorySearch, setCategorySearch] = useState("");
  const [transactionSearch, setTransactionSearch] = useState("");

  useEffect(() => {
    loadExpenses();
  }, []);

  const loadExpenses = async () => {
    setIsLoading(true);
    try {
      const data = await Expense.list('-bill_date');
      const expensesData = data || [];
      setExpenses(expensesData);
      if (expensesData.length > 0) {
        const grouped = groupExpensesByCategory(expensesData);
        // Safely get the first category name, ensuring 'grouped' is not empty
        const firstCategory = Object.keys(grouped).sort()[0];
        setSelectedCategory(firstCategory);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteExpense = async (expenseId) => {
      if (window.confirm("Are you sure you want to delete this expense?")) {
          try {
              await Expense.delete(expenseId);
              loadExpenses();
          } catch(e) {
              console.error("Failed to delete expense", e);
              alert("Could not delete expense.");
          }
      }
  }
  
  const groupExpensesByCategory = (expensesList) => {
    return expensesList.reduce((acc, expense) => {
      const category = expense.category || 'uncategorized';
      if (!acc[category]) {
        acc[category] = {
          total: 0,
          expenses: []
        };
      }
      acc[category].total += expense.amount; // Assuming 'amount' is still the relevant field for category total
      acc[category].expenses.push(expense);
      return acc;
    }, {});
  }
  
  const expenseCategories = useMemo(() => {
    if (!expenses) return [];
    const grouped = groupExpensesByCategory(expenses);
    return Object.entries(grouped)
      .map(([name, data]) => ({ name, total: data.total }))
      .filter(cat => cat.name.toLowerCase().replace(/_/g, ' ').includes(categorySearch.toLowerCase()))
      .sort((a,b) => a.name.localeCompare(b.name));
  }, [expenses, categorySearch]);

  const selectedCategoryExpenses = useMemo(() => {
    if (!selectedCategory || !expenses) return [];
    return expenses
      .filter(exp => exp.category === selectedCategory)
      .filter(exp => 
        (exp.vendor_name || '').toLowerCase().includes(transactionSearch.toLowerCase()) ||
        (exp.expense_number || '').toLowerCase().includes(transactionSearch.toLowerCase())
      );
  }, [selectedCategory, expenses, transactionSearch]);
  
  const selectedCategoryTotals = useMemo(() => {
    if (!selectedCategory) return { total: 0, balance: 0 };
    const categoryData = expenseCategories.find(c => c.name === selectedCategory);
    const balance = selectedCategoryExpenses.reduce((sum, exp) => sum + (exp.balance_amount || 0), 0);
    return {
      total: categoryData ? categoryData.total : 0,
      balance: balance
    };
  }, [selectedCategory, selectedCategoryExpenses, expenseCategories]);
  
  const formatCategoryName = (name) => name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  const getStatusBadge = (status) => {
    switch (status) {
      case 'paid': return <Badge className="bg-green-100 text-green-800 border-green-200">Paid</Badge>;
      case 'partial': return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Partial</Badge>;
      case 'unpaid': return <Badge className="bg-red-100 text-red-800 border-red-200">Unpaid</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (isLoading) {
    return <div className="p-6 flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Left Panel: Categories */}
      <div className="w-[380px] flex flex-col border-r bg-white p-4 flex-shrink-0">
        <div className="flex items-center gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input 
              placeholder="Search category..." 
              className="pl-9 bg-slate-50"
              value={categorySearch}
              onChange={(e) => setCategorySearch(e.target.value)}
            />
          </div>
          <Link to={createPageUrl("CreateExpense")}>
            <Button className="bg-red-500 hover:bg-red-600">
              <Plus className="w-4 h-4 mr-2" />
              Add Expense
            </Button>
          </Link>
        </div>
        <div className="flex justify-between items-center text-xs font-semibold text-gray-500 px-3 py-2 border-b">
          <div className="flex items-center gap-1 cursor-pointer">
            CATEGORY <ArrowUp className="w-3 h-3" />
          </div>
          <span>AMOUNT</span>
        </div>
        <div className="flex-1 overflow-y-auto pr-2">
          {expenseCategories.map(cat => (
            <div
              key={cat.name}
              className={`flex justify-between items-center p-3 cursor-pointer rounded-md hover:bg-blue-50 group ${selectedCategory === cat.name ? 'bg-blue-100' : ''}`}
              onClick={() => setSelectedCategory(cat.name)}
            >
              <span className="font-medium text-sm text-slate-800">{formatCategoryName(cat.name)}</span>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-700">₹{cat.total.toLocaleString()}</span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem>Edit Category</DropdownMenuItem>
                    <DropdownMenuItem className="text-red-500">Delete Category</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Right Panel: Transactions */}
      <div className="flex-1 flex flex-col p-6">
        {selectedCategory ? (
          <>
            <div className="flex justify-between items-center mb-4 pb-4 border-b">
              <div>
                <h2 className="text-xl font-bold uppercase">{formatCategoryName(selectedCategory)}</h2>
                <p className="text-sm text-gray-500">Direct Expense</p>
              </div>
              <div className="text-right">
                <p className="text-sm">Total: <span className="font-semibold">₹{selectedCategoryTotals.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span></p>
                <p className="text-sm">Balance: <span className="font-semibold text-red-600">₹{selectedCategoryTotals.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span></p>
              </div>
            </div>
            
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input 
                placeholder="Search in this category..." 
                className="pl-9 bg-white"
                value={transactionSearch}
                onChange={(e) => setTransactionSearch(e.target.value)}
              />
            </div>
            
            <div className="flex-1 overflow-y-auto rounded-lg border bg-white">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead>DATE</TableHead>
                    <TableHead>EXP NO.</TableHead>
                    <TableHead>PARTY</TableHead>
                    <TableHead>CATEGORY</TableHead>
                    <TableHead>AMOUNT</TableHead>
                    <TableHead>BALANCE</TableHead>
                    <TableHead>STATUS</TableHead>
                    <TableHead className="w-8"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedCategoryExpenses.length > 0 ? selectedCategoryExpenses.map(exp => (
                    <TableRow key={exp.id}>
                      <TableCell>{exp.bill_date ? format(new Date(exp.bill_date), 'dd/MM/yyyy') : 'N/A'}</TableCell>
                      <TableCell>{exp.expense_number}</TableCell>
                      <TableCell>{exp.vendor_name || 'N/A'}</TableCell>
                      <TableCell>{formatCategoryName(exp.category)}</TableCell>
                      <TableCell>₹{exp.total_amount?.toLocaleString()}</TableCell>
                      <TableCell>₹{(exp.balance_amount || 0).toLocaleString()}</TableCell>
                      <TableCell>{getStatusBadge(exp.payment_status)}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-6 w-6"><MoreVertical className="w-4 h-4" /></Button></DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => navigate(createPageUrl(`CreateExpense?id=${exp.id}`))}>
                                <Edit className="w-4 h-4 mr-2" />View/Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem disabled>Payment History</DropdownMenuItem>
                            <DropdownMenuItem className="text-red-500" onClick={() => handleDeleteExpense(exp.id)}>
                                <Trash2 className="w-4 h-4 mr-2" />Delete
                            </DropdownMenuItem>
                            <DropdownMenuItem disabled>Duplicate</DropdownMenuItem>
                            <DropdownMenuItem disabled>Open PDF</DropdownMenuItem>
                            <DropdownMenuItem disabled>Preview</DropdownMenuItem>
                            <DropdownMenuItem disabled>Print</DropdownMenuItem>
                            <DropdownMenuItem disabled>View History</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell colSpan="8" className="text-center h-24 text-gray-500">
                        No expenses found for this category.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">Select a category to view expenses.</p>
          </div>
        )}
      </div>
    </div>
  );
}
