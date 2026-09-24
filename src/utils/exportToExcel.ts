import * as XLSX from 'xlsx';
import {
  Employee,
  ExpenseRecord,
  TravelRecord,
  VisitRecord,
} from '../types';
import { formatRupees, safeDivide } from './formatters';

interface ExportParams {
  employee: Employee;
  monthString: string; // YYYY-MM
  dateRange?: { start: string; end: string };
  travelRecords: TravelRecord[];
  visitRecords: VisitRecord[];
  expenseRecords: ExpenseRecord[];
}

export function generateMonthlyReportXlsx({
  employee,
  monthString,
  travelRecords,
  visitRecords,
  expenseRecords,
}: ExportParams): void {
  const wb = XLSX.utils.book_new();

  // --- SHEET 1: MONTHLY SUMMARY ---
  const uniqueTravelDays = new Set(travelRecords.map((t) => t.date));
  const uniqueVisitDays = new Set(visitRecords.map((v) => v.date));
  const uniqueWorkingDays = new Set([...uniqueTravelDays, ...uniqueVisitDays]).size;

  const totalVisits = visitRecords.length;
  const productiveVisits = visitRecords.filter((v) => v.visitStatus === 'Productive').length;
  const nonProductiveVisits = visitRecords.filter((v) => v.visitStatus === 'Non-Productive').length;
  const newCustomers = visitRecords.filter((v) => v.isNewCustomer).length;
  const totalOrderValue = visitRecords.reduce((acc, v) => acc + (v.orderAmount || 0), 0);
  const totalCollection = visitRecords.reduce((acc, v) => acc + (v.collectionAmount || 0), 0);
  const totalKm = travelRecords.reduce((acc, t) => acc + (t.totalKm || 0), 0);

  // Travel expense sums
  const totalFuel = travelRecords.reduce((acc, t) => acc + (t.fuelExpense || 0), 0);
  const totalToll = travelRecords.reduce((acc, t) => acc + (t.tollExpense || 0), 0);
  const totalBus = travelRecords.reduce((acc, t) => acc + (t.busFare || 0), 0);
  const totalTrain = travelRecords.reduce((acc, t) => acc + (t.trainFare || 0), 0);
  const totalAllowance = travelRecords.reduce((acc, t) => acc + (t.dailyAllowance || 0), 0);
  const totalOtherTravel = travelRecords.reduce(
    (acc, t) => acc + (t.autoTaxiFare || 0) + (t.otherTravelExpense || 0),
    0
  );

  // Direct expenses
  const directExpensesSum = expenseRecords.reduce((acc, e) => acc + (e.amount || 0), 0);
  const totalTravelExpensesSum = travelRecords.reduce((acc, t) => acc + (t.totalTravelExpense || 0), 0);
  const totalExpenses = totalTravelExpensesSum + directExpensesSum;

  const avgVisitsPerDay = safeDivide(totalVisits, uniqueWorkingDays);
  const avgOrderPerVisit = safeDivide(totalOrderValue, totalVisits);
  const avgOrderPerProductiveVisit = safeDivide(totalOrderValue, productiveVisits);
  const avgCollectionPerVisit = safeDivide(totalCollection, totalVisits);
  const expensePerKm = safeDivide(totalExpenses, totalKm);
  const expenseOrderPct = totalOrderValue > 0 ? safeDivide(totalExpenses * 100, totalOrderValue) : 0;

  const summaryData = [
    ['AIRWIN SALES REPORT - AGARSEN PIPES AND FITTINGS PVT. LTD.'],
    ['BRAND: AIRWIN PIPES & TANKS'],
    [],
    ['EMPLOYEE DETAILS'],
    ['Employee Name', employee.name],
    ['Employee ID', employee.employeeId],
    ['Designation', employee.designation],
    ['Headquarter', employee.headquarter],
    ['Assigned Territory', employee.assignedTerritory],
    ['Reporting Manager', employee.reportingManager],
    ['Report Period', monthString],
    [],
    ['PERFORMANCE SUMMARY KPI', 'VALUE'],
    ['Total Working Days', uniqueWorkingDays],
    ['Total Customer Visits', totalVisits],
    ['Productive Visits', productiveVisits],
    ['Non-Productive Visits', nonProductiveVisits],
    ['New Customers Visited', newCustomers],
    ['Total Order Value (₹)', totalOrderValue],
    ['Total Collection (₹)', totalCollection],
    ['Total Travel Distance (KM)', totalKm],
    ['Total Travel Expenses (₹)', totalTravelExpensesSum],
    ['Total Direct Expenses (₹)', directExpensesSum],
    ['NET TOTAL EXPENSE (₹)', totalExpenses],
    ['NET SALES CONTRIBUTION (Order - Expense) (₹)', totalOrderValue - totalExpenses],
    [],
    ['KEY PERFORMANCE RATIOS', 'METRIC'],
    ['Average Visits / Working Day', avgVisitsPerDay],
    ['Average Order / Visit (₹)', avgOrderPerVisit],
    ['Average Order / Productive Visit (₹)', avgOrderPerProductiveVisit],
    ['Average Collection / Visit (₹)', avgCollectionPerVisit],
    ['Expense per KM (₹)', expensePerKm],
    ['Expense as % of Order Value', `${expenseOrderPct}%`],
    [],
    ['TRAVEL EXPENSE BREAKUP', 'AMOUNT (₹)'],
    ['Total Fuel Expense', totalFuel],
    ['Total Toll Expense', totalToll],
    ['Total Bus Travel', totalBus],
    ['Total Train Travel', totalTrain],
    ['Total Daily Allowance', totalAllowance],
    ['Total Auto / Taxi / Other Travel', totalOtherTravel],
  ];

  const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Monthly Summary');

  // --- SHEET 2: TRAVEL REPORT ---
  const travelHeaders = [
    'Date',
    'Travel Mode',
    'From (Start Location)',
    'To (End Location)',
    'Opening KM',
    'Closing KM',
    'Total KM',
    'Fuel (₹)',
    'Toll (₹)',
    'Bus (₹)',
    'Train (₹)',
    'Auto/Taxi (₹)',
    'Daily Allowance (₹)',
    'Other Travel (₹)',
    'Total Travel Exp (₹)',
    'Remarks',
  ];
  const travelRows = travelRecords.map((t) => [
    t.date,
    t.travelMode,
    t.startLocation,
    t.endLocation,
    t.openingKm,
    t.closingKm,
    t.totalKm,
    t.fuelExpense,
    t.tollExpense,
    t.busFare,
    t.trainFare,
    t.autoTaxiFare,
    t.dailyAllowance,
    t.otherTravelExpense,
    t.totalTravelExpense,
    t.remarks,
  ]);
  const wsTravel = XLSX.utils.aoa_to_sheet([travelHeaders, ...travelRows]);
  XLSX.utils.book_append_sheet(wb, wsTravel, 'Travel Report');

  // --- SHEET 3: CUSTOMER VISITS REPORT ---
  const visitHeaders = [
    'Date',
    'Customer Name',
    'Contact Number',
    'Location',
    'Customer Type',
    'Visit Purpose',
    'Visit Status',
    'Order Amount (₹)',
    'Collection (₹)',
    'New Customer',
    'Follow-up Date',
    'Products Discussed',
    'Remarks',
  ];
  const visitRows = visitRecords.map((v) => [
    v.date,
    v.customerName,
    v.customerMobile,
    v.location,
    v.customerType,
    v.visitPurpose,
    v.visitStatus,
    v.orderAmount,
    v.collectionAmount,
    v.isNewCustomer ? 'YES' : 'NO',
    v.nextFollowUpDate || 'None',
    v.productDiscussion,
    v.remarks,
  ]);
  const wsVisits = XLSX.utils.aoa_to_sheet([visitHeaders, ...visitRows]);
  XLSX.utils.book_append_sheet(wb, wsVisits, 'Visit Report');

  // --- SHEET 4: EXPENSES REPORT ---
  const expenseHeaders = [
    'Date',
    'Expense Head',
    'Description',
    'Amount (₹)',
    'Bill Available',
    'Bill Number',
    'Remarks',
  ];
  const expenseRows = expenseRecords.map((e) => [
    e.date,
    e.expenseHead,
    e.description,
    e.amount,
    e.billAvailable ? 'YES' : 'NO',
    e.billNumber || '-',
    e.remarks,
  ]);
  const wsExpenses = XLSX.utils.aoa_to_sheet([expenseHeaders, ...expenseRows]);
  XLSX.utils.book_append_sheet(wb, wsExpenses, 'Expense Report');

  // --- SHEET 5: DAILY SUMMARY TABLE ---
  const dateSet = Array.from(new Set([...travelRecords.map((t) => t.date), ...visitRecords.map((v) => v.date)])).sort();
  const dailyHeaders = [
    'Date',
    'Visits Count',
    'Productive Visits',
    'Total Order (₹)',
    'Total Collection (₹)',
    'Travel KM',
    'Travel Expense (₹)',
    'Direct Expense (₹)',
    'Total Expense (₹)',
    'Net (Order - Expense) (₹)',
  ];
  const dailyRows = dateSet.map((d) => {
    const dayVisits = visitRecords.filter((v) => v.date === d);
    const dayTravel = travelRecords.filter((t) => t.date === d);
    const dayExp = expenseRecords.filter((e) => e.date === d);

    const dVisitsCount = dayVisits.length;
    const dProdCount = dayVisits.filter((v) => v.visitStatus === 'Productive').length;
    const dOrder = dayVisits.reduce((acc, v) => acc + (v.orderAmount || 0), 0);
    const dColl = dayVisits.reduce((acc, v) => acc + (v.collectionAmount || 0), 0);
    const dKm = dayTravel.reduce((acc, t) => acc + (t.totalKm || 0), 0);
    const dTrvExp = dayTravel.reduce((acc, t) => acc + (t.totalTravelExpense || 0), 0);
    const dDirExp = dayExp.reduce((acc, e) => acc + (e.amount || 0), 0);
    const dTotalExp = dTrvExp + dDirExp;

    return [
      d,
      dVisitsCount,
      dProdCount,
      dOrder,
      dColl,
      dKm,
      dTrvExp,
      dDirExp,
      dTotalExp,
      dOrder - dTotalExp,
    ];
  });
  const wsDaily = XLSX.utils.aoa_to_sheet([dailyHeaders, ...dailyRows]);
  XLSX.utils.book_append_sheet(wb, wsDaily, 'Daily Summary');

  // File write
  const sanitizedName = employee.name.replace(/\s+/g, '_');
  const filename = `AIRWIN_Sales_Report_${sanitizedName}_${monthString}.xlsx`;
  XLSX.writeFile(wb, filename);
}

export function downloadCsvReport(filename: string, headers: string[], rows: (string | number)[][]): void {
  const content = [
    headers.join(','),
    ...rows.map((row) =>
      row
        .map((cell) => {
          const str = String(cell ?? '');
          return str.includes(',') || str.includes('"') || str.includes('\n')
            ? `"${str.replace(/"/g, '""')}"`
            : str;
        })
        .join(',')
    ),
  ].join('\n');

  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
