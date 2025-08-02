import apiClient from "./api.service.js";

export const muonSachService = {
  // Lấy danh sách mượn sách
  getAll(params = {}) {
    return apiClient.get("/theodoimuonsach", { params });
  },

  // Lấy chi tiết mượn sách theo ID
  getById(id) {
    return apiClient.get(`/theodoimuonsach/${id}`);
  },

  // Tạo phiếu mượn sách (admin)
  create(data) {
    return apiClient.post("/theodoimuonsach", data);
  },

  // Cập nhật phiếu mượn sách
  update(id, data) {
    return apiClient.put(`/theodoimuonsach/${id}`, data);
  },

  // Xóa phiếu mượn sách (admin)
  delete(id) {
    return apiClient.delete(`/theodoimuonsach/${id}`);
  },

  // Trả sách (admin only)
  returnBook(id, data) {
    return apiClient.put(`/theodoimuonsach/${id}/return`, data);
  },

  // Yêu cầu trả sách (user)
  requestReturn(id, data) {
    return apiClient.put(`/theodoimuonsach/${id}/request-return`, data);
  },

  // Lấy danh sách mượn sách của độc giả hiện tại
  getMyBorrowings() {
    return apiClient.get("/theodoimuonsach/my-borrowings");
  },

  // Mượn sách (user mượn từ sách)
  borrowBook(sachId, data = {}) {
    return apiClient.post("/theodoimuonsach", {
      sachId,
      ...data,
    });
  },

  // Lấy danh sách mượn sách của một độc giả
  getByDocGia(docGiaId) {
    return apiClient.get(`/theodoimuonsach/docgia/${docGiaId}`);
  },

  // Lấy danh sách mượn sách của một cuốn sách
  getBySach(sachId) {
    return apiClient.get(`/theodoimuonsach/sach/${sachId}`);
  },

  // Trả sách
  traSach(id, data = {}) {
    return apiClient.put(`/theodoimuonsach/${id}/tra-sach`, data);
  },
};
