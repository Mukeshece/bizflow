import React from 'react';
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Edit, MoreHorizontal, Search, Printer, ArrowUpDown, Mail, Phone, MessageCircle } from "lucide-react";

export default function PartyDetails({ party, transactions, onEdit }) {
  if (!party) {
    return (
      <div className="flex-1 flex items-center justify-center text-slate-500 text-lg h-full">
        Select a party to view details and transactions
      </div>
    );
  }

  const getStatusColor = (status) => {
    if (!status) return "text-slate-500";
    const lowerStatus = status.toLowerCase();
    if (['paid', 'used'].includes(lowerStatus)) return "text-green-600";
    if (lowerStatus === 'unpaid') return "text-red-600";
    return "text-orange-500";
  }

  return (
    <>
      {/* Party Header */}
      <div className="p-8 bg-white border-b">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-6">
              <h1 className="text-2xl font-bold text-slate-900">{party.name}</h1>
              <Edit className="w-5 h-5 text-blue-600 cursor-pointer hover:text-blue-700" onClick={() => onEdit(party, party.type)} />
            </div>
            
            <div className="grid grid-cols-2 gap-12">
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-gray-500 mb-1">Phone Number</div>
                  <div className="font-medium text-base">{party.phone || 'Not provided'}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">GSTIN</div>
                  <div className="font-medium text-base">{party.gst_number || 'Not provided'}</div>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-gray-500 mb-1">Email</div>
                  <div className="font-medium text-base">{party.email || 'Not provided'}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">Billing Address</div>
                  <div className="font-medium text-base">{party.address || 'Not provided'}</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex gap-3">
            <Button size="icon" variant="ghost" className="w-10 h-10 bg-orange-100 rounded-full hover:bg-orange-200">
              <Mail className="text-orange-600 w-5 h-5" />
            </Button>
            <Button size="icon" variant="ghost" className="w-10 h-10 bg-green-100 rounded-full hover:bg-green-200">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
            </Button>
            <Button size="icon" variant="ghost" className="w-10 h-10 bg-red-100 rounded-full hover:bg-red-200">
              <Phone className="text-red-600 w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Transactions Section */}
      <div className="p-0 flex-1">
        <div className="bg-white rounded-lg border h-full flex flex-col">
          <div className="p-6 border-b">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-slate-900 text-lg">Transactions</h3>
              <div className="flex gap-3 items-center">
                <Button variant="ghost" size="icon" className="w-9 h-9"><Search className="w-5 h-5" /></Button>
                <Button variant="ghost" size="icon" className="w-9 h-9"><Printer className="w-5 h-5" /></Button>
                <Button variant="ghost" size="icon" className="w-9 h-9">
                  <div className="w-7 h-7 bg-green-100 text-green-700 flex items-center justify-center rounded-sm text-xs font-bold border border-green-200">
                    XLS
                  </div>
                </Button>
              </div>
            </div>
          </div>

          {/* Transaction Table */}
          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="text-left p-4 font-medium text-slate-600">Type <ArrowUpDown className="w-4 h-4 inline ml-1" /></th>
                  <th className="text-left p-4 font-medium text-slate-600">Number <ArrowUpDown className="w-4 h-4 inline ml-1" /></th>
                  <th className="text-left p-4 font-medium text-slate-600">Date <ArrowUpDown className="w-4 h-4 inline ml-1" /></th>
                  <th className="text-right p-4 font-medium text-slate-600">Total <ArrowUpDown className="w-4 h-4 inline ml-1" /></th>
                  <th className="text-right p-4 font-medium text-slate-600">Balance/Unused <ArrowUpDown className="w-4 h-4 inline ml-1" /></th>
                  <th className="text-center p-4 font-medium text-slate-600">Status <ArrowUpDown className="w-4 h-4 inline ml-1" /></th>
                  <th className="w-12"></th>
                </tr>
              </thead>
              <tbody>
                {transactions && transactions.map((transaction, index) => (
                  <tr key={index} className="border-b hover:bg-slate-50 transition-colors">
                    <td className="p-4">{transaction.type}</td>
                    <td className="p-4">{transaction.number}</td>
                    <td className="p-4">{new Date(transaction.date).toLocaleDateString('en-GB')}</td>
                    <td className="p-4 text-right font-medium">₹{transaction.total?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}</td>
                    <td className="p-4 text-right font-medium">₹{transaction.balance?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}</td>
                    <td className="p-4 text-center font-medium">
                        <span className={getStatusColor(transaction.status)}>
                            {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                        </span>
                    </td>
                    <td className="p-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="w-8 h-8">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem>View Details</DropdownMenuItem>
                          <DropdownMenuItem>Edit</DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
                {(!transactions || transactions.length === 0) && (
                  <tr>
                    <td colSpan="7" className="p-12 text-center text-slate-500 text-base">
                      No transactions found for this party
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}