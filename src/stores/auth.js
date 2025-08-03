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
    userName: (state) => state.user?.hoTenNV || state.user?.hoTen,
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

        if (response.data && response.data.token) {
          const token = response.data.token;
          const user = response.data.data;
          const refreshToken = response.data.refreshToken;

          this.token = token;
          this.refreshToken = refreshToken || null;
          this.user = user;
          this.isAuthenticated = true;

          // LƯU VÀO SESSIONSTORAGE - TỰ ĐỘNG MẤT KHI ĐÓNG BROWSER
          sessionStorage.setItem("token", token);
          if (refreshToken) {
            sessionStorage.setItem("refreshToken", refreshToken);
          }
          sessionStorage.setItem("userInfo", JSON.stringify(user));
          sessionStorage.setItem("loginTime", Date.now().toString());

          // SETUP SESSION MANAGEMENT THAY VÌ 23H TIMER
          this.setupSessionManagement();

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

    // KHÔI PHỤC TỪ SESSIONSTORAGE THAY VÌ LOCALSTORAGE
    async restoreAuth() {
      const token = sessionStorage.getItem("token");
      const refreshToken = sessionStorage.getItem("refreshToken");
      const userInfo = sessionStorage.getItem("userInfo");

      if (token && userInfo && userInfo !== "undefined") {
        try {
          this.token = token;
          this.refreshToken = refreshToken;
          const user = JSON.parse(userInfo);
          if (user._id && !user.id) user.id = user._id;
          this.user = user;
          this.isAuthenticated = true;

          // SETUP SESSION MANAGEMENT
          this.setupSessionManagement();
        } catch (error) {
          console.error("Error parsing user info from sessionStorage:", error);
          this.logout();
        }
      }
    },

    // SETUP SESSION MANAGEMENT - THAY THẾ 23H TIMER
    setupSessionManagement() {
      // KIỂM TRA TOKEN MỖI 5 PHÚT
      this.refreshTimer = setInterval(async () => {
        if (this.isAuthenticated) {
          const isValid = await this.validateToken();
          if (!isValid) {
            this.logout();

            // Redirect to login
            if (!window.location.href.includes("/login")) {
              window.location.href = "/login";
            }
          }
        }
      }, 5 * 60 * 1000); // 5 phút

      // CẬP NHẬT ACTIVITY
      this.updateActivity();
    },

    // CẬP NHẬT LAST ACTIVITY
    updateActivity() {
      const updateTime = () => {
        if (this.isAuthenticated) {
          sessionStorage.setItem("lastActivity", Date.now().toString());
        }
      };

      // Cập nhật ngay
      updateTime();

      // Lắng nghe user activity
      [
        "mousedown",
        "mousemove",
        "keypress",
        "scroll",
        "touchstart",
        "click",
        "focus",
      ].forEach((event) => {
        document.addEventListener(event, updateTime, { passive: true });
      });
    },

    // KIỂM TRA TOKEN HỢP LỆ
    async validateToken() {
      if (!this.token) return false;

      try {
        const response = await authService.getCurrentUser();
        this.user = response.data.data;
        return true;
      } catch (error) {
        return false;
      }
    },

    // THAY THẾ validateAndRefreshToken CŨ
    async validateAndRefreshToken() {
      return await this.validateToken();
    },

    // BỎ 23H TIMER - SESSION TỰ MẤT KHI ĐÓNG BROWSER
    startTokenRefreshTimer() {
      console.log(
        "Using sessionStorage - session will auto-expire when browser is closed"
      );
      // Không cần 23h timer nữa
    },

    // VALIDATE TOKEN KHI CẦN
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
          this.logout();
          return false;
        }
        return false;
      }
    },
  },
});
