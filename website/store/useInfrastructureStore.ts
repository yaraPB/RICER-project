// store/useInfrastructureStore.ts
import { create } from 'zustand';

type Condition = 'GOOD' | 'MILD' | 'BAD';

interface Infrastructure {
  id: string;
  name: string;
  nameAr: string;
  type: string;
  typeAr: string;
  condition: Condition;
}

interface InfrastructureState {
  infrastructure: Infrastructure[];
  loading: boolean;
  error: string | null;
  
  fetchInfrastructure: () => Promise<void>;
  updateCondition: (id: string, condition: Condition) => Promise<void>;
  setInfrastructure: (infrastructure: Infrastructure[]) => void;
}

export const useInfrastructureStore = create<InfrastructureState>((set, get) => ({
  infrastructure: [],
  loading: false,
  error: null,

  fetchInfrastructure: async () => {
    set({ loading: true, error: null });
    try {
      const res = await fetch('/api/infrastructure');
      if (!res.ok) throw new Error('Failed to fetch infrastructure');
      const data = await res.json();
      set({ infrastructure: data, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  updateCondition: async (id: string, condition: Condition) => {
    // Optimistic update
    set(state => ({
      infrastructure: state.infrastructure.map(i =>
        i.id === id ? { ...i, condition } : i
      )
    }));

    try {
      const res = await fetch(`/api/infrastructure/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ condition })
      });
      
      if (!res.ok) {
        // Revert on error
        await get().fetchInfrastructure();
        throw new Error('Failed to update condition');
      }
    } catch (error) {
      console.error('Update condition error:', error);
      await get().fetchInfrastructure();
    }
  },

  setInfrastructure: (infrastructure: Infrastructure[]) => set({ infrastructure })
}));
