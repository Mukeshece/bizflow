import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, Phone, CheckCircle, Edit, Save, X } from 'lucide-react';

const transactionTypes = [
  { id: 'sales', name: 'Sales Transaction', icon: '💰' },
  { id: 'purchase', name: 'Purchase Transaction', icon: '🛒' },
  { id: 'payment_in', name: 'Payment In', icon: '💵' },
  { id: 'payment_out', name: 'Payment Out', icon: '💸' },
  { id: 'sales_return', name: 'Sales Return', icon: '↩️' },
  { id: 'purchase_return', name: 'Purchase Return', icon: '🔄' },
  { id: 'sale_order', name: 'Sale Order', icon: '📋' },
  { id: 'purchase_order', name: 'Purchase Order', icon: '📝' },
  { id: 'estimate', name: 'Estimate', icon: '📊' },
  { id: 'proforma_invoice', name: 'Proforma Invoice', icon: '📄' },
  { id: 'delivery_challan', name: 'Delivery Challan', icon: '🚚' },
  { id: 'cancelled_invoice', name: 'Cancelled Invoice', icon: '❌' }
];

const messageVariables = [
  { var: '{Party_Name}', desc: 'Customer/Vendor Name' },
  { var: '{Transaction_Type}', desc: 'Type of Transaction' },
  { var: '{Invoice_Amount}', desc: 'Invoice Total Amount' },
  { var: '{Balance_Amount}', desc: 'Outstanding Balance' },
  { var: '{Transaction_Date}', desc: 'Transaction Date' },
  { var: '{Invoice_Number}', desc: 'Invoice/Bill Number' },
  { var: '{Company_Name}', desc: 'Your Company Name' },
  { var: '{Phone_Number}', desc: 'Your Phone Number' },
  { var: '{Due_Date}', desc: 'Payment Due Date' },
  { var: '{Payment_Method}', desc: 'Payment Method Used' }
];

const defaultMessages = {
  sales: "Greetings from {Company_Name}!\nWe are pleased to have you as a valuable customer. Please find the details of your transaction.\n\n{Transaction_Type}: {Invoice_Number}\nInvoice Amount: ₹{Invoice_Amount}\nBalance: ₹{Balance_Amount}\n\nThanks for doing business with us.\nRegards,\n{Company_Name}",
  purchase: "Dear {Party_Name},\nPurchase transaction completed.\n\nBill: {Invoice_Number}\nAmount: ₹{Invoice_Amount}\nDate: {Transaction_Date}\n\nThank you for your service.\n{Company_Name}",
  payment_in: "Payment Received!\nDear {Party_Name},\nWe have received your payment of ₹{Invoice_Amount}\nTransaction: {Invoice_Number}\nDate: {Transaction_Date}\n\nThank you!\n{Company_Name}",
  payment_out: "Payment Made\nDear {Party_Name},\nPayment of ₹{Invoice_Amount} has been made\nReference: {Invoice_Number}\nDate: {Transaction_Date}\n\nRegards,\n{Company_Name}",
  sales_return: "Sales Return Processed\nDear {Party_Name},\nYour return has been processed\nReturn Amount: ₹{Invoice_Amount}\nReference: {Invoice_Number}\n\nThank you!\n{Company_Name}",
  purchase_return: "Purchase Return\nDear {Party_Name},\nPurchase return processed\nAmount: ₹{Invoice_Amount}\nReference: {Invoice_Number}\n\nRegards,\n{Company_Name}"
};

