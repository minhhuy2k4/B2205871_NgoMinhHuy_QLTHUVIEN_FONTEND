<template>
  <div class="my-borrowings">
    <div class="container py-4">
      <!-- Header -->
      <div class="row mb-4">
        <div class="col">
          <h1 class="fw-bold">Sách Đã Mượn</h1>
          <p class="text-muted">Quản lý danh sách sách bạn đã mượn</p>
        </div>
      </div>

      <!-- Filter Tabs -->
      <div class="card mb-4">
        <div class="card-body">
          <ul class="nav nav-pills" role="tablist">
            <li class="nav-item" role="presentation">
              <button 
                class="nav-link" 
                :class="{ active: activeTab === 'all' }"
                @click="setActiveTab('all')"
              >
                Tất cả ({{ totalCount }})
              </button>
            </li>
            <li class="nav-item" role="presentation">
              <button 
                class="nav-link" 
                :class="{ active: activeTab === 'borrowing' }"
                @click="setActiveTab('borrowing')"
              >
                Đang mượn ({{ borrowingCount }})
              </button>
            </li>
            <li class="nav-item" role="presentation">
              <button 
                class="nav-link" 
                :class="{ active: activeTab === 'returned' }"
                @click="setActiveTab('returned')"
              >
                Đã trả ({{ returnedCount }})
              </button>
            </li>
            <li class="nav-item" role="presentation">
              <button 
                class="nav-link" 
                :class="{ active: activeTab === 'overdue' }"
                @click="setActiveTab('overdue')"
              >
                Quá hạn ({{ overdueCount }})
              </button>
            </li>
          </ul>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p class="mt-2 text-muted">Đang tải danh sách...</p>
      </div>

      <!-- Error -->
      <div v-if="error" class="alert alert-danger" role="alert">
        <i class="bi bi-exclamation-circle me-2"></i>
        {{ error }}
        <button class="btn btn-sm btn-outline-danger ms-2" @click="fetchBorrowings">
          Thử lại
        </button>
      </div>

      <!-- Borrowings List -->
      <div v-if="!loading && filteredBorrowings.length > 0" class="row g-4">
        <div 
          class="col-lg-6" 
          v-for="borrowing in filteredBorrowings" 
          :key="borrowing._id"
        >
          <div class="card h-100">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-start mb-3">
                <h5 class="card-title mb-0">{{ borrowing.sach?.tenSach }}</h5>
                <span 
                  class="badge" 
                  :class="getStatusBadgeClass(borrowing)"
                >
                  {{ getStatusText(borrowing) }}
                </span>
              </div>

              <p class="text-muted mb-2">
                <i class="bi bi-person me-1"></i>
                {{ borrowing.sach?.tacGia }}
              </p>

              <div class="row text-sm mb-3">
                <div class="col-6">
                  <strong>Ngày mượn:</strong><br>
                  <span class="text-muted">{{ formatDate(borrowing.ngayMuon) }}</span>
                </div>
                <div class="col-6">
                  <strong>Hạn trả:</strong><br>
                  <span 
                    class="text-muted"
                    :class="{ 'text-danger': isOverdue(borrowing) }"
                  >
                    {{ formatDate(borrowing.hanTra) }}
                  </span>
                </div>
              </div>

              <div v-if="borrowing.ngayTra" class="row text-sm mb-3">
                <div class="col-6">
                  <strong>Ngày trả:</strong><br>
                  <span class="text-muted">{{ formatDate(borrowing.ngayTra) }}</span>
                </div>
                <div class="col-6" v-if="borrowing.phiPhat">
                  <strong>Phí phạt:</strong><br>
                  <span class="text-danger">{{ formatCurrency(borrowing.phiPhat) }}</span>
                </div>
              </div>

              <div v-if="borrowing.ghiChu" class="mb-3">
                <strong>Ghi chú:</strong>
                <p class="text-muted mb-0">{{ borrowing.ghiChu }}</p>
              </div>

              <div class="d-flex gap-2">
                <router-link 
                  :to="borrowing.sach && borrowing.sach._id ? `/books/${borrowing.sach._id}` : '#'" 
                  class="btn btn-sm btn-outline-info"
                  :disabled="!borrowing.sach || !borrowing.sach._id"
                >
                  <i class="bi bi-eye me-1"></i>
                  Xem sách
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- No Results -->
      <div v-if="!loading && filteredBorrowings.length === 0" class="text-center py-5">
        <i class="bi bi-bookmark display-4 text-muted mb-3"></i>
        <h4 class="text-muted">{{ getEmptyMessage() }}</h4>
        <p class="text-muted">{{ getEmptyDescription() }}</p>
        <router-link v-if="activeTab === 'all'" to="/books" class="btn btn-primary">
          Tìm sách để mượn
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { muonSachService } from '../services/muonsach.service.js'
import { useAuthStore } from '../stores/auth.js'
import { useRouter } from 'vue-router'

