import apiClient from "./api.service.js";

export const muonSachService = {
  // Gửi yêu cầu mượn sách
  create(data) {
    return apiClient.post("/theodoimuonsach", data);
  },

  // Lấy tất cả phiếu mượn (cho admin)
  getAll(params) {
    return apiClient.get("/theodoimuonsach", { params });
  },

  // Lấy phiếu mượn của tôi (cho độc giả)
  getMyBorrowings() {
    return apiClient.get("/theodoimuonsach/my-borrowings");
  },

  // Cập nhật trạng thái phiếu mượn
  updateStatus(id, data) {
    return apiClient.put(`/theodoimuonsach/${id}/status`, data);
  },

  // Xóa phiếu mượn
  delete(id) {
    return apiClient.delete(`/theodoimuonsach/${id}`);
  },

  // Lấy chi tiết phiếu mượn
  getById(id) {
    return apiClient.get(`/theodoimuonsach/${id}`);
  },

  // Lấy trạng thái có thể chuyển
  getValidStatuses(id) {
    return apiClient.get(`/theodoimuonsach/${id}/status`);
  },
};
