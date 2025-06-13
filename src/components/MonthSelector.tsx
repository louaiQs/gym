import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

interface MonthSelectorProps {
  currentMonth: string;
  onMonthChange: (month: string) => void;
  className?: string;
}

export default function MonthSelector({ currentMonth, onMonthChange, className = '' }: MonthSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [initialized, setInitialized] = useState(false);

  // توليد قائمة الأشهر مع تحديد الشهر الحالي
  const generateMonths = () => {
    const months = [];
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    // إنشاء 24 شهرًا ماضية و12 شهرًا مستقبلية
    for (let i = -24; i <= 12; i++) {
      const date = new Date(currentYear, currentMonth + i, 1);
      const monthValue = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const isCurrent = i === 0;
      
      months.push({
        value: monthValue,
        label: date.toLocaleDateString('ar-DZ', { year: 'numeric', month: 'long' }),
        isCurrentMonth: isCurrent
      });
    }

    return months.reverse(); // الأحدث أولاً
  };

  const months = generateMonths();
  
  // تحديد الشهر الحالي عند التحميل الأولي
  useEffect(() => {
    if (!initialized && months.length > 0) {
      const current = months.find(m => m.isCurrentMonth);
      if (current && !currentMonth) {
        onMonthChange(current.value);
      }
      setInitialized(true);
    }
  }, [currentMonth, months, onMonthChange, initialized]);

  const currentMonthData = months.find(m => m.value === currentMonth) || 
                         months.find(m => m.isCurrentMonth);

  const navigateMonth = (direction: 'prev' | 'next') => {
    const currentIndex = months.findIndex(m => m.value === currentMonth);
    if (direction === 'prev' && currentIndex < months.length - 1) {
      onMonthChange(months[currentIndex + 1].value);
    } else if (direction === 'next' && currentIndex > 0) {
      onMonthChange(months[currentIndex - 1].value);
    }
  };

  // إغلاق القائمة عند النقر خارجها
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // التمرير إلى الشهر المحدد عند فتح القائمة
  useEffect(() => {
    if (isOpen && scrollRef.current && currentMonth) {
      const currentElement = scrollRef.current.querySelector(`[data-month="${currentMonth}"]`);
      if (currentElement) {
        setTimeout(() => {
          currentElement.scrollIntoView({ block: 'center' });
        }, 10);
      }
    }
  }, [isOpen, currentMonth]);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="flex items-center gap-2 bg-gray-800 rounded-lg border border-gray-600 overflow-hidden">
        <button
          onClick={() => navigateMonth('prev')}
          className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
          title="الشهر السابق"
          disabled={months.findIndex(m => m.value === currentMonth) >= months.length - 1}
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-4 py-2 text-white hover:bg-gray-700 transition-colors min-w-[180px] justify-center"
        >
          <Calendar className="w-4 h-4" />
          <span className="font-medium">
            {currentMonthData?.label || 'اختر الشهر'}
          </span>
        </button>

        <button
          onClick={() => navigateMonth('next')}
          className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
          title="الشهر التالي"
          disabled={months.findIndex(m => m.value === currentMonth) <= 0}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-gray-800 border border-gray-600 rounded-lg shadow-xl z-50 max-h-80 overflow-hidden">
          <div 
            ref={scrollRef}
            className="overflow-y-auto max-h-80 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800"
          >
            {months.map((month) => (
              <button
                key={month.value}
                data-month={month.value}
                onClick={() => {
                  onMonthChange(month.value);
                  setIsOpen(false);
                }}
                className={`w-full px-4 py-3 text-right hover:bg-gray-700 transition-colors flex items-center justify-between ${
                  month.value === currentMonth 
                    ? 'bg-blue-900/50 text-blue-300 border-r-2 border-blue-500' 
                    : 'text-gray-300'
                }`}
              >
                <span className="font-medium">{month.label}</span>
                {month.isCurrentMonth && (
                  <span className="text-xs bg-green-600 text-white px-2 py-1 rounded-full">
                    الحالي
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}