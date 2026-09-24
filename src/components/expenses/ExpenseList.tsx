import React, { useState } from 'react';
import {
  Receipt,
  Plus,
  Calendar,
  Image as ImageIcon,
  Edit2,
  Trash2,
  FileText,
  X,
  ExternalLink,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ExpenseRecord } from '../../types';
import { formatDisplayDate, formatRupees, getCurrentMonthString, getTodayDateString } from '../../utils/formatters';
import { ExpenseEntryForm } from './ExpenseEntryForm';

export const ExpenseList: React.FC = () => {
  const { currentUser, userRole, expenseRecords, deleteExpenseRecord, isDayLocked } = useApp();

  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<ExpenseRecord | null>(null);
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState<string>('');
  const [headFilter, setHeadFilter] = useState<string>('all');

  const todayStr = getTodayDateString();
  const currentMonthStr = getCurrentMonthString();

  const userExpenses = expenseRecords.filter((e) =>
    userRole === 'admin' ? true : e.employeeId === currentUser.id
  );

  // Filtered records
  const records = userExpenses
    .filter((e) => (!dateFilter ? true : e.date === dateFilter))
    .filter((e) => (headFilter === 'all' ? true : e.expenseHead === headFilter))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Automatic calculations (Requirement 8: TOTAL DAILY EXPENSE, TOTAL MONTHLY EXPENSE)
  const totalDailyExpense = userExpenses
    .filter((e) => e.date === todayStr)
    .reduce((acc, e) => acc + (e.amount || 0), 0);

  const totalMonthlyExpense = userExpenses
    .filter((e) => e.date.startsWith(currentMonthStr))
    .reduce((acc, e) => acc + (e.amount || 0), 0);

  const filteredTotal = records.reduce((acc, e) => acc + (e.amount || 0), 0);

  const handleDelete = async (id: string, date: string) => {
    if (isDayLocked(currentUser.id, date)) {
      alert('This date has been submitted and locked.');
      return;
    }
    if (window.confirm('Delete this expense record?')) {
      await deleteExpenseRecord(id);
    }
  };

  if (isAdding || editingItem) {
    return (
      <div className="flex-1 overflow-y-auto bg-slate-100 p-3 pb-20 select-none">
        <ExpenseEntryForm
          initialData={editingItem}
          onSuccess={() => {
            setIsAdding(false);
            setEditingItem(null);
          }}
          onCancel={() => {
            setIsAdding(false);
            setEditingItem(null);
          }}
        />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-slate-100 p-3 pb-24 space-y-3.5 select-none">
      {/* Header & Add Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-black text-slate-900 leading-tight">EXPENSE ENTRIES</h2>
          <span className="text-[11px] text-slate-500 font-medium">
            {records.length} expense records found
          </span>
        </div>

        <button
          onClick={() => setIsAdding(true)}
          className="px-3.5 py-2 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-transform active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>ADD EXPENSE</span>
        </button>
      </div>

      {/* Auto Calculated Summary Cards (Requirement 8) */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[10px] text-slate-500 font-bold uppercase block">Today&apos;s Expense</span>
          <span className="text-lg font-black text-red-600 block mt-0.5">
            {formatRupees(totalDailyExpense)}
          </span>
          <span className="text-[10px] text-slate-400">{todayStr}</span>
        </div>

        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[10px] text-slate-500 font-bold uppercase block">Monthly Expense (MTD)</span>
          <span className="text-lg font-black text-slate-900 block mt-0.5">
            {formatRupees(totalMonthlyExpense)}
          </span>
          <span className="text-[10px] text-slate-400">Current Month</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm space-y-2">
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Date</label>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full px-2 py-1 bg-slate-50 border border-slate-300 rounded-lg text-xs outline-none"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Expense Head</label>
            <select
              value={headFilter}
              onChange={(e) => setHeadFilter(e.target.value)}
              className="w-full px-2 py-1 bg-slate-50 border border-slate-300 rounded-lg text-xs outline-none"
            >
              <option value="all">All Heads</option>
              <option value="Food">Food</option>
              <option value="Hotel">Hotel</option>
              <option value="Daily Allowance">Daily Allowance</option>
              <option value="Fuel">Fuel</option>
              <option value="Toll">Toll</option>
              <option value="Local Conveyance">Local Conveyance</option>
              <option value="Customer Meeting">Customer Meeting</option>
              <option value="Parking">Parking</option>
              <option value="Courier">Courier</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        {(dateFilter || headFilter !== 'all') && (
          <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs">
            <span className="font-bold text-slate-700">Filtered Total: {formatRupees(filteredTotal)}</span>
            <button
              onClick={() => {
                setDateFilter('');
                setHeadFilter('all');
              }}
              className="text-red-600 font-bold hover:underline text-[11px]"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Expense List */}
      {records.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center border border-slate-200 space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
            <Receipt className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-slate-800 text-sm">No Expense Records</h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Record daily food, hotel, local conveyance, and bill receipts.
            </p>
          </div>
          <button
            onClick={() => setIsAdding(true)}
            className="px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add Expense</span>
          </button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {records.map((exp) => {
            const isLocked = isDayLocked(exp.employeeId, exp.date);

            return (
              <div
                key={exp.id}
                className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-xs space-y-2"
              >
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-red-600 uppercase bg-red-50 px-2 py-0.5 rounded border border-red-100">
                      {exp.expenseHead}
                    </span>
                    <h4 className="text-xs font-bold text-slate-900 mt-1">{exp.description}</h4>
                  </div>

                  <span className="text-sm font-black text-slate-900">{formatRupees(exp.amount)}</span>
                </div>

                {/* Details */}
                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    {formatDisplayDate(exp.date)}
                  </span>

                  <div className="flex items-center gap-2">
                    <span
                      className={`font-semibold ${
                        exp.billAvailable ? 'text-emerald-700' : 'text-slate-400'
                      }`}
                    >
                      {exp.billAvailable ? `Bill: ${exp.billNumber || 'Yes'}` : 'No Bill'}
                    </span>

                    {exp.billPhotoUrl && (
                      <button
                        onClick={() => setPreviewPhoto(exp.billPhotoUrl || null)}
                        className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded font-bold text-[10px] flex items-center gap-1 hover:bg-blue-100"
                      >
                        <ImageIcon className="w-3 h-3" />
                        <span>Receipt</span>
                      </button>
                    )}
                  </div>
                </div>

                {exp.remarks && (
                  <p className="text-[10px] text-slate-500 italic bg-slate-50 px-2 py-1 rounded">
                    &ldquo;{exp.remarks}&rdquo;
                  </p>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs">
                  <span className={`text-[10px] font-semibold ${exp.synced ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {exp.synced ? '● Synced' : '○ Pending Sync'}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setEditingItem(exp)}
                      disabled={isLocked}
                      className="p-1 text-slate-600 hover:text-blue-600 rounded disabled:opacity-30"
                      title={isLocked ? 'Day locked' : 'Edit'}
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(exp.id, exp.date)}
                      disabled={isLocked}
                      className="p-1 text-slate-600 hover:text-red-600 rounded disabled:opacity-30"
                      title={isLocked ? 'Day locked' : 'Delete'}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Full Photo Modal */}
      {previewPhoto && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="relative max-w-sm w-full bg-slate-900 rounded-2xl overflow-hidden p-2">
            <button
              onClick={() => setPreviewPhoto(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-white/20 text-white hover:bg-white/40 z-10"
            >
              <X className="w-5 h-5" />
            </button>
            <img src={previewPhoto} alt="Receipt Preview" className="w-full h-auto rounded-xl object-contain max-h-[80vh]" />
          </div>
        </div>
      )}
    </div>
  );
};