export default function TransactionMessageSettings({ settings, onSettingChange }) {
  const [selectedTransaction, setSelectedTransaction] = useState('sales');
  const [messageContent, setMessageContent] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [smsSettings, setSmsSettings] = useState({
    send_sms_to_party: settings.send_sms_to_party || false,
    send_sms_copy_to_self: settings.send_sms_copy_to_self || false,
    send_transaction_update_sms: settings.send_transaction_update_sms || false,
    auto_share_invoices_vyapar: settings.auto_share_invoices_vyapar || false,
    party_balance_in_sms: settings.party_balance_in_sms || false,
    web_invoice_link_in_sms: settings.web_invoice_link_in_sms || false,
    vyapar_phone: settings.vyapar_phone || ''
  });

  const [autoSendSettings, setAutoSendSettings] = useState({
    sales: settings.auto_send_sales || false,
    purchase: settings.auto_send_purchase || false,
    sales_return: settings.auto_send_sales_return || false,
    purchase_return: settings.auto_send_purchase_return || false,
    payment_in: settings.auto_send_payment_in || false,
    payment_out: settings.auto_send_payment_out || false,
    sale_order: settings.auto_send_sale_order || false,
    purchase_order: settings.auto_send_purchase_order || false,
    estimate: settings.auto_send_estimate || false,
    proforma_invoice: settings.auto_send_proforma_invoice || false,
    delivery_challan: settings.auto_send_delivery_challan || false,
    cancelled_invoice: settings.auto_send_cancelled_invoice || false
  });

  useEffect(() => {
    const messageKey = `message_template_${selectedTransaction}`;
    setMessageContent(settings[messageKey] || defaultMessages[selectedTransaction] || '');
  }, [selectedTransaction, settings]);

  const handleSmsSettingChange = (key, value) => {
    setSmsSettings(prev => ({ ...prev, [key]: value }));
    onSettingChange(key, value);
  };

  const handleAutoSendChange = (transactionType, value) => {
    setAutoSendSettings(prev => ({ ...prev, [transactionType]: value }));
    onSettingChange(`auto_send_${transactionType}`, value);
  };

  const handleSaveMessage = () => {
    const messageKey = `message_template_${selectedTransaction}`;
    onSettingChange(messageKey, messageContent);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    const messageKey = `message_template_${selectedTransaction}`;
    setMessageContent(settings[messageKey] || defaultMessages[selectedTransaction] || '');
    setIsEditing(false);
  };

  const insertVariable = (variable) => {
    setMessageContent(prev => prev + variable);
  };

  const getPreviewMessage = () => {
    return messageContent
      .replace(/{Party_Name}/g, 'John Doe')
      .replace(/{Transaction_Type}/g, transactionTypes.find(t => t.id === selectedTransaction)?.name || 'Transaction')
      .replace(/{Invoice_Amount}/g, '₹1,000.00')
      .replace(/{Balance_Amount}/g, '₹500.00')
      .replace(/{Transaction_Date}/g, new Date().toLocaleDateString())
      .replace(/{Invoice_Number}/g, 'INV-001')
      .replace(/{Company_Name}/g, 'Your Company')
      .replace(/{Phone_Number}/g, '+91 98765 43210')
      .replace(/{Due_Date}/g, new Date(Date.now() + 30*24*60*60*1000).toLocaleDateString())
      .replace(/{Payment_Method}/g, 'Cash');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left Column - Message Settings */}
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Select Message Type
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2 mb-4">
              <Button
                variant={selectedTransaction === 'sales' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedTransaction('sales')}
                className="flex items-center gap-1"
              >
                <MessageSquare className="w-4 h-4" />
                Send via Vyapar
              </Button>
              <Button
                variant={selectedTransaction === 'whatsapp' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedTransaction('whatsapp')}
                className="flex items-center gap-1"
              >
                <Phone className="w-4 h-4" />
                Send via Personal WhatsApp
              </Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {transactionTypes.map(type => (
                <Button
                  key={type.id}
                  variant={selectedTransaction === type.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedTransaction(type.id)}
                  className="justify-start text-left"
                >
                  <span className="mr-2">{type.icon}</span>
                  {type.name}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Message Recipient Settings</span>
              <Badge variant="outline" className="text-xs">
                {transactionTypes.find(t => t.id === selectedTransaction)?.name || 'Transaction'}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="send-sms-party"
                  checked={smsSettings.send_sms_to_party}
                  onCheckedChange={(checked) => handleSmsSettingChange('send_sms_to_party', checked)}
                />
                <Label htmlFor="send-sms-party">Send SMS to Party</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="send-transaction-update"
                  checked={smsSettings.send_transaction_update_sms}
                  onCheckedChange={(checked) => handleSmsSettingChange('send_transaction_update_sms', checked)}
                />
                <Label htmlFor="send-transaction-update">Send Transaction Update SMS</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="send-sms-copy"
                  checked={smsSettings.send_sms_copy_to_self}
                  onCheckedChange={(checked) => handleSmsSettingChange('send_sms_copy_to_self', checked)}
                />
                <Label htmlFor="send-sms-copy">Send SMS Copy to Self</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="auto-share-vyapar"
                  checked={smsSettings.auto_share_invoices_vyapar}
                  onCheckedChange={(checked) => handleSmsSettingChange('auto_share_invoices_vyapar', checked)}
                />
                <Label htmlFor="auto-share-vyapar">Auto Share invoices on Vyapar Network</Label>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Label>Vyapar Phone Number:</Label>
              <Input
                placeholder="91948326124"
                value={smsSettings.vyapar_phone}
                onChange={(e) => handleSmsSettingChange('vyapar_phone', e.target.value)}
                className="w-40"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Message Content</span>
              <div className="flex gap-2">
                {isEditing ? (
                  <>
                    <Button size="sm" onClick={handleSaveMessage}>
                      <Save className="w-4 h-4 mr-1" />
                      Save
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                      <X className="w-4 h-4 mr-1" />
                      Cancel
                    </Button>
                  </>
                ) : (
                  <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>
                    <Edit className="w-4 h-4 mr-1" />
                    Edit Message
                  </Button>
                )}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2 mb-4">
              <Checkbox
                id="party-balance-sms"
                checked={smsSettings.party_balance_in_sms}
                onCheckedChange={(checked) => handleSmsSettingChange('party_balance_in_sms', checked)}
              />
              <Label htmlFor="party-balance-sms">Party Current Balance in SMS</Label>
              
              <Checkbox
                id="web-invoice-link"
                checked={smsSettings.web_invoice_link_in_sms}
                onCheckedChange={(checked) => handleSmsSettingChange('web_invoice_link_in_sms', checked)}
                className="ml-4"
              />
              <Label htmlFor="web-invoice-link">Web Invoice link in SMS</Label>
            </div>

            <div className="space-y-2">
              <Label>Message Template:</Label>
              <Textarea
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                placeholder="Enter your message template..."
                className="min-h-[150px] font-mono text-sm"
                disabled={!isEditing}
              />
            </div>

            <div className="space-y-2">
              <Label>Available Variables:</Label>
              <div className="flex flex-wrap gap-1">
                {messageVariables.map(variable => (
                  <Button
                    key={variable.var}
                    variant="outline"
                    size="sm"
                    onClick={() => insertVariable(variable.var)}
                    disabled={!isEditing}
                    className="text-xs"
                  >
                    {variable.var}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Send Automatic SMS for:</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {transactionTypes.map(type => (
                <div key={type.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`auto-${type.id}`}
                    checked={autoSendSettings[type.id]}
                    onCheckedChange={(checked) => handleAutoSendChange(type.id, checked)}
                  />
                  <Label htmlFor={`auto-${type.id}`} className="text-sm">
                    {type.name}
                  </Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Column - Preview */}
      <div className="lg:col-span-1">
        <Card className="sticky top-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {transactionTypes.find(t => t.id === selectedTransaction)?.name || 'Transaction'}
              </Badge>
              Edit Message
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Transaction Type:</Label>
                <Select value={selectedTransaction} onValueChange={setSelectedTransaction}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {transactionTypes.map(type => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.icon} {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <Label className="text-sm font-medium text-green-800">Transaction Image Attached</Label>
                </div>
                <div className="text-sm text-green-700">
                  <strong>Message Preview:</strong>
                </div>
                <div className="mt-2 p-2 bg-white rounded text-xs whitespace-pre-wrap border">
                  {getPreviewMessage()}
                </div>
              </div>

              <div className="text-xs text-gray-500">
                Insert | symbol anywhere to include a variable.
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}