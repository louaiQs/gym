
import React from 'react';
import { useData } from '../contexts/DataContext';
import { Users, DollarSign, AlertTriangle, Calendar, UserCheck, Package, TrendingUp } from 'lucide-react';

export default function Statistics() {
  const { subscribers, filteredSubscribers, sales, filteredSales, products, currentMonth, setCurrentMonth } = useData();

  const handleMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentMonth(e.target.value);
  };

  // Count only active and frozen subscribers (exclude expired)
  const activeSubscribers = filteredSubscribers.filter(s => s.status === 'active').length;
  const frozenSubscribers = filteredSubscribers.filter(s => s.status === 'frozen').length;
  const expiredSubscribers = filteredSubscribers.filter(s => s.status === 'expired').length;
  const totalActiveAndFrozen = activeSubscribers + frozenSubscribers;
  
  const maleSubscribers = filteredSubscribers.filter(s => s.gender === 'male' && s.status !== 'expired').length;
  const femaleSubscribers = filteredSubscribers.filter(s => s.gender === 'female' && s.status !== 'expired').length;

  // Revenue from active and frozen subscriptions (both are paid)
  const subscriptionRevenue = filteredSubscribers
    .filter(s => s.status === 'active' || s.status === 'frozen')
    .reduce((sum, s) => sum + s.price, 0);

  // Revenue from product sales (profit only)
  const productSalesRevenue = filteredSales.reduce((sum, sale) => sum + sale.profit, 0);

  // Total revenue (subscriptions + product profits)
  const totalRevenue = subscriptionRevenue + productSalesRevenue;

  // Inventory value (for display only, not included in revenue)
  const inventoryValue = products.reduce((sum, p) => sum + (p.purchasePrice * p.quantity), 0);

  const expiringSoon = filteredSubscribers.filter(s => {
    if (s.status !== 'active') return false;
    const expiry = new Date(s.expiryDate);
    const today = new Date();
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7 && diffDays > 0;
  }).length;

  // Calculate attendance only for active and frozen subscribers
  const activeAndFrozenSubscribers = filteredSubscribers.filter(s => s.status !== 'expired');
  const totalAttendance = activeAndFrozenSubscribers.reduce((sum, s) => sum + s.attendance.length, 0);
  const avgAttendance = activeAndFrozenSubscribers.length > 0 ? (totalAttendance / activeAndFrozenSubscribers.length).toFixed(1) : '0';

  const stats = [
    {
      title: 'إجمالي المشتركين',
      value: totalActiveAndFrozen,
      icon: Users,
      color: 'bg-blue-500',
      textColor: 'text-blue-400'
    },
    {
      title: 'المشتركين النشطين',
      value: activeSubscribers,
      icon: UserCheck,
      color: 'bg-green-500',
      textColor: 'text-green-400'
    },
    {
      title: 'الاشتراكات المجمدة',
      value: frozenSubscribers,
      icon: Calendar,
      color: 'bg-yellow-500',
      textColor: 'text-yellow-400'
    },
    {
      title: 'الاشتراكات المنتهية',
      value: expiredSubscribers,
      icon: AlertTriangle,
      color: 'bg-red-500',
      textColor: 'text-red-400'
    },
    {
      title: 'إيرادات الاشتراكات',
      value: `${subscriptionRevenue} دج`,
      icon: DollarSign,
      color: 'bg-purple-500',
      textColor: 'text-purple-400'
    },
    {
      title: 'أرباح المبيعات',
      value: `${productSalesRevenue.toFixed(2)} دج`,
      icon: TrendingUp,
      color: 'bg-emerald-500',
      textColor: 'text-emerald-400'
    },
    {
      title: 'إجمالي الإيرادات',
      value: `${totalRevenue.toFixed(2)} دج`,
      icon: DollarSign,
      color: 'bg-green-600',
      textColor: 'text-green-400'
    },
    {
      title: 'تنتهي قريباً',
      value: expiringSoon,
      icon: AlertTriangle,
      color: 'bg-orange-500',
      textColor: 'text-orange-400'
    }
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white">الإحصائيات العامة</h1>
        <div className="flex items-center gap-4">
          <label className="text-gray-300">اختر الشهر:</label>
          <input
            type="month"
            value={currentMonth}
            onChange={handleMonthChange}
            className="bg-gray-700 text-white px-3 py-2 rounded border border-gray-600"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-gray-800 rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400">{stat.title}</p>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-full ${stat.color}`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-white mb-4">توزيع المشتركين النشطين حسب الجنس</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">الرجال</span>
              <div className="flex items-center gap-2">
                <div className="w-32 bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ 
                      width: totalActiveAndFrozen > 0 ? `${(maleSubscribers / totalActiveAndFrozen) * 100}%` : '0%' 
                    }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-white">{maleSubscribers}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">النساء</span>
              <div className="flex items-center gap-2">
                <div className="w-32 bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-pink-600 h-2 rounded-full" 
                    style={{ 
                      width: totalActiveAndFrozen > 0 ? `${(femaleSubscribers / totalActiveAndFrozen) * 100}%` : '0%' 
                    }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-white">{femaleSubscribers}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-white mb-4">إحصائيات الحضور</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">إجمالي أيام الحضور</span>
              <span className="text-2xl font-bold text-blue-400">{totalAttendance}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">متوسط الحضور للمشترك النشط</span>
              <span className="text-xl font-semibold text-green-400">{avgAttendance} يوم</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-white mb-4">تفاصيل الإيرادات</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-purple-900/20 rounded-lg">
              <span className="text-gray-300">إيرادات الاشتراكات</span>
              <span className="font-bold text-purple-400">{subscriptionRevenue} دج</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-emerald-900/20 rounded-lg">
              <span className="text-gray-300">أرباح المبيعات</span>
              <span className="font-bold text-emerald-400">{productSalesRevenue.toFixed(2)} دج</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-green-900/20 rounded-lg border border-green-700">
              <span className="text-white font-semibold">إجمالي الإيرادات</span>
              <span className="font-bold text-green-400 text-lg">{totalRevenue.toFixed(2)} دج</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-white mb-4">معلومات المخزون</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-blue-900/20 rounded-lg">
              <span className="text-gray-300">عدد المنتجات</span>
              <span className="font-bold text-blue-400">{products.length}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-indigo-900/20 rounded-lg">
              <span className="text-gray-300">قيمة المخزون</span>
              <span className="font-bold text-indigo-400">{inventoryValue.toFixed(2)} دج</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-orange-900/20 rounded-lg">
              <span className="text-gray-300">عدد المبيعات</span>
              <span className="font-bold text-orange-400">{filteredSales.length}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-white mb-4">نظرة عامة سريعة</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-green-900/20 rounded-lg">
            <div className="text-2xl font-bold text-green-400">
              {totalActiveAndFrozen > 0 ? ((activeSubscribers / totalActiveAndFrozen) * 100).toFixed(1) : '0'}%
            </div>
            <div className="text-sm text-gray-400">معدل النشاط</div>
          </div>
          <div className="text-center p-4 bg-yellow-900/20 rounded-lg">
            <div className="text-2xl font-bold text-yellow-400">
              {totalActiveAndFrozen > 0 ? ((frozenSubscribers / totalActiveAndFrozen) * 100).toFixed(1) : '0'}%
            </div>
            <div className="text-sm text-gray-400">معدل التجميد</div>
          </div>
          <div className="text-center p-4 bg-red-900/20 rounded-lg">
            <div className="text-2xl font-bold text-red-400">
              {filteredSubscribers.length > 0 ? ((expiredSubscribers / filteredSubscribers.length) * 100).toFixed(1) : '0'}%
            </div>
            <div className="text-sm text-gray-400">معدل الانتهاء</div>
          </div>
        </div>
      </div>
    </div>
  );
}
