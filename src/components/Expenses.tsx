import React, { useState } from 'react';
import { useData, Expense } from '../contexts/DataContext';
import { Plus, Edit, Trash2, DollarSign, Search, Calendar, FileText, Tag } from 'lucide-react';
import ConfirmDialog from './ConfirmDialog';
import MonthSelector from './MonthSelector';

export default function Expenses() {
  const { expenses, filteredExpenses, addExpense, updateExpense, deleteExpense, currentMonth, setCurrentMonth } = useData();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
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
    amount: 0,
    category: 'other' as Expense['category'],
    description: '',
    date: new Date().toISOString().split('T')[0]
  });

  const categories = [
    { value: 'rent', label: 'إيجار', color: 'bg-blue-500' },
    { value: 'equipment', label: 'معدات', color: 'bg-green-500' },
    { value: 'salary', label: 'رواتب', color: 'bg-purple-500' },
    { value: 'utilities', label: 'فواتير', color: 'bg-yellow-500' },
    { value: 'maintenance', label: 'صيانة', color: 'bg-red-500' },
    { value: 'other', label: 'أخرى', color: 'bg-gray-500' }
  ];

  const filteredExpensesList = filteredExpenses.filter(expense => {
    const matchesSearch = expense.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (expense.description && expense.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = categoryFilter === 'all' || expense.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  const totalExpenses = filteredExpensesList.reduce((sum, expense) => sum + expense.amount, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingExpense) {
      updateExpense(editingExpense.id, formData);
      setEditingExpense(null);
      setConfirmDialog({
        isOpen: true,
        title: 'نجح',
        message: 'تم تحديث المصروف بنجاح',
        onConfirm: () => setConfirmDialog(prev => ({ ...prev, isOpen: false })),
        type: 'success'
      });
    } else {
      addExpense(formData);
      setShowAddForm(false);
      setConfirmDialog({
        isOpen: true,
        title: 'نجح',
        message: 'تم إضافة المصروف بنجاح',
        onConfirm: () => setConfirmDialog(prev => ({ ...prev, isOpen: false })),
        type: 'success'
      });
    }
    setFormData({ name: '', amount: 0, category: 'other', description: '', date: new Date().toISOString().split('T')[0] });
  };

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setFormData({
      name: expense.name,
      amount: expense.amount,
      category: expense.category,
      description: expense.description || '',
      date: expense.date
    });
    setShowAddForm(true);
  };

  const handleDelete = (expense: Expense) => {
    setConfirmDialog({
      isOpen: true,
      title: 'تأكيد الحذف',
      message: `هل أنت متأكد من حذف المصروف "${expense.name}"؟`,
      onConfirm: () => {
        deleteExpense(expense.id);
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
      },
      type: 'warning'
    });
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setEditingExpense(null);
    setFormData({ name: '', amount: 0, category: 'other', description: '', date: new Date().toISOString().split('T')[0] });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'amount' ? parseFloat(value) || 0 : value
    }));
  };

  const getCategoryInfo = (category: string) => {
    return categories.find(cat => cat.value === category) || categories[categories.length - 1];
  };

  const expensesByCategory = categories.map(category => ({
    ...category,
    total: filteredExpensesList
      .filter(expense => expense.category === category.value)
      .reduce((sum, expense) => sum + expense.amount, 0),
    count: filteredExpensesList.filter(expense => expense.category === category.value).length
  }));

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white">إدارة المصروفات</h1>
        <div className="flex items-center gap-4">
          <MonthSelector currentMonth={currentMonth} onMonthChange={setCurrentMonth} />
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            إضافة مصروف
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-red-900/20 border border-red-800 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <DollarSign className="w-6 h-6 text-red-400" />
            <div>
              <h3 className="font-semibold text-red-400">إجمالي المصروفات</h3>
              <p className="text-2xl font-bold text-red-400">{totalExpenses.toFixed(2)} دج</p>
            </div>
          </div>
        </div>

        <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6 text-blue-400" />
            <div>
              <h3 className="font-semibold text-blue-400">عدد المصروفات</h3>
              <p className="text-2xl font-bold text-blue-400">{filteredExpensesList.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-purple-900/20 border border-purple-800 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <Tag className="w-6 h-6 text-purple-400" />
            <div>
              <h3 className="font-semibold text-purple-400">الفئات النشطة</h3>
              <p className="text-2xl font-bold text-purple-400">
                {expensesByCategory.filter(cat => cat.count > 0).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-green-900/20 border border-green-800 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <Calendar className="w-6 h-6 text-green-400" />
            <div>
              <h3 className="font-semibold text-green-400">متوسط المصروف</h3>
              <p className="text-2xl font-bold text-green-400">
                {filteredExpensesList.length > 0 ? (totalExpenses / filteredExpensesList.length).toFixed(2) : '0'} دج
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="البحث في المصروفات..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pr-12 pl-4 py-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-700 text-white"
          />
        </div>
        
        <div className="relative">
          <Tag className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="pr-12 pl-4 py-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-700 text-white"
          >
            <option value="all">جميع الفئات</option>
            {categories.map(category => (
              <option key={category.value} value={category.value}>{category.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">
            {editingExpense ? 'تعديل المصروف' : 'إضافة مصروف جديد'}
          </h2>
          
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                اسم المصروف
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-700 text-white"
                placeholder="أدخل اسم المصروف"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                المبلغ (دينار جزائري)
              </label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                min="0"
                step="0.01"
                required
                className="w-full px-4 py-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-700 text-white"
                placeholder="أدخل المبلغ"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                الفئة
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-700 text-white"
              >
                {categories.map(category => (
                  <option key={category.value} value={category.value}>{category.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                التاريخ
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-700 text-white"
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
                placeholder="أدخل وصف المصروف (اختياري)"
              />
            </div>

            <div className="md:col-span-2 flex gap-4">
              <button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200"
              >
                {editingExpense ? 'حفظ التغييرات' : 'إضافة المصروف'}
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

      {/* Expenses by Category */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {expensesByCategory.map(category => (
          <div key={category.value} className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-4 h-4 rounded-full ${category.color}`}></div>
              <h3 className="font-semibold text-white">{category.label}</h3>
            </div>
            <div className="text-sm text-gray-400">
              <p>المبلغ: <span className="text-white font-medium">{category.total.toFixed(2)} دج</span></p>
              <p>العدد: <span className="text-white font-medium">{category.count}</span></p>
            </div>
          </div>
        ))}
      </div>

      {/* Expenses List */}
      {filteredExpensesList.length === 0 ? (
        <div className="bg-gray-800 rounded-lg shadow-md p-8 text-center">
          <DollarSign className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">لا توجد مصروفات</h2>
          <p className="text-gray-400">ابدأ بإضافة مصروفات لتتبع نفقات الجيم</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredExpensesList.map(expense => {
            const categoryInfo = getCategoryInfo(expense.category);
            return (
              <div key={expense.id} className="bg-gray-800 rounded-lg p-4 flex items-center justify-between hover:bg-gray-750 transition-colors">
                <div className="flex items-center gap-4 flex-1">
                  <div className={`w-3 h-3 rounded-full ${categoryInfo.color}`}></div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-semibold text-white">{expense.name}</h3>
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-700 text-gray-300">
                        {categoryInfo.label}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <span className="flex items-center gap-1">
                        <DollarSign className="w-3 h-3" />
                        {expense.amount.toFixed(2)} دج
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(expense.date).toLocaleDateString('ar-DZ')}
                      </span>
                      {expense.description && (
                        <span className="flex items-center gap-1">
                          <FileText className="w-3 h-3" />
                          {expense.description}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(expense)}
                    className="p-2 text-blue-400 hover:bg-blue-900/20 rounded transition-colors"
                    title="تعديل"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  
                  <button
                    onClick={() => handleDelete(expense)}
                    className="p-2 text-red-400 hover:bg-red-900/20 rounded transition-colors"
                    title="حذف"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
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