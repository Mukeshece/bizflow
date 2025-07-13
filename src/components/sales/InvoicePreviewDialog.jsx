import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, Printer, X } from 'lucide-react';
import { SalesInvoice, Customer, Company } from '@/api/entities';
import ProductBasedInvoiceTemplate, { getThemeByProducts } from '../invoices/ProductBasedThemes';

export default function InvoicePreviewDialog({ invoiceId, open, onClose }) {
  const [loading, setLoading] = useState(true);
  const [invoice, setInvoice] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [company, setCompany] = useState(null);
  const [theme, setTheme] = useState('retail');
  
  const componentRef = useRef();

  useEffect(() => {
    if (invoiceId) {
      loadData();
    }
  }, [invoiceId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const invoiceData = await SalesInvoice.get(invoiceId);
      if (!invoiceData) {
        setLoading(false);
        return;
      }
      
      const [customerData, companyData] = await Promise.all([
        invoiceData.customer_id ? Customer.get(invoiceData.customer_id) : Promise.resolve({ name: invoiceData.customer_name || 'Cash Sale' }),
        Company.list().then(res => res[0])
      ]);

      const detectedTheme = getThemeByProducts(invoiceData.items);
      
      setInvoice(invoiceData);
      setCustomer(customerData);
      setCompany(companyData);
      setTheme(detectedTheme);

    } catch (error) {
      console.error("Error loading invoice preview data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <style>
        {`
          @media print {
            body * {
              visibility: hidden;
            }
            #invoice-to-print, #invoice-to-print * {
              visibility: visible;
            }
            #invoice-to-print {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
            }
          }
        `}
      </style>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Invoice Preview - #{invoice?.invoice_number}</DialogTitle>
        </DialogHeader>
        <div className="flex-grow overflow-auto p-4 bg-gray-100">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              <p className="ml-4">Loading Invoice...</p>
            </div>
          ) : invoice ? (
            <div ref={componentRef} id="invoice-to-print" className="p-2">
              <ProductBasedInvoiceTemplate
                invoiceData={invoice}
                companyData={company}
                customerData={customer}
                forceTheme={theme}
              />
            </div>
          ) : (
            <div className="text-center">Invoice data not found.</div>
          )}
        </div>
        <DialogFooter className="flex-shrink-0">
          <Button variant="outline" onClick={onClose}>
            <X className="w-4 h-4 mr-2" />
            Close
          </Button>
          <Button onClick={handlePrint} disabled={loading}>
            <Printer className="w-4 h-4 mr-2" />
            Print
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}