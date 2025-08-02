<template>
  <div class="login">
    <div class="container-fluid h-100">
      <div class="row h-100">
        <!--Login Form -->
        <div class="col-lg d-flex align-items-center justify-content-center">
          <div class="login-form w-100" style="max-width: 400px;">
            <div class="text-center mb-4">
              <i class="bi bi-book display-4 text-primary mb-3"></i>
              <h2 class="fw-bold">Đăng Nhập</h2>
              <p class="text-muted">Vào hệ thống quản lý thư viện</p>
            </div>

            <!-- User Type Selector -->
            <div class="mb-3">
              <div class="btn-group w-100" role="group">
                <input 
                  type="radio" 
                  class="btn-check" 
                  name="userType" 
                  id="docgia" 
                  value="docgia" 
                  v-model="userType"
                  checked
                >
                <label class="btn btn-outline-primary" for="docgia">Độc Giả</label>

                <input 
                  type="radio" 
                  class="btn-check" 
                  name="userType" 
                  id="admin" 
                  value="admin" 
                  v-model="userType"
                >
                <label class="btn btn-outline-primary" for="admin">Nhân Viên</label>
              </div>
            </div>

            <form @submit.prevent="handleLogin">
              <div class="mb-3">
                <label for="email" class="form-label">
                  {{ userType === 'admin' ? 'Tên đăng nhập' : 'Email' }}
                </label>
                <input
                  type="text"
                  class="form-control"
                  id="email"
                  v-model="form.email"
                  :placeholder="userType === 'admin' ? 'Nhập tên đăng nhập' : 'Nhập email'"
                  required
                >
              </div>

              <div class="mb-3">
                <label for="password" class="form-label">Mật khẩu</label>
                <div class="input-group">
                  <input
                    :type="showPassword ? 'text' : 'password'"
                    class="form-control"
                    id="password"
                    v-model="form.password"
                    placeholder="Nhập mật khẩu"
                    required
                  >
                  <button
                    class="btn btn-outline-secondary"
                    type="button"
                    @click="showPassword = !showPassword"
                  >
                    <i :class="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
                  </button>
                </div>
              </div>

              <div class="mb-3 form-check">
                <input type="checkbox" class="form-check-input" id="rememberMe" v-model="rememberMe">
                <label class="form-check-label" for="rememberMe">
                  Ghi nhớ đăng nhập
                </label>
              </div>

              <div v-if="error" class="alert alert-danger" role="alert">
                <i class="bi bi-exclamation-circle me-2"></i>
                {{ error }}
              </div>

              <button
                type="submit"
                class="btn btn-primary w-100 py-2"
                :disabled="loading"
              >
                <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                {{ loading ? 'Đang đăng nhập...' : 'Đăng Nhập' }}
              </button>
            </form>

            <div class="text-center mt-4" v-if="userType === 'docgia'">
              <p class="text-muted">
                Chưa có tài khoản? 
                <router-link to="/register" class="text-primary text-decoration-none">
                  Đăng ký ngay
                </router-link>
              </p>
            </div>
          </div>
        </div>

        <!-- Right side - Image/Info
        <div class="col-lg-6 bg-primary text-white d-none d-lg-flex align-items-center justify-content-center">
          <div class="text-center">
            <i class="bi bi-book-half display-1 mb-4" style="font-size: 8rem;"></i>
            <h3 class="fw-bold mb-3">Chào mừng đến với Thư Viện</h3>
            <p class="lead">
              Hệ thống quản lý thư viện hiện đại, giúp bạn dễ dàng tìm kiếm và mượn sách.
            </p>
          </div>
        </div> -->
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'

export default {
  name: 'Login',
  setup() {
    const router = useRouter()
    const authStore = useAuthStore()
    
    const userType = ref('docgia')
    const showPassword = ref(false)
    const rememberMe = ref(false)
    const loading = ref(false)
    const error = ref('')
    
    const form = reactive({
      email: '',
      password: ''
    })

    const handleLogin = async () => {
      loading.value = true
      error.value = ''

      try {
        // Prepare credentials based on user type
        const credentials = {
          password: form.password
        }

        // Set the appropriate login field based on user type
        if (userType.value === 'admin') {
          credentials.username = form.email  // Nhân viên sử dụng username (có thể là msnv hoặc tenDangNhap)
        } else {
          credentials.email = form.email  // Độc giả sử dụng email
        }

        console.log('Login attempt:', { userType: userType.value, credentials })

        const result = await authStore.login(credentials, userType.value)

        if (result.success) {
          // Tất cả người dùng đều vào trang chủ sau khi đăng nhập
          router.push('/')
        } else {
          error.value = result.error
        }
      } catch (err) {
        console.error('Login error:', err)
        error.value = 'Có lỗi xảy ra. Vui lòng thử lại.'
      } finally {
        loading.value = false
      }
    }

    return {
      userType,
      showPassword,
      rememberMe,
      loading,
      error,
      form,
      handleLogin
    }
  }
}
</script>

<style scoped>
.login {
  min-height: 100vh;
}

.login-form {
  padding: 2rem;
}

.bg-primary {
  background: linear-gradient(135deg, #007bff 0%, #0056b3 100%) !important;
}

.btn-check:checked + .btn-outline-primary {
  background-color: #007bff;
  border-color: #007bff;
  color: white;
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
</style>
