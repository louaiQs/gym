import React, { useState, useEffect } from 'react';
import { useData } from '../contexts/DataContext';
import { User, Phone, MapPin, DollarSign, Calendar, FileText, Droplets, Scale, Ruler, Target, AlertTriangle, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ConfirmDialog from './ConfirmDialog';

interface AddSubscriberProps {
  onSuccess: () => void;
  renewSubscriber?: any;
}

export default function AddSubscriber({ onSuccess, renewSubscriber }: AddSubscriberProps) {
  const { addSubscriber, updateSubscriber, calculateBMI, getDefaultFitnessGoal, checkExistingSubscriber } = useData();
  const [formData, setFormData] = useState({
    name: renewSubscriber?.name || '',
    gender: (renewSubscriber?.gender || 'male') as 'male' | 'female',
    age: renewSubscriber?.age || '',
    height: renewSubscriber?.height || '',
    weight: renewSubscriber?.weight || '',
    bmi: renewSubscriber?.bmi || 0,
    bodyType: renewSubscriber?.bodyType || '',
    fitnessGoal: (renewSubscriber?.fitnessGoal || 'cutting') as 'bulking' | 'cutting' | 'custom',
    customGoal: renewSubscriber?.customGoal || '',
    phone: renewSubscriber?.phone || '',
    subscriptionDate: new Date().toISOString().split('T')[0],
    expiryDate: '',
    residence: renewSubscriber?.residence || 'صناوة العليا',
    price: 1500,
    debt: renewSubscriber?.debt || 0,
    subscriptionDuration: 30,
    notes: renewSubscriber?.notes || '',
    shower: renewSubscriber?.shower || false
  });
  const [error, setError] = useState('');
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showWarningDialog, setShowWarningDialog] = useState(false);
  const [existingSubscriber, setExistingSubscriber] = useState<any>(null);

  // Initialize shower state on first load
  useEffect(() => {
    if (!renewSubscriber) {
      setFormData(prev => ({
        ...prev,
        shower: false
      }));
    }
  }, [renewSubscriber]);


  // Calculate expiry date based on subscription duration
  useEffect(() => {
    if (formData.subscriptionDate && formData.subscriptionDuration) {
      const startDate = new Date(formData.subscriptionDate);
      const expiryDate = new Date(startDate.getTime() + Number(formData.subscriptionDuration) * 24 * 60 * 60 * 1000);
      setFormData(prev => ({
        ...prev,
        expiryDate: expiryDate.toISOString().split('T')[0]
      }));
    }
  }, [formData.subscriptionDate, formData.subscriptionDuration]);

  // Calculate BMI when height or weight changes
  useEffect(() => {
    if (formData.height && formData.weight) {
      const { bmi, bodyType } = calculateBMI(Number(formData.height), Number(formData.weight));
      const defaultGoal = getDefaultFitnessGoal(bmi);
      
      setFormData(prev => ({
        ...prev,
        bmi,
        bodyType,
        fitnessGoal: prev.fitnessGoal === 'cutting' || prev.fitnessGoal === 'bulking' ? defaultGoal : prev.fitnessGoal
      }));
    }
  }, [formData.height, formData.weight]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!formData.name.trim()) {
      setError('الاسم مطلوب');
      return;
    }

    // Check for existing subscriber only if not renewing
    if (!renewSubscriber) {
      const { exists, subscriber } = checkExistingSubscriber(formData.name.trim());
      if (exists) {
        setExistingSubscriber(subscriber);
        if (subscriber?.status === 'active' || subscriber?.status === 'frozen') {
          setShowWarningDialog(true);
          return;
        }
      }
    }

    try {
      if (renewSubscriber) {
        // Update existing subscriber
        await updateSubscriber(renewSubscriber.id, {
          ...formData,
          age: formData.age ? Number(formData.age) : undefined,
          height: formData.height ? Number(formData.height) : undefined,
          weight: formData.weight ? Number(formData.weight) : undefined,
          debt: Number(formData.debt),
          status: 'active'
        });
      } else {
        // Add new subscriber
        await addSubscriber({
          ...formData,
          age: formData.age ? Number(formData.age) : undefined,
          height: formData.height ? Number(formData.height) : undefined,
          weight: formData.weight ? Number(formData.weight) : undefined,
          debt: Number(formData.debt)
        });
      }
      setShowSuccessDialog(true);
    } catch (err) {
      setError('حدث خطأ أثناء حفظ البيانات');
      console.error('Error saving subscriber:', err);
    }
  };

  const handleSuccessConfirm = () => {
    setShowSuccessDialog(false);
    onSuccess();
  };

  const calculatePrice = (duration: number, hasShower: boolean): number => {
    let basePrice = 1500;
  
    if (duration === 15) basePrice = 800;
    else if (duration === 10) basePrice = 600;
    else if (duration === 7) basePrice = 450;
  
    // Add shower price only for 30-day subscriptions
    const finalPrice = duration === 30 && hasShower ? 1800 : basePrice;
    return finalPrice;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;

    if (name === 'name') {
      setError('');
    }

    if (type === 'checkbox' && name === 'shower') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => {
        const newPrice = calculatePrice(prev.subscriptionDuration, checked);
        return { ...prev, shower: checked, price: newPrice };
      });
    } else if (name === 'subscriptionDuration') {
      const newDuration = Number(value);
      setFormData(prev => {
        const newPrice = calculatePrice(newDuration, prev.shower);
        return { ...prev, subscriptionDuration: newDuration, price: newPrice };
      });
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const getBodyTypeColor = (bodyType: string) => {
    switch (bodyType) {
      case 'نحيف': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'طبيعي': return 'bg-green-100 text-green-800 border-green-200';
      case 'زيادة وزن': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'سمنة': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const durationOptions = [
    { value: 30, label: '30 يوم' },
    { value: 15, label: '15 يوم' },
    { value: 10, label: '10 أيام' },
    { value: 7, label: '7 أيام' }
  ];
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto"
    >
      <motion.h1 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
        className="text-3xl font-bold text-white mb-6"
      >
        {renewSubscriber ? 'تجديد الاشتراك' : 'إضافة مشترك جديد'}
      </motion.h1>
      
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="mb-4 p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded-lg"
          >
            <div className="flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2" />
              <p>{error}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <motion.form 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        onSubmit={handleSubmit} 
        className="bg-gray-800 rounded-xl shadow-2xl p-8 space-y-8"
      >
        {/* Personal Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
            <User className="w-5 h-5 mr-2" />
            المعلومات الشخصية
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                الاسم *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-700 text-white transition-all duration-200"
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
                className="w-full px-4 py-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-700 text-white transition-all duration-200"
              >
                <option value="male">ذكر</option>
                <option value="female">أنثى</option>
              </select>
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
                placeholder="العمر بالسنوات"
              />
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
                className="w-full px-4 py-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-700 text-white transition-all duration-200"
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
                className="w-full px-4 py-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-700 text-white transition-all duration-200"
                placeholder="أدخل مكان الإقامة"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <DollarSign className="inline w-4 h-4 ml-1" />
                الديون (دج)
              </label>
              <input
                type="number"
                name="debt"
                value={formData.debt}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="w-full px-4 py-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-700 text-white transition-all duration-200"
                placeholder="المبلغ المستحق"
              />
            </div>
          </div>
        </motion.div>

        {/* Physical Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
            <Scale className="w-5 h-5 mr-2" />
            المعلومات الجسدية
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Ruler className="inline w-4 h-4 ml-1" />
                الطول (سم)
              </label>
              <input
                type="number"
                name="height"
                value={formData.height}
                onChange={handleChange}
                min="100"
                max="250"
                className="w-full px-4 py-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-700 text-white transition-all duration-200"
                placeholder="الطول بالسنتيمتر"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Scale className="inline w-4 h-4 ml-1" />
                الوزن (كغ)
              </label>
              <input
                type="number"
                name="weight"
                value={formData.weight}
                onChange={handleChange}
                min="30"
                max="300"
                step="0.1"
                className="w-full px-4 py-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-700 text-white transition-all duration-200"
                placeholder="الوزن بالكيلوغرام"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                مؤشر كتلة الجسم
              </label>
              <input
                type="number"
                value={formData.bmi}
                readOnly
                className="w-full px-4 py-3 border border-gray-600 rounded-lg bg-gray-600 text-white cursor-not-allowed"
                placeholder="يحسب تلقائياً"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                نوع الجسم
              </label>
              {formData.bodyType ? (
                <div className={`px-4 py-3 rounded-lg border text-center font-medium ${getBodyTypeColor(formData.bodyType)}`}>
                  {formData.bodyType}
                </div>
              ) : (
                <div className="px-4 py-3 border border-gray-600 rounded-lg bg-gray-600 text-gray-400 text-center">
                  يحسب تلقائياً
                </div>
              )}
              <p className="text-sm text-gray-400 mt-2 text-center">
                ملاحظة: هذا التقييم تقديري وقد لا ينطبق على الرياضيين ذوي الكتلة العضلية العالية
              </p>
            </div>
          </div>
        </motion.div>

        {/* Fitness Goals */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
            <Target className="w-5 h-5 mr-2" />
            الهدف من التمرين
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <label className="flex items-center p-4 border border-gray-600 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors">
              <input
                type="radio"
                name="fitnessGoal"
                value="bulking"
                checked={formData.fitnessGoal === 'bulking'}
                onChange={handleChange}
                className="mr-3"
              />
              <div>
                <div className="font-medium text-white">زيادة الكتلة العضلية</div>
                <div className="text-sm text-gray-400">بناء العضلات وزيادة الوزن</div>
              </div>
            </label>

            <label className="flex items-center p-4 border border-gray-600 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors">
              <input
                type="radio"
                name="fitnessGoal"
                value="cutting"
                checked={formData.fitnessGoal === 'cutting'}
                onChange={handleChange}
                className="mr-3"
              />
              <div>
                <div className="font-medium text-white">تقليل الوزن</div>
                <div className="text-sm text-gray-400">حرق الدهون وتنشيف الجسم</div>
              </div>
            </label>

            <label className="flex items-center p-4 border border-gray-600 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors">
              <input
                type="radio"
                name="fitnessGoal"
                value="custom"
                checked={formData.fitnessGoal === 'custom'}
                onChange={handleChange}
                className="mr-3"
              />
              <div>
                <div className="font-medium text-white">هدف مخصص</div>
                <div className="text-sm text-gray-400">حدد هدفك الخاص</div>
              </div>
            </label>
          </div>

          <AnimatePresence>
            {formData.fitnessGoal === 'custom' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <input
                  type="text"
                  name="customGoal"
                  value={formData.customGoal}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-700 text-white transition-all duration-200"
                  placeholder="اكتب هدفك المخصص..."
                />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Subscription Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            تفاصيل الاشتراك
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                تاريخ بداية الاشتراك
              </label>
              <input
                type="date"
                name="subscriptionDate"
                value={formData.subscriptionDate}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-700 text-white transition-all duration-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                مدة الاشتراك
              </label>
              <select
                name="subscriptionDuration" 
                value={formData.subscriptionDuration}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-700 text-white transition-all duration-200"
              >
                {durationOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                تاريخ انتهاء الاشتراك
              </label>
              <input
                type="date"
                name="expiryDate"
                value={formData.expiryDate}
                readOnly
                className="w-full px-4 py-3 border border-gray-600 rounded-lg bg-gray-600 text-white cursor-not-allowed"
              />
            </div>

            <div className="md:col-span-2 lg:col-span-1">
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
                className="w-full px-4 py-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-700 text-white transition-all duration-200"
              />
            </div>
          </div>
        </motion.div>

        {/* Notes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <label className="block text-sm font-medium text-gray-300 mb-2">
            <FileText className="inline w-4 h-4 ml-1" />
            ملاحظات إضافية
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={3}
            className="w-full px-4 py-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-700 text-white transition-all duration-200"
            placeholder="أدخل أي ملاحظات إضافية (اختياري)"
          />
        </motion.div>

        {/* Action Buttons */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="flex gap-4"
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg"
          >
            {renewSubscriber ? 'تجديد الاشتراك' : 'إضافة المشترك'}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={onSuccess}
            className="px-6 py-3 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-all duration-200"
          >
            إلغاء
          </motion.button>
        </motion.div>
      </motion.form>

      {/* Success Dialog */}
      <ConfirmDialog
        isOpen={showSuccessDialog}
        title="تمت العملية بنجاح"
        message={renewSubscriber ? "تم تجديد الاشتراك بنجاح" : "تم إضافة المشترك بنجاح"}
        onConfirm={handleSuccessConfirm}
        onCancel={handleSuccessConfirm}
        type="success"
      />

      {/* Warning Dialog for Existing Active Subscriber */}
      <ConfirmDialog
        isOpen={showWarningDialog}
        title="تحذير: مشترك موجود"
        message={`المشترك "${formData.name}" لديه اشتراك ${existingSubscriber?.status === 'active' ? 'نشط' : 'مجمد'} بالفعل. لا يمكن إضافة اشتراك جديد.`}
        onConfirm={() => setShowWarningDialog(false)}
        onCancel={() => setShowWarningDialog(false)}
        type="warning"
      />
    </motion.div>
  );
}