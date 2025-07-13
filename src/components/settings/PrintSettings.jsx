import React, { useState } from 'react';
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HelpCircle, ArrowLeft, ArrowRight } from 'lucide-react';
import { RegularThemePreview, ThermalThemePreview, InvoicePreview } from './InvoiceThemes';

const CheckboxSetting = ({ id, label, checked, onCheckedChange, info }) => (
    <div className="flex items-center space-x-2 mb-3">
        <Checkbox id={id} checked={checked} onCheckedChange={onCheckedChange} />
        <Label htmlFor={id} className="font-normal flex items-center gap-1.5">
            {label}
            {info && <HelpCircle className="w-3.5 h-3.5 text-slate-400" />}
        </Label>
    </div>
);

const CheckboxWithInput = ({ settingKey, label, info, settings, onSettingChange, inputType = "text", placeholder, children }) => {
    const isChecked = settings[settingKey] !== false;

    return (
        <div className="flex items-start space-x-3 mb-4">
            <Checkbox 
                id={settingKey} 
                checked={isChecked} 
                onCheckedChange={(checked) => onSettingChange(settingKey, checked)} 
                className="mt-1" 
            />
            <div className="flex-1">
                <Label htmlFor={settingKey} className="font-normal flex items-center gap-1.5">
                    {label}
                    {info && <HelpCircle className="w-3.5 h-3.5 text-slate-400" />}
                </Label>
                {isChecked && children && (
                    <div className="mt-2">
                        {children}
                    </div>
                )}
            </div>
        </div>
    );
};

