import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CompanyInfo, Quote } from '../types';

interface QuoteStore {
  companyInfo: CompanyInfo;
  quotes: Quote[];
  updateCompanyInfo: (info: Partial<CompanyInfo>) => void;
  addQuote: (quote: Quote) => void;
  updateQuote: (id: string, quote: Quote) => void;
  deleteQuote: (id: string) => void;
  updateQuoteStatus: (id: string, status: Quote['status']) => void;
  trackQuoteView: (id: string) => void;
}

export const useQuoteStore = create<QuoteStore>()(
  persist(
    (set) => ({
      companyInfo: {
        name: 'ServiceScale Pro',
        logo: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=100&h=100&fit=crop',
        about: 'We are committed to providing top-quality home services with over 20 years of experience in the industry.',
        phone: '(555) 123-4567',
        email: 'contact@servicescalepro.com',
        address: '123 Service Ave, Business District, ST 12345',
      },
      quotes: [
        {
          id: '2024001',
          status: 'active',
          customerName: 'John Smith',
          service: 'Roof Replacement',
          total: 12500,
          createdAt: '2024-03-15',
          sentAt: '2024-03-15',
          openedAt: '2024-03-16',
          templateId: 'default-template',
          propertyDetails: {
            address: {
              streetAddress: '1234 Oak Street',
              city: 'Springfield',
              state: 'IL'
            },
            type: 'Single Family',
            size: '2,800 sqft',
            yearBuilt: '1995',
            bedrooms: '4',
            bathrooms: '2.5'
          }
        },
        {
          id: '2024002',
          status: 'converted',
          customerName: 'Sarah Johnson',
          service: 'Solar Installation',
          total: 18900,
          createdAt: '2024-03-14',
          sentAt: '2024-03-14',
          openedAt: '2024-03-14',
          clickedAt: '2024-03-15',
          templateId: 'default-template',
          propertyDetails: {
            address: {
              streetAddress: '567 Maple Ave',
              city: 'Springfield',
              state: 'IL'
            },
            type: 'Single Family',
            size: '3,200 sqft',
            yearBuilt: '2001',
            bedrooms: '5',
            bathrooms: '3'
          }
        },
        {
          id: '2024003',
          status: 'lost',
          customerName: 'Mike Wilson',
          service: 'HVAC Replacement',
          total: 8500,
          createdAt: '2024-03-13',
          sentAt: '2024-03-13',
          templateId: 'default-template',
          propertyDetails: {
            address: {
              streetAddress: '789 Pine Street',
              city: 'Springfield',
              state: 'IL'
            },
            type: 'Single Family',
            size: '2,100 sqft',
            yearBuilt: '1988',
            bedrooms: '3',
            bathrooms: '2'
          }
        },
      ],
      updateCompanyInfo: (info) =>
        set((state) => ({
          companyInfo: { ...state.companyInfo, ...info },
        })),
      addQuote: (quote) =>
        set((state) => ({
          quotes: [...state.quotes, quote],
        })),
      updateQuote: (id, quote) =>
        set((state) => ({
          quotes: state.quotes.map((q) =>
            q.id === id ? quote : q
          ),
        })),
      deleteQuote: (id) =>
        set((state) => ({
          quotes: state.quotes.filter((q) => q.id !== id),
        })),
      updateQuoteStatus: (id, status) =>
        set((state) => ({
          quotes: state.quotes.map((q) =>
            q.id === id ? { ...q, status } : q
          ),
        })),
      trackQuoteView: (id) =>
        set((state) => ({
          quotes: state.quotes.map((q) =>
            q.id === id
              ? {
                  ...q,
                  openedAt: q.openedAt || new Date().toISOString(),
                  clickedAt: new Date().toISOString(),
                }
              : q
          ),
        })),
    }),
    {
      name: 'quote-storage',
    }
  )
);