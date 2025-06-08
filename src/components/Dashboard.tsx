import React, { useState } from 'react';
import Sidebar from './Sidebar';
import SubscribersList from './SubscribersList';
import AddSubscriber from './AddSubscriber';
import Inventory from './Inventory';
import Statistics from './Statistics';
import Notifications from './Notifications';
import DatabaseManager from './DatabaseManager';

type ActiveView = 'subscribers' | 'add-subscriber' | 'inventory' | 'statistics' | 'notifications' | 'database';

export default function Dashboard() {
  const [activeView, setActiveView] = useState<ActiveView>('subscribers');

  const renderContent = () => {
    switch (activeView) {
      case 'subscribers':
        return <SubscribersList />;
      case 'add-subscriber':
        return <AddSubscriber onSuccess={() => setActiveView('subscribers')} />;
      case 'inventory':
        return <Inventory />;
      case 'statistics':
        return <Statistics />;
      case 'notifications':
        return <Notifications />;
      case 'database':
        return <DatabaseManager />;
      default:
        return <SubscribersList />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="flex h-screen bg-gray-900">
        <Sidebar activeView={activeView} setActiveView={setActiveView} />
        <main className="flex-1 overflow-auto">
          <div className="p-6">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}