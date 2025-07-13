
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search, Filter, ShoppingCart, DollarSign, Building, FileText, Package, Undo2, Receipt, Link as LinkIcon } from "lucide-react";
import { PurchaseInvoice } from "@/api/entities";
import { Vendor } from "@/api/entities";
import { PurchaseOrder } from "@/api/entities";
import { PurchaseReturn } from "@/api/entities";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import PurchaseInvoiceList from "../components/purchase/PurchaseInvoiceList";
import PurchaseOrderList from "../components/purchase/PurchaseOrderList";
import PurchaseReturnList from "../components/purchase/PurchaseReturnList";

export default function Purchase() {
  const [activeTab, setActiveTab] = useState("bills");
  const [invoices, setInvoices] = useState([]);
  const [orders, setOrders] = useState([]);
  const [returns, setReturns] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateRange, setDateRange] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [showLinkPaymentDialog, setShowLinkPaymentDialog] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [invoicesData, ordersData, returnsData, vendorsData] = await Promise.all([
        PurchaseInvoice.list('-invoice_date'),
        PurchaseOrder.list('-order_date'),
        PurchaseReturn.list('-return_date'),
        Vendor.list()
      ]);
      
      setInvoices(Array.isArray(invoicesData) ? invoicesData : []);
      setOrders(Array.isArray(ordersData) ? ordersData : []);
      setReturns(Array.isArray(returnsData) ? returnsData : []);
      setVendors(Array.isArray(vendorsData) ? vendorsData : []);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterData = (data, dateField) => {
    if (!Array.isArray(data)) return [];
    return data.filter(item => {
      if (!item) return false;
      const lowerCaseQuery = searchQuery.toLowerCase();

      const matchesSearch = item.invoice_number?.toLowerCase().includes(lowerCaseQuery) ||
                           item.order_number?.toLowerCase().includes(lowerCaseQuery) ||
                           item.return_number?.toLowerCase().includes(lowerCaseQuery) ||
                           item.vendor_name?.toLowerCase().includes(lowerCaseQuery);
      
      const matchesVendor = selectedVendor === "all" || item.vendor_id === selectedVendor;
      
      const matchesStatus = statusFilter === "all" || 
                           item.payment_status?.toLowerCase() === statusFilter.toLowerCase() ||
                           item.status?.toLowerCase() === statusFilter.toLowerCase();
      
      let matchesDate = true;
      if (dateRange !== "all") {
        const itemDate = new Date(item[dateField]);
        const today = new Date();
        
        switch (dateRange) {
          case "today":
            matchesDate = itemDate.toDateString() === today.toDateString();
            break;
          case "week":
            const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
            matchesDate = itemDate >= weekAgo;
            break;
          case "month":
            const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
            matchesDate = itemDate >= monthAgo;
            break;
          default:
            matchesDate = true;
        }
      }
      
      return matchesSearch && matchesVendor && matchesStatus && matchesDate;
    });
  };

  const filteredInvoices = filterData(invoices, 'invoice_date');
  const filteredOrders = filterData(orders, 'order_date');
  const filteredReturns = filterData(returns, 'return_date');

  const totalPurchases = filteredInvoices.reduce((sum, inv) => sum + (inv.total_amount || 0), 0);
  const totalPaid = filteredInvoices.reduce((sum, inv) => sum + (inv.paid_amount || 0), 0);
  const totalPending = filteredInvoices.reduce((sum, inv) => sum + (inv.balance_amount || 0), 0);

  const handleLinkPayment = (invoice) => {
    setSelectedInvoice(invoice);
    setShowLinkPaymentDialog(true);
  };

  const getAddButtonConfig = () => {
    switch (activeTab) {
      case "bills":
        return { text: "Add Purchase Bill", link: createPageUrl("CreatePurchaseInvoice") };
      case "orders":
        return { text: "Add Purchase Order", link: createPageUrl("CreatePurchaseOrder") };
      case "returns":
        return { text: "Add Purchase Return", link: createPageUrl("CreatePurchaseReturn") };
      default:
        return { text: "Add Purchase Bill", link: createPageUrl("CreatePurchaseInvoice") };
    }
  };

  const addButtonConfig = getAddButtonConfig();

  return (
    <div className="p-6 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Purchase Management</h1>
            <p className="text-slate-500 mt-1">Track and manage all your purchase transactions</p>
          </div>
          <div className="flex items-center gap-3">
            <Link to={createPageUrl("Payments?type=payment_out")}>
              <Button variant="outline" className="bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100">
                <LinkIcon className="w-4 h-4 mr-2" />
                Link Payments
              </Button>
            </Link>
            <Link to={addButtonConfig.link}>
              <Button className="bg-purple-600 hover:bg-purple-700">
                <Plus className="w-4 h-4 mr-2" />
                {addButtonConfig.text}
              </Button>
            </Link>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Total Purchases</p>
                  <p className="text-2xl font-bold">₹{totalPurchases.toLocaleString()}</p>
                </div>
                <ShoppingCart className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Amount Paid</p>
                  <p className="text-2xl font-bold">₹{totalPaid.toLocaleString()}</p>
                </div>
                <DollarSign className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Amount Pending</p>
                  <p className="text-2xl font-bold">₹{totalPending.toLocaleString()}</p>
                </div>
                <FileText className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Total Vendors</p>
                  <p className="text-2xl font-bold">{vendors.length}</p>
                </div>
                <Building className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="bg-white/80 backdrop-blur-sm shadow-lg mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                    placeholder="Search transactions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="w-full md:w-48">
                <Select value={selectedVendor} onValueChange={setSelectedVendor}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Vendors" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Vendors</SelectItem>
                    {vendors.map(vendor => (
                      <SelectItem key={vendor.id} value={vendor.id}>
                        {vendor.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="w-full md:w-40">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    {activeTab === "bills" && (
                      <>
                        <SelectItem value="paid">Paid</SelectItem>
                        <SelectItem value="partial">Partial</SelectItem>
                        <SelectItem value="unpaid">Unpaid</SelectItem>
                      </>
                    )}
                    {activeTab === "orders" && (
                      <>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="received">Received</SelectItem>
                        <SelectItem value="partial">Partial</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </>
                    )}
                    {activeTab === "returns" && (
                      <>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="w-full md:w-40">
                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Purchase Data with Tabs */}
        <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
          <CardContent className="p-0">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <div className="flex items-center justify-between p-6 border-b">
                <TabsList className="grid w-full grid-cols-3 max-w-lg">
                  <TabsTrigger value="bills" className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Bills ({filteredInvoices.length})
                  </TabsTrigger>
                  <TabsTrigger value="orders" className="flex items-center gap-2">
                    <ShoppingCart className="w-4 h-4" />
                    Orders ({filteredOrders.length})
                  </TabsTrigger>
                  <TabsTrigger value="returns" className="flex items-center gap-2">
                    <Undo2 className="w-4 h-4" />
                    Returns ({filteredReturns.length})
                  </TabsTrigger>
                </TabsList>
              </div>
              
              <TabsContent value="bills" className="p-6">
                <PurchaseInvoiceList 
                  invoices={filteredInvoices}
                  onInvoiceUpdate={loadData}
                  isLoading={isLoading}
                  onLinkPayment={handleLinkPayment}
                />
              </TabsContent>
              
              <TabsContent value="orders" className="p-6">
                <PurchaseOrderList 
                  orders={filteredOrders}
                  onOrderUpdate={loadData}
                  isLoading={isLoading}
                />
              </TabsContent>
              
              <TabsContent value="returns" className="p-6">
                <PurchaseReturnList 
                  returns={filteredReturns}
                  onReturnUpdate={loadData}
                  isLoading={isLoading}
                  onLinkPayment={handleLinkPayment}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
