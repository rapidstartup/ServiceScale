import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { useAuthStore } from './authStore';

export interface Customer {
  id: string;
  Names: string;
  Address1: string;
  City: string;
  State: string;
  PostalCode: string;
  CombinedAddress: string;
  uploadId?: string;
  deleted?: boolean;
  user_id?: string;
  propertyType?: string;
  propertySize?: string;
  yearBuilt?: string;
  bedrooms?: string;
  bathrooms?: string;
  lotSize?: string;
}

export interface OutputRecord {
  id: string
  customer_id: string
  names: string
  address1: string
  city: string
  state: string
  postalcode: string
  combinedaddress: string
  propertytype: string
  propertysize: string
  yearbuilt: string
  bedrooms: number
  bathrooms: number
  lotsize: string
  created_at: string
  updated_at: string
}

interface CustomerStore {
  customers: Customer[];
  selectedUploadId: string | null;
  isLoading: boolean;
  error: string | null;
  outputs: OutputRecord[];
  fetchCustomers: () => Promise<void>;
  addCustomers: (customers: Omit<Customer, 'id' | 'user_id'>[], uploadId: string) => Promise<void>;
  removeCustomersByUploadId: (uploadId: string) => Promise<void>;
  setSelectedUploadId: (uploadId: string | null) => void;
  updateCustomer: (id: string, updates: Partial<Customer>) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;
  undeleteCustomer: (id: string) => Promise<void>;
  fetchOutputs: () => Promise<void>;
}

export const useCustomerStore = create<CustomerStore>()((set) => ({
  customers: [],
  selectedUploadId: null,
  isLoading: false,
  error: null,
  outputs: [],

  fetchCustomers: async () => {
    set({ isLoading: true, error: null });
    try {
      // First fetch customers
      const { data: customerData, error: customerError } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });

      if (customerError) throw customerError;

      // Then fetch output data
      const { data: outputData, error: outputError } = await supabase
        .from('output')
        .select('*');

      if (outputError) throw outputError;

      // Merge output data with customers
      const mergedCustomers = (customerData || []).map(customer => {
        const output = outputData?.find(o => o.customer_id === customer.id);
        if (output) {
          return {
            ...customer,
            propertyType: output.property_type,
            propertySize: output.property_size,
            yearBuilt: output.year_built,
            bedrooms: output.bedrooms?.toString(),
            bathrooms: output.bathrooms?.toString(),
            lotSize: output.lot_size
          };
        }
        return customer;
      });

      set({ customers: mergedCustomers });
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
      const { error } = await supabase
        .from('customers')
        .update(updates)
        .match({ id })
        .select()
        .single();

      if (error) throw error;

      set(state => ({
        customers: state.customers.map(customer =>
          customer.id === id ? { ...customer, ...updates } : customer
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
  },

  fetchOutputs: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('output')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      set({ outputs: data || [] });
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  }
}));