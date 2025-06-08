import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { User, Phone, MapPin, DollarSign, Calendar, FileText, Droplets } from 'lucide-react';

interface AddSubscriberProps {
  onSuccess: () => void;
}

export default function AddSubscriber({ onSuccess }: AddSubscriberProps) {
  const { addSubscriber, subscribers } = useData();
  const [formData, setFormData] = useState({
    name: '',
    gender: 'male' as 'male' | 'female',
    phone: '',
    subscriptionDate: new Date().toISOString().split('T')[0],
    expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    residence: 'صناوة العليا',
    price: 1500,
    notes: '',
    shower: false
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); // Reset error message
    
    if (!formData.name.trim()) {
      setError('الاسم مطلوب');
      return;
    }

    // Check for existing subscriber with the same name (case insensitive)
    const subscriberExists = subscribers.some(
      sub => sub.name.toLowerCase() === formData.name.trim().toLowerCase()
    );

    if (subscriberExists) {
      setError('يوجد مشترك بهذا الاسم بالفعل');
      return;
    }

    try {
      await addSubscriber(formData);
      alert('تم إضافة المشترك بنجاح');
      onSuccess();
    } catch (err) {
      setError('حدث خطأ أثناء إضافة المشترك');
      console.error('Error adding subscriber:', err);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        [name]: checked,
        price: checked ? 1800 : 1500
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }

    // Clear error when user starts typing in name field
    if (name === 'name') {
      setError('');
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-white mb-6">إضافة مشترك جديد</h1>
      
      {error && (
        <div className="mb-4 p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded">
          <p>{error}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="bg-gray-800 rounded-lg shadow-md p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <User className="inline w-4 h-4 ml-1" />
              الاسم *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-700 text-white"
              placeholder="أدخل اسم المشترك"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              الجنس
            </label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-700 text-white"
            >
              <option value="male">ذكر</option>
              <option value="female">أنثى</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <Phone className="inline w-4 h-4 ml-1" />
              رقم الهاتف
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-700 text-white"
              placeholder="أدخل رقم الهاتف (اختياري)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <MapPin className="inline w-4 h-4 ml-1" />
              مكان الإقامة
            </label>
            <input
              type="text"
              name="residence"
              value={formData.residence}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-700 text-white"
              placeholder="أدخل مكان الإقامة"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <Calendar className="inline w-4 h-4 ml-1" />
              تاريخ بداية الاشتراك
            </label>
            <input
              type="date"
              name="subscriptionDate"
              value={formData.subscriptionDate}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-700 text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <Calendar className="inline w-4 h-4 ml-1" />
              تاريخ انتهاء الاشتراك
            </label>
            <input
              type="date"
              name="expiryDate"
              value={formData.expiryDate}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-700 text-white"
            />
          </div>

          <div className="md:col-span-2">
            <label className="flex items-center gap-3 text-sm font-medium text-gray-300 mb-4">
              <input
                type="checkbox"
                name="shower"
                checked={formData.shower}
                onChange={handleChange}
                className="w-5 h-5 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
              />
              <Droplets className="w-4 h-4" />
              خدمة الاستحمام
            </label>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <DollarSign className="inline w-4 h-4 ml-1" />
              السعر (دينار جزائري)
            </label>
            <div className="relative">
              <input
                type="number"
                name="price"
                value={formData.price}
                readOnly
                className="w-full px-4 py-3 border border-gray-600 rounded-lg bg-gray-600 text-white cursor-not-allowed"
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">
                {formData.shower ? '1800 دج (مع الاستحمام)' : '1500 دج (بدون الاستحمام)'}
              </div>
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <FileText className="inline w-4 h-4 ml-1" />
              ملاحظات إضافية
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-700 text-white"
              placeholder="أدخل أي ملاحظات إضافية (اختياري)"
            />
          </div>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200"
          >
            إضافة المشترك
          </button>
          <button
            type="button"
            onClick={onSuccess}
            className="px-6 py-3 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition duration-200"
          >
            إلغاء
          </button>
        </div>
      </form>
    </div>
  );
}