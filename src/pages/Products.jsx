import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Filter, MoreVertical, Edit, Settings, Trash2, BarChart3, Package } from "lucide-react";
import { Product } from "@/api/entities";
import AddEditProductDialog from "../components/products/AddEditProductDialog";
import ProductTransactions from "../components/products/ProductTransactions";
import BarcodeGeneratorDialog from "../components/products/BarcodeGeneratorDialog";
import AdjustStockDialog from "../components/products/AdjustStockDialog";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showBarcodeDialog, setShowBarcodeDialog] = useState(false);
  const [showAdjustStockDialog, setShowAdjustStockDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setIsLoading(true);
    try {
      const data = await Product.list('-created_date');
      const safeData = Array.isArray(data) ? data : [];
      setProducts(safeData);

      if (selectedProduct) {
        const refreshedProduct = safeData.find(p => p.id === selectedProduct.id);
        setSelectedProduct(refreshedProduct || (safeData.length > 0 ? safeData[0] : null));
      } else if (safeData.length > 0) {
        setSelectedProduct(safeData[0]);
      } else {
        setSelectedProduct(null);
      }
    } catch (error) {
      console.error("Error loading products:", error);
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setShowAddDialog(true);
  };

  const handleDelete = async (product) => {
    if (confirm(`Are you sure you want to delete "${product.name}"?`)) {
      try {
        await Product.delete(product.id);
        
        if (selectedProduct?.id === product.id) {
          const remainingProducts = products.filter(p => p.id !== product.id);
          setSelectedProduct(remainingProducts[0] || null);
        }
        await loadProducts();
      } catch (error) {
        console.error("Error deleting product:", error);
      }
    }
  };

  const handleAddNew = () => {
    setEditingProduct(null);
    setShowAddDialog(true);
  };
  
  const handleSubmit = async (productData) => {
    try {
      if (editingProduct) {
        await Product.update(editingProduct.id, productData);
      } else {
        await Product.create(productData);
      }
      // The dialog will handle its own closing/resetting state.
      // We just need to reload the products.
      loadProducts();
    } catch (error) {
      console.error("Error saving product:", error);
    }
  };

  const handleGenerateBarcode = (product) => {
    setSelectedProduct(product);
    setShowBarcodeDialog(true);
  };
  
  const handleAdjustStock = async ({ adjustment_type, quantity }) => {
    if (!selectedProduct) return;

    const currentStock = selectedProduct.current_stock || 0;
    const adjustmentQty = Number(quantity);

    let newStock = adjustment_type === 'add' ? currentStock + adjustmentQty : currentStock - adjustmentQty;

    if (newStock < 0) {
      alert("Stock cannot be negative.");
      return;
    }

    try {
      await Product.update(selectedProduct.id, { current_stock: newStock });
      setShowAdjustStockDialog(false);
      loadProducts();
    } catch (error) {
      console.error("Error adjusting stock:", error);
    }
  };

  const filteredProducts = useMemo(() => {
    if (!Array.isArray(products)) return [];
    return products.filter(product => {
      if (!product) return false;
      
      const productName = (product.name || '').toString();
      const itemCode = (product.item_code || '').toString();
      const category = (product.category || '').toString();
      const currentStock = Number(product.current_stock) || 0;
      const minStock = Number(product.min_stock) || 0;
      
      const searchTerm = (searchQuery || '').toLowerCase();

      const matchesSearch = 
        productName.toLowerCase().includes(searchTerm) ||
        itemCode.toLowerCase().includes(searchTerm);
      
      const matchesCategory = categoryFilter === "all" || category.toLowerCase() === categoryFilter.toLowerCase();
      
      let matchesStock = true;
      if (stockFilter === "low") {
        matchesStock = currentStock <= minStock && currentStock > 0;
      } else if (stockFilter === "out") {
        matchesStock = currentStock === 0;
      }
      
      return matchesSearch && matchesCategory && matchesStock;
    });
  }, [products, searchQuery, categoryFilter, stockFilter]);
  
  const productTransactions = useMemo(() => {
    if (!selectedProduct) return [];
    return [];
  }, [selectedProduct]);

  const stockValue = selectedProduct ? ((selectedProduct.current_stock || 0) * (selectedProduct.purchase_rate || 0)).toFixed(2) : '0.00';
  
  const lowStockCount = useMemo(() => {
    if (!Array.isArray(products)) return 0;
    return products.filter(p => p && (p.current_stock || 0) <= (p.min_stock || 0) && (p.current_stock || 0) > 0).length;
  }, [products]);

  const uniqueCategories = useMemo(() => {
    const categories = new Set();
    if (Array.isArray(products)) {
      products.forEach(p => {
        if (p.category) categories.add(p.category);
      });
    }
    return ['all', ...Array.from(categories).sort()];
  }, [products]);

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Left Sidebar */}
      <div className="w-80 border-r flex flex-col">
        <div className="p-3 border-b">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
              <Input 
                placeholder="Search products..." 
                className="pl-9" 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            <Button onClick={handleAddNew} className="bg-orange-500 hover:bg-orange-600">
              <Plus className="w-4 h-4 mr-2" /> Add
            </Button>
          </div>
        </div>
        
        {/* Stats and Filters */}
        <div className="p-3 border-b bg-slate-100 flex flex-col gap-2">
          <div className="flex justify-between text-xs">
            <span>Total Products: {Array.isArray(products) ? products.length : 0}</span>
            {lowStockCount > 0 && (
              <Badge variant="destructive" className="text-xs">
                Low Stock: {lowStockCount}
              </Badge>
            )}
          </div>
          <div className="flex justify-between items-center text-xs">
            <label htmlFor="category-filter" className="sr-only">Filter by Category</label>
            <select
              id="category-filter"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-2 py-1 border rounded-md text-sm bg-white"
            >
              {uniqueCategories.map(cat => (
                <option key={cat} value={cat}>{cat === 'all' ? 'All Categories' : cat}</option>
              ))}
            </select>
            <label htmlFor="stock-filter" className="sr-only">Filter by Stock</label>
            <select
              id="stock-filter"
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
              className="px-2 py-1 border rounded-md text-sm bg-white"
            >
              <option value="all">All Stock</option>
              <option value="low">Low Stock</option>
              <option value="out">Out of Stock</option>
            </select>
          </div>
        </div>


        <div className="p-3 border-b flex justify-between items-center text-xs font-semibold text-slate-600">
          <div className="flex items-center gap-1">
            <span>ITEM</span>
          </div>
          <span>STOCK</span>
        </div>
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="p-3 space-y-2">
              {[...Array(10)].map((_, i) => <div key={i} className="h-12 bg-slate-200 rounded animate-pulse" />)}
            </div>
          ) : (
            filteredProducts.map(p => (
              <div 
                key={p.id}
                className={`flex items-center p-3 hover:bg-blue-50 cursor-pointer border-b group ${selectedProduct?.id === p.id ? 'bg-blue-100 border-l-4 border-l-blue-500' : ''}`}
                onClick={() => setSelectedProduct(p)}
              >
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">{p.name}</div>
                  <div className="text-xs text-slate-500 truncate">{p.item_code}</div>
                </div>
                <div className="text-right ml-2 pr-2">
                  <span className={`font-semibold text-sm ${(p.current_stock || 0) <= (p.min_stock || 0) && (p.current_stock || 0) > 0 ? 'text-orange-500' : (p.current_stock || 0) === 0 ? 'text-red-500' : 'text-green-600'}`}>
                    {p.current_stock || 0}
                  </span>
                  <div className="text-xs text-slate-500">{p.unit || 'pcs'}</div>
                </div>
                 <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="w-8 h-8" onClick={(e) => e.stopPropagation()}>
                                <MoreVertical className="w-4 h-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleEdit(p); }}>
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleDelete(p); }} className="text-red-600">
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col bg-slate-100 min-w-[900px]">
        {selectedProduct ? (
            <>
                <div className="p-6 border-b bg-white flex justify-between items-center">
                    <div className="flex items-center gap-6">
                        <div className="w-24 h-24 bg-slate-100 rounded-lg flex items-center justify-center overflow-hidden border">
                            {selectedProduct.image_url ? (
                                <img src={selectedProduct.image_url} alt={selectedProduct.name} className="w-full h-full object-cover" />
                            ) : (
                                <Package className="w-12 h-12 text-slate-400" />
                            )}
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold">{selectedProduct.name}</h2>
                            <p className="text-base text-slate-500 mt-1">{selectedProduct.category || 'Uncategorized'}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="outline" onClick={() => setShowAdjustStockDialog(true)} className="px-6 py-2.5">
                          <Settings className="w-4 h-4 mr-2" />
                          Adjust Stock
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="w-10 h-10">
                              <MoreVertical className="w-5 h-5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => handleEdit(selectedProduct)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit Product
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleGenerateBarcode(selectedProduct)}>
                              <BarChart3 className="w-4 h-4 mr-2" />
                              Generate Barcode
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDelete(selectedProduct)} className="text-red-600">
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete Product
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card>
                            <CardHeader><CardTitle className="text-lg">Pricing</CardTitle></CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex justify-between items-center"><span className="text-base">Purchase Price</span><span className="font-semibold text-lg">₹ {(selectedProduct.purchase_rate || 0).toFixed(2)}</span></div>
                                <div className="flex justify-between items-center"><span className="text-base">B2C Sale Price</span><span className="font-semibold text-lg text-green-600">₹ {(selectedProduct.b2c_rate || 0).toFixed(2)}</span></div>
                                <div className="flex justify-between items-center"><span className="text-base">B2B Sale Price</span><span className="font-semibold text-lg text-blue-600">₹ {(selectedProduct.b2b_rate || 0).toFixed(2)}</span></div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader><CardTitle className="text-lg">Stock Information</CardTitle></CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex justify-between items-center"><span className="text-base">Stock Quantity</span><span className="font-semibold text-lg">{selectedProduct.current_stock || 0} {selectedProduct.unit || 'pcs'}</span></div>
                                <div className="flex justify-between items-center"><span className="text-base">Min. Stock Level</span><span className="font-semibold text-lg">{selectedProduct.min_stock || 0} {selectedProduct.unit || 'pcs'}</span></div>
                                <div className="flex justify-between items-center"><span className="text-base">Stock Value</span><span className="font-semibold text-lg">₹ {stockValue}</span></div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader><CardTitle className="text-lg">Details</CardTitle></CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex justify-between items-center"><span className="text-base">Item Code</span><span className="font-mono text-base">{selectedProduct.item_code || 'N/A'}</span></div>
                                <div className="flex justify-between items-center"><span className="text-base">HSN Code</span><span className="font-mono text-base">{selectedProduct.hsn_code || 'N/A'}</span></div>
                                <div className="flex justify-between items-center"><span className="text-base">GST Rate</span><span className="font-semibold text-lg">{selectedProduct.gst_rate || 0}%</span></div>
                            </CardContent>
                        </Card>
                    </div>

                    <ProductTransactions transactions={productTransactions} />
                </div>
            </>
        ) : (
            <div className="h-full flex items-center justify-center text-slate-500 text-lg">
              Select a product to see its details or add a new one.
            </div>
        )}
      </div>

      <AddEditProductDialog
        open={showAddDialog}
        onClose={() => setShowAddDialog(false)}
        onSubmit={handleSubmit}
        product={editingProduct}
      />

      <BarcodeGeneratorDialog
        open={showBarcodeDialog}
        onClose={() => setShowBarcodeDialog(false)}
        products={selectedProduct ? [selectedProduct] : (Array.isArray(products) ? products : [])}
      />
      
      <AdjustStockDialog
        open={showAdjustStockDialog}
        onClose={() => setShowAdjustStockDialog(false)}
        onSubmit={handleAdjustStock}
        product={selectedProduct}
      />
    </div>
  );
}