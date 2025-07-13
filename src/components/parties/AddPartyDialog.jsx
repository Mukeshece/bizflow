
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Settings, X, Plus, Info, Check, Trash2, Building, Phone, Mail, MapPin, CreditCard, Users } from "lucide-react";

export default function AddPartyDialog({ open, onClose, onSubmit }) {
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

  const [partyGroups, setPartyGroups] = useState([
    "General",
    "Local",
    "Vendor",
    "Retailer",
    "Wholesaler",
    "Distributor"
  ]);

  const [showAddGroup, setShowAddGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");

  const handleAddNewGroup = () => {
    if (newGroupName.trim() && !partyGroups.includes(newGroupName.trim())) {
      const updatedGroups = [...partyGroups, newGroupName.trim()];
      setPartyGroups(updatedGroups);
      setFormData(prev => ({ ...prev, party_group: newGroupName.trim() }));
      setNewGroupName("");
      setShowAddGroup(false);
    }
  };

  const handleDeleteGroup = (groupToDelete) => {
    if (groupToDelete !== "General") {
      const updatedGroups = partyGroups.filter(group => group !== groupToDelete);
      setPartyGroups(updatedGroups);
      
      if (formData.party_group === groupToDelete) {
        setFormData(prev => ({ ...prev, party_group: "General" }));
      }
    }
  };

  const handleSubmit = (e, saveAndNew = false) => {
    e.preventDefault();
    
    const submitData = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      address: formData.billing_address,
      gst_number: formData.gstin,
      business_type: formData.gst_type === "unregistered" ? "unregistered" : "registered",
      credit_limit: formData.has_credit_limit ? formData.credit_limit : 0,
      party_group: formData.party_group,
    };

    onSubmit(submitData);
    
    if (saveAndNew) {
      setFormData({
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
    } else {
      handleClose();
    }
  };

  const handleClose = () => {
    setFormData({
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
    setShowAddGroup(false);
    setNewGroupName("");
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
      <DialogContent className="sm:max-w-6xl max-h-[95vh] overflow-y-auto bg-gradient-to-br from-slate-50 to-blue-50">
        <style>{`
            [role='dialog'] > button.absolute {
                display: none;
            }
        `}</style>
        {/* Enhanced Header */}
        <DialogHeader className="border-b border-slate-200 pb-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <Building className="w-6 h-6 text-white" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold text-slate-900">Add New Party</DialogTitle>
                <p className="text-slate-600 mt-1">Create a new customer or vendor profile</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="rounded-xl hover:bg-slate-200">
                <Settings className="w-5 h-5 text-slate-600" />
              </Button>
              <Button variant="ghost" size="icon" onClick={handleClose} className="rounded-xl hover:bg-slate-200">
                <X className="w-5 h-5 text-slate-600" />
              </Button>
            </div>
          </div>
        </DialogHeader>
        
        <form className="space-y-8">
          {/* Basic Information Card */}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-lg text-slate-900">
                <Users className="w-5 h-5 text-blue-600" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="name" className="text-slate-700 font-medium flex items-center gap-2">
                    <Building className="w-4 h-4 text-blue-600" />
                    Party Name *
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    className="h-12 border-slate-300 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl"
                    required
                    placeholder="Enter party name"
                  />
                </div>
                
                <div className="space-y-3">
                  <Label htmlFor="phone" className="text-slate-700 font-medium flex items-center gap-2">
                    <Phone className="w-4 h-4 text-green-600" />
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    className="h-12 border-slate-300 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl"
                    placeholder="Enter phone number"
                  />
                </div>
                
                <div className="space-y-3">
                  <Label htmlFor="email" className="text-slate-700 font-medium flex items-center gap-2">
                    <Mail className="w-4 h-4 text-red-600" />
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    className="h-12 border-slate-300 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl"
                    placeholder="Enter email address"
                  />
                </div>
              </div>

              <Separator className="my-6" />

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="gstin" className="text-slate-700 font-medium">GSTIN</Label>
                  <Input
                    id="gstin"
                    value={formData.gstin}
                    onChange={(e) => handleChange("gstin", e.target.value.toUpperCase())}
                    className="h-12 border-slate-300 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl font-mono"
                    placeholder="22AAAAA0000A1Z5"
                    maxLength={15}
                  />
                </div>

                <div className="space-y-3">
                  <Label className="text-slate-700 font-medium">GST Type</Label>
                  <Select value={formData.gst_type} onValueChange={(value) => handleChange("gst_type", value)}>
                    <SelectTrigger className="h-12 border-slate-300 focus:border-blue-500 rounded-xl">
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
              </div>
            </CardContent>
          </Card>

          {/* Party Group Management Card */}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-lg text-slate-900">
                <Users className="w-5 h-5 text-purple-600" />
                Party Group Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Label className="text-slate-700 font-medium">Select Party Group</Label>
                <Select value={formData.party_group} onValueChange={(value) => {
                  if (value === "add_new") {
                    setShowAddGroup(true);
                  } else {
                    handleChange("party_group", value);
                  }
                }}>
                  <SelectTrigger className="h-12 border-slate-300 focus:border-blue-500 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="add_new" className="text-blue-600 font-medium">
                      <Plus className="w-4 h-4 mr-2" /> Add New Group
                    </SelectItem>
                    {partyGroups.map(group => (
                      <SelectItem key={group} value={group} className="py-3">
                        <div className="flex items-center justify-between w-full">
                          <span className="font-medium">{group}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Add New Group Input */}
                {showAddGroup && (
                  <Card className="border-2 border-blue-200 bg-blue-50/50">
                    <CardContent className="p-4">
                      <div className="flex gap-3">
                        <Input
                          placeholder="Enter new group name"
                          value={newGroupName}
                          onChange={(e) => setNewGroupName(e.target.value)}
                          className="flex-1 h-11 border-blue-300 focus:border-blue-500 rounded-lg"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              handleAddNewGroup();
                            }
                          }}
                        />
                        <Button
                          type="button"
                          onClick={handleAddNewGroup}
                          className="bg-blue-600 hover:bg-blue-700 rounded-lg px-4"
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setShowAddGroup(false);
                            setNewGroupName("");
                          }}
                          className="border-slate-300 hover:bg-slate-100 rounded-lg px-4"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Available Groups Display */}
                <div className="space-y-3">
                  <Label className="text-slate-700 font-medium">Available Groups</Label>
                  <div className="flex flex-wrap gap-2">
                    {partyGroups.map(group => (
                      <Badge
                        key={group}
                        variant={group === formData.party_group ? "default" : "outline"}
                        className={`px-3 py-2 text-sm font-medium rounded-lg cursor-pointer transition-all ${
                          group === formData.party_group 
                            ? 'bg-blue-600 text-white shadow-lg' 
                            : 'hover:bg-slate-100 border-slate-300'
                        }`}
                        onClick={() => handleChange("party_group", group)}
                      >
                        {group}
                        {group !== "General" && group === formData.party_group && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteGroup(group);
                            }}
                            className="ml-2 text-white/80 hover:text-white"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Detailed Information Tabs */}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <Tabs defaultValue="address" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-8 bg-slate-100 p-1 rounded-xl">
                  <TabsTrigger value="address" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                    <MapPin className="w-4 h-4 mr-2" />
                    Address Details
                  </TabsTrigger>
                  <TabsTrigger value="financial" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                    <CreditCard className="w-4 h-4 mr-2" />
                    Financial Info
                  </TabsTrigger>
                  <TabsTrigger value="additional" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                    <Info className="w-4 h-4 mr-2" />
                    Additional
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="address" className="space-y-6 mt-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div className="space-y-3">
                        <Label>State/Province</Label>
                        <Select value={formData.state} onValueChange={(value) => handleChange("state", value)}>
                          <SelectTrigger className="h-12 border-slate-300 focus:border-blue-500 rounded-xl">
                            <SelectValue placeholder="Select state" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="andhra_pradesh">Andhra Pradesh</SelectItem>
                            <SelectItem value="arunachal_pradesh">Arunachal Pradesh</SelectItem>
                            <SelectItem value="assam">Assam</SelectItem>
                            <SelectItem value="bihar">Bihar</SelectItem>
                            <SelectItem value="chhattisgarh">Chhattisgarh</SelectItem>
                            <SelectItem value="goa">Goa</SelectItem>
                            <SelectItem value="gujarat">Gujarat</SelectItem>
                            <SelectItem value="haryana">Haryana</SelectItem>
                            <SelectItem value="himachal_pradesh">Himachal Pradesh</SelectItem>
                            <SelectItem value="jharkhand">Jharkhand</SelectItem>
                            <SelectItem value="karnataka">Karnataka</SelectItem>
                            <SelectItem value="kerala">Kerala</SelectItem>
                            <SelectItem value="madhya_pradesh">Madhya Pradesh</SelectItem>
                            <SelectItem value="maharashtra">Maharashtra</SelectItem>
                            <SelectItem value="manipur">Manipur</SelectItem>
                            <SelectItem value="meghalaya">Meghalaya</SelectItem>
                            <SelectItem value="mizoram">Mizoram</SelectItem>
                            <SelectItem value="nagaland">Nagaland</SelectItem>
                            <SelectItem value="odisha">Odisha</SelectItem>
                            <SelectItem value="punjab">Punjab</SelectItem>
                            <SelectItem value="rajasthan">Rajasthan</SelectItem>
                            <SelectItem value="sikkim">Sikkim</SelectItem>
                            <SelectItem value="tamil_nadu">Tamil Nadu</SelectItem>
                            <SelectItem value="telangana">Telangana</SelectItem>
                            <SelectItem value="tripura">Tripura</SelectItem>
                            <SelectItem value="uttar_pradesh">Uttar Pradesh</SelectItem>
                            <SelectItem value="uttarakhand">Uttarakhand</SelectItem>
                            <SelectItem value="west_bengal">West Bengal</SelectItem>
                            <SelectItem value="delhi">Delhi</SelectItem>
                            <SelectItem value="chandigarh">Chandigarh</SelectItem>
                            <SelectItem value="puducherry">Puducherry</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-3">
                        <Label htmlFor="billing_address">Billing Address</Label>
                        <Textarea
                          id="billing_address"
                          value={formData.billing_address}
                          onChange={(e) => handleChange("billing_address", e.target.value)}
                          rows={5}
                          className="border-slate-300 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl resize-none"
                          placeholder="Enter complete billing address..."
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-6">
                      <div className="flex items-center justify-between p-4 border-2 border-dashed border-slate-300 rounded-xl">
                        <div className="flex items-center gap-3">
                          <MapPin className="w-5 h-5 text-blue-600" />
                          <div>
                            <p className="font-medium text-slate-900">Enable Shipping Address</p>
                            <p className="text-sm text-slate-600">Add separate shipping address</p>
                          </div>
                        </div>
                        <Switch
                          checked={formData.enable_shipping_address}
                          onCheckedChange={(checked) => handleChange("enable_shipping_address", checked)}
                        />
                      </div>
                      
                      {formData.enable_shipping_address && (
                        <div className="space-y-3">
                          <Label htmlFor="shipping_address">Shipping Address</Label>
                          <Textarea
                            id="shipping_address"
                            value={formData.shipping_address}
                            onChange={(e) => handleChange("shipping_address", e.target.value)}
                            rows={5}
                            className="border-slate-300 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl resize-none"
                            placeholder="Enter shipping address..."
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="financial" className="space-y-8 mt-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <Card className="border-slate-200">
                      <CardHeader className="pb-4">
                        <CardTitle className="text-lg text-slate-900">Opening Balance</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-3">
                          <Label htmlFor="opening_balance">Amount (₹)</Label>
                          <Input
                            id="opening_balance"
                            type="number"
                            value={formData.opening_balance}
                            onChange={(e) => handleChange("opening_balance", parseFloat(e.target.value) || 0)}
                            className="h-12 border-slate-300 focus:border-blue-500 rounded-xl"
                            placeholder="0.00"
                          />
                        </div>
                        <div className="space-y-3">
                          <Label htmlFor="balance_date">As of Date</Label>
                          <Input
                            id="balance_date"
                            type="date"
                            value={formData.balance_date}
                            onChange={(e) => handleChange("balance_date", e.target.value)}
                            className="h-12 border-slate-300 focus:border-blue-500 rounded-xl"
                          />
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="border-slate-200">
                      <CardHeader className="pb-4">
                        <CardTitle className="text-lg text-slate-900 flex items-center gap-2">
                          Credit Limit
                          <Info className="w-4 h-4 text-slate-400" />
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-4 border rounded-xl">
                            <div className="flex items-center gap-3">
                              <div className={`w-3 h-3 rounded-full ${!formData.has_credit_limit ? 'bg-green-500' : 'bg-slate-300'}`} />
                              <span className="font-medium">No Limit</span>
                            </div>
                            <Switch
                              checked={!formData.has_credit_limit}
                              onCheckedChange={(checked) => handleChange("has_credit_limit", !checked)}
                            />
                          </div>
                          
                          <div className="flex items-center justify-between p-4 border rounded-xl">
                            <div className="flex items-center gap-3">
                              <div className={`w-3 h-3 rounded-full ${formData.has_credit_limit ? 'bg-blue-500' : 'bg-slate-300'}`} />
                              <span className="font-medium">Custom Limit</span>
                            </div>
                            <Switch
                              checked={formData.has_credit_limit}
                              onCheckedChange={(checked) => handleChange("has_credit_limit", checked)}
                            />
                          </div>
                          
                          {formData.has_credit_limit && (
                            <div className="space-y-3">
                              <Label>Credit Limit Amount (₹)</Label>
                              <Input
                                type="number"
                                value={formData.credit_limit}
                                onChange={(e) => handleChange("credit_limit", parseFloat(e.target.value) || 0)}
                                className="h-12 border-slate-300 focus:border-blue-500 rounded-xl"
                                placeholder="Enter credit limit"
                              />
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
                
                <TabsContent value="additional" className="mt-6">
                  <div className="text-center py-12 text-slate-500">
                    <Info className="w-12 h-12 mx-auto mb-4 text-slate-400" />
                    <p className="text-lg font-medium mb-2">Additional Configuration</p>
                    <p>Additional party fields and settings will be available here</p>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Enhanced Footer */}
          <div className="flex justify-end gap-4 pt-8 border-t border-slate-200">
            <Button 
              type="button" 
              variant="outline" 
              onClick={(e) => handleSubmit(e, true)}
              className="h-12 px-8 border-blue-600 text-blue-600 hover:bg-blue-50 rounded-xl font-medium"
            >
              Save & Add New
            </Button>
            <Button 
              type="button"
              onClick={(e) => handleSubmit(e, false)}
              className="h-12 px-8 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-medium shadow-lg"
            >
              Save Party
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
