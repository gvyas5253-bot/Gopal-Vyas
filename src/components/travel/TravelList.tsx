import React, { useState } from 'react';
import {
  Compass,
  Plus,
  MapPin,
  Calendar,
  Fuel,
  Edit2,
  Trash2,
  Car,
  Bike,
  Bus,
  Train,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { TravelRecord } from '../../types';
import { formatDisplayDate, formatRupees } from '../../utils/formatters';
import { TravelEntryForm } from './TravelEntryForm';

export const TravelList: React.FC = () => {
  const { currentUser, userRole, travelRecords, deleteTravelRecord, isDayLocked } = useApp();

  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<TravelRecord | null>(null);
  const [dateFilter, setDateFilter] = useState<string>(''); // empty for all

  // Filter records
  const records = travelRecords
    .filter((t) => (userRole === 'admin' ? true : t.employeeId === currentUser.id))
    .filter((t) => (!dateFilter ? true : t.date === dateFilter))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Aggregate stats
  const totalKm = records.reduce((acc, t) => acc + (t.totalKm || 0), 0);
  const totalExpense = records.reduce((acc, t) => acc + (t.totalTravelExpense || 0), 0);
  const totalFuel = records.reduce((acc, t) => acc + (t.fuelExpense || 0), 0);

  const handleDelete = async (id: string, date: string) => {
    if (isDayLocked(currentUser.id, date)) {
      alert('This date has been submitted and locked. Only an Admin can unlock it.');
      return;
    }
    if (window.confirm('Are you sure you want to delete this travel record?')) {
      await deleteTravelRecord(id);
    }
  };

  const getModeIcon = (mode: string) => {
    switch (mode) {
      case 'Own Bike':
        return <Bike className="w-4 h-4 text-emerald-600" />;
      case 'Company Vehicle':
      case 'Own Car':
      case 'Taxi':
        return <Car className="w-4 h-4 text-blue-600" />;
      case 'Bus':
        return <Bus className="w-4 h-4 text-amber-600" />;
      case 'Train':
        return <Train className="w-4 h-4 text-indigo-600" />;
      default:
        return <Compass className="w-4 h-4 text-slate-600" />;
    }
  };

  if (isAdding || editingItem) {
    return (
      <div className="flex-1 overflow-y-auto bg-slate-100 p-3 pb-20 select-none">
        <TravelEntryForm
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
      {/* Top Header & Add Action */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-black text-slate-900 leading-tight">DAILY TRAVEL LOG</h2>
          <span className="text-[11px] text-slate-500 font-medium">
            {records.length} travel entries recorded
          </span>
        </div>

        <button
          onClick={() => setIsAdding(true)}
          className="px-3.5 py-2 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-transform active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>ADD TRAVEL</span>
        </button>
      </div>

      {/* Date Filter & Aggregates */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-bold text-slate-700">Filter by Date:</span>
          <div className="flex items-center gap-1.5">
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-2 py-1 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-800 outline-none"
            />
            {dateFilter && (
              <button
                onClick={() => setDateFilter('')}
                className="text-[11px] text-red-600 font-bold hover:underline"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-center">
          <div className="bg-slate-50 p-2 rounded-xl">
            <span className="text-[10px] text-slate-500 block uppercase font-medium">Total Distance</span>
            <span className="text-base font-black text-slate-900">{totalKm} KM</span>
          </div>

          <div className="bg-slate-50 p-2 rounded-xl">
            <span className="text-[10px] text-slate-500 block uppercase font-medium">Fuel Paid</span>
            <span className="text-base font-black text-slate-900">{formatRupees(totalFuel)}</span>
          </div>

          <div className="bg-red-50 p-2 rounded-xl">
            <span className="text-[10px] text-red-700 block uppercase font-medium">Total Travel Exp</span>
            <span className="text-base font-black text-red-700">{formatRupees(totalExpense)}</span>
          </div>
        </div>
      </div>

      {/* Travel Records List */}
      {records.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center border border-slate-200 space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
            <Compass className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-slate-800 text-sm">No Travel Entries Found</h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Record opening/closing KM, route details and travel allowances.
            </p>
          </div>
          <button
            onClick={() => setIsAdding(true)}
            className="px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Record First Travel</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {records.map((item) => {
            const isLocked = isDayLocked(item.employeeId, item.date);

            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-sm space-y-2.5 transition-all"
              >
                {/* Header: Date + Mode + KM */}
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-slate-100">
                      {getModeIcon(item.travelMode)}
                    </span>
                    <div>
                      <span className="text-xs font-bold text-slate-900 block leading-tight">
                        {item.travelMode}
                      </span>
                      <span className="text-[11px] text-slate-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        {formatDisplayDate(item.date)}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-sm font-black text-red-700 block">
                      {item.totalKm} KM
                    </span>
                    <span className="text-[11px] font-bold text-slate-600">
                      {formatRupees(item.totalTravelExpense)}
                    </span>
                  </div>
                </div>

                {/* Route: Start -> End */}
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 space-y-1 text-xs">
                  <div className="flex items-center gap-1.5 text-slate-700">
                    <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
                    <span className="font-semibold text-slate-900 truncate">{item.startLocation}</span>
                    <ArrowRight className="w-3 h-3 text-slate-400 shrink-0" />
                    <span className="font-semibold text-slate-900 truncate">{item.endLocation}</span>
                  </div>

                  {item.openingKm > 0 && item.closingKm > 0 && (
                    <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-200/60">
                      <span>Odometer: {item.openingKm} → {item.closingKm}</span>
                      <span className="font-semibold text-slate-700">Diff: {item.closingKm - item.openingKm} KM</span>
                    </div>
                  )}
                </div>

                {/* Expense Details Pill Strip */}
                <div className="flex flex-wrap gap-1.5 text-[10px]">
                  {item.fuelExpense > 0 && (
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md font-medium">
                      Fuel: ₹{item.fuelExpense}
                    </span>
                  )}
                  {item.tollExpense > 0 && (
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md font-medium">
                      Toll: ₹{item.tollExpense}
                    </span>
                  )}
                  {item.dailyAllowance > 0 && (
                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 rounded-md font-medium">
                      Allowance: ₹{item.dailyAllowance}
                    </span>
                  )}
                  {item.busFare > 0 && (
                    <span className="px-2 py-0.5 bg-amber-50 text-amber-800 rounded-md font-medium">
                      Bus: ₹{item.busFare}
                    </span>
                  )}
                  {item.trainFare > 0 && (
                    <span className="px-2 py-0.5 bg-indigo-50 text-indigo-800 rounded-md font-medium">
                      Train: ₹{item.trainFare}
                    </span>
                  )}
                  {item.autoTaxiFare > 0 && (
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md font-medium">
                      Auto: ₹{item.autoTaxiFare}
                    </span>
                  )}
                </div>

                {item.remarks && (
                  <p className="text-[11px] text-slate-600 bg-slate-50 px-2 py-1 rounded border border-slate-100 italic">
                    &ldquo;{item.remarks}&rdquo;
                  </p>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs">
                  <span className={`text-[10px] font-semibold ${item.synced ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {item.synced ? '● Synced' : '○ Pending Sync'}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setEditingItem(item)}
                      disabled={isLocked}
                      className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-30"
                      title={isLocked ? 'Day locked' : 'Edit travel'}
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id, item.date)}
                      disabled={isLocked}
                      className="p-1.5 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-30"
                      title={isLocked ? 'Day locked' : 'Delete travel'}
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
    </div>
  );
};
