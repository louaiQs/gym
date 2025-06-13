import React, { useState } from 'react';
import { useData, IndividualClass } from '../contexts/DataContext';
import { Plus, Edit, Trash2, User, Calendar, DollarSign, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ConfirmDialog from './ConfirmDialog';
import MonthSelector from './MonthSelector';

export default function IndividualClasses() {
  const { 
    individualClasses, 
    filteredIndividualClasses, 
    addIndividualClass, 
    updateIndividualClass, 
    deleteIndividualClass,
    currentMonth,
    setCurrentMonth
  } = useData();
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingClass, setEditingClass] = useState<IndividualClass | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
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
    age: '',
    date: new Date().toISOString().split('T')[0],
    price: 200
  });

  const filteredClassesList = filteredIndividualClasses.filter(individualClass =>
    individualClass.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalRevenue = filteredClassesList.reduce((sum, cls) => sum + cls.price, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingClass) {
      updateIndividualClass(editingClass.id, {
        ...formData,
        age: formData.age ? Number(formData.age) : undefined
      });
      setEditingClass(null);
      setConfirmDialog({
        isOpen: true,
        title: 'نجح',
        message: 'تم تحديث الحصة بنجاح',
        onConfirm: () => setConfirmDialog(prev => ({ ...prev, isOpen: false })),
        type: 'success'
      });
    } else {
      addIndividualClass({
        ...formData,
        age: formData.age ? Number(formData.age) : undefined
      });
      setShowAddForm(false);
      setConfirmDialog({
        isOpen: true,
        title: 'نجح',
        message: 'تم إضافة الحصة بنجاح',
        onConfirm: () => setConfirmDialog(prev => ({ ...prev, isOpen: false })),
        type: 'success'
      });
    }
    setFormData({ name: '', age: '', date: new Date().toISOString().split('T')[0], price: 200 });
  };

  const handleEdit = (individualClass: IndividualClass) => {
    setEditingClass(individualClass);
    setFormData({
      name: individualClass.name,
      age: individualClass.age?.toString() || '',
      date: individualClass.date,
      price: individualClass.price
    });
    setShowAddForm(true);
  };

  const handleDelete = (individualClass: IndividualClass) => {
    setConfirmDialog({
      isOpen: true,
      title: 'تأكيد الحذف',
      message: `هل أنت متأكد من حذف حصة "${individualClass.name}"؟`,
      onConfirm: () => {
        deleteIndividualClass(individualClass.id);
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
      },
      type: 'warning'
    });
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setEditingClass(null);
    setFormData({ name: '', age: '', date: new Date().toISOString().split('T')[0], price: 200 });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' ? parseFloat(value) || 0 : value
    }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex justify-between items-center mb-6">
        <motion.h1 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-3xl font-bold text-white"
        >
          الحصص الفردية
        </motion.h1>
        <div className="flex items-center gap-4">
          <MonthSelector currentMonth={currentMonth} onMonthChange={setCurrentMonth} />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAddForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 flex items-center gap-2 shadow-lg"
          >
            <Plus className="w-5 h-5" />
            إضافة حصة
          </motion.button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-blue-900/20 border border-blue-800 rounded-lg p-4"
        >
          <div className="flex items-center gap-3">
            <User className="w-6 h-6 text-blue-400" />
            <div>
              <h3 className="font-semibold text-blue-400">إجمالي الحصص</h3>
              <p className="text-2xl font-bold text-blue-400">{filteredClassesList.length}</p>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-green-900/20 border border-green-800 rounded-lg p-4"
        >
          <div className="flex items-center gap-3">
            <DollarSign className="w-6 h-6 text-green-400" />
            <div>
              <h3 className="font-semibold text-green-400">إجمالي الإيرادات</h3>
              <p className="text-2xl font-bold text-green-400">{totalRevenue} دج</p>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-purple-900/20 border border-purple-800 rounded-lg p-4"
        >
          <div className="flex items-center gap-3">
            <Calendar className="w-6 h-6 text-purple-400" />
            <div>
              <h3 className="font-semibold text-purple-400">متوسط السعر</h3>
              <p className="text-2xl font-bold text-purple-400">
                {filteredClassesList.length > 0 ? Math.round(totalRevenue / filteredClassesList.length) : 0} دج
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Search */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mb-6"
      >
        <div className="relative">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="البحث في الحصص..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pr-12 pl-4 py-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-700 text-white transition-all duration-200"
          />
        </div>
      </motion.div>

      {/* Add/Edit Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-gray-800 rounded-lg shadow-md p-6 mb-6"
          >
            <h2 className="text-xl font-semibold text-white mb-4">
              {editingClass ? 'تعديل الحصة' : 'إضافة حصة جديدة'}
            </h2>
            
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  الاسم
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-700 text-white transition-all duration-200"
                  placeholder="أدخل اسم المتدرب"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  العمر
                </label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  min="10"
                  max="100"
                  className="w-full px-4 py-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-700 text-white transition-all duration-200"
                  placeholder="العمر (اختياري)"
                />
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
                  className="w-full px-4 py-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-700 text-white transition-all duration-200"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  السعر (دينار جزائري)
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  required
                  className="w-full px-4 py-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-700 text-white transition-all duration-200"
                  placeholder="أدخل السعر"
                />
              </div>

              <div className="md:col-span-2 flex gap-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200"
                >
                  {editingClass ? 'حفظ التغييرات' : 'إضافة الحصة'}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={handleCancel}
                  className="px-6 py-3 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-all duration-200"
                >
                  إلغاء
                </motion.button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Classes List */}
      {filteredClassesList.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-gray-800 rounded-lg shadow-md p-8 text-center"
        >
          <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">لا توجد حصص</h2>
          <p className="text-gray-400">ابدأ بإضافة حصص فردية لتتبع الإيرادات</p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClassesList.map((individualClass, index) => (
            <motion.div 
              key={individualClass.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-all duration-200"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">{individualClass.name}</h3>
                  {individualClass.age && (
                    <p className="text-gray-400 text-sm">العمر: {individualClass.age} سنة</p>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleEdit(individualClass)}
                    className="p-2 text-blue-400 hover:bg-blue-900/20 rounded-lg transition-colors"
                    title="تعديل"
                  >
                    <Edit className="w-4 h-4" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleDelete(individualClass)}
                    className="p-2 text-red-400 hover:bg-red-900/20 rounded-lg transition-colors"
                    title="حذف"
                  >
                    <Trash2 className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>

              <div className="space-y-2 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(individualClass.date).toLocaleDateString('ar-DZ')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  <span className="font-medium text-green-400">{individualClass.price} دج</span>
                </div>
              </div>
            </motion.div>
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
    </motion.div>
  );
}