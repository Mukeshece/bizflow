
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { ChevronsUpDown, Check, ArrowLeft, Save, FileText, Link } from "lucide-react"; // Added Link icon
import { SaleOrder } from "@/api/entities";
import { Customer } from "@/api/entities";
import { Product } from "@/api/entities";
import InvoiceItemTable from "../components/sales/InvoiceItemTable";
import LinkPaymentDialog from "../components/sales/LinkPaymentDialog"; // New import

export default function CreateSaleOrder() {
  const navigate = useNavigate();
  const [orderData, setOrderData] = useState({
    order_number: `SO-${Date.now()}`,
    customer_id: "",
    customer_name: "",
    order_date: new Date().toISOString().split('T')[0],
    delivery_date: new Date().toISOString().split('T')[0],
    items: [],
    subtotal: 0,
    discount_amount: 0,
    gst_amount: 0,
    total_amount: 0,
    balance: 0,
    notes: "",
    linked_invoices: [] // Initialize linked_invoices
  });
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [customerSearchOpen, setCustomerSearchOpen] = useState(false);
  const [showLinkPaymentDialog, setShowLinkPaymentDialog] = useState(false); // New state

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [customersData, productsData] = await Promise.all([Customer.list(), Product.list()]);
        setCustomers(customersData || []);
        setProducts(productsData || []);
      } catch (error) {
        console.error("Error fetching data:", error);
        setCustomers([]);
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleCustomerSelect = (customerId) => {
    const customer = customers.find(c => c.id === customerId);
    if (customer) {
      setOrderData(prev => ({ ...prev, customer_id: customer.id, customer_name: customer.name }));
      setCustomerSearchOpen(false);
    }
  };
  
  const calculateTotals = (items) => {
    const safeItems = Array.isArray(items) ? items : [];
    const subtotal = safeItems.reduce((sum, item) => sum + ((item.quantity || 0) * (item.rate || 0)), 0);
    // Note: discount_amount here is based on item discounts. 
    // It might be overwritten by linked payment discount later.
    const discount = safeItems.reduce((sum, item) => sum + ((item.quantity || 0) * (item.rate || 0) * ((item.discount || 0) / 100)), 0);
    const gst = safeItems.reduce((sum, item) => sum + (((item.quantity || 0) * (item.rate || 0) * (1 - (item.discount || 0) / 100)) * ((item.gst_rate || 0) / 100)), 0);
    
    // Total calculation needs to consider the current `discount_amount` from orderData, which might come from linked payments.
    // If the intent is for item-level discount to be combined with a global discount from linked payments,
    // this logic needs refinement. For now, following the outline for discount_amount update directly.
    // Assuming `orderData.discount_amount` will hold the current total discount,
    // which could be from items or overridden by linked payments.
    const currentDiscount = orderData.discount_amount; // Use the current discount amount from state
    const total = subtotal - currentDiscount + gst; // Use currentDiscount for total calculation
    
    setOrderData(prev => ({ 
      ...prev, 
      subtotal, 
      discount_amount: currentDiscount, // Preserve the discount if set externally (e.g., by linked payment)
      gst_amount: gst, 
      total_amount: total, 
      balance: total 
    }));
  };

  const handleItemsChange = (newItems) => {
    const safeItems = Array.isArray(newItems) ? newItems : [];
    setOrderData(prev => ({ ...prev, items: safeItems }));
    // Recalculate totals including item-level discount first, before any potential global discount from linked payment.
    // Then handleLinkPaymentSubmit can override discount_amount if necessary.
    const subtotal = safeItems.reduce((sum, item) => sum + ((item.quantity || 0) * (item.rate || 0)), 0);
    const discount = safeItems.reduce((sum, item) => sum + ((item.quantity || 0) * (item.rate || 0) * ((item.discount || 0) / 100)), 0);
    const gst = safeItems.reduce((sum, item) => sum + (((item.quantity || 0) * (item.rate || 0) * (1 - (item.discount || 0) / 100)) * ((item.gst_rate || 0) / 100)), 0);
    const total = subtotal - discount + gst;

    setOrderData(prev => ({ 
      ...prev, 
      items: safeItems, 
      subtotal, 
      discount_amount: discount, // This is the item-based discount
      gst_amount: gst, 
      total_amount: total, 
      balance: total 
    }));
  };
  
  const handleSave = async () => {
    try {
      await SaleOrder.create(orderData);
      navigate('/SaleOrders');
    } catch (error) {
      console.error("Error saving sale order:", error);
    }
  };

  const handleLinkPayment = () => {
    if (!orderData.customer_id) {
      alert("Please select a customer first");
      return;
    }
    setShowLinkPaymentDialog(true);
  };

  const handleLinkPaymentSubmit = (linkData) => {
    setOrderData(prev => {
      const newDiscountAmount = linkData.discount || 0;
      // Recalculate total_amount and balance based on the new discount
      const newTotalAmount = prev.subtotal - newDiscountAmount + prev.gst_amount;
      return {
        ...prev,
        linked_invoices: linkData.links,
        discount_amount: newDiscountAmount, // This explicitly sets the discount_amount
        total_amount: newTotalAmount,
        balance: newTotalAmount
      };
    });
    setShowLinkPaymentDialog(false);
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" size="icon" onClick={() => navigate('/SaleOrders')}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-slate-900">Create Sale Order</h1>
          </div>
          {/* Add Link Payment Button */}
          <Button 
            variant="outline" 
            onClick={handleLinkPayment}
            disabled={!orderData.customer_id}
            className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
          >
              <Link className="w-4 h-4 mr-2" />
              Link Payment
          </Button>
        </div>

        <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><FileText className="w-5 h-5" /> Order Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label>Customer *</Label>
                <Popover open={customerSearchOpen} onOpenChange={setCustomerSearchOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" role="combobox" className="w-full justify-between">
                      {orderData.customer_name || "Select Customer..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[300px] p-0">
                    <Command>
                      <CommandInput placeholder="Search customer..." />
                      <CommandEmpty>No customer found.</CommandEmpty>
                      <CommandGroup>
                        {customers.map((customer) => (
                          <CommandItem key={customer.id} onSelect={() => handleCustomerSelect(customer.id)}>
                            <Check className={`mr-2 h-4 w-4 ${orderData.customer_id === customer.id ? "opacity-100" : "opacity-0"}`} />
                            {customer.name}
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
              <div className="space-y-2">
                <Label htmlFor="delivery_date">Due Date</Label>
                <Input type="date" id="delivery_date" value={orderData.delivery_date} onChange={(e) => setOrderData(p=>({...p, delivery_date: e.target.value}))} />
              </div>
            </div>
            
            <Separator />
            
            <InvoiceItemTable 
              items={orderData.items || []}
              products={products}
              onItemsChange={handleItemsChange}
              invoiceType="B2C"
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
            <Button variant="outline" onClick={() => navigate('/SaleOrders')}>Cancel</Button>
            <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
              <Save className="w-4 h-4 mr-2" /> Save
            </Button>
          </CardFooter>
        </Card>
      </div>
      {/* Add Link Payment Dialog */}
      <LinkPaymentDialog
        open={showLinkPaymentDialog}
        onClose={() => setShowLinkPaymentDialog(false)}
        onSubmit={handleLinkPaymentSubmit}
        customer={orderData.customer_id ? { id: orderData.customer_id, name: orderData.customer_name } : null}
        paymentAmount={orderData.total_amount}
      />
    </div>
  );
}
