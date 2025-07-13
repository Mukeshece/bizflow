import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, HelpCircle } from 'lucide-react';

const SettingCard = ({ title, children }) => (
  <Card>
    <CardHeader>
      <CardTitle className="text-lg font-semibold">{title}</CardTitle>
    </CardHeader>
    <CardContent>{children}</CardContent>
  </Card>
);

const CheckboxSetting = ({ id, label, info, checked, onCheckedChange, children }) => (
    <div className="flex items-start space-x-3">
        <Checkbox id={id} checked={checked} onCheckedChange={onCheckedChange} className="mt-0.5" />
        <div className="flex-1 space-y-2">
            <Label htmlFor={id} className="font-normal flex items-center gap-2">
                {label}
                {info && <HelpCircle className="w-3.5 h-3.5 text-slate-400" />}
            </Label>
            {children}
        </div>
    </div>
);

export default function ItemSettings({ settings, onSettingChange }) {
  const [customCategories, setCustomCategories] = useState([
    'General', 'Electronics', 'Clothing', 'Food & Beverages', 'Books', 'Home & Garden', 'Sports', 'Automotive'
  ]);
  const [newCategory, setNewCategory] = useState('');
  const [showAddCategory, setShowAddCategory] = useState(false);

  const handleAddCategory = () => {
    if (newCategory.trim() && !customCategories.includes(newCategory.trim())) {
      setCustomCategories([...customCategories, newCategory.trim()]);
      setNewCategory('');
      setShowAddCategory(false);
    }
  };

  const handleDeleteCategory = (categoryToDelete) => {
    if (categoryToDelete !== 'General') {
      setCustomCategories(customCategories.filter(cat => cat !== categoryToDelete));
    }
  };

  return (
    <div className="space-y-6">
      <SettingCard title="Item Configuration">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="item_default_unit">Default Unit</Label>
              <Select
                id="item_default_unit"
                value={settings.item_default_unit || 'pcs'}
                onValueChange={(value) => onSettingChange('item_default_unit', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select default unit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pcs">Pcs</SelectItem>
                  <SelectItem value="box">Box</SelectItem>
                  <SelectItem value="kg">Kg</SelectItem>
                  <SelectItem value="g">g</SelectItem>
                  <SelectItem value="ltr">Ltr</SelectItem>
                  <SelectItem value="ml">ml</SelectItem>
                  <SelectItem value="mtr">Mtr</SelectItem>
                  <SelectItem value="cm">cm</SelectItem>
                  <SelectItem value="ft">ft</SelectItem>
                  <SelectItem value="dozen">Dozen</SelectItem>
                  <SelectItem value="bundle">Bundle</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <CheckboxSetting
              id="item_enable_low_stock_alerts"
              label="Enable Low Stock Alerts"
              info="Get notified when item stock falls below the minimum level."
              checked={settings.item_enable_low_stock_alerts || false}
              onCheckedChange={(c) => onSettingChange('item_enable_low_stock_alerts', c)}
            >
              {settings.item_enable_low_stock_alerts && (
                <div className="space-y-2 mt-2">
                  <Label htmlFor="item_default_min_stock">Default Minimum Stock Level</Label>
                  <Input
                    id="item_default_min_stock"
                    type="number"
                    value={settings.item_default_min_stock || 10}
                    onChange={(e) => onSettingChange('item_default_min_stock', parseInt(e.target.value) || 10)}
                    placeholder="10"
                  />
                </div>
              )}
            </CheckboxSetting>

            <CheckboxSetting
              id="item_auto_generate_barcode"
              label="Auto Generate Barcode"
              info="Automatically generate barcodes for new items."
              checked={settings.item_auto_generate_barcode || false}
              onCheckedChange={(c) => onSettingChange('item_auto_generate_barcode', c)}
            />
          </div>

          <div className="space-y-4">
            <CheckboxSetting
              id="item_enable_batch_tracking"
              label="Enable Batch/Serial Tracking"
              info="Track items by batch numbers or serial numbers."
              checked={settings.item_enable_batch_tracking || false}
              onCheckedChange={(c) => onSettingChange('item_enable_batch_tracking', c)}
            />

            <CheckboxSetting
              id="item_enable_expiry_tracking"
              label="Enable Expiry Date Tracking"
              info="Track expiry dates for perishable items."
              checked={settings.item_enable_expiry_tracking || false}
              onCheckedChange={(c) => onSettingChange('item_enable_expiry_tracking', c)}
            />

            <CheckboxSetting
              id="item_enable_multi_variant"
              label="Enable Multi-Variant Items"
              info="Allow items to have multiple variants (size, color, etc.)."
              checked={settings.item_enable_multi_variant || false}
              onCheckedChange={(c) => onSettingChange('item_enable_multi_variant', c)}
            />
          </div>
        </div>
      </SettingCard>

      <SettingCard title="Invoice Customization">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <CheckboxSetting
              id="item_enable_itemwise_tax"
              label="Enable Item-wise Tax"
              info="Apply different tax rates to individual items on an invoice."
              checked={settings.item_enable_itemwise_tax !== false}
              onCheckedChange={(c) => onSettingChange('item_enable_itemwise_tax', c)}
            />

            <CheckboxSetting
              id="item_enable_itemwise_discount"
              label="Enable Item-wise Discount"
              info="Apply discounts to individual items on an invoice."
              checked={settings.item_enable_itemwise_discount !== false}
              onCheckedChange={(c) => onSettingChange('item_enable_itemwise_discount', c)}
            />

            <CheckboxSetting
              id="item_show_description_on_invoice"
              label="Show Item Description on Invoice"
              info="Include item descriptions in the printed invoice."
              checked={settings.item_show_description_on_invoice || false}
              onCheckedChange={(c) => onSettingChange('item_show_description_on_invoice', c)}
            />
          </div>

          <div className="space-y-4">
            <CheckboxSetting
              id="item_show_hsn_on_invoice"
              label="Show HSN Code on Invoice"
              info="Display HSN codes on printed invoices."
              checked={settings.item_show_hsn_on_invoice !== false}
              onCheckedChange={(c) => onSettingChange('item_show_hsn_on_invoice', c)}
            />

            <CheckboxSetting
              id="item_show_barcode_on_invoice"
              label="Show Barcode on Invoice"
              info="Display item barcodes on printed invoices."
              checked={settings.item_show_barcode_on_invoice || false}
              onCheckedChange={(c) => onSettingChange('item_show_barcode_on_invoice', c)}
            />

            <CheckboxSetting
              id="item_show_brand_on_invoice"
              label="Show Brand on Invoice"
              info="Display item brands on printed invoices."
              checked={settings.item_show_brand_on_invoice || false}
              onCheckedChange={(c) => onSettingChange('item_show_brand_on_invoice', c)}
            />
          </div>
        </div>
      </SettingCard>

      <SettingCard title="Item Categories">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Available Categories</Label>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowAddCategory(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Category
            </Button>
          </div>

          {showAddCategory && (
            <div className="flex gap-2 p-3 bg-gray-50 rounded-lg">
              <Input
                placeholder="Category name"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
              />
              <Button onClick={handleAddCategory} size="sm">Add</Button>
              <Button variant="outline" onClick={() => setShowAddCategory(false)} size="sm">Cancel</Button>
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {customCategories.map((category) => (
              <div key={category} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <span className="text-sm">{category}</span>
                {category !== 'General' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteCategory(category)}
                    className="text-red-500 hover:text-red-700 p-1"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      </SettingCard>

      <SettingCard title="Pricing & Margin">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="item_default_profit_margin">Default Profit Margin (%)</Label>
              <Input
                id="item_default_profit_margin"
                type="number"
                value={settings.item_default_profit_margin || 20}
                onChange={(e) => onSettingChange('item_default_profit_margin', parseFloat(e.target.value) || 20)}
                placeholder="20"
              />
            </div>

            <CheckboxSetting
              id="item_enable_mrp"
              label="Enable MRP (Maximum Retail Price)"
              info="Set maximum retail price for items."
              checked={settings.item_enable_mrp || false}
              onCheckedChange={(c) => onSettingChange('item_enable_mrp', c)}
            />

            <CheckboxSetting
              id="item_enable_wholesale_price"
              label="Enable Wholesale Price"
              info="Set separate wholesale pricing for items."
              checked={settings.item_enable_wholesale_price || false}
              onCheckedChange={(c) => onSettingChange('item_enable_wholesale_price', c)}
            />
          </div>

          <div className="space-y-4">
            <CheckboxSetting
              id="item_auto_calculate_selling_price"
              label="Auto Calculate Selling Price"
              info="Automatically calculate selling price based on cost + margin."
              checked={settings.item_auto_calculate_selling_price || false}
              onCheckedChange={(c) => onSettingChange('item_auto_calculate_selling_price', c)}
            />

            <CheckboxSetting
              id="item_enable_price_alerts"
              label="Enable Price Change Alerts"
              info="Get notified when item prices change significantly."
              checked={settings.item_enable_price_alerts || false}
              onCheckedChange={(c) => onSettingChange('item_enable_price_alerts', c)}
            />

            <CheckboxSetting
              id="item_enable_cost_tracking"
              label="Enable Cost Tracking"
              info="Track average cost and cost variations for items."
              checked={settings.item_enable_cost_tracking || false}
              onCheckedChange={(c) => onSettingChange('item_enable_cost_tracking', c)}
            />
          </div>
        </div>
      </SettingCard>

      <SettingCard title="Stock Management">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <CheckboxSetting
              id="item_enable_negative_stock"
              label="Allow Negative Stock"
              info="Allow selling items even when stock is negative."
              checked={settings.item_enable_negative_stock || false}
              onCheckedChange={(c) => onSettingChange('item_enable_negative_stock', c)}
            />

            <CheckboxSetting
              id="item_enable_stock_adjustment"
              label="Enable Stock Adjustments"
              info="Allow manual stock adjustments for inventory corrections."
              checked={settings.item_enable_stock_adjustment || false}
              onCheckedChange={(c) => onSettingChange('item_enable_stock_adjustment', c)}
            />

            <CheckboxSetting
              id="item_enable_stock_transfer"
              label="Enable Stock Transfer"
              info="Allow transferring stock between locations/warehouses."
              checked={settings.item_enable_stock_transfer || false}
              onCheckedChange={(c) => onSettingChange('item_enable_stock_transfer', c)}
            />
          </div>

          <div className="space-y-4">
            <CheckboxSetting
              id="item_enable_reorder_alerts"
              label="Enable Reorder Alerts"
              info="Get alerts when items need to be reordered."
              checked={settings.item_enable_reorder_alerts || false}
              onCheckedChange={(c) => onSettingChange('item_enable_reorder_alerts', c)}
            />

            <CheckboxSetting
              id="item_enable_dead_stock_alerts"
              label="Enable Dead Stock Alerts"
              info="Get notified about items with no recent movement."
              checked={settings.item_enable_dead_stock_alerts || false}
              onCheckedChange={(c) => onSettingChange('item_enable_dead_stock_alerts', c)}
            />

            <CheckboxSetting
              id="item_enable_stock_valuation"
              label="Enable Stock Valuation"
              info="Track stock value using FIFO, LIFO, or weighted average."
              checked={settings.item_enable_stock_valuation || false}
              onCheckedChange={(c) => onSettingChange('item_enable_stock_valuation', c)}
            >
              {settings.item_enable_stock_valuation && (
                <div className="space-y-2 mt-2">
                  <Label htmlFor="item_stock_valuation_method">Valuation Method</Label>
                  <Select
                    value={settings.item_stock_valuation_method || 'fifo'}
                    onValueChange={(value) => onSettingChange('item_stock_valuation_method', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fifo">FIFO (First In, First Out)</SelectItem>
                      <SelectItem value="lifo">LIFO (Last In, First Out)</SelectItem>
                      <SelectItem value="weighted_average">Weighted Average</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CheckboxSetting>
          </div>
        </div>
      </SettingCard>
    </div>
  );
}