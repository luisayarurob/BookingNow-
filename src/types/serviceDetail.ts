export interface BusinessInfo {
  id: string;
  name: string;
  category: string;
  rating?: number;
  reviewCount?: number;
  address?: string;
  city?: string;
}

export interface ServiceDetail {
  id: string;
  businessId: string;
  business: BusinessInfo;
  name: string;
  category: string;
  durationMinutes: number;
  price: number;
  description: string;
  images: string[];
}