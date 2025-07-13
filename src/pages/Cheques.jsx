import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, MoreVertical, Edit, Trash2, CheckCircle, XCircle, Clock, Banknote, ChevronsUpDown } from "lucide-react";
import { Cheque, Customer, Vendor } from "@/api/entities";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import ManageChequeDialog from '../components/cheques/ManageChequeDialog';
import UpdateChequeStatusDialog from '../components/cheques/UpdateChequeStatusDialog';

export default function Cheques() {
  const [cheques, setCheques] = useState([]);
  const [parties, setParties] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showManageDialog, setShowManageDialog] = useState(false);
  const [editingCheque, setEditingCheque] = useState(null);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [statusCheque, setStatusCheque] = useState(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [chequesData, customersData, vendorsData] = await Promise.all([
        Cheque.list('-due_date'),
        Customer.list(),
        Vendor.list()
      ]);
      setCheques(Array.isArray(chequesData) ? chequesData : []);
      const allParties = [
        ...(Array.isArray(customersData) ? customersData.map(c => ({...c, type: 'Customer'})) : []),
        ...(Array.isArray(vendorsData) ? vendorsData.map(v => ({...v, type: 'Vendor'})) : [])
      ];
      setParties(allParties);
    } catch (error) {
      console.error("Error loading cheques data:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleManageCheque = async (chequeData) => {
    try {
      if (editingCheque) {
        await Cheque.update(editingCheque.id, chequeData);
      } else {
        await Cheque.create(chequeData);
      }
      setShowManageDialog(false);
      setEditingCheque(null);
      loadData();
    } catch (error) {
      console.error("Error saving cheque:", error);
    }
  };

  const handleDeleteCheque = async (chequeId) => {
    if (window.confirm('Are you sure you want to delete this cheque record?')) {
      try {
        await Cheque.delete(chequeId);
        loadData();
      } catch (error) {
        console.error("Error deleting cheque:", error);
      }
    }
  };

  const handleUpdateStatus = async (cheque, newStatus) => {
    try {
      await Cheque.update(cheque.id, { status: newStatus });
      setShowStatusDialog(false);
      setStatusCheque(null);
      loadData();
    } catch (error) {
      console.error("Error updating cheque status:", error);
    }
  };

  const openEditDialog = (cheque) => {
    setEditingCheque(cheque);
    setShowManageDialog(true);
  };
  
  const openStatusDialog = (cheque) => {
    setStatusCheque(cheque);
    setShowStatusDialog(true);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Cleared': return <Badge variant="success" className="bg-green-100 text-green-800">Cleared</Badge>;
      case 'Deposited': return <Badge variant="info" className="bg-blue-100 text-blue-800">Deposited</Badge>;
      case 'Bounced': return <Badge variant="destructive">Bounced</Badge>;
      case 'Pending':
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  return (
    <div className="p-6 bg-slate-50 min-h-full">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Cheque Management</h1>
          <p className="text-slate-500 mt-1">Track all received and issued cheques.</p>
        </div>
        <Button onClick={() => { setEditingCheque(null); setShowManageDialog(true); }}>
          <Plus className="w-4 h-4 mr-2" /> Add Cheque
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Due Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Cheque No.</TableHead>
                <TableHead>Party</TableHead>
                <TableHead>Bank</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={8} className="text-center">Loading...</TableCell></TableRow>
              ) : cheques.length === 0 ? (
                <TableRow><TableCell colSpan={8} className="text-center h-24">No cheques found.</TableCell></TableRow>
              ) : (
                cheques.map(cheque => (
                  <TableRow key={cheque.id}>
                    <TableCell>{format(new Date(cheque.due_date), 'dd MMM yyyy')}</TableCell>
                    <TableCell>
                        <Badge variant={cheque.type === 'Received' ? 'outline-success' : 'outline-danger'}>
                            {cheque.type}
                        </Badge>
                    </TableCell>
                    <TableCell className="font-medium">{cheque.cheque_number}</TableCell>
                    <TableCell>{cheque.party_name}</TableCell>
                    <TableCell>{cheque.bank_name}</TableCell>
                    <TableCell className="text-right font-semibold">₹{cheque.amount.toLocaleString('en-IN')}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" onClick={() => openStatusDialog(cheque)}>
                        {getStatusBadge(cheque.status)}
                      </Button>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="w-8 h-8">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => openEditDialog(cheque)}>
                            <Edit className="w-4 h-4 mr-2" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openStatusDialog(cheque)}>
                            <ChevronsUpDown className="w-4 h-4 mr-2" /> Update Status
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDeleteCheque(cheque.id)} className="text-red-600">
                            <Trash2 className="w-4 h-4 mr-2" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <ManageChequeDialog
        open={showManageDialog}
        onClose={() => setShowManageDialog(false)}
        onSubmit={handleManageCheque}
        cheque={editingCheque}
        parties={parties}
      />
      
      <UpdateChequeStatusDialog
        open={showStatusDialog}
        onClose={() => setShowStatusDialog(false)}
        onSubmit={handleUpdateStatus}
        cheque={statusCheque}
      />
    </div>
  );
}