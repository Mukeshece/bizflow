import { InvoiceSequence } from '@/api/entities';
import { Company } from '@/api/entities';
import { AppSettings } from '@/api/entities';

export const getCurrentFinancialYear = (date = new Date()) => {
  const month = date.getMonth();
  const year = date.getFullYear();
  if (month >= 3) { // April to March
    return `${year}-${String(year + 1).slice(2)}`;
  } else {
    return `${year - 1}-${String(year).slice(2)}`;
  }
};

export const getNextExpectedNumber = async (companyId, transactionType) => {
  try {
    const financialYear = getCurrentFinancialYear();
    
    const sequences = await InvoiceSequence.filter({
      company_id: companyId,
      transaction_type: transactionType,
      financial_year: financialYear,
    });
    
    const sequence = Array.isArray(sequences) ? sequences[0] : null;
    const nextNumber = sequence ? (sequence.current_number || 0) + 1 : 1;
    
    return nextNumber;
  } catch (error) {
    console.error(`Error getting next expected number for ${transactionType}:`, error);
    return 1;
  }
};

export const generateNextInvoiceNumber = async (companyId, transactionType) => {
  try {
    if (!companyId) {
      console.error("generateNextInvoiceNumber: companyId is missing.");
      return `${transactionType.slice(0,3).toUpperCase()}-${Date.now()}`;
    }
    
    const financialYear = getCurrentFinancialYear();
    
    // Get app settings for prefix configuration
    const settingsList = await AppSettings.list();
    const settings = settingsList?.[0] || {};
    
    // Determine prefix based on transaction type and settings
    let prefix = '';
    switch (transactionType) {
      case 'sales_invoice':
        prefix = settings.sale_prefix || 'INV';
        break;
      case 'purchase_invoice':
        prefix = settings.purchase_prefix || 'BILL';
        break;
      case 'credit_note':
        prefix = settings.credit_note_prefix || 'CN';
        break;
      case 'sale_order':
        prefix = settings.sale_order_prefix || 'SO';
        break;
      case 'purchase_order':
        prefix = settings.purchase_order_prefix || 'PO';
        break;
      case 'estimate':
        prefix = settings.estimate_prefix || 'EST';
        break;
      case 'proforma':
        prefix = settings.proforma_prefix || 'PI';
        break;
      case 'delivery_challan':
        prefix = settings.challan_prefix || 'DC';
        break;
      case 'sale_return':
        prefix = settings.sale_return_prefix || 'SR';
        break;
      case 'purchase_return':
        prefix = settings.purchase_return_prefix || 'PR';
        break;
      default:
        prefix = transactionType.slice(0,3).toUpperCase();
    }
    
    // Handle special prefix cases
    if (prefix === getCurrentFinancialYear()) {
      prefix = financialYear;
    } else if (prefix === 'none' || prefix === '') {
      prefix = '';
    }
    
    // Find or create sequence for this financial year
    let sequenceList = await InvoiceSequence.filter({
      company_id: companyId,
      transaction_type: transactionType,
      financial_year: financialYear,
    });
    
    let sequence = Array.isArray(sequenceList) ? sequenceList[0] : null;
    let nextNumber;

    if (sequence) {
      // Increment existing sequence
      nextNumber = (sequence.current_number || 0) + 1;
      await InvoiceSequence.update(sequence.id, { 
        current_number: nextNumber,
        last_updated: new Date().toISOString()
      });
    } else {
      // Create new sequence for this financial year
      nextNumber = settings.invoice_start_number || 1;
      
      const prefixWithYear = prefix ? `${prefix}/${financialYear}/` : `${financialYear}/`;
      
      sequence = await InvoiceSequence.create({
        company_id: companyId,
        transaction_type: transactionType,
        financial_year: financialYear,
        current_number: nextNumber,
        prefix: prefixWithYear,
        last_updated: new Date().toISOString()
      });
    }
    
    // Format the final invoice number
    const padding = settings.invoice_padding || 3;
    const paddedNumber = String(nextNumber).padStart(padding, '0');
    
    let finalPrefix = sequence.prefix || '';
    if (prefix && !finalPrefix.includes(prefix)) {
      finalPrefix = prefix ? `${prefix}/${financialYear}/` : `${financialYear}/`;
    }
    
    const finalInvoiceNumber = `${finalPrefix}${paddedNumber}`;

    // Update sequence with the generated number
    if (sequence && sequence.id) {
      await InvoiceSequence.update(sequence.id, { 
        last_generated_number: finalInvoiceNumber,
        prefix: finalPrefix
      });
    }
    
    console.log(`Generated invoice number: ${finalInvoiceNumber} for ${transactionType}`);
    return finalInvoiceNumber;

  } catch (error) {
    console.error(`Error in generateNextInvoiceNumber for type ${transactionType}:`, error);
    // Fallback to timestamp-based number
    return `${transactionType.slice(0,3).toUpperCase()}-${Date.now()}`;
  }
};

export const validateInvoiceNumberUniqueness = async (companyId, transactionType, invoiceNumber) => {
  try {
    if (!companyId || !invoiceNumber) return false;

    let existing = [];

    // Check uniqueness based on transaction type
    if (transactionType === 'sales_invoice') {
      const { SalesInvoice } = await import('@/api/entities');
      existing = await SalesInvoice.filter({ invoice_number: invoiceNumber });
    } else if (transactionType === 'purchase_invoice') {
      const { PurchaseInvoice } = await import('@/api/entities');
      existing = await PurchaseInvoice.filter({ invoice_number: invoiceNumber });
    } else if (transactionType === 'sale_order') {
      const { SaleOrder } = await import('@/api/entities');
      existing = await SaleOrder.filter({ order_number: invoiceNumber });
    } else if (transactionType === 'purchase_order') {
      const { PurchaseOrder } = await import('@/api/entities');
      existing = await PurchaseOrder.filter({ order_number: invoiceNumber });
    }
    
    return !(Array.isArray(existing) && existing.length > 0);

  } catch (error) {
    console.error("Error validating invoice number uniqueness:", error);
    return false;
  }
};