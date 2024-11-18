import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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

// Initial dummy data for demonstration
const marchCustomers = Array(156).fill({}).map((_, i) => ({
  id: `march-${i + 1}`,
  name: `Customer ${i + 1}`,
  email: `customer${i + 1}@example.com`,
  address: `${1000 + i} Main St`,
  city: 'Springfield',
  state: 'IL',
  propertyType: 'Single Family',
  propertySize: '2,500 sqft',
  yearBuilt: '1995',
  uploadId: '1'
}));

const februaryLeads = Array(89).fill({}).map((_, i) => ({
  id: `feb-${i + 1}`,
  name: `Lead ${i + 1}`,
  email: `lead${i + 1}@example.com`,
  address: `${2000 + i} Oak Ave`,
  city: 'Springfield',
  state: 'IL',
  propertyType: 'Multi Family',
  propertySize: '3,200 sqft',
  yearBuilt: '2001',
  uploadId: '2'
}));

interface CustomerStore {
  customers: Customer[];
  selectedUploadId: string | null;
  addCustomers: (customers: Customer[], uploadId: string) => void;
  removeCustomersByUploadId: (uploadId: string) => void;
  setSelectedUploadId: (uploadId: string | null) => void;
  updateCustomer: (id: string, updates: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;
  undeleteCustomer: (id: string) => void;
}

export const useCustomerStore = create<CustomerStore>()(
  persist(
    (set) => ({
      // Initialize with dummy data
      customers: [...marchCustomers, ...februaryLeads],
      selectedUploadId: null,
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
    }),
    {
      name: 'customer-storage'
    }
  )
);