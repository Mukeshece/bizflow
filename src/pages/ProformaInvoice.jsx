import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Plus, Search, MoreHorizontal, ChevronDown, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ProformaInvoice } from '@/api/entities';
import { format } from 'date-fns';

export default function ProformaInvoicePage() {
    const [invoices, setInvoices] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadInvoices();
    }, []);

    const loadInvoices = async () => {
        setIsLoading(true);
        try {
            const data = await ProformaInvoice.list('-date');
            setInvoices(data || []);
        } catch (error) {
            console.error("Error loading proforma invoices:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-gray-100 min-h-screen">
            <div className="bg-white p-4 shadow-sm text-center">
                <h1 className="text-lg font-semibold text-gray-600 tracking-wider">PROFORMA INVOICE</h1>
            </div>
            <div className="p-4">
                <div className="bg-white p-4 rounded-lg shadow-sm border border-blue-200">
                    <div className="flex items-center gap-4">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline">This Month <ChevronDown className="w-4 h-4 ml-2" /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem>This Month</DropdownMenuItem>
                                <DropdownMenuItem>Last Month</DropdownMenuItem>
                                <DropdownMenuItem>This Year</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <span>Between</span>
                            <Input type="date" className="w-36" defaultValue="2025-07-01" />
                            <span>To</span>
                            <Input type="date" className="w-36" defaultValue="2025-07-31" />
                        </div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline">All Firms <ChevronDown className="w-4 h-4 ml-2" /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem>All Firms</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                <div className="mt-4 bg-white p-4 rounded-lg shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="font-semibold text-gray-700">TRANSACTIONS</h2>
                        <div className="flex items-center gap-4">
                            <div className="relative w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <Input placeholder="Search..." className="pl-10" />
                            </div>
                            <Link to={createPageUrl("CreateProformaInvoice")}>
                                <Button className="bg-blue-600 hover:bg-blue-700">
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add Proforma Invoice
                                </Button>
                            </Link>
                        </div>
                    </div>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead><div className="flex items-center">DATE <ChevronDown className="w-4 h-4" /></div></TableHead>
                                <TableHead><div className="flex items-center">REFERENCE NO <Filter className="w-3 h-3 ml-1" /></div></TableHead>
                                <TableHead><div className="flex items-center">NAME <Filter className="w-3 h-3 ml-1" /></div></TableHead>
                                <TableHead><div className="flex items-center">TOTAL AMOUNT <Filter className="w-3 h-3 ml-1" /></div></TableHead>
                                <TableHead><div className="flex items-center">BALANCE <Filter className="w-3 h-3 ml-1" /></div></TableHead>
                                <TableHead><div className="flex items-center">STATUS <Filter className="w-3 h-3 ml-1" /></div></TableHead>
                                <TableHead>ACTION</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow><TableCell colSpan="7" className="text-center">Loading...</TableCell></TableRow>
                            ) : invoices.map(invoice => (
                                <TableRow key={invoice.id}>
                                    <TableCell>{format(new Date(invoice.date), "dd/MM/yyyy")}</TableCell>
                                    <TableCell>{invoice.reference_no}</TableCell>
                                    <TableCell>{invoice.customer_name}</TableCell>
                                    <TableCell>₹{invoice.total_amount?.toFixed(2)}</TableCell>
                                    <TableCell>₹{invoice.balance?.toFixed(2)}</TableCell>
                                    <TableCell>
                                        <span className={`capitalize font-medium ${invoice.status === 'open' ? 'text-orange-500' : 'text-green-600'}`}>
                                            Proforma Invoice {invoice.status}
                                        </span>
                                    </TableCell>
                                    <TableCell className="flex items-center gap-2">
                                        {invoice.status === 'open' && (
                                            <Link to={createPageUrl(`CreateSalesInvoice?fromProforma=${invoice.id}`)}>
                                                <Button variant="link" className="p-0 h-auto text-blue-600 font-semibold">CONVERT</Button>
                                            </Link>
                                        )}
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon"><MoreHorizontal className="w-4 h-4" /></Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent>
                                                <DropdownMenuItem>View</DropdownMenuItem>
                                                <DropdownMenuItem>Edit</DropdownMenuItem>
                                                <DropdownMenuItem className="text-red-500">Delete</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    );
}