import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Barcode, Upload, Download, Repeat, Calendar } from "lucide-react";
import { Product } from '@/api/entities';
import BarcodeGeneratorDialog from '@/components/products/BarcodeGeneratorDialog';

const UtilityCard = ({ icon: Icon, title, description, onClick }) => (
  <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={onClick}>
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className="w-4 h-4 text-slate-500" />
    </CardHeader>
    <CardContent>
      <p className="text-xs text-slate-500">{description}</p>
    </CardContent>
  </Card>
);

export default function Utilities() {
  const [products, setProducts] = useState([]);
  const [isBarcodeDialogOpen, setIsBarcodeDialogOpen] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const productList = await Product.list();
        setProducts(productList);
      } catch (error) {
        console.error("Failed to fetch products for utilities:", error);
      }
    };
    fetchProducts();
  }, []);

  const handleUtilityClick = (title) => {
    if (title === "Generate Barcodes") {
      setIsBarcodeDialogOpen(true);
    } else {
      alert(`The "${title}" utility is not yet implemented.`);
    }
  };

  const utilities = [
    { icon: Barcode, title: "Generate Barcodes", description: "Create and print barcodes for your products." },
    { icon: Repeat, title: "Bulk Update Items", description: "Update product pricing and details in bulk." },
    { icon: Upload, title: "Import Parties", description: "Import customers and vendors from a CSV file." },
    { icon: Download, title: "Export Data", description: "Export your business data to CSV or PDF." },
    { icon: Calendar, title: "Financial Year", description: "Manage and close financial years." },
  ];

  return (
    <>
      <BarcodeGeneratorDialog 
        open={isBarcodeDialogOpen}
        onClose={() => setIsBarcodeDialogOpen(false)}
        products={products}
      />
      <div className="p-6 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
       <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">Utilities</h1>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {utilities.map(util => (
            <UtilityCard 
              key={util.title}
              {...util}
              onClick={() => handleUtilityClick(util.title)}
            />
          ))}
        </div>
      </div>
    </div>
    </>
  );
}