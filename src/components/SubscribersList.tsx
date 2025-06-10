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
  Droplets
} from 'lucide-react';
import EditSubscriber from './EditSubscriber';
import AttendanceModal from './AttendanceModal';
import ConfirmDialog from './ConfirmDialog';

export default function SubscribersList() {
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
    setViewMode 
  } = useData();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'expired' | 'frozen'>('all');
  const [genderFilter, setGenderFilter] = useState<'all' | 'male' | 'female'>('all');
  const [editingSubscriber, setEditingSubscriber] = useState<Subscriber | null>(null);
  const [attendanceSubscriber, setAttendanceSubscriber] = useState<Subscriber | null>(null);
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

  const handleMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentMonth(e.target.value);
  };

  // Sort subscribers: active/frozen by expiry date (newest first), then expired at bottom
  const sortedSubscribers = [...filteredSubscribers].sort((a, b) => {
    if (a.status === 'expired' && b.status === 'expired') {
      return new Date(b.expiryDate).getTime() - new Date(a.expiryDate).getTime();
    }
    
    if (a.status === 'expired' && b.status !== 'expired') return 1;
    if (a.status !== 'expired' && b.status === 'expired') return -1;
    
    return new Date(b.expiryDate).getTime() - new Date(a.expiryDate).getTime();
  });

  const filteredSubscribersList = sortedSubscribers.filter(subscriber => {
    const matchesSearch = subscriber.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (subscriber.phone && subscriber.phone.includes(searchTerm)) ||
                         subscriber.residence.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || subscriber.status === statusFilter;
    const matchesGender = genderFilter === 'all' || subscriber.gender === genderFilter;
    
    return matchesSearch && matchesStatus && matchesGender;
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

    const success = recordAttendance(subscriber.id);
    if (!success) {
      setConfirmDialog({
        isOpen: true,
        title: 'تنبيه',
        message: 'تم تسجيل الحضور بالفعل لهذا اليوم',
        onConfirm: () => setConfirmDialog(prev => ({ ...prev, isOpen: false })),
        type: 'warning'
      });
    } else {
      setConfirmDialog({
        isOpen: true,
        title: 'نجح',
        message: 'تم تسجيل الحضور بنجاح',
        onConfirm: () => setConfirmDialog(prev => ({ ...prev, isOpen: false })),
        type: 'success'
      });
    }
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

  const renderCard = (subscriber: Subscriber) => (
    <div key={subscriber.id} className="bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-white">{subscriber.name}</h3>
          <div className="flex gap-2 mt-2">
            <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(subscriber.status)}`}>
              {getStatusText(subscriber.status)}
            </span>
            {subscriber.shower && (
              <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-blue-900/20 text-blue-400">
                <Droplets className="inline w-3 h-3 ml-1" />
                استحمام
              </span>
            )}
          </div>
        </div>
        
        <div className="flex gap-2">
          <button
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
          </button>
          <button
            onClick={() => setAttendanceSubscriber(subscriber)}
            className="p-2 text-purple-400 hover:bg-purple-900/20 rounded-lg transition-colors"
            title="سجل الحضور"
          >
            <Calendar className="w-4 h-4" />
          </button>
          <button
            onClick={() => setEditingSubscriber(subscriber)}
            className="p-2 text-blue-400 hover:bg-blue-900/20 rounded-lg transition-colors"
            title="تعديل"
          >
            <Edit className="w-4 h-4" />
          </button>
          
          {subscriber.status === 'frozen' ? (
            <button
              onClick={() => handleUnfreeze(subscriber)}
              className="p-2 text-green-400 hover:bg-green-900/20 rounded-lg transition-colors"
              title="إلغاء التجميد"
            >
              <Play className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => handleFreeze(subscriber)}
              className={`p-2 rounded-lg transition-colors ${
                subscriber.status === 'expired'
                  ? 'text-gray-400 hover:bg-gray-700 cursor-not-allowed'
                  : 'text-yellow-400 hover:bg-yellow-900/20'
              }`}
              title={subscriber.status === 'expired' ? 'غير متاح' : 'تجميد'}
              disabled={subscriber.status === 'expired'}
            >
              <Snowflake className="w-4 h-4" />
            </button>
          )}
          
          <button
            onClick={() => handleDelete(subscriber)}
            className="p-2 text-red-400 hover:bg-red-900/20 rounded-lg transition-colors"
            title="حذف"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="space-y-2 text-sm text-gray-400 mb-4">
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
          <span>{subscriber.price} دج {subscriber.shower && '(مع الاستحمام)'}</span>
        </div>
        
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          <span>ينتهي: {new Date(subscriber.expiryDate).toLocaleDateString('ar-EG')}</span>
        </div>
        
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4" />
          <span className={subscriber.status === 'expired' ? 'text-red-400' : 'text-gray-400'}>
            {getDaysRemaining(subscriber.expiryDate, subscriber.status)}
          </span>
        </div>
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
    </div>
  );

  const renderListItem = (subscriber: Subscriber) => (
    <div key={subscriber.id} className="bg-gray-800 rounded-lg p-4 flex items-center justify-between hover:bg-gray-750 transition-colors">
      <div className="flex items-center gap-4 flex-1">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <h3 className="font-semibold text-white">{subscriber.name}</h3>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(subscriber.status)}`}>
              {getStatusText(subscriber.status)}
            </span>
            {subscriber.shower && (
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-900/20 text-blue-400">
                <Droplets className="inline w-3 h-3" />
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-4 text-sm text-gray-400">
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
              {new Date(subscriber.expiryDate).toLocaleDateString('ar-EG')}
            </span>
            <span className={`flex items-center gap-1 ${subscriber.status === 'expired' ? 'text-red-400' : ''}`}>
              <Clock className="w-3 h-3" />
              {getDaysRemaining(subscriber.expiryDate, subscriber.status)}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
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
        </button>
        
        <button
          onClick={() => setAttendanceSubscriber(subscriber)}
          className="p-2 text-purple-400 hover:bg-purple-900/20 rounded transition-colors"
          title="سجل الحضور"
        >
          <Calendar className="w-4 h-4" />
        </button>
        
        <button
          onClick={() => setEditingSubscriber(subscriber)}
          className="p-2 text-blue-400 hover:bg-blue-900/20 rounded transition-colors"
          title="تعديل"
        >
          <Edit className="w-4 h-4" />
        </button>
        
        {subscriber.status === 'frozen' ? (
          <button
            onClick={() => handleUnfreeze(subscriber)}
            className="p-2 text-green-400 hover:bg-green-900/20 rounded transition-colors"
            title="إلغاء التجميد"
          >
            <Play className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={() => handleFreeze(subscriber)}
            className={`p-2 rounded transition-colors ${
              subscriber.status === 'expired'
                ? 'text-gray-400 hover:bg-gray-700 cursor-not-allowed'
                : 'text-yellow-400 hover:bg-yellow-900/20'
            }`}
            title={subscriber.status === 'expired' ? 'غير متاح' : 'تجميد'}
            disabled={subscriber.status === 'expired'}
          >
            <Snowflake className="w-4 h-4" />
          </button>
        )}
        
        <button
          onClick={() => handleDelete(subscriber)}
          className="p-2 text-red-400 hover:bg-red-900/20 rounded transition-colors"
          title="حذف"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white">قائمة المشتركين</h1>
        
        <div className="flex items-center gap-4">
          <label className="text-gray-300">اختر الشهر:</label>
          <input
            type="month"
            value={currentMonth}
            onChange={handleMonthChange}
            className="bg-gray-700 text-white px-3 py-2 rounded border border-gray-600"
          />
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('cards')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'cards' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-400 hover:bg-gray-700'
              }`}
              title="عرض البطاقات"
            >
              <Grid3X3 className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'list' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-400 hover:bg-gray-700'
              }`}
              title="عرض القائمة"
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="البحث بالاسم أو الهاتف أو مكان الإقامة..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pr-12 pl-4 py-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-700 text-white"
          />
        </div>
        
        <div className="relative">
          <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="pr-12 pl-4 py-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-700 text-white"
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
            className="pr-12 pl-4 py-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-700 text-white"
          >
            <option value="all">الكل</option>
            <option value="male">رجال</option>
            <option value="female">نساء</option>
          </select>
        </div>
      </div>

      {filteredSubscribersList.length === 0 ? (
        <div className="bg-gray-800 rounded-lg shadow-md p-8 text-center">
          <UserX className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">لا توجد نتائج</h2>
          <p className="text-gray-400">
            {searchTerm || statusFilter !== 'all' || genderFilter !== 'all'
              ? 'لم يتم العثور على مشتركين يطابقون البحث'
              : 'لا يوجد مشتركين مسجلين لهذا الشهر'
            }
          </p>
        </div>
      ) : (
        <>
          {genderFilter === 'all' || genderFilter === 'male' ? (
            <div className="mb-8">
              {maleSubscribers.length > 0 && (
                <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2">
                  <Users className="w-6 h-6" />
                  المشتركين الرجال ({maleSubscribers.length})
                </h2>
              )}
              <div className={viewMode === 'cards' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-3"}>
                {maleSubscribers.map(subscriber => 
                  viewMode === 'cards' ? renderCard(subscriber) : renderListItem(subscriber)
                )}
              </div>
            </div>
          ) : null}

          {genderFilter === 'all' || genderFilter === 'female' ? (
            <div>
              {femaleSubscribers.length > 0 && (
                <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2">
                  <Users className="w-6 h-6" />
                  المشتركات النساء ({femaleSubscribers.length})
                </h2>
              )}
              <div className={viewMode === 'cards' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-3"}>
                {femaleSubscribers.map(subscriber => 
                  viewMode === 'cards' ? renderCard(subscriber) : renderListItem(subscriber)
                )}
              </div>
            </div>
          ) : null}
        </>
      )}

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