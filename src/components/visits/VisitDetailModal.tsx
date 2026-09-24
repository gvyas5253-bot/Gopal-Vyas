import React from 'react';
import {
  X,
  MapPin,
  Phone,
  Calendar,
  IndianRupee,
  Clock,
  User,
  Edit2,
  Trash2,
  Copy,
  CalendarPlus,
  Share2,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { VisitRecord } from '../../types';
import { formatDisplayDate, formatRupees } from '../../utils/formatters';

interface VisitDetailProps {
  visit: VisitRecord;
  onClose: () => void;
  onEdit: (visit: VisitRecord) => void;
  onDuplicate: (visit: VisitRecord) => void;
}

export const VisitDetailModal: React.FC<VisitDetailProps> = ({
  visit,
  onClose,
  onEdit,
  onDuplicate,
}) => {
  const { employees, deleteVisitRecord, isDayLocked, currentUser, userRole } = useApp();

  const executive = employees.find((e) => e.id === visit.employeeId) || currentUser;
  const isLocked = isDayLocked(visit.employeeId, visit.date);

  const handleDelete = async () => {
    if (isLocked) {
      alert('This date has been submitted and locked.');
      return;
    }
    if (window.confirm(`Delete visit record for ${visit.customerName}?`)) {
      await deleteVisitRecord(visit.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 select-none">
      <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-700 to-red-600 text-white p-4 relative">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="pr-8">
            <div className="flex items-center gap-1.5 text-xs text-red-100 font-medium">
              <span>{visit.customerType}</span>
              {visit.isNewCustomer && (
                <span className="bg-emerald-400 text-slate-900 text-[10px] font-black px-1.5 py-0.2 rounded-full uppercase">
                  NEW
                </span>
              )}
            </div>
            <h3 className="text-base font-black text-white mt-0.5 leading-snug">{visit.customerName}</h3>
            <div className="flex items-center gap-1 text-xs text-red-100 mt-1">
              <MapPin className="w-3.5 h-3.5 text-red-200 shrink-0" />
              <span className="truncate">{visit.location}</span>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 overflow-y-auto space-y-3.5 text-xs">
          {/* Status & Purpose */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Status</span>
              <span
                className={`font-bold text-xs inline-block mt-0.5 ${
                  visit.visitStatus === 'Productive'
                    ? 'text-emerald-700'
                    : visit.visitStatus === 'Follow-up Required'
                    ? 'text-amber-700'
                    : 'text-slate-600'
                }`}
              >
                {visit.visitStatus}
              </span>
            </div>

            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Purpose</span>
              <span className="font-bold text-xs text-slate-800 block mt-0.5">{visit.visitPurpose}</span>
            </div>
          </div>

          {/* Financials: Order & Collection */}
          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-medium">Order Value:</span>
              <span className="text-sm font-black text-emerald-700">
                {visit.orderAmount > 0 ? formatRupees(visit.orderAmount) : '₹0 (No order)'}
              </span>
            </div>
            <div className="flex items-center justify-between pt-1 border-t border-slate-200">
              <span className="text-slate-500 font-medium">Payment Collected:</span>
              <span className="text-sm font-black text-blue-700">
                {visit.collectionAmount > 0 ? formatRupees(visit.collectionAmount) : '₹0'}
              </span>
            </div>
          </div>

          {/* Contact & Follow-up */}
          <div className="space-y-2 text-slate-700">
            {visit.customerMobile && (
              <div className="flex items-center justify-between bg-slate-50 p-2 rounded-xl">
                <div className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-semibold text-slate-900">{visit.customerMobile}</span>
                </div>
                <a
                  href={`tel:${visit.customerMobile}`}
                  className="px-2 py-0.5 bg-red-50 text-red-600 font-bold rounded text-[11px]"
                >
                  Call
                </a>
              </div>
            )}

            <div className="flex items-center justify-between text-slate-600 px-1">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Visit Date:
              </span>
              <span className="font-bold text-slate-900">{formatDisplayDate(visit.date)}</span>
            </div>

            {visit.nextFollowUpDate && (
              <div className="flex items-center justify-between bg-amber-50 p-2 rounded-xl text-amber-900">
                <span className="flex items-center gap-1 font-semibold">
                  <CalendarPlus className="w-3.5 h-3.5 text-amber-600" />
                  Next Follow-up:
                </span>
                <span className="font-bold">{formatDisplayDate(visit.nextFollowUpDate)}</span>
              </div>
            )}
          </div>

          {/* Product Discussion */}
          {visit.productDiscussion && (
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              <span className="text-[10px] uppercase font-bold text-slate-500 block mb-0.5">
                Products Discussed
              </span>
              <p className="text-xs text-slate-800 font-medium">{visit.productDiscussion}</p>
            </div>
          )}

          {/* Remarks */}
          {visit.remarks && (
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              <span className="text-[10px] uppercase font-bold text-slate-500 block mb-0.5">Remarks</span>
              <p className="text-xs text-slate-700 italic">&ldquo;{visit.remarks}&rdquo;</p>
            </div>
          )}

          {/* Meta Information */}
          <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-400 space-y-0.5">
            <div className="flex justify-between">
              <span>Sales Executive:</span>
              <span className="font-semibold text-slate-600">{executive.name}</span>
            </div>
            <div className="flex justify-between">
              <span>Record ID:</span>
              <span>{visit.id}</span>
            </div>
            <div className="flex justify-between">
              <span>Sync Status:</span>
              <span className={visit.synced ? 'text-emerald-600 font-semibold' : 'text-amber-600 font-semibold'}>
                {visit.synced ? 'Synchronized' : 'Pending Cloud Sync'}
              </span>
            </div>
          </div>
        </div>

        {/* Footer Actions (Requirement 7: Edit, Delete, Duplicate Visit, Add Follow-up) */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 grid grid-cols-3 gap-2">
          <button
            onClick={() => onEdit(visit)}
            disabled={isLocked}
            className="py-2.5 bg-white border border-slate-300 hover:bg-slate-100 active:bg-slate-200 text-slate-800 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 disabled:opacity-40"
          >
            <Edit2 className="w-3.5 h-3.5 text-blue-600" />
            <span>Edit</span>
          </button>

          <button
            onClick={() => onDuplicate(visit)}
            className="py-2.5 bg-white border border-slate-300 hover:bg-slate-100 active:bg-slate-200 text-slate-800 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5"
          >
            <Copy className="w-3.5 h-3.5 text-slate-600" />
            <span>Duplicate</span>
          </button>

          <button
            onClick={handleDelete}
            disabled={isLocked}
            className="py-2.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 disabled:opacity-40"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete</span>
          </button>
        </div>
      </div>
    </div>
  );
};
