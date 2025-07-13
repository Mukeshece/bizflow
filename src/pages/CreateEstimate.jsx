import React from 'react';
import InvoiceTemplate from '../components/invoices/InvoiceTemplate';
import { Estimate } from '@/api/entities';

export default function CreateEstimate() {
  const saveEstimate = async (data) => {
    try {
      // Logic to save the estimate
      await Estimate.create(data);
      console.log('Estimate saved:', data);
    } catch (error) {
      console.error('Failed to save estimate:', error);
    }
  };

  return (
    <InvoiceTemplate
      title="Create Estimate"
      onSave={saveEstimate}
      transactionType="Estimate"
      invoiceNumberPrefix="EST-"
    />
  );
}