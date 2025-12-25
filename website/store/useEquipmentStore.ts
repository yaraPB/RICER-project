// store/useEquipmentStore.ts
import { create } from 'zustand';

interface Equipment {
  id: string;
  name: string;
  nameAr: string;
  category: string;
  categoryAr: string;
  quantity: number;
  isInspected: boolean;
}

interface EquipmentState {
  equipment: Equipment[];
  loading: boolean;
  error: string | null;
  
  fetchEquipment: () => Promise<void>;
  updateQuantity: (id: string, quantity: number) => Promise<void>;
  toggleInspected: (id: string) => Promise<void>;
  setEquipment: (equipment: Equipment[]) => void;
}

export const useEquipmentStore = create<EquipmentState>((set, get) => ({
  equipment: [],
  loading: false,
  error: null,

  fetchEquipment: async () => {
    set({ loading: true, error: null });
    try {
      const res = await fetch('/api/equipment');
      if (!res.ok) throw new Error('Failed to fetch equipment');
      const data = await res.json();
      set({ equipment: data, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  updateQuantity: async (id: string, quantity: number) => {
    // Optimistic update
    set(state => ({
      equipment: state.equipment.map(e =>
        e.id === id ? { ...e, quantity } : e
      )
    }));

    try {
      const res = await fetch(`/api/equipment/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity })
      });
      
      if (!res.ok) {
        // Revert on error
        await get().fetchEquipment();
        throw new Error('Failed to update quantity');
      }
    } catch (error) {
      console.error('Update quantity error:', error);
      await get().fetchEquipment();
    }
  },

  toggleInspected: async (id: string) => {
    const current = get().equipment.find(e => e.id === id);
    if (!current) return;

    const newValue = !current.isInspected;
    
    // Optimistic update
    set(state => ({
      equipment: state.equipment.map(e =>
        e.id === id ? { ...e, isInspected: newValue } : e
      )
    }));

    try {
      const res = await fetch(`/api/equipment/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isInspected: newValue })
      });
      
      if (!res.ok) {
        // Revert on error
        await get().fetchEquipment();
        throw new Error('Failed to update inspection');
      }
    } catch (error) {
      console.error('Toggle inspected error:', error);
      await get().fetchEquipment();
    }
  },

  setEquipment: (equipment: Equipment[]) => set({ equipment })
}));
