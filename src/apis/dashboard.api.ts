import api from "./interceptor.api";

export const dashboardAPI = {
  // Lấy dữ liệu dashboard recruiter
  getRecruiterDashboard: async () => {
    const response = await api.get("/dashboard/recruiter");
    return response.data;
  },
};
