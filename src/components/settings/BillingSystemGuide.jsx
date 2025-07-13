import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Settings, FileText, Users, Package, DollarSign } from 'lucide-react';

export default function BillingSystemGuide() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            How BizFlow Billing System Works
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Flow Diagram */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Settings className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-semibold">1. Settings</h3>
              <p className="text-sm text-gray-600">Configure your business preferences</p>
            </div>
            <ArrowRight className="hidden md:block mx-auto mt-8 text-gray-400" />
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Package className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="font-semibold">2. Products</h3>
              <p className="text-sm text-gray-600">Add items with rates & stock</p>
            </div>
            <ArrowRight className="hidden md:block mx-auto mt-8 text-gray-400" />
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Users className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="font-semibold">3. Parties</h3>
              <p className="text-sm text-gray-600">Add customers & vendors</p>
            </div>
            <ArrowRight className="hidden md:block mx-auto mt-8 text-gray-400" />
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <DollarSign className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="font-semibold">4. Billing</h3>
              <p className="text-sm text-gray-600">Create invoices & collect payments</p>
            </div>
          </div>

          {/* Settings Impact */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-3">How Settings Affect Your Billing:</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Badge variant="outline">Invoice Prefix</Badge>
                <span>Controls how your invoice numbers look (e.g., INV-001, 2024-001)</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">GST Settings</Badge>
                <span>Adds tax calculations to your invoices automatically</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">Round Off</Badge>
                <span>Rounds final amounts to nearest ₹1, ₹10, etc.</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">Print Theme</Badge>
                <span>Changes how your invoices look when printed</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}