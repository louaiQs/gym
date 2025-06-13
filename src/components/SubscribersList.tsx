import React, { useState } from 'react';
import { useData, Subscriber } from '../contexts/DataContext';
import { 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  UserCheck, 
  UserX, 
  Calendar,
  Phone,
  MapPin,
  DollarSign,
  Snowflake,
  Play,
  Grid3X3,
  List,
  Clock,
  Users,
  Droplets,
  RefreshCw,
  Scale,
  Target
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import EditSubscriber from './EditSubscriber';
import AttendanceModal from './AttendanceModal';
import TrainingTypeModal from './TrainingTypeModal';
import ConfirmDialog from './ConfirmDialog';
import MonthSelector from './MonthSelector';

interface SubscribersListProps {
  onRenewSubscriber: (subscriber: Subscriber) => void;
}

export default function SubscribersList({ onRenewSubscriber }: SubscribersListProps) {
  const { 
    subscribers,
    filteredSubscribers,
    currentMonth,
    setCurrentMonth,
    deleteSubscriber, 
    freezeSubscriber, 
    unfreezeSubscriber, 
    recordAttendance,
    viewMode,
    setViewMode,
    searchSubscribers
  } = useData();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'expired' | 'frozen'>('all');
  const [genderFilter, setGenderFilter] = useState<'all' | 'male' | 'female'>('all');
  const [editingSubscriber, setEditingSubscriber] = useState<Subscriber | null>(null);
  const [attendanceSubscriber, setAttendanceSubscriber] = useState<Subscriber | null>(null);
  const [trainingTypeSubscriber, setTrainingTypeSubscriber] = useState<Subscriber | null>(null);
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

  // Search all active subscribers if search term is provided, otherwise use filtered subscribers
  const searchResults = searchTerm.trim() ? searchSubscribers(searchTerm) : [];
  const displaySubscribers = searchTerm.trim() ? searchResults : filteredSubscribers;

  // Sort subscribers: active/frozen by expiry date (newest first), then expired at bottom
  const sortedSubscribers = [...displaySubscribers].sort((a, b) => {
    if (a.status === 'expired' && b.status === 'expired') {
      return new Date(b.expiryDate).getTime() - new Date(a.expiryDate).getTime();
    }
    
    if (a.status === 'expired' && b.status !== 'expired') return 1;
    if (a.status !== 'expired' && b.status === 'expired') return -1;
    
    return new Date(b.expiryDate).getTime() - new Date(a.expiryDate).getTime();
  });

  const filteredSubscribersList = sortedSubscribers.filter(subscriber => {
    const matchesStatus = statusFilter === 'all' || subscriber.status === statusFilter;
    const matchesGender = genderFilter === 'all' || subscriber.gender === genderFilter;
    
    return matchesStatus && matchesGender;
  });

  const maleSubscribers = filteredSubscribersList.filter(s => s.gender === 'male');
  const femaleSubscribers = filteredSubscribersList.filter(s => s.gender === 'female');

  const handleDelete = (subscriber: Subscriber) => {
    setConfirmDialog({
      isOpen: true,
      title: 'تأكيد الحذف',
      message: `هل أنت متأكد من حذف المشترك "${subscriber.name}"؟`,
      onConfirm: () => {
        deleteSubscriber(subscriber.id);
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
      },
      type: 'warning'
    });
  };

  const handleFreeze = (subscriber: Subscriber) => {
    setConfirmDialog({
      isOpen: true,
      title: 'تأكيد التجميد',
      message: `هل تريد تجميد اشتراك "${subscriber.name}"؟`,
      onConfirm: () => {
        freezeSubscriber(subscriber.id);
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
      },
      type: 'info'
    });
  };

  const handleUnfreeze = (subscriber: Subscriber) => {
    setConfirmDialog({
      isOpen: true,
      title: 'تأكيد إلغاء التجميد',
      message: `هل تريد إلغاء تجميد اشتراك "${subscriber.name}"؟`,
      onConfirm: () => {
        unfreezeSubscriber(subscriber.id);
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
      },
      type: 'info'
    });
  };

  const handleAttendance = (subscriber: Subscriber) => {
    if (subscriber.status === 'expired') {
      setConfirmDialog({
        isOpen: true,
        title: 'غير مسموح',
        message: 'لا يمكن تسجيل الحضور للاشتراكات المنتهية',
        onConfirm: () => setConfirmDialog(prev => ({ ...prev, isOpen: false })),
        type: 'warning'
      });
      return;
    }

    // Check if already attended today
    const today = new Date().toDateString();
    const hasAttendanceToday = subscriber.attendance.some(record => record.date === today);
    
    if (hasAttendanceToday) {
      setConfirmDialog({
        isOpen: true,
        title: 'تم التسجيل مسبقاً',
        message: 'تم تسجيل الحضور بالفعل لهذا اليوم',
        onConfirm: () => setConfirmDialog(prev => ({ ...prev, isOpen: false })),
        type: 'info'
      });
      return;
    }

    // Open training type modal
    setTrainingTypeSubscriber(subscriber);
  };

  const handleTrainingTypeConfirm = async (trainingTypes: string[]) => {
    if (!trainingTypeSubscriber) return;

    const success = await recordAttendance(trainingTypeSubscriber.id, trainingTypes);
    if (success) {
      setConfirmDialog({
        isOpen: true,
        title: 'نجح',
        message: 'تم تسجيل الحضور بنجاح',
        onConfirm: () => setConfirmDialog(prev => ({ ...prev, isOpen: false })),
        type: 'success'
      });
    }
    setTrainingTypeSubscriber(null);
  };

  const handleRenew = (subscriber: Subscriber) => {
    onRenewSubscriber(subscriber);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400 bg-green-900/20';
      case 'expired': return 'text-red-400 bg-red-900/20';
      case 'frozen': return 'text-yellow-400 bg-yellow-900/20';
      default: return 'text-gray-400 bg-gray-900/20';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'نشط';
      case 'expired': return 'منتهي';
      case 'frozen': return 'مجمد';
      default: return status;
    }
  };

  const getDaysRemaining = (expiryDate: string, status: string) => {
    if (status === 'frozen') return 'مجمد';
    
    const expiry = new Date(expiryDate);
    const today = new Date();
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return `منتهي منذ ${Math.abs(diffDays)} يوم`;
    if (diffDays === 0) return 'ينتهي اليوم';
    if (diffDays === 1) return 'ينتهي غداً';
    return `${diffDays} يوم متبقي`;
  };

  const getBodyTypeColor = (bodyType?: string) => {
    if (!bodyType) return '';
    switch (bodyType) {
      case 'نحيف': return 'bg-blue-100 text-blue-800';
      case 'طبيعي': return 'bg-green-100 text-green-800';
      case 'زيادة وز': return 'bg-yellow-100 text-yellow-800';
      case 'سمنة': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getFitnessGoalIcon = (goal?: string) => {
    switch (goal) {
      case 'bulking': return '💪';
      case 'cutting': return '🔥';
      case 'custom': return '🎯';
      default: return '';
    }
  };

  const renderCard = (subscriber: Subscriber) => (
    <motion.div 
      key={subscriber.id}
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
      className="bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300"
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-white">{subscriber.name}</h3>
          <div className="flex gap-2 mt-2 flex-wrap">
            <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(subscriber.status)}`}>
              {getStatusText(subscriber.status)}
            </span>
            {subscriber.shower && (
              <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-blue-900/20 text-blue-400">
                <Droplets className="inline w-3 h-3 ml-1" />
                استحمام
              </span>
            )}
            {subscriber.bodyType && (
              <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getBodyTypeColor(subscriber.bodyType)}`}>
                <Scale className="inline w-3 h-3 ml-1" />
                {subscriber.bodyType}
              </span>
            )}
            {subscriber.fitnessGoal && (
              <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-purple-900/20 text-purple-400">
                <Target className="inline w-3 h-3 ml-1" />
                {getFitnessGoalIcon(subscriber.fitnessGoal)} {subscriber.fitnessGoal === 'custom' ? subscriber.customGoal : subscriber.fitnessGoal === 'bulking' ? 'تضخيم' : 'تنشيف'}
              </span>
            )}
          </div>
        </div>
        
        <div className="flex gap-2 flex-wrap">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleAttendance(subscriber)}
            className={`p-2 rounded-lg transition-colors ${
              subscriber.status === 'expired'
                ? 'text-gray-400 hover:bg-gray-700 cursor-not-allowed'
                : 'text-blue-400 hover:bg-blue-900/20'
            }`}
            title={subscriber.status === 'expired' ? 'غير مسموح' : 'تسجيل الحضور'}
            disabled={subscriber.status === 'expired'}
          >
            <UserCheck className="w-4 h-4" />
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setAttendanceSubscriber(subscriber)}
            className="p-2 text-purple-400 hover:bg-purple-900/20 rounded-lg transition-colors"
            title="سجل الحضور"
          >
            <Calendar className="w-4 h-4" />
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setEditingSubscriber(subscriber)}
            className="p-2 text-blue-400 hover:bg-blue-900/20 rounded-lg transition-colors"
            title="تعديل"
          >
            <Edit className="w-4 h-4" />
          </motion.button>
          
          {subscriber.status === 'expired' ? (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleRenew(subscriber)}
              className="p-2 text-green-400 hover:bg-green-900/20 rounded-lg transition-colors"
              title="تجديد الاشتراك"
            >
              <RefreshCw className="w-4 h-4" />
            </motion.button>
          ) : subscriber.status === 'frozen' ? (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleUnfreeze(subscriber)}
              className="p-2 text-green-400 hover:bg-green-900/20 rounded-lg transition-colors"
              title="إلغاء التجميد"
            >
              <Play className="w-4 h-4" />
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleFreeze(subscriber)}
              className="p-2 text-yellow-400 hover:bg-yellow-900/20 rounded-lg transition-colors"
              title="تجميد"
            >
              <Snowflake className="w-4 h-4" />
            </motion.button>
          )}
          
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleDelete(subscriber)}
            className="p-2 text-red-400 hover:bg-red-900/20 rounded-lg transition-colors"
            title="حذف"
          >
            <Trash2 className="w-4 h-4" />
          </motion.button>
        </div>
      </div>

      <div className="space-y-2 text-sm text-gray-400 mb-4">
        {subscriber.age && (
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span>العمر: {subscriber.age} سنة</span>
          </div>
        )}
        
        {subscriber.phone && (
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4" />
            <span>{subscriber.phone}</span>
          </div>
        )}
        
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4" />
          <span>{subscriber.residence}</span>
        </div>
        
        <div className="flex items-center gap-2">
          <DollarSign className="w-4 h-4" />
          <span>{subscriber.price} دج</span>
          {subscriber.debt > 0 && (
            <span className="text-red-400">(دين: {subscriber.debt} دج)</span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          <span>ينتهي: {new Date(subscriber.expiryDate).toLocaleDateString('ar-DZ')}</span>
        </div>
        
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4" />
          <span className={subscriber.status === 'expired' ? 'text-red-400' : 'text-gray-400'}>
            {getDaysRemaining(subscriber.expiryDate, subscriber.status)}
          </span>
        </div>

        {subscriber.bmi && (
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4" />
            <span>BMI: {subscriber.bmi}</span>
          </div>
        )}
      </div>

      {subscriber.notes && (
        <div className="mb-4 p-3 bg-gray-700 rounded-lg">
          <p className="text-sm text-gray-300">{subscriber.notes}</p>
        </div>
      )}

      <div className="flex items-center gap-2 text-sm text-gray-500">
        <UserCheck className="w-4 h-4" />
        <span>أيام الحضور: {subscriber.attendance.length}</span>
      </div>
    </motion.div>
  );

  const renderListItem = (subscriber: Subscriber) => (
    <motion.div 
      key={subscriber.id}
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      whileHover={{ x: 5 }}
      transition={{ duration: 0.3 }}
      className="bg-gray-800 rounded-lg p-4 flex items-center justify-between hover:bg-gray-750 transition-all duration-200"
    >
      <div className="flex items-center gap-4 flex-1">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1 flex-wrap">
            <h3 className="font-semibold text-white">{subscriber.name}</h3>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(subscriber.status)}`}>
              {getStatusText(subscriber.status)}
            </span>
            {subscriber.shower && (
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-900/20 text-blue-400">
                <Droplets className="inline w-3 h-3" />
              </span>
            )}
            {subscriber.bodyType && (
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getBodyTypeColor(subscriber.bodyType)}`}>
                {subscriber.bodyType}
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-4 text-sm text-gray-400 flex-wrap">
            {subscriber.age && (
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                {subscriber.age} سنة
              </span>
            )}
            {subscriber.phone && (
              <span className="flex items-center gap-1">
                <Phone className="w-3 h-3" />
                {subscriber.phone}
              </span>
            )}
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {subscriber.residence}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {new Date(subscriber.expiryDate).toLocaleDateString('ar-DZ')}
            </span>
            <span className={`flex items-center gap-1 ${subscriber.status === 'expired' ? 'text-red-400' : ''}`}>
              <Clock className="w-3 h-3" />
              {getDaysRemaining(subscriber.expiryDate, subscriber.status)}
            </span>
            {subscriber.debt > 0 && (
              <span className="flex items-center gap-1 text-red-400">
                <DollarSign className="w-3 h-3" />
                دين: {subscriber.debt} دج
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => handleAttendance(subscriber)}
          className={`p-2 rounded transition-colors ${
            subscriber.status === 'expired'
              ? 'text-gray-400 hover:bg-gray-700 cursor-not-allowed'
              : 'text-blue-400 hover:bg-blue-900/20'
          }`}
          title={subscriber.status === 'expired' ? 'غير مسموح' : 'تسجيل الحضور'}
          disabled={subscriber.status === 'expired'}
        >
          <UserCheck className="w-4 h-4" />
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setAttendanceSubscriber(subscriber)}
          className="p-2 text-purple-400 hover:bg-purple-900/20 rounded transition-colors"
          title="سجل الحضور"
        >
          <Calendar className="w-4 h-4" />
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setEditingSubscriber(subscriber)}
          className="p-2 text-blue-400 hover:bg-blue-900/20 rounded transition-colors"
          title="تعديل"
        >
          <Edit className="w-4 h-4" />
        </motion.button>
        
        {subscriber.status === 'expired' ? (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleRenew(subscriber)}
            className="p-2 text-green-400 hover:bg-green-900/20 rounded transition-colors"
            title="تجديد الاشتراك"
          >
            <RefreshCw className="w-4 h-4" />
          </motion.button>
        ) : subscriber.status === 'frozen' ? (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleUnfreeze(subscriber)}
            className="p-2 text-green-400 hover:bg-green-900/20 rounded transition-colors"
            title="إلغاء التجميد"
          >
            <Play className="w-4 h-4" />
          </motion.button>
        ) : (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleFreeze(subscriber)}
            className="p-2 text-yellow-400 hover:bg-yellow-900/20 rounded transition-colors"
            title="تجميد"
          >
            <Snowflake className="w-4 h-4" />
          </motion.button>
        )}
        
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => handleDelete(subscriber)}
          className="p-2 text-red-400 hover:bg-red-900/20 rounded transition-colors"
          title="حذف"
        >
          <Trash2 className="w-4 h-4" />
        </motion.button>
      </div>
    </motion.div>
  );

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
          قائمة المشتركين
        </motion.h1>
        
        <div className="flex items-center gap-4">
          {!searchTerm.trim() && (
            <MonthSelector currentMonth={currentMonth} onMonthChange={setCurrentMonth} />
          )}
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setViewMode('cards')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'cards' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-400 hover:bg-gray-700'
              }`}
              title="عرض البطاقات"
            >
              <Grid3X3 className="w-5 h-5" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'list' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-400 hover:bg-gray-700'
              }`}
              title="عرض القائمة"
            >
              <List className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex flex-col md:flex-row gap-4 mb-6"
      >
        <div className="flex-1 relative">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder={searchTerm.trim() ? "البحث في جميع المشتركين النشطين..." : "البحث بالاسم أو الهاتف أو مكان الإقامة..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pr-12 pl-4 py-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-700 text-white transition-all duration-200"
          />
        </div>
        
        <div className="relative">
          <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="pr-12 pl-4 py-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-700 text-white transition-all duration-200"
          >
            <option value="all">جميع الحالات</option>
            <option value="active">نشط</option>
            <option value="expired">منتهي</option>
            <option value="frozen">مجمد</option>
          </select>
        </div>

        <div className="relative">
          <Users className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <select
            value={genderFilter}
            onChange={(e) => setGenderFilter(e.target.value as any)}
            className="pr-12 pl-4 py-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-700 text-white transition-all duration-200"
          >
            <option value="all">الكل</option>
            <option value="male">رجال</option>
            <option value="female">نساء</option>
          </select>
        </div>
      </motion.div>

      {searchTerm.trim() && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-3 bg-blue-900/20 border border-blue-800 rounded-lg"
        >
          <p className="text-blue-300 text-sm">
            البحث في جميع المشتركين النشطين • النتائج: {searchResults.length}
          </p>
        </motion.div>
      )}

      <AnimatePresence>
        {filteredSubscribersList.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="bg-gray-800 rounded-lg shadow-md p-8 text-center"
          >
            <UserX className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">لا توجد نتائج</h2>
            <p className="text-gray-400">
              {searchTerm || statusFilter !== 'all' || genderFilter !== 'all'
                ? 'لم يتم العثور على مشتركين يطابقون البحث'
                : 'لا يوجد مشتركين مسجلين لهذا الشهر'
              }
            </p>
          </motion.div>
        ) : (
          <>
            {genderFilter === 'all' || genderFilter === 'male' ? (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mb-8"
              >
                {maleSubscribers.length > 0 && (
                  <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2">
                    <Users className="w-6 h-6" />
                    المشتركين الرجال ({maleSubscribers.length})
                  </h2>
                )}
                <div className={viewMode === 'cards' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-3"}>
                  <AnimatePresence>
                    {maleSubscribers.map(subscriber => 
                      viewMode === 'cards' ? renderCard(subscriber) : renderListItem(subscriber)
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            ) : null}

            {genderFilter === 'all' || genderFilter === 'female' ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                {femaleSubscribers.length > 0 && (
                  <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2">
                    <Users className="w-6 h-6" />
                    المشتركات النساء ({femaleSubscribers.length})
                  </h2>
                )}
                <div className={viewMode === 'cards' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-3"}>
                  <AnimatePresence>
                    {femaleSubscribers.map(subscriber => 
                      viewMode === 'cards' ? renderCard(subscriber) : renderListItem(subscriber)
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            ) : null}
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {editingSubscriber && (
          <EditSubscriber
            subscriber={editingSubscriber}
            onClose={() => setEditingSubscriber(null)}
          />
        )}

        {attendanceSubscriber && (
          <AttendanceModal
            subscriber={attendanceSubscriber}
            onClose={() => setAttendanceSubscriber(null)}
          />
        )}

        {trainingTypeSubscriber && (
          <TrainingTypeModal
            isOpen={!!trainingTypeSubscriber}
            onClose={() => setTrainingTypeSubscriber(null)}
            onConfirm={handleTrainingTypeConfirm}
            subscriberName={trainingTypeSubscriber.name}
          />
        )}
      </AnimatePresence>

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