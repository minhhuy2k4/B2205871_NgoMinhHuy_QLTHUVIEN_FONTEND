import apiClient from "./api.service.js";

export const sachService = {
  // Lấy danh sách sách
  getAll(params = {}) {
    return apiClient.get("/sach", { params });
  },

  // Lấy sách theo ID
  getById(id) {
    return apiClient.get(`/sach/${id}`);
  },

  // Tạo sách mới (admin)
  create(data) {
    return apiClient.post("/sach", data);
  },

  // Cập nhật sách (admin)
  update(id, data) {
    return apiClient.put(`/sach/${id}`, data);
  },

  // Xóa sách (admin)
  delete(id) {
    return apiClient.delete(`/sach/${id}`);
  },

  // Tìm kiếm sách
  search(keyword) {
    return apiClient.get(`/sach?search=${keyword}`);
  },
};
