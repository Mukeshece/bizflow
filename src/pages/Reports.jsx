import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  BarChart2, 
  FileText, 
  Users, 
  Package, 
  Receipt, 
  Calendar,
  ChevronRight
} from 'lucide-react';

import SalePurchaseReports from '../components/reports/SalePurchaseReports';
import GSTReports from '../components/reports/GSTReports';
import PartyReports from '../components/reports/PartyReports';
import ItemStockReports from '../components/reports/ItemStockReports';
import ExpenseReports from '../components/reports/ExpenseReports';

const reportComponents = {
  'sale_purchase': { 
    label: 'Sale & Purchase', 
    component: SalePurchaseReports, 
    icon: BarChart2 
  },
  'gst': { 
    label: 'GST Reports', 
    component: GSTReports, 
    icon: FileText 
  },
  'party': { 
    label: 'Party Reports', 
    component: PartyReports, 
    icon: Users 
  },
  'item_stock': { 
    label: 'Item/Stock Reports', 
    component: ItemStockReports, 
    icon: Package 
  },
  'expense': { 
    label: 'Expense Reports', 
    component: ExpenseReports, 
    icon: Receipt 
  },
};

export default function Reports() {
  const [activeReport, setActiveReport] = useState('sale_purchase');
  const [dateRange, setDateRange] = useState('this_fiscal_year');
  const [reportData, setReportData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // In a real app, you would fetch data based on dateRange and activeReport
  // For now, we'll pass the props down to the child components to handle
  
  const ActiveReportComponent = reportComponents[activeReport].component;

  return (
    <div className="flex h-full bg-slate-50">
      {/* Left Sidebar for Report Navigation */}
      <div className="w-64 border-r bg-white p-4 flex-shrink-0">
        <h2 className="text-lg font-semibold mb-4">All Reports</h2>
        <div className="space-y-2">
          {Object.entries(reportComponents).map(([key, { label, icon: Icon }]) => (
            <Button
              key={key}
              variant={activeReport === key ? 'secondary' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setActiveReport(key)}
            >
              <Icon className="w-4 h-4 mr-3" />
              <span>{label}</span>
              {activeReport === key && <ChevronRight className="w-4 h-4 ml-auto" />}
            </Button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-6 overflow-y-auto">
        <Card className="shadow-sm">
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <CardTitle className="text-xl">
                  {reportComponents[activeReport].label}
                </CardTitle>
                <p className="text-sm text-gray-500 mt-1">
                  Analyze your business performance for the selected period.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="this_week">This Week</SelectItem>
                    <SelectItem value="this_month">This Month</SelectItem>
                    <SelectItem value="this_fiscal_year">This Fiscal Year</SelectItem>
                    <SelectItem value="all_time">All Time</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-12">Loading report data...</div>
            ) : (
              <ActiveReportComponent dateRange={dateRange} />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}