import apiClient from "./api.service.js";

export const profileService = {
  // Lấy thông tin profile hiện tại
  getProfile() {
    return apiClient.get("/profile/me");
  },

  // Cập nhật thông tin profile
  updateProfile(data) {
    return apiClient.put("/profile/update", data);
  },
};
