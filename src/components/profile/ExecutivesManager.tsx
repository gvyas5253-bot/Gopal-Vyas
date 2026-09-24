import React, { useState } from 'react';
import {
  Users,
  Phone,
  MapPin,
  Calendar,
  AlertCircle,
  Bell,
  CheckCircle,
  Clock,
  Shield,
  UserCheck,
  Send,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Employee } from '../../types';
import { formatDisplayDate, getTodayDateString } from '../../utils/formatters';

export const ExecutivesManager: React.FC = () => {
  const { employees, dailySubmissions, sendNotification } = useApp();

  const [reminderSent, setReminderSent] = useState<{ [id: string]: boolean }>({});
  const todayStr = getTodayDateString();

  // Find missing submissions for today (Requirement 14)
  const submittedEmpIds = new Set(
    dailySubmissions
      .filter((s) => s.date === todayStr && s.isSubmitted)
      .map((s) => s.employeeId)
  );

  const missingExecutives = employees.filter(
    (e) => e.active && !submittedEmpIds.has(e.id)
  );

  const handleSendReminder = (emp: Employee) => {
    sendNotification(
      `Reminder: ${emp.name}, please submit your daily AIRWIN sales and travel report before 9:00 PM.`
    );
    setReminderSent((prev) => ({ ...prev, [emp.id]: true }));
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-100 p-3 pb-24 space-y-4 select-none">
      {/* Top Header */}
      <div>
        <span className="text-[10px] uppercase font-bold text-red-600 tracking-wider">
          FIELD FORCE ADMINISTRATION
        </span>
        <h2 className="text-base font-black text-slate-900 leading-tight">SALES EXECUTIVES</h2>
        <span className="text-[11px] text-slate-500 font-medium">
          {employees.length} registered field executives across Gujarat
        </span>
      </div>

      {/* MISSING DAILY REPORT TRACKER (Requirement 14) */}
      <div className="bg-white rounded-2xl p-4 border border-amber-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-amber-100">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-xs text-slate-900 uppercase">
                Missing Daily Report Tracker
              </h3>
              <span className="text-[10px] text-amber-700 font-semibold">
                Today: {formatDisplayDate(todayStr, false)}
              </span>
            </div>
          </div>
          <span className="text-xs font-black text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
            {missingExecutives.length} Pending
          </span>
        </div>

        {missingExecutives.length === 0 ? (
          <div className="py-3 text-center text-xs text-emerald-700 font-bold flex items-center justify-center gap-1.5 bg-emerald-50 rounded-xl">
            <CheckCircle className="w-4 h-4" />
            <span>All sales executives have submitted today&apos;s report!</span>
          </div>
        ) : (
          <div className="space-y-2">
            {missingExecutives.map((emp) => (
              <div
                key={emp.id}
                className="p-3 bg-amber-50/60 rounded-xl border border-amber-200/80 flex items-center justify-between gap-2"
              >
                <div>
                  <h4 className="font-bold text-xs text-slate-900 leading-snug">{emp.name}</h4>
                  <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5">
                    <span>{emp.headquarter}</span>
                    <span>·</span>
                    <span className="text-amber-700 font-bold uppercase">Not Submitted</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <a
                    href={`tel:${emp.mobile}`}
                    className="p-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-slate-700 text-xs font-bold flex items-center gap-1 shadow-xs"
                    title={`Call ${emp.name}`}
                  >
                    <Phone className="w-3.5 h-3.5 text-red-600" />
                    <span>Call</span>
                  </a>

                  <button
                    onClick={() => handleSendReminder(emp)}
                    disabled={reminderSent[emp.id]}
                    className="p-2 bg-red-600 hover:bg-red-700 active:bg-red-800 disabled:bg-emerald-600 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-xs transition-colors"
                  >
                    {reminderSent[emp.id] ? (
                      <>
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Sent</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Remind</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SALES EXECUTIVE PROFILES LIST (Requirement 3) */}
      <div className="space-y-3">
        <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wide px-1">
          Executive Profiles ({employees.length})
        </h3>

        {employees.map((emp) => (
          <div
            key={emp.id}
            className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-red-600 uppercase tracking-wider">
                    {emp.designation}
                  </span>
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full uppercase ${
                      emp.active
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {emp.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <h4 className="text-sm font-black text-slate-900 mt-0.5">{emp.name}</h4>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-slate-400 block uppercase font-medium">EMP ID</span>
                <span className="text-xs font-mono font-bold text-slate-800">{emp.employeeId}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              <div className="flex items-center gap-1.5 text-slate-600">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{emp.headquarter} (HQ)</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-600">
                <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{emp.mobile}</span>
              </div>
              <div className="col-span-2 flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200/60">
                <span>Territory: {emp.assignedTerritory}</span>
                <span>Joined: {formatDisplayDate(emp.joiningDate, false)}</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
              <span>Reporting Manager: {emp.reportingManager}</span>
              <a
                href={`tel:${emp.mobile}`}
                className="text-red-600 font-bold hover:underline"
              >
                Contact
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
