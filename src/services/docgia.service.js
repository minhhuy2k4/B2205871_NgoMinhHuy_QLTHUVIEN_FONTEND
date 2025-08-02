import apiClient from "./api.service.js";

export const docGiaService = {
  // Lấy danh sách độc giả (admin)
  getAll(params = {}) {
    return apiClient.get("/docgia", { params });
  },

  // Lấy độc giả theo ID
  getById(id) {
    return apiClient.get(`/docgia/${id}`);
  },

  // Tạo độc giả mới (admin)
  create(data) {
    return apiClient.post("/docgia", data);
  },

  // Cập nhật độc giả
  update(id, data) {
    return apiClient.put(`/docgia/${id}`, data);
  },

  // Xóa độc giả (admin)
  delete(id) {
    return apiClient.delete(`/docgia/${id}`);
  },

  // Lấy thông tin cá nhân độc giả
  getProfile() {
    return apiClient.get("/docgia/profile");
  },

  // Cập nhật thông tin cá nhân
  updateProfile(id, data) {
    return apiClient.put(`/docgia/${id}`, data);
  },

  // Thay đổi mật khẩu độc giả
  changePassword(id, passwordData) {
    return apiClient.put(`/docgia/${id}/change-password`, passwordData);
  },
};
