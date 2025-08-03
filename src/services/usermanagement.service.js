import apiClient from "./api.service.js";

export const userManagementService = {
  // Lấy danh sách tất cả người dùng
  getUsers: (params = {}) => {
    return apiClient.get("/admin/users", { params });
  },

  // Lấy thông tin user theo ID
  getUserById: (id, type) => {
    return apiClient.get(`/admin/users/${id}`, { params: { type } });
  },

  // Tạo nhân viên mới
  createEmployee: (data) => {
    return apiClient.post("/admin/employees", data);
  },

  // Cập nhật thông tin nhân viên
  updateEmployee: (id, data) => {
    return apiClient.put(`/admin/employees/${id}`, data);
  },

  // Xóa nhân viên
  deleteEmployee: (id) => {
    return apiClient.delete(`/admin/employees/${id}`);
  },

  // Cập nhật thông tin độc giả
  updateReader: (id, data) => {
    return apiClient.put(`/admin/readers/${id}`, data);
  },

  // Xóa độc giả
  deleteReader: (id) => {
    return apiClient.delete(`/admin/readers/${id}`);
  },
};
