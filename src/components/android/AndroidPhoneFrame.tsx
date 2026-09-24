import React, { useEffect, useState } from 'react';
import {
  Wifi,
  WifiOff,
  BatteryMedium,
  Smartphone,
  Maximize2,
  RefreshCw,
  UserCheck,
  Shield,
  Layers,
  Code2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface PhoneFrameProps {
  children: React.ReactNode;
  onOpenKotlinModal?: () => void;
}

export const AndroidPhoneFrame: React.FC<PhoneFrameProps> = ({ children, onOpenKotlinModal }) => {
  const {
    isDeviceFrame,
    setIsDeviceFrame,
    isOnline,
    setIsOnline,
    userRole,
    login,
    currentUser,
    employees,
    switchUser,
    pendingSyncCount,
    syncPendingRecords,
  } = useApp();

  const [currentTime, setCurrentTime] = useState<string>('09:41');
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      setCurrentTime(`${hours}:${minutes}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleManualSync = async () => {
    setIsSyncing(true);
    await syncPendingRecords();
    setTimeout(() => setIsSyncing(false), 800);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-start antialiased selection:bg-red-500 selection:text-white">
      {/* Top AI Studio / Quick Management Bar */}
      <header className="w-full bg-slate-900 border-b border-slate-800 px-4 py-2.5 flex flex-wrap items-center justify-between text-xs z-50 shadow-md">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5 font-bold tracking-wide text-red-500">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse"></span>
            <span className="text-white">AIRWIN</span>
            <span className="text-slate-400 font-normal">NATIVE ANDROID APP</span>
          </div>

          <span className="hidden sm:inline-block text-slate-600">|</span>

          {/* Role Switcher */}
          <div className="flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700">
            <button
              onClick={() => login('executive', employees[0].id)}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors flex items-center gap-1.5 ${
                userRole === 'executive'
                  ? 'bg-red-600 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              Sales Executive
            </button>
            <button
              onClick={() => login('admin')}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors flex items-center gap-1.5 ${
                userRole === 'admin'
                  ? 'bg-red-600 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              Admin / Manager
            </button>
          </div>

          {/* Quick executive chooser when in executive mode */}
          {userRole === 'executive' && (
            <select
              value={currentUser.id}
              onChange={(e) => switchUser(e.target.value)}
              className="bg-slate-800 text-slate-200 border border-slate-700 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-red-500 outline-none"
            >
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} ({emp.headquarter})
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="flex items-center space-x-2 mt-2 sm:mt-0">
          {/* Offline/Online field simulator */}
          <button
            onClick={() => setIsOnline(!isOnline)}
            title={isOnline ? 'Simulate field offline mode (No signal)' : 'Restore field connection'}
            className={`px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-1.5 border transition-all ${
              isOnline
                ? 'bg-emerald-950/80 text-emerald-400 border-emerald-800 hover:bg-emerald-900/60'
                : 'bg-amber-950/80 text-amber-300 border-amber-700 animate-pulse'
            }`}
          >
            {isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
            <span>{isOnline ? 'Online (Field)' : 'Offline (Field)'}</span>
          </button>

          {/* Sync Button */}
          {pendingSyncCount > 0 && (
            <button
              onClick={handleManualSync}
              disabled={isSyncing || !isOnline}
              className="px-2 py-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded text-xs flex items-center gap-1 font-medium transition-colors"
            >
              <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>Sync ({pendingSyncCount})</span>
            </button>
          )}

          {/* Kotlin Code Viewer Trigger */}
          {onOpenKotlinModal && (
            <button
              onClick={onOpenKotlinModal}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded text-xs flex items-center gap-1 font-medium transition-colors"
              title="Inspect Native Kotlin Jetpack Compose Code"
            >
              <Code2 className="w-3.5 h-3.5 text-red-400" />
              <span className="hidden md:inline">Kotlin Compose Code</span>
            </button>
          )}

          {/* Frame Toggle */}
          <button
            onClick={() => setIsDeviceFrame((prev) => !prev)}
            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 text-xs flex items-center gap-1"
            title={isDeviceFrame ? 'Switch to Full Screen View' : 'Switch to Android Mobile Mockup'}
          >
            {isDeviceFrame ? <Maximize2 className="w-3.5 h-3.5" /> : <Smartphone className="w-3.5 h-3.5" />}
            <span className="hidden md:inline">{isDeviceFrame ? 'Full View' : 'Phone Frame'}</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full flex items-center justify-center p-0 md:py-6 overflow-y-auto">
        {isDeviceFrame ? (
          /* Android Physical Phone Mockup Container */
          <div className="relative w-full max-w-[420px] h-[92vh] max-h-[880px] bg-black rounded-[46px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9),0_0_0_12px_#1e293b,0_0_0_14px_#334155] overflow-hidden flex flex-col border border-slate-700">
            {/* Phone Top Notch / Speaker & Camera */}
            <div className="absolute top-0 left-0 right-0 h-7 z-40 flex items-center justify-between px-7 pt-1 text-slate-800 pointer-events-none">
              <span className="text-[12px] font-bold text-white tracking-tight">{currentTime}</span>
              <div className="w-20 h-4 bg-black rounded-full flex items-center justify-center">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-800"></div>
              </div>
              <div className="flex items-center space-x-1.5 text-white">
                {isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5 text-amber-400" />}
                <span className="text-[10px] font-bold">5G</span>
                <BatteryMedium className="w-4 h-4 text-emerald-400" />
              </div>
            </div>

            {/* Offline notification banner if executive has no signal */}
            {!isOnline && (
              <div className="absolute top-7 left-0 right-0 z-30 bg-amber-500 text-slate-950 px-3 py-1 text-[11px] font-bold text-center flex items-center justify-center gap-1.5 shadow">
                <WifiOff className="w-3.5 h-3.5" />
                <span>OFFLINE MODE · Entries auto-save to phone & sync later</span>
              </div>
            )}

            {/* Android Screen Inner Viewport */}
            <div className="flex-1 w-full bg-slate-50 text-slate-900 pt-7 flex flex-col overflow-hidden relative">
              {children}
            </div>

            {/* Android Gesture Bar / Navigation Bar */}
            <div className="h-4 bg-slate-100 flex items-center justify-center border-t border-slate-200">
              <div className="w-32 h-1 bg-slate-400 rounded-full"></div>
            </div>
          </div>
        ) : (
          /* Full Screen Responsive View */
          <div className="w-full max-w-4xl min-h-[90vh] bg-slate-50 text-slate-900 rounded-xl shadow-2xl overflow-hidden flex flex-col relative border border-slate-800">
            {!isOnline && (
              <div className="bg-amber-500 text-slate-950 px-4 py-1.5 text-xs font-bold text-center flex items-center justify-center gap-2">
                <WifiOff className="w-4 h-4" />
                <span>OFFLINE MODE · Working locally. All entries will synchronize when internet resumes.</span>
              </div>
            )}
            <div className="flex-1 flex flex-col overflow-hidden">{children}</div>
          </div>
        )}
      </main>
    </div>
  );
};
