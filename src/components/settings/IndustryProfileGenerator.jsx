import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, Copy, Download, Settings } from 'lucide-react';

// Industry configuration templates
const industryTemplates = {
  'Textiles and Apparel': {
    itemColumns: [
      'Item Name',
      'Design No.',
      'Color',
      'Size',
      'Fabric Type',
      'Quantity',
      'Rate',
      'GST %',
      'Amount'
    ],
    extraFields: [
      { name: 'Fabric Composition', required: false },
      { name: 'Care Instructions', required: false },
      { name: 'Brand/Collection', required: false },
      { name: 'Season (Summer/Winter)', required: false }
    ],
    suggestedToggles: {
      showDiscount: true,
      showBarcode: true,
      showHSN: true,
      showImages: true,
      enableBatchTracking: false,
      enableSerialNumbers: false,
      enableExpiry: false,
      roundOff: true,
      multiCurrency: false
    },
    printFormat: 'A4 Portrait',
    theme: 'textile',
    additionalSettings: {
      defaultGST: 5,
      stockTracking: 'advanced',
      invoicePrefix: 'TEX',
      dueDays: 30
    }
  },
  
  'Healthcare and Pharmaceuticals': {
    itemColumns: [
      'Medicine Name',
      'Batch No.',
      'Expiry Date',
      'MRP',
      'HSN Code',
      'Quantity',
      'Rate',
      'GST %',
      'Amount'
    ],
    extraFields: [
      { name: 'Doctor Name', required: true },
      { name: 'Prescription No.', required: true },
      { name: 'Patient Name', required: false },
      { name: 'Drug License No.', required: true },
      { name: 'Pharmacist Name', required: true }
    ],
    suggestedToggles: {
      showDiscount: false,
      showBarcode: true,
      showHSN: true,
      showImages: false,
      enableBatchTracking: true,
      enableSerialNumbers: false,
      enableExpiry: true,
      roundOff: true,
      multiCurrency: false
    },
    printFormat: 'A4 Portrait',
    theme: 'pharma',
    additionalSettings: {
      defaultGST: 12,
      stockTracking: 'batch_expiry',
      invoicePrefix: 'MED',
      dueDays: 0,
      mandatoryFields: ['batch_no', 'expiry_date']
    }
  },

  'Electronics and Technology': {
    itemColumns: [
      'Product Name',
      'Brand',
      'Model No.',
      'Serial No.',
      'Warranty',
      'Quantity',
      'Rate',
      'GST %',
      'Amount'
    ],
    extraFields: [
      { name: 'IMEI Number', required: false },
      { name: 'Warranty Period', required: true },
      { name: 'Service Center', required: false },
      { name: 'Installation Required', required: false }
    ],
    suggestedToggles: {
      showDiscount: true,
      showBarcode: true,
      showHSN: true,
      showImages: true,
      enableBatchTracking: false,
      enableSerialNumbers: true,
      enableExpiry: false,
      roundOff: true,
      multiCurrency: true
    },
    printFormat: 'A4 Portrait',
    theme: 'electronics',
    additionalSettings: {
      defaultGST: 18,
      stockTracking: 'serial_based',
      invoicePrefix: 'ELEC',
      dueDays: 15
    }
  },

  'Food and Beverages': {
    itemColumns: [
      'Item Name',
      'Brand',
      'Pack Size',
      'Batch No.',
      'Expiry Date',
      'Quantity',
      'Rate',
      'GST %',
      'Amount'
    ],
    extraFields: [
      { name: 'FSSAI License', required: true },
      { name: 'Manufacturing Date', required: true },
      { name: 'Storage Instructions', required: false },
      { name: 'Nutritional Info', required: false }
    ],
    suggestedToggles: {
      showDiscount: true,
      showBarcode: true,
      showHSN: true,
      showImages: true,
      enableBatchTracking: true,
      enableSerialNumbers: false,
      enableExpiry: true,
      roundOff: true,
      multiCurrency: false
    },
    printFormat: 'A4 Portrait',
    theme: 'retail',
    additionalSettings: {
      defaultGST: 5,
      stockTracking: 'batch_expiry',
      invoicePrefix: 'FOOD',
      dueDays: 7
    }
  },

  'Automotive': {
    itemColumns: [
      'Part Name',
      'Part Number',
      'Vehicle Model',
      'Brand',
      'Warranty',
      'Quantity',
      'Rate',
      'GST %',
      'Amount'
    ],
    extraFields: [
      { name: 'Vehicle Registration', required: false },
      { name: 'Odometer Reading', required: false },
      { name: 'Mechanic Name', required: false },
      { name: 'Service Type', required: false }
    ],
    suggestedToggles: {
      showDiscount: true,
      showBarcode: true,
      showHSN: true,
      showImages: true,
      enableBatchTracking: false,
      enableSerialNumbers: true,
      enableExpiry: false,
      roundOff: true,
      multiCurrency: false
    },
    printFormat: 'A4 Portrait',
    theme: 'wholesale',
    additionalSettings: {
      defaultGST: 28,
      stockTracking: 'advanced',
      invoicePrefix: 'AUTO',
      dueDays: 30
    }
  },

  'Manufacturing': {
    itemColumns: [
      'Product Name',
      'HSN Code',
      'Batch/Lot No.',
      'Unit',
      'Quantity',
      'Rate',
      'Discount %',
      'CGST',
      'SGST',
      'Amount'
    ],
    extraFields: [
      { name: 'Transport Name', required: true },
      { name: 'LR Number', required: true },
      { name: 'E-way Bill No.', required: false },
      { name: 'Delivery Terms', required: false }
    ],
    suggestedToggles: {
      showDiscount: true,
      showBarcode: true,
      showHSN: true,
      showImages: false,
      enableBatchTracking: true,
      enableSerialNumbers: false,
      enableExpiry: false,
      roundOff: true,
      multiCurrency: true
    },
    printFormat: 'Multi-page A4',
    theme: 'wholesale',
    additionalSettings: {
      defaultGST: 18,
      stockTracking: 'batch_based',
      invoicePrefix: 'MFG',
      dueDays: 45
    }
  },

  'Retail and E-commerce': {
    itemColumns: [
      'Item Name',
      'SKU',
      'Quantity',
      'Rate',
      'Discount',
      'Tax',
      'Amount'
    ],
    extraFields: [
      { name: 'Delivery Address', required: false },
      { name: 'Order ID', required: false },
      { name: 'Payment Method', required: true },
      { name: 'Delivery Date', required: false }
    ],
    suggestedToggles: {
      showDiscount: true,
      showBarcode: true,
      showHSN: false,
      showImages: true,
      enableBatchTracking: false,
      enableSerialNumbers: false,
      enableExpiry: false,
      roundOff: true,
      multiCurrency: false
    },
    printFormat: '80mm Thermal',
    theme: 'retail',
    additionalSettings: {
      defaultGST: 18,
      stockTracking: 'simple',
      invoicePrefix: 'RET',
      dueDays: 0
    }
  },

  'Professional Services': {
    itemColumns: [
      'Service Description',
      'SAC Code',
      'Hours/Units',
      'Rate',
      'Amount'
    ],
    extraFields: [
      { name: 'Project Name', required: false },
      { name: 'Consultant Name', required: true },
      { name: 'Service Period', required: false },
      { name: 'Terms of Service', required: false }
    ],
    suggestedToggles: {
      showDiscount: true,
      showBarcode: false,
      showHSN: true,
      showImages: false,
      enableBatchTracking: false,
      enableSerialNumbers: false,
      enableExpiry: false,
      roundOff: true,
      multiCurrency: true
    },
    printFormat: 'A4 Portrait',
    theme: 'custom',
    additionalSettings: {
      defaultGST: 18,
      stockTracking: 'none',
      invoicePrefix: 'SRV',
      dueDays: 30
    }
  }
};

