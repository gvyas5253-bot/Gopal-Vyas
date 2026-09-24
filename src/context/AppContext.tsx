import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  CustomerMaster,
  DailySubmission,
  Employee,
  ExpenseRecord,
  MonthlyTarget,
  TravelRecord,
  UserRole,
  VisitRecord,
} from '../types';
import {
  SEED_ADMIN,
  SEED_CUSTOMERS,
  SEED_EMPLOYEES,
  SEED_EXPENSES,
  SEED_SUBMISSIONS,
  SEED_TARGETS,
  SEED_TRAVEL,
  SEED_VISITS,
} from '../data/seedData';
import { getCurrentMonthString, getTodayDateString } from '../utils/formatters';

interface AppContextType {
  currentUser: Employee;
  userRole: UserRole;
  isLoggedIn: boolean;
  isOnline: boolean;
  isDeviceFrame: boolean;
  activeTab: string;
  selectedDate: string;
  selectedMonth: string;

  // Data collections
  employees: Employee[];
  customers: CustomerMaster[];
  travelRecords: TravelRecord[];
  visitRecords: VisitRecord[];
  expenseRecords: ExpenseRecord[];
  dailySubmissions: DailySubmission[];
  monthlyTargets: MonthlyTarget[];

  // Navigation & UI state
  setActiveTab: (tab: string) => void;
  setSelectedDate: (date: string) => void;
  setSelectedMonth: (month: string) => void;
  setIsDeviceFrame: (val: boolean | ((prev: boolean) => boolean)) => void;
  setIsOnline: (val: boolean) => void;

  // Auth
  setUserRole: (role: UserRole) => void;
  setCurrentUser: (emp: Employee) => void;
  login: (identifierOrRole?: string | UserRole, password?: string, role?: UserRole) => Promise<boolean>;
  logout: () => void;
  switchUser: (employeeId: string) => void;

  // Notification state
  notificationMessage: string | null;
  sendNotification: (msg: string) => void;
  dismissNotification: () => void;

  // CRUD Operations
  addTravelRecord: (record: Omit<TravelRecord, 'id' | 'createdAt' | 'updatedAt' | 'synced'>) => Promise<TravelRecord>;
  updateTravelRecord: (id: string, record: Partial<TravelRecord>) => Promise<void>;
  deleteTravelRecord: (id: string) => Promise<void>;

  addVisitRecord: (record: Omit<VisitRecord, 'id' | 'createdAt' | 'updatedAt' | 'synced'>) => Promise<VisitRecord>;
  updateVisitRecord: (id: string, record: Partial<VisitRecord>) => Promise<void>;
  deleteVisitRecord: (id: string) => Promise<void>;

  addExpenseRecord: (record: Omit<ExpenseRecord, 'id' | 'createdAt' | 'updatedAt' | 'synced'>) => Promise<ExpenseRecord>;
  updateExpenseRecord: (id: string, record: Partial<ExpenseRecord>) => Promise<void>;
  deleteExpenseRecord: (id: string) => Promise<void>;

  addNewCustomer: (cust: Omit<CustomerMaster, 'id'>) => Promise<CustomerMaster>;

  // Daily Submission & Lock
  submitDailyReport: (date: string) => Promise<void>;
  unlockDailyReport: (employeeId: string, date: string) => Promise<void>;
  isDayLocked: (employeeId: string, date: string) => boolean;

  // Target config
  updateMonthlyTarget: (
    targetOrEmpId: MonthlyTarget | string,
    month?: string,
    partialTarget?: Partial<MonthlyTarget>
  ) => Promise<void>;

