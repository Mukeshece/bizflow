import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import BarcodeScanner from './BarcodeScanner';
import { ScanLine } from 'lucide-react';

export function BarcodeScannerDialog({ open, onClose, onScan }) {
  const [manualBarcode, setManualBarcode] = useState("");

  const handleManualSubmit = () => {
    if (manualBarcode.trim()) {
      onScan(manualBarcode.trim());
      setManualBarcode("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ScanLine className="w-6 h-6" />
            Scan Item Barcode
          </DialogTitle>
          <DialogDescription>
            Point the camera at a barcode or enter it manually below. The item will be added to your invoice.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <div className="w-full h-64 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
            {open && <BarcodeScanner onScan={onScan} />}
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm text-center text-gray-500">Or enter manually</p>
          <div className="flex gap-2">
            <Input 
              placeholder="Enter barcode..."
              value={manualBarcode}
              onChange={(e) => setManualBarcode(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleManualSubmit()}
            />
            <Button onClick={handleManualSubmit}>Add</Button>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default BarcodeScannerDialog;