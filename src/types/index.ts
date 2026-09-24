/**
 * Types for AIRWIN SALES REPORT
 * AGARSEN PIPES AND FITTINGS PVT. LTD.
 * BRAND: AIRWIN PIPES & TANKS
 */

export type UserRole = 'executive' | 'admin';

export interface Employee {
  id: string;
  name: string;
  employeeId: string;
  mobile: string;
  email: string;
  designation: string;
  headquarter: string;
  assignedTerritory: string;
  reportingManager: string;
  joiningDate: string; // YYYY-MM-DD
  active: boolean;
  avatarUrl?: string;
}

export type TravelMode =
  | 'Company Vehicle'
  | 'Own Bike'
  | 'Own Car'
  | 'Bus'
  | 'Train'
  | 'Auto'
  | 'Taxi'
  | 'Other';

export interface TravelRecord {
  id: string;
  employeeId: string;
  date: string; // YYYY-MM-DD
  travelMode: TravelMode;
  startLocation: string;
  endLocation: string;
  openingKm: number;
  closingKm: number;
  totalKm: number;
  fuelExpense: number;
  tollExpense: number;
  busFare: number;
  trainFare: number;
  autoTaxiFare: number;
  dailyAllowance: number;
  otherTravelExpense: number;
  totalTravelExpense: number;
  remarks: string;
  createdAt: string;
  updatedAt: string;
  synced: boolean;
}

export type CustomerType =
  | 'Distributor'
  | 'Dealer'
  | 'Retailer'
  | 'Contractor'
  | 'Construction Company'
  | 'Wholesaler'
  | 'Plumber'
  | 'Electrician'
  | 'New Customer'
  | 'Other';

export type VisitPurpose =
  | 'Order'
  | 'Collection'
  | 'Sales Enquiry'
  | 'New Customer Development'
  | 'Product Promotion'
  | 'Scheme Discussion'
  | 'Complaint'
  | 'Payment Follow-up'
  | 'Dealer Meeting'
  | 'Retailer Meeting'
  | 'Other';

export type VisitStatus = 'Productive' | 'Non-Productive' | 'Follow-up Required';

export interface VisitRecord {
  id: string;
  employeeId: string;
  date: string; // YYYY-MM-DD
  customerName: string;
  customerMobile: string;
  location: string;
  customerType: CustomerType;
  visitPurpose: VisitPurpose;
  visitStatus: VisitStatus;
  orderAmount: number;
  collectionAmount: number;
  isNewCustomer: boolean;
  nextFollowUpDate?: string; // YYYY-MM-DD
  productDiscussion: string; // e.g. "PVC Pipes 4-inch, CPVC Fittings, Water Tanks 1000L"
  remarks: string;
  createdAt: string;
  updatedAt: string;
  synced: boolean;
}

export type ExpenseHead =
  | 'Fuel'
  | 'Toll'
  | 'Bus'
  | 'Train'
  | 'Auto'
  | 'Taxi'
  | 'Food'
  | 'Hotel'
  | 'Daily Allowance'
  | 'Parking'
  | 'Courier'
  | 'Local Conveyance'
  | 'Customer Meeting'
  | 'Other';

export interface ExpenseRecord {
  id: string;
  employeeId: string;
  date: string; // YYYY-MM-DD
  expenseHead: ExpenseHead;
  description: string;
  amount: number;
  billAvailable: boolean;
  billNumber?: string;
  billPhotoUrl?: string; // Base64 data URI or image URL
  remarks: string;
  createdAt: string;
  updatedAt: string;
  synced: boolean;
}

export interface DailySubmission {
  id: string; // usually `employeeId_YYYY-MM-DD`
  employeeId: string;
  date: string; // YYYY-MM-DD
  isSubmitted: boolean;
  submittedAt?: string;
  totalVisits: number;
  totalOrder: number;
  totalCollection: number;
  totalKm: number;
  totalExpense: number;
}

export interface MonthlyTarget {
  id: string; // `employeeId_YYYY-MM`
  employeeId: string;
  month: string; // YYYY-MM
  salesTarget: number; // e.g. 10,00,000
  visitTarget: number; // e.g. 100
  collectionTarget: number; // e.g. 8,00,000
  workingDaysTarget: number; // e.g. 24
  productiveVisitTarget: number; // e.g. 70
  kmTarget: number; // e.g. 1200
}

export interface CustomerMaster {
  id: string;
  name: string;
  contactPerson: string;
  mobile: string;
  city: string;
  territory: string;
  customerType: CustomerType;
  outstandingBalance: number;
}
