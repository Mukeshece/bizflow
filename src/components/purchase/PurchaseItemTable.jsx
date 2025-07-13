import React, { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2, Plus } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function PurchaseItemTable({ items = [], products = [], onItemsChange }) {
  const [openPopovers, setOpenPopovers] = useState({});

  const productList = Array.isArray(products) ? products : [];

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    const itemToUpdate = newItems[index] ? { ...newItems[index] } : { product_id: "", product_name: "", quantity: 1, unit: 'pcs', rate: 0, total: 0 };
    
    itemToUpdate[field] = value;

    if (field === 'product_id' && value) {
      const product = productList.find(p => p.id === value);
      if (product) {
        itemToUpdate.product_name = product.name;
        itemToUpdate.rate = product.purchase_rate || 0;
        itemToUpdate.unit = product.unit || 'pcs';
        itemToUpdate.quantity = itemToUpdate.quantity === undefined ? 1 : itemToUpdate.quantity;
      }
      setOpenPopovers(prev => ({...prev, [index]: false}));
    }
    
    if (field === 'quantity' || field === 'rate' || field === 'product_id') {
        const qty = Number(itemToUpdate.quantity) || 0;
        const rate = Number(itemToUpdate.rate) || 0;
        itemToUpdate.total = qty * rate;
    }
    
    newItems[index] = itemToUpdate;
    onItemsChange(newItems);
  };
  
  const addItem = () => {
    onItemsChange([
      ...items,
      { product_id: "", product_name: "", quantity: 1, unit: 'pcs', rate: 0, total: 0 }
    ]);
  };

  const removeItem = (index) => {
    onItemsChange(items.filter((_, i) => i !== index));
  };
  
  return (
    <div className="space-y-4">
      <div className="border rounded-lg">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="w-12">#</TableHead>
              <TableHead className="w-2/5">ITEM</TableHead>
              <TableHead>QTY</TableHead>
              <TableHead>UNIT</TableHead>
              <TableHead>PRICE/UNIT</TableHead>
              <TableHead className="text-right">AMOUNT</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.isArray(items) && items.length > 0 ? items.map((item, index) => (
              <TableRow key={index}>
                <TableCell className="text-slate-500">{index + 1}</TableCell>
                <TableCell>
                  <Popover
                    open={openPopovers[index] || false}
                    onOpenChange={(isOpen) => setOpenPopovers(prev => ({...prev, [index]: isOpen}))}
                  >
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full text-left font-normal justify-start pr-8">
                        {item.product_name || "Select product"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[300px] p-0">
                      <Command>
                        <CommandInput placeholder="Search product..." />
                        <CommandList>
                            <CommandEmpty>No product found.</CommandEmpty>
                            <CommandGroup>
                            {productList.map((product) => (
                                <CommandItem
                                key={product.id}
                                value={product.name}
                                onSelect={() => handleItemChange(index, 'product_id', product.id)}
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
                <TableCell>
                  <Input 
                    type="number" 
                    value={item.quantity || 1} 
                    onChange={e => handleItemChange(index, 'quantity', e.target.value)} 
                    className="w-20" 
                  />
                </TableCell>
                <TableCell>
                  <Select value={item.unit || 'pcs'} onValueChange={val => handleItemChange(index, 'unit', val)}>
                    <SelectTrigger className="w-24">
                        <SelectValue/>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="pcs">pcs</SelectItem>
                        <SelectItem value="bundle">bundle</SelectItem>
                        <SelectItem value="kg">kg</SelectItem>
                        <SelectItem value="ltr">ltr</SelectItem>
                        <SelectItem value="mtr">mtr</SelectItem>
                        <SelectItem value="sqft">sqft</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Input 
                    type="number" 
                    value={item.rate || 0} 
                    onChange={e => handleItemChange(index, 'rate', e.target.value)} 
                    className="w-24" 
                  />
                </TableCell>
                <TableCell className="text-right font-medium">₹{(item.total || 0).toFixed(2)}</TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon" onClick={() => removeItem(index)}>
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-4 text-gray-500">
                  No items added yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <Button variant="link" onClick={addItem} className="text-blue-600"><Plus className="w-4 h-4 mr-2" /> ADD ROW</Button>
    </div>
  );
}