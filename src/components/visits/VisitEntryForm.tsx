import React, { useState } from 'react';
import {
  Users,
  MapPin,
  Phone,
  IndianRupee,
  Calendar,
  Check,
  AlertCircle,
  X,
  Plus,
  Tag,
  Briefcase,
  Layers,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CustomerType, VisitPurpose, VisitRecord, VisitStatus } from '../../types';
import { formatRupees, getTodayDateString } from '../../utils/formatters';

interface VisitFormProps {
  initialData?: VisitRecord | null;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const CUSTOMER_TYPES: CustomerType[] = [
  'Distributor',
  'Dealer',
  'Retailer',
  'Contractor',
  'Construction Company',
  'Wholesaler',
  'Plumber',
  'Electrician',
  'New Customer',
  'Other',
];

const VISIT_PURPOSES: VisitPurpose[] = [
  'Order',
  'Collection',
  'Sales Enquiry',
  'New Customer Development',
  'Product Promotion',
  'Scheme Discussion',
  'Complaint',
  'Payment Follow-up',
  'Dealer Meeting',
  'Retailer Meeting',
  'Other',
];

const QUICK_PRODUCTS = [
  'CPVC Gold Pipes & Fittings',
  'UPVC Plumbing Pipes',
  'SWR Drainage Pipes',
  '1000L Triple Layer Tanks',
  '500L Overhead Water Tanks',
  'Agri Suction & Column Pipes',
  'Conduit Electrical Pipes',
  'Solvent Cement & Solvents',
];

export const VisitEntryForm: React.FC<VisitFormProps> = ({
  initialData,
  onSuccess,
  onCancel,
}) => {
  const { currentUser, customers, addVisitRecord, updateVisitRecord, addNewCustomer, isDayLocked } =
    useApp();

  const [date, setDate] = useState<string>(initialData?.date || getTodayDateString());
  const [customerName, setCustomerName] = useState<string>(initialData?.customerName || '');
  const [customerMobile, setCustomerMobile] = useState<string>(initialData?.customerMobile || '');
  const [location, setLocation] = useState<string>(initialData?.location || '');
  const [customerType, setCustomerType] = useState<CustomerType>(
    initialData?.customerType || 'Dealer'
  );
  const [visitPurpose, setVisitPurpose] = useState<VisitPurpose>(
    initialData?.visitPurpose || 'Order'
  );
  const [visitStatus, setVisitStatus] = useState<VisitStatus>(
    initialData?.visitStatus || 'Productive'
  );
  const [orderAmount, setOrderAmount] = useState<string>(
    initialData?.orderAmount !== undefined ? String(initialData.orderAmount) : ''
  );
  const [collectionAmount, setCollectionAmount] = useState<string>(
    initialData?.collectionAmount !== undefined ? String(initialData.collectionAmount) : ''
  );
  const [isNewCustomer, setIsNewCustomer] = useState<boolean>(
    initialData?.isNewCustomer ?? false
  );
  const [nextFollowUpDate, setNextFollowUpDate] = useState<string>(
    initialData?.nextFollowUpDate || ''
  );
  const [productDiscussion, setProductDiscussion] = useState<string>(
    initialData?.productDiscussion || ''
  );
  const [remarks, setRemarks] = useState<string>(initialData?.remarks || '');

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const isLocked = isDayLocked(currentUser.id, date);

  // Auto-fill from customer master selection
  const handleSelectCustomer = (selectedCustName: string) => {
    setCustomerName(selectedCustName);
    const found = customers.find((c) => c.name.toLowerCase() === selectedCustName.toLowerCase());
    if (found) {
      setCustomerMobile(found.mobile);
      setLocation(`${found.city}, ${found.territory}`);
      setCustomerType(found.customerType);
      setIsNewCustomer(false);
    }
  };

  const handleAddProductTag = (tag: string) => {
    if (!productDiscussion) {
      setProductDiscussion(tag);
    } else if (!productDiscussion.includes(tag)) {
      setProductDiscussion(`${productDiscussion}, ${tag}`);
    }
  };

  const validate = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!date) newErrors.date = 'Date is mandatory';
    if (!customerName.trim()) newErrors.customerName = 'Customer name is required';
    if (!location.trim()) newErrors.location = 'Visit location is required';

