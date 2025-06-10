import React, { useRef, useState } from 'react';
import { useDatabase } from '../contexts/DatabaseContext';
import { useData } from '../contexts/DataContext';
import { Download, Upload, Database, AlertCircle, CheckCircle } from 'lucide-react';
import ConfirmDialog from './ConfirmDialog';

export default function DatabaseManager() {
  const { exportDatabase, importDatabase } = useDatabase();
  const { loadData } = useData();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    type?: 'warning' | 'success' | 'info';
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    type: 'warning'
  });

  const handleExport = () => {
    try {
      exportDatabase();
      setConfirmDialog({
        isOpen: true,
        title: 'نجح التصدير',
        message: 'تم تصدير قاعدة البيانات بنجاح. سيتم تحميل الملف تلقائياً.',
        onConfirm: () => setConfirmDialog(prev => ({ ...prev, isOpen: false })),
        type: 'success'
      });
    } catch (error) {
      setConfirmDialog({
        isOpen: true,
        title: 'خطأ في التصدير',
        message: 'حدث خطأ أثناء تصدير قاعدة البيانات. يرجى المحاولة مرة أخرى.',
        onConfirm: () => setConfirmDialog(prev => ({ ...prev, isOpen: false })),
        type: 'warning'
      });
    }
  };

  const handleImportClick = () => {
    setConfirmDialog({
      isOpen: true,
      title: 'تأكيد الاستيراد',
      message: 'سيتم استبدال جميع البيانات الحالية بالبيانات من الملف المستورد. هل أنت متأكد؟',
      onConfirm: () => {
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        fileInputRef.current?.click();
      },
      type: 'warning'
    });
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      await importDatabase(file);
      loadData(); // Reload data after import
      setConfirmDialog({
        isOpen: true,
        title: 'نجح الاستيراد',
        message: 'تم استيراد قاعدة البيانات بنجاح. تم تحديث جميع البيانات.',
        onConfirm: () => setConfirmDialog(prev => ({ ...prev, isOpen: false })),
        type: 'success'
      });
    } catch (error) {
      setConfirmDialog({
        isOpen: true,
        title: 'خطأ في الاستيراد',
        message: 'حدث خطأ أثناء استيراد قاعدة البيانات. تأكد من أن الملف صحيح.',
        onConfirm: () => setConfirmDialog(prev => ({ ...prev, isOpen: false })),
        type: 'warning'
      });
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg shadow-md p-6">
      <div className="flex items-center gap-3 mb-6">
        <Database className="w-6 h-6 text-blue-400" />
        <h2 className="text-xl font-semibold text-white">إدارة قاعدة البيانات</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-3">
            <Download className="w-5 h-5 text-green-400" />
            <h3 className="font-semibold text-white">تصدير قاعدة البيانات</h3>
          </div>
          <p className="text-gray-300 text-sm mb-4">
            احفظ نسخة احتياطية من جميع بياناتك في ملف SQLite
          </p>
          <button
            onClick={handleExport}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            تصدير البيانات
          </button>
        </div>

        <div className="bg-gray-700 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-3">
            <Upload className="w-5 h-5 text-blue-400" />
            <h3 className="font-semibold text-white">استيراد قاعدة البيانات</h3>
          </div>
          <p className="text-gray-300 text-sm mb-4">
            استعد البيانات من ملف SQLite محفوظ مسبقاً
          </p>
          <button
            onClick={handleImportClick}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 flex items-center justify-center gap-2"
          >
            <Upload className="w-4 h-4" />
            استيراد البيانات
          </button>
        </div>
      </div>

      <div className="mt-6 p-4 bg-yellow-900/20 border border-yellow-800 rounded-lg">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-400 mt-0.5" />
          <div>
            <h4 className="font-semibold text-yellow-400 mb-2">ملاحظات مهمة:</h4>
            <ul className="text-yellow-300 text-sm space-y-1">
              <li>• يتم حفظ البيانات تلقائياً كل 30 ثانية</li>
              <li>• استيراد قاعدة بيانات جديدة سيحل محل جميع البيانات الحالية</li>
              <li>• تأكد من تصدير نسخة احتياطية قبل الاستيراد</li>
              <li>• ملفات قاعدة البيانات لها امتداد .sqlite</li>
              <li>• لا تقم تعديل أي شيء هنا ما لم تكن متأكدًا تمامًا مما تقوم به</li>
            </ul>
          </div>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".sqlite,.db"
        onChange={handleFileChange}
        className="hidden"
      />

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
        type={confirmDialog.type}
      />
    </div>
  );
}