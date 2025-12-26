import { create } from 'zustand';
import { Report } from '@/types';

interface ReportState {
  reports: Report[];
  setReports: (reports: Report[]) => void;
}

export const useReportStore = create<ReportState>((set) => ({
  reports: [],
  setReports: (reports) => set({ reports }),
}));
