import React from 'react';
import { useData } from '../contexts/DataContext';
import { Users, DollarSign, AlertTriangle, Calendar, UserCheck, Package, TrendingUp, TrendingDown, GraduationCap } from 'lucide-react';
import { motion } from 'framer-motion';
import MonthSelector from './MonthSelector';

export default function Statistics() {
  const { 
    subscribers, 
    filteredSubscribers, 
    sales, 
    filteredSales, 
    products, 
    expenses,
    filteredExpenses,
    individualClasses,
    filteredIndividualClasses,
    currentMonth, 
    setCurrentMonth 
  } = useData();

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

  // Revenue from individual classes
  const individualClassesRevenue = filteredIndividualClasses.reduce((sum, cls) => sum + cls.price, 0);

  // Total expenses for the month
  const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);

  // Total revenue (subscriptions + product profits + individual classes)
  const totalRevenue = subscriptionRevenue + productSalesRevenue + individualClassesRevenue;

  // Net profit (revenue - expenses)
  const netProfit = totalRevenue - totalExpenses;

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
      title: 'إيرادات الحصص الفردية',
      value: `${individualClassesRevenue} دج`,
      icon: GraduationCap,
      color: 'bg-indigo-500',
      textColor: 'text-indigo-400'
    },
    {
      title: 'إجمالي المصروفات',
      value: `${totalExpenses.toFixed(2)} دج`,
      icon: TrendingDown,
      color: 'bg-red-600',
      textColor: 'text-red-400'
    },
    {
      title: 'صافي الربح',
      value: `${netProfit.toFixed(2)} دج`,
      icon: netProfit >= 0 ? TrendingUp : TrendingDown,
      color: netProfit >= 0 ? 'bg-green-600' : 'bg-red-600',
      textColor: netProfit >= 0 ? 'text-green-400' : 'text-red-400'
    }
  ];

  // Expenses by category
  const expensesByCategory = filteredExpenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {} as Record<string, number>);

  const categoryLabels: Record<string, string> = {
    rent: 'إيجار',
    equipment: 'معدات',
    salary: 'رواتب',
    utilities: 'فواتير',
    maintenance: 'صيانة',
    other: 'أخرى'
  };

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
          الإحصائيات العامة
        </motion.h1>
        <MonthSelector currentMonth={currentMonth} onMonthChange={setCurrentMonth} />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400">{stat.title}</p>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                </div>
                <motion.div 
                  whileHover={{ scale: 1.1 }}
                  className={`p-3 rounded-full ${stat.color}`}
                >
                  <Icon className="w-6 h-6 text-white" />
                </motion.div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-800 rounded-xl shadow-lg p-6"
        >
          <h2 className="text-xl font-semibold text-white mb-4">توزيع المشتركين النشطين حسب الجنس</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">الرجال</span>
              <div className="flex items-center gap-2">
                <div className="w-32 bg-gray-700 rounded-full h-2">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ 
                      width: totalActiveAndFrozen > 0 ? `${(maleSubscribers / totalActiveAndFrozen) * 100}%` : '0%' 
                    }}
                    transition={{ delay: 0.5, duration: 1 }}
                    className="bg-blue-600 h-2 rounded-full"
                  ></motion.div>
                </div>
                <span className="text-sm font-medium text-white">{maleSubscribers}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">النساء</span>
              <div className="flex items-center gap-2">
                <div className="w-32 bg-gray-700 rounded-full h-2">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ 
                      width: totalActiveAndFrozen > 0 ? `${(femaleSubscribers / totalActiveAndFrozen) * 100}%` : '0%' 
                    }}
                    transition={{ delay: 0.7, duration: 1 }}
                    className="bg-pink-600 h-2 rounded-full"
                  ></motion.div>
                </div>
                <span className="text-sm font-medium text-white">{femaleSubscribers}</span>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gray-800 rounded-xl shadow-lg p-6"
        >
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
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gray-800 rounded-xl shadow-lg p-6"
        >
          <h2 className="text-xl font-semibold text-white mb-4">تفاصيل الإيرادات والمصروفات</h2>
          <div className="space-y-3">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="flex justify-between items-center p-3 bg-purple-900/20 rounded-lg"
            >
              <span className="text-gray-300">إيرادات الاشتراكات</span>
              <span className="font-bold text-purple-400">{subscriptionRevenue} دج</span>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
              className="flex justify-between items-center p-3 bg-emerald-900/20 rounded-lg"
            >
              <span className="text-gray-300">أرباح المبيعات</span>
              <span className="font-bold text-emerald-400">{productSalesRevenue.toFixed(2)} دج</span>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 }}
              className="flex justify-between items-center p-3 bg-indigo-900/20 rounded-lg"
            >
              <span className="text-gray-300">إيرادات الحصص الفردية</span>
              <span className="font-bold text-indigo-400">{individualClassesRevenue} دج</span>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.9 }}
              className="flex justify-between items-center p-3 bg-blue-900/20 rounded-lg"
            >
              <span className="text-gray-300">إجمالي الإيرادات</span>
              <span className="font-bold text-blue-400">{Number(totalRevenue).toFixed(2)} دج</span>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.0 }}
              className="flex justify-between items-center p-3 bg-red-900/20 rounded-lg"
            >
              <span className="text-gray-300">إجمالي المصروفات</span>
              <span className="font-bold text-red-400">{totalExpenses.toFixed(2)} دج</span>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.1 }}
              className={`flex justify-between items-center p-3 rounded-lg border ${
                netProfit >= 0 ? 'bg-green-900/20 border-green-700' : 'bg-red-900/20 border-red-700'
              }`}
            >
              <span className="text-white font-semibold">صافي الربح</span>
              <span className={`font-bold text-lg ${netProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {netProfit.toFixed(2)} دج
              </span>
            </motion.div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-gray-800 rounded-xl shadow-lg p-6"
        >
          <h2 className="text-xl font-semibold text-white mb-4">المصروفات حسب الفئة</h2>
          <div className="space-y-3">
            {Object.entries(expensesByCategory).map(([category, amount], index) => (
              <motion.div 
                key={category}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + index * 0.1 }}
                className="flex justify-between items-center p-3 bg-gray-700 rounded-lg"
              >
                <span className="text-gray-300">{categoryLabels[category] || category}</span>
                <span className="font-bold text-red-400">{amount.toFixed(2)} دج</span>
              </motion.div>
            ))}
            {Object.keys(expensesByCategory).length === 0 && (
              <p className="text-gray-400 text-center py-4">لا توجد مصروفات لهذا الشهر</p>
            )}
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-gray-800 rounded-xl shadow-lg p-6"
        >
          <h2 className="text-xl font-semibold text-white mb-4">معلومات المخزون</h2>
          <div className="space-y-3">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 }}
              className="flex justify-between items-center p-3 bg-blue-900/20 rounded-lg"
            >
              <span className="text-gray-300">عدد المنتجات</span>
              <span className="font-bold text-blue-400">{products.length}</span>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.9 }}
              className="flex justify-between items-center p-3 bg-indigo-900/20 rounded-lg"
            >
              <span className="text-gray-300">قيمة المخزون</span>
              <span className="font-bold text-indigo-400">{inventoryValue.toFixed(2)} دج</span>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.0 }}
              className="flex justify-between items-center p-3 bg-orange-900/20 rounded-lg"
            >
              <span className="text-gray-300">عدد المبيعات</span>
              <span className="font-bold text-orange-400">{filteredSales.length}</span>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.1 }}
              className="flex justify-between items-center p-3 bg-purple-900/20 rounded-lg"
            >
              <span className="text-gray-300">عدد الحصص الفردية</span>
              <span className="font-bold text-purple-400">{filteredIndividualClasses.length}</span>
            </motion.div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-gray-800 rounded-xl shadow-lg p-6"
        >
          <h2 className="text-xl font-semibold text-white mb-4">نظرة عامة سريعة</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.9, type: "spring" }}
              className="text-center p-4 bg-green-900/20 rounded-lg"
            >
              <div className="text-2xl font-bold text-green-400">
                {totalActiveAndFrozen > 0 ? ((activeSubscribers / totalActiveAndFrozen) * 100).toFixed(1) : '0'}%
              </div>
              <div className="text-sm text-gray-400">معدل النشاط</div>
            </motion.div>
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 1.0, type: "spring" }}
              className="text-center p-4 bg-yellow-900/20 rounded-lg"
            >
              <div className="text-2xl font-bold text-yellow-400">
                {totalActiveAndFrozen > 0 ? ((frozenSubscribers / totalActiveAndFrozen) * 100).toFixed(1) : '0'}%
              </div>
              <div className="text-sm text-gray-400">معدل التجميد</div>
            </motion.div>
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 1.1, type: "spring" }}
              className="text-center p-4 bg-red-900/20 rounded-lg"
            >
              <div className="text-2xl font-bold text-red-400">
                {filteredSubscribers.length > 0 ? ((expiredSubscribers / filteredSubscribers.length) * 100).toFixed(1) : '0'}%
              </div>
              <div className="text-sm text-gray-400">معدل الانتهاء</div>
            </motion.div>
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 1.2, type: "spring" }}
              className={`text-center p-4 rounded-lg ${
                netProfit >= 0 ? 'bg-green-900/20' : 'bg-red-900/20'
              }`}
            >
              <div className={`text-2xl font-bold ${netProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : '0'}%
              </div>
              <div className="text-sm text-gray-400">هامش الربح</div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}