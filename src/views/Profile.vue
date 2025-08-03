<template>
  <div class="profile">
    <div class="container py-4">
      <!-- Header -->
      <div class="row mb-4">
        <div class="col">
          <h1 class="fw-bold">Hồ Sơ Cá Nhân</h1>
          <p class="text-muted">Quản lý thông tin tài khoản của bạn</p>
        </div>
      </div>

      <div class="row">
        <!-- Avatar Section -->
        <div class="col-lg-4 mb-4">
          <div class="card">
            <div class="card-body text-center">
              <div class="avatar mb-3">
                <i class="bi bi-person-circle display-1 text-primary"></i>
              </div>
              <h4 class="card-title">{{ displayName }}</h4>
              <p class="text-muted">
                <span class="badge" :class="isNhanVien ? 'bg-success' : 'bg-primary'">
                  {{ isNhanVien ? 'Nhân viên' : 'Độc giả' }}
                </span>
              </p>
            </div>
          </div>
        </div>

        <!-- Profile Information -->
        <div class="col-lg-8 mb-4">
          <div class="card">
            <div class="card-header">
              <h5 class="card-title mb-0">
                <i class="bi bi-person-gear me-2"></i>
                Thông tin cá nhân
              </h5>
            </div>
            <div class="card-body">
              <!-- Thông tin hiển thị cho Nhân viên -->
              <div v-if="isNhanVien">
                <div class="row mb-3">
                  <div class="col-sm-4"><strong>Mã số:</strong></div>
                  <div class="col-sm-8">{{ userInfo.maso || userInfo.msnv || 'Chưa có' }}</div>
                </div>
                <div class="row mb-3">
                  <div class="col-sm-4"><strong>Họ và tên:</strong></div>
                  <div class="col-sm-8">{{ userInfo.hoTenNV || userInfo.hoTen || 'Chưa có' }}</div>
                </div>
                <div class="row mb-3" v-if="userInfo.chucVu">
                  <div class="col-sm-4"><strong>Chức vụ:</strong></div>
                  <div class="col-sm-8">{{ userInfo.chucVu }}</div>
                </div>
                <div class="row mb-3" v-if="userInfo.diaChi">
                  <div class="col-sm-4"><strong>Địa chỉ:</strong></div>
                  <div class="col-sm-8">{{ userInfo.diaChi }}</div>
                </div>
                <div class="row mb-3" v-if="userInfo.soDienThoai">
                  <div class="col-sm-4"><strong>Số điện thoại:</strong></div>
                  <div class="col-sm-8">{{ userInfo.soDienThoai }}</div>
                </div>
                <div class="row mb-3" v-if="userInfo.email">
                  <div class="col-sm-4"><strong>Email:</strong></div>
                  <div class="col-sm-8">{{ userInfo.email }}</div>
                </div>
              </div>

              <!-- Thông tin hiển thị cho Độc giả -->
              <div v-else>
                <div class="row mb-3">
                  <div class="col-sm-4"><strong>Email:</strong></div>
                  <div class="col-sm-8">{{ userInfo.email || 'Chưa có' }}</div>
                </div>
                <div class="row mb-3">
                  <div class="col-sm-4"><strong>Họ và tên:</strong></div>
                  <div class="col-sm-8">{{ userInfo.hoTen || 'Chưa có' }}</div>
                </div>
                <div class="row mb-3">
                  <div class="col-sm-4"><strong>Giới tính:</strong></div>
                  <div class="col-sm-8">{{ userInfo.phai || userInfo.gioitinh }}</div>
                </div>
                <div class="row mb-3">
                  <div class="col-sm-4"><strong>Ngày sinh:</strong></div>
                  <div class="col-sm-8">{{ formatDate(userInfo.ngaySinh || userInfo.ngaysinh) }}</div>
                </div>
                <div class="row mb-3">
                  <div class="col-sm-4"><strong>Địa chỉ:</strong></div>
                  <div class="col-sm-8">{{ userInfo.diaChi }}</div>
                </div>
                <div class="row mb-3">
                  <div class="col-sm-4"><strong>Số điện thoại:</strong></div>
                  <div class="col-sm-8">{{ userInfo.soDienThoai }}</div>
                </div>
              </div>

              <!-- Nút cập nhật thông tin -->
              <div class="text-end mt-4">
                <button 
                  type="button" 
                  class="btn btn-primary" 
                  data-bs-toggle="modal" 
                  data-bs-target="#editProfileModal"
                  @click="loadFormData"
                >
                  <i class="bi bi-pencil-square me-2"></i>
                  Cập nhật thông tin
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal Chỉnh sửa thông tin -->
      <div class="modal fade" id="editProfileModal" tabindex="-1" aria-labelledby="editProfileModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-lg">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="editProfileModalLabel">
                <i class="bi bi-person-gear me-2"></i>
                Chỉnh sửa thông tin cá nhân
              </h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <form @submit.prevent="updateProfile">
                <!-- Form cho Nhân viên -->
                <div v-if="isNhanVien">
                  <div class="row">
                    <div class="col-md-6 mb-3">
                      <label for="editMaso" class="form-label">Mã số</label>
                      <input
                        type="text"
                        class="form-control"
                        id="editMaso"
                        v-model="form.maso"
                        disabled
                      >
                      <div class="form-text">Mã số không thể thay đổi</div>
                    </div>
                    <div class="col-md-6 mb-3">
                      <label for="editHoTenNV" class="form-label">Họ và tên *</label>
                      <input
                        type="text"
                        class="form-control"
                        id="editHoTenNV"
                        v-model="form.hoTenNV"
                        required
                      >
                    </div>
                  </div>
                  <div class="row">
                    <div class="col-md-6 mb-3">
                      <label for="editChucVu" class="form-label">Chức vụ</label>
                      <input
                        type="text"
                        class="form-control"
                        id="editChucVu"
                        v-model="form.chucVu"
                      >
                    </div>
                  </div>
                  <div class="row">
                    <div class="col-md-6 mb-3">
                      <label for="editDiaChiNV" class="form-label">Địa chỉ</label>
                      <input
                        type="text"
                        class="form-control"
                        id="editDiaChiNV"
                        v-model="form.diaChi"
                      />
                    </div>
                    <div class="col-md-6 mb-3">
                      <label for="editSoDienThoaiNV" class="form-label">Số điện thoại</label>
                      <input
                        type="tel"
                        class="form-control"
                        id="editSoDienThoaiNV"
                        v-model="form.soDienThoai"
                        pattern="[0-9]{10,11}"
                      >
                    </div>
                  </div>
                </div>

                <!-- Form cho Độc giả -->
                <div v-else>
                  <div class="row">
                    <div class="col-md-6 mb-3">
                      <label for="editEmail" class="form-label">Email</label>
                      <input
                        type="email"
                        class="form-control"
                        id="editEmail"
                        v-model="form.email"
                        disabled
                      >
                      <div class="form-text">Email không thể thay đổi</div>
                    </div>
                    <div class="col-md-6 mb-3">
                      <label for="editHoTen" class="form-label">Họ và tên *</label>
                      <input
                        type="text"
                        class="form-control"
                        id="editHoTen"
                        v-model="form.hoTen"
                        required
                      >
                    </div>
                  </div>
                  <div class="row">
                    <div class="col-md-6 mb-3">
                      <label for="editPhai" class="form-label">Phái</label>
                      <select class="form-control" id="editPhai" v-model="form.phai">
                        <option value="">Chọn phái</option>
                        <option value="Nam">Nam</option>
                        <option value="Nữ">Nữ</option>
                      </select>
                    </div>
                    <div class="col-md-6 mb-3">
                      <label for="editNgaySinh" class="form-label">Ngày sinh</label>
                      <input
                        type="date"
                        class="form-control"
                        id="editNgaySinh"
                        v-model="form.ngaysinh"
                      >
                    </div>
                  </div>
                  <div class="row">
                    <div class="col-md-6 mb-3">
                      <label for="editDiaChi" class="form-label">Địa chỉ</label>
                      <textarea
                        class="form-control"
                        id="editDiaChi"
                        v-model="form.diaChi"
                        rows="2"
                      ></textarea>
                    </div>
                    <div class="col-md-6 mb-3">
                      <label for="editSoDienThoai" class="form-label">Số điện thoại</label>
                      <input
                        type="tel"
                        class="form-control"
                        id="editSoDienThoai"
                        v-model="form.soDienThoai"
                        pattern="[0-9]{10,11}"
                      >
                    </div>
                  </div>
                </div>

                <div v-if="updateError" class="alert alert-danger" role="alert">
                  <i class="bi bi-exclamation-circle me-2"></i>
                  {{ updateError }}
                </div>

                <div v-if="updateSuccess" class="alert alert-success" role="alert">
                  <i class="bi bi-check-circle me-2"></i>
                  {{ updateSuccess }}
                </div>
              </form>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                <i class="bi bi-x-circle me-2"></i>
                Hủy
              </button>
              <button
                type="button"
                class="btn btn-primary"
                @click="updateProfile"
                :disabled="updating"
              >
                <span v-if="updating" class="spinner-border spinner-border-sm me-2"></span>
                <i v-else class="bi bi-check-circle me-2"></i>
                {{ updating ? 'Đang cập nhật...' : 'Lưu thay đổi' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Change Password Section -->
      <div class="row">
        <div class="col-lg-8 offset-lg-4">
          <!-- Chỉ giữ lại phần đổi mật khẩu, XÓA form cập nhật thông tin ở đây -->
          <div class="card mt-4">
            <div class="card-header">
              <h5 class="card-title mb-0">
                <i class="bi bi-key me-2"></i>
                Đổi mật khẩu
              </h5>
            </div>
            <div class="card-body">
              <form @submit.prevent="changePassword">
                <div class="mb-3">
                  <label for="currentPassword" class="form-label">Mật khẩu hiện tại *</label>
                  <input
                    type="password"
                    class="form-control"
                    id="currentPassword"
                    v-model="passwordForm.currentPassword"
                    required
                  >
                </div>

                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label for="newPassword" class="form-label">Mật khẩu mới *</label>
                    <input
                      type="password"
                      class="form-control"
                      id="newPassword"
                      v-model="passwordForm.newPassword"
                      required
                      minlength="6"
                    >
                  </div>
                  <div class="col-md-6 mb-3">
                    <label for="confirmNewPassword" class="form-label">Xác nhận mật khẩu mới *</label>
                    <input
                      type="password"
                      class="form-control"
                      id="confirmNewPassword"
                      v-model="passwordForm.confirmNewPassword"
                      required
                      :class="{ 'is-invalid': passwordForm.confirmNewPassword && passwordForm.newPassword !== passwordForm.confirmNewPassword }"
                    >
                    <div v-if="passwordForm.confirmNewPassword && passwordForm.newPassword !== passwordForm.confirmNewPassword" class="invalid-feedback">
                      Mật khẩu xác nhận không khớp
                    </div>
                  </div>
                </div>

                <div v-if="passwordError" class="alert alert-danger" role="alert">
                  <i class="bi bi-exclamation-circle me-2"></i>
                  {{ passwordError }}
                </div>

                <div v-if="passwordSuccess" class="alert alert-success" role="alert">
                  <i class="bi bi-check-circle me-2"></i>
                  {{ passwordSuccess }}
                </div>

                <button
                  type="submit"
                  class="btn btn-warning"
                  :disabled="changingPassword || passwordForm.newPassword !== passwordForm.confirmNewPassword"
                >
                  <span v-if="changingPassword" class="spinner-border spinner-border-sm me-2"></span>
                  {{ changingPassword ? 'Đang đổi mật khẩu...' : 'Đổi mật khẩu' }}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth.js'
import { docGiaService } from '../services/docgia.service.js'
import { nhanVienService } from '../services/nhanvien.service.js'
import { profileService } from "../services/profile.service.js";

export default {
  name: 'Profile',
  setup() {
    const authStore = useAuthStore()
    
    const updating = ref(false)
    const updateError = ref('')
    const updateSuccess = ref('')
    
    const changingPassword = ref(false)
    const passwordError = ref('')
    const passwordSuccess = ref('')

    const userInfo = computed(() => authStore.user || {})
    
    // Xác định loại người dùng
    const isNhanVien = computed(() => 
      authStore.user?.role === 'nhanvien' || 
      authStore.user?.userType === 'nhanvien'
    )
    
    const isDocGia = computed(() => 
      authStore.user?.role === 'docgia' || 
      authStore.user?.userType === 'docgia'
    )

    // Tên hiển thị
    const displayName = computed(() => {
      if (isNhanVien.value) {
        return userInfo.value.hoTenNV || 'Chưa có tên'
      } else {
        return userInfo.value.hoTen || 'Chưa có tên'
      }
    })

    // Form data cho nhân viên và độc giả
    const form = reactive({
      // Nhân viên fields
      maso: '',
      hoTenNV: '',
      chucVu: '',
      diaChi: '',
      soDienThoai: '',
      
      // Độc giả fields
      email: '',
      hoTen: '',
      phai: '',
      ngaysinh: '',
      diachi: ''
    })

    const passwordForm = reactive({
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: ''
    })

    const loadUserInfo = () => {
      const user = authStore.user
    }

    const loadFormData = () => {
      const user = authStore.user
      if (user) {
        if (isNhanVien.value) {
          // Load nhân viên data
          form.maso = user.maso || user.msnv || ''
          form.hoTenNV = user.hoTenNV || user.hoTen || ''
          form.chucVu = user.chucVu || ''
          form.diaChi = user.diaChi || ''
          form.soDienThoai = user.soDienThoai || ''
        } else {
          // Load độc giả data
          form.email = user.email || ''
          form.hoTen = user.hoTen || ''
          form.phai = user.phai || user.gioitinh || ''
          form.ngaysinh = user.ngaysinh || user.ngaySinh ? (user.ngaysinh || user.ngaySinh).split('T')[0] : ''
          form.diaChi = user.diaChi || user.diachi || ''   // SỬA DÒNG NÀY
          form.soDienThoai = user.soDienThoai || user.dienThoai || ''
        }
      }
    }

    const updateProfile = async () => {
      updating.value = true
      updateError.value = ''
      updateSuccess.value = ''

      try {
        
        // Kiểm tra user tồn tại
        if (!authStore.user) {
          throw new Error('Bạn chưa đăng nhập. Vui lòng đăng nhập lại.')
        }
        
        // Kiểm tra ID người dùng
        const userId = authStore.user._id || authStore.user.id
        if (!userId) {
          throw new Error('Không tìm thấy ID người dùng. Vui lòng đăng nhập lại.')
        }
        

        let updateData = {}

        if (isNhanVien.value) {
          // Chuẩn bị data cho nhân viên
          updateData = {
            hoTenNV: form.hoTenNV,
            chucVu: form.chucVu,
            diaChi: form.diaChi,
            soDienThoai: form.soDienThoai
          }
        } else {
          // Chuẩn bị data cho độc giả
          updateData = {
            hoTen: form.hoTen,
            phai: form.phai,
            ngaysinh: form.ngaysinh,
            diaChi: form.diaChi,
            soDienThoai: form.soDienThoai
          }
        }

        // Loại bỏ các trường rỗng
        Object.keys(updateData).forEach(key => {
          if (updateData[key] === undefined || updateData[key] === '') {
            delete updateData[key]
          }
        })


        // Gọi API profile mới
        const response = await fetch('/api/profile/update', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authStore.token || localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            userId: userId,
            ...updateData
          })
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || 'Có lỗi xảy ra khi cập nhật')
        }
        const result = await response.json()

        // Lấy lại thông tin user mới nhất từ backend
        const profileRes = await fetch('/api/profile/me', {
          headers: {
            'Authorization': `Bearer ${authStore.token || localStorage.getItem('token')}`
          }
        });
        if (profileRes.ok) {
          const user = await profileRes.json();
          if (user._id && !user.id) user.id = user._id;
          authStore.user = user;
          localStorage.setItem('userInfo', JSON.stringify(user));
        }

        updateSuccess.value = 'Cập nhật thông tin thành công!'
        
        // Đóng modal sau khi cập nhật thành công
        const modal = document.getElementById('editProfileModal')
        if (modal) {
          // Luôn tạo instance nếu chưa có
          let bsModal = window.bootstrap?.Modal?.getInstance(modal)
          if (!bsModal && window.bootstrap?.Modal) {
            bsModal = new window.bootstrap.Modal(modal)
          }
          if (bsModal) {
            bsModal.hide()
          }
        }
        
        setTimeout(() => { updateSuccess.value = '' }, 1000)
      } catch (error) {
        
        updateError.value = error.message || 'Có lỗi xảy ra khi cập nhật thông tin'
        
        // Nếu lỗi authentication, redirect về login
        if (error.message.includes('đăng nhập')) {
          setTimeout(() => {
            authStore.logout()
            if (window.$router) {
              window.$router.push('/login')
            }
          }, 2000)
        }
      } finally {
        updating.value = false
      }
    }

    const changePassword = async () => {
      if (passwordForm.newPassword !== passwordForm.confirmNewPassword) {
        passwordError.value = 'Mật khẩu xác nhận không khớp'
        return
      }

      changingPassword.value = true
      passwordError.value = ''
      passwordSuccess.value = ''

      try {
        const userId = authStore.user._id || authStore.user.id
        if (!userId) {
          throw new Error('Không tìm thấy ID người dùng. Vui lòng đăng nhập lại.')
        }

        const passwordData = {
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        }

        // Gọi API đổi mật khẩu mới
        const response = await fetch('/api/profile/change-password', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authStore.token || localStorage.getItem('token')}`
          },
          body: JSON.stringify(passwordData)
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || 'Có lỗi xảy ra khi đổi mật khẩu')
        }
        
        passwordSuccess.value = 'Đổi mật khẩu thành công!'
        
        // Clear form
        passwordForm.currentPassword = ''
        passwordForm.newPassword = ''
        passwordForm.confirmNewPassword = ''
        
        setTimeout(() => {
          passwordSuccess.value = ''
        }, 3000)
      } catch (error) {
        passwordError.value = error.message || 'Có lỗi xảy ra khi đổi mật khẩu'
      } finally {
        changingPassword.value = false
      }
    }

    const formatDate = (dateString) => {
      if (!dateString) return ''
      try {
        const date = new Date(dateString)
        return date.toLocaleDateString('vi-VN')
      } catch (error) {
        return dateString.split('T')[0]
      }
    }

    onMounted(async () => {
      // Gọi API lấy thông tin user mới nhất từ backend
      try {
        const response = await fetch('/api/profile/me', {
          headers: {
            'Authorization': `Bearer ${authStore.token || localStorage.getItem('token')}`
          }
        });
        if (response.ok) {
          const user = await response.json();
          authStore.user = user;
          localStorage.setItem('userInfo', JSON.stringify(user));
        }
      } catch (e) {
        // Xử lý lỗi nếu cần
      }
      loadUserInfo();
    });

    return {
      authStore,
      userInfo,
      isNhanVien,
      isDocGia,
      displayName,
      form,
      passwordForm,
      updating,
      updateError,
      updateSuccess,
      changingPassword,
      passwordError,
      passwordSuccess,
      updateProfile,
      changePassword,
      formatDate,
      loadFormData
    }
  }
}
</script>

<style scoped>
.profile {
  background-color: #f8f9fa;
  min-height: 100vh;
}

.avatar {
  padding: 1rem;
}

.card {
  border: none;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
  transition: box-shadow 0.3s ease;
}

.card:hover {
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
}

.form-control:focus {
  border-color: #007bff;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

.is-invalid {
  border-color: #dc3545;
}

.invalid-feedback {
  display: block;
}

.modal-content {
  border-radius: 0.5rem;
}

.modal-header {
  background-color: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
}

.modal-footer {
  background-color: #f8f9fa;
  border-top: 1px solid #dee2e6;
}

.row.mb-3 {
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 0.5rem;
}

.row.mb-3:last-child {
  border-bottom: none;
}

.btn {
  transition: all 0.3s ease;
}

.btn:hover {
  transform: translateY(-1px);
}
</style>
