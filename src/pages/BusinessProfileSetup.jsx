
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, ArrowLeft, CheckCircle, Building, Settings, Package, FileText } from 'lucide-react';
import { Company } from '@/api/entities';
import { AppSettings } from '@/api/entities';
import { Firm } from '@/api/entities/Firm';
import { User } from '@/api/entities'; // Added User import
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { INDUSTRY_CONFIGS } from '../components/settings/IndustryBillingConfig';

const businessIndustries = [
  { value: 'textile', label: 'Textiles and Apparel', description: 'Sarees, Kurtas, Fabrics, Clothing' },
  { value: 'pharmaceutical', label: 'Healthcare and Pharmaceuticals', description: 'Medical stores, Pharmacy, Distributors' },
  { value: 'electronics', label: 'Electronics and Technology', description: 'Mobile shops, Appliances, Computers' },
  { value: 'food', label: 'Food and Beverages', description: 'Restaurants, Grocery, Food processing' },
  { value: 'automotive', label: 'Automotive', description: 'Car dealers, Parts, Service centers' },
  { value: 'retail', label: 'Retail and E-commerce', description: 'Supermarkets, Online stores, General retail' },
  { value: 'wholesale', label: 'Wholesale Business', description: 'Bulk trading, Distribution, B2B sales' },
  { value: 'manufacturing', label: 'Manufacturing', description: 'Production, Assembly, Industrial goods' },
  { value: 'services', label: 'Professional Services', description: 'Consulting, Agency, Service providers' },
  { value: 'general', label: 'General Business', description: 'Mixed products, Other categories' }
];

const countries = [
  { code: 'IN', name: 'India', currency: 'INR', symbol: '₹', gst: true },
  { code: 'US', name: 'United States', currency: 'USD', symbol: '$', gst: false },
  { code: 'GB', name: 'United Kingdom', currency: 'GBP', symbol: '£', gst: false },
  { code: 'CA', name: 'Canada', currency: 'CAD', symbol: 'C$', gst: false },
  { code: 'AU', name: 'Australia', currency: 'AUD', symbol: 'A$', gst: true },
  { code: 'DE', name: 'Germany', currency: 'EUR', symbol: '€', gst: true },
  { code: 'SG', name: 'Singapore', currency: 'SGD', symbol: 'S$', gst: true }
];

const timeZones = [
  'Asia/Kolkata (UTC+05:30)',
  'America/New_York (UTC-05:00)',
  'America/Los_Angeles (UTC-08:00)',
  'Europe/London (UTC+00:00)',
  'Europe/Paris (UTC+01:00)',
  'Asia/Singapore (UTC+08:00)',
  'Australia/Sydney (UTC+10:00)'
];

const dateFormats = [
  { value: 'dd-mm-yyyy', label: 'dd-mm-yyyy (31-12-2024)' },
  { value: 'mm-dd-yyyy', label: 'mm-dd-yyyy (12-31-2024)' },
  { value: 'yyyy-mm-dd', label: 'yyyy-mm-dd (2024-12-31)' },
  { value: 'dd/mm/yyyy', label: 'dd/mm/yyyy (31/12/2024)' }
];

