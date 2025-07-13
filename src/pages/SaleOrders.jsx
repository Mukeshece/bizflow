import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { SaleOrder } from '@/api/entities';
import SaleOrderList from '../components/sales/SaleOrderList';

export default function SaleOrdersPage() {
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedOrders, setSelectedOrders] = useState([]);

    useEffect(() => {
        loadOrders();
    }, []);

    const loadOrders = async () => {
        setIsLoading(true);
        try {
            const data = await SaleOrder.list('-order_date');
            const ordersWithBalance = data.map(o => ({...o, balance: o.total_amount}));
            setOrders(ordersWithBalance || []);
        } catch (error) {
            console.error("Error loading sale orders:", error);
            setOrders([]);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredOrders = orders.filter(order =>
        order.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.order_number.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="bg-white min-h-screen">
            <div className="p-4 border-b">
                 <Tabs defaultValue="sale_orders">
                    <TabsList>
                        <TabsTrigger value="sale_orders">SALE ORDERS</TabsTrigger>
                        <TabsTrigger value="online_orders">ONLINE ORDERS</TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>
            <div className="p-4">
                <div className="mb-4">
                    <h2 className="text-sm font-semibold text-gray-600 mb-2">TRANSACTIONS</h2>
                    <div className="flex justify-between items-center">
                        <div className="relative w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input 
                                placeholder="Search..." 
                                className="pl-10"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" className="text-red-600 border-red-500">
                                Bulk Convert To Sale
                            </Button>
                            <Link to={createPageUrl("CreateSaleOrder")}>
                                <Button className="bg-blue-600 hover:bg-blue-700">
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add Sale Order
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>

                <SaleOrderList
                    orders={filteredOrders}
                    isLoading={isLoading}
                    onRefresh={loadOrders}
                    selectedOrders={selectedOrders}
                    setSelectedOrders={setSelectedOrders}
                />
            </div>
        </div>
    );
}