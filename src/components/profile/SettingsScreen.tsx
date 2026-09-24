import React, { useState } from 'react';
import {
  User,
  Shield,
  RefreshCw,
  LogOut,
  Target,
  Award,
  Building,
  Phone,
  MapPin,
  CheckCircle,
  Database,
  Info,
  ChevronRight,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AirwinLogo } from '../../utils/logoSvg';
import { formatCompactRupees, formatRupees } from '../../utils/formatters';

export const SettingsScreen: React.FC = () => {
  const {
    currentUser,
    userRole,
    setUserRole,
    setCurrentUser,
    employees,
    monthlyTargets,
    updateMonthlyTarget,
    syncPendingRecords,
    isSyncing,
    pendingSyncCount,
    logout,
    setActiveTab,
  } = useApp();

  const [salesTarget, setSalesTarget] = useState<string>('1200000');
  const [visitTarget, setVisitTarget] = useState<string>('90');
  const [collectionTarget, setCollectionTarget] = useState<string>('950000');
  const [targetSaved, setTargetSaved] = useState<boolean>(false);

  const handleSwitchExecutive = (empId: string) => {
    const found = employees.find((e) => e.id === empId);
    if (found) {
      setCurrentUser(found);
    }
  };

  const handleSaveTargets = async (e: React.FormEvent) => {
    e.preventDefault();
    const currentMonth = new Date().toISOString().substring(0, 7);
    await updateMonthlyTarget(currentUser.id, currentMonth, {
      salesTarget: parseFloat(salesTarget) || 1000000,
      visitTarget: parseInt(visitTarget, 10) || 80,
      collectionTarget: parseFloat(collectionTarget) || 800000,
      workingDaysTarget: 24,
      productiveVisitTarget: 55,
      kmTarget: 1600,
    });
    setTargetSaved(true);
    setTimeout(() => setTargetSaved(false), 2500);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-100 p-3 pb-24 space-y-4 select-none">
      {/* Profile Card */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-red-600 to-red-700 text-white flex items-center justify-center font-black text-xl shadow-md">
            {currentUser.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold text-red-600 uppercase bg-red-50 px-1.5 py-0.5 rounded">
                {userRole === 'admin' ? 'SYSTEM ADMINISTRATOR' : currentUser.designation}
              </span>
            </div>
            <h3 className="text-base font-black text-slate-900 mt-0.5">{currentUser.name}</h3>
            <span className="text-xs text-slate-500 font-medium">
              {currentUser.headquarter} · {currentUser.assignedTerritory}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100">
          <div className="p-2 bg-slate-50 rounded-xl">
            <span className="text-[10px] text-slate-400 block uppercase">Employee ID</span>
            <span className="font-bold text-slate-800">{currentUser.employeeId}</span>
          </div>
          <div className="p-2 bg-slate-50 rounded-xl">
            <span className="text-[10px] text-slate-400 block uppercase">Mobile</span>
            <span className="font-bold text-slate-800">{currentUser.mobile}</span>
          </div>
        </div>
      </div>

      {/* Role & Switch User (For rapid testing) */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-red-600" />
            <h4 className="font-bold text-xs text-slate-900 uppercase">User Role Switcher</h4>
          </div>
          <span className="text-xs font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded-full">
            Active: {userRole.toUpperCase()}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setUserRole('executive')}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
              userRole === 'executive'
                ? 'bg-red-600 text-white shadow-sm'
                : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border'
            }`}
          >
            Sales Executive
          </button>
          <button
            onClick={() => setUserRole('admin')}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
              userRole === 'admin'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border'
            }`}
          >
            Admin / Manager
          </button>
        </div>

        {/* Switch Executive */}
        <div className="pt-2 border-t border-slate-100">
          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
            Simulate As Sales Executive:
          </label>
          <select
            value={currentUser.id}
            onChange={(e) => handleSwitchExecutive(e.target.value)}
            className="w-full px-2.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 outline-none"
          >
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.name} ({emp.headquarter}) - {emp.employeeId}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* CLOUD SYNC & OFFLINE DATA (Requirement 18) */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-emerald-600" />
            <h4 className="font-bold text-xs text-slate-900 uppercase">Offline-First Sync Engine</h4>
          </div>
          <span
            className={`text-xs font-bold px-2 py-0.5 rounded-full ${
              pendingSyncCount === 0
                ? 'bg-emerald-50 text-emerald-700'
                : 'bg-amber-50 text-amber-700'
            }`}
          >
            {pendingSyncCount === 0 ? 'All Synced' : `${pendingSyncCount} Pending`}
          </span>
        </div>

        <p className="text-xs text-slate-500">
          Sales reports, GPS KM and visits are stored locally first on device storage. Automatic sync triggers when online.
        </p>

        <button
          onClick={syncPendingRecords}
          disabled={isSyncing}
          className="w-full py-2.5 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
          <span>{isSyncing ? 'Synchronizing with Firestore...' : 'Force Cloud Sync Now'}</span>
        </button>
      </div>

      {/* MONTHLY TARGET CONFIGURATION (Requirement 26) */}
      <form onSubmit={handleSaveTargets} className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-red-600" />
            <h4 className="font-bold text-xs text-slate-900 uppercase">Monthly Target Setting</h4>
          </div>
          {targetSaved && (
            <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
              <CheckCircle className="w-3 h-3" /> Saved!
            </span>
          )}
        </div>

        <div className="grid grid-cols-3 gap-2 text-xs">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Sales (₹)</label>
            <input
              type="number"
              value={salesTarget}
              onChange={(e) => setSalesTarget(e.target.value)}
              className="w-full px-2 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-slate-900 outline-none"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Visits</label>
            <input
              type="number"
              value={visitTarget}
              onChange={(e) => setVisitTarget(e.target.value)}
              className="w-full px-2 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-slate-900 outline-none"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Collection</label>
            <input
              type="number"
              value={collectionTarget}
              onChange={(e) => setCollectionTarget(e.target.value)}
              className="w-full px-2 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-slate-900 outline-none"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
        >
          Update Targets
        </button>
      </form>

      {/* Corporate Info */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-2 text-center">
        <div className="w-12 h-12 mx-auto">
          <AirwinLogo size="sm" />
        </div>
        <div>
          <h4 className="font-black text-xs text-slate-900">AIRWIN PIPES & TANKS</h4>
          <p className="text-[11px] text-slate-500">Agarsen Pipes and Fittings Pvt. Ltd.</p>
          <p className="text-[10px] text-slate-400 mt-1">App Version 2.4.0 (Enterprise Build)</p>
        </div>
      </div>

      {/* Logout */}
      <button
        onClick={logout}
        className="w-full py-3 bg-red-50 hover:bg-red-100 text-red-700 font-bold rounded-2xl text-xs flex items-center justify-center gap-2 border border-red-200 transition-colors"
      >
        <LogOut className="w-4 h-4" />
        <span>Log Out of Session</span>
      </button>
    </div>
  );
};
