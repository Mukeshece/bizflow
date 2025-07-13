import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Bell, Plus, Edit, Trash2, Calendar, MessageSquare, Mail } from 'lucide-react';

const CheckboxSetting = ({ id, label, info, checked, onCheckedChange, children }) => (
    <div className="flex items-start space-x-3">
        <Checkbox id={id} checked={checked} onCheckedChange={onCheckedChange} className="mt-0.5" />
        <div className="flex-1 space-y-2">
            <Label htmlFor={id} className="font-normal flex items-center gap-2">
                {label}
                {info && <span className="text-xs text-gray-500">{info}</span>}
            </Label>
            {children}
        </div>
    </div>
);

export default function ServiceRemindersSettings({ settings, onSettingChange }) {
  const [serviceTemplates, setServiceTemplates] = useState([
    { id: 1, name: 'Vehicle Service', interval: 90, intervalType: 'days', enabled: true },
    { id: 2, name: 'Equipment Maintenance', interval: 6, intervalType: 'months', enabled: true },
    { id: 3, name: 'Software License Renewal', interval: 1, intervalType: 'years', enabled: false },
    { id: 4, name: 'Insurance Renewal', interval: 1, intervalType: 'years', enabled: true },
    { id: 5, name: 'Contract Renewal', interval: 1, intervalType: 'years', enabled: true }
  ]);

  const [newTemplate, setNewTemplate] = useState({
    name: '',
    interval: 30,
    intervalType: 'days',
    enabled: true
  });

  const [showAddTemplate, setShowAddTemplate] = useState(false);

  const handleAddTemplate = () => {
    if (newTemplate.name.trim()) {
      setServiceTemplates([...serviceTemplates, {
        id: Date.now(),
        ...newTemplate
      }]);
      setNewTemplate({ name: '', interval: 30, intervalType: 'days', enabled: true });
      setShowAddTemplate(false);
    }
  };

  const handleDeleteTemplate = (id) => {
    setServiceTemplates(serviceTemplates.filter(template => template.id !== id));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Service Reminders Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <CheckboxSetting
                id="enable_service_reminders"
                label="Enable Service Reminders"
                info="Turn on automatic service reminders for customers."
                checked={settings.enable_service_reminders || false}
                onCheckedChange={(c) => onSettingChange('enable_service_reminders', c)}
              />

              <CheckboxSetting
                id="enable_email_reminders"
                label="Send Email Reminders"
                info="Send reminder emails to customers."
                checked={settings.enable_email_reminders || false}
                onCheckedChange={(c) => onSettingChange('enable_email_reminders', c)}
              />

              <CheckboxSetting
                id="enable_sms_reminders"
                label="Send SMS Reminders"
                info="Send reminder SMS to customers."
                checked={settings.enable_sms_reminders || false}
                onCheckedChange={(c) => onSettingChange('enable_sms_reminders', c)}
              />
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="reminder_advance_days">Reminder Advance Days</Label>
                <Input
                  id="reminder_advance_days"
                  type="number"
                  value={settings.reminder_advance_days || 7}
                  onChange={(e) => onSettingChange('reminder_advance_days', parseInt(e.target.value) || 7)}
                  placeholder="7"
                />
                <span className="text-xs text-gray-500">Days before service due date</span>
              </div>

              <div>
                <Label htmlFor="reminder_repeat_interval">Repeat Reminder Every</Label>
                <Select 
                  value={settings.reminder_repeat_interval || 'daily'} 
                  onValueChange={(value) => onSettingChange('reminder_repeat_interval', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="never">Never</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <CheckboxSetting
                id="auto_create_service_invoices"
                label="Auto Create Service Invoices"
                info="Automatically create invoices when service is completed."
                checked={settings.auto_create_service_invoices || false}
                onCheckedChange={(c) => onSettingChange('auto_create_service_invoices', c)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Service Templates</CardTitle>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowAddTemplate(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Template
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {showAddTemplate && (
            <div className="p-4 border rounded-lg mb-4 bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="template_name">Service Name</Label>
                  <Input
                    id="template_name"
                    value={newTemplate.name}
                    onChange={(e) => setNewTemplate({...newTemplate, name: e.target.value})}
                    placeholder="e.g., Vehicle Service"
                  />
                </div>
                <div>
                  <Label htmlFor="template_interval">Interval</Label>
                  <Input
                    id="template_interval"
                    type="number"
                    value={newTemplate.interval}
                    onChange={(e) => setNewTemplate({...newTemplate, interval: parseInt(e.target.value) || 30})}
                  />
                </div>
                <div>
                  <Label htmlFor="template_interval_type">Interval Type</Label>
                  <Select 
                    value={newTemplate.intervalType} 
                    onValueChange={(value) => setNewTemplate({...newTemplate, intervalType: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="days">Days</SelectItem>
                      <SelectItem value="weeks">Weeks</SelectItem>
                      <SelectItem value="months">Months</SelectItem>
                      <SelectItem value="years">Years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => setShowAddTemplate(false)}>Cancel</Button>
                <Button onClick={handleAddTemplate}>Add Template</Button>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {serviceTemplates.map((template) => (
              <div key={template.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <Checkbox 
                    checked={template.enabled} 
                    onCheckedChange={(checked) => {
                      setServiceTemplates(serviceTemplates.map(t => 
                        t.id === template.id ? {...t, enabled: checked} : t
                      ));
                    }}
                  />
                  <div>
                    <span className="font-medium">{template.name}</span>
                    <div className="text-sm text-gray-500">
                      Every {template.interval} {template.intervalType}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={template.enabled ? "default" : "secondary"}>
                    {template.enabled ? 'Active' : 'Inactive'}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteTemplate(template.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Reminder Message Templates
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="email_template">Email Template</Label>
            <textarea
              id="email_template"
              className="w-full p-3 border rounded-lg min-h-[100px]"
              value={settings.service_email_template || 'Dear {customer_name},\n\nThis is a reminder that your {service_name} is due on {due_date}.\n\nPlease contact us to schedule your appointment.\n\nBest regards,\n{company_name}'}
              onChange={(e) => onSettingChange('service_email_template', e.target.value)}
              placeholder="Enter email template..."
            />
          </div>

          <div>
            <Label htmlFor="sms_template">SMS Template</Label>
            <textarea
              id="sms_template"
              className="w-full p-3 border rounded-lg min-h-[80px]"
              value={settings.service_sms_template || 'Hi {customer_name}, your {service_name} is due on {due_date}. Please contact us to schedule. - {company_name}'}
              onChange={(e) => onSettingChange('service_sms_template', e.target.value)}
              placeholder="Enter SMS template..."
            />
          </div>

          <div className="text-sm text-gray-600">
            <p><strong>Available Variables:</strong></p>
            <div className="flex flex-wrap gap-2 mt-2">
              <Badge variant="outline">{'{customer_name}'}</Badge>
              <Badge variant="outline">{'{service_name}'}</Badge>
              <Badge variant="outline">{'{due_date}'}</Badge>
              <Badge variant="outline">{'{company_name}'}</Badge>
              <Badge variant="outline">{'{phone_number}'}</Badge>
              <Badge variant="outline">{'{last_service_date}'}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}