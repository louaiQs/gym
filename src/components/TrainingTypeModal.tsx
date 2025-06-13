import React, { useState } from 'react';
import { X, Dumbbell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface TrainingTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (trainingTypes: string[]) => void;
  subscriberName: string;
}

const trainingTypes = [
  { id: 'chest', label: 'صدر', icon: '💪' },
  { id: 'back', label: 'ظهر', icon: '🏋️' },
  { id: 'shoulders', label: 'أكتاف', icon: '🤸' },
  { id: 'triceps', label: 'ترايسبس', icon: '💪' },
  { id: 'biceps', label: 'بايسبس', icon: '💪' },
  { id: 'legs', label: 'أرجل', icon: '🦵' },
  { id: 'fullbody', label: 'جسم كامل', icon: '🏃' }
];

export default function TrainingTypeModal({ isOpen, onClose, onConfirm, subscriberName }: TrainingTypeModalProps) {
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);

  if (!isOpen) return null;

  const handleTypeToggle = (typeId: string) => {
    if (typeId === 'fullbody') {
      // If full body is selected, clear all others and select only full body
      setSelectedTypes(['fullbody']);
    } else {
      // If any other type is selected
      let newTypes = selectedTypes.filter(t => t !== 'fullbody'); // Remove full body first
      
      if (newTypes.includes(typeId)) {
        newTypes = newTypes.filter(t => t !== typeId);
      } else {
        newTypes = [...newTypes, typeId];
      }
      
      // If all individual types are selected, switch to full body
      const individualTypes = trainingTypes.filter(t => t.id !== 'fullbody').map(t => t.id);
      if (newTypes.length === individualTypes.length) {
        newTypes = ['fullbody'];
      }
      
      setSelectedTypes(newTypes);
    }
  };

  const handleConfirm = () => {
    if (selectedTypes.length === 0) return;
    onConfirm(selectedTypes);
    setSelectedTypes([]);
    onClose();
  };

  const handleCancel = () => {
    setSelectedTypes([]);
    onClose();
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
          className="bg-gray-800 rounded-xl shadow-2xl max-w-md w-full"
        >
          <div className="flex justify-between items-center p-6 border-b border-gray-700">
            <div className="flex items-center gap-3">
              <Dumbbell className="w-6 h-6 text-blue-400" />
              <h2 className="text-xl font-bold text-white">نوع التمرين</h2>
            </div>
            <button
              onClick={handleCancel}
              className="text-gray-400 hover:text-gray-300 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="p-6">
            <p className="text-gray-300 mb-4">
              اختر نوع التمرين لـ <span className="font-semibold text-white">{subscriberName}</span>
            </p>
            
            <div className="grid grid-cols-2 gap-3 mb-6">
              {trainingTypes.map((type) => (
                <motion.button
                  key={type.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleTypeToggle(type.id)}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                    selectedTypes.includes(type.id)
                      ? 'border-blue-500 bg-blue-900/30 text-blue-300'
                      : 'border-gray-600 bg-gray-700 text-gray-300 hover:border-gray-500'
                  }`}
                >
                  <div className="text-2xl mb-2">{type.icon}</div>
                  <div className="font-medium">{type.label}</div>
                </motion.button>
              ))}
            </div>

            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleConfirm}
                disabled={selectedTypes.length === 0}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200"
              >
                تأكيد
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleCancel}
                className="px-6 py-3 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-all duration-200"
              >
                إلغاء
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}