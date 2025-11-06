import api from './interceptor.api';

export const bannerPackagesAPI = {
  async listActive() {
    const res = await api.get('/recruiters/banners/packages');
    return res.data;
  },
};

export const paymentsAPI = {
  async createVNPayOrder(payload: {
    packageId: string;
    accountId: string;
    title: string;
    imageUrl: string;
    redirectUrl?: string;
    altText?: string;
  }) {
    const res = await api.post('/payments/vnpay/create', payload);
    return res.data as { success: boolean; paymentUrl: string; orderId: string };
  },
};


