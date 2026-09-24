import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { AndroidPhoneFrame } from './components/android/AndroidPhoneFrame';
import { AndroidTopBar } from './components/android/AndroidTopBar';
import { AndroidBottomNav } from './components/android/AndroidBottomNav';
import { LoginScreen } from './components/auth/LoginScreen';
import { ExecutiveDashboard } from './components/dashboard/ExecutiveDashboard';
import { AdminDashboard } from './components/dashboard/AdminDashboard';
import { TravelList } from './components/travel/TravelList';
import { TravelEntryForm } from './components/travel/TravelEntryForm';
import { VisitList } from './components/visits/VisitList';
import { VisitEntryForm } from './components/visits/VisitEntryForm';
import { ExpenseList } from './components/expenses/ExpenseList';
import { ExpenseEntryForm } from './components/expenses/ExpenseEntryForm';
import { DailySummaryView } from './components/reports/DailySummaryView';
import { MonthlyReportView } from './components/reports/MonthlyReportView';
import { ExecutivesManager } from './components/profile/ExecutivesManager';
import { SettingsScreen } from './components/profile/SettingsScreen';
import { Bell, X } from 'lucide-react';

const MainNavigator: React.FC = () => {
  const {
    isLoggedIn,
    userRole,
    activeTab,
    setActiveTab,
    notificationMessage,
    dismissNotification,
  } = useApp();

  if (!isLoggedIn) {
    return <LoginScreen />;
  }

  // Determine screen component and top bar title
  const renderScreen = () => {
    switch (activeTab) {
      case 'home':
        return <ExecutiveDashboard />;
      case 'dashboard':
        return <AdminDashboard />;
      case 'visits':
        return <VisitList />;
      case 'add_visit':
        return (
          <div className="flex-1 overflow-y-auto bg-slate-100 p-3 pb-24">
            <VisitEntryForm
              onSuccess={() => setActiveTab('visits')}
              onCancel={() => setActiveTab('home')}
            />
          </div>
        );
      case 'travel':
        return <TravelList />;
      case 'add_travel':
        return (
          <div className="flex-1 overflow-y-auto bg-slate-100 p-3 pb-24">
            <TravelEntryForm
              onSuccess={() => setActiveTab('travel')}
              onCancel={() => setActiveTab('home')}
            />
          </div>
        );
      case 'expense':
        return <ExpenseList />;
      case 'add_expense':
        return (
          <div className="flex-1 overflow-y-auto bg-slate-100 p-3 pb-24">
            <ExpenseEntryForm
              onSuccess={() => setActiveTab('expense')}
              onCancel={() => setActiveTab('home')}
            />
          </div>
        );
      case 'view_today':
        return <DailySummaryView />;
      case 'report':
        return <MonthlyReportView />;
      case 'executives':
        return <ExecutivesManager />;
      case 'settings':
        return <SettingsScreen />;
      default:
        return userRole === 'admin' ? <AdminDashboard /> : <ExecutiveDashboard />;
    }
  };

  const getTopBarConfig = () => {
    switch (activeTab) {
      case 'add_visit':
        return { title: 'NEW VISIT', showBack: true, onBack: () => setActiveTab('home') };
      case 'add_travel':
        return { title: 'NEW TRAVEL', showBack: true, onBack: () => setActiveTab('home') };
      case 'add_expense':
        return { title: 'NEW EXPENSE', showBack: true, onBack: () => setActiveTab('home') };
      case 'view_today':
        return { title: 'DAILY SUMMARY', showBack: true, onBack: () => setActiveTab('home') };
      case 'settings':
        return { title: 'PROFILE & CONFIG', showBack: true, onBack: () => setActiveTab('home') };
      case 'dashboard':
        return { title: 'ADMIN MIS DASHBOARD' };
      case 'executives':
        return { title: 'SALES EXECUTIVES' };
      case 'visits':
        return { title: 'CUSTOMER VISITS' };
      case 'travel':
        return { title: 'DAILY TRAVEL' };
      case 'expense':
        return { title: 'DAILY EXPENSES' };
      case 'report':
        return { title: 'MONTHLY REPORT' };
      default:
        return {
          title: userRole === 'admin' ? 'AIRWIN MANAGEMENT' : 'AIRWIN SALES',
        };
    }
  };

  const topBarProps = getTopBarConfig();

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-100 relative">
      {/* Material 3 Top App Bar */}
      <AndroidTopBar {...topBarProps} />

      {/* Floating Notification Toast (Requirement 22) */}
      {notificationMessage && (
        <div className="absolute top-14 left-3 right-3 z-40 bg-slate-900 text-white text-xs p-3 rounded-2xl shadow-xl flex items-start justify-between gap-2 border border-slate-700 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-start gap-2">
            <Bell className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
            <span className="font-medium">{notificationMessage}</span>
          </div>
          <button
            onClick={dismissNotification}
            className="p-1 rounded-full hover:bg-white/20 text-slate-400 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Dynamic View Area */}
      {renderScreen()}

      {/* Material 3 Bottom Navigation Bar */}
      <AndroidBottomNav />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AndroidPhoneFrame>
        <MainNavigator />
      </AndroidPhoneFrame>
    </AppProvider>
  );
}
