import React, { useState } from 'react';
import {
  Users,
  Plus,
  Search,
  Filter,
  MapPin,
  Calendar,
  CheckCircle2,
  Clock,
  Phone,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CustomerType, VisitRecord, VisitStatus } from '../../types';
import { formatDisplayDate, formatRupees } from '../../utils/formatters';
import { VisitDetailModal } from './VisitDetailModal';
import { VisitEntryForm } from './VisitEntryForm';

export const VisitList: React.FC = () => {
  const { currentUser, userRole, visitRecords, isDayLocked } = useApp();

  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<VisitRecord | null>(null);
  const [selectedVisit, setSelectedVisit] = useState<VisitRecord | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  // Filter records
  const records = visitRecords
    .filter((v) => (userRole === 'admin' ? true : v.employeeId === currentUser.id))
    .filter((v) => {
      if (statusFilter !== 'all' && v.visitStatus !== statusFilter) return false;
      if (typeFilter !== 'all' && v.customerType !== typeFilter) return false;
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        return (
          v.customerName.toLowerCase().includes(term) ||
          v.location.toLowerCase().includes(term) ||
          v.customerMobile.includes(term)
        );
      }
      return true;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Aggregate stats (Requirement 6)
  const totalVisits = records.length;
  const productiveVisits = records.filter((v) => v.visitStatus === 'Productive').length;
  const nonProductiveVisits = records.filter((v) => v.visitStatus === 'Non-Productive').length;
  const newCustomers = records.filter((v) => v.isNewCustomer).length;
  const totalOrderValue = records.reduce((acc, v) => acc + (v.orderAmount || 0), 0);
  const totalCollection = records.reduce((acc, v) => acc + (v.collectionAmount || 0), 0);

  const handleDuplicate = (visit: VisitRecord) => {
    setSelectedVisit(null);
    setEditingItem({
      ...visit,
      id: '',
      date: new Date().toISOString().split('T')[0],
      orderAmount: 0,
      collectionAmount: 0,
      remarks: `Follow-up visit duplicated from ${visit.date}`,
    });
    setIsAdding(true);
  };

  if (isAdding || editingItem) {
    return (
      <div className="flex-1 overflow-y-auto bg-slate-100 p-3 pb-20 select-none">
        <VisitEntryForm
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
    <div className="flex-1 overflow-y-auto bg-slate-100 p-3 pb-24 space-y-3 select-none">
      {/* Top Header & Add Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-black text-slate-900 leading-tight">CUSTOMER VISITS</h2>
          <span className="text-[11px] text-slate-500 font-medium">
            {records.length} customer visits listed
          </span>
        </div>

        <button
          onClick={() => setIsAdding(true)}
          className="px-3.5 py-2 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-transform active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>ADD VISIT</span>
        </button>
      </div>

      {/* Aggregate KPIs Card (Requirement 6) */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm space-y-2">
        <div className="grid grid-cols-4 gap-1.5 text-center">
          <div className="bg-slate-50 p-2 rounded-xl">
            <span className="text-[9px] text-slate-500 uppercase font-bold block">Visits</span>
            <span className="text-base font-black text-slate-900">{totalVisits}</span>
          </div>

          <div className="bg-emerald-50 p-2 rounded-xl">
            <span className="text-[9px] text-emerald-700 uppercase font-bold block">Prod.</span>
            <span className="text-base font-black text-emerald-700">{productiveVisits}</span>
          </div>

          <div className="bg-blue-50 p-2 rounded-xl">
            <span className="text-[9px] text-blue-700 uppercase font-bold block">New Cust</span>
            <span className="text-base font-black text-blue-700">{newCustomers}</span>
          </div>

          <div className="bg-slate-50 p-2 rounded-xl">
            <span className="text-[9px] text-slate-500 uppercase font-bold block">Non-Prod</span>
            <span className="text-base font-black text-slate-700">{nonProductiveVisits}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
          <div className="flex justify-between items-baseline px-2 py-1 bg-emerald-50/70 rounded-lg">
            <span className="text-[11px] font-bold text-emerald-800">Orders:</span>
            <span className="text-xs font-black text-emerald-900">{formatRupees(totalOrderValue)}</span>
          </div>

          <div className="flex justify-between items-baseline px-2 py-1 bg-blue-50/70 rounded-lg">
            <span className="text-[11px] font-bold text-blue-800">Collection:</span>
            <span className="text-xs font-black text-blue-900">{formatRupees(totalCollection)}</span>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by customer name, market, phone..."
            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-red-500 outline-none shadow-xs"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-[11px] font-bold text-slate-400 shrink-0">Status:</span>
          {['all', 'Productive', 'Follow-up Required', 'Non-Productive'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-2.5 py-1 rounded-full text-[11px] font-bold shrink-0 transition-colors ${
                statusFilter === st
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {st === 'all' ? 'All Status' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Customer Visits List */}
      {records.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center border border-slate-200 space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-slate-800 text-sm">No Customer Visits Found</h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Record counter visits, orders, payment collection and follow-ups.
            </p>
          </div>
          <button
            onClick={() => setIsAdding(true)}
            className="px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Record First Visit</span>
          </button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {records.map((visit) => {
            const isProd = visit.visitStatus === 'Productive';
            const isFollow = visit.visitStatus === 'Follow-up Required';

            return (
              <div
                key={visit.id}
                onClick={() => setSelectedVisit(visit)}
                className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-xs hover:border-red-300 active:bg-slate-50 cursor-pointer space-y-2 transition-all"
              >
                {/* Header: Customer Name + Status Badge */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                        {visit.customerType}
                      </span>
                      {visit.isNewCustomer && (
                        <span className="bg-emerald-100 text-emerald-800 text-[9px] font-black px-1.5 py-0.2 rounded-full uppercase">
                          NEW
                        </span>
                      )}
                    </div>
                    <h3 className="font-black text-sm text-slate-900 mt-0.5 leading-snug">
                      {visit.customerName}
                    </h3>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase shrink-0 ${
                      isProd
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : isFollow
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}
                  >
                    {visit.visitStatus}
                  </span>
                </div>

                {/* Location & Date */}
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span className="flex items-center gap-1 truncate max-w-[200px]">
                    <MapPin className="w-3 h-3 text-red-500 shrink-0" />
                    {visit.location}
                  </span>
                  <span className="flex items-center gap-1 shrink-0 font-medium">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    {formatDisplayDate(visit.date)}
                  </span>
                </div>

                {/* Financial Strip if order or collection */}
                {(visit.orderAmount > 0 || visit.collectionAmount > 0) && (
                  <div className="bg-slate-50 p-2 rounded-xl flex items-center justify-between text-xs font-bold">
                    {visit.orderAmount > 0 && (
                      <span className="text-emerald-700">
                        Order: {formatRupees(visit.orderAmount)}
                      </span>
                    )}
                    {visit.collectionAmount > 0 && (
                      <span className="text-blue-700">
                        Collection: {formatRupees(visit.collectionAmount)}
                      </span>
                    )}
                  </div>
                )}

                {/* Products Discussed */}
                {visit.productDiscussion && (
                  <p className="text-[11px] text-slate-600 truncate bg-slate-50/60 px-2 py-1 rounded">
                    <span className="font-semibold text-slate-700">Discussed:</span> {visit.productDiscussion}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Visit Detail Modal (Requirement 7) */}
      {selectedVisit && (
        <VisitDetailModal
          visit={selectedVisit}
          onClose={() => setSelectedVisit(null)}
          onEdit={(v) => {
            setSelectedVisit(null);
            setEditingItem(v);
          }}
          onDuplicate={handleDuplicate}
        />
      )}
    </div>
  );
};
