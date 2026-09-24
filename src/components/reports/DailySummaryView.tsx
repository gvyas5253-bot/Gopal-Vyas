import React, { useState } from 'react';
import {
  Calendar,
  Lock,
  Unlock,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Compass,
  Users,
  Receipt,
  FileCheck,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  calculateExpensePercentage,
  formatDisplayDate,
  formatRupees,
  getTodayDateString,
  safeDivide,
} from '../../utils/formatters';

export const DailySummaryView: React.FC = () => {
  const {
    currentUser,
    userRole,
    travelRecords,
    visitRecords,
    expenseRecords,
    dailySubmissions,
    submitDailyReport,
    unlockDailyReport,
    isDayLocked,
    setActiveTab,
  } = useApp();

  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateString());
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Filter day records
  const targetEmployeeId = currentUser.id;
  const dayTravel = travelRecords.filter(
    (t) => t.employeeId === targetEmployeeId && t.date === selectedDate
  );
  const dayVisits = visitRecords.filter(
    (v) => v.employeeId === targetEmployeeId && v.date === selectedDate
  );
  const dayDirectExpenses = expenseRecords.filter(
    (e) => e.employeeId === targetEmployeeId && e.date === selectedDate
  );

  // Travel Totals
  const totalKm = dayTravel.reduce((acc, t) => acc + (t.totalKm || 0), 0);
  const fuel = dayTravel.reduce((acc, t) => acc + (t.fuelExpense || 0), 0);
  const toll = dayTravel.reduce((acc, t) => acc + (t.tollExpense || 0), 0);
  const bus = dayTravel.reduce((acc, t) => acc + (t.busFare || 0), 0);
  const train = dayTravel.reduce((acc, t) => acc + (t.trainFare || 0), 0);
  const autoTaxi = dayTravel.reduce((acc, t) => acc + (t.autoTaxiFare || 0), 0);
  const dailyAllowance = dayTravel.reduce((acc, t) => acc + (t.dailyAllowance || 0), 0);
  const otherTravel = dayTravel.reduce((acc, t) => acc + (t.otherTravelExpense || 0), 0);
  const totalTravelExpense = dayTravel.reduce((acc, t) => acc + (t.totalTravelExpense || 0), 0);

  // Sales Totals
  const totalVisits = dayVisits.length;
  const productiveVisits = dayVisits.filter((v) => v.visitStatus === 'Productive').length;
  const newCustomers = dayVisits.filter((v) => v.isNewCustomer).length;
  const orderValue = dayVisits.reduce((acc, v) => acc + (v.orderAmount || 0), 0);
  const collectionValue = dayVisits.reduce((acc, v) => acc + (v.collectionAmount || 0), 0);

  // Direct Expenses breakdown
  const foodExpense = dayDirectExpenses
    .filter((e) => e.expenseHead === 'Food')
    .reduce((acc, e) => acc + (e.amount || 0), 0);
  const hotelExpense = dayDirectExpenses
    .filter((e) => e.expenseHead === 'Hotel')
    .reduce((acc, e) => acc + (e.amount || 0), 0);
  const localConveyance = dayDirectExpenses
    .filter((e) => e.expenseHead === 'Local Conveyance')
    .reduce((acc, e) => acc + (e.amount || 0), 0);
  const otherExpenses = dayDirectExpenses
    .filter((e) => !['Food', 'Hotel', 'Local Conveyance'].includes(e.expenseHead))
    .reduce((acc, e) => acc + (e.amount || 0), 0);
  const totalDirectExpense = dayDirectExpenses.reduce((acc, e) => acc + (e.amount || 0), 0);

  // Grand Total Expense = Travel Expense + Direct Expense
  const grandTotalExpense = totalTravelExpense + totalDirectExpense;

  // Order Value minus Total Expense
  const netContribution = orderValue - grandTotalExpense;

  // KPI Calculations (Requirement 9 & 15)
  const avgOrderPerVisit = safeDivide(orderValue, totalVisits);
  const avgOrderPerProdVisit = safeDivide(orderValue, productiveVisits);
  const expensePerKm = safeDivide(grandTotalExpense, totalKm);
  const expensePercentage = calculateExpensePercentage(grandTotalExpense, orderValue);

  // Check if submitted & locked
  const submission = dailySubmissions.find(
    (s) => s.employeeId === targetEmployeeId && s.date === selectedDate
  );
  const isLocked = !!submission?.isSubmitted;

  const handleDateChange = (daysDelta: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + daysDelta);
    const yr = d.getFullYear();
    const mo = String(d.getMonth() + 1).padStart(2, '0');
    const dy = String(d.getDate()).padStart(2, '0');
    setSelectedDate(`${yr}-${mo}-${dy}`);
  };

  const confirmSubmit = async () => {
    setIsSubmitting(true);
    await submitDailyReport(selectedDate);
    setIsSubmitting(false);
    setShowConfirmModal(false);
  };

  const handleUnlock = async () => {
    if (window.confirm('Admin Unlock: Reopen this day for editing?')) {
      await unlockDailyReport(targetEmployeeId, selectedDate);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-100 p-3 pb-24 space-y-3.5 select-none">
      {/* Date Navigation Strip */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
        <button
          onClick={() => handleDateChange(-1)}
          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors"
          title="Previous day"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="text-center">
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
            DAILY SUMMARY DATE
          </span>
          <div className="flex items-center justify-center gap-1.5 font-black text-slate-900 text-sm">
            <Calendar className="w-4 h-4 text-red-600" />
            <span>{formatDisplayDate(selectedDate, true)}</span>
          </div>
        </div>

        <button
          onClick={() => handleDateChange(1)}
          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors"
          title="Next day"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Lock / Submission Banner */}
      {isLocked ? (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 flex items-center justify-between text-xs text-emerald-900">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-600 shrink-0" />
            <div>
              <span className="font-bold block">Daily Report Submitted & Locked</span>
              <span className="text-[10px] text-emerald-700">
                Submitted on {new Date(submission?.submittedAt || '').toLocaleTimeString()}
              </span>
            </div>
          </div>

          {userRole === 'admin' && (
            <button
              onClick={handleUnlock}
              className="px-2.5 py-1 bg-white border border-emerald-300 text-emerald-800 rounded-lg font-bold text-[11px] hover:bg-emerald-100"
            >
              Reopen
            </button>
          )}
        </div>
      ) : (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 flex items-center justify-between text-xs text-amber-900">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <div>
              <span className="font-bold block">Draft Report - Not Yet Submitted</span>
              <span className="text-[10px] text-amber-700">
                Submit at end of day to lock and send to management
              </span>
            </div>
          </div>
        </div>
      )}

      {/* NET SALES CONTRIBUTION HERO CARD */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-4 shadow-md space-y-3">
        <div className="flex justify-between items-start">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              ORDER VALUE MINUS TOTAL EXPENSE
            </span>
            <div className="text-2xl font-black tracking-tight text-white mt-0.5">
              {formatRupees(netContribution)}
            </div>
          </div>
          <span
            className={`text-xs font-bold px-2 py-0.5 rounded-full ${
              netContribution >= 0 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'
            }`}
          >
            {netContribution >= 0 ? 'Positive Surplus' : 'Expense Exceeded'}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-700 text-xs">
          <div>
            <span className="text-slate-400 block text-[10px]">Total Orders Booked:</span>
            <span className="font-bold text-emerald-400">{formatRupees(orderValue)}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px]">Total Daily Expenses:</span>
            <span className="font-bold text-red-400">{formatRupees(grandTotalExpense)}</span>
          </div>
        </div>
      </div>

      {/* SALES PERFORMANCE SECTION (Requirement 9) */}
      <div className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-sm space-y-2.5">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-red-600" />
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wide">
              Sales & Visits Summary
            </h3>
          </div>
          <button
            onClick={() => setActiveTab('visits')}
            className="text-[11px] font-bold text-red-600 hover:underline"
          >
            View Visits
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="bg-slate-50 p-2 rounded-xl">
            <span className="text-[10px] text-slate-500 block">Total Visits</span>
            <span className="text-base font-black text-slate-900">{totalVisits}</span>
          </div>
          <div className="bg-emerald-50 p-2 rounded-xl">
            <span className="text-[10px] text-emerald-700 block">Productive</span>
            <span className="text-base font-black text-emerald-700">{productiveVisits}</span>
          </div>
          <div className="bg-blue-50 p-2 rounded-xl">
            <span className="text-[10px] text-blue-700 block">New Cust.</span>
            <span className="text-base font-black text-blue-700">{newCustomers}</span>
          </div>
        </div>

        <div className="space-y-1.5 pt-1 text-xs">
          <div className="flex justify-between">
            <span className="text-slate-600">Total Order Value:</span>
            <span className="font-bold text-emerald-700">{formatRupees(orderValue)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">Total Payment Collection:</span>
            <span className="font-bold text-blue-700">{formatRupees(collectionValue)}</span>
          </div>
        </div>
      </div>

      {/* TRAVEL BREAKDOWN SECTION (Requirement 9) */}
      <div className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-sm space-y-2.5">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-red-600" />
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wide">
              Travel & Route Summary
            </h3>
          </div>
          <span className="text-xs font-black text-slate-900">{totalKm} KM</span>
        </div>

        <div className="grid grid-cols-2 gap-1.5 text-[11px] text-slate-600">
          <div className="flex justify-between p-1.5 bg-slate-50 rounded-lg">
            <span>Fuel Expense:</span>
            <span className="font-semibold text-slate-900">{formatRupees(fuel)}</span>
          </div>
          <div className="flex justify-between p-1.5 bg-slate-50 rounded-lg">
            <span>Toll / Fastag:</span>
            <span className="font-semibold text-slate-900">{formatRupees(toll)}</span>
          </div>
          <div className="flex justify-between p-1.5 bg-slate-50 rounded-lg">
            <span>Bus Fare:</span>
            <span className="font-semibold text-slate-900">{formatRupees(bus)}</span>
          </div>
          <div className="flex justify-between p-1.5 bg-slate-50 rounded-lg">
            <span>Train Fare:</span>
            <span className="font-semibold text-slate-900">{formatRupees(train)}</span>
          </div>
          <div className="flex justify-between p-1.5 bg-slate-50 rounded-lg">
            <span>Auto / Taxi:</span>
            <span className="font-semibold text-slate-900">{formatRupees(autoTaxi)}</span>
          </div>
          <div className="flex justify-between p-1.5 bg-slate-50 rounded-lg">
            <span>Daily Allowance:</span>
            <span className="font-semibold text-slate-900">{formatRupees(dailyAllowance)}</span>
          </div>
          <div className="col-span-2 flex justify-between p-1.5 bg-slate-50 rounded-lg">
            <span>Other Travel Expense:</span>
            <span className="font-semibold text-slate-900">{formatRupees(otherTravel)}</span>
          </div>
        </div>

        <div className="flex justify-between pt-1 border-t border-slate-100 text-xs font-bold text-slate-800">
          <span>Total Travel Expense:</span>
          <span className="text-red-600">{formatRupees(totalTravelExpense)}</span>
        </div>
      </div>

      {/* DIRECT EXPENSES BREAKDOWN (Requirement 9) */}
      <div className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-sm space-y-2.5">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Receipt className="w-4 h-4 text-red-600" />
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wide">
              Direct Daily Expenses
            </h3>
          </div>
          <span className="text-xs font-black text-red-600">{formatRupees(totalDirectExpense)}</span>
        </div>

        <div className="grid grid-cols-2 gap-1.5 text-[11px] text-slate-600">
          <div className="flex justify-between p-1.5 bg-slate-50 rounded-lg">
            <span>Food:</span>
            <span className="font-semibold text-slate-900">{formatRupees(foodExpense)}</span>
          </div>
          <div className="flex justify-between p-1.5 bg-slate-50 rounded-lg">
            <span>Hotel:</span>
            <span className="font-semibold text-slate-900">{formatRupees(hotelExpense)}</span>
          </div>
          <div className="flex justify-between p-1.5 bg-slate-50 rounded-lg">
            <span>Local Conveyance:</span>
            <span className="font-semibold text-slate-900">{formatRupees(localConveyance)}</span>
          </div>
          <div className="flex justify-between p-1.5 bg-slate-50 rounded-lg">
            <span>Other Expenses:</span>
            <span className="font-semibold text-slate-900">{formatRupees(otherExpenses)}</span>
          </div>
        </div>
      </div>

      {/* AUTOMATIC PERFORMANCE RATIOS (Requirement 9 & 15) */}
      <div className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-sm space-y-2">
        <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wide pb-1 border-b border-slate-100">
          Key Performance Ratios
        </h3>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2.5 bg-slate-50 rounded-xl">
            <span className="text-[10px] text-slate-500 block">Avg Order / Visit</span>
            <span className="text-sm font-bold text-slate-900">{formatRupees(avgOrderPerVisit)}</span>
          </div>

          <div className="p-2.5 bg-slate-50 rounded-xl">
            <span className="text-[10px] text-slate-500 block">Avg Order / Prod. Visit</span>
            <span className="text-sm font-bold text-emerald-700">{formatRupees(avgOrderPerProdVisit)}</span>
          </div>

          <div className="p-2.5 bg-slate-50 rounded-xl">
            <span className="text-[10px] text-slate-500 block">Expense / KM</span>
            <span className="text-sm font-bold text-slate-900">
              {totalKm > 0 ? formatRupees(expensePerKm) : '₹0'} / KM
            </span>
          </div>

          <div className="p-2.5 bg-slate-50 rounded-xl">
            <span className="text-[10px] text-slate-500 block">Expense % of Order</span>
            <span className="text-sm font-bold text-slate-900">{expensePercentage}%</span>
          </div>
        </div>
      </div>

      {/* SUBMIT DAILY REPORT BUTTON (Requirement 23) */}
      {!isLocked && (
        <button
          onClick={() => setShowConfirmModal(true)}
          className="w-full py-4 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-black text-sm rounded-2xl shadow-lg transition-transform active:scale-[0.98] flex items-center justify-center gap-2"
        >
          <FileCheck className="w-5 h-5" />
          <span>SUBMIT DAILY REPORT</span>
        </button>
      )}

      {/* CONFIRMATION SUMMARY MODAL (Requirement 23) */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 max-w-sm w-full space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="text-center space-y-1">
              <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-2">
                <FileCheck className="w-6 h-6" />
              </div>
              <h3 className="text-base font-black text-slate-900">Submit Daily Report?</h3>
              <p className="text-xs text-slate-500">
                Please verify today&apos;s summary before final submission. This will lock today&apos;s entries from further editing.
              </p>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-600">Date:</span>
                <span className="font-bold text-slate-900">{formatDisplayDate(selectedDate)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Customer Visits:</span>
                <span className="font-bold text-slate-900">{totalVisits} ({productiveVisits} Productive)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Total Order Value:</span>
                <span className="font-bold text-emerald-700">{formatRupees(orderValue)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Total Collection:</span>
                <span className="font-bold text-blue-700">{formatRupees(collectionValue)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Travel Distance:</span>
                <span className="font-bold text-slate-900">{totalKm} KM</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-slate-200">
                <span className="text-slate-700 font-bold">Total Expenses:</span>
                <span className="font-black text-red-600">{formatRupees(grandTotalExpense)}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors"
              >
                Go Back
              </button>

              <button
                type="button"
                onClick={confirmSubmit}
                disabled={isSubmitting}
                className="flex-2 py-3 bg-red-600 hover:bg-red-700 active:bg-red-800 disabled:opacity-50 text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Confirm & Submit</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
