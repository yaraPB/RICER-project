import { create } from 'zustand';
import type { FireEventRecord, RecordStatus, AlertSource } from '@/types';

export interface FireRecordFilters {
  status: RecordStatus | null;
  alertSource: AlertSource | null;
  dateFrom: string | null;
  dateTo: string | null;
  minArea: number | null;
  search: string;
}

export interface FireRecordState {
  records: FireEventRecord[];
  isLoading: boolean;
  error: string | null;
  pagination: {
    cursor: string | null;
    hasMore: boolean;
    total: number;
  };
  filters: FireRecordFilters;
  activeRecord: FireEventRecord | null;
  isEditing: boolean;

  setFilters: (filters: Partial<FireRecordFilters>) => void;
  clearFilters: () => void;
  setActiveRecord: (record: FireEventRecord | null) => void;
  setIsEditing: (editing: boolean) => void;
  fetchRecords: (append?: boolean) => Promise<void>;
  fetchRecord: (id: string) => Promise<void>;
  reset: () => void;
}

const defaultFilters: FireRecordFilters = {
  status: null,
  alertSource: null,
  dateFrom: null,
  dateTo: null,
  minArea: null,
  search: '',
};

const initialState = {
  records: [] as FireEventRecord[],
  isLoading: false,
  error: null as string | null,
  pagination: { cursor: null as string | null, hasMore: false, total: 0 },
  filters: { ...defaultFilters },
  activeRecord: null as FireEventRecord | null,
  isEditing: false,
};

export const useFireRecordStore = create<FireRecordState>()((set, get) => ({
  ...initialState,

  setFilters: (updates) =>
    set((state) => ({
      filters: { ...state.filters, ...updates },
    })),

  clearFilters: () => set({ filters: { ...defaultFilters } }),

  setActiveRecord: (activeRecord) => set({ activeRecord }),

  setIsEditing: (isEditing) => set({ isEditing }),

  fetchRecords: async (append = false) => {
    const { filters, pagination } = get();
    set({ isLoading: true, error: null });

    try {
      const params = new URLSearchParams();
      if (filters.status) params.set('status', filters.status);
      if (filters.alertSource) params.set('alertSource', filters.alertSource);
      if (filters.dateFrom) params.set('dateFrom', filters.dateFrom);
      if (filters.dateTo) params.set('dateTo', filters.dateTo);
      if (filters.minArea != null) params.set('minArea', String(filters.minArea));
      if (filters.search) params.set('search', filters.search);
      if (append && pagination.cursor) params.set('cursor', pagination.cursor);

      const res = await fetch(`/api/fire-records?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch fire records');

      const json = await res.json();
      set((state) => ({
        records: append ? [...state.records, ...json.data] : json.data,
        pagination: json.pagination,
        isLoading: false,
      }));
    } catch (err) {
      set({
        isLoading: false,
        error: err instanceof Error ? err.message : 'Unknown error',
      });
    }
  },

  fetchRecord: async (id: string) => {
    set({ isLoading: true, error: null });

    try {
      const res = await fetch(`/api/fire-records/${id}`);
      if (!res.ok) throw new Error('Failed to fetch fire record');

      const json = await res.json();
      set({ activeRecord: json.record, isLoading: false });
    } catch (err) {
      set({
        isLoading: false,
        error: err instanceof Error ? err.message : 'Unknown error',
      });
    }
  },

  reset: () => set(initialState),
}));
