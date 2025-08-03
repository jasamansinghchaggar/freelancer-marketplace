import apiClient from "../utils/apiClient";

export const authAPI = {
  getProfile: () => apiClient.get("/api/v1/user/profile"),

  signIn: (email: string, password: string) =>
    apiClient.post("/api/v1/user/signin", { email, password }),

  signUp: (name: string, email: string, password: string, role: string) =>
    apiClient.post("/api/v1/user/signup", { name, email, password, role }),

  signOut: () => apiClient.get("/api/v1/user/signout"),
  forgotPassword: (email: string) =>
    apiClient.post("/auth/forgot-password", { email }),
  resetPassword: (token: string, password: string) =>
    apiClient.post("/auth/reset-password", { token, password }),

  updateProfile: (data: { name: string; email: string }) =>
    apiClient.put("/api/v1/user/profile", data),

  changePassword: (oldPassword: string, newPassword: string) =>
    apiClient.put("/api/v1/user/change-password", { oldPassword, newPassword }),
};

export const profileAPI = {
  completeProfile: (role: string, password?: string) => {
    const data: any = { role };
    if (password) {
      data.password = password;
    }
    return apiClient.post("/api/v1/profile/complete", data);
  },

  getProfileStatus: () => apiClient.get("/api/v1/profile/status"),
  
  setPublicKey: (publicKey: string) => apiClient.post("/api/v1/profile/publicKey", { publicKey }),
};

export const gigsAPI = {
  getGigs: () => apiClient.get("/api/v1/gigs"),

  getGig: (id: string) => apiClient.get(`/api/v1/gigs/${id}`),

  createGig: (gigData: any) => apiClient.post("/api/v1/gigs", gigData),

  updateGig: (id: string, gigData: any) =>
    apiClient.put(`/api/v1/gigs/${id}`, gigData),

  deleteGig: (id: string) => apiClient.delete(`/api/v1/gigs/${id}`),
};
export const purchaseAPI = {
  purchaseGig: (gigId: string) => apiClient.post(`/api/v1/purchases/${gigId}`),
  getClientPurchases: () => apiClient.get("/api/v1/purchases/client"),
  getFreelancerPurchases: () => apiClient.get("/api/v1/purchases/freelancer"),
};
export const categoriesAPI = {
  getCategories: () => apiClient.get("/api/v1/categories"),
  createCategory: (name: string) =>
    apiClient.post("/api/v1/categories", { name }),
};

export const chatAPI = {
  getChats: () => apiClient.get("/api/v1/chats"),
  startChat: (participantId: string) =>
    apiClient.post("/api/v1/chats/start", { participantId }),
  deleteChat: (chatId: string) => apiClient.delete(`/api/v1/chats/${chatId}`),
  getMessages: (chatId: string) =>
    apiClient.get(`/api/v1/chats/${chatId}/messages`),
  sendMessage: (chatId: string, content: string, imageUrl?: string) =>
    apiClient.post(`/api/v1/chats/${chatId}/messages`, { content, imageUrl }),
  updateMessage: (chatId: string, messageId: string, content: string) =>
    apiClient.put(`/api/v1/chats/${chatId}/messages/${messageId}`, { content }),
  deleteMessage: (chatId: string, messageId: string) =>
    apiClient.delete(`/api/v1/chats/${chatId}/messages/${messageId}`),
  // Upload an image file to chat
  uploadImage: (chatId: string, file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    return apiClient.post(`/api/v1/chats/${chatId}/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
};