    const numOrder = parseFloat(orderAmount) || 0;
    const numCollection = parseFloat(collectionAmount) || 0;

    if (numOrder < 0) newErrors.orderAmount = 'Order amount cannot be negative';
    if (numCollection < 0) newErrors.collectionAmount = 'Collection amount cannot be negative';

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
      const numOrder = parseFloat(orderAmount) || 0;
      const numCollection = parseFloat(collectionAmount) || 0;

      // Auto-set Productive if order or collection entered
      let finalStatus = visitStatus;
      if (numOrder > 0 && visitStatus === 'Non-Productive') {
        finalStatus = 'Productive';
      }

      const visitData = {
        employeeId: currentUser.id,
        date,
        customerName: customerName.trim(),
        customerMobile: customerMobile.trim(),
        location: location.trim(),
        customerType,
        visitPurpose,
        visitStatus: finalStatus,
        orderAmount: numOrder,
        collectionAmount: numCollection,
        isNewCustomer,
        nextFollowUpDate: nextFollowUpDate || undefined,
        productDiscussion: productDiscussion.trim(),
        remarks: remarks.trim(),
      };

      if (initialData?.id) {
        await updateVisitRecord(initialData.id, visitData);
      } else {
        await addVisitRecord(visitData);

        // If new customer, optionally add to customer master
        if (isNewCustomer && !customers.some((c) => c.name.toLowerCase() === customerName.toLowerCase())) {
          await addNewCustomer({
            name: customerName.trim(),
            contactPerson: customerName.trim(),
            mobile: customerMobile.trim(),
            city: location.split(',')[0].trim() || currentUser.headquarter,
            territory: currentUser.assignedTerritory,
            customerType,
            outstandingBalance: 0,
          });
        }
      }

