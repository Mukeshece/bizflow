import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { ChevronsUpDown, Check, ArrowLeft, Save, FileText } from "lucide-react";
import { PurchaseOrder, Vendor, Product } from "@/api/entities";
import PurchaseItemTable from "../components/purchase/PurchaseItemTable";

export default function CreatePurchaseOrder() {
  const navigate = useNavigate();
  const [orderData, setOrderData] = useState({
    order_number: `PO-${Date.now()}`,
    vendor_id: "",
    vendor_name: "",
    order_date: new Date().toISOString().split('T')[0],
    delivery_date: new Date().toISOString().split('T')[0],
    items: [],
    subtotal: 0,
    discount_amount: 0,
    gst_amount: 0,
    total_amount: 0,
    notes: ""
  });
  const [vendors, setVendors] = useState([]);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [vendorSearchOpen, setVendorSearchOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [vendorsData, productsData] = await Promise.all([Vendor.list(), Product.list()]);
        setVendors(vendorsData || []);
        setProducts(productsData || []);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleVendorSelect = (vendorId) => {
    const vendor = vendors.find(v => v.id === vendorId);
    if (vendor) {
      setOrderData(prev => ({ ...prev, vendor_id: vendor.id, vendor_name: vendor.name }));
      setVendorSearchOpen(false);
    }
  };
  
  const calculateTotals = (items) => {
    const safeItems = Array.isArray(items) ? items.filter(i => i) : [];
    const subtotal = safeItems.reduce((sum, item) => sum + ((item.quantity || 0) * (item.rate || 0)), 0);
    const discount = safeItems.reduce((sum, item) => sum + ((item.quantity || 0) * (item.rate || 0) * ((item.discount || 0) / 100)), 0);
    const gst = safeItems.reduce((sum, item) => sum + (((item.quantity || 0) * (item.rate || 0) * (1 - (item.discount || 0) / 100)) * ((item.gst_rate || 0) / 100)), 0);
    const total = subtotal - discount + gst;
    
    setOrderData(prev => ({ ...prev, subtotal, discount_amount: discount, gst_amount: gst, total_amount: total }));
  };

  const handleItemsChange = (newItems) => {
    const safeItems = Array.isArray(newItems) ? newItems.filter(i => i) : [];
    setOrderData(prev => ({ ...prev, items: safeItems }));
    calculateTotals(safeItems);
  };
  
  const handleSave = async () => {
    try {
      await PurchaseOrder.create(orderData);
      navigate('/Purchase?view=orders');
    } catch (error) {
      console.error("Error saving purchase order:", error);
    }
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" size="icon" onClick={() => navigate('/Purchase?view=orders')}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Create Purchase Order</h1>
          </div>
        </div>

        <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><FileText className="w-5 h-5" /> Order Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label>Vendor *</Label>
                <Popover open={vendorSearchOpen} onOpenChange={setVendorSearchOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" role="combobox" className="w-full justify-between">
                      {orderData.vendor_name || "Select Vendor..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                    <Command>
                      <CommandInput placeholder="Search vendor..." />
                      <CommandEmpty>No vendor found.</CommandEmpty>
                      <CommandGroup>
                        {(vendors || []).map((vendor) => (
                          <CommandItem key={vendor.id} onSelect={() => handleVendorSelect(vendor.id)}>
                            <Check className={`mr-2 h-4 w-4 ${orderData.vendor_id === vendor.id ? "opacity-100" : "opacity-0"}`} />
                            {vendor.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label htmlFor="order_number">Order #</Label>
                <Input id="order_number" value={orderData.order_number} readOnly />
              </div>
              <div className="space-y-2">
                <Label htmlFor="order_date">Order Date</Label>
                <Input type="date" id="order_date" value={orderData.order_date} onChange={(e) => setOrderData(p=>({...p, order_date: e.target.value}))} />
              </div>
              <div className="space-y-2 col-span-full md:col-span-1">
                <Label htmlFor="delivery_date">Expected Delivery</Label>
                <Input type="date" id="delivery_date" value={orderData.delivery_date} onChange={(e) => setOrderData(p=>({...p, delivery_date: e.target.value}))} />
              </div>
            </div>
            
            <Separator />
            
            <PurchaseItemTable 
              items={orderData.items || []}
              products={products || []}
              onItemsChange={handleItemsChange}
            />

            <Separator />

            <div className="flex justify-end">
                <div className="w-full md:w-80 space-y-2 text-sm">
                  <div className="flex justify-between"><span>Subtotal</span><span>₹{orderData.subtotal.toFixed(2)}</span></div>
                  <div className="flex justify-between"><span>Discount</span><span className="text-green-600">- ₹{orderData.discount_amount.toFixed(2)}</span></div>
                  <div className="flex justify-between"><span>GST</span><span>+ ₹{orderData.gst_amount.toFixed(2)}</span></div>
                  <Separator />
                  <div className="flex justify-between font-bold text-lg"><span>Total</span><span>₹{orderData.total_amount.toFixed(2)}</span></div>
                </div>
              </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => navigate('/Purchase?view=orders')}>Cancel</Button>
            <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
              <Save className="w-4 h-4 mr-2" /> Save
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}