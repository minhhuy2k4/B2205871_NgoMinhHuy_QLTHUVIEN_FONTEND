<template>
  <div class="home">
    <!-- Hero Section -->
    <section class="hero bg-primary text-white py-5">
      <div class="container">
        <div class="row align-items-center">
          <div class="col-lg-6">
            <h1 class="display-4 fw-bold mb-4">
              Hệ Thống Quản Lý Thư Viện
            </h1>
            <p class="lead mb-4">
              Khám phá kho tàng tri thức với hàng ngàn đầu sách phong phú. 
              Đăng ký ngay để trải nghiệm dịch vụ mượn sách trực tuyến hiện đại.
            </p>
            <div class="d-flex gap-3">
              <router-link 
                v-if="!authStore.isAuthenticated" 
                to="/register" 
                class="btn btn-light btn-lg"
              >
                Đăng ký ngay
              </router-link>
              <router-link 
                to="/books" 
                class="btn btn-outline-light btn-lg"
              >
                Khám phá sách
              </router-link>
            </div>
          </div>
          <div class="col-lg-6 text-center">
            <i class="bi bi-book display-1"></i>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="features py-5">
      <div class="container">
        <div class="row text-center mb-5">
          <div class="col">
            <h2 class="fw-bold mb-3">Tính Năng Nổi Bật</h2>
            <p class="text-muted">Trải nghiệm dịch vụ thư viện hiện đại và tiện lợi</p>
          </div>
        </div>
        <div class="row g-4">
          <div class="col-md-4">
            <div class="card h-100 text-center border-0 shadow-sm">
              <div class="card-body p-4">
                <i class="bi bi-search display-4 text-primary mb-3"></i>
                <h5 class="card-title">Tìm Kiếm Thông Minh</h5>
                <p class="card-text">
                  Tìm kiếm sách theo tên, tác giả, thể loại một cách nhanh chóng và chính xác.
                </p>
              </div>
            </div>
          </div>
          <div class="col-md-4">
            <div class="card h-100 text-center border-0 shadow-sm">
              <div class="card-body p-4">
                <i class="bi bi-bookmark-plus display-4 text-success mb-3"></i>
                <h5 class="card-title">Mượn Sách Online</h5>
                <p class="card-text">
                  Đặt mượn sách trực tuyến, theo dõi tình trạng mượn trả một cách thuận tiện.
                </p>
              </div>
            </div>
          </div>
          <div class="col-md-4">
            <div class="card h-100 text-center border-0 shadow-sm">
              <div class="card-body p-4">
                <i class="bi bi-person-check display-4 text-info mb-3"></i>
                <h5 class="card-title">Quản Lý Cá Nhân</h5>
                <p class="card-text">
                  Quản lý thông tin cá nhân, lịch sử mượn sách và gia hạn tự động.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Recent Books Section -->
    <section class="recent-books py-5">
      <div class="container">
        <div class="row mb-4">
          <div class="col">
            <h2 class="fw-bold text-center">Sách Mới Nhất</h2>
            <p class="text-center text-muted">Khám phá những đầu sách mới được thêm vào thư viện</p>
          </div>
        </div>
        <div class="row g-4">
          <div class="col-lg-3 col-md-6" v-for="book in recentBooks" :key="book._id">
            <BookCard :book="book" :can-borrow="authStore.isAuthenticated && !authStore.isNhanVien" />
          </div>
        </div>
        <div class="text-center mt-4">
          <router-link to="/books" class="btn btn-primary btn-lg">
            Xem tất cả sách
          </router-link>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth.js'
import { sachService } from '../services/Sach.service.js'
import BookCard from '../components/BookCard.vue'

export default {
  name: 'Home',
  components: {
    BookCard
  },
  setup() {
    const authStore = useAuthStore()
    const recentBooks = ref([])
    const loading = ref(false)

    const fetchRecentBooks = async () => {
      try {
        const response = await sachService.getAll({ limit: 4, sort: '-createdAt' })
        recentBooks.value = response.data.data || response.data
      } catch (error) {
        console.error('Lỗi khi tải sách mới:', error)
      }
    }

    onMounted(() => {
      fetchRecentBooks()
    })

    return {
      authStore,
      recentBooks,
      loading
    }
  }
}
</script>

<style scoped>
.hero {
  background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
}

.features .card {
  transition: transform 0.3s ease;
}

.features .card:hover {
  transform: translateY(-10px);
}

.stat-item {
  padding: 1rem;
}

.display-1 {
  font-size: 8rem;
  opacity: 0.1;
}
</style>
