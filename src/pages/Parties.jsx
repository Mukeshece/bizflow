
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Plus, Search, Users, Building, Phone, Mail, MapPin, MoreHorizontal, Eye, Edit, Trash2, CreditCard, Clock, Filter, ArrowUpDown, ChevronDown, Settings, Package, TrendingUp, ShoppingCart } from "lucide-react";
import { Customer } from "@/api/entities";
import { Vendor } from "@/api/entities";
import { SalesInvoice } from "@/api/entities";
import { PurchaseInvoice } from "@/api/entities";
import { Payment } from "@/api/entities";

import AddPartyDialog from "../components/parties/AddPartyDialog";
import EditPartyDialog from "../components/parties/EditPartyDialog";
import PartyDetails from "../components/parties/PartyDetails";

export default function Parties() {
  const [customers, setCustomers] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [salesInvoices, setSalesInvoices] = useState([]);
  const [purchaseInvoices, setPurchaseInvoices] = useState([]);
  const [payments, setPayments] = useState([]);
  const [selectedParty, setSelectedParty] = useState(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingParty, setEditingParty] = useState(null);

  const [partyType, setPartyType] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [customersData, vendorsData, salesData, purchaseData, paymentsData] = await Promise.all([
        Customer.list('-created_date'),
        Vendor.list('-created_date'),
        SalesInvoice.list(),
        PurchaseInvoice.list(),
        Payment.list()
      ]);
      setCustomers(Array.isArray(customersData) ? customersData : []);
      setVendors(Array.isArray(vendorsData) ? vendorsData : []);
      setSalesInvoices(Array.isArray(salesData) ? salesData : []);
      setPurchaseInvoices(Array.isArray(purchaseData) ? purchaseData : []);
      setPayments(Array.isArray(paymentsData) ? paymentsData : []);
      
      // Auto-select first party if none selected
      const allParties = [
        ...(Array.isArray(customersData) ? customersData : []).map(c => ({...c, type: 'customer'})),
        ...(Array.isArray(vendorsData) ? vendorsData : []).map(v => ({...v, type: 'vendor'}))
      ];
      if (allParties.length > 0 && !selectedParty) {
        setSelectedParty(allParties[0]);
      }
    } catch (error) {
      console.error("Error loading data:", error);
      // Set empty arrays as fallback
      setCustomers([]);
      setVendors([]);
      setSalesInvoices([]);
      setPurchaseInvoices([]);
      setPayments([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddParty = async (partyData) => {
    try {
      const isVendorGroup = partyData.party_group === 'Vendor';
      
      if (!isVendorGroup) {
        await Customer.create(partyData);
      } else {
        await Vendor.create(partyData);
      }
      setShowAddDialog(false);
      loadData();
    } catch (error) {
      console.error("Error adding party:", error);
    }
  };

  const handleEditParty = (party, type) => {
    setEditingParty({ ...party, type });
    setShowEditDialog(true);
  };

  const handleUpdateParty = async (id, partyData) => {
    try {
      if (editingParty.type === "customer") {
        await Customer.update(id, partyData);
      } else {
        await Vendor.update(id, partyData);
      }
      setShowEditDialog(false);
      setEditingParty(null);
      loadData();
      if (selectedParty?.id === id) {
        setSelectedParty({ ...selectedParty, ...partyData, type: editingParty.type });
      }
    } catch (error) {
      console.error("Error updating party:", error);
    }
  };

  const handleDeleteParty = async (party, type) => {
    if (window.confirm(`Are you sure you want to delete "${party.name}"?`)) {
      try {
        if (type === "customer") {
          await Customer.delete(party.id);
        } else {
          await Vendor.delete(party.id);
        }
        loadData();
        if (selectedParty?.id === party.id) {
          setSelectedParty(null);
        }
      } catch (error) {
        console.error("Error deleting party:", error);
      }
    }
  };
  
  const getFilteredParties = (parties, type) => {
    if (!Array.isArray(parties)) return [];
    return parties.filter(party => {
      if (!party) return false;
      
      const name = (party.name || '').toString();
      const email = (party.email || '').toString();
      const phone = (party.phone || '').toString();
      const gst = (party.gst_number || '').toString();
      
      const searchTerm = (searchQuery || '').toLowerCase();
  
      const matchesSearch = name.toLowerCase().includes(searchTerm) ||
        email.toLowerCase().includes(searchTerm) ||
        phone.includes(searchTerm) ||
        gst.toLowerCase().includes(searchTerm);
      
      return matchesSearch;
    }).map(party => ({...party, type}));
  };

  const filteredCustomers = getFilteredParties(customers, 'customer');
  const filteredVendors = getFilteredParties(vendors, 'vendor');

  let displayedParties = [];
  if (partyType === 'customers') {
      displayedParties = filteredCustomers;
  } else if (partyType === 'vendors') {
      displayedParties = filteredVendors;
  } else {
      displayedParties = [...filteredCustomers, ...filteredVendors].sort((a, b) => a.name.localeCompare(b.name));
  }

  const getPartyTransactions = (party) => {
    if (!party) return [];
    
    const transactions = [];
    const safeSalesInvoices = Array.isArray(salesInvoices) ? salesInvoices : [];
    const safePurchaseInvoices = Array.isArray(purchaseInvoices) ? purchaseInvoices : [];
    const safePayments = Array.isArray(payments) ? payments : [];
    
    if (party.type === 'customer') {
      safeSalesInvoices.filter(inv => inv.customer_id === party.id).forEach(inv => {
        transactions.push({
          type: 'Sale',
          number: inv.invoice_number,
          date: inv.invoice_date,
          total: inv.total_amount,
          balance: inv.balance_amount || 0,
          status: inv.payment_status
        });
      });
    }
    
    if (party.type === 'vendor') {
      safePurchaseInvoices.filter(inv => inv.vendor_id === party.id).forEach(inv => {
        transactions.push({
          type: 'Purchase',
          number: inv.invoice_number,
          date: inv.invoice_date,
          total: inv.total_amount,
          balance: inv.balance_amount || 0,
          status: inv.payment_status
        });
      });
    }

    safePayments.filter(p => p.party_id === party.id).forEach(p => {
      transactions.push({
        type: p.payment_type === 'payment_in' ? 'Payment-In' : 'Payment-Out',
        number: p.payment_number || '',
        date: p.payment_date,
        total: p.total_amount,
        balance: 0,
        status: p.status === 'used' ? 'Used' : p.status === 'partial' ? 'Partial' : 'Available'
      });
    });
    
    return transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  const getAmountColor = (receivable, payable) => {
    const balance = receivable - payable;
    if (balance > 0) return 'text-green-600'; // Receivable (green)
    if (balance < 0) return 'text-red-600';   // Payable (red)
    return 'text-teal-600';                   // Zero balance (teal)
  };

  const formatAmount = (amount) => {
    if (amount === 0) return '0.00';
    return Math.abs(amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white px-5 py-2 border-b">
        <div className="max-w-[1920px] mx-auto flex justify-between items-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="text-xl font-medium p-0 h-auto hover:bg-transparent text-gray-700">
                Parties <ChevronDown className="w-5 h-5 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setPartyType('all')}>All Parties</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setPartyType('customers')}>Customers</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setPartyType('vendors')}>Vendors</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <div className="flex items-center gap-3">
            <Button 
              onClick={() => setShowAddDialog(true)}
              className="bg-red-500 hover:bg-red-600 text-white px-6 py-2.5 text-sm rounded-md"
            >
              <Plus className="w-4 h-4 mr-2" /> Add Party
            </Button>
            <Button variant="ghost" size="icon" className="w-10 h-10">
              <Settings className="w-5 h-5 text-gray-600" />
            </Button>
            <Button variant="ghost" size="icon" className="w-10 h-10">
              <MoreHorizontal className="w-5 h-5 text-gray-600" />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex max-w-[1920px] mx-auto overflow-x-auto">
        {/* Left Sidebar - Party List */}
        <div className="w-72 bg-white border-r h-[calc(100vh-85px)] flex-shrink-0">
          {/* Search */}
          <div className="border-b">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search Party Name"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 text-sm border-gray-200 h-11"
              />
            </div>
          </div>

          {/* Table Header */}
          <div className="px-4 py-3 border-b bg-gray-50">
            <div className="flex justify-between items-center text-sm font-medium text-gray-600">
              <div className="flex items-center gap-2">
                <span>Party Name</span>
                <Filter className="w-4 h-4" />
              </div>
              <span>Amount</span>
            </div>
          </div>

          {/* Party List */}
          <div className="overflow-y-auto h-full">
            {isLoading ? (
              <div className="p-4 text-sm text-gray-500">Loading parties...</div>
            ) : (
              displayedParties.map((party) => {
                const receivable = party.total_receivable || 0;
                const payable = party.total_payable || 0;
                const balance = receivable - payable;
                const isSelected = selectedParty?.id === party.id;
                
                return (
                  <div 
                    key={party.id}
                    className={`px-4 py-3 border-b cursor-pointer hover:bg-gray-50 transition-colors ${isSelected ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''}`}
                    onClick={() => setSelectedParty(party)}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-900 truncate text-sm pr-3">{party.name}</span>
                      <span className={`font-semibold text-sm ${getAmountColor(receivable, payable)} flex-shrink-0`}>
                        {formatAmount(balance)}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Content - Party Details */}
        <div className="flex-1 min-w-[900px]">
          <PartyDetails
            party={selectedParty}
            transactions={getPartyTransactions(selectedParty)}
            onEdit={handleEditParty}
          />
        </div>
      </div>

      <AddPartyDialog
        open={showAddDialog}
        onClose={() => setShowAddDialog(false)}
        onSubmit={handleAddParty}
        partyType="general"
      />

      {editingParty && (
        <EditPartyDialog
          open={showEditDialog}
          onClose={() => {
            setShowEditDialog(false);
            setEditingParty(null);
          }}
          onSubmit={handleUpdateParty}
          onDelete={handleDeleteParty}
          party={editingParty}
        />
      )}
    </div>
  );
}
