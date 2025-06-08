import React from 'react';
import { Subscriber, useData } from '../contexts/DataContext';
import { X, Calendar, Check, Trash2 } from 'lucide-react';

interface AttendanceModalProps {
  subscriber: Subscriber;
  onClose: () => void;
}

export default function AttendanceModal({ subscriber, onClose }: AttendanceModalProps) {
  const { removeAttendance } = useData();
  const attendanceDates = subscriber.attendance.map(date => new Date(date));
  const sortedDates = attendanceDates.sort((a, b) => b.getTime() - a.getTime());
  const today = new Date().toDateString();
  const hasAttendanceToday = subscriber.attendance.includes(today);

  const handleRemoveAttendance = (dateString: string) => {
    const success = removeAttendance(subscriber.id, dateString);
    if (success && dateString === today) {
      // If we removed today's attendance, we can close the modal
      onClose();
    }
  };

  const handleCancelTodayAttendance = () => {
    if (hasAttendanceToday) {
      handleRemoveAttendance(today);
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white">سجل الحضور</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-300"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-white">{subscriber.name}</h3>
            <p className="text-gray-400">إجمالي أيام الحضور: {subscriber.attendance.length}</p>
            {hasAttendanceToday && (
              <p className="text-green-400 text-sm mt-1">✓ حضر اليوم</p>
            )}
          </div>

          {sortedDates.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400">لا يوجد سجل حضور حتى الآن</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {sortedDates.map((date, index) => {
                const dateString = date.toDateString();
                const isToday = dateString === today;
                
                return (
                  <div key={index} className={`flex items-center justify-between gap-3 p-3 rounded-lg ${
                    isToday ? 'bg-green-900/20 border border-green-800' : 'bg-gray-700'
                  }`}>
                    <div className="flex items-center gap-3">
                      <Check className={`w-5 h-5 ${isToday ? 'text-green-400' : 'text-green-400'}`} />
                      <span className="text-white">
                        {date.toLocaleDateString('ar-EG', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                        {isToday && <span className="text-green-400 text-sm mr-2">(اليوم)</span>}
                      </span>
                    </div>
                    
                    <button
                      onClick={() => handleRemoveAttendance(dateString)}
                      className="p-1 text-red-400 hover:bg-red-900/20 rounded transition-colors"
                      title="إلغاء الحضور"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-700">
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200"
            >
              إغلاق
            </button>
            {hasAttendanceToday && (
              <button
                onClick={handleCancelTodayAttendance}
                className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition duration-200"
              >
                إلغاء حضور اليوم
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}