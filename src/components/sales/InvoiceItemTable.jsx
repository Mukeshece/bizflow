
import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";

export default function InvoiceItemTable({ items = [], products = [], onItemsChange, invoiceType = "B2C", theme = "retail" }) {
  // Ensure items and products are always arrays to prevent Symbol.iterator errors
  const safeItems = Array.isArray(items) ? items.filter(item => item != null) : [];
  const safeProducts = Array.isArray(products) ? products.filter(product => product != null) : [];

  const defaultItem = {
    product_id: "",
    product_name: "",
    quantity: 1,
    rate: 0,
    discount: 0,
    gst_rate: 18,
    total: 0,
    design_no: "",
    color: "",
    size: "",
    batch_no: "",
    expiry_date: "",
    serial_no: "",
    warranty: "",
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...safeItems];
    // Initialize itemToUpdate with default values if it doesn't exist
    const itemToUpdate = newItems[index] ? { ...newItems[index] } : { ...defaultItem };

    itemToUpdate[field] = value;

    // Logic for when a product is selected from the list (by product_id)
    if (field === "product_id" && value) {
      const product = safeProducts.find(p => p && p.id === value);
      if (product) {
        itemToUpdate.product_name = product.name || '';
        itemToUpdate.rate = invoiceType === "B2B" ? (Number(product.b2b_rate) || 0) : (Number(product.b2c_rate) || 0);
        itemToUpdate.gst_rate = Number(product.gst_rate) || 18; // Use product's GST rate, default to 18
        // Add theme-specific fields
        itemToUpdate.design_no = product.design_no || '';
        itemToUpdate.color = product.color || '';
        itemToUpdate.size = product.size || '';
        itemToUpdate.batch_no = product.batch_no || '';
        itemToUpdate.expiry_date = product.expiry_date || ''; // Assuming product.expiry_date is a string
        itemToUpdate.serial_no = product.serial_no || '';
        itemToUpdate.warranty = product.warranty || '';
      } else {
        // If product not found, reset related fields (but keep the original theme-specific values if they were manually entered)
        itemToUpdate.product_name = "";
        itemToUpdate.rate = 0;
        // The other theme-specific fields will retain their current values if not explicitly set by product selection
      }
    }
    
    // Recalculate total for the row based on new values
    const quantity = parseFloat(itemToUpdate.quantity) || 0;
    const rate = parseFloat(itemToUpdate.rate) || 0;
    const discount = parseFloat(itemToUpdate.discount) || 0;
    const gstRate = parseFloat(itemToUpdate.gst_rate) || 0;

    const basePrice = quantity * rate;
    const discountedPrice = basePrice * (1 - (discount / 100));
    const gstAmount = discountedPrice * (gstRate / 100);
    itemToUpdate.total = discountedPrice + gstAmount;

    newItems[index] = itemToUpdate;

    // Call the parent handler to update the state
    if (typeof onItemsChange === 'function') {
      onItemsChange(newItems);
    }
  };

  const addRow = () => {
    if (typeof onItemsChange === 'function') {
      onItemsChange([
        ...safeItems,
        { ...defaultItem }
      ]);
    }
  };

  const removeItem = (index) => {
    const newItems = safeItems.filter((_, i) => i !== index);
    if (typeof onItemsChange === 'function') {
      onItemsChange(newItems);
    }
  };
  
  const TextileColumns = () => (
    <>
      <TableHead>Design No.</TableHead>
      <TableHead>Color</TableHead>
      <TableHead>Size</TableHead>
    </>
  );

  const PharmaColumns = () => (
    <>
      <TableHead>Batch No.</TableHead>
      <TableHead>Expiry</TableHead>
    </>
  );
  
  const ElectronicsColumns = () => (
    <>
      <TableHead>Serial No.</TableHead>
      <TableHead>Warranty</TableHead>
    </>
  );

  const renderThemeColumns = (currentTheme) => {
    switch(currentTheme) {
      case 'textile': return <TextileColumns />;
      case 'pharma': return <PharmaColumns />;
      case 'electronics': return <ElectronicsColumns />;
      default: return null;
    }
  };

  const TextileCells = ({ item, index }) => (
    <>
      <TableCell>
        <Input value={item.design_no || ''} onChange={e => handleItemChange(index, 'design_no', e.target.value)} placeholder="Design" />
      </TableCell>
      <TableCell>
        <Input value={item.color || ''} onChange={e => handleItemChange(index, 'color', e.target.value)} placeholder="Color" />
      </TableCell>
      <TableCell>
        <Input value={item.size || ''} onChange={e => handleItemChange(index, 'size', e.target.value)} placeholder="Size" />
      </TableCell>
    </>
  );
  
  const PharmaCells = ({ item, index }) => (
    <>
      <TableCell>
        <Input value={item.batch_no || ''} onChange={e => handleItemChange(index, 'batch_no', e.target.value)} placeholder="Batch" />
      </TableCell>
      <TableCell>
        <Input type="date" value={item.expiry_date || ''} onChange={e => handleItemChange(index, 'expiry_date', e.target.value)} />
      </TableCell>
    </>
  );

  const ElectronicsCells = ({ item, index }) => (
    <>
      <TableCell>
        <Input value={item.serial_no || ''} onChange={e => handleItemChange(index, 'serial_no', e.target.value)} placeholder="Serial" />
      </TableCell>
      <TableCell>
        <Input value={item.warranty || ''} onChange={e => handleItemChange(index, 'warranty', e.target.value)} placeholder="Warranty" />
      </TableCell>
    </>
  );

  const renderThemeCells = (currentTheme, item, index) => {
    switch(currentTheme) {
      case 'textile': return <TextileCells item={item} index={index} />;
      case 'pharma': return <PharmaCells item={item} index={index} />;
      case 'electronics': return <ElectronicsCells item={item} index={index} />;
      default: return null;
    }
  };

  // Calculate colSpan dynamically based on theme
  const getColSpan = (currentTheme) => {
    switch (currentTheme) {
      case 'retail':
        return 7; // Product, Qty, Rate, Discount, GST, Total, Delete
      case 'textile':
        return 10; // Product, Design No, Color, Size, Qty, Rate, Discount, GST, Total, Delete
      case 'pharma':
      case 'electronics':
        return 9; // Product, +2 theme-specific, Qty, Rate, Discount, GST, Total, Delete
      default:
        return 7; // Fallback to retail
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold">Items</h3>
        <Button size="sm" onClick={addRow}>
          <Plus className="w-4 h-4 mr-2" /> Add Item
        </Button>
      </div>
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-2/5">Product</TableHead>
              {renderThemeColumns(theme)}
              <TableHead>Qty</TableHead>
              <TableHead>Rate</TableHead>
              <TableHead>Discount %</TableHead>
              <TableHead>GST %</TableHead>
              <TableHead>Total</TableHead>
              <TableHead></TableHead> {/* For delete button */}
            </TableRow>
          </TableHeader>
          <TableBody>
            {safeItems.length > 0 ? safeItems.map((item, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Popover>
                    <PopoverTrigger asChild>
                      {/* Input for product name, allows typing and triggers product search */}
                      <Input 
                        value={item.product_name || ''} 
                        onChange={e => handleItemChange(index, 'product_name', e.target.value)}
                        placeholder="Select or type product"
                      />
                    </PopoverTrigger>
                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                      <Command>
                        <CommandInput placeholder="Search product..." />
                        <CommandList>
                          <CommandEmpty>No product found.</CommandEmpty>
                          <CommandGroup>
                            {safeProducts.map((product) => (
                              <CommandItem
                                key={product.id}
                                value={product.name}
                                onSelect={() => {
                                  // When a product is selected, update product_id to trigger product data load
                                  handleItemChange(index, 'product_id', product.id);
                                }}
                              >
                                {product.name}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </TableCell>
                {renderThemeCells(theme, item, index)}
                <TableCell>
                  <Input 
                    type="number" 
                    value={item.quantity || 0} 
                    onChange={e => handleItemChange(index, 'quantity', parseFloat(e.target.value) || 0)} 
                    className="w-16" 
                  />
                </TableCell>
                <TableCell>
                  <Input 
                    type="number" 
                    value={item.rate || 0} 
                    onChange={e => handleItemChange(index, 'rate', parseFloat(e.target.value) || 0)} 
                    className="w-24" 
                  />
                </TableCell>
                <TableCell>
                  <Input 
                    type="number" 
                    value={item.discount || 0} 
                    onChange={e => handleItemChange(index, 'discount', parseFloat(e.target.value) || 0)} 
                    className="w-16" 
                  />
                </TableCell>
                <TableCell>
                  <Input 
                    type="number" 
                    value={item.gst_rate || 0} 
                    onChange={e => handleItemChange(index, 'gst_rate', parseFloat(e.target.value) || 0)} 
                    className="w-16" 
                  />
                </TableCell>
                <TableCell>₹{(item.total || 0).toFixed(2)}</TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon" onClick={() => removeItem(index)}>
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={getColSpan(theme)} className="text-center py-4 text-gray-500">
                  No items added yet. Click "Add Item" to get started.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