export default {
  name: 'MyBorrowings',
  setup() {
    const authStore = useAuthStore()
    const router = useRouter()

    // Chỉ cho phép độc giả truy cập
    if (!authStore.isDocGia) {
      router.replace('/') // hoặc router.push('/'), hoặc trang báo lỗi
      return {}
    }

    const borrowings = ref([])
    const loading = ref(false)
    const error = ref('')
    const requesting = ref(false)
    const activeTab = ref('all')

    const filteredBorrowings = computed(() => {
      switch (activeTab.value) {
        case 'borrowing':
          return borrowings.value.filter(b => !b.ngayTra && !isOverdue(b))
        case 'returned':
          return borrowings.value.filter(b => b.ngayTra)
        case 'overdue':
          return borrowings.value.filter(b => !b.ngayTra && isOverdue(b))
        default:
          return borrowings.value
      }
    })

    const totalCount = computed(() => borrowings.value.length)
    const borrowingCount = computed(() => 
      borrowings.value.filter(b => !b.ngayTra && !isOverdue(b)).length
    )
    const returnedCount = computed(() => 
      borrowings.value.filter(b => b.ngayTra).length
    )
    const overdueCount = computed(() => 
      borrowings.value.filter(b => !b.ngayTra && isOverdue(b)).length
    )

    const fetchBorrowings = async () => {
      if (!authStore.isAuthenticated || !(authStore.user?.id || authStore.user?._id)) {
        error.value = 'Bạn cần đăng nhập để xem danh sách mượn sách'
        return
      }

      loading.value = true
      error.value = ''
      
      try {
        const response = await muonSachService.getMyBorrowings()
        // Backend trả về data trong response.data.data
        const data = response.data.data || response.data
        
        // Transform data để phù hợp với frontend
        borrowings.value = data.map(item => ({
          _id: item._id,
          ngayMuon: item.ngayMuon,
          ngayHenTra: item.ngayHenTra || item.hanTra, // Backend có thể dùng field khác
          ngayTra: item.ngayTra,
          tinhTrang: item.tinhTrang || item.trangThaiMuon, // Sử dụng trangThaiMuon từ backend
          ghiChu: item.ghiChu,
          tienPhat: item.tienPhat,
          soNgayQuaHan: item.soNgayQuaHan,
          sach: item.sach, // Backend trả về sach đã được populate
          hanTra: item.ngayHenTra || item.hanTra
        }))
      } catch (err) {
        error.value = 'Không thể tải danh sách mượn sách'
        console.error('Lỗi khi tải danh sách mượn sách:', err)
      } finally {
        loading.value = false
      }
    }

    const setActiveTab = (tab) => {
      activeTab.value = tab
    }

    const isOverdue = (borrowing) => {
      if (borrowing.ngayTra) return false
      return new Date() > new Date(borrowing.hanTra)
    }

    const getStatusBadgeClass = (borrowing) => {
      if (borrowing.ngayTra) return 'bg-success'
      if (borrowing.tinhTrang === "Chờ trả sách") return 'bg-info'
      if (isOverdue(borrowing)) return 'bg-danger'
      return 'bg-warning'
    }

    const getStatusText = (borrowing) => {
      if (borrowing.ngayTra) return 'Đã trả'
      if (borrowing.tinhTrang === "Chờ trả sách") return 'Chờ trả sách'
      if (isOverdue(borrowing)) return 'Quá hạn'
      return 'Đang mượn'
    }

    const getEmptyMessage = () => {
      switch (activeTab.value) {
        case 'borrowing':
          return 'Không có sách đang mượn'
        case 'returned':
          return 'Chưa trả sách nào'
        case 'overdue':
          return 'Không có sách quá hạn'
        default:
          return 'Chưa mượn sách nào'
      }
    }

    const getEmptyDescription = () => {
      switch (activeTab.value) {
        case 'borrowing':
          return 'Bạn chưa có sách nào đang mượn'
        case 'returned':
          return 'Bạn chưa trả sách nào'
        case 'overdue':
          return 'Tuyệt vời! Không có sách nào quá hạn'
        default:
          return 'Hãy bắt đầu mượn sách từ thư viện'
      }
    }


    const formatDate = (dateString) => {
      if (!dateString) return 'Không xác định'
      return new Date(dateString).toLocaleDateString('vi-VN')
    }

    const formatCurrency = (amount) => {
      return new Intl.NumberFormat('vi-VN', { 
        style: 'currency', 
        currency: 'VND' 
      }).format(amount)
    }

    onMounted(() => {
      fetchBorrowings()
    })

    return {
      borrowings,
      loading,
      error,
      requesting,
      activeTab,
      filteredBorrowings,
      totalCount,
      borrowingCount,
      returnedCount,
      overdueCount,
      fetchBorrowings,
      setActiveTab,
      isOverdue,
      getStatusBadgeClass,
      getStatusText,
      getEmptyMessage,
      getEmptyDescription,
      formatDate,
      formatCurrency
    }
  }
}
</script>

<style scoped>
.my-borrowings {
  background-color: #f8f9fa;
  min-height: 100vh;
}

.nav-pills .nav-link {
  color: #6c757d;
  border-radius: 20px;
  margin-right: 0.5rem;
}

.nav-pills .nav-link.active {
  background-color: #007bff;
  color: white;
}

.card {
  border: none;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
  transition: box-shadow 0.15s ease-in-out;
}

.card:hover {
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
}

.text-sm {
  font-size: 0.875rem;
}
</style>
