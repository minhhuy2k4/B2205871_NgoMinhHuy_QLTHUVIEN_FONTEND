import apiClient from "./api.service.js";

export const authService = {
  // Đăng ký độc giả
  registerDocGia(data) {
    return apiClient.post("/auth/register/docgia", data);
  },

  // Đăng nhập độc giả
  loginDocGia(data) {
    return apiClient.post("/auth/login/docgia", data);
  },

  // Đăng nhập nhân viên
  loginNhanVien(data) {
    return apiClient.post("/auth/login/nhanvien", data);
  },

  // Lấy thông tin người dùng hiện tại
  getCurrentUser() {
    return apiClient.get("/auth/me");
  },

  // Refresh token
  refreshToken(refreshToken) {
    return apiClient.post("/auth/refresh-token", { refreshToken });
  },

  // Đăng xuất
  logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userInfo");
  },
};
