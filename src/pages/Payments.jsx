import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Payment } from '@/api/entities';
import { Button } from "@/components/ui/button";
import { createPageUrl } from "@/utils";
import { Link } from "react-router-dom";
import { Plus, Printer, Download } from "lucide-react";
import PaymentList from '../components/payments/PaymentList';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

export default function Payments() {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const initialType = searchParams.get('type') || 'payment_in';
  
  const [payments, setPayments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [paymentType, setPaymentType] = useState(initialType);
  const [dateRange, setDateRange] = useState('this_year');

  useEffect(() => {
    // Sync URL with state
    if (searchParams.get('type') !== paymentType) {
      navigate(createPageUrl(`Payments?type=${paymentType}`), { replace: true });
    }
    loadPayments();
  }, [paymentType]);

  const loadPayments = async () => {
    setIsLoading(true);
    try {
      const data = await Payment.filter({ payment_type: paymentType }, '-payment_date');
      setPayments(data || []);
    } catch (error) {
      console.error("Error loading payments:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaymentTypeChange = (value) => {
    setPaymentType(value);
  }

  const pageTitle = paymentType === 'payment_in' ? "Payment In" : "Payment Out";
  const addLink = createPageUrl(`CreatePayment?type=${paymentType}`);
  const addText = paymentType === 'payment_in' ? "Add Payment-In" : "Add Payment-Out";

  return (
    <div className="p-6 bg-white min-h-screen">
      <div className="max-w-full mx-auto">
        <header className="flex justify-between items-center mb-6 border-b pb-4">
          <div className="flex items-center gap-4">
             <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-40 font-semibold text-lg h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="this_week">This Week</SelectItem>
                <SelectItem value="this_month">This Month</SelectItem>
                <SelectItem value="this_year">This Year</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
            {dateRange === 'custom' && (
                <div className="flex items-center gap-2">
                    <span className="font-semibold">Between</span>
                    <Input type="date" className="w-36 h-10"/>
                    <Input type="date" className="w-36 h-10"/>
                </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline"><Download className="w-4 h-4 mr-2"/> Local Report</Button>
            <Button variant="outline"><Printer className="w-4 h-4 mr-2"/> Print</Button>
          </div>
        </header>
        
        <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-4">
                <Select value={paymentType} onValueChange={handlePaymentTypeChange}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="payment_in">Payment-In</SelectItem>
                    <SelectItem value="payment_out">Payment-Out</SelectItem>
                    <SelectItem value="sale">Sale</SelectItem>
                    <SelectItem value="purchase">Purchase</SelectItem>
                    <SelectItem value="credit_note">Credit Note</SelectItem>
                    <SelectItem value="debit_note">Debit Note</SelectItem>
                  </SelectContent>
                </Select>
                 <Select defaultValue="all">
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="All Payment" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Payment</SelectItem>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="cheque">Cheque</SelectItem>
                  </SelectContent>
                </Select>
            </div>
            <div className="flex items-center gap-2">
                <Link to={addLink}>
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-md">
                        <Plus className="w-4 h-4 mr-2" />
                        {addText}
                    </Button>
                </Link>
            </div>
        </div>
        
        <PaymentList payments={payments} isLoading={isLoading} onRefresh={loadPayments} paymentType={paymentType} />
      </div>
    </div>
  );
}