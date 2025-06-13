import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  Users, 
  UserPlus, 
  Package, 
  BarChart3, 
  Bell, 
  LogOut,
  User,
  Database,
  Receipt,
  GraduationCap,
  Info,
  Dumbbell
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AboutModal from './AboutModal';

interface SidebarProps {
  activeView: string;
  setActiveView: (view: any) => void;
}

export default function Sidebar({ activeView, setActiveView }: SidebarProps) {
  const { logout, user } = useAuth();
  const [showAbout, setShowAbout] = useState(false);

  const menuItems = [
    { id: 'subscribers', label: 'قائمة المشتركين', icon: Users },
    { id: 'add-subscriber', label: 'إضافة مشترك', icon: UserPlus },
    { id: 'individual-classes', label: 'الحصص الفردية', icon: GraduationCap },
    { id: 'workout-programs', label: 'برامج التمرين', icon: Dumbbell },
    { id: 'inventory', label: 'المخزون', icon: Package },
    { id: 'expenses', label: 'المصروفات', icon: Receipt },
    { id: 'statistics', label: 'الإحصائيات', icon: BarChart3 },
    { id: 'notifications', label: 'التنبيهات', icon: Bell },
    { id: 'database', label: 'قاعدة البيانات', icon: Database },
  ];

  return (
    <>
      <motion.div 
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-64 bg-gray-800 border-l border-gray-700 flex flex-col overflow-hidden"
      >
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-6 border-b border-gray-700 flex-shrink-0"
        >
          <div className="flex items-center gap-3">
            <motion.div 
              whileHover={{ scale: 1.1 }}
              className="bg-blue-900 w-12 h-12 rounded-full flex items-center justify-center"
            >
              <User className="w-6 h-6 text-blue-400" />
            </motion.div>
            <div>
              <h2 className="font-semibold text-white">مرحباً</h2>
              <p className="text-sm text-gray-400">{user}</p>
            </div>
          </div>
        </motion.div>

        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-2">
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              
              return (
                <motion.li 
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                >
                  <motion.button
                    whileHover={{ scale: 1.02, x: 5 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setActiveView(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-right transition-all duration-200 ${
                      isActive
                        ? 'bg-blue-900 text-blue-300 shadow-lg'
                        : 'text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {item.label}
                  </motion.button>
                </motion.li>
              );
            })}
          </ul>
        </nav>

        <div className="p-4 border-t border-gray-700 space-y-2 flex-shrink-0">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowAbout(true)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-blue-400 hover:bg-blue-900/20 transition-all duration-200"
          >
            <Info className="w-5 h-5" />
            حول البرنامج
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-900/20 transition-all duration-200"
          >
            <LogOut className="w-5 h-5" />
            تسجيل الخروج
          </motion.button>
        </div>
      </motion.div>

      <AboutModal isOpen={showAbout} onClose={() => setShowAbout(false)} />
    </>
  );
}