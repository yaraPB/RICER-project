import { create } from 'zustand';
import { Incident } from '@/types';

interface IncidentState {
  incidents: Incident[];
  setIncidents: (incidents: Incident[]) => void;
  selectedIncident: Incident | null;
  setSelectedIncident: (incident: Incident | null) => void;
}

export const useIncidentStore = create<IncidentState>((set) => ({
  incidents: [],
  setIncidents: (incidents) => set({ incidents }),
  selectedIncident: null,
  setSelectedIncident: (incident) => set({ selectedIncident: incident }),
}));
