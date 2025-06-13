import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './Sidebar';
import SubscribersList from './SubscribersList';
import AddSubscriber from './AddSubscriber';
import IndividualClasses from './IndividualClasses';
import Inventory from './Inventory';
import Expenses from './Expenses';
import Statistics from './Statistics';
import Notifications from './Notifications';
import DatabaseManager from './DatabaseManager';
import WorkoutPrograms from './WorkoutPrograms';

type ActiveView = 'subscribers' | 'add-subscriber' | 'individual-classes' | 'inventory' | 'expenses' | 'statistics' | 'notifications' | 'database' | 'workout-programs';

export default function Dashboard() {
  const [activeView, setActiveView] = useState<ActiveView>('subscribers');
  const [renewSubscriber, setRenewSubscriber] = useState<any>(null);

  const renderContent = () => {
    const pageVariants = {
      initial: { opacity: 0, x: 20 },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: -20 }
    };

    const pageTransition = {
      type: "tween",
      ease: "anticipate",
      duration: 0.4
    };

    switch (activeView) {
      case 'subscribers':
        return (
          <motion.div
            key="subscribers"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={pageTransition}
          >
            <SubscribersList onRenewSubscriber={(subscriber) => {
              setRenewSubscriber(subscriber);
              setActiveView('add-subscriber');
            }} />
          </motion.div>
        );
      case 'add-subscriber':
        return (
          <motion.div
            key="add-subscriber"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={pageTransition}
          >
            <AddSubscriber 
              onSuccess={() => {
                setRenewSubscriber(null);
                setActiveView('subscribers');
              }}
              renewSubscriber={renewSubscriber}
            />
          </motion.div>
        );
      case 'individual-classes':
        return (
          <motion.div
            key="individual-classes"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={pageTransition}
          >
            <IndividualClasses />
          </motion.div>
        );
      case 'inventory':
        return (
          <motion.div
            key="inventory"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={pageTransition}
          >
            <Inventory />
          </motion.div>
        );
      case 'expenses':
        return (
          <motion.div
            key="expenses"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={pageTransition}
          >
            <Expenses />
          </motion.div>
        );
      case 'statistics':
        return (
          <motion.div
            key="statistics"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={pageTransition}
          >
            <Statistics />
          </motion.div>
        );
      case 'notifications':
        return (
          <motion.div
            key="notifications"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={pageTransition}
          >
            <Notifications />
          </motion.div>
        );
      case 'database':
        return (
          <motion.div
            key="database"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={pageTransition}
          >
            <DatabaseManager />
          </motion.div>
        );
      case 'workout-programs':
        return (
          <motion.div
            key="workout-programs"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={pageTransition}
          >
            <WorkoutPrograms />
          </motion.div>
        );
      default:
        return (
          <motion.div
            key="default"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={pageTransition}
          >
            <SubscribersList onRenewSubscriber={(subscriber) => {
              setRenewSubscriber(subscriber);
              setActiveView('add-subscriber');
            }} />
          </motion.div>
        );
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gray-900"
    >
      <div className="flex h-screen bg-gray-900 overflow-hidden">
        <Sidebar activeView={activeView} setActiveView={setActiveView} />
        <main className="flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto">
            <div className="p-6 min-h-full">
              <AnimatePresence mode="wait">
                {renderContent()}
              </AnimatePresence>
            </div>
          </div>
        </main>
      </div>
    </motion.div>
  );
}