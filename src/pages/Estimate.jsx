import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, FileText, MoreVertical } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Estimate } from "@/api/entities";
import { createPageUrl } from "@/utils";
import { format } from "date-fns";

export default function EstimatePage() {
  const [estimates, setEstimates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadEstimates();
  }, []);

  const loadEstimates = async () => {
    setIsLoading(true);
    try {
      const data = await Estimate.list('-estimate_date');
      setEstimates(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "draft": return "bg-gray-100 text-gray-800";
      case "sent": return "bg-blue-100 text-blue-800";
      case "accepted": return "bg-green-100 text-green-800";
      case "declined": return "bg-red-100 text-red-800";
      case "invoiced": return "bg-purple-100 text-purple-800";
      default: return "bg-gray-100";
    }
  };

  return (
    <div className="p-6 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Estimates / Quotations</h1>
            <p className="text-slate-500 mt-1">Create and manage your quotes</p>
          </div>
          <Link to={createPageUrl("CreateEstimate")}>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Estimate
            </Button>
          </Link>
        </div>
        <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><FileText /> All Estimates</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Estimate #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {estimates.map(est => (
                  <TableRow key={est.id}>
                    <TableCell>{format(new Date(est.estimate_date), 'dd MMM yyyy')}</TableCell>
                    <TableCell>{est.estimate_number || `EST-${est.id.slice(-4)}`}</TableCell>
                    <TableCell>{est.customer_name}</TableCell>
                    <TableCell>₹{est.total_amount?.toLocaleString()}</TableCell>
                    <TableCell><Badge className={getStatusColor(est.status)}>{est.status}</Badge></TableCell>
                    <TableCell className="text-right">
                       <DropdownMenu>
                         <DropdownMenuTrigger asChild>
                           <Button variant="ghost" size="icon"><MoreVertical className="w-4 h-4" /></Button>
                         </DropdownMenuTrigger>
                         <DropdownMenuContent>
                           <DropdownMenuItem>View</DropdownMenuItem>
                           <DropdownMenuItem>Convert to Invoice</DropdownMenuItem>
                           <DropdownMenuItem>Edit</DropdownMenuItem>
                           <DropdownMenuItem className="text-red-500">Delete</DropdownMenuItem>
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
  );
}