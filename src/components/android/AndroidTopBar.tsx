import React from 'react';
import { ArrowLeft, User, Calendar, Bell, Settings } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AirwinLogo } from '../../utils/logoSvg';
import { formatDisplayDate } from '../../utils/formatters';

interface TopBarProps {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  actions?: React.ReactNode;
}

export const AndroidTopBar: React.FC<TopBarProps> = ({
  title,
  subtitle,
  showBack = false,
  onBack,
  actions,
}) => {
  const { currentUser, userRole, selectedDate, setActiveTab } = useApp();

  return (
    <div className="bg-red-700 text-white px-3.5 py-2.5 flex items-center justify-between shadow-md select-none shrink-0 z-20">
      <div className="flex items-center space-x-2.5">
        {showBack ? (
          <button
            onClick={onBack}
            className="p-1.5 -ml-1 rounded-full hover:bg-white/15 active:bg-white/25 transition-colors"
            title="Go back"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
        ) : (
          <div className="w-8 h-8 rounded-lg bg-white p-1 flex items-center justify-center shadow-inner">
            {/* Mini Airwin Symbol */}
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <polygon points="50,10 10,85 30,85 50,45" fill="#D32F2F" />
              <polygon points="50,10 90,85 70,85 50,45" fill="#B71C1C" />
              <polygon points="50,10 35,40 65,40" fill="#E53935" />
              <polygon points="50,55 35,85 65,85" fill="#1A2A56" />
            </svg>
          </div>
        )}

        <div className="flex flex-col">
          <h1 className="text-base font-bold tracking-tight text-white leading-tight flex items-center gap-1.5">
            {title || (userRole === 'admin' ? 'AIRWIN MANAGEMENT' : 'AIRWIN SALES')}
          </h1>
          <span className="text-[11px] text-red-100 font-medium tracking-wide">
            {subtitle || (userRole === 'admin' ? 'Agarsen Admin MIS' : currentUser.name)}
          </span>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        {actions ? (
          actions
        ) : (
          <>
            <div className="flex items-center bg-red-800/80 px-2 py-1 rounded text-[11px] font-medium text-red-100 border border-red-600/60">
              <Calendar className="w-3 h-3 mr-1 text-red-200" />
              <span>{formatDisplayDate(selectedDate, false)}</span>
            </div>

            <button
              onClick={() => setActiveTab('settings')}
              className="p-1.5 rounded-full hover:bg-white/15 active:bg-white/25 transition-colors text-white"
              title="Settings & Profile"
            >
              <Settings className="w-4 h-4" />
            </button>
          </>
        )}
      </div>
    </div>
  );
};