export default function IndustryProfileGenerator() {
  const [selectedIndustry, setSelectedIndustry] = useState('');
  const [customIndustry, setCustomIndustry] = useState('');
  const [generatedConfig, setGeneratedConfig] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateConfiguration = () => {
    setIsGenerating(true);
    
    // Simulate AI processing
    setTimeout(() => {
      const industry = selectedIndustry || customIndustry;
      const config = industryTemplates[selectedIndustry] || generateCustomConfig(customIndustry);
      
      setGeneratedConfig({
        industry,
        ...config
      });
      setIsGenerating(false);
    }, 1000);
  };

  const generateCustomConfig = (industryName) => {
    // Basic fallback configuration for custom industries
    return {
      itemColumns: [
        'Item Name',
        'Code/SKU',
        'Quantity',
        'Rate',
        'GST %',
        'Amount'
      ],
      extraFields: [
        { name: 'Reference No.', required: false },
        { name: 'Notes', required: false }
      ],
      suggestedToggles: {
        showDiscount: true,
        showBarcode: true,
        showHSN: true,
        showImages: false,
        enableBatchTracking: false,
        enableSerialNumbers: false,
        enableExpiry: false,
        roundOff: true,
        multiCurrency: false
      },
      printFormat: 'A4 Portrait',
      theme: 'retail',
      additionalSettings: {
        defaultGST: 18,
        stockTracking: 'simple',
        invoicePrefix: 'INV',
        dueDays: 30
      }
    };
  };

  const copyConfiguration = () => {
    if (generatedConfig) {
      const configText = formatConfigurationForCopy(generatedConfig);
      navigator.clipboard.writeText(configText);
    }
  };

  const formatConfigurationForCopy = (config) => {
    return `Industry: ${config.industry}

1. Item Table Columns:
${config.itemColumns.map(col => `- ${col}`).join('\n')}

2. Extra Fields:
${config.extraFields.map(field => `- ${field.name}: ${field.required ? 'Required' : 'Optional'}`).join('\n')}

3. Suggested Toggles:
${Object.entries(config.suggestedToggles).map(([key, value]) => `- [${value ? '✔' : ' '}] ${key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}`).join('\n')}

4. Recommended Print Format:
- ${config.printFormat}

5. Additional Settings:
- Default GST: ${config.additionalSettings.defaultGST}%
- Stock Tracking: ${config.additionalSettings.stockTracking}
- Invoice Prefix: ${config.additionalSettings.invoicePrefix}
- Default Due Days: ${config.additionalSettings.dueDays}`;
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            Industry Profile Generator
          </CardTitle>
          <p className="text-sm text-gray-600">
            Generate billing configurations tailored to your industry
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Select Industry</Label>
              <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose your industry..." />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(industryTemplates).map(industry => (
                    <SelectItem key={industry} value={industry}>
                      {industry}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Or Enter Custom Industry</Label>
              <Input
                placeholder="e.g., Jewelry & Accessories"
                value={customIndustry}
                onChange={(e) => setCustomIndustry(e.target.value)}
                disabled={!!selectedIndustry}
              />
            </div>
          </div>
          
          <Button 
            onClick={generateConfiguration}
            disabled={!selectedIndustry && !customIndustry}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                Generating Configuration...
              </>
            ) : (
              <>
                <Settings className="w-4 h-4 mr-2" />
                Generate Billing Configuration
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {generatedConfig && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Generated Configuration</CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={copyConfiguration}>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold text-lg mb-2">Industry: {generatedConfig.industry}</h3>
              <Badge variant="outline" className="mb-4">
                Theme: {generatedConfig.theme}
              </Badge>
            </div>

            <div>
              <h4 className="font-semibold mb-2">1. Item Table Columns:</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {generatedConfig.itemColumns.map((column, index) => (
                  <Badge key={index} variant="secondary" className="justify-start">
                    {column}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2">2. Extra Fields:</h4>
              <div className="space-y-2">
                {generatedConfig.extraFields.map((field, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span>{field.name}</span>
                    <Badge variant={field.required ? "destructive" : "outline"}>
                      {field.required ? "Required" : "Optional"}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2">3. Suggested Toggles:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {Object.entries(generatedConfig.suggestedToggles).map(([key, value]) => (
                  <div key={key} className="flex items-center space-x-2">
                    <Checkbox checked={value} disabled />
                    <span className="text-sm">
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2">4. Recommended Print Format:</h4>
              <Badge variant="outline" className="text-base px-4 py-2">
                {generatedConfig.printFormat}
              </Badge>
            </div>

            <div>
              <h4 className="font-semibold mb-2">5. Additional Settings:</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>Default GST: <strong>{generatedConfig.additionalSettings.defaultGST}%</strong></div>
                <div>Stock Tracking: <strong>{generatedConfig.additionalSettings.stockTracking}</strong></div>
                <div>Invoice Prefix: <strong>{generatedConfig.additionalSettings.invoicePrefix}</strong></div>
                <div>Default Due Days: <strong>{generatedConfig.additionalSettings.dueDays}</strong></div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}