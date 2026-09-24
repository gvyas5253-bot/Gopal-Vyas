import React from 'react';
import {
  Home,
  Users,
  Compass,
  Receipt,
  FileBarChart2,
  LayoutDashboard,
  UserCheck,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface NavTab {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

export const AndroidBottomNav: React.FC = () => {
  const { userRole, activeTab, setActiveTab, visitRecords } = useApp();

  const executiveTabs: NavTab[] = [
    { id: 'home', label: 'HOME', icon: Home },
    { id: 'visits', label: 'VISITS', icon: Users, badge: visitRecords.length },
    { id: 'travel', label: 'TRAVEL', icon: Compass },
    { id: 'expense', label: 'EXPENSE', icon: Receipt },
    { id: 'report', label: 'REPORT', icon: FileBarChart2 },
  ];

  const adminTabs: NavTab[] = [
    { id: 'dashboard', label: 'DASHBOARD', icon: LayoutDashboard },
    { id: 'executives', label: 'EXECUTIVES', icon: UserCheck },
    { id: 'visits', label: 'VISITS', icon: Users },
    { id: 'expense', label: 'EXPENSES', icon: Receipt },
    { id: 'report', label: 'REPORTS', icon: FileBarChart2 },
  ];

  const tabs = userRole === 'admin' ? adminTabs : executiveTabs;

  return (
    <nav className="bg-white border-t border-slate-200 px-2 py-1.5 flex items-center justify-around shadow-lg select-none shrink-0 z-20">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive =
          activeTab === tab.id ||
          (tab.id === 'home' && activeTab === 'view_today') ||
          (tab.id === 'visits' && activeTab === 'visit_detail');

        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="flex-1 flex flex-col items-center justify-center py-1 group focus:outline-none transition-all"
          >
            {/* Material 3 active indicator pill */}
            <div
              className={`relative px-4 py-1 rounded-full transition-all duration-200 flex items-center justify-center ${
                isActive
                  ? 'bg-red-100 text-red-700 font-bold scale-105'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px] text-red-700' : 'stroke-[1.8px]'}`} />
              {tab.badge !== undefined && tab.badge > 0 && tab.id === 'visits' && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                  {tab.badge > 99 ? '99+' : tab.badge}
                </span>
              )}
            </div>
            <span
              className={`text-[10px] tracking-tight mt-1 transition-colors ${
                isActive ? 'font-bold text-red-700' : 'font-medium text-slate-500'
              }`}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
