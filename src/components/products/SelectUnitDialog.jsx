import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const unitOptions = [
    { value: 'pcs', label: 'PIECES (Pcs)' },
    { value: 'box', label: 'BOX (Box)' },
    { value: 'kg', label: 'KILOGRAMS (Kg)' },
    { value: 'mtr', label: 'METERS (Mtr)' },
    { value: 'ltr', label: 'LITERS (Ltr)' },
    { value: 'bundle', label: 'BUNDLE (Bdl)' },
];

export default function SelectUnitDialog({ open, onClose, onSave, currentUnit }) {
    const [baseUnit, setBaseUnit] = useState(currentUnit || 'pcs');
    const [secondaryUnit, setSecondaryUnit] = useState('none');

    const handleSave = () => {
        onSave(baseUnit);
        onClose();
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Select Unit</DialogTitle>
                </DialogHeader>
                <div className="py-4 space-y-4">
                    <div>
                        <Label htmlFor="base-unit">Base Unit</Label>
                        <Select value={baseUnit} onValueChange={setBaseUnit}>
                            <SelectTrigger id="base-unit">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {unitOptions.map(opt => (
                                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label htmlFor="secondary-unit">Secondary Unit</Label>
                        <Select value={secondaryUnit} onValueChange={setSecondaryUnit}>
                            <SelectTrigger id="secondary-unit">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">None</SelectItem>
                                {unitOptions.map(opt => (
                                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSave}>Save</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}