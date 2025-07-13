import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Truck, MoreVertical } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { DeliveryChallan } from "@/api/entities";
import { createPageUrl } from "@/utils";
import { format } from "date-fns";

export default function DeliveryChallanPage() {
  const [challans, setChallans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadChallans();
  }, []);

  const loadChallans = async () => {
    setIsLoading(true);
    try {
      const data = await DeliveryChallan.list('-challan_date');
      setChallans(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "delivered": return "bg-blue-100 text-blue-800";
      case "invoiced": return "bg-green-100 text-green-800";
      case "returned": return "bg-red-100 text-red-800";
      default: return "bg-gray-100";
    }
  };

  return (
    <div className="p-6 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Delivery Challans</h1>
            <p className="text-slate-500 mt-1">Track goods delivery and dispatch</p>
          </div>
          <Link to={createPageUrl("CreateDeliveryChallan")}>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Challan
            </Button>
          </Link>
        </div>
        <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Truck /> All Delivery Challans</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Challan #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {challans.map(challan => (
                  <TableRow key={challan.id}>
                    <TableCell>{format(new Date(challan.challan_date), 'dd MMM yyyy')}</TableCell>
                    <TableCell>{challan.challan_number || `CH-${challan.id.slice(-4)}`}</TableCell>
                    <TableCell>{challan.customer_name}</TableCell>
                    <TableCell><Badge className={getStatusColor(challan.status)}>{challan.status}</Badge></TableCell>
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