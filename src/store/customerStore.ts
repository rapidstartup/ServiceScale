import { create } from 'zustand';
import { supabase } from '../lib/supabase';

export interface Customer {
  id: string;
  name: string;
  email: string;
  address: string;
  city: string;
  state: string;
  propertyType: string;
  propertySize: string;
  yearBuilt: string;
  uploadId?: string;
  deleted?: boolean;
}

interface CustomerStore {
  customers: Customer[];
  selectedUploadId: string | null;
  isLoading: boolean;
  error: string | null;
  fetchCustomers: () => Promise<void>;
  addCustomers: (customers: Customer[], uploadId: string) => void;
  removeCustomersByUploadId: (uploadId: string) => void;
  setSelectedUploadId: (uploadId: string | null) => void;
  updateCustomer: (id: string, updates: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;
  undeleteCustomer: (id: string) => void;
}

export const useCustomerStore = create<CustomerStore>()((set) => ({
  customers: [],
  selectedUploadId: null,
  isLoading: false,
  error: null,

  fetchCustomers: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      set({ customers: data || [] });
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },
  addCustomers: (newCustomers, uploadId) =>
    set((state) => ({
      customers: [
        ...state.customers,
        ...newCustomers.map(customer => ({
          ...customer,
          id: `${uploadId}-${Math.random().toString(36).substr(2, 9)}`,
          uploadId
        }))
      ]
    })),
  removeCustomersByUploadId: (uploadId) =>
    set((state) => ({
      customers: state.customers.filter(customer => customer.uploadId !== uploadId),
      selectedUploadId: state.selectedUploadId === uploadId ? null : state.selectedUploadId
    })),
  setSelectedUploadId: (uploadId) =>
    set({ selectedUploadId: uploadId }),
  updateCustomer: (id, updates) =>
    set((state) => ({
      customers: state.customers.map(customer =>
        customer.id === id ? { ...customer, ...updates } : customer
      )
    })),
  deleteCustomer: (id) =>
    set((state) => ({
      customers: state.customers.map(customer =>
        customer.id === id ? { ...customer, deleted: true } : customer
      )
    })),
  undeleteCustomer: (id) =>
    set((state) => ({
      customers: state.customers.map(customer =>
        customer.id === id ? { ...customer, deleted: false } : customer
      )
    }))
}));