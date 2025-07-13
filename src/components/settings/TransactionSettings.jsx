
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info, AlertTriangle } from "lucide-react";
import { HelpTooltip } from "../ui/HelpTooltip";
import { getCurrentFinancialYear, getNextExpectedNumber } from "@/components/utils/invoiceNumberGenerator";

const PrefixSelector = ({ label, value, onChange, onAdd, nextNumber }) => {
  const [customPrefix, setCustomPrefix] = useState('');

  const predefinedPrefixes = [
    { value: 'none', label: 'None' },
    { value: '2025-26', label: getCurrentFinancialYear(), badge: 'MOST USED' },
    { value: 'INV', label: 'INV', description: '(ex. CN for credit note etc.)' },
    { value: 'MS', label: 'MS', description: '(Firm name initials)' }
  ];

  const handleAddCustomPrefix = () => {
    if (customPrefix.trim()) {
      onAdd(customPrefix.trim());
      setCustomPrefix('');
    }
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Enter Prefix or Select" />
        </SelectTrigger>
        <SelectContent>
          {predefinedPrefixes.map((prefix) => (
            <SelectItem key={prefix.value} value={prefix.value}>
              <div className="flex items-center justify-between w-full">
                <div>
                  <span>{prefix.label}</span>
                  {prefix.description && (
                    <span className="text-gray-500 text-sm ml-2">{prefix.description}</span>
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
      
      <div className="flex gap-2 mt-2">
        <Input
          placeholder="Add custom prefix"
          value={customPrefix}
          onChange={(e) => setCustomPrefix(e.target.value)}
          className="flex-1"
        />
        <Button 
          onClick={handleAddCustomPrefix}
          className="bg-blue-500 hover:bg-blue-600"
          disabled={!customPrefix.trim()}
        >
          ADD
        </Button>
      </div>
    </div>
  );
};

export default function TransactionSettings({ settings, onSettingChange, activeCompany, prefixes }) {
  const [nextExpectedNumbers, setNextExpectedNumbers] = useState({});

  useEffect(() => {
    // Load next expected numbers for preview
    if (activeCompany?.id) {
      const loadNextNumbers = async () => {
        const types = ['sales_invoice', 'purchase_invoice', 'sale_order', 'purchase_order', 'estimate'];
        const numbers = {};
        
        for (const type of types) {
          try {
            numbers[type] = await getNextExpectedNumber(activeCompany.id, type);
          } catch (error) {
            console.error(`Error loading next number for ${type}:`, error);
            numbers[type] = 1;
          }
        }
        
        setNextExpectedNumbers(numbers);
      };
      
      loadNextNumbers();
    }
  }, [activeCompany?.id, settings.invoice_start_number, settings.invoice_yearly_reset]);

  const handlePrefixAdd = (prefixType, newPrefix) => {
    // Add the new prefix to settings
    onSettingChange(`${prefixType}_prefix`, newPrefix);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Transaction Prefixes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Company</Label>
            <Input 
              value={activeCompany?.name || ''}
              readOnly
              className="bg-gray-50"
            />
          </div>

          <div className="space-y-4">
            <Label className="text-base font-medium">Transaction Prefixes</Label>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <PrefixSelector
                label="Sales Invoice"
                value={settings.sale_prefix || 'INV'}
                onChange={(value) => onSettingChange('sale_prefix', value)}
                onAdd={(prefix) => handlePrefixAdd('sale', prefix)}
                nextNumber={nextExpectedNumbers.sales_invoice}
              />
              
              <PrefixSelector
                label="Purchase Bill"
                value={settings.purchase_prefix || 'BILL'}
                onChange={(value) => onSettingChange('purchase_prefix', value)}
                onAdd={(prefix) => handlePrefixAdd('purchase', prefix)}
                nextNumber={nextExpectedNumbers.purchase_invoice}
              />
              
              <PrefixSelector
                label="Credit Note"
                value={settings.credit_note_prefix || 'CN'}
                onChange={(value) => onSettingChange('credit_note_prefix', value)}
                onAdd={(prefix) => handlePrefixAdd('credit_note', prefix)}
              />
              
              <PrefixSelector
                label="Sale Order"
                value={settings.sale_order_prefix || 'SO'}
                onChange={(value) => onSettingChange('sale_order_prefix', value)}
                onAdd={(prefix) => handlePrefixAdd('sale_order', prefix)}
                nextNumber={nextExpectedNumbers.sale_order}
              />
              
              <PrefixSelector
                label="Purchase Order"
                value={settings.purchase_order_prefix || 'PO'}
                onChange={(value) => onSettingChange('purchase_order_prefix', value)}
                onAdd={(prefix) => handlePrefixAdd('purchase_order', prefix)}
                nextNumber={nextExpectedNumbers.purchase_order}
              />
              
              <PrefixSelector
                label="Estimate"
                value={settings.estimate_prefix || 'EST'}
                onChange={(value) => onSettingChange('estimate_prefix', value)}
                onAdd={(prefix) => handlePrefixAdd('estimate', prefix)}
                nextNumber={nextExpectedNumbers.estimate}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Invoice Number Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Invoice numbers will be sequential and unique for GST compliance. 
              Current Financial Year: <strong>{getCurrentFinancialYear()}</strong>
              {Object.keys(nextExpectedNumbers).length > 0 && (
                <div className="mt-2 text-sm">
                  <strong>Next Numbers:</strong>
                  <ul className="list-disc list-inside mt-1">
                    <li>Sales Invoice: {nextExpectedNumbers.sales_invoice}</li>
                    <li>Purchase Bill: {nextExpectedNumbers.purchase_invoice}</li>
                    <li>Sale Order: {nextExpectedNumbers.sale_order}</li>
                  </ul>
                </div>
              )}
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label>Invoice Number Generation</Label>
            <RadioGroup
              value={settings.invoice_number_mode || 'auto'}
              onValueChange={(value) => onSettingChange('invoice_number_mode', value)}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="auto" id="auto-mode" />
                <Label htmlFor="auto-mode">Automatic (Recommended)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="manual" id="manual-mode" />
                <Label htmlFor="manual-mode">Manual</Label>
              </div>
            </RadioGroup>
          </div>

          {settings.invoice_number_mode !== 'manual' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
              <div className="space-y-2">
                <Label htmlFor="start-number">Starting Number</Label>
                <Input
                  id="start-number"
                  type="number"
                  value={settings.invoice_start_number || 1}
                  onChange={(e) => onSettingChange('invoice_start_number', parseInt(e.target.value, 10))}
                  min="1"
                />
                <p className="text-xs text-gray-500">This applies to new sequences only</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="padding">Number Padding</Label>
                <Input
                  id="padding"
                  type="number"
                  value={settings.invoice_padding || 3}
                  onChange={(e) => onSettingChange('invoice_padding', parseInt(e.target.value, 10))}
                  min="1"
                  max="10"
                  placeholder="e.g., 3 for 001"
                />
                <p className="text-xs text-gray-500">Number of digits (e.g., 3 for 001, 002...)</p>
              </div>
              <div className="md:col-span-2 flex items-center space-x-2">
                <Switch
                  id="yearly-reset"
                  checked={settings.invoice_yearly_reset || false}
                  onCheckedChange={(checked) => onSettingChange('invoice_yearly_reset', checked)}
                />
                <Label htmlFor="yearly-reset">Reset invoice numbers at the start of each financial year</Label>
              </div>
            </div>
          )}

          {settings.invoice_number_mode === 'manual' && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Warning:</strong> Manual mode requires you to ensure invoice numbers are consecutive and unique. 
                Non-compliance may result in GST penalties.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Other Transaction Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Enable Round Off in transactions</Label>
            <Switch
              checked={settings.enable_round_off}
              onCheckedChange={(value) => onSettingChange('enable_round_off', value)}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label>Stop sale if item stock is negative</Label>
            <Switch
              checked={settings.stop_sale_on_negative_stock}
              onCheckedChange={(value) => onSettingChange('stop_sale_on_negative_stock', value)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
