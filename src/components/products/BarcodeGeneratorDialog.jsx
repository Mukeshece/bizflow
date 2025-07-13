
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, Printer, Eye } from "lucide-react";

export default function BarcodeGeneratorDialog({ open, onClose, products }) {
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [barcodeSettings, setBarcodeSettings] = useState({
    format: 'CODE128',
    width: 2,
    height: 100,
    displayValue: true,
    fontSize: 12,
    margin: 10,
    copies: 1
  });

  const handleProductSelect = (productId, checked) => {
    if (checked) {
      setSelectedProducts(prev => [...prev, productId]);
    } else {
      setSelectedProducts(prev => prev.filter(id => id !== productId));
    }
  };

  const generateBarcode = (text, settings) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Simple barcode generation (placeholder - in real app would use JsBarcode library)
    canvas.width = settings.width * 50;
    canvas.height = settings.height;
    
    ctx.fillStyle = '#000';
    
    // Generate simple bars pattern
    for (let i = 0; i < text.length; i++) {
      const charCode = text.charCodeAt(i) % 10;
      for (let j = 0; j < charCode; j++) {
        if ((i + j) % 2 === 0) {
          ctx.fillRect((i * 4 + j) * settings.width, 0, settings.width, settings.height - 20);
        }
      }
    }
    
    // Add text if enabled
    if (settings.displayValue) {
      ctx.fillStyle = '#000';
      ctx.font = `${settings.fontSize}px Arial`;
      ctx.textAlign = 'center';
      ctx.fillText(text, canvas.width / 2, canvas.height - 5);
    }
    
    return canvas.toDataURL();
  };

  const handlePreview = () => {
    const selectedProductData = products.filter(p => selectedProducts.includes(p.id));
    const printWindow = window.open('', '_blank');
    const barcodes = selectedProductData.map(product => ({
      ...product,
      barcodeImage: generateBarcode(product.item_code, barcodeSettings)
    }));

    printWindow.document.write(`
      <html>
        <head>
          <title>Barcode Preview</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .barcode-container { 
              display: grid; 
              grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); 
              gap: 20px; 
              margin: 20px 0; 
            }
            .barcode-item { 
              border: 1px solid #ddd; 
              padding: 10px; 
              text-align: center; 
              border-radius: 8px;
            }
            .barcode-item img { max-width: 100%; }
            .product-name { font-weight: bold; margin-bottom: 5px; }
            .product-code { font-size: 12px; color: #666; }
            @media print {
              .no-print { display: none; }
              .barcode-container { grid-template-columns: repeat(3, 1fr); }
            }
          </style>
        </head>
        <body>
          <div class="no-print">
            <h2>Barcode Preview</h2>
            <button onclick="window.print()">Print Barcodes</button>
            <button onclick="window.close()">Close</button>
          </div>
          <div class="barcode-container">
            ${barcodes.map(product => `
              <div class="barcode-item">
                <div class="product-name">${product.name}</div>
                <img src="${product.barcodeImage}" alt="Barcode for ${product.item_code}" />
                <div class="product-code">${product.item_code}</div>
                <div>₹${product.b2c_rate?.toFixed(2) || '0.00'}</div>
              </div>
            `).join('')}
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handlePrint = () => {
    handlePreview();
  };

  const handleDownload = () => {
    const selectedProductData = products.filter(p => selectedProducts.includes(p.id));
    
    // Create ZIP file with all barcodes (simplified approach)
    const barcodes = selectedProductData.map(product => ({
      name: `${product.name}_${product.item_code}.png`,
      data: generateBarcode(product.item_code, barcodeSettings)
    }));

    // For demo purposes, download first barcode
    if (barcodes.length > 0) {
      const link = document.createElement('a');
      link.download = barcodes[0].name;
      link.href = barcodes[0].data;
      link.click();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl">
        <style>{`
            [role='dialog'] > button.absolute {
                display: none;
            }
        `}</style>
        <DialogHeader>
          <DialogTitle>Generate Barcodes</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Product Selection */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Select Products</h3>
            <div className="max-h-64 overflow-y-auto border rounded-lg p-4">
              {products.map(product => (
                <div key={product.id} className="flex items-center space-x-2 mb-2">
                  <Checkbox
                    id={`product-${product.id}`}
                    checked={selectedProducts.includes(product.id)}
                    onCheckedChange={(checked) => handleProductSelect(product.id, checked)}
                  />
                  <Label htmlFor={`product-${product.id}`} className="flex-1">
                    <div className="font-medium">{product.name}</div>
                    <div className="text-xs text-gray-500">{product.item_code}</div>
                  </Label>
                </div>
              ))}
            </div>
            <Button 
              variant="outline" 
              className="w-full mt-2"
              onClick={() => setSelectedProducts(products.map(p => p.id))}
            >
              Select All
            </Button>
          </div>

          {/* Barcode Settings */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Barcode Settings</h3>
            <div className="space-y-4">
              <div>
                <Label>Barcode Format</Label>
                <Select value={barcodeSettings.format} onValueChange={(value) => setBarcodeSettings(prev => ({...prev, format: value}))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CODE128">Code 128</SelectItem>
                    <SelectItem value="CODE39">Code 39</SelectItem>
                    <SelectItem value="EAN13">EAN-13</SelectItem>
                    <SelectItem value="UPC">UPC</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Width</Label>
                  <Input 
                    type="number" 
                    value={barcodeSettings.width}
                    onChange={(e) => setBarcodeSettings(prev => ({...prev, width: parseInt(e.target.value)}))}
                  />
                </div>
                <div>
                  <Label>Height</Label>
                  <Input 
                    type="number" 
                    value={barcodeSettings.height}
                    onChange={(e) => setBarcodeSettings(prev => ({...prev, height: parseInt(e.target.value)}))}
                  />
                </div>
              </div>

              <div>
                <Label>Font Size</Label>
                <Input 
                  type="number" 
                  value={barcodeSettings.fontSize}
                  onChange={(e) => setBarcodeSettings(prev => ({...prev, fontSize: parseInt(e.target.value)}))}
                />
              </div>

              <div>
                <Label>Copies per Product</Label>
                <Input 
                  type="number" 
                  value={barcodeSettings.copies}
                  onChange={(e) => setBarcodeSettings(prev => ({...prev, copies: parseInt(e.target.value)}))}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="display-value"
                  checked={barcodeSettings.displayValue}
                  onCheckedChange={(checked) => setBarcodeSettings(prev => ({...prev, displayValue: checked}))}
                />
                <Label htmlFor="display-value">Show barcode text</Label>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="outline" onClick={handlePreview} disabled={selectedProducts.length === 0}>
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </Button>
          <Button variant="outline" onClick={handleDownload} disabled={selectedProducts.length === 0}>
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
          <Button onClick={handlePrint} disabled={selectedProducts.length === 0}>
            <Printer className="w-4 h-4 mr-2" />
            Print
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
