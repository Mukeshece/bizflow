
import React, { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { getCurrentFinancialYear } from '@/components/utils/invoiceNumberGenerator';

const PrefixSelector = ({ label, value, onChange, onAdd, nextNumber }) => {
  const [customPrefix, setCustomPrefix] = useState('');

  const predefinedPrefixes = [
    { value: 'none', label: 'None', description: '(No prefix)' },
    { value: getCurrentFinancialYear(), label: getCurrentFinancialYear(), badge: 'FINANCIAL YEAR' },
    { value: 'INV', label: 'INV', description: '(Invoice)' },
    { value: 'BILL', label: 'BILL', description: '(Bill)' },
    { value: 'SO', label: 'SO', description: '(Sale Order)' },
    { value: 'PO', label: 'PO', description: '(Purchase Order)' },
    { value: 'EST', label: 'EST', description: '(Estimate)' },
    { value: 'CN', label: 'CN', description: '(Credit Note)' },
    { value: 'SR', label: 'SR', description: '(Sale Return)' },
    { value: 'PR', label: 'PR', description: '(Purchase Return)' }
  ];

  const handleAddCustomPrefix = () => {
    if (customPrefix.trim()) {
      onAdd(customPrefix.trim());
      onChange(customPrefix.trim());
      setCustomPrefix('');
    }
  };

  const getPreviewNumber = () => {
    if (!nextNumber) return '';
    
    const currentYear = getCurrentFinancialYear();
    let prefix = '';
    
    if (value === 'none' || value === '') {
      prefix = '';
    } else if (value === currentYear) {
      prefix = `${currentYear}/`;
    } else {
      prefix = `${value}/${currentYear}/`;
    }
    
    const paddedNumber = String(nextNumber).padStart(3, '0');
    return `${prefix}${paddedNumber}`;
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label>{label}</Label>
        {nextNumber && (
          <Badge variant="outline" className="text-xs">
            Next: {getPreviewNumber()}
          </Badge>
        )}
      </div>
      
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select or enter prefix" />
        </SelectTrigger>
        <SelectContent>
          {predefinedPrefixes.map((prefix) => (
            <SelectItem key={prefix.value} value={prefix.value}>
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{prefix.label}</span>
                  {prefix.description && (
                    <span className="text-gray-500 text-sm">{prefix.description}</span>
                  )}
                </div>
                {prefix.badge && (
                  <Badge variant="secondary" className="ml-2 text-xs bg-blue-100 text-blue-700">
                    {prefix.badge}
                  </Badge>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      <div className="flex gap-2">
        <Input
          placeholder="Add custom prefix (e.g., ABC, XYZ)"
          value={customPrefix}
          onChange={(e) => setCustomPrefix(e.target.value.toUpperCase())}
          className="flex-1"
          maxLength={10}
        />
        <Button 
          onClick={handleAddCustomPrefix}
          variant="outline"
          disabled={!customPrefix.trim()}
        >
          ADD
        </Button>
      </div>
      
      {getPreviewNumber() && (
        <div className="text-sm text-gray-600">
          <strong>Preview:</strong> {getPreviewNumber()}
        </div>
      )}
    </div>
  );
};

export default PrefixSelector;
