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

  // Đăng xuất - XÓA SESSIONSTORAGE
  logout() {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("refreshToken");
    sessionStorage.removeItem("userInfo");
    sessionStorage.removeItem("loginTime");
    sessionStorage.removeItem("lastActivity");

    // Cũng xóa localStorage để đảm bảo (nếu có sót)
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userInfo");
  },
};