      onSuccess?.();
    } catch {
      setErrors({ submit: 'Failed to save customer visit' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-4 bg-white rounded-2xl border border-slate-200 shadow-sm select-none">
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center text-red-600">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm">
              {initialData ? 'EDIT CUSTOMER VISIT' : 'RECORD CUSTOMER VISIT'}
            </h3>
            <span className="text-[11px] text-slate-500">Record order, collection & discussion</span>
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

      {/* Date */}
      <div>
        <label className="block text-xs font-bold text-slate-700 mb-1">
          Visit Date <span className="text-red-500">*</span>
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

      {/* Quick Customer Chooser / Typeahead */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-xs font-bold text-slate-700">
            Customer / Counter Name <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center gap-1.5">
            <input
              type="checkbox"
              id="newCustCheck"
              checked={isNewCustomer}
              onChange={(e) => setIsNewCustomer(e.target.checked)}
              disabled={isLocked}
              className="rounded text-red-600 focus:ring-red-500 w-3.5 h-3.5"
            />
            <label htmlFor="newCustCheck" className="text-xs font-bold text-emerald-700 cursor-pointer">
              New Customer?
            </label>
          </div>
        </div>

        <input
          type="text"
          list="customer-list"
          value={customerName}
          onChange={(e) => handleSelectCustomer(e.target.value)}
          disabled={isLocked}
          placeholder="Search counter or type new name..."
          className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-red-500 outline-none"
        />
        <datalist id="customer-list">
          {customers.map((c) => (
            <option key={c.id} value={c.name}>
              {c.city} ({c.customerType})
            </option>
          ))}
        </datalist>
        {errors.customerName && (
          <p className="text-[10px] text-red-500 mt-0.5">{errors.customerName}</p>
        )}
      </div>

      {/* Customer Mobile & Location */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Mobile Number</label>
          <div className="relative">
            <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="tel"
              value={customerMobile}
              onChange={(e) => setCustomerMobile(e.target.value)}
              disabled={isLocked}
              placeholder="10-digit mobile"
              className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-red-500 outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Location / Market <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              disabled={isLocked}
              placeholder="e.g. Naroda GIDC"
              className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-red-500 outline-none"
            />
          </div>
          {errors.location && (
            <p className="text-[10px] text-red-500 mt-0.5">{errors.location}</p>
          )}
        </div>
      </div>

      {/* Customer Type & Visit Purpose */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Customer Type</label>
          <select
            value={customerType}
            onChange={(e) => setCustomerType(e.target.value as CustomerType)}
            disabled={isLocked}
            className="w-full px-2.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-red-500 outline-none"
          >
            {CUSTOMER_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Visit Purpose</label>
          <select
            value={visitPurpose}
            onChange={(e) => setVisitPurpose(e.target.value as VisitPurpose)}
            disabled={isLocked}
            className="w-full px-2.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-red-500 outline-none"
          >
            {VISIT_PURPOSES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Visit Status */}
      <div>
        <label className="block text-xs font-bold text-slate-700 mb-1">Visit Status</label>
        <div className="grid grid-cols-3 gap-2">
          {(['Productive', 'Non-Productive', 'Follow-up Required'] as VisitStatus[]).map((status) => {
            const isSelected = visitStatus === status;
            return (
              <button
                key={status}
                type="button"
                onClick={() => setVisitStatus(status)}
                disabled={isLocked}
                className={`py-2 px-1 text-center rounded-xl text-xs font-bold border transition-all ${
                  isSelected
                    ? status === 'Productive'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                      : status === 'Follow-up Required'
                      ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                      : 'bg-slate-700 text-white border-slate-700 shadow-sm'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {status}
              </button>
            );
          })}
        </div>
      </div>

      {/* Order Amount & Collection Amount */}
      <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-3">
        <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
          Sales & Financials (₹)
        </span>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-emerald-800 mb-1">Order Amount (₹)</label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-xs font-bold text-slate-400">₹</span>
              <input
                type="number"
                min="0"
                value={orderAmount}
                onChange={(e) => setOrderAmount(e.target.value)}
                disabled={isLocked}
                placeholder="0"
                className="w-full pl-7 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-bold text-emerald-900 focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
            {errors.orderAmount && (
              <p className="text-[10px] text-red-500 mt-0.5">{errors.orderAmount}</p>
            )}
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-blue-800 mb-1">Collection Amount (₹)</label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-xs font-bold text-slate-400">₹</span>
              <input
                type="number"
                min="0"
                value={collectionAmount}
                onChange={(e) => setCollectionAmount(e.target.value)}
                disabled={isLocked}
                placeholder="0"
                className="w-full pl-7 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-bold text-blue-900 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            {errors.collectionAmount && (
              <p className="text-[10px] text-red-500 mt-0.5">{errors.collectionAmount}</p>
            )}
          </div>
        </div>
      </div>

      {/* Next Follow-up Date */}
      <div>
        <label className="block text-xs font-bold text-slate-700 mb-1">Next Follow-up Date (Optional)</label>
        <input
          type="date"
          value={nextFollowUpDate}
          onChange={(e) => setNextFollowUpDate(e.target.value)}
          disabled={isLocked}
          className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-red-500 outline-none"
        />
      </div>

      {/* Products Discussed with Quick Chips */}
      <div>
        <label className="block text-xs font-bold text-slate-700 mb-1">
          Products Discussed / Quotations
        </label>
        <input
          type="text"
          value={productDiscussion}
          onChange={(e) => setProductDiscussion(e.target.value)}
          disabled={isLocked}
          placeholder="e.g. CPVC 1-inch, 1000L Triple Layer Tank"
          className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-red-500 outline-none"
        />

        {/* Quick Product Chips */}
        <div className="mt-2 flex flex-wrap gap-1.5">
          {QUICK_PRODUCTS.slice(0, 5).map((prod) => (
            <button
              key={prod}
              type="button"
              onClick={() => handleAddProductTag(prod)}
              disabled={isLocked}
              className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-0.5 rounded-md font-medium transition-colors"
            >
              + {prod.split(' ')[0]} {prod.split(' ')[1]}
            </button>
          ))}
        </div>
      </div>

      {/* Remarks */}
      <div>
        <label className="block text-xs font-bold text-slate-700 mb-1">Visit Remarks</label>
        <textarea
          rows={2}
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          disabled={isLocked}
          placeholder="Notes about scheme discussion, stock requirements, payment commitment..."
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
          disabled={isSubmitting || isLocked}
          className="flex-2 py-3 bg-red-600 hover:bg-red-700 active:bg-red-800 disabled:opacity-50 text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-2"
        >
          <Check className="w-4 h-4" />
          <span>{initialData ? 'UPDATE VISIT' : 'SAVE VISIT'}</span>
        </button>
      </div>
    </form>
  );
};
