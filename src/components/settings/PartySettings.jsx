import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, HelpCircle } from 'lucide-react';

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

export default function PartySettings({ settings, onSettingChange }) {
  const [customGroups, setCustomGroups] = useState([
    'General', 'Retailer', 'Wholesaler', 'Distributor', 'Vendor', 'Supplier'
  ]);
  const [newGroup, setNewGroup] = useState('');
  const [showAddGroup, setShowAddGroup] = useState(false);

  const handleAddGroup = () => {
    if (newGroup.trim() && !customGroups.includes(newGroup.trim())) {
      setCustomGroups([...customGroups, newGroup.trim()]);
      setNewGroup('');
      setShowAddGroup(false);
    }
  };

  const handleDeleteGroup = (groupToDelete) => {
    if (groupToDelete !== 'General') { // Don't allow deleting default group
      setCustomGroups(customGroups.filter(group => group !== groupToDelete));
    }
  };

  return (
    <div className="space-y-6">
      <SettingCard title="Party Configuration">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <CheckboxSetting
              id="party_enable_credit_limit"
              label="Enable Credit Limit"
              info="Set credit limits for your parties."
              checked={settings.party_enable_credit_limit || false}
              onCheckedChange={(c) => onSettingChange('party_enable_credit_limit', c)}
            >
              {settings.party_enable_credit_limit && (
                <div className="space-y-2 mt-2">
                  <Label htmlFor="party_default_credit_limit">Default Credit Limit (₹)</Label>
                  <Input
                    id="party_default_credit_limit"
                    type="number"
                    value={settings.party_default_credit_limit || 0}
                    onChange={(e) => onSettingChange('party_default_credit_limit', parseFloat(e.target.value) || 0)}
                    placeholder="e.g., 50000"
                  />
                </div>
              )}
            </CheckboxSetting>

            <CheckboxSetting
              id="party_show_balance_on_invoice"
              label="Show Party Balance on Invoice"
              info="Display the party's outstanding balance on new invoices."
              checked={settings.party_show_balance_on_invoice || false}
              onCheckedChange={(c) => onSettingChange('party_show_balance_on_invoice', c)}
            />

            <CheckboxSetting
              id="party_enable_party_groups"
              label="Enable Party Groups"
              info="Categorize your parties into groups like Retailer, Wholesaler etc."
              checked={settings.party_enable_party_groups || false}
              onCheckedChange={(c) => onSettingChange('party_enable_party_groups', c)}
            />
          </div>

          <div className="space-y-4">
            <CheckboxSetting
              id="party_enable_gst_validation"
              label="Enable GST Number Validation"
              info="Validate GST numbers when adding parties."
              checked={settings.party_enable_gst_validation || false}
              onCheckedChange={(c) => onSettingChange('party_enable_gst_validation', c)}
            />

            <CheckboxSetting
              id="party_enable_pan_validation"
              label="Enable PAN Number Validation"
              info="Validate PAN numbers when adding parties."
              checked={settings.party_enable_pan_validation || false}
              onCheckedChange={(c) => onSettingChange('party_enable_pan_validation', c)}
            />

            <CheckboxSetting
              id="party_enable_email_validation"
              label="Require Email for Parties"
              info="Make email mandatory when adding parties."
              checked={settings.party_require_email || false}
              onCheckedChange={(c) => onSettingChange('party_require_email', c)}
            />
          </div>
        </div>
      </SettingCard>

      {settings.party_enable_party_groups && (
        <SettingCard title="Party Groups Management">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Available Party Groups</Label>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowAddGroup(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Group
              </Button>
            </div>

            {showAddGroup && (
              <div className="flex gap-2 p-3 bg-gray-50 rounded-lg">
                <Input
                  placeholder="Group name"
                  value={newGroup}
                  onChange={(e) => setNewGroup(e.target.value)}
                />
                <Button onClick={handleAddGroup} size="sm">Add</Button>
                <Button variant="outline" onClick={() => setShowAddGroup(false)} size="sm">Cancel</Button>
              </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {customGroups.map((group) => (
                <div key={group} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm">{group}</span>
                  {group !== 'General' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteGroup(group)}
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
      )}

      <SettingCard title="Default Party Settings">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="party_default_payment_terms">Default Payment Terms (Days)</Label>
              <Input
                id="party_default_payment_terms"
                type="number"
                value={settings.party_default_payment_terms || 30}
                onChange={(e) => onSettingChange('party_default_payment_terms', parseInt(e.target.value) || 30)}
                placeholder="30"
              />
            </div>

            <div>
              <Label htmlFor="party_default_currency">Default Currency</Label>
              <Select 
                value={settings.party_default_currency || 'INR'} 
                onValueChange={(value) => onSettingChange('party_default_currency', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INR">INR (₹)</SelectItem>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="EUR">EUR (€)</SelectItem>
                  <SelectItem value="GBP">GBP (£)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            <CheckboxSetting
              id="party_auto_generate_code"
              label="Auto Generate Party Code"
              info="Automatically generate unique codes for new parties."
              checked={settings.party_auto_generate_code || false}
              onCheckedChange={(c) => onSettingChange('party_auto_generate_code', c)}
            />

            <CheckboxSetting
              id="party_enable_shipping_address"
              label="Enable Shipping Address by Default"
              info="Show shipping address fields when adding parties."
              checked={settings.party_enable_shipping_address_default || false}
              onCheckedChange={(c) => onSettingChange('party_enable_shipping_address_default', c)}
            />
          </div>
        </div>
      </SettingCard>

      <SettingCard title="Party Notifications">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <CheckboxSetting
              id="party_birthday_reminders"
              label="Birthday Reminders"
              info="Get notified on party birthdays."
              checked={settings.party_birthday_reminders || false}
              onCheckedChange={(c) => onSettingChange('party_birthday_reminders', c)}
            />

            <CheckboxSetting
              id="party_credit_limit_alerts"
              label="Credit Limit Alerts"
              info="Get alerted when parties exceed credit limits."
              checked={settings.party_credit_limit_alerts || false}
              onCheckedChange={(c) => onSettingChange('party_credit_limit_alerts', c)}
            />
          </div>

          <div className="space-y-4">
            <CheckboxSetting
              id="party_payment_due_reminders"
              label="Payment Due Reminders"
              info="Send reminders for overdue payments."
              checked={settings.party_payment_due_reminders || false}
              onCheckedChange={(c) => onSettingChange('party_payment_due_reminders', c)}
            />

            <CheckboxSetting
              id="party_inactive_alerts"
              label="Inactive Party Alerts"
              info="Get notified about parties with no recent transactions."
              checked={settings.party_inactive_alerts || false}
              onCheckedChange={(c) => onSettingChange('party_inactive_alerts', c)}
            />
          </div>
        </div>
      </SettingCard>
    </div>
  );
}