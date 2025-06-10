import React, { useState } from 'react';
import { useData, Product } from '../contexts/DataContext';
import { Plus, Edit, Trash2, Package, Search, ShoppingCart } from 'lucide-react';
import ConfirmDialog from './ConfirmDialog';

export default function Inventory() {
  const { products, addProduct, updateProduct, deleteProduct, sellProduct } = useData();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sellQuantity, setSellQuantity] = useState<{ [key: string]: number }>({});
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    type?: 'warning' | 'success' | 'info';
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    type: 'warning'
  });

  const [formData, setFormData] = useState({
    name: '',
    quantity: 0,
    purchasePrice: 0,
    sellingPrice: 0,
    description: ''
  });

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct) {
      updateProduct(editingProduct.id, formData);
      setEditingProduct(null);
      setConfirmDialog({
        isOpen: true,
        title: 'نجح',
        message: 'تم تحديث المنتج بنجاح',
        onConfirm: () => setConfirmDialog(prev => ({ ...prev, isOpen: false })),
        type: 'success'
      });
    } else {
      addProduct(formData);
      setShowAddForm(false);
      setConfirmDialog({
        isOpen: true,
        title: 'نجح',
        message: 'تم إضافة المنتج بنجاح',
        onConfirm: () => setConfirmDialog(prev => ({ ...prev, isOpen: false })),
        type: 'success'
      });
    }
    setFormData({ name: '', quantity: 0, purchasePrice: 0, sellingPrice: 0, description: '' });
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      quantity: product.quantity,
      purchasePrice: product.purchasePrice,
      sellingPrice: product.sellingPrice,
      description: product.description || ''
    });
    setShowAddForm(true);
  };

  const handleDelete = (product: Product) => {
    setConfirmDialog({
      isOpen: true,
      title: 'تأكيد الحذف',
      message: `هل أنت متأكد من حذف المنتج "${product.name}"؟`,
      onConfirm: () => {
        deleteProduct(product.id);
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
      },
      type: 'warning'
    });
  };

  const handleSell = (product: Product) => {
    const quantity = sellQuantity[product.id] || 1;
    
    if (quantity > product.quantity) {
      setConfirmDialog({
        isOpen: true,
        title: 'خطأ',
        message: 'الكمية المطلوبة أكبر من المتوفر في المخزون',
        onConfirm: () => setConfirmDialog(prev => ({ ...prev, isOpen: false })),
        type: 'warning'
      });
      return;
    }

    setConfirmDialog({
      isOpen: true,
      title: 'تأكيد البيع',
      message: `هل تريد بيع ${quantity} من "${product.name}"؟\nالربح: ${((product.sellingPrice - product.purchasePrice) * quantity).toFixed(2)} دج`,
      onConfirm: () => {
        const success = sellProduct(product.id, quantity);
        if (success) {
          setSellQuantity(prev => ({ ...prev, [product.id]: 1 }));
          setConfirmDialog({
            isOpen: true,
            title: 'نجح',
            message: 'تم تسجيل البيع بنجاح',
            onConfirm: () => setConfirmDialog(prev => ({ ...prev, isOpen: false })),
            type: 'success'
          });
        }
      },
      type: 'info'
    });
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setEditingProduct(null);
    setFormData({ name: '', quantity: 0, purchasePrice: 0, sellingPrice: 0, description: '' });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'quantity' || name === 'purchasePrice' || name === 'sellingPrice' ? parseFloat(value) || 0 : value
    }));
  };

  const handleQuantityChange = (productId: string, value: number) => {
    setSellQuantity(prev => ({ ...prev, [productId]: Math.max(1, value) }));
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white">إدارة المخزون</h1>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          إضافة منتج
        </button>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="البحث في المنتجات..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pr-12 pl-4 py-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-700 text-white"
          />
        </div>
      </div>

      {showAddForm && (
        <div className="bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">
            {editingProduct ? 'تعديل المنتج' : 'إضافة منتج جديد'}
          </h2>
          
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                اسم المنتج
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-700 text-white"
                placeholder="أدخل اسم المنتج"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                الكمية
              </label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                min="0"
                required
                className="w-full px-4 py-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-700 text-white"
                placeholder="أدخل الكمية"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                سعر الشراء (دينار جزائري)
              </label>
              <input
                type="number"
                name="purchasePrice"
                value={formData.purchasePrice}
                onChange={handleChange}
                min="0"
                step="0.01"
                required
                className="w-full px-4 py-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-700 text-white"
                placeholder="أدخل سعر الشراء"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                سعر البيع (دينار جزائري)
              </label>
              <input
                type="number"
                name="sellingPrice"
                value={formData.sellingPrice}
                onChange={handleChange}
                min="0"
                step="0.01"
                required
                className="w-full px-4 py-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-700 text-white"
                placeholder="أدخل سعر البيع"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                الوصف
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-700 text-white"
                placeholder="أدخل وصف المنتج (اختياري)"
              />
            </div>

            <div className="md:col-span-2 flex gap-4">
              <button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200"
              >
                {editingProduct ? 'حفظ التغييرات' : 'إضافة المنتج'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-3 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition duration-200"
              >
                إلغاء
              </button>
            </div>
          </form>
        </div>
      )}

      {filteredProducts.length === 0 ? (
        <div className="bg-gray-800 rounded-lg shadow-md p-8 text-center">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">لا توجد منتجات</h2>
          <p className="text-gray-400">ابدأ بإضافة منتجات إلى المخزون</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map(product => (
            <div key={product.id} className="bg-gray-800 rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">{product.name}</h3>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(product)}
                    className="p-2 text-blue-400 hover:bg-blue-900/20 rounded-lg transition-colors"
                    title="تعديل"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(product)}
                    className="p-2 text-red-400 hover:bg-red-900/20 rounded-lg transition-colors"
                    title="حذف"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-2 text-sm text-gray-400 mb-4">
                <div className="flex justify-between">
                  <span>الكمية:</span>
                  <span className={`font-medium ${product.quantity < 5 ? 'text-red-400' : 'text-green-400'}`}>
                    {product.quantity}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>سعر الشراء:</span>
                  <span className="font-medium text-white">{product.purchasePrice} دج</span>
                </div>
                <div className="flex justify-between">
                  <span>سعر البيع:</span>
                  <span className="font-medium text-white">{product.sellingPrice} دج</span>
                </div>
                <div className="flex justify-between">
                  <span>الربح للوحدة:</span>
                  <span className="font-medium text-green-400">{(product.sellingPrice - product.purchasePrice).toFixed(2)} دج</span>
                </div>
              </div>

              {product.description && (
                <div className="mb-4 p-3 bg-gray-700 rounded-lg">
                  <p className="text-sm text-gray-300">{product.description}</p>
                </div>
              )}

              {product.quantity > 0 && (
                <div className="border-t border-gray-700 pt-4">
                  <div className="flex items-center gap-2 mb-3">
                    <label className="text-sm text-gray-300">كمية البيع:</label>
                    <input
                      type="number"
                      min="1"
                      max={product.quantity}
                      value={sellQuantity[product.id] || 1}
                      onChange={(e) => handleQuantityChange(product.id, parseInt(e.target.value))}
                      className="w-20 px-2 py-1 border border-gray-600 rounded bg-gray-700 text-white text-sm"
                    />
                  </div>
                  <button
                    onClick={() => handleSell(product)}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 flex items-center justify-center gap-2"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    بيع
                  </button>
                </div>
              )}

              {product.quantity < 5 && (
                <div className="mt-4 px-3 py-2 bg-red-900/20 border border-red-800 rounded-lg">
                  <p className="text-sm text-red-400 font-medium">كمية منخفضة في المخزون</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
        type={confirmDialog.type}
      />
    </div>
  );
}