import React, { useEffect, useRef, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Camera, X, Scan } from 'lucide-react';

export default function BarcodeScanner({ isOpen, onClose, onBarcodeDetected }) {
  const [manualBarcode, setManualBarcode] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    if (isOpen && isScanning) {
      startCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, isScanning]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment' // Use back camera if available
        } 
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Unable to access camera. Please check permissions.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const handleManualSubmit = () => {
    if (manualBarcode.trim()) {
      onBarcodeDetected(manualBarcode.trim());
      onClose();
    }
  };

  const handleClose = () => {
    stopCamera();
    setIsScanning(false);
    setManualBarcode('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Scan className="w-5 h-5" />
            Barcode Scanner
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Camera Scanner */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Camera Scanner</Label>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsScanning(!isScanning)}
              >
                <Camera className="w-4 h-4 mr-2" />
                {isScanning ? 'Stop Camera' : 'Start Camera'}
              </Button>
            </div>
            
            {isScanning && (
              <div className="relative bg-black rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-48 object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="border-2 border-red-500 w-48 h-12 rounded-lg opacity-50"></div>
                </div>
                <div className="absolute bottom-2 left-2 right-2 text-center">
                  <p className="text-white text-sm bg-black/50 rounded px-2 py-1">
                    Align barcode within the red frame
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Manual Entry */}
          <div className="space-y-3">
            <Label>Manual Barcode Entry</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Enter barcode manually..."
                value={manualBarcode}
                onChange={(e) => setManualBarcode(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleManualSubmit()}
              />
              <Button onClick={handleManualSubmit} disabled={!manualBarcode.trim()}>
                Submit
              </Button>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}