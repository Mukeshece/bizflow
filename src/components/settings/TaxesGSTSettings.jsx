
import React, { useState } from 'react';
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { HelpCircle, Plus, Edit, Trash2, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const CheckboxSetting = ({ id, label, info, defaultChecked = false }) => (
    <div className="flex items-center space-x-2 mb-4">
        <Checkbox id={id} defaultChecked={defaultChecked} />
        <Label htmlFor={id} className="font-normal flex items-center">{label}
            {info && <HelpCircle className="w-3.5 h-3.5 ml-1.5 text-slate-400" />}
        </Label>
    </div>
);

const TaxRateItem = ({ name, rate, onEdit, onDelete }) => (
    <div className="flex items-center justify-between py-2 px-3 hover:bg-gray-50 rounded">
        <span className="text-gray-700">{name}</span>
        <div className="flex items-center gap-2">
            <span className="text-gray-600">{rate}</span>
            <button onClick={onEdit} className="text-gray-400 hover:text-blue-600">
                <Edit className="w-4 h-4" />
            </button>
            <button onClick={onDelete} className="text-gray-400 hover:text-red-600">
                <Trash2 className="w-4 h-4" />
            </button>
        </div>
    </div>
);

const TaxGroupItem = ({ name, components, onEdit, onDelete }) => (
    <div className="py-3 px-3 hover:bg-gray-50 rounded">
        <div className="flex items-center justify-between mb-2">
            <span className="font-medium text-gray-700">{name}</span>
            <div className="flex items-center gap-2">
                <button onClick={onEdit} className="text-gray-400 hover:text-blue-600">
                    <Edit className="w-4 h-4" />
                </button>
                <button onClick={onDelete} className="text-gray-400 hover:text-red-600">
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>
        </div>
        <div className="flex gap-2">
            {components.map((comp, index) => (
                <span key={index} className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
                    {comp}
                </span>
            ))}
        </div>
    </div>
);

export default function TaxesGSTSettings() {
    const [showTaxDialog, setShowTaxDialog] = useState(false);
    
    const taxRates = [
        { name: "SGST@0%", rate: "0" },
        { name: "CGST@0%", rate: "0" },
        { name: "IGST@0.25%", rate: "0.25" },
        { name: "SGST@0.125%", rate: "0.125" },
        { name: "CGST@0.125%", rate: "0.125" },
        { name: "IGST@3%", rate: "3" },
        { name: "SGST@1.5%", rate: "1.5" },
        { name: "CGST@1.5%", rate: "1.5" },
        { name: "IGST@5%", rate: "5" },
        { name: "SGST@2.5%", rate: "2.5" },
        { name: "CGST@2.5%", rate: "2.5" },
        { name: "IGST@12%", rate: "12" },
        { name: "SGST@6%", rate: "6" },
        { name: "CGST@6%", rate: "6" },
        { name: "IGST@18%", rate: "18" },
        { name: "SGST@9%", rate: "9" },
        { name: "CGST@9%", rate: "9" },
        { name: "IGST@28%", rate: "28" }
    ];

    const taxGroups = [
        { name: "GST@0%", components: ["SGST@0%", "CGST@0%"] },
        { name: "GST@0.25%", components: ["SGST@0.125%", "CGST@0.125%"] },
        { name: "GST@3%", components: ["SGST@1.5%", "CGST@1.5%"] },
        { name: "GST@5%", components: ["SGST@2.5%", "CGST@2.5%"] },
        { name: "GST@12%", components: ["SGST@6%", "CGST@6%"] },
        { name: "GST@18%", components: ["SGST@9%", "CGST@9%"] },
        { name: "GST@28%", components: ["SGST@14%", "CGST@14%"] }
    ];

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-4">GST Settings</h3>
                <div className="space-y-4">
                    <CheckboxSetting id="enable-gst" label="Enable GST" info defaultChecked />
                    <CheckboxSetting id="enable-hsn" label="Enable HSN/SAC Code" info defaultChecked />
                    <CheckboxSetting id="additional-cess" label="Additional Cess On Item" info />
                    <CheckboxSetting id="reverse-charge" label="Reverse Charge" info />
                    <CheckboxSetting id="place-of-supply" label="Enable Place of Supply" info defaultChecked />
                    <CheckboxSetting id="composition-scheme" label="Composition Scheme" info />
                    <CheckboxSetting id="enable-tcs" label="Enable TCS" info />
                    <CheckboxSetting id="enable-tds" label="Enable TDS" info />
                </div>
                <Button variant="link" className="p-0 h-auto text-blue-600 mt-2">
                    Tax List &gt;
                </Button>
            </div>

            <Dialog open={showTaxDialog} onOpenChange={setShowTaxDialog}>
                <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                    <style>{`
                        [role='dialog'] > button.absolute {
                            display: none;
                        }
                    `}</style>
                    <DialogHeader className="flex flex-row items-center justify-between">
                        <DialogTitle>Tax Configuration</DialogTitle>
                        <Button variant="ghost" size="icon" onClick={() => setShowTaxDialog(false)}>
                            <X className="w-4 h-4" />
                        </Button>
                    </DialogHeader>
                    
                    <div className="grid grid-cols-2 gap-8">
                        {/* Tax Rates */}
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold flex items-center gap-2">
                                    Tax Rates
                                    <button className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center">
                                        <Plus className="w-4 h-4" />
                                    </button>
                                </h3>
                            </div>
                            <div className="space-y-1 max-h-96 overflow-y-auto">
                                {taxRates.map((tax, index) => (
                                    <TaxRateItem
                                        key={index}
                                        name={tax.name}
                                        rate={tax.rate}
                                        onEdit={() => {}}
                                        onDelete={() => {}}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Tax Groups */}
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold flex items-center gap-2">
                                    Tax Group
                                    <button className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center">
                                        <Plus className="w-4 h-4" />
                                    </button>
                                </h3>
                            </div>
                            <div className="space-y-1 max-h-96 overflow-y-auto">
                                {taxGroups.map((group, index) => (
                                    <TaxGroupItem
                                        key={index}
                                        name={group.name}
                                        components={group.components}
                                        onEdit={() => {}}
                                        onDelete={() => {}}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            <Button onClick={() => setShowTaxDialog(true)} className="bg-blue-600 hover:bg-blue-700">
                Configure Tax Rates & Groups
            </Button>
        </div>
    );
}
