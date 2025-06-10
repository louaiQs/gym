import React from 'react';
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
  Car
} from 'lucide-react';

interface SidebarProps {
  activeView: string;
  setActiveView: (view: any) => void;
}

export default function Sidebar({ activeView, setActiveView }: SidebarProps) {
  const { logout, user } = useAuth();

  const menuItems = [
    { id: 'subscribers', label: 'قائمة المشتركين', icon: Users },
    { id: 'add-subscriber', label: 'إضافة مشترك', icon: UserPlus },
    { id: 'inventory', label: 'المخزون', icon: Package },
    { id: 'statistics', label: 'الإحصائيات', icon: BarChart3 },
    { id: 'notifications', label: 'التنبيهات', icon: Bell },
    { id: 'database', label: 'قاعدة البيانات', icon: Database },
  ];

  return (
    <div className="w-64 bg-gray-800 border-l border-gray-700 flex flex-col">
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <div className="bg-blue-900 w-12 h-12 rounded-full flex items-center justify-center">
            <User className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h2 className="font-semibold text-white">مرحباً</h2>
            <p className="text-sm text-gray-400">{user}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            
            return (
              <li key={item.id}>
                <button
                  onClick={() => setActiveView(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-right transition-colors ${
                    isActive
                      ? 'bg-blue-900 text-blue-300'
                      : 'text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-700">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-900/20 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          تسجيل الخروج
        </button>
      </div>
    </div>
  );
}