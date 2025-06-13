import React, { useState, useEffect } from 'react';
import { useData } from '../contexts/DataContext';
import { Dumbbell, Wifi, WifiOff, User, Target, Calendar, AlertTriangle, Loader2, Save, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ConfirmDialog from './ConfirmDialog';

interface WorkoutForm {
  memberId: string;
  memberName: string;
  age: number;
  height: number;
  weight: number;
  workoutGoal: 'weight_loss' | 'muscle_gain' | 'strength' | 'endurance' | 'general_fitness';
  fitnessLevel: 'beginner' | 'intermediate' | 'advanced';
  trainingDays: number;
  injuries: string;
}

interface WorkoutProgram {
  id: string;
  memberId: string;
  memberName: string;
  program: any;
  createdAt: string;
}

export default function WorkoutPrograms() {
  const { subscribers } = useData();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [workoutPrograms, setWorkoutPrograms] = useState<WorkoutProgram[]>([]);
  const [showProgram, setShowProgram] = useState<WorkoutProgram | null>(null);
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

  const [formData, setFormData] = useState<WorkoutForm>({
    memberId: '',
    memberName: '',
    age: 0,
    height: 0,
    weight: 0,
    workoutGoal: 'general_fitness',
    fitnessLevel: 'beginner',
    trainingDays: 3,
    injuries: ''
  });

  // Check internet connectivity
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Load saved workout programs
  useEffect(() => {
    const saved = localStorage.getItem('workout_programs');
    if (saved) {
      setWorkoutPrograms(JSON.parse(saved));
    }
  }, []);

  // Get active members only
  const activeMembers = subscribers.filter(sub => sub.status === 'active');

  const handleMemberSelect = (member: any) => {
    if (!isOnline) {
      setConfirmDialog({
        isOpen: true,
        title: 'لا يوجد اتصال بالإنترنت',
        message: 'يجب الاتصال بالإنترنت لإنشاء برنامج تمرين جديد',
        onConfirm: () => setConfirmDialog(prev => ({ ...prev, isOpen: false })),
        type: 'warning'
      });
      return;
    }

    setSelectedMember(member);
    setFormData({
      memberId: member.id,
      memberName: member.name,
      age: member.age || 25,
      height: member.height || 170,
      weight: member.weight || 70,
      workoutGoal: 'general_fitness',
      fitnessLevel: 'beginner',
      trainingDays: 3,
      injuries: ''
    });
    setShowForm(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Create structured prompt for Mistral API
      const prompt = createWorkoutPrompt(formData);
      
      // Call Mistral API
      const workoutProgram = await generateWorkoutProgram(prompt);
      
      // Save program locally
      const newProgram: WorkoutProgram = {
        id: Date.now().toString(),
        memberId: formData.memberId,
        memberName: formData.memberName,
        program: workoutProgram,
        createdAt: new Date().toISOString()
      };

      const updatedPrograms = [...workoutPrograms, newProgram];
      setWorkoutPrograms(updatedPrograms);
      localStorage.setItem('workout_programs', JSON.stringify(updatedPrograms));

      setConfirmDialog({
        isOpen: true,
        title: 'تم إنشاء البرنامج بنجاح',
        message: 'تم إنشاء برنامج التمرين وحفظه محلياً',
        onConfirm: () => {
          setConfirmDialog(prev => ({ ...prev, isOpen: false }));
          setShowForm(false);
          setSelectedMember(null);
        },
        type: 'success'
      });

    } catch (error) {
      console.error('Error generating workout program:', error);
      setConfirmDialog({
        isOpen: true,
        title: 'خطأ في إنشاء البرنامج',
        message: 'حدث خطأ أثناء إنشاء برنامج التمرين. يرجى المحاولة مرة أخرى.',
        onConfirm: () => setConfirmDialog(prev => ({ ...prev, isOpen: false })),
        type: 'warning'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createWorkoutPrompt = (data: WorkoutForm): string => {
    return `Create a comprehensive workout program for a ${data.age}-year-old person with the following specifications:

Physical Stats:
- Age: ${data.age} years
- Height: ${data.height} cm
- Weight: ${data.weight} kg
- BMI: ${(data.weight / Math.pow(data.height / 100, 2)).toFixed(1)}

Fitness Profile:
- Primary Goal: ${getGoalText(data.workoutGoal)}
- Fitness Level: ${data.fitnessLevel}
- Training Days per Week: ${data.trainingDays}
- Injuries/Limitations: ${data.injuries || 'None'}

Please provide:
1. A detailed weekly workout schedule
2. Specific exercises with sets, reps, and rest periods
3. Progressive overload recommendations
4. Nutrition guidelines
5. Recovery and rest day activities
6. Safety considerations and modifications

Format the response as a structured JSON with clear sections for each day and exercise details.`;
  };

  const getGoalText = (goal: string): string => {
    const goals = {
      'weight_loss': 'Weight Loss and Fat Burning',
      'muscle_gain': 'Muscle Building and Hypertrophy',
      'strength': 'Strength and Power Development',
      'endurance': 'Cardiovascular Endurance',
      'general_fitness': 'General Fitness and Health'
    };
    return goals[goal as keyof typeof goals] || goal;
  };

  const generateWorkoutProgram = async (prompt: string): Promise<any> => {
    try {
      const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer xOKmA6whuvojiqVEH0pTWdkXRJsT7DET'
        },
        body: JSON.stringify({
          model: 'mistral-large-latest',
          messages: [
            {
              role: 'system',
              content: 'You are a professional fitness trainer and exercise physiologist. Create detailed, safe, and effective workout programs based on individual needs and goals.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 2000,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('Mistral API Error:', error);
      // Fallback to ExerciseDB API or return a basic program
      return await generateFallbackProgram(prompt);
    }
  };

  const generateFallbackProgram = async (prompt: string): Promise<any> => {
    // Basic fallback program structure
    return {
      program_name: `برنامج تمرين مخصص لـ ${formData.memberName}`,
      duration: `${formData.trainingDays} أيام في الأسبوع`,
      goal: getGoalText(formData.workoutGoal),
      level: formData.fitnessLevel,
      weekly_schedule: {
        day_1: {
          name: "تمرين الجزء العلوي",
          exercises: [
            { name: "Push-ups", sets: 3, reps: "8-12", rest: "60s" },
            { name: "Pull-ups", sets: 3, reps: "5-8", rest: "90s" },
            { name: "Dumbbell Press", sets: 3, reps: "10-12", rest: "60s" }
          ]
        },
        day_2: {
          name: "تمرين الجزء السفلي",
          exercises: [
            { name: "Squats", sets: 3, reps: "12-15", rest: "90s" },
            { name: "Lunges", sets: 3, reps: "10 each leg", rest: "60s" },
            { name: "Deadlifts", sets: 3, reps: "8-10", rest: "120s" }
          ]
        }
      },
      notes: "برنامج أساسي - يُنصح بالتشاور مع مدرب مختص"
    };
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'age' || name === 'height' || name === 'weight' || name === 'trainingDays' 
        ? parseInt(value) || 0 
        : value
    }));
  };

  const workoutGoals = [
    { value: 'weight_loss', label: 'فقدان الوزن' },
    { value: 'muscle_gain', label: 'بناء العضلات' },
    { value: 'strength', label: 'زيادة القوة' },
    { value: 'endurance', label: 'تحسين التحمل' },
    { value: 'general_fitness', label: 'لياقة عامة' }
  ];

  const fitnessLevels = [
    { value: 'beginner', label: 'مبتدئ' },
    { value: 'intermediate', label: 'متوسط' },
    { value: 'advanced', label: 'متقدم' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-6xl mx-auto"
    >
      <div className="flex justify-between items-center mb-6">
        <motion.h1 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-3xl font-bold text-white flex items-center gap-3"
        >
          <Dumbbell className="w-8 h-8" />
          برامج التمرين
        </motion.h1>
        
        <div className="flex items-center gap-2">
          {isOnline ? (
            <div className="flex items-center gap-2 text-green-400">
              <Wifi className="w-5 h-5" />
              <span className="text-sm">متصل</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-red-400">
              <WifiOff className="w-5 h-5" />
              <span className="text-sm">غير متصل</span>
            </div>
          )}
        </div>
      </div>

      {/* Loading Screen */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="bg-gray-800 rounded-xl p-8 text-center max-w-md mx-4"
            >
              <Loader2 className="w-12 h-12 text-blue-400 mx-auto mb-4 animate-spin" />
              <h3 className="text-xl font-semibold text-white mb-2">جاري إنشاء البرنامج</h3>
              <p className="text-gray-400">يتم تحليل البيانات وإنشاء برنامج تمرين مخصص...</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Member Selection */}
      {!showForm && !showProgram && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Active Members */}
            <div className="bg-gray-800 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <User className="w-5 h-5" />
                المشتركين النشطين ({activeMembers.length})
              </h2>
              
              {activeMembers.length === 0 ? (
                <div className="text-center py-8">
                  <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-400">لا يوجد مشتركين نشطين</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {activeMembers.map((member) => (
                    <motion.div
                      key={member.id}
                      whileHover={{ x: 5 }}
                      className="flex items-center justify-between p-3 bg-gray-700 rounded-lg"
                    >
                      <div>
                        <h3 className="font-medium text-white">{member.name}</h3>
                        <p className="text-sm text-gray-400">
                          {member.age ? `${member.age} سنة` : ''} • {member.gender === 'male' ? 'ذكر' : 'أنثى'}
                        </p>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleMemberSelect(member)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                      >
                        اختيار
                      </motion.button>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Saved Programs */}
            <div className="bg-gray-800 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <Save className="w-5 h-5" />
                البرامج المحفوظة ({workoutPrograms.length})
              </h2>
              
              {workoutPrograms.length === 0 ? (
                <div className="text-center py-8">
                  <Dumbbell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-400">لا توجد برامج محفوظة</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {workoutPrograms.map((program) => (
                    <motion.div
                      key={program.id}
                      whileHover={{ x: 5 }}
                      className="flex items-center justify-between p-3 bg-gray-700 rounded-lg"
                    >
                      <div>
                        <h3 className="font-medium text-white">{program.memberName}</h3>
                        <p className="text-sm text-gray-400">
                          {new Date(program.createdAt).toLocaleDateString('ar-DZ')}
                        </p>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowProgram(program)}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        عرض
                      </motion.button>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Workout Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-gray-800 rounded-xl p-6"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-white">
                إنشاء برنامج تمرين لـ {selectedMember?.name}
              </h2>
              <button
                onClick={() => {
                  setShowForm(false);
                  setSelectedMember(null);
                }}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    العمر
                  </label>
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    min="10"
                    max="100"
                    required
                    className="w-full px-4 py-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-700 text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    الطول (سم)
                  </label>
                  <input
                    type="number"
                    name="height"
                    value={formData.height}
                    onChange={handleChange}
                    min="100"
                    max="250"
                    required
                    className="w-full px-4 py-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-700 text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    الوزن (كغ)
                  </label>
                  <input
                    type="number"
                    name="weight"
                    value={formData.weight}
                    onChange={handleChange}
                    min="30"
                    max="300"
                    required
                    className="w-full px-4 py-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-700 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    هدف التمرين
                  </label>
                  <select
                    name="workoutGoal"
                    value={formData.workoutGoal}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-700 text-white"
                  >
                    {workoutGoals.map(goal => (
                      <option key={goal.value} value={goal.value}>{goal.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    مستوى اللياقة
                  </label>
                  <select
                    name="fitnessLevel"
                    value={formData.fitnessLevel}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-700 text-white"
                  >
                    {fitnessLevels.map(level => (
                      <option key={level.value} value={level.value}>{level.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  أيام التمرين في الأسبوع
                </label>
                <input
                  type="number"
                  name="trainingDays"
                  value={formData.trainingDays}
                  onChange={handleChange}
                  min="1"
                  max="7"
                  required
                  className="w-full px-4 py-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-700 text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  الإصابات أو القيود (اختياري)
                </label>
                <textarea
                  name="injuries"
                  value={formData.injuries}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-700 text-white"
                  placeholder="اذكر أي إصابات أو قيود جسدية..."
                />
              </div>

              <div className="flex gap-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={!isOnline}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <Target className="w-5 h-5" />
                  إنشاء البرنامج
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setSelectedMember(null);
                  }}
                  className="px-6 py-3 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-all duration-200"
                >
                  إلغاء
                </motion.button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Program Display */}
      <AnimatePresence>
        {showProgram && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-gray-800 rounded-xl p-6"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-white">
                برنامج تمرين {showProgram.memberName}
              </h2>
              <button
                onClick={() => setShowProgram(null)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="bg-gray-700 rounded-lg p-6">
              <pre className="text-gray-300 whitespace-pre-wrap text-sm overflow-auto max-h-96">
                {typeof showProgram.program === 'string' 
                  ? showProgram.program 
                  : JSON.stringify(showProgram.program, null, 2)
                }
              </pre>
            </div>

            <div className="mt-4 text-sm text-gray-400">
              تم الإنشاء في: {new Date(showProgram.createdAt).toLocaleString('ar-DZ')}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
        type={confirmDialog.type}
      />
    </motion.div>
  );
}