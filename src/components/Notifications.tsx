import React from 'react';
import { useData } from '../contexts/DataContext';
import { Bell, AlertTriangle, Clock, CheckCircle } from 'lucide-react';

export default function Notifications() {
  const { subscribers } = useData();

  const expiredSubscribers = subscribers.filter(s => s.status === 'expired');
  const expiringSoon = subscribers.filter(s => {
    if (s.status !== 'active') return false;
    const expiry = new Date(s.expiryDate);
    const today = new Date();
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7 && diffDays > 0;
  });

  const frozenSubscribers = subscribers.filter(s => s.status === 'frozen');

  const notifications = [
    ...expiredSubscribers.map(subscriber => ({
      type: 'expired' as const,
      title: 'اشتراك منتهي',
      message: `انتهى اشتراك ${subscriber.name}`,
      date: subscriber.expiryDate,
      subscriber
    })),
    ...expiringSoon.map(subscriber => {
      const expiry = new Date(subscriber.expiryDate);
      const today = new Date();
      const diffTime = expiry.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      return {
        type: 'expiring' as const,
        title: 'اشتراك ينتهي قريباً',
        message: `سينتهي اشتراك ${subscriber.name} خلال ${diffDays} ${diffDays === 1 ? 'يوم' : 'أيام'}`,
        date: subscriber.expiryDate,
        subscriber
      };
    }),
    ...frozenSubscribers.map(subscriber => ({
      type: 'frozen' as const,
      title: 'اشتراك مجمد',
      message: `اشتراك ${subscriber.name} مجمد حالياً`,
      date: subscriber.expiryDate,
      subscriber
    }))
  ];

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'expired':
        return <AlertTriangle className="w-5 h-5 text-red-400" />;
      case 'expiring':
        return <Clock className="w-5 h-5 text-orange-400" />;
      case 'frozen':
        return <Bell className="w-5 h-5 text-yellow-400" />;
      default:
        return <Bell className="w-5 h-5 text-blue-400" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'expired':
        return 'border-r-red-500 bg-red-900/20';
      case 'expiring':
        return 'border-r-orange-500 bg-orange-900/20';
      case 'frozen':
        return 'border-r-yellow-500 bg-yellow-900/20';
      default:
        return 'border-r-blue-500 bg-blue-900/20';
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-6">التنبيهات والإشعارات</h1>
      
      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-red-900/20 border border-red-800 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-red-400" />
            <div>
              <h3 className="font-semibold text-red-400">اشتراكات منتهية</h3>
              <p className="text-2xl font-bold text-red-400">{expiredSubscribers.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-orange-900/20 border border-orange-800 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <Clock className="w-6 h-6 text-orange-400" />
            <div>
              <h3 className="font-semibold text-orange-400">تنتهي قريباً</h3>
              <p className="text-2xl font-bold text-orange-400">{expiringSoon.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-yellow-900/20 border border-yellow-800 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <Bell className="w-6 h-6 text-yellow-400" />
            <div>
              <h3 className="font-semibold text-yellow-400">اشتراكات مجمدة</h3>
              <p className="text-2xl font-bold text-yellow-400">{frozenSubscribers.length}</p>
            </div>
          </div>
        </div>
      </div>

      {notifications.length === 0 ? (
        <div className="bg-gray-800 rounded-lg shadow-md p-8 text-center">
          <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">لا توجد تنبيهات</h2>
          <p className="text-gray-400">جميع الاشتراكات في حالة جيدة</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification, index) => (
            <div key={index} className={`border-r-4 ${getNotificationColor(notification.type)} rounded-lg p-4`}>
              <div className="flex items-start gap-4">
                {getNotificationIcon(notification.type)}
                <div className="flex-1">
                  <h3 className="font-semibold text-white">{notification.title}</h3>
                  <p className="text-gray-300 mt-1">{notification.message}</p>
                  <p className="text-sm text-gray-400 mt-2">
                    تاريخ الانتهاء: {new Date(notification.date).toLocaleDateString('ar-EG')}
                  </p>
                  {notification.subscriber.phone && (
                    <p className="text-sm text-gray-400">
                      رقم الهاتف: {notification.subscriber.phone}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}