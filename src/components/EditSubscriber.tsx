import React, { useState } from 'react';
import { useData, Subscriber } from '../contexts/DataContext';
import { User, Phone, MapPin, DollarSign, Calendar, FileText, X, Droplets } from 'lucide-react';

interface EditSubscriberProps {
  subscriber: Subscriber;
  onClose: () => void;
}

export default function EditSubscriber({ subscriber, onClose }: EditSubscriberProps) {
  const { updateSubscriber } = useData();
  const [formData, setFormData] = useState({
    name: subscriber.name,
    gender: subscriber.gender,
    phone: subscriber.phone || '',
    subscriptionDate: subscriber.subscriptionDate,
    expiryDate: subscriber.expiryDate,
    residence: subscriber.residence,
    price: subscriber.price,
    notes: subscriber.notes || '',
    shower: subscriber.shower || false
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('الاسم مطلوب');
      return;
    }
    
    updateSubscriber(subscriber.id, formData);
    alert('تم تحديث بيانات المشترك بنجاح');
    onClose();
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
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-white">تعديل بيانات المشترك</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-300"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
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
              />
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200"
            >
              حفظ التغييرات
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition duration-200"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}