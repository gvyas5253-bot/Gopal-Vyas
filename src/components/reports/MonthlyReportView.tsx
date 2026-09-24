import React, { useState } from 'react';
import {
  Calendar,
  FileSpreadsheet,
  Download,
  ChevronRight,
  TrendingUp,
  Award,
  Filter,
  Users,
  Compass,
  Receipt,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  formatCompactRupees,
  formatDisplayDate,
  formatRupees,
  getMonthNames,
  safeDivide,
} from '../../utils/formatters';
import { generateMonthlyReportXlsx, downloadCsvReport } from '../../utils/exportToExcel';

export const MonthlyReportView: React.FC = () => {
  const {
    currentUser,
    userRole,
    employees,
    travelRecords,
    visitRecords,
    expenseRecords,
    selectedMonth,
    setSelectedMonth,
    setSelectedDate,
    setActiveTab,
  } = useApp();

  const [selectedEmpId, setSelectedEmpId] = useState<string>(
    userRole === 'admin' ? employees[0].id : currentUser.id
  );

  const months = getMonthNames();
  const currentYear = new Date().getFullYear();
  const years = [currentYear - 1, currentYear, currentYear + 1];

  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [selectedMonthId, setSelectedMonthId] = useState<string>(
    selectedMonth.split('-')[1] || '09'
  );

  const monthQuery = `${selectedYear}-${selectedMonthId}`;
  const targetEmployee = employees.find((e) => e.id === selectedEmpId) || currentUser;

  // Filter records
  const userTravel = travelRecords.filter(
    (t) => t.employeeId === targetEmployee.id && t.date.startsWith(monthQuery)
  );
  const userVisits = visitRecords.filter(
    (v) => v.employeeId === targetEmployee.id && v.date.startsWith(monthQuery)
  );
  const userExpenses = expenseRecords.filter(
    (e) => e.employeeId === targetEmployee.id && e.date.startsWith(monthQuery)
  );

  // Working days (unique dates in travel or visits)
  const uniqueDates = Array.from(
    new Set([...userTravel.map((t) => t.date), ...userVisits.map((v) => v.date)])
  ).sort();
  const totalWorkingDays = uniqueDates.length;

  // Visits KPIs
  const totalVisits = userVisits.length;
  const productiveVisits = userVisits.filter((v) => v.visitStatus === 'Productive').length;
  const nonProductiveVisits = userVisits.filter((v) => v.visitStatus === 'Non-Productive').length;
  const newCustomers = userVisits.filter((v) => v.isNewCustomer).length;
  const totalOrderValue = userVisits.reduce((acc, v) => acc + (v.orderAmount || 0), 0);
  const totalCollection = userVisits.reduce((acc, v) => acc + (v.collectionAmount || 0), 0);

  // Travel KPIs
  const totalKm = userTravel.reduce((acc, t) => acc + (t.totalKm || 0), 0);
  const totalFuel = userTravel.reduce((acc, t) => acc + (t.fuelExpense || 0), 0);
  const totalToll = userTravel.reduce((acc, t) => acc + (t.tollExpense || 0), 0);
  const totalBus = userTravel.reduce((acc, t) => acc + (t.busFare || 0), 0);
  const totalTrain = userTravel.reduce((acc, t) => acc + (t.trainFare || 0), 0);
  const totalAllowance = userTravel.reduce((acc, t) => acc + (t.dailyAllowance || 0), 0);
  const totalTravelExpense = userTravel.reduce((acc, t) => acc + (t.totalTravelExpense || 0), 0);

  // Direct Expenses KPIs
  const totalFood = userExpenses
    .filter((e) => e.expenseHead === 'Food')
    .reduce((acc, e) => acc + (e.amount || 0), 0);
  const totalHotel = userExpenses
    .filter((e) => e.expenseHead === 'Hotel')
    .reduce((acc, e) => acc + (e.amount || 0), 0);
  const totalLocalConv = userExpenses
    .filter((e) => e.expenseHead === 'Local Conveyance')
    .reduce((acc, e) => acc + (e.amount || 0), 0);
  const totalOtherExpense = userExpenses
    .filter((e) => !['Food', 'Hotel', 'Local Conveyance'].includes(e.expenseHead))
    .reduce((acc, e) => acc + (e.amount || 0), 0);
  const totalDirectExpense = userExpenses.reduce((acc, e) => acc + (e.amount || 0), 0);

  const grandTotalExpense = totalTravelExpense + totalDirectExpense;

  // Key Ratios (Requirement 10 & 15)
  const avgVisitsPerDay = safeDivide(totalVisits, totalWorkingDays);
  const avgOrderPerVisit = safeDivide(totalOrderValue, totalVisits);
  const avgOrderPerProdVisit = safeDivide(totalOrderValue, productiveVisits);
  const avgCollectionPerVisit = safeDivide(totalCollection, totalVisits);
  const expensePerKm = safeDivide(grandTotalExpense, totalKm);
  const expenseOrderPct = totalOrderValue > 0 ? safeDivide(grandTotalExpense * 100, totalOrderValue) : 0;

  // Handle Export to Excel
  const handleExportXlsx = () => {
    generateMonthlyReportXlsx({
      employee: targetEmployee,
      monthString: monthQuery,
      travelRecords: userTravel,
      visitRecords: userVisits,
      expenseRecords: userExpenses,
    });
  };

  // Click on a date row to view that day
  const handleOpenDay = (dateStr: string) => {
    setSelectedDate(dateStr);
    setActiveTab('view_today');
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-100 p-3 pb-24 space-y-3.5 select-none">
      {/* Top Header & Export Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-black text-slate-900 leading-tight">MONTHLY PERFORMANCE</h2>
          <span className="text-[11px] text-slate-500 font-medium">
            Management & MIS Monthly Reporting
          </span>
        </div>

        <button
          onClick={handleExportXlsx}
          className="px-3 py-2 bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-transform active:scale-95"
          title="Download Multi-sheet Excel (.xlsx)"
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-200" />
          <span>EXPORT XLSX</span>
        </button>
      </div>

      {/* Month & Year Selector (Requirement 10) */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm space-y-2.5">
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Month</label>
            <select
              value={selectedMonthId}
              onChange={(e) => setSelectedMonthId(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-slate-900 outline-none"
            >
              {months.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Year</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-slate-900 outline-none"
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Executive chooser if Admin */}
        {userRole === 'admin' && (
          <div className="pt-2 border-t border-slate-100">
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Sales Executive</label>
            <select
              value={selectedEmpId}
              onChange={(e) => setSelectedEmpId(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-slate-900 outline-none"
            >
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} ({emp.headquarter}) - {emp.employeeId}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* MONTHLY SUMMARY METRICS (Requirement 10) */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wide">
            {months.find((m) => m.id === selectedMonthId)?.name} {selectedYear} Performance
          </h3>
          <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
            {targetEmployee.name}
          </span>
        </div>

        {/* Primary Counters */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2.5 bg-slate-50 rounded-xl">
            <span className="text-[10px] text-slate-500 block">Total Working Days</span>
            <span className="text-base font-black text-slate-900">{totalWorkingDays} Days</span>
          </div>

          <div className="p-2.5 bg-slate-50 rounded-xl">
            <span className="text-[10px] text-slate-500 block">Customer Visits</span>
            <span className="text-base font-black text-slate-900">
              {totalVisits} ({productiveVisits} Prod.)
            </span>
          </div>

          <div className="p-2.5 bg-emerald-50 rounded-xl">
            <span className="text-[10px] text-emerald-800 block">Total Order Booked</span>
            <span className="text-base font-black text-emerald-900">{formatRupees(totalOrderValue)}</span>
          </div>

          <div className="p-2.5 bg-blue-50 rounded-xl">
            <span className="text-[10px] text-blue-800 block">Total Collection</span>
            <span className="text-base font-black text-blue-900">{formatRupees(totalCollection)}</span>
          </div>

          <div className="p-2.5 bg-slate-50 rounded-xl">
            <span className="text-[10px] text-slate-500 block">Total Vehicle KM</span>
            <span className="text-base font-black text-slate-900">{totalKm} KM</span>
          </div>

          <div className="p-2.5 bg-red-50 rounded-xl">
            <span className="text-[10px] text-red-700 block">TOTAL EXPENSE</span>
            <span className="text-base font-black text-red-700">{formatRupees(grandTotalExpense)}</span>
          </div>
        </div>

        {/* Detailed Breakup (Requirement 10) */}
        <div className="pt-2 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
          <div className="flex justify-between py-0.5">
            <span>Non-Productive Visits:</span>
            <span className="font-semibold text-slate-800">{nonProductiveVisits}</span>
          </div>
          <div className="flex justify-between py-0.5">
            <span>New Customer Visits:</span>
            <span className="font-semibold text-emerald-700">{newCustomers}</span>
          </div>
          <div className="flex justify-between py-0.5">
            <span>Total Fuel Expense:</span>
            <span className="font-semibold text-slate-800">{formatRupees(totalFuel)}</span>
          </div>
          <div className="flex justify-between py-0.5">
            <span>Total Toll / Fastag:</span>
            <span className="font-semibold text-slate-800">{formatRupees(totalToll)}</span>
          </div>
          <div className="flex justify-between py-0.5">
            <span>Total Bus & Train Travel:</span>
            <span className="font-semibold text-slate-800">{formatRupees(totalBus + totalTrain)}</span>
          </div>
          <div className="flex justify-between py-0.5">
            <span>Total Daily Allowance:</span>
            <span className="font-semibold text-slate-800">{formatRupees(totalAllowance)}</span>
          </div>
          <div className="flex justify-between py-0.5">
            <span>Total Food & Hotel:</span>
            <span className="font-semibold text-slate-800">{formatRupees(totalFood + totalHotel)}</span>
          </div>
          <div className="flex justify-between py-0.5">
            <span>Local Conveyance & Other:</span>
            <span className="font-semibold text-slate-800">{formatRupees(totalLocalConv + totalOtherExpense)}</span>
          </div>
        </div>
      </div>

      {/* KEY PERFORMANCE RATIOS (Requirement 10 & 15) */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-2.5">
        <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wide pb-1 border-b border-slate-100">
          Monthly Performance Ratios
        </h3>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2.5 bg-slate-50 rounded-xl">
            <span className="text-[10px] text-slate-500 block">Avg Visits / Working Day</span>
            <span className="text-sm font-bold text-slate-900">{avgVisitsPerDay} Visits</span>
          </div>

          <div className="p-2.5 bg-slate-50 rounded-xl">
            <span className="text-[10px] text-slate-500 block">Avg Order / Visit</span>
            <span className="text-sm font-bold text-slate-900">{formatRupees(avgOrderPerVisit)}</span>
          </div>

          <div className="p-2.5 bg-slate-50 rounded-xl">
            <span className="text-[10px] text-slate-500 block">Avg Order / Prod. Visit</span>
            <span className="text-sm font-bold text-emerald-700">{formatRupees(avgOrderPerProdVisit)}</span>
          </div>

          <div className="p-2.5 bg-slate-50 rounded-xl">
            <span className="text-[10px] text-slate-500 block">Avg Collection / Visit</span>
            <span className="text-sm font-bold text-blue-700">{formatRupees(avgCollectionPerVisit)}</span>
          </div>

          <div className="p-2.5 bg-slate-50 rounded-xl">
            <span className="text-[10px] text-slate-500 block">Expense / KM</span>
            <span className="text-sm font-bold text-slate-900">
              {totalKm > 0 ? formatRupees(expensePerKm) : '₹0'} / KM
            </span>
          </div>

          <div className="p-2.5 bg-slate-50 rounded-xl">
            <span className="text-[10px] text-slate-500 block">Expense / Order %</span>
            <span className="text-sm font-bold text-slate-900">{expenseOrderPct}%</span>
          </div>
        </div>
      </div>

      {/* DAILY REPORT TABLE (Requirement 11) */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between pb-1 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wide">
              Daily Report Table
            </h3>
            <span className="text-[10px] text-slate-400">Tap a date to view full daily details</span>
          </div>
          <span className="text-[10px] font-bold text-slate-500">{uniqueDates.length} Days</span>
        </div>

        {uniqueDates.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-4">
            No activity records found for {months.find((m) => m.id === selectedMonthId)?.name}{' '}
            {selectedYear}
          </p>
        ) : (
          <div className="space-y-1.5">
            {/* Table Header */}
            <div className="grid grid-cols-6 gap-1 text-[10px] font-bold text-slate-400 uppercase px-2 py-1 bg-slate-50 rounded-lg">
              <span>Date</span>
              <span className="text-center">Visits</span>
              <span className="text-right">Order</span>
              <span className="text-right">Coll.</span>
              <span className="text-center">KM</span>
              <span className="text-right">Exp.</span>
            </div>

            {/* Rows */}
            {uniqueDates.map((dateStr) => {
              const dVisits = userVisits.filter((v) => v.date === dateStr);
              const dTravel = userTravel.filter((t) => t.date === dateStr);
              const dExp = userExpenses.filter((e) => e.date === dateStr);

              const dVisitsCount = dVisits.length;
              const dOrder = dVisits.reduce((acc, v) => acc + (v.orderAmount || 0), 0);
              const dColl = dVisits.reduce((acc, v) => acc + (v.collectionAmount || 0), 0);
              const dKm = dTravel.reduce((acc, t) => acc + (t.totalKm || 0), 0);
              const dTrvExp = dTravel.reduce((acc, t) => acc + (t.totalTravelExpense || 0), 0);
              const dDirExp = dExp.reduce((acc, e) => acc + (e.amount || 0), 0);
              const dTotalExp = dTrvExp + dDirExp;

              const shortDate = formatDisplayDate(dateStr, false);

              return (
                <div
                  key={dateStr}
                  onClick={() => handleOpenDay(dateStr)}
                  className="grid grid-cols-6 gap-1 text-xs items-center px-2 py-2 rounded-xl border border-slate-100 hover:border-red-300 hover:bg-red-50/20 active:bg-slate-100 cursor-pointer transition-colors"
                >
                  <span className="font-bold text-slate-900 truncate">{shortDate}</span>
                  <span className="text-center font-semibold text-slate-700">{dVisitsCount}</span>
                  <span className="text-right font-bold text-emerald-700 truncate">
                    {dOrder > 0 ? formatCompactRupees(dOrder) : '-'}
                  </span>
                  <span className="text-right font-bold text-blue-700 truncate">
                    {dColl > 0 ? formatCompactRupees(dColl) : '-'}
                  </span>
                  <span className="text-center font-semibold text-slate-800">{dKm || '-'}</span>
                  <span className="text-right font-bold text-red-600 truncate">
                    {dTotalExp > 0 ? formatCompactRupees(dTotalExp) : '-'}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
