import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, MoreVertical, DollarSign } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { OtherIncome } from "@/api/entities";
import { format } from "date-fns";
import CreateOtherIncomeDialog from "@/components/income/CreateOtherIncomeDialog";

export default function OtherIncomePage() {
  const [incomes, setIncomes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingIncome, setEditingIncome] = useState(null);

  useEffect(() => {
    loadIncomes();
  }, []);

  const loadIncomes = async () => {
    setIsLoading(true);
    try {
      const data = await OtherIncome.list('-date');
      setIncomes(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (editingIncome) {
        await OtherIncome.update(editingIncome.id, formData);
      } else {
        await OtherIncome.create(formData);
      }
      loadIncomes();
      setIsDialogOpen(false);
      setEditingIncome(null);
    } catch (error) {
      console.error("Failed to save income:", error);
    }
  };

  const handleEdit = (income) => {
    setEditingIncome(income);
    setIsDialogOpen(true);
  };
  
  const handleDelete = async (incomeId) => {
    if(window.confirm("Are you sure you want to delete this income record?")){
      await OtherIncome.delete(incomeId);
      loadIncomes();
    }
  };

  return (
    <>
      <CreateOtherIncomeDialog
        open={isDialogOpen}
        onClose={() => { setIsDialogOpen(false); setEditingIncome(null); }}
        onSubmit={handleFormSubmit}
        income={editingIncome}
      />
      <div className="p-6 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Other Income</h1>
              <p className="text-slate-500 mt-1">Track your non-primary sources of income</p>
            </div>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Income
            </Button>
          </div>
          <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><DollarSign /> All Other Incomes</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {incomes.map(inc => (
                    <TableRow key={inc.id}>
                      <TableCell>{format(new Date(inc.date), 'dd MMM yyyy')}</TableCell>
                      <TableCell>{inc.title}</TableCell>
                      <TableCell>{inc.category.replace('_', ' ')}</TableCell>
                      <TableCell>₹{inc.amount.toLocaleString()}</TableCell>
                      <TableCell className="text-right">
                         <DropdownMenu>
                           <DropdownMenuTrigger asChild>
                             <Button variant="ghost" size="icon"><MoreVertical className="w-4 h-4" /></Button>
                           </DropdownMenuTrigger>
                           <DropdownMenuContent>
                             <DropdownMenuItem onClick={() => handleEdit(inc)}>Edit</DropdownMenuItem>
                             <DropdownMenuItem onClick={() => handleDelete(inc.id)} className="text-red-500">Delete</DropdownMenuItem>
                           </DropdownMenuContent>
                         </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}