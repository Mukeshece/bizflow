
import React, { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { UploadFile } from "@/api/integrations";
import { AppSettings } from "@/api/entities";
import { Image as ImageIcon, Loader2, X, Settings, Plus, Search } from "lucide-react";
import ItemSettingsDrawer from "./ItemSettingsDrawer";
import SelectUnitDialog from "./SelectUnitDialog";

export default function AddEditProductDialog({ open, onClose, onSubmit, product }) {
  const [formData, setFormData] = useState({});
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isUnitDialogOpen, setIsUnitDialogOpen] = useState(false);
  const [categorySearch, setCategorySearch] = useState("");
  const [isCategoryPopoverOpen, setIsCategoryPopoverOpen] = useState(false);

  const [itemSettings, setItemSettings] = useState({
    item_enable_wholesale_price: true,
    item_enable_barcode_scan: true,
    item_show_category: true,
    item_show_description: false,
  });

  const [categories, setCategories] = useState(['General', 'Sarees', 'Textile', 'Electronics', 'FMCG']);
  
  useEffect(() => {
    const loadSettings = async () => {
        try {
            const settingsData = await AppSettings.list();
            if (settingsData && settingsData.length > 0) {
                setItemSettings(prev => ({
                    ...prev,
                    ...settingsData[0]
                }));
            }
        } catch (error) {
            console.error("Failed to load app settings:", error);
        }
    };
    if(open) {
        loadSettings();
    }
  }, [open]);

  const getInitialFormData = () => ({
    name: '',
    item_code: generateBarcode(),
    hsn_code: '',
    category: 'General',
    image_url: '',
    unit: 'pcs',
    purchase_rate: '',
    b2c_rate: '',
    b2b_rate: '',
    min_wholesale_qty: '', // Added new field
    current_stock: '',
    min_stock: '10',
    stock_date: new Date().toISOString().split('T')[0],
    gst_rate: 18,
    location: '',
    godown: '',
  });

  useEffect(() => {
    if (open) {
      if (product) {
        setFormData({
          ...getInitialFormData(),
          ...product,
          purchase_rate: product.purchase_rate || '',
          b2c_rate: product.b2c_rate || '',
          b2b_rate: product.b2b_rate || '',
          min_wholesale_qty: product.min_wholesale_qty || '', // Initialize new field
          current_stock: product.current_stock || '',
          min_stock: product.min_stock || '10',
          location: product.location || '',
          godown: product.godown || '',
        });
      } else {
        setFormData(getInitialFormData());
      }
    }
  }, [product, open]);

  const generateBarcode = () => {
    return Math.floor(10000000000 + Math.random() * 90000000000).toString();
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddNewCategory = () => {
    if (categorySearch && !categories.includes(categorySearch)) {
        setCategories(prev => [...prev, categorySearch]);
        handleChange('category', categorySearch);
        setCategorySearch('');
    }
    setIsCategoryPopoverOpen(false);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const result = await UploadFile({ file });
      if (result && result.file_url) {
        handleChange('image_url', result.file_url);
      } else {
        console.error("Upload failed, no file_url returned");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
    } finally {
      setIsUploading(false);
    }
  };
  
  const handleFormSubmit = (e, saveAndNew = false) => {
    e.preventDefault();
    const processedData = {
        ...formData,
        purchase_rate: parseFloat(formData.purchase_rate) || 0,
        b2c_rate: parseFloat(formData.b2c_rate) || 0,
        b2b_rate: parseFloat(formData.b2b_rate) || 0,
        min_wholesale_qty: parseFloat(formData.min_wholesale_qty) || 0, // Added new field
        current_stock: parseFloat(formData.current_stock) || 0,
        min_stock: parseFloat(formData.min_stock) || 0,
    }
    onSubmit(processedData);
    if (saveAndNew) {
        setFormData(getInitialFormData());
    } else {
        onClose();
    }
  };

  const filteredCategories = categories.filter(cat => 
    cat.toLowerCase().includes(categorySearch.toLowerCase())
  );

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-6xl max-h-[95vh] overflow-y-auto p-0">
          {/* This style block hides a default close button that might appear in some Dialog implementations, as per the outline */}
          <style>{`
              [role='dialog'] > button.absolute {
                  display: none;
              }
          `}</style>
          <DialogHeader className="p-6 pb-4 flex flex-row justify-between items-center border-b">
            <DialogTitle className="text-xl font-semibold">{product ? "Edit Item" : "Add Item"}</DialogTitle>
             <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={() => setIsSettingsOpen(true)}>
                    <Settings className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" onClick={onClose}>
                    <X className="h-5 w-5" />
                </Button>
            </div>
          </DialogHeader>
          <form onSubmit={(e) => handleFormSubmit(e, false)}>
            <div className="px-6 space-y-6">
              {/* New grid structure for Name and HSN */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                <div>
                  <Label htmlFor="name" className="text-sm font-medium">Item Name *</Label>
                  <Input 
                    id="name" 
                    value={formData.name || ''} 
                    onChange={e => handleChange('name', e.target.value)} 
                    required 
                    className="mt-1 h-10" 
                    placeholder="Enter item name"
                  />
                </div>
                <div>
                  <Label htmlFor="hsn_code" className="text-sm font-medium">Item HSN</Label>
                  <div className="relative mt-1">
                      <Input 
                          id="hsn_code" 
                          value={formData.hsn_code || ''} 
                          onChange={e => handleChange('hsn_code', e.target.value)} 
                          className="h-10 pr-10"
                          placeholder="Enter HSN code"
                      />
                      <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  </div>
                </div>
              </div>

              {/* New grid structure for Category, Item Code, Unit, and Image Upload */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                {itemSettings.item_show_category && (
                  <div>
                      <Label htmlFor="category" className="text-sm font-medium">Category</Label>
                      <Popover open={isCategoryPopoverOpen} onOpenChange={setIsCategoryPopoverOpen}>
                          <PopoverTrigger asChild>
                              <Button variant="outline" className="w-full justify-between mt-1 h-10 font-normal">
                                  {formData.category || "Select a category"}
                              </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                              <Command>
                                  <CommandInput 
                                      placeholder="Search or add category..." 
                                      value={categorySearch} 
                                      onValueChange={setCategorySearch}
                                  />
                                  <CommandList>
                                      <CommandEmpty>
                                          <Button variant="ghost" className="w-full" onClick={handleAddNewCategory}>
                                              <Plus className="mr-2 h-4 w-4" /> Add "{categorySearch}"
                                          </Button>
                                      </CommandEmpty>
                                      <CommandGroup>
                                          {filteredCategories.map(cat => (
                                              <CommandItem
                                                  key={cat}
                                                  value={cat}
                                                  onSelect={(currentValue) => {
                                                      handleChange('category', currentValue);
                                                      setIsCategoryPopoverOpen(false);
                                                  }}
                                              >
                                                  {cat}
                                              </CommandItem>
                                          ))}
                                      </CommandGroup>
                                  </CommandList>
                              </Command>
                          </PopoverContent>
                      </Popover>
                  </div>
                )}

                {itemSettings.item_enable_barcode_scan && (
                  <div>
                    <Label htmlFor="item_code" className="text-sm font-medium">Item Code (Barcode) *</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Input 
                        id="item_code" 
                        value={formData.item_code || ''} 
                        onChange={e => handleChange('item_code', e.target.value)}
                        className="h-10"
                        placeholder="Enter barcode"
                      />
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => handleChange('item_code', generateBarcode())}
                        className="h-10 px-3 text-sm"
                      >
                        Assign Code
                      </Button>
                    </div>
                  </div>
                )}

                <div>
                  <Label htmlFor="unit" className="text-sm font-medium">Unit</Label>
                  <Button type="button" variant="outline" className="w-full justify-between mt-1 h-10 font-normal" onClick={() => setIsUnitDialogOpen(true)}>
                      <span>{formData.unit}</span>
                      <span className="text-xs text-gray-500">PCS</span>
                  </Button>
                </div>

                {/* New Image Upload UI */}
                <div>
                  <Label className="text-sm font-medium">Add Item Image</Label>
                  <div className="mt-1">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageUpload}
                      className="hidden"
                      accept="image/*"
                      disabled={isUploading}
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="w-full h-10 font-normal"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                    >
                      {isUploading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <ImageIcon className="w-4 h-4 mr-2" />
                          Add Item Image
                        </>
                      )}
                    </Button>
                    {formData.image_url && (
                      <div className="mt-2 relative inline-block">
                        <img src={formData.image_url} alt="Product preview" className="w-16 h-16 object-cover rounded border" />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute -top-2 -right-2 w-5 h-5"
                          onClick={() => handleChange('image_url', '')} // Directly clear image_url
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <Tabs defaultValue="pricing" className="pt-4">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="pricing">Pricing</TabsTrigger>
                  <TabsTrigger value="stock">Stock</TabsTrigger>
                  <TabsTrigger value="online">Online Store</TabsTrigger>
                </TabsList>
                
                <TabsContent value="pricing" className="pt-6">
                  <div className="space-y-6">
                    <div>
                      <Label htmlFor="b2c_rate" className="text-sm font-medium">Sale Price</Label>
                      <Input 
                        type="number" 
                        id="b2c_rate" 
                        placeholder="₹ 0.00" 
                        value={formData.b2c_rate || ''} 
                        onChange={e => handleChange('b2c_rate', e.target.value)} 
                        className="mt-1 h-10" 
                      />
                    </div>
                    
                    {itemSettings.item_enable_wholesale_price && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="b2b_rate" className="text-sm font-medium">Wholesale Price</Label>
                          <Input 
                            type="number" 
                            id="b2b_rate" 
                            placeholder="₹ 0.00" 
                            value={formData.b2b_rate || ''} 
                            onChange={e => handleChange('b2b_rate', e.target.value)} 
                            className="mt-1 h-10" 
                          />
                        </div>
                        <div>
                          <Label htmlFor="min_wholesale_qty" className="text-sm font-medium">Minimum Wholesale Qty</Label>
                          <Input 
                            type="number" 
                            id="min_wholesale_qty" 
                            placeholder="0" 
                            value={formData.min_wholesale_qty || ''} 
                            onChange={e => handleChange('min_wholesale_qty', e.target.value)} 
                            className="mt-1 h-10" 
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="stock" className="pt-6">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="current_stock" className="text-sm font-medium">Opening Quantity</Label>
                        <Input 
                          type="number" 
                          id="current_stock" 
                          value={formData.current_stock || ''} 
                          onChange={e => handleChange('current_stock', e.target.value)} 
                          className="mt-1 h-10"
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <Label htmlFor="min_stock" className="text-sm font-medium">Min Stock</Label>
                        <Input 
                          type="number" 
                          id="min_stock" 
                          value={formData.min_stock || ''} 
                          onChange={e => handleChange('min_stock', e.target.value)} 
                          className="mt-1 h-10"
                          placeholder="10"
                        />
                      </div>
                      <div>
                        <Label htmlFor="purchase_rate" className="text-sm font-medium">At Price</Label> {/* Relabeled from stock_date */}
                        <Input 
                          type="number" 
                          id="purchase_rate" 
                          value={formData.purchase_rate || ''} 
                          onChange={e => handleChange('purchase_rate', e.target.value)} 
                          className="mt-1 h-10"
                          placeholder="₹ 0.00"
                        />
                      </div>
                      <div>
                        <Label htmlFor="location" className="text-sm font-medium">Location</Label>
                        <Input 
                          id="location" 
                          value={formData.location || ''} 
                          onChange={e => handleChange('location', e.target.value)} 
                          className="mt-1 h-10"
                          placeholder="e.g., Warehouse A, Shelf 1"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Label htmlFor="godown" className="text-sm font-medium">Godown Management</Label>
                        <Select value={formData.godown || ''} onValueChange={value => handleChange('godown', value)}>
                          <SelectTrigger className="mt-1 h-10">
                            <SelectValue placeholder="Select godown" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="main_warehouse">Main Warehouse</SelectItem>
                            <SelectItem value="secondary_warehouse">Secondary Warehouse</SelectItem>
                            <SelectItem value="retail_store">Retail Store</SelectItem>
                            <SelectItem value="online_fulfillment">Online Fulfillment Center</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                </TabsContent>
                
                <TabsContent value="online" className="pt-6"> {/* New "Online Store" tab */}
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="gst_rate" className="text-sm font-medium">GST Rate (%)</Label>
                         <Select value={formData.gst_rate?.toString() || '18'} onValueChange={value => handleChange('gst_rate', Number(value))}>
                          <SelectTrigger className="mt-1 h-10">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                              <SelectItem value="0">0%</SelectItem>
                              <SelectItem value="5">5%</SelectItem>
                              <SelectItem value="12">12%</SelectItem>
                              <SelectItem value="18">18%</SelectItem>
                              <SelectItem value="28">28%</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                </TabsContent>
              </Tabs>
            </div>
            <DialogFooter className="bg-slate-50 p-6 mt-6 border-t flex justify-end gap-3">
              <Button 
                type="button" 
                variant="outline"
                onClick={(e) => handleFormSubmit(e, true)}
                className="px-6"
              >
                Save & New {/* Updated button text */}
              </Button>
              <Button 
                type="submit"
                className="px-6"
              >
                Save {/* Updated button text */}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <ItemSettingsDrawer
        open={isSettingsOpen}
        onOpenChange={setIsSettingsOpen}
        settings={itemSettings}
        onSettingsChange={setItemSettings}
      />
      <SelectUnitDialog
        open={isUnitDialogOpen}
        onClose={() => setIsUnitDialogOpen(false)}
        onSave={(unit) => handleChange('unit', unit)}
        currentUnit={formData.unit}
      />
    </>
  );
}
