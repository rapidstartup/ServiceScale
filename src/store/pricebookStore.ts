import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface PricebookEntry {
  id: string;
  sku: string;
  name: string;
  category: string;
  price: number;
  unit: string;
  uploadId?: string;
  deleted?: boolean;
}

// Initial dummy data for demonstration
const springPrices = Array(245).fill({}).map((_, i) => ({
  id: `spring-${i + 1}`,
  sku: `SKU${1000 + i}`,
  name: `Product ${i + 1}`,
  category: ['HVAC', 'Plumbing', 'Electrical'][i % 3],
  price: (50 + i * 2.5) * 100,
  unit: ['each', 'hour', 'ft'][i % 3],
  uploadId: '1'
}));

const winterPrices = Array(198).fill({}).map((_, i) => ({
  id: `winter-${i + 1}`,
  sku: `SKU${2000 + i}`,
  name: `Product ${i + 1}`,
  category: ['HVAC', 'Plumbing', 'Electrical'][i % 3],
  price: (45 + i * 2.5) * 100,
  unit: ['each', 'hour', 'ft'][i % 3],
  uploadId: '2'
}));

interface PricebookStore {
  entries: PricebookEntry[];
  selectedUploadId: string | null;
  addEntries: (entries: PricebookEntry[], uploadId: string) => void;
  removeEntriesByUploadId: (uploadId: string) => void;
  setSelectedUploadId: (uploadId: string | null) => void;
  updateEntry: (id: string, updates: Partial<PricebookEntry>) => void;
  deleteEntry: (id: string) => void;
  undeleteEntry: (id: string) => void;
}

export const usePricebookStore = create<PricebookStore>()(
  persist(
    (set) => ({
      entries: [...springPrices, ...winterPrices],
      selectedUploadId: null,
      addEntries: (newEntries, uploadId) =>
        set((state) => ({
          entries: [
            ...state.entries,
            ...newEntries.map(entry => ({
              ...entry,
              id: `${uploadId}-${Math.random().toString(36).substr(2, 9)}`,
              uploadId
            }))
          ]
        })),
      removeEntriesByUploadId: (uploadId) =>
        set((state) => ({
          entries: state.entries.filter(entry => entry.uploadId !== uploadId),
          selectedUploadId: state.selectedUploadId === uploadId ? null : state.selectedUploadId
        })),
      setSelectedUploadId: (uploadId) =>
        set({ selectedUploadId: uploadId }),
      updateEntry: (id, updates) =>
        set((state) => ({
          entries: state.entries.map(entry =>
            entry.id === id ? { ...entry, ...updates } : entry
          )
        })),
      deleteEntry: (id) =>
        set((state) => ({
          entries: state.entries.map(entry =>
            entry.id === id ? { ...entry, deleted: true } : entry
          )
        })),
      undeleteEntry: (id) =>
        set((state) => ({
          entries: state.entries.map(entry =>
            entry.id === id ? { ...entry, deleted: false } : entry
          )
        }))
    }),
    {
      name: 'pricebook-storage'
    }
  )
);