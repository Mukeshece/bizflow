
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ShoppingCart, 
  Users, 
  Package,
  Receipt,
  AlertTriangle,
  Calendar,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  RefreshCw
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { SalesInvoice } from '@/api/entities';
import { PurchaseInvoice } from '@/api/entities';
import { Customer } from '@/api/entities';
import { Vendor } from '@/api/entities';
import { Product } from '@/api/entities';
import { Expense } from '@/api/entities';
import { Company } from '@/api/entities';

// Helper function to add delay between API calls
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalSales: 0,
    totalPurchases: 0,
    totalExpenses: 0,
    totalCustomers: 0,
    totalVendors: 0,
    totalProducts: 0,
    lowStockProducts: 0,
    recentTransactions: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [hasCompany, setHasCompany] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initializeDashboard = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const companies = await Company.list();
        if (companies && companies.length > 0) {
          setHasCompany(true);
          await loadDashboardDataWithThrottling();
        } else {
          setHasCompany(false);
        }
      } catch (error) {
        console.error('Error checking company setup:', error);
        setError('Failed to load company information. Please try again.');
        setHasCompany(false);
      } finally {
        setIsLoading(false);
      }
    };

    initializeDashboard();
  }, []);

  const loadDashboardDataWithThrottling = async () => {
    try {
      setLoadingProgress(10);
      
      // Load data sequentially with delays to avoid rate limiting
      const salesData = await SalesInvoice.list('-created_date', 10);
      setLoadingProgress(25);
      await delay(300); // 300ms delay between requests
      
      const purchaseData = await PurchaseInvoice.list('-created_date', 10);
      setLoadingProgress(40);
      await delay(300);
      
      const customerData = await Customer.list();
      setLoadingProgress(55);
      await delay(300);
      
      const vendorData = await Vendor.list();
      setLoadingProgress(70);
      await delay(300);
      
      const productData = await Product.list();
      setLoadingProgress(85);
      await delay(300);
      
      const expenseData = await Expense.list('-created_date', 5);
      setLoadingProgress(100);

      // Process the data
      const totalSales = salesData?.reduce((sum, sale) => sum + (sale.total_amount || 0), 0) || 0;
      const totalPurchases = purchaseData?.reduce((sum, purchase) => sum + (purchase.total_amount || 0), 0) || 0;
      const totalExpenses = expenseData?.reduce((sum, expense) => sum + (expense.amount || 0), 0) || 0;
      const lowStockProducts = productData?.filter(product => 
        product.current_stock <= (product.min_stock || 0)
      ).length || 0;

      const recentTransactions = [
        ...(salesData?.slice(0, 5).map(sale => ({
          id: sale.id,
          type: 'sale',
          title: `Sale to ${sale.customer_name}`,
          amount: sale.total_amount,
          date: sale.invoice_date,
          status: sale.payment_status
        })) || []),
        ...(purchaseData?.slice(0, 3).map(purchase => ({
          id: purchase.id,
          type: 'purchase',
          title: `Purchase from ${purchase.vendor_name}`,
          amount: purchase.total_amount,
          date: purchase.invoice_date,
          status: purchase.payment_status
        })) || [])
      ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 8);

      setStats({
        totalSales,
        totalPurchases,
        totalExpenses,
        totalCustomers: customerData?.length || 0,
        totalVendors: vendorData?.length || 0,
        totalProducts: productData?.length || 0,
        lowStockProducts,
        recentTransactions
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      if (error.message.includes('429') || error.message.includes('Rate limit')) {
        setError('Too many requests. Please wait a moment and try again.');
      } else {
        setError('Failed to load dashboard data. Please try refreshing the page.');
      }
    }
  };

  const handleRetry = async () => {
    setError(null);
    setIsLoading(true);
    setLoadingProgress(0);
    await delay(1000); // Wait 1 second before retrying
    await loadDashboardDataWithThrottling();
    setIsLoading(false);
  };

  // Show business setup if no company exists
  if (!hasCompany && !isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-900">Welcome to BizFlow!</CardTitle>
            <p className="text-gray-600">Let's set up your business to get started</p>
          </CardHeader>
          <CardContent className="text-center">
            <div className="mb-6">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="w-10 h-10 text-blue-600" />
              </div>
              <p className="text-gray-700 mb-4">
                Set up your business profile, configure invoicing, and customize features to match your needs.
              </p>
            </div>
            <Link to={createPageUrl('BusinessProfileSetup')}>
              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                Start Business Setup
                <ArrowUpRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
              <h2 className="text-xl font-semibold text-gray-700 mb-2">Loading Dashboard</h2>
              <p className="text-gray-500 mb-4">Please wait while we load your business data...</p>
              <div className="w-64 bg-gray-200 rounded-full h-2 mx-auto">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${loadingProgress}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-400 mt-2">{loadingProgress}% complete</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <Card className="w-full max-w-md">
              <CardHeader className="text-center">
                <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <CardTitle className="text-xl font-semibold text-gray-900">Loading Error</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600 mb-6">{error}</p>
                <Button onClick={handleRetry} className="w-full">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', { 
      style: 'currency', 
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'partial': return 'bg-yellow-100 text-yellow-800';
      case 'unpaid': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const profit = stats.totalSales - stats.totalPurchases - stats.totalExpenses;

  return (
    <div className="p-8 space-y-8 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      {/* Enhanced Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600 text-lg">Welcome back! Here's what's happening with your business.</p>
        </div>
        <div className="flex flex-wrap gap-4">
          <Button 
            variant="outline" 
            size="lg" 
            onClick={handleRetry}
            className="flex items-center gap-3 px-6 py-3 bg-white/80 backdrop-blur-sm"
          >
            <RefreshCw className="w-5 h-5" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Enhanced Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-lg font-semibold text-green-800">Total Sales</CardTitle>
            <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-900 mb-2">{formatCurrency(stats.totalSales)}</div>
            <Link to={createPageUrl('Sales')} className="text-sm text-green-700 hover:text-green-900 flex items-center transition-colors">
              View all sales <ArrowUpRight className="w-4 h-4 ml-1" />
            </Link>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-lg font-semibold text-blue-800">Total Purchases</CardTitle>
            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
              <ShoppingCart className="h-6 w-6 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-900 mb-2">{formatCurrency(stats.totalPurchases)}</div>
            <Link to={createPageUrl('Purchase')} className="text-sm text-blue-700 hover:text-blue-900 flex items-center transition-colors">
              View all purchases <ArrowUpRight className="w-4 h-4 ml-1" />
            </Link>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-lg font-semibold text-purple-800">Profit/Loss</CardTitle>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${profit >= 0 ? 'bg-green-500' : 'bg-red-500'}`}>
              {profit >= 0 ? 
                <TrendingUp className="h-6 w-6 text-white" /> : 
                <TrendingDown className="h-6 w-6 text-white" />
              }
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold mb-2 ${profit >= 0 ? 'text-green-900' : 'text-red-900'}`}>
              {formatCurrency(profit)}
            </div>
            <p className="text-sm text-purple-700">
              {profit >= 0 ? 'Profit this period' : 'Loss this period'}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-lg font-semibold text-orange-800">Total Expenses</CardTitle>
            <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center">
              <Receipt className="h-6 w-6 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-900 mb-2">{formatCurrency(stats.totalExpenses)}</div>
            <Link to={createPageUrl('Expense')} className="text-sm text-orange-700 hover:text-orange-900 flex items-center transition-colors">
              View all expenses <ArrowUpRight className="w-4 h-4 ml-1" />
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-lg font-semibold">Customers</CardTitle>
            <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
              <Users className="h-5 w-5 text-slate-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">{stats.totalCustomers}</div>
            <Link to={createPageUrl('Parties')} className="text-sm text-muted-foreground hover:text-primary flex items-center transition-colors">
              Manage parties <ArrowUpRight className="w-4 h-4 ml-1" />
            </Link>
          </CardContent>
        </Card>

        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-lg font-semibold">Products</CardTitle>
            <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
              <Package className="h-5 w-5 text-slate-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">{stats.totalProducts}</div>
            <Link to={createPageUrl('Products')} className="text-sm text-muted-foreground hover:text-primary flex items-center transition-colors">
              Manage inventory <ArrowUpRight className="w-4 h-4 ml-1" />
            </Link>
          </CardContent>
        </Card>

        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-lg font-semibold">Low Stock Alert</CardTitle>
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stats.lowStockProducts > 0 ? 'bg-red-100' : 'bg-green-100'}`}>
              <AlertTriangle className={`h-5 w-5 ${stats.lowStockProducts > 0 ? 'text-red-500' : 'text-green-500'}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold mb-2 ${stats.lowStockProducts > 0 ? 'text-red-600' : 'text-green-600'}`}>
              {stats.lowStockProducts}
            </div>
            <p className="text-sm text-muted-foreground">
              {stats.lowStockProducts > 0 ? 'Products need restocking' : 'All products in stock'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Recent Transactions */}
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-semibold">Recent Transactions</CardTitle>
            <Button variant="outline" size="sm" className="bg-white/80 backdrop-blur-sm">
              <Eye className="w-4 h-4 mr-2" />
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {stats.recentTransactions.length > 0 ? (
            <div className="space-y-4">
              {stats.recentTransactions.map((transaction, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      transaction.type === 'sale' ? 'bg-green-100' : 'bg-blue-100'
                    }`}>
                      {transaction.type === 'sale' ? 
                        <TrendingUp className="w-6 h-6 text-green-600" /> :
                        <ShoppingCart className="w-6 h-6 text-blue-600" />
                      }
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-lg">{transaction.title}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(transaction.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">{formatCurrency(transaction.amount)}</p>
                    <Badge className={getStatusColor(transaction.status)}>
                      {transaction.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-4">No recent transactions found</p>
              <p className="text-sm text-gray-400">Start creating sales and purchases to see your activity here</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
