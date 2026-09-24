import React from 'react';
import {
  Compass,
  Users,
  Receipt,
  Eye,
  FileSpreadsheet,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Calendar,
  Lock,
  ChevronRight,
  PlusCircle,
  Sparkles,
  Award,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  formatCompactRupees,
  formatDisplayDate,
  formatRupees,
  getCurrentMonthString,
  getTodayDateString,
  safeDivide,
} from '../../utils/formatters';

export const ExecutiveDashboard: React.FC = () => {
  const {
    currentUser,
    selectedDate,
    travelRecords,
    visitRecords,
    expenseRecords,
    monthlyTargets,
    setActiveTab,
    isDayLocked,
  } = useApp();

  const todayStr = getTodayDateString();
  const currentMonth = getCurrentMonthString(); // e.g. 2026-09

  // Filter records for current user
  const userTravel = travelRecords.filter((t) => t.employeeId === currentUser.id);
  const userVisits = visitRecords.filter((v) => v.employeeId === currentUser.id);
  const userExpenses = expenseRecords.filter((e) => e.employeeId === currentUser.id);

  // TODAY metrics
  const todayVisits = userVisits.filter((v) => v.date === todayStr);
  const todayTravel = userTravel.filter((t) => t.date === todayStr);
  const todayDirectExpenses = userExpenses.filter((e) => e.date === todayStr);

  const todayVisitCount = todayVisits.length;
  const todayProductiveCount = todayVisits.filter((v) => v.visitStatus === 'Productive').length;
  const todayOrderValue = todayVisits.reduce((acc, v) => acc + (v.orderAmount || 0), 0);
  const todayCollectionValue = todayVisits.reduce((acc, v) => acc + (v.collectionAmount || 0), 0);
  const todayTravelKm = todayTravel.reduce((acc, t) => acc + (t.totalKm || 0), 0);
  const todayTravelExp = todayTravel.reduce((acc, t) => acc + (t.totalTravelExpense || 0), 0);
  const todayDirectExp = todayDirectExpenses.reduce((acc, e) => acc + (e.amount || 0), 0);
  const todayTotalExpense = todayTravelExp + todayDirectExp;

  // MONTH TO DATE metrics
  const mtdVisits = userVisits.filter((v) => v.date.startsWith(currentMonth));
  const mtdTravel = userTravel.filter((t) => t.date.startsWith(currentMonth));
  const mtdExpenses = userExpenses.filter((e) => e.date.startsWith(currentMonth));

  const uniqueDays = new Set([
    ...mtdVisits.map((v) => v.date),
    ...mtdTravel.map((t) => t.date),
    ...mtdExpenses.map((e) => e.date),
  ]);
  const mtdWorkingDays = uniqueDays.size;

  const mtdTotalVisits = mtdVisits.length;
  const mtdProductiveVisits = mtdVisits.filter((v) => v.visitStatus === 'Productive').length;
  const mtdNewCustomers = mtdVisits.filter((v) => v.isNewCustomer).length;
  const mtdOrderValue = mtdVisits.reduce((acc, v) => acc + (v.orderAmount || 0), 0);
  const mtdCollectionValue = mtdVisits.reduce((acc, v) => acc + (v.collectionAmount || 0), 0);
  const mtdTotalKm = mtdTravel.reduce((acc, t) => acc + (t.totalKm || 0), 0);
  const mtdTravelExp = mtdTravel.reduce((acc, t) => acc + (t.totalTravelExpense || 0), 0);
  const mtdDirectExp = mtdExpenses.reduce((acc, e) => acc + (e.amount || 0), 0);
  const mtdTotalExpenses = mtdTravelExp + mtdDirectExp;

  // Targets
  const target = monthlyTargets.find((t) => t.employeeId === currentUser.id && t.month === currentMonth) || {
    salesTarget: 1000000,
    visitTarget: 80,
    collectionTarget: 800000,
    workingDaysTarget: 24,
    productiveVisitTarget: 50,
    kmTarget: 1500,
  };

  const salesProgress = Math.min(100, Math.round((mtdOrderValue / (target.salesTarget || 1)) * 100));
  const visitProgress = Math.min(100, Math.round((mtdTotalVisits / (target.visitTarget || 1)) * 100));
  const collectionProgress = Math.min(100, Math.round((mtdCollectionValue / (target.collectionTarget || 1)) * 100));

  const locked = isDayLocked(currentUser.id, todayStr);

  return (
    <div className="flex-1 overflow-y-auto bg-slate-100 pb-20 select-none">
      {/* Executive Welcome & Territory Strip */}
      <div className="bg-gradient-to-r from-red-700 via-red-600 to-red-800 text-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[11px] uppercase tracking-wider text-red-200 font-semibold">
              FIELD SALES EXECUTIVE
            </span>
            <h2 className="text-lg font-black tracking-tight leading-snug">{currentUser.name}</h2>
            <div className="flex items-center gap-1.5 text-xs text-red-100 mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-red-300" />
              <span>
                {currentUser.headquarter} · {currentUser.assignedTerritory}
              </span>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-3 py-1.5 text-right">
            <span className="text-[10px] text-red-200 block uppercase font-medium">EMP ID</span>
            <span className="text-xs font-bold text-white tracking-wider">{currentUser.employeeId}</span>
          </div>
        </div>

        {/* Lock status banner */}
        {locked && (
          <div className="mt-3 bg-white/15 backdrop-blur-md rounded-lg p-2.5 flex items-center justify-between text-xs border border-white/30">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-300" />
              <span>Today&apos;s daily report is submitted & locked</span>
            </div>
            <button
              onClick={() => setActiveTab('view_today')}
              className="px-2 py-0.5 bg-white text-red-700 rounded font-bold text-[11px]"
            >
              View
            </button>
          </div>
        )}
      </div>

      <div className="p-3.5 space-y-4">
        {/* QUICK ACTION BUTTONS (Requirement 4) */}
        <div>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1 mb-2 block">
            Quick Actions
          </span>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={() => setActiveTab('add_visit')}
              className="bg-red-600 hover:bg-red-700 active:bg-red-800 text-white p-3 rounded-2xl shadow-sm flex items-center gap-3 transition-transform active:scale-[0.98] border border-red-500"
            >
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <span className="text-xs font-bold block leading-tight">ADD VISIT</span>
                <span className="text-[11px] text-red-100">Customer visit</span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('add_travel')}
              className="bg-slate-800 hover:bg-slate-900 active:bg-slate-950 text-white p-3 rounded-2xl shadow-sm flex items-center gap-3 transition-transform active:scale-[0.98] border border-slate-700"
            >
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                <Compass className="w-5 h-5 text-red-400" />
              </div>
              <div className="text-left">
                <span className="text-xs font-bold block leading-tight">ADD TRAVEL</span>
                <span className="text-[11px] text-slate-300">Route & KM</span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('add_expense')}
              className="bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-800 p-3 rounded-2xl shadow-sm flex items-center gap-3 border border-slate-200 transition-transform active:scale-[0.98]"
            >
              <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
                <Receipt className="w-5 h-5 text-red-600" />
              </div>
              <div className="text-left">
                <span className="text-xs font-bold block leading-tight text-slate-900">ADD EXPENSE</span>
                <span className="text-[11px] text-slate-500">Food, Hotel, Toll</span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('view_today')}
              className="bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-800 p-3 rounded-2xl shadow-sm flex items-center gap-3 border border-slate-200 transition-transform active:scale-[0.98]"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                <Eye className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-left">
                <span className="text-xs font-bold block leading-tight text-slate-900">VIEW TODAY</span>
                <span className="text-[11px] text-slate-500">Submit summary</span>
              </div>
            </button>
          </div>
        </div>

        {/* TODAY'S PERFORMANCE CARD (Requirement 4) */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600"></span>
              <h3 className="font-bold text-slate-900 text-sm">TODAY&apos;S PERFORMANCE</h3>
            </div>
            <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
              {formatDisplayDate(todayStr, true)}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Visits & Productive */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="text-[11px] text-slate-500 font-medium block">Total Visits</span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-2xl font-black text-slate-900">{todayVisitCount}</span>
                <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                  {todayProductiveCount} Prod.
                </span>
              </div>
            </div>

            {/* Travel KM */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="text-[11px] text-slate-500 font-medium block">Travel Distance</span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-2xl font-black text-slate-900">{todayTravelKm}</span>
                <span className="text-xs font-semibold text-slate-600">KM</span>
              </div>
            </div>

            {/* Orders */}
            <div className="bg-emerald-50/60 p-3 rounded-xl border border-emerald-100">
              <span className="text-[11px] text-emerald-700 font-medium block">Today&apos;s Order</span>
              <span className="text-xl font-black text-emerald-900 block mt-0.5">
                {formatRupees(todayOrderValue)}
              </span>
            </div>

            {/* Collection */}
            <div className="bg-blue-50/60 p-3 rounded-xl border border-blue-100">
              <span className="text-[11px] text-blue-700 font-medium block">Today&apos;s Collection</span>
              <span className="text-xl font-black text-blue-900 block mt-0.5">
                {formatRupees(todayCollectionValue)}
              </span>
            </div>
          </div>

          {/* Today Expense Bar */}
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Today&apos;s Total Expense:</span>
            <span className="font-bold text-red-600 text-sm">{formatRupees(todayTotalExpense)}</span>
          </div>
        </div>

        {/* MONTHLY TARGETS PROGRESS (Requirement 4 & 26) */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-red-600" />
              <h3 className="font-bold text-slate-900 text-sm">MONTHLY TARGETS</h3>
            </div>
            <span className="text-xs font-semibold text-slate-500">
              {new Date().toLocaleString('en-US', { month: 'short', year: 'numeric' })}
            </span>
          </div>

          {/* Sales Target */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="font-medium text-slate-600">Sales Order Target</span>
              <span className="font-bold text-slate-800">
                {formatCompactRupees(mtdOrderValue)} / {formatCompactRupees(target.salesTarget)} ({salesProgress}%)
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${salesProgress}%` }}
              ></div>
            </div>
          </div>

          {/* Visit Target */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="font-medium text-slate-600">Customer Visits Target</span>
              <span className="font-bold text-slate-800">
                {mtdTotalVisits} / {target.visitTarget} Visits ({visitProgress}%)
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-red-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${visitProgress}%` }}
              ></div>
            </div>
          </div>

          {/* Collection Target */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="font-medium text-slate-600">Payment Collection Target</span>
              <span className="font-bold text-slate-800">
                {formatCompactRupees(mtdCollectionValue)} / {formatCompactRupees(target.collectionTarget)} (
                {collectionProgress}%)
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-blue-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${collectionProgress}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* MONTH TO DATE SUMMARY CARD (Requirement 4) */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <h3 className="font-bold text-slate-900 text-sm">MONTH TO DATE (MTD)</h3>
            </div>
            <button
              onClick={() => setActiveTab('report')}
              className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-0.5"
            >
              Report <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex justify-between p-2 bg-slate-50 rounded-lg">
              <span className="text-slate-500">Working Days:</span>
              <span className="font-bold text-slate-800">{mtdWorkingDays} Days</span>
            </div>

            <div className="flex justify-between p-2 bg-slate-50 rounded-lg">
              <span className="text-slate-500">Total Visits:</span>
              <span className="font-bold text-slate-800">
                {mtdTotalVisits} ({mtdProductiveVisits} Prod)
              </span>
            </div>

            <div className="flex justify-between p-2 bg-slate-50 rounded-lg">
              <span className="text-slate-500">New Customers:</span>
              <span className="font-bold text-emerald-700">{mtdNewCustomers}</span>
            </div>

            <div className="flex justify-between p-2 bg-slate-50 rounded-lg">
              <span className="text-slate-500">Total KM:</span>
              <span className="font-bold text-slate-800">{mtdTotalKm} KM</span>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Total Order Value:</span>
              <span className="font-bold text-emerald-700 text-sm">{formatRupees(mtdOrderValue)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Total Collection:</span>
              <span className="font-bold text-blue-700 text-sm">{formatRupees(mtdCollectionValue)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Total Expenses:</span>
              <span className="font-bold text-red-600 text-sm">{formatRupees(mtdTotalExpenses)}</span>
            </div>
            <div className="flex justify-between pt-1 border-t border-dashed border-slate-200 font-bold">
              <span className="text-slate-700">Net Sales Contribution:</span>
              <span className="text-slate-900 text-sm">{formatRupees(mtdOrderValue - mtdTotalExpenses)}</span>
            </div>
          </div>
        </div>

        {/* View Monthly Report Banner */}
        <button
          onClick={() => setActiveTab('report')}
          className="w-full bg-slate-900 hover:bg-black text-white p-3.5 rounded-2xl flex items-center justify-between font-bold text-xs shadow-md transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <FileSpreadsheet className="w-5 h-5 text-red-400" />
            <div className="text-left">
              <span className="block leading-tight">VIEW FULL MONTHLY REPORT</span>
              <span className="text-[11px] font-normal text-slate-400">
                Daily table, KPI ratios & Excel export
              </span>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400" />
        </button>
      </div>
    </div>
  );
};
