import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { useAuthStore } from './authStore';

export interface Customer {
  id: string;
  user_id: string;
  Names: string;
  Address1: string;
  City: string;
  State: string;
  PostalCode: string;
  CombinedAddress: string;
  uploadId?: string;
  deleted?: boolean;
  created_at?: string;
  updated_at?: string;
}

interface CustomerStore {
  customers: Customer[];
  selectedUploadId: string | null;
  isLoading: boolean;
  error: string | null;
  fetchCustomers: () => Promise<void>;
  addCustomers: (customers: Omit<Customer, 'id' | 'user_id'>[], uploadId: string) => Promise<void>;
  removeCustomersByUploadId: (uploadId: string) => Promise<void>;
  setSelectedUploadId: (uploadId: string | null) => void;
  updateCustomer: (id: string, updates: Partial<Customer>) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;
  undeleteCustomer: (id: string) => Promise<void>;
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

  addCustomers: async (newCustomers, uploadId) => {
    set({ isLoading: true, error: null });
    try {
      const user = useAuthStore.getState().user;
      if (!user) throw new Error('User not authenticated');

      const customersWithMetadata = newCustomers.map(customer => ({
        ...customer,
        user_id: user.id,
        uploadId
      }));

      const { data, error } = await supabase
        .from('customers')
        .insert(customersWithMetadata)
        .select();

      if (error) throw error;

      set(state => ({
        customers: [...(data || []), ...state.customers]
      }));
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  removeCustomersByUploadId: async (uploadId) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase
        .from('customers')
        .delete()
        .match({ uploadId });

      if (error) throw error;

      set(state => ({
        customers: state.customers.filter(customer => customer.uploadId !== uploadId),
        selectedUploadId: state.selectedUploadId === uploadId ? null : state.selectedUploadId
      }));
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  setSelectedUploadId: (uploadId) => {
    set({ selectedUploadId: uploadId });
  },

  updateCustomer: async (id, updates) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('customers')
        .update(updates)
        .match({ id })
        .select()
        .single();

      if (error) throw error;

      set(state => ({
        customers: state.customers.map(customer =>
          customer.id === id ? { ...customer, ...data } : customer
        )
      }));
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  deleteCustomer: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase
        .from('customers')
        .update({ deleted: true })
        .match({ id });

      if (error) throw error;

      set(state => ({
        customers: state.customers.map(customer =>
          customer.id === id ? { ...customer, deleted: true } : customer
        )
      }));
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  undeleteCustomer: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase
        .from('customers')
        .update({ deleted: false })
        .match({ id });

      if (error) throw error;

      set(state => ({
        customers: state.customers.map(customer =>
          customer.id === id ? { ...customer, deleted: false } : customer
        )
      }));
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  }
}));