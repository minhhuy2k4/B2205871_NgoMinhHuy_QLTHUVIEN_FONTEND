import apiClient from "./api.service.js";

export const publisherService = {
  // Lấy tất cả nhà xuất bản với query parameters
  getAll(params = {}) {
    return apiClient.get("/nhaxuatban", { params });
  },

  // Lấy nhà xuất bản theo ID
  getById(id) {
    return apiClient.get(`/nhaxuatban/${id}`);
  },

  // Tạo nhà xuất bản mới
  create(data) {
    return apiClient.post("/nhaxuatban", data);
  },

  // Cập nhật nhà xuất bản
  update(id, data) {
    return apiClient.put(`/nhaxuatban/${id}`, data);
  },

  // Xóa nhà xuất bản
  delete(id) {
    return apiClient.delete(`/nhaxuatban/${id}`);
  },

  // Tìm kiếm nhà xuất bản
  search(keyword) {
    return apiClient.get("/nhaxuatban/search", {
      params: { keyword },
    });
  },
};
