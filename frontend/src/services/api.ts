import apiClient from '../utils/apiClient';

export const authAPI = {
  getProfile: () => apiClient.get('/api/v1/user/profile'),

  signIn: (email: string, password: string) =>
    apiClient.post('/api/v1/user/signin', { email, password }),

  signUp: (name: string, email: string, password: string, role: string) =>
    apiClient.post('/api/v1/user/signup', { name, email, password, role }),

  signOut: () => apiClient.get('/api/v1/user/signout'),
};

export const profileAPI = {
  completeProfile: (role: string, password?: string) => {
    const data: any = { role };
    if (password) {
      data.password = password;
    }
    return apiClient.post('/api/v1/profile/complete', data);
  },

  getProfileStatus: () => apiClient.get('/api/v1/profile/status'),
};

export const gigsAPI = {
  getGigs: () => apiClient.get('/api/v1/gigs'),

  getGig: (id: string) => apiClient.get(`/api/v1/gigs/${id}`),

  createGig: (gigData: any) => apiClient.post('/api/v1/gigs', gigData, { headers: { 'Content-Type': 'multipart/form-data' } }),

  updateGig: (id: string, gigData: any) => apiClient.put(`/api/v1/gigs/${id}`, gigData),

  deleteGig: (id: string) => apiClient.delete(`/api/v1/gigs/${id}`),
};
export const purchaseAPI = {
  purchaseGig: (gigId: string) => apiClient.post(`/api/v1/purchases/${gigId}`),
  getClientPurchases: () => apiClient.get('/api/v1/purchases/client'),
  getFreelancerPurchases: () => apiClient.get('/api/v1/purchases/freelancer'),
};
export const categoriesAPI = {
  getCategories: () => apiClient.get('/api/v1/categories'),
  createCategory: (name: string) => apiClient.post('/api/v1/categories', { name }),
};
