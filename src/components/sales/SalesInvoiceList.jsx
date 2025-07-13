
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import {
  MoreVertical, Plus, ChevronDown, Settings, Search, BarChart3, FileSpreadsheet, Printer, ArrowUpDown, RefreshCw,
  FileText, Eye, Link2, MoreHorizontal, Edit, Copy, Share, Trash2
} from "lucide-react";
import { SalesInvoice } from "@/api/entities";
import { Customer } from "@/api/entities";
import { AppSettings } from "@/api/entities";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format } from "date-fns"; // For date formatting as per outline
import { Skeleton } from "@/components/ui/skeleton"; // Assuming Skeleton is available from shadcn/ui

export default function SalesInvoiceList({ invoices = [], isLoading, onRefresh, onLinkPayment }) { // Added onLinkPayment prop
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateRange, setDateRange] = useState("all");
  const [settings, setSettings] = useState({});
  const navigate = useNavigate();

  // New state variables from outline for sorting and preview
  const [sortField, setSortField] = useState('invoice_date'); // Default sort field
  const [sortDirection, setSortDirection] = useState('desc'); // Default sort direction
  const [showPreview, setShowPreview] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  useEffect(() => {
    loadCustomersAndSettings();
  }, []);

  const loadCustomersAndSettings = async () => {
    try {
      const [customersData, settingsData] = await Promise.all([
        Customer.list(),
        AppSettings.list()
      ]);
      setCustomers(Array.isArray(customersData) ? customersData : []);
      setSettings(settingsData?.[0] || {});
    } catch (error) {
      console.error("Error loading customers and settings:", error);
      setCustomers([]);
      setSettings({});
    }
  };

  const filteredInvoices = invoices.filter(invoice => {
    if (!invoice) return false;

    const invoiceNumber = (invoice.invoice_number || '').toString();
    const customerName = (invoice.customer_name || '').toString();
    const searchTerm = (searchQuery || '').toLowerCase();

    const matchesSearch = invoiceNumber.toLowerCase().includes(searchTerm) ||
                         customerName.toLowerCase().includes(searchTerm);

    const matchesCustomer = selectedCustomer === "all" || invoice.customer_id === selectedCustomer;
    const matchesStatus = statusFilter === "all" || invoice.payment_status === statusFilter;

    let matchesDate = true;
    if (dateRange !== "all" && invoice.invoice_date) {
      const invoiceDate = new Date(invoice.invoice_date);
      const today = new Date();

      switch (dateRange) {
        case "today":
          matchesDate = invoiceDate.toDateString() === today.toDateString();
          break;
        case "week":
          const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
          matchesDate = invoiceDate >= weekAgo;
          break;
        case "month":
          const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
          matchesDate = invoiceDate >= monthAgo;
          break;
        default:
          matchesDate = true;
      }
    }

    return matchesSearch && matchesCustomer && matchesStatus && matchesDate;
  });

  // New sorting logic from outline, applied to filteredInvoices
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedInvoices = [...filteredInvoices].sort((a, b) => {
    const aVal = a[sortField];
    const bVal = b[sortField];
    const multiplier = sortDirection === 'asc' ? 1 : -1;

    if (sortField === 'invoice_date') {
      const dateA = aVal ? new Date(aVal).getTime() : 0;
      const dateB = bVal ? new Date(bVal).getTime() : 0;
      return (dateA - dateB) * multiplier;
    }
    // Handle string comparisons for invoice_number and customer_name
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return aVal.localeCompare(bVal) * multiplier;
    }
    // Handle numeric comparisons for total_amount, balance_amount
    if (typeof aVal === 'number' && typeof bVal === 'number') {
        return (aVal - bVal) * multiplier;
    }
    // Fallback for other types or null/undefined
    if (aVal === null || aVal === undefined) return -1 * multiplier;
    if (bVal === null || bVal === undefined) return 1 * multiplier;
    return (aVal < bVal ? -1 : aVal > bVal ? 1 : 0) * multiplier;
  });

  // Calculate totals based on filtered invoices (preserved)
  const totalSales = filteredInvoices.reduce((sum, inv) => sum + (inv.total_amount || 0), 0);
  const totalReceived = filteredInvoices.reduce((sum, inv) => sum + (inv.paid_amount || 0), 0);
  const totalBalance = filteredInvoices.reduce((sum, inv) => sum + (inv.balance_amount || 0), 0);

  // Format currency using settings (preserved)
  const formatCurrency = (amount) => {
    const symbol = settings.business_currency || '₹';
    const decimalPlaces = settings.amount_decimal_places || 2;
    const withGrouping = settings.print_amount_with_grouping !== false;

    const formatted = new Intl.NumberFormat('en-IN', {
      minimumFractionDigits: decimalPlaces,
      maximumFractionDigits: decimalPlaces,
      useGrouping: withGrouping
    }).format(amount || 0);

    return `${symbol}${formatted}`;
  };

  const getStatusBadge = (status) => { // Preserved
    const statusConfig = {
      'paid': { class: 'bg-green-100 text-green-800', label: 'Paid' },
      'partial': { class: 'bg-yellow-100 text-yellow-800', label: 'Partial' },
      'unpaid': { class: 'bg-red-100 text-red-800', label: 'Unpaid' }
    };

    const config = statusConfig[status] || { class: 'bg-gray-100 text-gray-800', label: status };
    return <Badge className={config.class}>{config.label}</Badge>;
  };

  const handleEdit = (invoice) => { // Modified to use window.open as per outline
    window.open(createPageUrl(`CreateSalesInvoice?id=${invoice.id}`), '_blank');
  };

  const handleDelete = async (invoice) => { // Preserved
    if (window.confirm(`Are you sure you want to delete invoice ${invoice.invoice_number}?`)) {
        try {
            await SalesInvoice.delete(invoice.id);
            if (onRefresh) onRefresh();
        } catch (error) {
            console.error("Failed to delete invoice:", error);
            alert("Failed to delete invoice. Please try again.");
        }
    }
  };

  const handlePrint = (invoice) => { // Preserved
    console.log("Print invoice:", invoice.id);
  };

  // New handlePreview function for the Eye icon
  const handlePreview = (invoice) => {
    setSelectedInvoice(invoice);
    setShowPreview(true);
  };

  return (
    <div className="space-y-6">
      {/* Header with Action Buttons (preserved) */}
      <div className="flex justify-between items-center">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="text-2xl font-bold text-gray-900 p-0 hover:bg-transparent">
              Sale Invoices <ChevronDown className="w-5 h-5 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Sale Orders</DropdownMenuItem>
            <DropdownMenuItem>Estimates</DropdownMenuItem>
            <DropdownMenuItem>Proforma Invoices</DropdownMenuItem>
            <DropdownMenuItem>Delivery Challans</DropdownMenuItem>
            <DropdownMenuItem>Sale Returns</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onRefresh} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Link to={createPageUrl("CreateSalesInvoice")}>
            <Button className="bg-red-500 hover:bg-red-600 rounded-full">
              <Plus className="w-4 h-4 mr-2" />
              Add Sale
            </Button>
          </Link>
          <Button variant="ghost" size="icon">
            <Settings className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Filters (preserved) */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Input
            placeholder="Search by invoice # or party name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
          <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
        </div>
        <div className="flex flex-wrap gap-3">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Payment Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="partial">Partial</SelectItem>
              <SelectItem value="unpaid">Unpaid</SelectItem>
            </SelectContent>
          </Select>

          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-full sm:w-32">
              <SelectValue placeholder="Date Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
            <SelectTrigger className="w-full sm:w-32">
              <SelectValue placeholder="All Parties" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Parties</SelectItem>
              {customers.map(customer => (
                <SelectItem key={customer.id} value={customer.id}>
                  {customer.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary Stats (preserved) */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
          <div>
            <p className="text-sm text-gray-500 mb-1">Total Sales Amount</p>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalSales)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Total Received</p>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(totalReceived)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Total Balance Due</p>
            <p className="text-2xl font-bold text-red-600">{formatCurrency(totalBalance)}</p>
          </div>
        </div>
      </div>

      {/* Transactions Table (Replaced by outline's structure, integrated into existing layout) */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">Transactions</h3>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="w-8 h-8">
              <Search className="w-4 h-4 text-gray-500" />
            </Button>
            <Button variant="ghost" size="icon" className="w-8 h-8">
              <BarChart3 className="w-4 h-4 text-gray-500" />
            </Button>
            <Button variant="ghost" size="icon" className="w-8 h-8">
              <FileSpreadsheet className="w-4 h-4 text-green-600" />
            </Button>
            <Button variant="ghost" size="icon" className="w-8 h-8">
              <Printer className="w-4 h-4 text-gray-500" />
            </Button>
          </div>
        </div>

        {/* Outline's isLoading block for entire table */}
        {isLoading ? (
          <div className="p-4">
            {Array(5).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full mb-2" />
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow className="border-b">
                  <TableHead className="text-xs font-medium text-gray-600 py-3 px-4">
                    <Button variant="ghost" onClick={() => handleSort('invoice_date')} className="h-auto p-0 font-medium text-xs text-gray-600 hover:bg-transparent">
                      Date
                      <ArrowUpDown className="ml-2 h-3 w-3" />
                    </Button>
                  </TableHead>
                  <TableHead className="text-xs font-medium text-gray-600 py-3 px-4">
                    <Button variant="ghost" onClick={() => handleSort('invoice_number')} className="h-auto p-0 font-medium text-xs text-gray-600 hover:bg-transparent">
                      Invoice No.
                      <ArrowUpDown className="ml-2 h-3 w-3" />
                    </Button>
                  </TableHead>
                  <TableHead className="text-xs font-medium text-gray-600 py-3 px-4">
                    <Button variant="ghost" onClick={() => handleSort('customer_name')} className="h-auto p-0 font-medium text-xs text-gray-600 hover:bg-transparent">
                      Party Name
                      <ArrowUpDown className="ml-2 h-3 w-3" />
                    </Button>
                  </TableHead>
                  <TableHead className="text-xs font-medium text-gray-600 py-3 px-4 text-right">
                    <Button variant="ghost" onClick={() => handleSort('total_amount')} className="h-auto p-0 font-medium text-xs text-gray-600 hover:bg-transparent">
                      Amount
                      <ArrowUpDown className="ml-2 h-3 w-3" />
                    </Button>
                  </TableHead>
                  <TableHead className="text-xs font-medium text-gray-600 py-3 px-4 text-right">
                    <Button variant="ghost" onClick={() => handleSort('balance_amount')} className="h-auto p-0 font-medium text-xs text-gray-600 hover:bg-transparent">
                      Balance
                      <ArrowUpDown className="ml-2 h-3 w-3" />
                    </Button>
                  </TableHead>
                  <TableHead className="text-xs font-medium text-gray-600 py-3 px-4 text-center">Status</TableHead>
                  <TableHead className="text-xs font-medium text-gray-600 py-3 px-4 text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedInvoices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12">
                      <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No Sales Invoices Found</h3>
                      <p className="text-slate-500 mb-4">
                        {invoices.length === 0
                          ? 'Create your first sales invoice to get started.'
                          : 'No transactions match your current filters.'}
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  sortedInvoices.map((invoice) => (
                    <TableRow key={invoice.id} className="hover:bg-gray-50 border-b border-gray-100">
                      <TableCell className="text-sm py-4 px-4 text-gray-900">
                        {invoice.invoice_date ? format(new Date(invoice.invoice_date), "dd MMM yyyy") : 'N/A'}
                      </TableCell>
                      <TableCell className="text-sm font-medium text-blue-600 hover:underline py-4 px-4">
                        <Link to={createPageUrl(`CreateSalesInvoice?id=${invoice.id}`)}>
                          {invoice.invoice_number}
                        </Link>
                      </TableCell>
                      <TableCell className="text-sm py-4 px-4 text-gray-900">
                        {invoice.customer_name}
                      </TableCell>
                      <TableCell className="text-sm py-4 px-4 font-medium text-gray-900 text-right">
                        {formatCurrency(invoice.total_amount)}
                      </TableCell>
                      <TableCell className="text-sm py-4 px-4 font-medium text-gray-900 text-right">
                        {formatCurrency(invoice.balance_amount)}
                      </TableCell>
                      <TableCell className="py-4 px-4 text-center">
                        {getStatusBadge(invoice.payment_status)}
                      </TableCell>
                      <TableCell className="py-4 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handlePreview(invoice)}
                            className="h-8 w-8"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>

                          {/* Payment Link Button from outline */}
                          {invoice.payment_status !== 'paid' && onLinkPayment && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => onLinkPayment(invoice)}
                              className="h-8 w-8 text-green-600 hover:text-green-700"
                              title="Link Payment"
                            >
                              <Link2 className="h-4 w-4" /> {/* Using Link2 for lucide-react link icon */}
                            </Button>
                          )}

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" /> {/* Changed from MoreVertical as per outline */}
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEdit(invoice)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => console.log('Duplicate invoice', invoice.id)}>
                                <Copy className="mr-2 h-4 w-4" />
                                Duplicate
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handlePrint(invoice)}>
                                <Printer className="mr-2 h-4 w-4" />
                                Print
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => console.log('Share invoice', invoice.id)}>
                                <Share className="mr-2 h-4 w-4" />
                                Share
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleDelete(invoice)}
                                className="text-red-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Preview Dialog (Implemented based on outline's comment) */}
      {showPreview && selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full">
            <h3 className="text-xl font-bold mb-4">Invoice Preview: {selectedInvoice.invoice_number}</h3>
            <div className="space-y-2 text-sm text-gray-700">
              <p><strong>Customer:</strong> {selectedInvoice.customer_name}</p>
              <p><strong>Total Amount:</strong> {formatCurrency(selectedInvoice.total_amount)}</p>
              <p><strong>Balance:</strong> {formatCurrency(selectedInvoice.balance_amount)}</p>
              <p><strong>Status:</strong> {selectedInvoice.payment_status}</p>
              <p><strong>Date:</strong> {selectedInvoice.invoice_date ? format(new Date(selectedInvoice.invoice_date), "dd MMM yyyy") : 'N/A'}</p>
              {/* Add more invoice details as needed */}
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowPreview(false)}>Close</Button>
              <Button onClick={() => handleEdit(selectedInvoice)}>Edit Invoice</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
