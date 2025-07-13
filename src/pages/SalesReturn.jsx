
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Plus, Search, FileSpreadsheet, Printer, ChevronDown } from 'lucide-react';
import { SaleReturn } from '@/api/entities';
import SalesReturnList from '../components/sales/SalesReturnList';
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function SalesReturnPage() {
    const [returns, setReturns] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState({
        dateRange: 'this_year',
        fromDate: '2025-01-01',
        toDate: '2025-12-31',
        firm: 'all',
        user: 'all',
        creditNote: 'credit_note',
        payment: 'all_payment'
    });

    useEffect(() => {
        loadReturns();
    }, [searchQuery, filters]);

    const loadReturns = async () => {
        setIsLoading(true);
        try {
            const data = await SaleReturn.list('-return_date');
            let filteredData = data || [];
            
            // Apply search filter
            if (searchQuery) {
                const lowercasedQuery = searchQuery.toLowerCase();
                filteredData = filteredData.filter(r =>
                    r.customer_name.toLowerCase().includes(lowercasedQuery) ||
                    r.return_number.toLowerCase().includes(lowercasedQuery)
                );
            }
            
            // Apply date filter
            if (filters.fromDate && filters.toDate) {
                filteredData = filteredData.filter(r => 
                    r.return_date >= filters.fromDate && 
                    r.return_date <= filters.toDate
                );
            }
            
            setReturns(filteredData);
        } catch (error) {
            console.error("Error loading sales returns:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const totalAmount = returns.reduce((sum, r) => sum + (r.total_amount || 0), 0);
    const totalBalance = returns.reduce((sum, r) => sum + (r.total_amount || 0), 0); // Assuming full balance for returns

    return (
        <div className="p-4 bg-gray-100 min-h-screen">
            {/* Filter Bar */}
            <div className="bg-white p-4 rounded-lg shadow-sm border mb-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="font-normal">
                                    This Year <ChevronDown className="w-4 h-4 ml-2" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem onClick={() => setFilters(prev => ({...prev, dateRange: 'today'}))}>
                                    Today
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setFilters(prev => ({...prev, dateRange: 'this_week'}))}>
                                    This Week
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setFilters(prev => ({...prev, dateRange: 'this_month'}))}>
                                    This Month
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setFilters(prev => ({...prev, dateRange: 'this_year'}))}>
                                    This Year
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <span className="px-2 py-1.5 bg-gray-100 rounded-md">Between</span>
                            <Input 
                                type="date" 
                                className="w-36 text-sm" 
                                value={filters.fromDate}
                                onChange={(e) => setFilters(prev => ({...prev, fromDate: e.target.value}))}
                            />
                            <span className="text-sm">To</span>
                            <Input 
                                type="date" 
                                className="w-36 text-sm" 
                                value={filters.toDate}
                                onChange={(e) => setFilters(prev => ({...prev, toDate: e.target.value}))}
                            />
                        </div>
                        
                        <Select value={filters.firm} onValueChange={(value) => setFilters(prev => ({...prev, firm: value}))}>
                            <SelectTrigger className="w-32 font-normal">
                                <SelectValue placeholder="All Firms" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Firms</SelectItem>
                            </SelectContent>
                        </Select>
                        
                        <Select value={filters.user} onValueChange={(value) => setFilters(prev => ({...prev, user: value}))}>
                            <SelectTrigger className="w-32 font-normal">
                                <SelectValue placeholder="All Users" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Users</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="bg-gray-50 text-gray-700">
                            <FileSpreadsheet className="w-4 h-4 mr-2" /> Excel Report
                        </Button>
                        <Button variant="outline" size="sm" className="bg-gray-50 text-gray-700">
                            <Printer className="w-4 h-4 mr-2" /> Print
                        </Button>
                    </div>
                </div>
                
                {/* Second Row of Filters */}
                <div className="flex flex-wrap items-center justify-between gap-2 mt-4 pt-4 border-t">
                    <div className="flex items-center gap-2">
                        <Select value={filters.creditNote} onValueChange={(value) => setFilters(prev => ({...prev, creditNote: value}))}>
                            <SelectTrigger className="w-40">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="credit_note">Credit Note</SelectItem>
                                <SelectItem value="debit_note">Debit Note</SelectItem>
                            </SelectContent>
                        </Select>
                        
                        <Select value={filters.payment} onValueChange={(value) => setFilters(prev => ({...prev, payment: value}))}>
                            <SelectTrigger className="w-40">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all_payment">All Payment</SelectItem>
                                <SelectItem value="cash">Cash</SelectItem>
                                <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                                <SelectItem value="upi">UPI</SelectItem>
                                <SelectItem value="card">Card</SelectItem>
                                <SelectItem value="cheque">Cheque</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input 
                                placeholder="Search..." 
                                className="pl-10" 
                                value={searchQuery} 
                                onChange={e => setSearchQuery(e.target.value)} 
                            />
                        </div>
                        <Link to={createPageUrl("CreateCreditNote")}>
                          <Button 
                              className="bg-blue-600 hover:bg-blue-700 text-white rounded-full"
                          >
                              <Plus className="w-4 h-4 mr-2" /> Add Credit Note
                          </Button>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Returns Table */}
            <div className="bg-white rounded-lg shadow-sm border">
                <div className="overflow-x-auto">
                    <SalesReturnList 
                        returns={returns} 
                        isLoading={isLoading} 
                        onRefresh={loadReturns}
                    />
                </div>
                <div className="p-4 border-t font-semibold flex justify-between">
                    <span>Total Amount: ₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    <span>Balance: ₹{totalBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
            </div>
        </div>
    );
}
