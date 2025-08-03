<template>
  <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
    <div class="container">
      <router-link class="navbar-brand fw-bold" to="/">
        <i class="bi bi-book me-2"></i>
        Quản Lý Thư Viện
      </router-link>
      
      <button 
        class="navbar-toggler" 
        type="button" 
        @click="toggleNavbar"
      >
        <span class="navbar-toggler-icon"></span>
      </button>
      
      <div class="collapse navbar-collapse" :class="{ 'show': isNavbarOpen }" id="navbarNav">
        <ul class="navbar-nav me-auto">
          <li class="nav-item">
            <router-link class="nav-link" to="/">Trang chủ</router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/books">Sách</router-link>
          </li>
          <!-- Độc giả mới thấy menu Sách đã mượn -->
          <li v-if="authStore.isDocGia" class="nav-item">
            <router-link class="nav-link" to="/my-borrowings">Sách đã mượn</router-link>
          </li>
          <!-- Nhân viên mới thấy menu quản trị -->
          <li v-if="authStore.isNhanVien" class="nav-item dropdown">
            <a 
              class="nav-link dropdown-toggle" 
              href="#" 
              @click.prevent="toggleAdminDropdown"
              role="button"
            >
              Quản lý
            </a>
            <ul class="dropdown-menu" :class="{ 'show': isAdminDropdownOpen }">
              <li v-if="authStore.user?.chucVu === 'admin'">
                  <router-link to="/admin/users" class="dropdown-item">
                    Quản lý người dùng
                  </router-link>
              </li>
              <li><router-link class="dropdown-item" to="/admin/books">Quản lý sách</router-link></li>
              <li><router-link class="dropdown-item" to="/admin/publishers">Quản lý nhà xuất bản</router-link></li>
              <li><router-link class="dropdown-item" to="/admin/borrowings">Quản lý mượn trả</router-link></li>
            </ul>
          </li>
        </ul>
        
        <ul class="navbar-nav">
          <li v-if="!authStore.isAuthenticated" class="nav-item">
            <router-link class="nav-link" to="/login">Đăng nhập</router-link>
          </li>
          <li v-if="!authStore.isAuthenticated" class="nav-item">
            <router-link class="nav-link" to="/register">Đăng ký</router-link>
          </li>
          <li v-if="authStore.isAuthenticated" class="nav-item dropdown">
            <a 
              class="nav-link dropdown-toggle" 
              href="#" 
              @click.prevent="toggleUserDropdown"
              role="button"
            >
              <i class="bi bi-person-circle me-1"></i>
              {{ authStore.userName }}
              <span v-if="authStore.isAuthenticated" class="badge bg-success ms-1">●</span>
            </a>
            <ul class="dropdown-menu" :class="{ 'show': isUserDropdownOpen }">
              <li><router-link class="dropdown-item" to="/profile">Hồ sơ</router-link></li>
              <li><hr class="dropdown-divider"></li>
              <li><a class="dropdown-item" href="#" @click="logout">Đăng xuất</a></li>
            </ul>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '../stores/auth.js'
import { useRouter } from 'vue-router'

export default {
  name: 'NavBar',
  setup() {
    const authStore = useAuthStore()
    const router = useRouter()
    
    // Reactive states for dropdowns
    const isNavbarOpen = ref(false)
    const isAdminDropdownOpen = ref(false)
    const isUserDropdownOpen = ref(false)

    // Toggle functions
    const toggleNavbar = () => {
      isNavbarOpen.value = !isNavbarOpen.value
    }

    const toggleAdminDropdown = () => {
      isAdminDropdownOpen.value = !isAdminDropdownOpen.value
      isUserDropdownOpen.value = false // Close other dropdown
    }

    const toggleUserDropdown = () => {
      isUserDropdownOpen.value = !isUserDropdownOpen.value
      isAdminDropdownOpen.value = false // Close other dropdown
    }

    // Close dropdowns when clicking outside
    const closeDropdowns = (event) => {
      if (!event.target.closest('.dropdown')) {
        isAdminDropdownOpen.value = false
        isUserDropdownOpen.value = false
      }
    }

    const logout = async () => {
      await authStore.logout()
      router.push('/')
    }

    // Event listeners
    onMounted(() => {
      document.addEventListener('click', closeDropdowns)
    })

    onUnmounted(() => {
      document.removeEventListener('click', closeDropdowns)
    })
    
    return {
      authStore,
      logout,
      isNavbarOpen,
      isAdminDropdownOpen,
      isUserDropdownOpen,
      toggleNavbar,
      toggleAdminDropdown,
      toggleUserDropdown
    }
  }
}
</script>

<style scoped>
.navbar-brand {
  font-size: 1.5rem;
}

.nav-link {
  font-weight: 500;
}

.dropdown-menu {
  border: none;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
</style>
