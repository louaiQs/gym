import React from 'react';
import { X, Code, Mail, Calendar, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AboutModal({ isOpen, onClose }: AboutModalProps) {
  if (!isOpen) return null;

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
              <Code className="w-6 h-6 text-blue-400" />
              <h2 className="text-xl font-bold text-white">حول البرنامج</h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-300 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            <div className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="w-20 h-20 bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <Code className="w-10 h-10 text-blue-400" />
              </motion.div>
              <h3 className="text-2xl font-bold text-white mb-2">نظام إدارة الجيم</h3>
              <div className="flex items-center justify-center gap-2 text-gray-400">
                <Calendar className="w-4 h-4" />
                <span>الإصدار: 1.0</span>
              </div>
            </div>

            <div className="space-y-4 text-gray-300">
              <div className="flex items-start gap-3">
                <User className="w-5 h-5 text-blue-400 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-white">المطور</h4>
                  <p>عمارة محمد لؤي</p>
                </div>
              </div>

              <div className="text-sm leading-relaxed">
                <p className="mb-3">
                  هذا البرنامج مخصص لمساعدة مدراء الجيم على إدارة المشتركين، المنتجات، والمبيعات بسهولة وفعالية.
                </p>
                <p className="mb-3">
                  تم تطوير البرنامج ليكون بسيط الاستخدام، مع إمكانيات حفظ البيانات واستيرادها وتصديرها لضمان أمان وسهولة الوصول للمعلومات.
                </p>
                <p>
                  نسعى دائمًا لتطوير البرنامج وتحسينه لتلبية احتياجاتكم.
                </p>
              </div>

              <div className="border-t border-gray-700 pt-4">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-blue-400" />
                  <span>للدعم والاستفسار:</span>
                </div>
                <a 
                  href="mailto:amaramohamedlouai@gmail.com"
                  className="text-blue-400 hover:text-blue-300 transition-colors text-sm"
                >
                  amaramohamedlouai@gmail.com
                </a>
              </div>

              <div className="text-center text-xs text-gray-500 border-t border-gray-700 pt-4">
                حقوق النشر © 2025 جميع الحقوق محفوظة
              </div>
            </div>
          </div>

          <div className="p-6 border-t border-gray-700">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onClose}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200"
            >
              إغلاق
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}