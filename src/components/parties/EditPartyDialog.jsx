
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Settings, X, Plus, Info, Save, Trash2 } from "lucide-react";

export default function EditPartyDialog({ open, onClose, onSubmit, onDelete, party }) {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    gstin: "",
    party_group: "General",
    gst_type: "unregistered",
    billing_address: "",
    state: "",
    email: "",
    opening_balance: 0,
    balance_date: new Date().toISOString().split('T')[0],
    has_credit_limit: false,
    credit_limit: 0,
    enable_shipping_address: false,
    shipping_address: ""
  });

  useEffect(() => {
    if (party) {
      setFormData({
        name: party.name || "",
        phone: party.phone || "",
        gstin: party.gst_number || "",
        party_group: party.party_group || (party.type === 'customer' ? 'General' : 'Vendor'),
        gst_type: party.business_type || "unregistered",
        billing_address: party.address || "",
        state: party.state || "gujarat", // Defaulting to a value, as it's not in the entity
        email: party.email || "",
        opening_balance: party.opening_balance || 0, // Not in entity
        balance_date: party.balance_date || new Date().toISOString().split('T')[0], // Not in entity
        has_credit_limit: (party.credit_limit || 0) > 0,
        credit_limit: party.credit_limit || 0,
        enable_shipping_address: !!party.shipping_address, // Not in entity
        shipping_address: party.shipping_address || "" // Not in entity
      });
    }
  }, [party]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const submitData = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      address: formData.billing_address,
      gst_number: formData.gstin,
      business_type: formData.gst_type,
      credit_limit: formData.has_credit_limit ? formData.credit_limit : 0,
      party_group: formData.party_group,
    };
    onSubmit(party.id, submitData);
    handleClose();
  };
  
  const handleDelete = () => {
      if(onDelete) {
          onDelete(party, party.type);
      }
      handleClose();
  }

  const handleClose = () => {
    onClose();
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <style>{`
            [role='dialog'] > button.absolute {
                display: none;
            }
        `}</style>
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-xl font-semibold">Edit Party</DialogTitle>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <Settings className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Top Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-blue-600">Party Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                className="border-blue-300 focus:border-blue-500"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gstin" className="text-gray-500">GSTIN</Label>
              <div className="relative">
                <Input
                  id="gstin"
                  value={formData.gstin}
                  onChange={(e) => handleChange("gstin", e.target.value)}
                  className="pr-8"
                  placeholder="Enter GSTIN"
                />
                {formData.gstin && <div className="absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 bg-green-100 rounded-full flex items-center justify-center"><span className="text-green-600">✓</span></div>}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                placeholder="Enter phone number"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             <div className="space-y-2">
              <Label htmlFor="party_group">Party Group</Label>
              <Select value={formData.party_group} onValueChange={(value) => handleChange("party_group", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="General">General</SelectItem>
                  <SelectItem value="Local">Local</SelectItem>
                  <SelectItem value="Vendor">Vendor</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Tabs Section */}
          <Tabs defaultValue="gst_address" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="gst_address" className="text-blue-600">GST & Address</TabsTrigger>
              <TabsTrigger value="credit_balance" className="relative">
                Credit & Balance
                <Badge className="ml-2 bg-red-500 text-white">New</Badge>
              </TabsTrigger>
              <TabsTrigger value="additional" className="text-gray-500">Additional Fields</TabsTrigger>
            </TabsList>
            
            <TabsContent value="gst_address" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>GST Type</Label>
                    <Select value={formData.gst_type} onValueChange={(value) => handleChange("gst_type", value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unregistered">Unregistered/Consumer</SelectItem>
                        <SelectItem value="registered">Registered Business - Regular</SelectItem>
                        <SelectItem value="composition">Composition</SelectItem>
                        <SelectItem value="overseas">Overseas</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>State</Label>
                    <Select value={formData.state} onValueChange={(value) => handleChange("state", value)}>
                        <SelectTrigger>
                        <SelectValue placeholder="Select state" />
                        </SelectTrigger>
                        <SelectContent>
                        <SelectItem value="maharashtra">Maharashtra</SelectItem>
                        <SelectItem value="gujarat">Gujarat</SelectItem>
                        <SelectItem value="karnataka">Karnataka</SelectItem>
                        <SelectItem value="delhi">Delhi</SelectItem>
                        <SelectItem value="tamil_nadu">Tamil Nadu</SelectItem>
                        </SelectContent>
                    </Select>
                    </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email ID</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      placeholder="Enter email address"
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="billing_address">Billing Address</Label>
                    <Textarea
                      id="billing_address"
                      value={formData.billing_address}
                      onChange={(e) => handleChange("billing_address", e.target.value)}
                      rows={4}
                      placeholder="Enter billing address"
                    />
                  </div>
                  
                  <Button 
                    type="button" 
                    variant="link" 
                    className="text-blue-600 p-0 h-auto"
                    onClick={() => handleChange("enable_shipping_address", !formData.enable_shipping_address)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Enable Shipping Address
                  </Button>
                  
                  {formData.enable_shipping_address && (
                    <div className="space-y-2">
                      <Label htmlFor="shipping_address">Shipping Address</Label>
                      <Textarea
                        id="shipping_address"
                        value={formData.shipping_address}
                        onChange={(e) => handleChange("shipping_address", e.target.value)}
                        rows={4}
                        placeholder="Enter shipping address"
                      />
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="credit_balance" className="space-y-6 mt-6">
                {/* Content from AddPartyDialog for credit/balance, can be implemented if needed */}
                <div className="text-center py-8 text-gray-500">
                    <p>Credit and balance settings can be configured here.</p>
                </div>
            </TabsContent>
            
            <TabsContent value="additional" className="space-y-6 mt-6">
              <div className="text-center py-8 text-gray-500">
                <p>Additional fields can be configured here</p>
              </div>
            </TabsContent>
          </Tabs>

          {/* Footer Buttons */}
          <div className="flex justify-end gap-3 pt-6 border-t">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleDelete}
            >
              Delete
            </Button>
            <Button 
              type="submit"
              className="bg-blue-600 hover:bg-blue-700"
            >
              Update
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
