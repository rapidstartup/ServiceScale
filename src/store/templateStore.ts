import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { QuoteTemplate } from '../types';

interface TemplateStore {
  templates: QuoteTemplate[];
  addTemplate: (template: QuoteTemplate) => void;
  updateTemplate: (id: string, template: Partial<QuoteTemplate>) => void;
  deleteTemplate: (id: string) => void;
  setDefaultTemplate: (id: string) => void;
}

// Example template based on the provided image
const initialTemplate: QuoteTemplate = {
  id: 'default-template',
  name: 'Professional Roofing Template',
  description: 'A comprehensive template for roofing services with team profiles and certifications',
  isDefault: true,
  createdAt: '2024-03-15',
  updatedAt: '2024-03-15',
  previewImage: 'https://images.unsplash.com/photo-1632778149955-e80f8ceca2e8?w=600&h=400&fit=crop',
  sections: [
    {
      id: 'header',
      type: 'header',
      title: 'Customer Approval',
      content: '',
      order: 1,
      images: [
        {
          id: 'truck-image',
          url: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=800&h=400&fit=crop',
          alt: 'Company Truck',
          width: 800,
          height: 400
        }
      ],
      settings: {
        backgroundColor: '#ffffff',
        textColor: '#000000',
        layout: 'left'
      }
    },
    {
      id: 'team',
      type: 'team',
      title: 'Your Roofing Team',
      content: 'Meet our experienced team of roofing professionals',
      order: 2,
      images: [
        {
          id: 'team-lead',
          url: 'https://images.unsplash.com/photo-1600486913747-55e5470d6f40?w=200&h=200&fit=crop',
          alt: 'Team Lead',
          width: 200,
          height: 200
        }
      ],
      settings: {
        backgroundColor: '#f8f9fa',
        layout: 'center'
      }
    },
    // Add more sections based on the template image...
  ]
};

export const useTemplateStore = create<TemplateStore>()(
  persist(
    (set) => ({
      templates: [initialTemplate],
      addTemplate: (template) =>
        set((state) => ({
          templates: [...state.templates, template]
        })),
      updateTemplate: (id, updates) =>
        set((state) => ({
          templates: state.templates.map((t) =>
            t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t
          )
        })),
      deleteTemplate: (id) =>
        set((state) => ({
          templates: state.templates.filter((t) => t.id !== id)
        })),
      setDefaultTemplate: (id) =>
        set((state) => ({
          templates: state.templates.map((t) => ({
            ...t,
            isDefault: t.id === id
          }))
        }))
    }),
    {
      name: 'template-storage'
    }
  )
);