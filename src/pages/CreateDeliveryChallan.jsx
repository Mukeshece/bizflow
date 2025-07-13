import React from 'react';
import InvoiceTemplate from '../components/invoices/InvoiceTemplate';
import { DeliveryChallan } from '@/api/entities';

export default function CreateDeliveryChallan() {
  const saveChallan = async (data) => {
    try {
      await DeliveryChallan.create(data);
      console.log('Challan saved:', data);
    } catch (error) {
      console.error('Failed to save challan:', error);
    }
  };

  return (
    <InvoiceTemplate
      title="Create Delivery Challan"
      onSave={saveChallan}
      transactionType="Delivery Challan"
      invoiceNumberPrefix="CHLN-"
      isPriceHidden={true}
    />
  );
}