  // Sync & Maintenance
  syncPendingRecords: () => Promise<number>;
  isSyncing: boolean;
  pendingSyncCount: number;
  resetToSeedData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  EMPLOYEES: 'airwin_employees_v1',
  CUSTOMERS: 'airwin_customers_v1',
  TRAVEL: 'airwin_travel_v1',
  VISITS: 'airwin_visits_v1',
  EXPENSES: 'airwin_expenses_v1',
  SUBMISSIONS: 'airwin_submissions_v1',
  TARGETS: 'airwin_targets_v1',
  CURRENT_USER_ID: 'airwin_current_user_id_v1',
  CURRENT_ROLE: 'airwin_current_role_v1',
  IS_LOGGED_IN: 'airwin_is_logged_in_v1',
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load data from localStorage or fallback to seeds
  const [employees, setEmployees] = useState<Employee[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.EMPLOYEES);
    return saved ? JSON.parse(saved) : SEED_EMPLOYEES;
  });

  const [customers, setCustomers] = useState<CustomerMaster[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
    return saved ? JSON.parse(saved) : SEED_CUSTOMERS;
  });

  const [travelRecords, setTravelRecords] = useState<TravelRecord[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TRAVEL);
    return saved ? JSON.parse(saved) : SEED_TRAVEL;
  });

  const [visitRecords, setVisitRecords] = useState<VisitRecord[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.VISITS);
    return saved ? JSON.parse(saved) : SEED_VISITS;
  });

  const [expenseRecords, setExpenseRecords] = useState<ExpenseRecord[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.EXPENSES);
    return saved ? JSON.parse(saved) : SEED_EXPENSES;
  });

  const [dailySubmissions, setDailySubmissions] = useState<DailySubmission[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SUBMISSIONS);
    return saved ? JSON.parse(saved) : SEED_SUBMISSIONS;
  });

  const [monthlyTargets, setMonthlyTargets] = useState<MonthlyTarget[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TARGETS);
    return saved ? JSON.parse(saved) : SEED_TARGETS;
  });

  // Auth state
  const [userRole, setUserRole] = useState<UserRole>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_ROLE);
    return (saved as UserRole) || 'executive';
  });

  const [currentUser, setCurrentUser] = useState<Employee>(() => {
    const savedId = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);
    if (savedId === SEED_ADMIN.id) return SEED_ADMIN;
    const found = SEED_EMPLOYEES.find((e) => e.id === savedId);
    return found || SEED_EMPLOYEES[0];
  });

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.IS_LOGGED_IN);
    return saved !== null ? JSON.parse(saved) : true; // Default logged in for smooth preview
  });

  // UI state
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine ?? true);
  const [isDeviceFrame, setIsDeviceFrame] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>('home');
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateString());
  const [selectedMonth, setSelectedMonth] = useState<string>(getCurrentMonthString());
  const [notificationMessage, setNotificationMessage] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  const sendNotification = (msg: string) => {
    setNotificationMessage(msg);
  };

  const dismissNotification = () => {
    setNotificationMessage(null);
  };

  // Listen to browser network changes
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(employees));
  }, [employees]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TRAVEL, JSON.stringify(travelRecords));
  }, [travelRecords]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.VISITS, JSON.stringify(visitRecords));
  }, [visitRecords]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenseRecords));
  }, [expenseRecords]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(dailySubmissions));
  }, [dailySubmissions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TARGETS, JSON.stringify(monthlyTargets));
  }, [monthlyTargets]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CURRENT_ROLE, userRole);
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, currentUser.id);
    localStorage.setItem(STORAGE_KEYS.IS_LOGGED_IN, JSON.stringify(isLoggedIn));
  }, [userRole, currentUser, isLoggedIn]);

  // Auth methods
  const login = async (
    identifierOrRole?: string | UserRole,
    password?: string,
    role?: UserRole
  ): Promise<boolean> => {
    let resolvedRole: UserRole = 'executive';

    if (identifierOrRole === 'admin' || identifierOrRole === 'executive') {
      resolvedRole = identifierOrRole;
    } else if (role) {
      resolvedRole = role;
    } else if (identifierOrRole && identifierOrRole.includes('admin')) {
      resolvedRole = 'admin';
    }

    setUserRole(resolvedRole);

    if (resolvedRole === 'admin') {
      setCurrentUser(SEED_ADMIN);
      setActiveTab('dashboard');
    } else {
      let emp = employees[0];
      if (identifierOrRole && typeof identifierOrRole === 'string') {
        const found = employees.find(
          (e) =>
            e.email.toLowerCase() === identifierOrRole.toLowerCase() ||
            e.mobile === identifierOrRole ||
            e.employeeId.toLowerCase() === identifierOrRole.toLowerCase()
        );
        if (found) emp = found;
      }
      setCurrentUser(emp);
      setActiveTab('home');
    }

    setIsLoggedIn(true);
    return true;
  };

  const logout = () => {
    setIsLoggedIn(false);
  };

  const switchUser = (employeeId: string) => {
    if (employeeId === SEED_ADMIN.id) {
      setUserRole('admin');
      setCurrentUser(SEED_ADMIN);
      setActiveTab('dashboard');
    } else {
      const emp = employees.find((e) => e.id === employeeId);
      if (emp) {
        setUserRole('executive');
        setCurrentUser(emp);
      }
    }
  };

  // Lock status check
  const isDayLocked = (employeeId: string, date: string): boolean => {
    const sub = dailySubmissions.find((s) => s.employeeId === employeeId && s.date === date);
    return !!sub?.isSubmitted;
  };

  // Travel CRUD
  const addTravelRecord = async (
    record: Omit<TravelRecord, 'id' | 'createdAt' | 'updatedAt' | 'synced'>
  ): Promise<TravelRecord> => {
    const newRecord: TravelRecord = {
      ...record,
      id: `trv-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      synced: isOnline,
    };
    setTravelRecords((prev) => [newRecord, ...prev]);
    return newRecord;
  };

  const updateTravelRecord = async (id: string, updates: Partial<TravelRecord>): Promise<void> => {
    setTravelRecords((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              ...updates,
              updatedAt: new Date().toISOString(),
              synced: isOnline,
            }
          : item
      )
    );
  };

  const deleteTravelRecord = async (id: string): Promise<void> => {
    setTravelRecords((prev) => prev.filter((item) => item.id !== id));
  };

  // Visit CRUD
  const addVisitRecord = async (
    record: Omit<VisitRecord, 'id' | 'createdAt' | 'updatedAt' | 'synced'>
  ): Promise<VisitRecord> => {
    const newRecord: VisitRecord = {
      ...record,
      id: `vst-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      synced: isOnline,
    };
    setVisitRecords((prev) => [newRecord, ...prev]);
    return newRecord;
  };

  const updateVisitRecord = async (id: string, updates: Partial<VisitRecord>): Promise<void> => {
    setVisitRecords((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              ...updates,
              updatedAt: new Date().toISOString(),
              synced: isOnline,
            }
          : item
      )
    );
  };

  const deleteVisitRecord = async (id: string): Promise<void> => {
    setVisitRecords((prev) => prev.filter((item) => item.id !== id));
  };

  // Expense CRUD
  const addExpenseRecord = async (
    record: Omit<ExpenseRecord, 'id' | 'createdAt' | 'updatedAt' | 'synced'>
  ): Promise<ExpenseRecord> => {
    const newRecord: ExpenseRecord = {
      ...record,
      id: `exp-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      synced: isOnline,
    };
    setExpenseRecords((prev) => [newRecord, ...prev]);
    return newRecord;
  };

  const updateExpenseRecord = async (id: string, updates: Partial<ExpenseRecord>): Promise<void> => {
    setExpenseRecords((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              ...updates,
              updatedAt: new Date().toISOString(),
              synced: isOnline,
            }
          : item
      )
    );
  };

  const deleteExpenseRecord = async (id: string): Promise<void> => {
    setExpenseRecords((prev) => prev.filter((item) => item.id !== id));
  };

  // Customer addition
  const addNewCustomer = async (cust: Omit<CustomerMaster, 'id'>): Promise<CustomerMaster> => {
    const newCust: CustomerMaster = {
      ...cust,
      id: `cust-${Date.now()}`,
    };
    setCustomers((prev) => [...prev, newCust]);
    return newCust;
  };

  // Daily Submission
  const submitDailyReport = async (date: string): Promise<void> => {
    const dayVisits = visitRecords.filter((v) => v.employeeId === currentUser.id && v.date === date);
    const dayTravel = travelRecords.filter((t) => t.employeeId === currentUser.id && t.date === date);
    const dayExp = expenseRecords.filter((e) => e.employeeId === currentUser.id && e.date === date);

    const totalVisits = dayVisits.length;
    const totalOrder = dayVisits.reduce((acc, v) => acc + (v.orderAmount || 0), 0);
    const totalCollection = dayVisits.reduce((acc, v) => acc + (v.collectionAmount || 0), 0);
    const totalKm = dayTravel.reduce((acc, t) => acc + (t.totalKm || 0), 0);
    const totalTravelExp = dayTravel.reduce((acc, t) => acc + (t.totalTravelExpense || 0), 0);
    const totalDirExp = dayExp.reduce((acc, e) => acc + (e.amount || 0), 0);
    const totalExpense = totalTravelExp + totalDirExp;

    const submission: DailySubmission = {
      id: `${currentUser.id}_${date}`,
      employeeId: currentUser.id,
      date,
      isSubmitted: true,
      submittedAt: new Date().toISOString(),
      totalVisits,
      totalOrder,
      totalCollection,
      totalKm,
      totalExpense,
    };

    setDailySubmissions((prev) => {
      const filtered = prev.filter((s) => s.id !== submission.id);
      return [submission, ...filtered];
    });
  };

  const unlockDailyReport = async (employeeId: string, date: string): Promise<void> => {
    setDailySubmissions((prev) =>
      prev.map((s) =>
        s.employeeId === employeeId && s.date === date
          ? { ...s, isSubmitted: false }
          : s
      )
    );
  };

  const updateMonthlyTarget = async (
    targetOrEmpId: MonthlyTarget | string,
    month?: string,
    partialTarget?: Partial<MonthlyTarget>
  ): Promise<void> => {
    if (typeof targetOrEmpId === 'string' && month && partialTarget) {
      setMonthlyTargets((prev) => {
        const found = prev.find((t) => t.employeeId === targetOrEmpId && t.month === month);
        if (found) {
          const updated = { ...found, ...partialTarget };
          return prev.map((t) => (t.id === found.id ? updated : t));
        } else {
          const newTarget: MonthlyTarget = {
            id: `target-${Date.now()}`,
            employeeId: targetOrEmpId,
            month,
            salesTarget: 1000000,
            visitTarget: 80,
            collectionTarget: 800000,
            workingDaysTarget: 24,
            productiveVisitTarget: 50,
            kmTarget: 1500,
            ...partialTarget,
          };
          return [...prev, newTarget];
        }
      });
    } else if (typeof targetOrEmpId === 'object') {
      const target = targetOrEmpId as MonthlyTarget;
      setMonthlyTargets((prev) => {
        const existing = prev.filter((t) => t.id !== target.id);
        return [...existing, target];
      });
    }
  };

  // Sync count
  const pendingSyncCount =
    travelRecords.filter((t) => !t.synced).length +
    visitRecords.filter((v) => !v.synced).length +
    expenseRecords.filter((e) => !e.synced).length;

  const syncPendingRecords = async (): Promise<number> => {
    setIsSyncing(true);
    // Simulate brief network sync
    await new Promise((resolve) => setTimeout(resolve, 800));
    const count = pendingSyncCount;
    setTravelRecords((prev) => prev.map((t) => ({ ...t, synced: true })));
    setVisitRecords((prev) => prev.map((v) => ({ ...v, synced: true })));
    setExpenseRecords((prev) => prev.map((e) => ({ ...e, synced: true })));
    setIsSyncing(false);
    return count;
  };

  const resetToSeedData = () => {
    setEmployees(SEED_EMPLOYEES);
    setCustomers(SEED_CUSTOMERS);
    setTravelRecords(SEED_TRAVEL);
    setVisitRecords(SEED_VISITS);
    setExpenseRecords(SEED_EXPENSES);
    setDailySubmissions(SEED_SUBMISSIONS);
    setMonthlyTargets(SEED_TARGETS);
    setCurrentUser(SEED_EMPLOYEES[0]);
    setUserRole('executive');
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        userRole,
        isLoggedIn,
        isOnline,
        isDeviceFrame,
        activeTab,
        selectedDate,
        selectedMonth,
        employees,
        customers,
        travelRecords,
        visitRecords,
        expenseRecords,
        dailySubmissions,
        monthlyTargets,
        setActiveTab,
        setSelectedDate,
        setSelectedMonth,
        setIsDeviceFrame,
        setIsOnline,
        setUserRole,
        setCurrentUser,
        login,
        logout,
        switchUser,
        notificationMessage,
        sendNotification,
        dismissNotification,
        addTravelRecord,
        updateTravelRecord,
        deleteTravelRecord,
        addVisitRecord,
        updateVisitRecord,
        deleteVisitRecord,
        addExpenseRecord,
        updateExpenseRecord,
        deleteExpenseRecord,
        addNewCustomer,
        submitDailyReport,
        unlockDailyReport,
        isDayLocked,
        updateMonthlyTarget,
        syncPendingRecords,
        isSyncing,
        pendingSyncCount,
        resetToSeedData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
