import React from 'react';
import { Subscriber, useData, AttendanceRecord } from '../contexts/DataContext';
import { X, Calendar, Check, Trash2, Dumbbell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AttendanceModalProps {
  subscriber: Subscriber;
  onClose: () => void;
}

export default function AttendanceModal({ subscriber, onClose }: AttendanceModalProps) {
  const { removeAttendance } = useData();
  const attendanceDates = subscriber.attendance.map(record => new Date(record.date));
  const sortedRecords = subscriber.attendance
    .map(record => ({
      ...record,
      dateObj: new Date(record.date)
    }))
    .sort((a, b) => b.dateObj.getTime() - a.dateObj.getTime());
  
  const today = new Date().toDateString();
  const hasAttendanceToday = subscriber.attendance.some(record => record.date === today);

  const handleRemoveAttendance = (dateString: string) => {
    const success = removeAttendance(subscriber.id, dateString);
    if (success && dateString === today) {
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

  const getTrainingTypeIcon = (type: string) => {
    const icons: { [key: string]: string } = {
      'chest': '💪',
      'back': '🏋️',
      'shoulders': '🤸',
      'triceps': '💪',
      'biceps': '💪',
      'legs': '🦵',
      'fullbody': '🏃'
    };
    return icons[type] || '💪';
  };

  const getTrainingTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      'chest': 'صدر',
      'back': 'ظهر',
      'shoulders': 'أكتاف',
      'triceps': 'ترايسبس',
      'biceps': 'بايسبس',
      'legs': 'أرجل',
      'fullbody': 'جسم كامل'
    };
    return labels[type] || type;
  };

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      >
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", duration: 0.3 }}
          className="bg-gray-800 rounded-xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-y-auto"
        >
          <div className="flex justify-between items-center p-6 border-b border-gray-700">
            <h2 className="text-xl font-bold text-white">سجل الحضور</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-300 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="p-6">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4"
            >
              <h3 className="text-lg font-semibold text-white">{subscriber.name}</h3>
              <p className="text-gray-400">إجمالي أيام الحضور: {subscriber.attendance.length}</p>
              {hasAttendanceToday && (
                <p className="text-green-400 text-sm mt-1">✓ حضر اليوم</p>
              )}
            </motion.div>

            {sortedRecords.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-8"
              >
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400">لا يوجد سجل حضور حتى الآن</p>
              </motion.div>
            ) : (
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {sortedRecords.map((record, index) => {
                  const isToday = record.date === today;
                  
                  return (
                    <motion.div 
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`p-4 rounded-lg border transition-all duration-200 ${
                        isToday ? 'bg-green-900/20 border-green-800' : 'bg-gray-700 border-gray-600'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Check className={`w-5 h-5 ${isToday ? 'text-green-400' : 'text-green-400'}`} />
                            <span className="text-white font-medium">
                              {record.dateObj.toLocaleDateString('ar-DZ', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                              {isToday && <span className="text-green-400 text-sm mr-2">(اليوم)</span>}
                            </span>
                          </div>
                          
                          {record.trainingTypes && record.trainingTypes.length > 0 && (
                            <div className="flex items-center gap-2 flex-wrap">
                              <Dumbbell className="w-4 h-4 text-blue-400" />
                              {record.trainingTypes.map((type, typeIndex) => (
                                <span 
                                  key={typeIndex}
                                  className="inline-flex items-center gap-1 px-2 py-1 bg-blue-900/30 text-blue-300 rounded-full text-xs"
                                >
                                  <span>{getTrainingTypeIcon(type)}</span>
                                  <span>{getTrainingTypeLabel(type)}</span>
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleRemoveAttendance(record.date)}
                          className="p-2 text-red-400 hover:bg-red-900/20 rounded-lg transition-colors"
                          title="إلغاء الحضور"
                        >
                          <Trash2 className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="p-6 border-t border-gray-700">
            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onClose}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200"
              >
                إغلاق
              </motion.button>
              {hasAttendanceToday && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCancelTodayAttendance}
                  className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-all duration-200"
                >
                  إلغاء حضور اليوم
                </motion.button>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}