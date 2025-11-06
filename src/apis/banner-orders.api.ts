import api from './interceptor.api';

export interface MyBannerOrder {
  _id: string;
  title: string;
  imageUrl: string;
  redirectUrl?: string;
  amount: number;
  status: 'PENDING' | 'PAID' | 'FAILED' | 'CANCELLED';
  bannerId?: string | null;
  banner?: { id: string; approved: boolean; isActive: boolean; position: string } | null;
  createdAt?: string;
}

export const myBannerOrdersAPI = {
  async list(page = 1, limit = 20) {
    const res = await api.get('/recruiters/banner-orders', { params: { page, limit } });
    return res.data as { data: MyBannerOrder[]; total: number };
  },
};


