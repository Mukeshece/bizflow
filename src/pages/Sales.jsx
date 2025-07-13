import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, FileText, Package, Truck, Undo2, Receipt, Calculator, Link as LinkIcon } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { SalesInvoice } from "@/api/entities";
import { SaleOrder } from "@/api/entities";
import { SaleReturn } from "@/api/entities";
import { Estimate } from "@/api/entities";
import { ProformaInvoice } from "@/api/entities";
import { DeliveryChallan } from "@/api/entities";
import SalesInvoiceList from "@/components/sales/SalesInvoiceList";
import SaleOrderList from "@/components/sales/SaleOrderList";
import SalesReturnList from "@/components/sales/SalesReturnList";

export default function Sales() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const initialView = searchParams.get("view") || "invoices";

  const [invoices, setInvoices] = useState([]);
  const [orders, setOrders] = useState([]);
  const [returns, setReturns] = useState([]);
  const [estimates, setEstimates] = useState([]);
  const [proformaInvoices, setProformaInvoices] = useState([]);
  const [deliveryChallans, setDeliveryChallans] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(initialView);
  const [showLinkPaymentDialog, setShowLinkPaymentDialog] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const loadData = async (tab) => {
    setIsLoading(true);
    try {
      let data;
      switch (tab) {
        case "invoices":
          data = await SalesInvoice.list('-invoice_date');
          setInvoices(Array.isArray(data) ? data : []);
          break;
        case "orders":
          data = await SaleOrder.list('-order_date');
          setOrders(Array.isArray(data) ? data : []);
          break;
        case "returns":
          data = await SaleReturn.list('-return_date');
          setReturns(Array.isArray(data) ? data : []);
          break;
        case "estimates":
          data = await Estimate.list('-estimate_date');
          setEstimates(Array.isArray(data) ? data : []);
          break;
        case "proforma":
          data = await ProformaInvoice.list('-date');
          setProformaInvoices(Array.isArray(data) ? data : []);
          break;
        case "challans":
          data = await DeliveryChallan.list('-challan_date');
          setDeliveryChallans(Array.isArray(data) ? data : []);
          break;
        default:
          break;
      }
    } catch (error) {
      console.error(`Error loading ${tab} data:`, error);
      // Set to empty arrays on error to prevent crashes
      switch (tab) {
        case "invoices": setInvoices([]); break;
        case "orders": setOrders([]); break;
        case "returns": setReturns([]); break;
        case "estimates": setEstimates([]); break;
        case "proforma": setProformaInvoices([]); break;
        case "challans": setDeliveryChallans([]); break;
        default: break;
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData(activeTab);
  }, [activeTab]);

  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
  };

  const handleLinkPayment = (invoice) => {
    setSelectedInvoice(invoice);
    setShowLinkPaymentDialog(true);
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="max-w-full mx-auto">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsContent value="invoices">
            <SalesInvoiceList 
              invoices={invoices} 
              isLoading={isLoading}
              onRefresh={() => loadData("invoices")}
              onLinkPayment={handleLinkPayment}
            />
          </TabsContent>
          
          <TabsContent value="orders">
            <SaleOrderList 
              orders={orders} 
              isLoading={isLoading}
              onRefresh={() => loadData("orders")}
            />
          </TabsContent>
          
          <TabsContent value="estimates">
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Estimates/Quotations</h2>
                </div>
                {isLoading ? (
                  <div className="text-center py-8">Loading estimates...</div>
                ) : estimates.length === 0 ? (
                  <div className="text-center py-16">
                    <Calculator className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Estimates Found</h3>
                    <p className="text-slate-500 mb-4">Create and manage your price quotes and estimates.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {estimates.map(estimate => (
                      <div key={estimate.id} className="border rounded-lg p-4 hover:bg-gray-50">
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="font-medium">{estimate.estimate_number}</h4>
                            <p className="text-sm text-gray-600">{estimate.customer_name}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">₹{estimate.total_amount?.toLocaleString()}</p>
                            <p className="text-xs text-gray-500">{estimate.estimate_date}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="proforma">
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Proforma Invoices</h2>
                </div>
                {isLoading ? (
                  <div className="text-center py-8">Loading proforma invoices...</div>
                ) : proformaInvoices.length === 0 ? (
                  <div className="text-center py-16">
                    <Receipt className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Proforma Invoices Found</h3>
                    <p className="text-slate-500 mb-4">Manage your proforma invoices and convert them to sales.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {proformaInvoices.map(proforma => (
                      <div key={proforma.id} className="border rounded-lg p-4 hover:bg-gray-50">
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="font-medium">{proforma.reference_no}</h4>
                            <p className="text-sm text-gray-600">{proforma.customer_name}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">₹{proforma.total_amount?.toLocaleString()}</p>
                            <p className="text-xs text-gray-500">{proforma.date}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="challans">
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Delivery Challans</h2>
                </div>
                {isLoading ? (
                  <div className="text-center py-8">Loading delivery challans...</div>
                ) : deliveryChallans.length === 0 ? (
                  <div className="text-center py-16">
                    <Truck className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Delivery Challans Found</h3>
                    <p className="text-slate-500 mb-4">Track deliveries and manage goods movement.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {deliveryChallans.map(challan => (
                      <div key={challan.id} className="border rounded-lg p-4 hover:bg-gray-50">
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="font-medium">{challan.challan_number}</h4>
                            <p className="text-sm text-gray-600">{challan.customer_name}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-500">{challan.challan_date}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="returns">
            <SalesReturnList 
              returns={returns} 
              isLoading={isLoading}
              onRefresh={() => loadData("returns")}
              onLinkPayment={handleLinkPayment}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}