import React, { useState } from 'react';
import {
  Compass,
  MapPin,
  Fuel,
  ArrowRight,
  Check,
  AlertCircle,
  Car,
  Bike,
  Bus,
  Train,
  Plus,
  Trash2,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { TravelMode, TravelRecord } from '../../types';
import { formatRupees, getTodayDateString } from '../../utils/formatters';

interface TravelFormProps {
  initialData?: TravelRecord | null;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const TRAVEL_MODES: TravelMode[] = [
  'Company Vehicle',
  'Own Bike',
  'Own Car',
  'Bus',
  'Train',
  'Auto',
  'Taxi',
  'Other',
];

export const TravelEntryForm: React.FC<TravelFormProps> = ({
  initialData,
  onSuccess,
  onCancel,
}) => {
  const { currentUser, addTravelRecord, updateTravelRecord, isDayLocked } = useApp();

  const [date, setDate] = useState<string>(initialData?.date || getTodayDateString());
  const [travelMode, setTravelMode] = useState<TravelMode>(initialData?.travelMode || 'Own Bike');
  const [startLocation, setStartLocation] = useState<string>(initialData?.startLocation || '');
  const [endLocation, setEndLocation] = useState<string>(initialData?.endLocation || '');
  const [openingKm, setOpeningKm] = useState<string>(
    initialData?.openingKm !== undefined ? String(initialData.openingKm) : ''
  );
  const [closingKm, setClosingKm] = useState<string>(
    initialData?.closingKm !== undefined ? String(initialData.closingKm) : ''
  );

  // Expense fields
  const [fuelExpense, setFuelExpense] = useState<string>(
    initialData?.fuelExpense !== undefined ? String(initialData.fuelExpense) : ''
  );
  const [tollExpense, setTollExpense] = useState<string>(
    initialData?.tollExpense !== undefined ? String(initialData.tollExpense) : ''
  );
  const [busFare, setBusFare] = useState<string>(
    initialData?.busFare !== undefined ? String(initialData.busFare) : ''
  );
  const [trainFare, setTrainFare] = useState<string>(
    initialData?.trainFare !== undefined ? String(initialData.trainFare) : ''
  );
  const [autoTaxiFare, setAutoTaxiFare] = useState<string>(
    initialData?.autoTaxiFare !== undefined ? String(initialData.autoTaxiFare) : ''
  );
  const [dailyAllowance, setDailyAllowance] = useState<string>(
    initialData?.dailyAllowance !== undefined ? String(initialData.dailyAllowance) : '250'
  );
  const [otherTravelExpense, setOtherTravelExpense] = useState<string>(
    initialData?.otherTravelExpense !== undefined ? String(initialData.otherTravelExpense) : ''
  );
  const [remarks, setRemarks] = useState<string>(initialData?.remarks || '');

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Calculations
  const numOpeningKm = parseFloat(openingKm) || 0;
  const numClosingKm = parseFloat(closingKm) || 0;
  const isVehicleMode = ['Company Vehicle', 'Own Bike', 'Own Car'].includes(travelMode);

  // Auto calculate total KM
  const calculatedKm =
    isVehicleMode && numClosingKm >= numOpeningKm
      ? Math.max(0, numClosingKm - numOpeningKm)
      : parseFloat(closingKm) || 0;

  // Auto calculate total travel expenses
  const numFuel = parseFloat(fuelExpense) || 0;
  const numToll = parseFloat(tollExpense) || 0;
  const numBus = parseFloat(busFare) || 0;
  const numTrain = parseFloat(trainFare) || 0;
  const numAutoTaxi = parseFloat(autoTaxiFare) || 0;
  const numAllowance = parseFloat(dailyAllowance) || 0;
  const numOther = parseFloat(otherTravelExpense) || 0;

  const totalExpense =
    numFuel + numToll + numBus + numTrain + numAutoTaxi + numAllowance + numOther;

  const isLocked = isDayLocked(currentUser.id, date);

  const validate = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!date) newErrors.date = 'Date is mandatory';
    if (!startLocation.trim()) newErrors.startLocation = 'Start Location is required';
    if (!endLocation.trim()) newErrors.endLocation = 'End Location is required';

    if (isVehicleMode) {
      if (numClosingKm < numOpeningKm) {
        newErrors.closingKm = 'Closing KM cannot be less than Opening KM';
      }
    }

    if (numFuel < 0 || numToll < 0 || numBus < 0 || numTrain < 0 || numAutoTaxi < 0 || numAllowance < 0 || numOther < 0) {
      newErrors.expense = 'Amount fields must accept only valid non-negative numbers';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocked) {
      setErrors({ date: 'This day is submitted and locked. Contact Admin to reopen.' });
      return;
    }
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const travelData = {
        employeeId: currentUser.id,
        date,
        travelMode,
        startLocation: startLocation.trim(),
        endLocation: endLocation.trim(),
        openingKm: numOpeningKm,
        closingKm: numClosingKm,
        totalKm: calculatedKm,
        fuelExpense: numFuel,
        tollExpense: numToll,
        busFare: numBus,
        trainFare: numTrain,
        autoTaxiFare: numAutoTaxi,
        dailyAllowance: numAllowance,
        otherTravelExpense: numOther,
        totalTravelExpense: totalExpense,
        remarks: remarks.trim(),
      };

      if (initialData?.id) {
        await updateTravelRecord(initialData.id, travelData);
      } else {
        await addTravelRecord(travelData);
      }

      onSuccess?.();
    } catch {
      setErrors({ submit: 'Failed to save travel entry' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-4 bg-white rounded-2xl border border-slate-200 shadow-sm select-none">
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center text-red-600">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm">
              {initialData ? 'EDIT TRAVEL ENTRY' : 'NEW TRAVEL ENTRY'}
            </h3>
            <span className="text-[11px] text-slate-500">Record vehicle distance & allowances</span>
          </div>
        </div>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {isLocked && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>This day&apos;s report has already been submitted and is locked for editing.</span>
        </div>
      )}

      {/* Date & Mode */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            disabled={isLocked}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-red-500 outline-none"
          />
          {errors.date && <p className="text-[10px] text-red-500 mt-0.5">{errors.date}</p>}
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Travel Mode <span className="text-red-500">*</span>
          </label>
          <select
            value={travelMode}
            onChange={(e) => setTravelMode(e.target.value as TravelMode)}
            disabled={isLocked}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-red-500 outline-none"
          >
            {TRAVEL_MODES.map((mode) => (
              <option key={mode} value={mode}>
                {mode}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Start and End Locations */}
      <div className="space-y-2.5">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Start Location (From) <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={startLocation}
            onChange={(e) => setStartLocation(e.target.value)}
            disabled={isLocked}
            placeholder="e.g. Ahmedabad HQ, Home, GIDC Naroda"
            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-red-500 outline-none"
          />
          {errors.startLocation && (
            <p className="text-[10px] text-red-500 mt-0.5">{errors.startLocation}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            End Location (To) <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={endLocation}
            onChange={(e) => setEndLocation(e.target.value)}
            disabled={isLocked}
            placeholder="e.g. Vadodara Dealer Market, Sanand, Gandhinagar"
            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-red-500 outline-none"
          />
          {errors.endLocation && (
            <p className="text-[10px] text-red-500 mt-0.5">{errors.endLocation}</p>
          )}
        </div>
      </div>

      {/* KM Calculations Card */}
      <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-3">
        <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
          Odometer & KM Reading
        </span>

        {isVehicleMode ? (
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Opening KM</label>
              <input
                type="number"
                min="0"
                value={openingKm}
                onChange={(e) => setOpeningKm(e.target.value)}
                disabled={isLocked}
                placeholder="24500"
                className="w-full px-2.5 py-2 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-900 focus:ring-2 focus:ring-red-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Closing KM</label>
              <input
                type="number"
                min="0"
                value={closingKm}
                onChange={(e) => setClosingKm(e.target.value)}
                disabled={isLocked}
                placeholder="24588"
                className="w-full px-2.5 py-2 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-900 focus:ring-2 focus:ring-red-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-red-700 mb-1">Total KM</label>
              <div className="w-full px-2.5 py-2 bg-red-100/70 border border-red-200 rounded-lg text-xs font-black text-red-700 text-center">
                {calculatedKm} KM
              </div>
            </div>
          </div>
        ) : (
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Estimated Distance (KM)</label>
            <input
              type="number"
              min="0"
              value={closingKm}
              onChange={(e) => setClosingKm(e.target.value)}
              disabled={isLocked}
              placeholder="e.g. 45"
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-900 focus:ring-2 focus:ring-red-500 outline-none"
            />
          </div>
        )}

        {errors.closingKm && <p className="text-[10px] text-red-500">{errors.closingKm}</p>}
      </div>

      {/* Travel Expenses Breakdown */}
      <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Travel Allowances & Expenses (₹)
          </span>
          <span className="text-xs font-black text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-200">
            Total: {formatRupees(totalExpense)}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {/* Fuel */}
          <div>
            <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">Fuel Expense (₹)</label>
            <input
              type="number"
              min="0"
              value={fuelExpense}
              onChange={(e) => setFuelExpense(e.target.value)}
              disabled={isLocked}
              placeholder="0"
              className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:ring-1 focus:ring-red-500 outline-none"
            />
          </div>

          {/* Toll */}
          <div>
            <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">Toll / Fastag (₹)</label>
            <input
              type="number"
              min="0"
              value={tollExpense}
              onChange={(e) => setTollExpense(e.target.value)}
              disabled={isLocked}
              placeholder="0"
              className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:ring-1 focus:ring-red-500 outline-none"
            />
          </div>

          {/* Bus Fare */}
          <div>
            <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">Bus Fare (₹)</label>
            <input
              type="number"
              min="0"
              value={busFare}
              onChange={(e) => setBusFare(e.target.value)}
              disabled={isLocked}
              placeholder="0"
              className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:ring-1 focus:ring-red-500 outline-none"
            />
          </div>

          {/* Train Fare */}
          <div>
            <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">Train Fare (₹)</label>
            <input
              type="number"
              min="0"
              value={trainFare}
              onChange={(e) => setTrainFare(e.target.value)}
              disabled={isLocked}
              placeholder="0"
              className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:ring-1 focus:ring-red-500 outline-none"
            />
          </div>

          {/* Auto / Taxi */}
          <div>
            <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">Auto / Taxi (₹)</label>
            <input
              type="number"
              min="0"
              value={autoTaxiFare}
              onChange={(e) => setAutoTaxiFare(e.target.value)}
              disabled={isLocked}
              placeholder="0"
              className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:ring-1 focus:ring-red-500 outline-none"
            />
          </div>

          {/* Daily Allowance */}
          <div>
            <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">Daily Allowance (₹)</label>
            <input
              type="number"
              min="0"
              value={dailyAllowance}
              onChange={(e) => setDailyAllowance(e.target.value)}
              disabled={isLocked}
              placeholder="250"
              className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:ring-1 focus:ring-red-500 outline-none"
            />
          </div>

          {/* Other Travel Expense */}
          <div className="col-span-2">
            <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">Other Travel Expense (₹)</label>
            <input
              type="number"
              min="0"
              value={otherTravelExpense}
              onChange={(e) => setOtherTravelExpense(e.target.value)}
              disabled={isLocked}
              placeholder="e.g. puncture repair, parking"
              className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:ring-1 focus:ring-red-500 outline-none"
            />
          </div>
        </div>
      </div>

      {/* Remarks */}
      <div>
        <label className="block text-xs font-bold text-slate-700 mb-1">Travel Remarks / Route Notes</label>
        <textarea
          rows={2}
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          disabled={isLocked}
          placeholder="e.g. Visited industrial area and highway dealer belt"
          className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-red-500 outline-none resize-none"
        ></textarea>
      </div>

      {errors.submit && <p className="text-xs text-red-500 font-semibold">{errors.submit}</p>}

      {/* Save Button */}
      <div className="pt-2 flex gap-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors"
          >
            Cancel
          </button>
        )}

        <button
          type="submit"
          disabled={isSubmitting || isLocked}
          className="flex-2 py-3 bg-red-600 hover:bg-red-700 active:bg-red-800 disabled:opacity-50 text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-2"
        >
          <Check className="w-4 h-4" />
          <span>{initialData ? 'UPDATE TRAVEL' : 'SAVE TRAVEL ENTRY'}</span>
        </button>
      </div>
    </form>
  );
};
