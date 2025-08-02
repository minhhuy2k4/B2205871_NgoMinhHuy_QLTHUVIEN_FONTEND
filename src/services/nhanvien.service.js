import apiClient from "./api.service.js";

export const nhanVienService = {
  // Cập nhật thông tin nhân viên
  updateProfile(id, data) {
    return apiClient.put(`/nhanvien/${id}`, data);
  },

  // Lấy thông tin nhân viên theo ID
  getProfile(id) {
    return apiClient.get(`/nhanvien/${id}`);
  },

  // Thay đổi mật khẩu nhân viên
  changePassword(id, passwordData) {
    return apiClient.put(`/nhanvien/${id}/change-password`, passwordData);
  },

  // Lấy danh sách nhân viên (cho admin)
  getAll() {
    return apiClient.get("/nhanvien");
  },

  // Tạo nhân viên mới
  create(data) {
    return apiClient.post("/nhanvien", data);
  },

  // Xóa nhân viên
  delete(id) {
    return apiClient.delete(`/nhanvien/${id}`);
  },
};
