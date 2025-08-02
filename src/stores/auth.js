import { defineStore } from "pinia";
import { authService } from "../services/auth.service.js";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: null,
    token: null,
    refreshToken: null,
    isAuthenticated: false,
    loading: false,
    error: null,
    refreshTimer: null,
  }),

  getters: {
    isNhanVien: (state) =>
      state.user?.role === "nhanvien" || state.user?.userType === "nhanvien",
    isAdmin: (state) =>
      state.user?.role === "nhanvien" || state.user?.userType === "nhanvien",
    isDocGia: (state) =>
      state.user?.role === "docgia" || state.user?.userType === "docgia",
    userName: (state) =>
      state.user?.hoTen || state.user?.username || state.user?.tenDocGia,
    sessionStatus: (state) => {
      if (!state.isAuthenticated) return "disconnected";
      if (!state.token) return "expired";
      return "active";
    },
  },

  actions: {
    async login(credentials, userType = "docgia") {
      this.loading = true;
      this.error = null;

      try {
        console.log("Auth store login:", { credentials, userType });

        let response;
        if (userType === "admin") {
          response = await authService.loginNhanVien(credentials);
        } else {
          response = await authService.loginDocGia(credentials);
        }

        console.log("Login response:", response);

        // Backend trả về: {message, data: {user info}, token}
        if (response.data && response.data.token) {
          const token = response.data.token;
          const user = response.data.data; // User info trong data.data
          const refreshToken = response.data.refreshToken; // Có thể không có

          this.token = token;
          this.refreshToken = refreshToken || null;
          this.user = user;
          this.isAuthenticated = true;

          // Lưu vào localStorage
          localStorage.setItem("token", token);
          if (refreshToken) {
            localStorage.setItem("refreshToken", refreshToken);
          }
          localStorage.setItem("userInfo", JSON.stringify(user));

          // Bắt đầu timer để auto refresh token
          this.startTokenRefreshTimer();

          return { success: true };
        } else {
          const errorMsg = response.data?.message || "Đăng nhập thất bại";
          this.error = errorMsg;
          return { success: false, error: errorMsg };
        }
      } catch (error) {
        console.error("Login error:", error);
        const errorMsg = error.response?.data?.message || "Đăng nhập thất bại";
        this.error = errorMsg;
        return { success: false, error: errorMsg };
      } finally {
        this.loading = false;
      }
    },

    async register(userData) {
      this.loading = true;
      this.error = null;

      try {
        const response = await authService.registerDocGia(userData);
        return { success: true, data: response.data };
      } catch (error) {
        this.error = error.response?.data?.message || "Đăng ký thất bại";
        return { success: false, error: this.error };
      } finally {
        this.loading = false;
      }
    },

    async logout() {
      // Clear refresh timer
      if (this.refreshTimer) {
        clearInterval(this.refreshTimer);
        this.refreshTimer = null;
      }

      this.user = null;
      this.token = null;
      this.refreshToken = null;
      this.isAuthenticated = false;

      authService.logout();
    },

    async getCurrentUser() {
      if (!this.token) return;

      try {
        const response = await authService.getCurrentUser();
        this.user = response.data;
        this.isAuthenticated = true;
      } catch (error) {
        this.logout();
      }
    },

    // Khôi phục state từ localStorage khi reload page
    async restoreAuth() {
      const token = localStorage.getItem("token");
      const refreshToken = localStorage.getItem("refreshToken");
      const userInfo = localStorage.getItem("userInfo");

      if (token && userInfo && userInfo !== "undefined") {
        try {
          this.token = token;
          this.refreshToken = refreshToken;
          const user = JSON.parse(userInfo);
          // Đảm bảo user có trường id
          if (user._id && !user.id) user.id = user._id;
          this.user = user;
          this.isAuthenticated = true;
          this.startTokenRefreshTimer();
        } catch (error) {
          console.error("Error parsing user info from localStorage:", error);
          this.logout();
        }
      }
    },

    // Kiểm tra và refresh token nếu cần
    async validateAndRefreshToken() {
      if (!this.token) return false;

      try {
        // Thử gọi API để kiểm tra token
        const response = await authService.getCurrentUser();
        this.user = response.data.data; // Backend trả về { data: { ...userInfo } }
        this.isAuthenticated = true;
        return true;
      } catch (error) {
        if (error.response?.status === 401) {
          // Token hết hạn, hiện tại backend chưa support refresh token
          console.error("Token validation failed:", error);
          this.logout();
          return false;
        } else {
          console.error("Token validation failed:", error);
          this.logout();
          return false;
        }
      }
    },

    // Auto refresh token mỗi 23 giờ
    startTokenRefreshTimer() {
      // Clear any existing timer
      if (this.refreshTimer) {
        clearInterval(this.refreshTimer);
      }

      // Refresh token sau 23 giờ (trước khi hết hạn 24h)
      const refreshInterval = 23 * 60 * 60 * 1000; // 23 hours in milliseconds

      this.refreshTimer = setInterval(async () => {
        if (this.isAuthenticated && this.refreshToken) {
          await this.validateAndRefreshToken();
        }
      }, refreshInterval);
    },

    // Validate token khi cần (lazy validation)
    async ensureValidToken() {
      if (!this.isAuthenticated || !this.token) {
        return false;
      }

      try {
        const response = await authService.getCurrentUser();
        this.user = response.data.data;
        return true;
      } catch (error) {
        if (error.response?.status === 401) {
          // Token không hợp lệ, logout
          this.logout();
          return false;
        }
        return false;
      }
    },
  },
});
