export interface CompanyInfo {
  name: string;
  logo: string;
  about: string;
  phone: string;
  email: string;
  address: string;
}

export interface Quote {
  id: string;
  status: 'active' | 'converted' | 'lost';
  customerName: string;
  service: string;
  total: number;
  createdAt: string;
  sentAt?: string;
  openedAt?: string;
  clickedAt?: string;
  shareLink?: string;
  templateId?: string;
  propertyDetails?: {
    address: {
      streetAddress: string;
      city: string;
      state: string;
    };
    type?: string;
    size?: string;
    yearBuilt?: string;
    bedrooms?: string;
    bathrooms?: string;
  };
}

export interface QuoteService {
  name: string;
  description: string;
  quantity: number;
  price: number;
}

export interface Customer {
  name: string;
  address: string;
  propertyType: string;
  propertySize: string;
  yearBuilt: string;
}

export interface QuoteTemplate {
  id: string;
  name: string;
  description: string;
  is_default: boolean;
  preview_image: string;
  sections: TemplateSection[];
  created_at: string;
  updated_at: string;
}

export interface TemplateSection {
  id: string;
  type: 'header' | 'team' | 'services' | 'certifications' | 'insurance' | 'warranty' | 'reviews' | 'financing';
  title: string;
  content: string;
  images: TemplateImage[];
  order: number;
  settings: {
    backgroundColor?: string;
    textColor?: string;
    layout?: 'left' | 'right' | 'center';
  };
}

export interface TemplateImage {
  id: string;
  url: string;
  alt: string;
  width: number;
  height: number;
}