export default function BusinessProfileSetup() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1: Business Setup
    businessName: '',
    businessIndustry: '',
    businessAddress: '',
    country: 'IN',
    timeZone: 'Asia/Kolkata (UTC+05:30)',
    dateFormat: 'dd-mm-yyyy',
    currency: 'INR',
    
    // Step 2: Industry Configuration  
    selectedModules: [],
    billingFeatures: {},
    
    // Step 3: Company Details
    phone: '',
    email: '',
    website: '',
    gstNumber: '',
    panNumber: ''
  });

  const [industryConfig, setIndustryConfig] = useState(null);

  useEffect(() => {
    if (formData.businessIndustry) {
      const config = INDUSTRY_CONFIGS[formData.businessIndustry];
      setIndustryConfig(config);
      
      // Auto-configure billing features based on industry
      setFormData(prev => ({
        ...prev,
        billingFeatures: config?.toggles || {}
      }));
    }
  }, [formData.businessIndustry]);

  const handleInputChange = (field, value) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      
      // Auto-update currency when country changes
      if (field === 'country') {
        const selectedCountry = countries.find(c => c.code === value);
        if (selectedCountry) {
          updated.currency = selectedCountry.currency;
        }
      }
      
      return updated;
    });
  };

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFinish = async () => {
    try {
      // Create company profile
      const selectedCountry = countries.find(c => c.code === formData.country);
      const newCompany = await Company.create({
        name: formData.businessName,
        address: formData.businessAddress,
        phone: formData.phone,
        email: formData.email,
        website: formData.website,
        gst_number: formData.gstNumber,
        pan_number: formData.panNumber,
        country: formData.country,
        currency: formData.currency,
      });

      // Create firm with industry-specific prefix
      const prefix = industryConfig?.invoicePrefix || 'INV';
      await Firm.create({
        name: formData.businessName,
        is_default: true,
        sale_prefix: prefix,
      });

      // Create app settings based on industry configuration
      await AppSettings.create({
        business_currency: selectedCountry?.symbol || '₹',
        enable_gstin: selectedCountry?.gst || false,
        enable_transaction_tax: formData.billingFeatures.showHSN !== false,
        enable_transaction_discount: formData.billingFeatures.showDiscount !== false,
        enable_round_off: formData.billingFeatures.roundOff !== false,
        // Industry-specific settings
        ...(industryConfig && {
          item_enable_low_stock_alerts: industryConfig.toggles.showBarcode,
          item_auto_generate_barcode: industryConfig.toggles.showBarcode,
          enable_batch_tracking: industryConfig.toggles.enableBatchTracking,
          enable_serial_tracking: industryConfig.toggles.showSerialNumber,
        })
      });

      // Set this new company as the active one for the user
      await User.updateMyUserData({ active_company_id: newCompany.id });

      // Navigate to onboarding completion page
      navigate(createPageUrl('OnboardingCompletion'));
    } catch (error) {
      console.error('Error setting up business profile:', error);
      alert('Error setting up your business profile. Please try again.');
    }
  };

  const Step1BusinessSetup = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Setup Your Business</h2>
        <p className="text-gray-600">Empower Your Success with BizFlow</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="businessName" className="text-sm font-medium text-blue-600">
            Business Name*
          </Label>
          <Input
            id="businessName"
            value={formData.businessName}
            onChange={(e) => handleInputChange('businessName', e.target.value)}
            placeholder="Mukesh Sarees"
            className="border-blue-300 focus:border-blue-500"
          />
          {formData.businessName && (
            <div className="flex items-center text-green-600 text-sm">
              <CheckCircle className="w-4 h-4 mr-1" />
              Looks good!
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="businessIndustry" className="text-sm font-medium text-blue-600">
            Business Industry*
          </Label>
          <Select value={formData.businessIndustry} onValueChange={(value) => handleInputChange('businessIndustry', value)}>
            <SelectTrigger className="border-blue-300 focus:border-blue-500">
              <SelectValue placeholder="Select your industry" />
            </SelectTrigger>
            <SelectContent>
              {businessIndustries.map(industry => (
                <SelectItem key={industry.value} value={industry.value}>
                  <div>
                    <div className="font-medium">{industry.label}</div>
                    <div className="text-xs text-gray-500">{industry.description}</div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {formData.businessIndustry && (
            <div className="flex items-center text-green-600 text-sm">
              <CheckCircle className="w-4 h-4 mr-1" />
              Industry selected
            </div>
          )}
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="businessAddress" className="text-sm font-medium">
            Business Address*
          </Label>
          <Textarea
            id="businessAddress"
            value={formData.businessAddress}
            onChange={(e) => handleInputChange('businessAddress', e.target.value)}
            placeholder="Enter your complete business address"
            rows={3}
            className="border-gray-300"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="country" className="text-sm font-medium">Country*</Label>
          <Select value={formData.country} onValueChange={(value) => handleInputChange('country', value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {countries.map(country => (
                <SelectItem key={country.code} value={country.code}>
                  {country.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="timeZone" className="text-sm font-medium">Time Zone*</Label>
          <Select value={formData.timeZone} onValueChange={(value) => handleInputChange('timeZone', value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {timeZones.map(tz => (
                <SelectItem key={tz} value={tz}>{tz}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="dateFormat" className="text-sm font-medium">Date Format*</Label>
          <Select value={formData.dateFormat} onValueChange={(value) => handleInputChange('dateFormat', value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {dateFormats.map(format => (
                <SelectItem key={format.value} value={format.value}>{format.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="currency" className="text-sm font-medium">Currency*</Label>
          <Select value={formData.currency} onValueChange={(value) => handleInputChange('currency', value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {countries.map(country => (
                <SelectItem key={country.currency} value={country.currency}>
                  {country.symbol} ({country.currency})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );

  const Step2SelectModules = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Select Modules</h2>
        <p className="text-gray-600">Choose features based on your industry needs</p>
      </div>

      {industryConfig && (
        <div className="bg-blue-50 p-6 rounded-lg mb-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">
            {industryConfig.name} - Recommended Configuration
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-blue-800 mb-3">Invoice Fields</h4>
              <div className="space-y-2">
                {industryConfig.itemColumns.map((column, index) => (
                  <div key={index} className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                    <span className="text-sm">{column.label}</span>
                    {column.required && <Badge variant="outline" className="ml-2 text-xs">Required</Badge>}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium text-blue-800 mb-3">Features Enabled</h4>
              <div className="space-y-2">
                {Object.entries(industryConfig.toggles).map(([key, enabled]) => (
                  enabled && (
                    <div key={key} className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                      <span className="text-sm">{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</span>
                    </div>
                  )
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-white rounded border-l-4 border-blue-500">
            <p className="text-sm text-blue-700">
              <strong>Print Format:</strong> {industryConfig.printFormat}
            </p>
            <p className="text-sm text-blue-700">
              <strong>Default GST:</strong> {industryConfig.defaultGST}%
            </p>
            <p className="text-sm text-blue-700">
              <strong>Invoice Prefix:</strong> {industryConfig.invoicePrefix}
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Sales Features
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <label className="flex items-center space-x-2">
              <input type="checkbox" defaultChecked className="rounded" />
              <span>Sales Invoices</span>
            </label>
            <label className="flex items-center space-x-2">
              <input type="checkbox" defaultChecked className="rounded" />
              <span>Quotations & Estimates</span>
            </label>
            <label className="flex items-center space-x-2">
              <input type="checkbox" defaultChecked className="rounded" />
              <span>Payment Tracking</span>
            </label>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Inventory Features
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <label className="flex items-center space-x-2">
              <input type="checkbox" defaultChecked className="rounded" />
              <span>Stock Management</span>
            </label>
            <label className="flex items-center space-x-2">
              <input type="checkbox" defaultChecked={industryConfig?.toggles.showBarcode} className="rounded" />
              <span>Barcode Support</span>
            </label>
            <label className="flex items-center space-x-2">
              <input type="checkbox" defaultChecked={industryConfig?.toggles.showSerialNumber} className="rounded" />
              <span>Serial Number Tracking</span>
            </label>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const Step3CompanyDetails = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Company Details</h2>
        <p className="text-gray-600">Complete your business information</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            placeholder="+91 98765 43210"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            placeholder="business@example.com"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="website">Website</Label>
          <Input
            id="website"
            value={formData.website}
            onChange={(e) => handleInputChange('website', e.target.value)}
            placeholder="https://www.example.com"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="gstNumber">GST Number</Label>
          <Input
            id="gstNumber"
            value={formData.gstNumber}
            onChange={(e) => handleInputChange('gstNumber', e.target.value)}
            placeholder="27ABCDE1234F1Z5"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="panNumber">PAN Number</Label>
          <Input
            id="panNumber"
            value={formData.panNumber}
            onChange={(e) => handleInputChange('panNumber', e.target.value)}
            placeholder="ABCDE1234F"
          />
        </div>
      </div>

      <div className="bg-green-50 p-6 rounded-lg">
        <h4 className="font-semibold text-green-900 mb-4">Setup Summary</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-green-800">
          <div>
            <p><strong>Business:</strong> {formData.businessName}</p>
            <p><strong>Industry:</strong> {businessIndustries.find(i => i.value === formData.businessIndustry)?.label}</p>
            <p><strong>Location:</strong> {countries.find(c => c.code === formData.country)?.name}</p>
          </div>
          <div>
            <p><strong>Currency:</strong> {countries.find(c => c.code === formData.country)?.symbol} ({formData.currency})</p>
            <p><strong>Invoice Prefix:</strong> {industryConfig?.invoicePrefix || 'INV'}</p>
            <p><strong>Theme:</strong> {industryConfig?.name || 'General'}</p>
          </div>
        </div>
      </div>
    </div>
  );

  const steps = [
    { number: 1, title: 'Business Setup', icon: Building },
    { number: 2, title: 'Select Modules', icon: Settings },
    { number: 3, title: 'Company Details', icon: CheckCircle },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-blue-50 p-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">BizFlow</h1>
          <p className="text-gray-600">Complete Business Management Suite</p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-4">
            {steps.map((step, index) => (
              <React.Fragment key={step.number}>
                <div className={`flex items-center space-x-3 px-6 py-3 rounded-lg ${
                  currentStep === step.number 
                    ? 'bg-orange-500 text-white shadow-lg' 
                    : currentStep > step.number 
                      ? 'bg-green-500 text-white' 
                      : 'bg-white text-gray-600 shadow'
                }`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    currentStep === step.number 
                      ? 'bg-orange-600' 
                      : currentStep > step.number 
                        ? 'bg-green-600' 
                        : 'bg-gray-200'
                  }`}>
                    {currentStep > step.number ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      step.number
                    )}
                  </div>
                  <div>
                    <div className="text-xs opacity-75">Step {step.number}</div>
                    <div className="font-semibold">{step.title}</div>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <ArrowRight className="w-5 h-5 text-gray-400" />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <Card className="w-full shadow-xl">
          <CardContent className="p-8">
            {currentStep === 1 && <Step1BusinessSetup />}
            {currentStep === 2 && <Step2SelectModules />}
            {currentStep === 3 && <Step3CompanyDetails />}

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center mt-8 pt-6 border-t">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 1}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>

              {currentStep < 3 ? (
                <Button
                  onClick={handleNext}
                  disabled={
                    (currentStep === 1 && (!formData.businessName || !formData.businessIndustry || !formData.businessAddress))
                  }
                  className="bg-orange-500 hover:bg-orange-600 flex items-center gap-2"
                >
                  Next
                  <ArrowRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleFinish}
                  className="bg-green-500 hover:bg-green-600 flex items-center gap-2"
                >
                  Complete Setup
                  <CheckCircle className="w-4 h-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
