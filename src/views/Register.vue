<template>
  <div class="register">
    <div class="container-fluid h-100">
      <div class="row h-100">
        <!-- Left side - Image/Info -->
        <div class="col-lg-6 bg-primary text-white d-none d-lg-flex align-items-center justify-content-center">
          <div class="text-center">
            <i class="bi bi-person-plus display-1 mb-4" style="font-size: 8rem;"></i>
            <h3 class="fw-bold mb-3">Tham Gia Cộng Đồng Đọc Sách</h3>
            <p class="lead">
              Đăng ký tài khoản để trải nghiệm hệ thống quản lý thư viện hiện đại.
            </p>
          </div>
        </div>

        <!-- Right side - Register Form -->
        <div class="col-lg-6 d-flex align-items-center justify-content-center">
          <div class="register-form w-100" style="max-width: 450px;">
            <div class="text-center mb-4">
              <i class="bi bi-book display-4 text-primary mb-3"></i>
              <h2 class="fw-bold">Đăng Ký Tài Khoản</h2>
              <p class="text-muted">Tạo tài khoản độc giả mới</p>
            </div>

            <form @submit.prevent="handleRegister">
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label for="hoTen" class="form-label">Họ và tên *</label>
                  <input
                    type="text"
                    class="form-control"
                    id="hoTen"
                    v-model="form.hoTen"
                    placeholder="Nhập họ và tên"
                    required
                  >
                </div>
                <div class="col-md-6 mb-3">
                  <label for="email" class="form-label">Email *</label>
                  <input
                    type="email"
                    class="form-control"
                    id="email"
                    v-model="form.email"
                    placeholder="Nhập email"
                    required
                  >
                </div>
              </div>

              <div class="row">
                <div class="col-md-6 mb-3">
                  <label for="password" class="form-label">Mật khẩu *</label>
                  <div class="input-group">
                    <input
                      :type="showPassword ? 'text' : 'password'"
                      class="form-control"
                      id="password"
                      v-model="form.password"
                      placeholder="Nhập mật khẩu"
                      required
                      minlength="6"
                    >
                    <button
                      class="btn btn-outline-secondary"
                      type="button"
                      @click="showPassword = !showPassword"
                    >
                      <i :class="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
                    </button>
                  </div>
                  <div class="form-text">Mật khẩu phải có ít nhất 6 ký tự</div>
                </div>
                <div class="col-md-6 mb-3">
                  <label for="confirmPassword" class="form-label">Xác nhận mật khẩu *</label>
                  <input
                    type="password"
                    class="form-control"
                    id="confirmPassword"
                    v-model="confirmPassword"
                    placeholder="Nhập lại mật khẩu"
                    required
                    :class="{ 'is-invalid': confirmPassword && form.password !== confirmPassword }"
                  >
                  <div v-if="confirmPassword && form.password !== confirmPassword" class="invalid-feedback">
                    Mật khẩu xác nhận không khớp
                  </div>
                </div>
              </div>

              <div class="row">
                <div class="col-md-6 mb-3">
                  <label for="phai" class="form-label">Phái *</label>
                  <select
                    class="form-control"
                    id="phai"
                    v-model="form.phai"
                    required
                  >
                    <option value="" disabled>Chọn phái</option>
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                  </select>
                </div>
                <div class="col-md-6 mb-3">
                  <label for="ngaySinh" class="form-label">Ngày sinh *</label>
                  <input
                    type="date"
                    class="form-control"
                    id="ngaySinh"
                    v-model="form.ngaySinh"
                    required
                  >
                </div>
              </div>

              <div class="mb-3">
                <label for="soDienThoai" class="form-label">Số điện thoại *</label>
                <input
                  type="tel"
                  class="form-control"
                  id="soDienThoai"
                  v-model="form.soDienThoai"
                  placeholder="Nhập số điện thoại"
                  required
                  pattern="[0-9]{10,11}"
                >
                <div class="form-text">Nhập số điện thoại 10-11 chữ số</div>
              </div>

              <div class="mb-3">
                <label for="diaChi" class="form-label">Địa chỉ *</label>
                <textarea
                  class="form-control"
                  id="diaChi"
                  v-model="form.diaChi"
                  placeholder="Nhập địa chỉ"
                  rows="2"
                  required
                ></textarea>
              </div>

              <div class="mb-3 form-check">
                <input 
                  type="checkbox" 
                  class="form-check-input" 
                  id="agreeTerms" 
                  v-model="agreeTerms"
                  required
                >
                <label class="form-check-label" for="agreeTerms">
                  Tôi đồng ý với <a href="#" class="text-primary">Điều khoản sử dụng</a> 
                  và <a href="#" class="text-primary">Chính sách bảo mật</a>
                </label>
              </div>

              <div v-if="error" class="alert alert-danger" role="alert">
                <i class="bi bi-exclamation-circle me-2"></i>
                {{ error }}
              </div>

              <div v-if="success" class="alert alert-success" role="alert">
                <i class="bi bi-check-circle me-2"></i>
                {{ success }}
              </div>

              <button
                type="submit"
                class="btn btn-primary w-100 py-2 mb-3"
                :disabled="loading || form.password !== confirmPassword"
              >
                <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                {{ loading ? 'Đang đăng ký...' : 'Đăng Ký' }}
              </button>
            </form>

            <div class="text-center">
              <p class="text-muted">
                Đã có tài khoản? 
                <router-link to="/login" class="text-primary text-decoration-none">
                  Đăng nhập ngay
                </router-link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'

export default {
  name: 'Register',
  setup() {
    const router = useRouter()
    const authStore = useAuthStore()
    
    const showPassword = ref(false)
    const confirmPassword = ref('')
    const agreeTerms = ref(false)
    const loading = ref(false)
    const error = ref('')
    const success = ref('')
    
    const form = reactive({
      hoTen: '',
      email: '',
      password: '',
      soDienThoai: '',
      diaChi: '',
      phai: '',        // thêm dòng này
      ngaySinh: ''     // thêm dòng này
    })

    const handleRegister = async () => {
      if (form.password !== confirmPassword.value) {
        error.value = 'Mật khẩu xác nhận không khớp'
        return
      }

      if (!agreeTerms.value) {
        error.value = 'Vui lòng đồng ý với điều khoản sử dụng'
        return
      }

      loading.value = true
      error.value = ''
      success.value = ''

      try {
        const result = await authStore.register(form)

        if (result.success) {
          success.value = 'Đăng ký thành công! Đang chuyển hướng...'
          setTimeout(() => {
            router.push('/login')
          }, 2000)
        } else {
          error.value = result.error
        }
      } catch (err) {
        error.value = 'Có lỗi xảy ra. Vui lòng thử lại.'
      } finally {
        loading.value = false
      }
    }

    return {
      showPassword,
      confirmPassword,
      agreeTerms,
      loading,
      error,
      success,
      form,
      handleRegister
    }
  }
}
</script>

<style scoped>
.register {
  min-height: 100vh;
}

.register-form {
  padding: 2rem;
}

.bg-primary {
  background: linear-gradient(135deg, #007bff 0%, #0056b3 100%) !important;
}

.form-control:focus {
  border-color: #007bff;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

.btn-primary {
  background-color: #007bff;
  border-color: #007bff;
}

.btn-primary:hover {
  background-color: #0056b3;
  border-color: #0056b3;
}

.is-invalid {
  border-color: #dc3545;
}

.invalid-feedback {
  display: block;
}
</style>
