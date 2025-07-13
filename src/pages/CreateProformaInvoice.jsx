
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
import { ProformaInvoice, Customer, Product } from "@/api/entities";
import InvoiceItemTable from "../components/sales/InvoiceItemTable"; // Reusing the same item table

export default function CreateProformaInvoice() {
  const navigate = useNavigate();
  const [invoiceData, setInvoiceData] = useState({
    reference_no: `PI-${Date.now()}`,
    customer_id: "",
    customer_name: "",
    date: new Date().toISOString().split('T')[0],
    items: [],
    subtotal: 0,
    discount_amount: 0,
    gst_amount: 0,
    total_amount: 0,
    balance: 0,
    notes: ""
  });
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [customerSearchOpen, setCustomerSearchOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [customersData, productsData] = await Promise.all([Customer.list(), Product.list()]);
        setCustomers(customersData);
        setProducts(productsData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleCustomerSelect = (customerId) => {
    const customer = customers.find(c => c.id === customerId);
    if (customer) {
      setInvoiceData(prev => ({ ...prev, customer_id: customer.id, customer_name: customer.name }));
      setCustomerSearchOpen(false);
    }
  };
  
  const calculateTotals = (items) => {
    const safeItems = Array.isArray(items) ? items : [];
    const subtotal = safeItems.reduce((sum, item) => sum + ((item.quantity || 0) * (item.rate || 0)), 0);
    const discount = safeItems.reduce((sum, item) => sum + ((item.quantity || 0) * (item.rate || 0) * ((item.discount || 0) / 100)), 0);
    const gst = safeItems.reduce((sum, item) => sum + (((item.quantity || 0) * (item.rate || 0) * (1 - (item.discount || 0) / 100)) * ((item.gst_rate || 0) / 100)), 0);
    const total = subtotal - discount + gst;
    
    setInvoiceData(prev => ({ ...prev, subtotal, discount_amount: discount, gst_amount: gst, total_amount: total, balance: total }));
  };

  const handleItemsChange = (newItems) => {
    const safeItems = Array.isArray(newItems) ? newItems : [];
    setInvoiceData(prev => ({ ...prev, items: safeItems }));
    calculateTotals(safeItems);
  };
  
  const handleSave = async () => {
    try {
      await ProformaInvoice.create(invoiceData);
      navigate('/ProformaInvoice');
    } catch (error) {
      console.error("Error saving proforma invoice:", error);
    }
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" size="icon" onClick={() => navigate('/ProformaInvoice')}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Create Proforma Invoice</h1>
          </div>
        </div>

        <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><FileText className="w-5 h-5" /> Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label>Customer *</Label>
                <Popover open={customerSearchOpen} onOpenChange={setCustomerSearchOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" role="combobox" className="w-full justify-between">
                      {invoiceData.customer_name || "Select Customer..."}
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
                            <Check className={`mr-2 h-4 w-4 ${invoiceData.customer_id === customer.id ? "opacity-100" : "opacity-0"}`} />
                            {customer.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label htmlFor="reference_no">Reference #</Label>
                <Input id="reference_no" value={invoiceData.reference_no} readOnly />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input type="date" id="date" value={invoiceData.date} onChange={(e) => setInvoiceData(p=>({...p, date: e.target.value}))} />
              </div>
            </div>
            
            <Separator />
            
            <InvoiceItemTable 
              items={invoiceData.items || []}
              products={products}
              onItemsChange={handleItemsChange}
              invoiceType="B2C" // Proforma can use B2C/retail pricing as default
            />

            <Separator />

            <div className="flex justify-end">
                <div className="w-full md:w-80 space-y-2 text-sm">
                  <div className="flex justify-between"><span>Subtotal</span><span>₹{invoiceData.subtotal.toFixed(2)}</span></div>
                  <div className="flex justify-between"><span>Discount</span><span className="text-green-600">- ₹{invoiceData.discount_amount.toFixed(2)}</span></div>
                  <div className="flex justify-between"><span>GST</span><span>+ ₹{invoiceData.gst_amount.toFixed(2)}</span></div>
                  <Separator />
                  <div className="flex justify-between font-bold text-lg"><span>Total</span><span>₹{invoiceData.total_amount.toFixed(2)}</span></div>
                </div>
              </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => navigate('/ProformaInvoice')}>Cancel</Button>
            <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
              <Save className="w-4 h-4 mr-2" /> Save
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
