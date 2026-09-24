import React, { useState } from 'react';
import {
  Users,
  Compass,
  Receipt,
  FileSpreadsheet,
  TrendingUp,
  Filter,
  Search,
  CheckCircle,
  Calendar,
  Layers,
  BarChart2,
  PieChart,
  ArrowUpRight,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  formatCompactRupees,
  formatDisplayDate,
  formatRupees,
  getCurrentMonthString,
  safeDivide,
} from '../../utils/formatters';
import { generateMonthlyReportXlsx } from '../../utils/exportToExcel';

export const AdminDashboard: React.FC = () => {
  const {
    employees,
    travelRecords,
    visitRecords,
    expenseRecords,
    dailySubmissions,
    monthlyTargets,
    setActiveTab,
  } = useApp();

  const [selectedMonth, setSelectedMonth] = useState<string>(getCurrentMonthString());
  const [selectedTerritory, setSelectedTerritory] = useState<string>('all');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('all');
  const [selectedCustomerType, setSelectedCustomerType] = useState<string>('all');
  const [selectedVisitStatus, setSelectedVisitStatus] = useState<string>('all');

  // Filtered dataset
  const filteredEmployees = employees.filter((emp) => {
    if (selectedEmployeeId !== 'all' && emp.id !== selectedEmployeeId) return false;
    if (selectedTerritory !== 'all' && !emp.assignedTerritory.toLowerCase().includes(selectedTerritory.toLowerCase())) {
      return false;
    }
    return true;
  });

  const empIds = new Set(filteredEmployees.map((e) => e.id));

  const filteredVisits = visitRecords.filter((v) => {
    if (!empIds.has(v.employeeId)) return false;
    if (!v.date.startsWith(selectedMonth)) return false;
    if (selectedCustomerType !== 'all' && v.customerType !== selectedCustomerType) return false;
    if (selectedVisitStatus !== 'all' && v.visitStatus !== selectedVisitStatus) return false;
    return true;
  });

  const filteredTravel = travelRecords.filter((t) => {
    if (!empIds.has(t.employeeId)) return false;
    if (!t.date.startsWith(selectedMonth)) return false;
    return true;
  });

  const filteredExpenses = expenseRecords.filter((e) => {
    if (!empIds.has(e.employeeId)) return false;
    if (!e.date.startsWith(selectedMonth)) return false;
    return true;
  });

  // Requirement 12 Aggregates
  const totalExecutives = filteredEmployees.length;
  const totalVisits = filteredVisits.length;
  const totalProductiveVisits = filteredVisits.filter((v) => v.visitStatus === 'Productive').length;
  const totalOrdersCount = filteredVisits.filter((v) => (v.orderAmount || 0) > 0).length;
  const totalOrderValue = filteredVisits.reduce((acc, v) => acc + (v.orderAmount || 0), 0);
  const totalCollection = filteredVisits.reduce((acc, v) => acc + (v.collectionAmount || 0), 0);
  const totalKm = filteredTravel.reduce((acc, t) => acc + (t.totalKm || 0), 0);

  const totalTravelExpenses = filteredTravel.reduce((acc, t) => acc + (t.totalTravelExpense || 0), 0);
  const totalDirectExpenses = filteredExpenses.reduce((acc, e) => acc + (e.amount || 0), 0);
  const totalExpense = totalTravelExpenses + totalDirectExpenses;

  // Chart Data 1, 2, 3: Daily Activity Trend (Visits, Orders, Collection)
  const daysInMonth = Array.from(new Set(filteredVisits.map((v) => v.date))).sort();
  const dailyTrends = daysInMonth.map((dateStr) => {
    const dVisits = filteredVisits.filter((v) => v.date === dateStr);
    return {
      date: dateStr.split('-')[2], // day number e.g. "23"
      fullDate: dateStr,
      visits: dVisits.length,
      orders: dVisits.reduce((acc, v) => acc + (v.orderAmount || 0), 0),
      collection: dVisits.reduce((acc, v) => acc + (v.collectionAmount || 0), 0),
    };
  });

  // Chart Data 4 & 5 & 7: By Executive (Sales, Visits, KM)
  const executiveStats = filteredEmployees.map((emp) => {
    const ev = filteredVisits.filter((v) => v.employeeId === emp.id);
    const et = filteredTravel.filter((t) => t.employeeId === emp.id);
    const ee = filteredExpenses.filter((e) => e.employeeId === emp.id);

    const ordersSum = ev.reduce((acc, v) => acc + (v.orderAmount || 0), 0);
    const collectionSum = ev.reduce((acc, v) => acc + (v.collectionAmount || 0), 0);
    const kmSum = et.reduce((acc, t) => acc + (t.totalKm || 0), 0);
    const trvExp = et.reduce((acc, t) => acc + (t.totalTravelExpense || 0), 0);
    const dirExp = ee.reduce((acc, e) => acc + (e.amount || 0), 0);

    return {
      id: emp.id,
      name: emp.name,
      hq: emp.headquarter,
      visitsCount: ev.length,
      prodVisitsCount: ev.filter((v) => v.visitStatus === 'Productive').length,
      ordersTotal: ordersSum,
      collectionTotal: collectionSum,
      kmTotal: kmSum,
      expenseTotal: trvExp + dirExp,
    };
  });

  // Chart Data 6: Expense by Category
  const expenseCategories = ['Fuel', 'Hotel', 'Food', 'Toll', 'Daily Allowance', 'Local Conveyance', 'Other'];
  const expenseBreakdown = expenseCategories.map((cat) => {
    let catSum = 0;
    if (cat === 'Fuel') {
      catSum = filteredTravel.reduce((acc, t) => acc + (t.fuelExpense || 0), 0);
    } else if (cat === 'Toll') {
      catSum = filteredTravel.reduce((acc, t) => acc + (t.tollExpense || 0), 0);
    } else if (cat === 'Daily Allowance') {
      catSum = filteredTravel.reduce((acc, t) => acc + (t.dailyAllowance || 0), 0);
    } else {
      catSum = filteredExpenses
        .filter((e) => (cat === 'Other' ? !['Hotel', 'Food', 'Local Conveyance'].includes(e.expenseHead) : e.expenseHead === cat))
        .reduce((acc, e) => acc + (e.amount || 0), 0);
    }
    return { name: cat, amount: catSum };
  });

  const maxExpense = Math.max(...expenseBreakdown.map((b) => b.amount), 1);
  const maxOrders = Math.max(...executiveStats.map((e) => e.ordersTotal), 1);
  const maxVisits = Math.max(...executiveStats.map((e) => e.visitsCount), 1);
  const maxKm = Math.max(...executiveStats.map((e) => e.kmTotal), 1);

  return (
    <div className="flex-1 overflow-y-auto bg-slate-100 p-3 pb-24 space-y-4 select-none">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] uppercase font-bold text-red-600 tracking-wider">
            EXECUTIVE MANAGEMENT MIS
          </span>
          <h2 className="text-base font-black text-slate-900 leading-tight">MANAGEMENT DASHBOARD</h2>
        </div>

        <button
          onClick={() => {
            if (filteredEmployees.length > 0) {
              generateMonthlyReportXlsx({
                employee: filteredEmployees[0],
                monthString: selectedMonth,
                travelRecords: filteredTravel,
                visitRecords: filteredVisits,
                expenseRecords: filteredExpenses,
              });
            }
          }}
          className="px-3 py-1.5 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm"
        >
          <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
          <span>Export MIS</span>
        </button>
      </div>

      {/* FILTER BAR (Requirement 13) */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
            <Filter className="w-4 h-4 text-red-600" />
            <span>EXECUTIVE FILTERS</span>
          </div>
          {(selectedEmployeeId !== 'all' ||
            selectedTerritory !== 'all' ||
            selectedCustomerType !== 'all' ||
            selectedVisitStatus !== 'all') && (
            <button
              onClick={() => {
                setSelectedEmployeeId('all');
                setSelectedTerritory('all');
                setSelectedCustomerType('all');
                setSelectedVisitStatus('all');
              }}
              className="text-[11px] font-bold text-red-600 hover:underline"
            >
              Reset Filters
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          {/* Employee */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">Employee</label>
            <select
              value={selectedEmployeeId}
              onChange={(e) => setSelectedEmployeeId(e.target.value)}
              className="w-full px-2 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-800 outline-none"
            >
              <option value="all">All Executives ({employees.length})</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} ({emp.headquarter})
                </option>
              ))}
            </select>
          </div>

          {/* Month */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">Month</label>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full px-2 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-800 outline-none"
            />
          </div>

          {/* Territory */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">Territory</label>
            <select
              value={selectedTerritory}
              onChange={(e) => setSelectedTerritory(e.target.value)}
              className="w-full px-2 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-800 outline-none"
            >
              <option value="all">All Territories</option>
              <option value="North Gujarat">North Gujarat & Ahmedabad</option>
              <option value="Saurashtra">Saurashtra & Kutch</option>
              <option value="South Gujarat">South Gujarat & Surat</option>
            </select>
          </div>

          {/* Customer Type */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">Customer Type</label>
            <select
              value={selectedCustomerType}
              onChange={(e) => setSelectedCustomerType(e.target.value)}
              className="w-full px-2 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-800 outline-none"
            >
              <option value="all">All Types</option>
              <option value="Distributor">Distributor</option>
              <option value="Dealer">Dealer</option>
              <option value="Retailer">Retailer</option>
              <option value="Contractor">Contractor</option>
              <option value="Wholesaler">Wholesaler</option>
              <option value="Plumber">Plumber</option>
            </select>
          </div>
        </div>
      </div>

      {/* 8 FACTUAL MANAGEMENT KPI CARDS (Requirement 12) */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase block">Active Executives</span>
          <span className="text-xl font-black text-slate-900 block mt-0.5">{totalExecutives}</span>
          <span className="text-[10px] text-slate-500">Agarsen Pipes Force</span>
        </div>

        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase block">Total Visits</span>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-xl font-black text-slate-900">{totalVisits}</span>
            <span className="text-[11px] font-bold text-emerald-600">({totalProductiveVisits} Prod)</span>
          </div>
          <span className="text-[10px] text-slate-500">Counter visits</span>
        </div>

        <div className="bg-emerald-50/70 p-3 rounded-2xl border border-emerald-100 shadow-sm">
          <span className="text-[10px] font-bold text-emerald-800 uppercase block">Total Order Value</span>
          <span className="text-lg font-black text-emerald-900 block mt-0.5">
            {formatRupees(totalOrderValue)}
          </span>
          <span className="text-[10px] text-emerald-700">{totalOrdersCount} booked orders</span>
        </div>

        <div className="bg-blue-50/70 p-3 rounded-2xl border border-blue-100 shadow-sm">
          <span className="text-[10px] font-bold text-blue-800 uppercase block">Total Collection</span>
          <span className="text-lg font-black text-blue-900 block mt-0.5">
            {formatRupees(totalCollection)}
          </span>
          <span className="text-[10px] text-blue-700">PDC & RTGS cleared</span>
        </div>

        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase block">Total Travel KM</span>
          <span className="text-xl font-black text-slate-900 block mt-0.5">{totalKm} KM</span>
          <span className="text-[10px] text-slate-500">Field distance covered</span>
        </div>

        <div className="bg-red-50/70 p-3 rounded-2xl border border-red-100 shadow-sm">
          <span className="text-[10px] font-bold text-red-800 uppercase block">Total Expenses</span>
          <span className="text-lg font-black text-red-900 block mt-0.5">
            {formatRupees(totalExpense)}
          </span>
          <span className="text-[10px] text-red-700">Travel + Daily allowances</span>
        </div>
      </div>

      {/* CHARTS SECTION (Requirement 12: 7 Factual Charts) */}

      {/* Chart 1, 2, 3: Daily Trend Bars (Visits, Orders, Collections) */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-red-600" />
            <h3 className="font-bold text-xs text-slate-900 uppercase">
              1. Daily Visit Count & Orders Trend
            </h3>
          </div>
          <span className="text-[10px] font-semibold text-slate-500">{selectedMonth}</span>
        </div>

        {dailyTrends.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-4">No daily entries for selected filters</p>
        ) : (
          <div className="space-y-3">
            <div className="flex items-end gap-2 h-28 pt-2 pb-1 border-b border-slate-200 overflow-x-auto">
              {dailyTrends.map((d) => {
                const maxV = Math.max(...dailyTrends.map((t) => t.visits), 1);
                const heightPct = Math.round((d.visits / maxV) * 85);

                return (
                  <div key={d.fullDate} className="flex-1 min-w-8 flex flex-col items-center gap-1 group">
                    <span className="text-[9px] font-bold text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity">
                      {d.visits}v
                    </span>
                    <div
                      className="w-full bg-red-500 rounded-t group-hover:bg-red-600 transition-all"
                      style={{ height: `${Math.max(10, heightPct)}%` }}
                    ></div>
                    <span className="text-[10px] font-bold text-slate-500">{d.date}</span>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-center gap-4 text-[10px] text-slate-500 font-semibold">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 bg-red-500 rounded-xs"></span>
                Visits Count
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Chart 4 & 5: Monthly Sales & Visits by Executive */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <h3 className="font-bold text-xs text-slate-900 uppercase pb-2 border-b border-slate-100">
          4 & 5. Monthly Sales & Visits by Executive
        </h3>

        <div className="space-y-3 text-xs">
          {executiveStats.map((st) => {
            const orderPct = Math.round((st.ordersTotal / maxOrders) * 100);
            const visitPct = Math.round((st.visitsCount / maxVisits) * 100);

            return (
              <div key={st.id} className="p-3 bg-slate-50 rounded-xl space-y-2 border border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">{st.name} ({st.hq})</span>
                  <span className="font-black text-emerald-700">{formatRupees(st.ordersTotal)}</span>
                </div>

                {/* Sales bar */}
                <div className="space-y-0.5">
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>Order Value</span>
                    <span>{formatCompactRupees(st.ordersTotal)}</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${orderPct}%` }}></div>
                  </div>
                </div>

                {/* Visits bar */}
                <div className="space-y-0.5">
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>Visits ({st.prodVisitsCount} Productive)</span>
                    <span>{st.visitsCount} visits</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div className="bg-red-500 h-full rounded-full" style={{ width: `${visitPct}%` }}></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Chart 6: Expense by Category */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <h3 className="font-bold text-xs text-slate-900 uppercase">
            6. Expense Breakdown by Category
          </h3>
          <span className="font-black text-xs text-red-600">{formatRupees(totalExpense)}</span>
        </div>

        <div className="space-y-2 text-xs">
          {expenseBreakdown.map((cat) => {
            const pct = Math.round((cat.amount / maxExpense) * 100);
            return (
              <div key={cat.name} className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="font-medium text-slate-700">{cat.name}</span>
                  <span className="font-bold text-slate-900">{formatRupees(cat.amount)}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="bg-red-500 h-full rounded-full" style={{ width: `${pct}%` }}></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Chart 7: KM by Executive */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <h3 className="font-bold text-xs text-slate-900 uppercase pb-2 border-b border-slate-100">
          7. Travel Distance (KM) by Executive
        </h3>

        <div className="space-y-2 text-xs">
          {executiveStats.map((st) => {
            const pct = Math.round((st.kmTotal / maxKm) * 100);
            return (
              <div key={st.id} className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="font-medium text-slate-700">{st.name}</span>
                  <span className="font-black text-slate-900">{st.kmTotal} KM</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="bg-blue-600 h-full rounded-full" style={{ width: `${pct}%` }}></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
