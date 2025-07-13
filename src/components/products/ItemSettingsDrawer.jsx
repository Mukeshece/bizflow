import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const SettingRow = ({ id, label, checked, onCheckedChange }) => (
  <div className="flex items-center justify-between py-3">
    <Label htmlFor={id} className="text-sm font-normal">{label}</Label>
    <Checkbox id={id} checked={checked} onCheckedChange={onCheckedChange} />
  </div>
);

const LinkRow = ({ label, onClick }) => (
  <button onClick={onClick} className="w-full flex items-center justify-between py-3 text-left">
    <span className="text-sm font-normal">{label}</span>
    <ChevronRight className="w-4 h-4 text-gray-400" />
  </button>
)

export default function ItemSettingsDrawer({ open, onOpenChange, settings, onSettingsChange }) {
  const navigate = useNavigate();

  const handleSettingChange = (key, value) => {
    onSettingsChange(prev => ({ ...prev, [key]: value }));
  };

  const goToMoreSettings = () => {
    onOpenChange(false);
    navigate(createPageUrl('Settings'));
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Item Settings</SheetTitle>
          <SheetDescription>
            Customize the fields displayed in the item form.
          </SheetDescription>
        </SheetHeader>
        <div className="py-4 flex flex-col h-full">
            <div className='flex-1'>
                <LinkRow label="Additional Item Fields" onClick={goToMoreSettings} />
                <Separator />
                <LinkRow label="Item Custom Fields" onClick={goToMoreSettings} />
                <Separator />
                <SettingRow
                    id="wholesale-price"
                    label="Wholesale Price"
                    checked={settings.item_enable_wholesale_price}
                    onCheckedChange={(checked) => handleSettingChange('item_enable_wholesale_price', checked)}
                />
                <Separator />
                <SettingRow
                    id="barcode-scan"
                    label="Barcode Scan"
                    checked={settings.item_enable_barcode_scan}
                    onCheckedChange={(checked) => handleSettingChange('item_enable_barcode_scan', checked)}
                />
                <Separator />
                <SettingRow
                    id="item-category"
                    label="Item Category"
                    checked={settings.item_show_category}
                    onCheckedChange={(checked) => handleSettingChange('item_show_category', checked)}
                />
                <Separator />
                <SettingRow
                    id="description"
                    label="Description"
                    checked={settings.item_show_description}
                    onCheckedChange={(checked) => handleSettingChange('item_show_description', checked)}
                />
            </div>
            <div className="mt-auto">
                <Button variant="link" onClick={goToMoreSettings} className="w-full justify-center">
                    More Settings
                </Button>
            </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}