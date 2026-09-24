import React, { useState } from 'react';
import {
  Receipt,
  IndianRupee,
  Camera,
  Upload,
  Check,
  AlertCircle,
  X,
  FileText,
  Image as ImageIcon,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ExpenseHead, ExpenseRecord } from '../../types';
import { formatRupees, getTodayDateString } from '../../utils/formatters';

interface ExpenseFormProps {
  initialData?: ExpenseRecord | null;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const EXPENSE_HEADS: ExpenseHead[] = [
  'Fuel',
  'Toll',
  'Bus',
  'Train',
  'Auto',
  'Taxi',
  'Food',
  'Hotel',
  'Daily Allowance',
  'Parking',
  'Courier',
  'Local Conveyance',
  'Customer Meeting',
  'Other',
];

export const ExpenseEntryForm: React.FC<ExpenseFormProps> = ({
  initialData,
  onSuccess,
  onCancel,
}) => {
  const { currentUser, addExpenseRecord, updateExpenseRecord, isDayLocked } = useApp();

  const [date, setDate] = useState<string>(initialData?.date || getTodayDateString());
  const [expenseHead, setExpenseHead] = useState<ExpenseHead>(initialData?.expenseHead || 'Food');
  const [description, setDescription] = useState<string>(initialData?.description || '');
  const [amount, setAmount] = useState<string>(
    initialData?.amount !== undefined ? String(initialData.amount) : ''
  );
  const [billAvailable, setBillAvailable] = useState<boolean>(
    initialData?.billAvailable ?? true
  );
  const [billNumber, setBillNumber] = useState<string>(initialData?.billNumber || '');
  const [billPhotoUrl, setBillPhotoUrl] = useState<string>(initialData?.billPhotoUrl || '');
  const [remarks, setRemarks] = useState<string>(initialData?.remarks || '');

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isCompressing, setIsCompressing] = useState<boolean>(false);

  const isLocked = isDayLocked(currentUser.id, date);

  // Compress image before saving
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsCompressing(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
          setBillPhotoUrl(compressedDataUrl);
        }
        setIsCompressing(false);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const validate = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!date) newErrors.date = 'Date is mandatory';
    if (!description.trim()) newErrors.description = 'Description is required';

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      newErrors.amount = 'Valid positive amount is mandatory';
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
      const expenseData = {
        employeeId: currentUser.id,
        date,
        expenseHead,
        description: description.trim(),
        amount: parseFloat(amount),
        billAvailable,
        billNumber: billAvailable ? billNumber.trim() : undefined,
        billPhotoUrl: billPhotoUrl || undefined,
        remarks: remarks.trim(),
      };

      if (initialData?.id) {
        await updateExpenseRecord(initialData.id, expenseData);
      } else {
        await addExpenseRecord(expenseData);
      }

      onSuccess?.();
    } catch {
      setErrors({ submit: 'Failed to save expense' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-4 bg-white rounded-2xl border border-slate-200 shadow-sm select-none">
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center text-red-600">
            <Receipt className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm">
              {initialData ? 'EDIT EXPENSE' : 'RECORD DAILY EXPENSE'}
            </h3>
            <span className="text-[11px] text-slate-500">Food, Hotel, Conveyance, Parking</span>
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

      {/* Date & Expense Head */}
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
            Expense Head <span className="text-red-500">*</span>
          </label>
          <select
            value={expenseHead}
            onChange={(e) => setExpenseHead(e.target.value as ExpenseHead)}
            disabled={isLocked}
            className="w-full px-2.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-red-500 outline-none"
          >
            {EXPENSE_HEADS.map((head) => (
              <option key={head} value={head}>
                {head}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Amount (Big touch target with ₹) */}
      <div>
        <label className="block text-xs font-bold text-slate-700 mb-1">
          Amount (₹) <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <span className="absolute left-3.5 top-2.5 text-base font-black text-slate-400">₹</span>
          <input
            type="number"
            min="1"
            step="any"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            disabled={isLocked}
            placeholder="0"
            className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-base font-black text-slate-900 focus:bg-white focus:ring-2 focus:ring-red-500 outline-none"
          />
        </div>
        {errors.amount && <p className="text-[10px] text-red-500 mt-0.5">{errors.amount}</p>}
      </div>

      {/* Description */}
      <div>
        <label className="block text-xs font-bold text-slate-700 mb-1">
          Expense Description <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={isLocked}
          placeholder="e.g. Hotel night stay at Rajkot, Executive lunch with dealer"
          className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-red-500 outline-none"
        />
        {errors.description && (
          <p className="text-[10px] text-red-500 mt-0.5">{errors.description}</p>
        )}
      </div>

      {/* Bill Available Switch & Number */}
      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-800">Original Bill Available?</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setBillAvailable(true)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                billAvailable ? 'bg-red-600 text-white shadow-xs' : 'bg-white text-slate-600 border'
              }`}
            >
              YES
            </button>
            <button
              type="button"
              onClick={() => setBillAvailable(false)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                !billAvailable ? 'bg-slate-800 text-white shadow-xs' : 'bg-white text-slate-600 border'
              }`}
            >
              NO
            </button>
          </div>
        </div>

        {billAvailable && (
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Bill / Invoice Number</label>
            <input
              type="text"
              value={billNumber}
              onChange={(e) => setBillNumber(e.target.value)}
              disabled={isLocked}
              placeholder="e.g. INV-2026-891"
              className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:ring-1 focus:ring-red-500 outline-none"
            />
          </div>
        )}
      </div>

      {/* Bill Photo Upload / Camera (Requirement 8 & 21) */}
      <div className="space-y-1.5">
        <label className="block text-xs font-bold text-slate-700">
          Bill / Receipt Photo (Compressed automatically)
        </label>

        {billPhotoUrl ? (
          <div className="relative rounded-xl overflow-hidden border border-slate-300 group max-h-48 bg-slate-900 flex items-center justify-center">
            <img src={billPhotoUrl} alt="Bill attachment" className="max-h-44 object-contain" />
            <button
              type="button"
              onClick={() => setBillPhotoUrl('')}
              className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-full shadow hover:bg-red-700"
              title="Remove photo"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <label className="border-2 border-dashed border-slate-300 hover:border-red-500 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer bg-slate-50 hover:bg-red-50/30 transition-colors">
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handlePhotoUpload}
              disabled={isLocked || isCompressing}
              className="hidden"
            />
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 mb-1">
              <Camera className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-800">
              {isCompressing ? 'Compressing image...' : 'Capture Bill / Upload Photo'}
            </span>
            <span className="text-[10px] text-slate-500">Camera or Gallery · Auto compressed</span>
          </label>
        )}
      </div>

      {/* Remarks */}
      <div>
        <label className="block text-xs font-bold text-slate-700 mb-1">Remarks / Note</label>
        <textarea
          rows={2}
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          disabled={isLocked}
          placeholder="Any additional remarks..."
          className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-red-500 outline-none resize-none"
        ></textarea>
      </div>

      {errors.submit && <p className="text-xs text-red-500 font-semibold">{errors.submit}</p>}

      {/* Buttons */}
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
          disabled={isSubmitting || isLocked || isCompressing}
          className="flex-2 py-3 bg-red-600 hover:bg-red-700 active:bg-red-800 disabled:opacity-50 text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-2"
        >
          <Check className="w-4 h-4" />
          <span>{initialData ? 'UPDATE EXPENSE' : 'SAVE EXPENSE'}</span>
        </button>
      </div>
    </form>
  );
};
