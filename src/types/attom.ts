export interface AttomResponse {
  status: {
    code: number;
    msg: string;
  };
  property?: AttomProperty[];
}

export interface AttomProperty {
  summary?: {
    propClass?: string;
    yearBuilt?: number;
  };
  building?: {
    size?: {
      universalSize?: number;
    };
    rooms?: {
      beds?: number;
      bathsTotal?: number;
    };
  };
  lot?: {
    lotSize1?: number;
  };
  buildingPermits?: Array<{
    effectiveDate: string;
    type: string;
    description?: string;
    jobValue?: number;
  }>;
}

export interface PropertyData {
  propertyType: string;
  propertySize: string;
  lotSize: string;
  yearBuilt: string;
  bedrooms: string;
  bathrooms: string;
  recentPermits: Array<{
    date: string;
    type: string;
    description: string;
    value: number;
  }>;
} 