export default function PrintSettings({ settings, onSettingChange, activeCompany }) {
    const [activeTab, setActiveTab] = useState('regular');
    const [activeSubTab, setActiveSubTab] = useState('layout');
    
    const company = activeCompany || {};
    
    const regularThemes = [
        'theme1', 'theme2', 'theme3', 'theme4', 'theme5', 
        'theme6', 'theme7', 'theme8', 'theme9', 'theme10'
    ];
    
    const thermalThemes = [
        'theme1', 'theme2', 'theme3', 'theme4', 'theme5'
    ];

    const RegularLayoutTab = () => (
        <div className="space-y-6">
            {/* Theme Selection */}
            <div>
                <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-semibold text-gray-700">Select Theme</h4>
                    <div className="flex gap-2">
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                            <ArrowRight className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
                <div className="flex gap-3 overflow-x-auto pb-2">
                    {regularThemes.map(themeId => (
                        <RegularThemePreview
                            key={themeId}
                            themeId={themeId}
                            isSelected={settings.print_regular_theme === themeId}
                            onClick={() => onSettingChange('print_regular_theme', themeId)}
                        />
                    ))}
                </div>
            </div>

            {/* Print Company Info / Header */}
            <div className="border-t pt-6">
                <h4 className="text-sm font-semibold text-gray-700 mb-4">Print Company Info / Header</h4>
                <div className="space-y-4">
                    <CheckboxSetting
                        id="make-regular-default"
                        label="Make Regular Printer Default"
                        checked={settings.print_default_printer === 'regular'}
                        onCheckedChange={(c) => onSettingChange('print_default_printer', c ? 'regular' : 'thermal')}
                        info
                    />
                    
                    <CheckboxSetting
                        id="print-repeat-header"
                        label="Print repeat header in all pages"
                        checked={settings.print_repeat_header || false}
                        onCheckedChange={(c) => onSettingChange('print_repeat_header', c)}
                        info
                    />
                    
                    <CheckboxWithInput
                        settingKey="print_show_company_name"
                        label="Company Name"
                        info
                        settings={settings}
                        onSettingChange={onSettingChange}
                    >
                        <Input
                            value={company.name || ''}
                            readOnly
                            className="bg-gray-50"
                        />
                    </CheckboxWithInput>

                    <CheckboxWithInput
                        settingKey="print_show_company_logo"
                        label="Company Logo"
                        info
                        settings={settings}
                        onSettingChange={onSettingChange}
                    >
                        <Button variant="link" className="p-0 h-auto text-blue-600">
                            (Change)
                        </Button>
                    </CheckboxWithInput>

                    <CheckboxWithInput
                        settingKey="print_show_address"
                        label="Address"
                        info
                        settings={settings}
                        onSettingChange={onSettingChange}
                    >
                        <Input
                            value={company.address || ''}
                            readOnly
                            className="bg-gray-50"
                        />
                    </CheckboxWithInput>

                    <CheckboxWithInput
                        settingKey="print_show_email"
                        label="Email"
                        info
                        settings={settings}
                        onSettingChange={onSettingChange}
                    >
                        <Input
                            value={company.email || ''}
                            readOnly
                            className="bg-gray-50"
                        />
                    </CheckboxWithInput>

                    <CheckboxWithInput
                        settingKey="print_show_phone"
                        label="Phone Number"
                        info
                        settings={settings}
                        onSettingChange={onSettingChange}
                    >
                        <Input
                            value={company.phone || ''}
                            readOnly
                            className="bg-gray-50"
                        />
                    </CheckboxWithInput>

                    <CheckboxWithInput
                        settingKey="print_show_gstin"
                        label="GSTIN on Sale"
                        info
                        settings={settings}
                        onSettingChange={onSettingChange}
                    >
                        <Input
                            value={company.gst_number || ''}
                            readOnly
                            className="bg-gray-50"
                        />
                    </CheckboxWithInput>
                </div>
            </div>

            {/* Paper Settings */}
            <div className="border-t pt-6">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label className="flex items-center gap-1.5 mb-2">
                            Paper Size 
                            <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                        </Label>
                        <Select 
                            value={settings.print_regular_paper_size || 'a4'} 
                            onValueChange={v => onSettingChange('print_regular_paper_size', v)}
                        >
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="a4">A4</SelectItem>
                                <SelectItem value="a5">A5</SelectItem>
                                <SelectItem value="letter">Letter</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    
                    <div>
                        <Label className="flex items-center gap-1.5 mb-2">
                            Orientation 
                            <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                        </Label>
                        <Select 
                            value={settings.print_regular_orientation || 'portrait'} 
                            onValueChange={v => onSettingChange('print_regular_orientation', v)}
                        >
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="portrait">Portrait</SelectItem>
                                <SelectItem value="landscape">Landscape</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    
                    <div>
                        <Label className="flex items-center gap-1.5 mb-2">
                            Company Name Text Size 
                            <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                        </Label>
                        <Select 
                            value={settings.print_regular_company_name_size || 'large'} 
                            onValueChange={v => onSettingChange('print_regular_company_name_size', v)}
                        >
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="small">Small</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="large">Large</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    
                    <div>
                        <Label className="flex items-center gap-1.5 mb-2">
                            Invoice Text Size 
                            <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                        </Label>
                        <Select 
                            value={settings.print_regular_invoice_text_size || 'small'} 
                            onValueChange={v => onSettingChange('print_regular_invoice_text_size', v)}
                        >
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="small">Small</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="large">Large</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            {/* Additional Options */}
            <div className="border-t pt-6 space-y-4">
                <CheckboxSetting
                    id="print-original-duplicate"
                    label="Print Original/Duplicate"
                    checked={settings.print_regular_print_original_duplicate || false}
                    onCheckedChange={(c) => onSettingChange('print_regular_print_original_duplicate', c)}
                    info
                />
                
                <div className="flex items-center gap-2">
                    <Label className="flex items-center gap-1.5">
                        Extra space on Top of PDF 
                        <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                    </Label>
                    <Input 
                        type="number" 
                        className="w-20" 
                        value={settings.print_regular_extra_space_top || 0} 
                        onChange={e => onSettingChange('print_regular_extra_space_top', Number(e.target.value))} 
                    />
                </div>
                
                <Button variant="link" className="p-0 h-auto text-blue-600">
                    Change Transaction Names &gt;
                </Button>
            </div>

            {/* Item Table */}
            <div className="border-t pt-6 space-y-4">
                <h4 className="text-sm font-semibold text-gray-700">Item Table</h4>
                
                <div className="flex items-center gap-2">
                    <Label className="flex items-center gap-1.5">
                        Min No. of Rows in Item Table 
                        <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                    </Label>
                    <Input 
                        type="number" 
                        className="w-20" 
                        value={settings.print_regular_min_rows || 0} 
                        onChange={e => onSettingChange('print_regular_min_rows', Number(e.target.value))} 
                    />
                </div>
                
                <Button variant="link" className="p-0 h-auto text-blue-600">
                    Item Table Customization &gt;
                </Button>
            </div>

            {/* Totals & Taxes */}
            <div className="border-t pt-6 space-y-4">
                <h4 className="text-sm font-semibold text-gray-700">Totals & Taxes</h4>
                
                <div className="grid grid-cols-2 gap-4">
                    <CheckboxSetting
                        id="show-total-quantity"
                        label="Total Item Quantity"
                        checked={settings.print_show_total_quantity !== false}
                        onCheckedChange={(c) => onSettingChange('print_show_total_quantity', c)}
                        info
                    />
                    
                    <CheckboxSetting
                        id="show-amount-decimal"
                        label="Amount with Decimal e.g. 0.00"
                        checked={settings.print_show_amount_decimal !== false}
                        onCheckedChange={(c) => onSettingChange('print_show_amount_decimal', c)}
                        info
                    />
                    
                    <CheckboxSetting
                        id="show-received-amount"
                        label="Received Amount"
                        checked={settings.print_show_received_amount !== false}
                        onCheckedChange={(c) => onSettingChange('print_show_received_amount', c)}
                        info
                    />
                    
                    <CheckboxSetting
                        id="show-balance-amount"
                        label="Balance Amount"
                        checked={settings.print_show_balance_amount !== false}
                        onCheckedChange={(c) => onSettingChange('print_show_balance_amount', c)}
                        info
                    />
                    
                    <CheckboxSetting
                        id="show-party-balance"
                        label="Current Balance of Party"
                        checked={settings.print_show_party_balance !== false}
                        onCheckedChange={(c) => onSettingChange('print_show_party_balance', c)}
                        info
                    />
                    
                    <CheckboxSetting
                        id="show-tax-details"
                        label="Tax Details"
                        checked={settings.print_show_tax_details || false}
                        onCheckedChange={(c) => onSettingChange('print_show_tax_details', c)}
                        info
                    />
                    
                    <CheckboxSetting
                        id="show-you-saved"
                        label="You Saved"
                        checked={settings.print_show_you_saved || false}
                        onCheckedChange={(c) => onSettingChange('print_show_you_saved', c)}
                        info
                    />
                    
                    <CheckboxSetting
                        id="print-amount-grouping"
                        label="Print Amount with Grouping"
                        checked={settings.print_amount_with_grouping !== false}
                        onCheckedChange={(c) => onSettingChange('print_amount_with_grouping', c)}
                        info
                    />
                </div>
                
                <div className="flex items-center gap-4">
                    <Label className="flex items-center gap-1.5">
                        Amount in Words 
                        <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                    </Label>
                    <Select 
                        value={settings.print_amount_in_words_format || 'indian'} 
                        onValueChange={v => onSettingChange('print_amount_in_words_format', v)}
                    >
                        <SelectTrigger className="w-40">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="indian">Indian</SelectItem>
                            <SelectItem value="international">International</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Footer */}
            <div className="border-t pt-6 space-y-4">
                <h4 className="text-sm font-semibold text-gray-700">Footer</h4>
                
                <CheckboxSetting
                    id="print-description"
                    label="Print Description"
                    checked={settings.print_footer_show_description || false}
                    onCheckedChange={(c) => onSettingChange('print_footer_show_description', c)}
                    info
                />
                
                <Button variant="link" className="p-0 h-auto text-blue-600">
                    Terms and Conditions &gt;
                </Button>
                
                <CheckboxSetting
                    id="print-received-by"
                    label="Print Received by details"
                    checked={settings.print_footer_show_received_by || false}
                    onCheckedChange={(c) => onSettingChange('print_footer_show_received_by', c)}
                    info
                />
                
                <CheckboxSetting
                    id="print-delivered-by"
                    label="Print Delivered by details"
                    checked={settings.print_footer_show_delivered_by || false}
                    onCheckedChange={(c) => onSettingChange('print_footer_show_delivered_by', c)}
                    info
                />
                
                <CheckboxWithInput
                    settingKey="print_footer_show_signature"
                    label="Print Signature Text"
                    info
                    settings={settings}
                    onSettingChange={onSettingChange}
                >
                    <div className="flex items-center gap-2">
                        <Input
                            value={settings.print_footer_signature_text || 'Authorized Signatory'}
                            onChange={e => onSettingChange('print_footer_signature_text', e.target.value)}
                        />
                        <Button variant="link" className="p-0 h-auto text-blue-600 whitespace-nowrap">
                            Change Signature
                        </Button>
                    </div>
                </CheckboxWithInput>

                <CheckboxSetting
                    id="show-payment-mode"
                    label="Payment Mode"
                    checked={settings.print_footer_show_payment_mode !== false}
                    onCheckedChange={(c) => onSettingChange('print_footer_show_payment_mode', c)}
                    info
                />
                
                <CheckboxSetting
                    id="show-acknowledgement"
                    label="Print Acknowledgement"
                    checked={settings.print_footer_show_acknowledgement || false}
                    onCheckedChange={(c) => onSettingChange('print_footer_show_acknowledgement', c)}
                    info
                />
            </div>
        </div>
    );

    const RegularColorsTab = () => (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Theme Colors</CardTitle>
                </CardHeader>
                <CardContent>
                    <Label className="mb-2 block">Primary Color</Label>
                    <div className="relative">
                        <Input
                            type="text"
                            value={settings.print_regular_color || '#0000FF'}
                            onChange={(e) => onSettingChange('print_regular_color', e.target.value)}
                            className="pl-10"
                        />
                        <Input
                            type="color"
                            value={settings.print_regular_color || '#0000FF'}
                            onChange={(e) => onSettingChange('print_regular_color', e.target.value)}
                            className="absolute left-1 top-1/2 -translate-y-1/2 w-8 h-8 p-0 border-none bg-transparent cursor-pointer"
                        />
                    </div>
                </CardContent>
            </Card>
            
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Font Size</CardTitle>
                </CardHeader>
                <CardContent>
                    <Select 
                        value={settings.print_regular_font_size || 'medium'} 
                        onValueChange={v => onSettingChange('print_regular_font_size', v)}
                    >
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="small">Small</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="large">Large</SelectItem>
                        </SelectContent>
                    </Select>
                </CardContent>
            </Card>
        </div>
    );

    const ThermalLayoutTab = () => (
        <div className="space-y-6">
            {/* Theme Selection */}
            <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Select Theme</h4>
                <div className="flex gap-3 overflow-x-auto pb-2">
                    {thermalThemes.map(themeId => (
                        <ThermalThemePreview
                            key={themeId}
                            themeId={themeId}
                            isSelected={settings.print_thermal_theme === themeId}
                            onClick={() => onSettingChange('print_thermal_theme', themeId)}
                        />
                    ))}
                </div>
            </div>

            {/* Header Settings */}
            <div className="border-t pt-6 space-y-4">
                <h4 className="text-sm font-semibold text-gray-700">Header Settings</h4>
                
                <CheckboxSetting
                    id="make-thermal-default"
                    label="Make Thermal Printer Default"
                    checked={settings.print_default_printer === 'thermal'}
                    onCheckedChange={(c) => onSettingChange('print_default_printer', c ? 'thermal' : 'regular')}
                />
                
                <CheckboxSetting
                    id="thermal-show-header"
                    label="Print Header"
                    checked={settings.print_thermal_show_header !== false}
                    onCheckedChange={(c) => onSettingChange('print_thermal_show_header', c)}
                />
            </div>

            {/* Paper Size */}
            <div className="border-t pt-6">
                <Label className="mb-2 block">Paper Size</Label>
                <Select 
                    value={settings.print_thermal_paper_size || '80mm'} 
                    onValueChange={v => onSettingChange('print_thermal_paper_size', v)}
                >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="58mm">58mm</SelectItem>
                        <SelectItem value="80mm">80mm</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Other Settings */}
            <div className="border-t pt-6 space-y-4">
                <h4 className="text-sm font-semibold text-gray-700">Other Settings</h4>
                
                <CheckboxSetting
                    id="thermal-auto-cut"
                    label="Auto Cut Paper"
                    checked={settings.print_thermal_auto_cut || false}
                    onCheckedChange={(c) => onSettingChange('print_thermal_auto_cut', c)}
                />
                
                <CheckboxSetting
                    id="thermal-cash-drawer"
                    label="Open Cash Drawer after print"
                    checked={settings.print_thermal_cash_drawer || false}
                    onCheckedChange={(c) => onSettingChange('print_thermal_cash_drawer', c)}
                />
            </div>
        </div>
    );

    return (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-3">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="regular" className="text-blue-600">REGULAR PRINTER</TabsTrigger>
                        <TabsTrigger value="thermal">THERMAL PRINTER</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="regular" className="mt-6">
                        <Tabs value={activeSubTab} onValueChange={setActiveSubTab} className="w-full">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="layout" className="text-blue-600">CHANGE LAYOUT</TabsTrigger>
                                <TabsTrigger value="colors">CHANGE COLORS</TabsTrigger>
                            </TabsList>
                            <TabsContent value="layout" className="mt-6">
                                <RegularLayoutTab />
                            </TabsContent>
                            <TabsContent value="colors" className="mt-6">
                                <RegularColorsTab />
                            </TabsContent>
                        </Tabs>
                    </TabsContent>
                    
                    <TabsContent value="thermal" className="mt-6">
                        <Tabs value="layout" className="w-full">
                            <TabsList className="grid w-full grid-cols-1">
                                <TabsTrigger value="layout" className="text-blue-600">CHANGE LAYOUT</TabsTrigger>
                            </TabsList>
                            <TabsContent value="layout" className="mt-6">
                                <ThermalLayoutTab />
                            </TabsContent>
                        </Tabs>
                    </TabsContent>
                </Tabs>
            </div>
            
            {/* Invoice Preview */}
            <div className="lg:col-span-2">
                <Card className="sticky top-6">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <span>Invoice Preview</span>
                            <span className="text-sm font-normal text-gray-500">
                                ({activeTab === 'regular' ? 'Regular' : 'Thermal'})
                            </span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <InvoicePreview 
                            theme={activeTab === 'regular' ? settings.print_regular_theme || 'theme1' : settings.print_thermal_theme || 'theme1'}
                            type={activeTab}
                        />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}