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
                :class="{ active: activeTab === 'pending' }"
                @click="setActiveTab('pending')"
              >
                Chờ duyệt ({{ pendingCount }})
              </button>
            </li>
            <li class="nav-item" role="presentation">
              <button 
                class="nav-link" 
                :class="{ active: activeTab === 'approved' }"
                @click="setActiveTab('approved')"
              >
                Đã duyệt ({{ approvedCount }})
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

              <!-- Thông tin ngày tháng dựa theo trạng thái -->
              <div class="row text-sm mb-3">
                <div class="col-6">
                  <strong>Ngày yêu cầu:</strong><br>
                  <span class="text-muted">{{ formatDate(borrowing.ngayYeuCau || borrowing.ngayTao) }}</span>
                </div>
                <div class="col-6" v-if="borrowing.tinhTrang === 'Chờ duyệt'">
                  <strong>Trạng thái:</strong><br>
                  <span class="text-warning">Chờ admin phê duyệt</span>
                </div>
                <div class="col-6" v-else-if="borrowing.tinhTrang === 'Đã duyệt'">
                  <strong>Ngày duyệt:</strong><br>
                  <span class="text-info">{{ formatDate(borrowing.ngayDuyet) }}</span>
                </div>
                <div class="col-6" v-else-if="borrowing.tinhTrang === 'Đang mượn'">
                  <strong>Hạn trả:</strong><br>
                  <span 
                    class="text-muted"
                    :class="{ 'text-danger': isOverdue(borrowing) }"
                  >
                    {{ formatDate(borrowing.ngayHenTra) }}
                  </span>
                </div>
                <div class="col-6" v-else-if="borrowing.tinhTrang === 'Đã trả'">
                  <strong>Ngày trả:</strong><br>
                  <span class="text-success">{{ formatDate(borrowing.ngayTra) }}</span>
                </div>
                <div class="col-6" v-else-if="borrowing.tinhTrang === 'Hủy mượn'">
                  <strong>Ngày hủy:</strong><br>
                  <span class="text-danger">{{ formatDate(borrowing.ngayHuy) }}</span>
                </div>
              </div>

              <!-- Thông tin bổ sung -->
              <div v-if="borrowing.tinhTrang === 'Đang mượn'" class="row text-sm mb-3">
                <div class="col-6">
                  <strong>Ngày mượn:</strong><br>
                  <span class="text-muted">{{ formatDate(borrowing.ngayMuon) }}</span>
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

              <!-- Progress bar cho từng trạng thái -->
              <div class="mb-3">
                <div class="progress" style="height: 4px;">
                  <div 
                    class="progress-bar" 
                    :class="getProgressClass(borrowing)"
                    :style="{ width: getProgressWidth(borrowing) }"
                  ></div>
                </div>
                <div class="d-flex justify-content-between mt-1">
                  <small class="text-muted">Yêu cầu</small>
                  <small class="text-muted">Duyệt</small>
                  <small class="text-muted">Mượn</small>
                  <small class="text-muted">Trả</small>
                </div>
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
                
                <!-- Nút hủy yêu cầu cho trạng thái "Chờ duyệt" -->
                <button 
                  v-if="canCancelRequest(borrowing)"
                  class="btn btn-sm btn-outline-danger"
                  @click="cancelRequest(borrowing)"
                  :disabled="loading"
                >
                  <i class="bi bi-x-circle me-1"></i>
                  <span v-if="loading">Đang hủy...</span>
                  <span v-else>Hủy yêu cầu</span>
                </button>
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

    if (!authStore.isDocGia) {
      router.replace('/')
      return {}
    }

    const borrowings = ref([])
    const loading = ref(false)
    const error = ref('')
    const activeTab = ref('all')

    const filteredBorrowings = computed(() => {
      switch (activeTab.value) {
        case 'pending':
          return borrowings.value.filter(b => b.tinhTrang === 'Chờ duyệt')
        case 'approved':
          return borrowings.value.filter(b => b.tinhTrang === 'Đã duyệt')
        case 'borrowing':
          return borrowings.value.filter(b => b.tinhTrang === 'Đang mượn' && !isOverdue(b))
        case 'returned':
          return borrowings.value.filter(b => b.tinhTrang === 'Đã trả')
        case 'overdue':
          return borrowings.value.filter(b => b.tinhTrang === 'Đang mượn' && isOverdue(b))
        default:
          return borrowings.value
      }
    })

    const totalCount = computed(() => borrowings.value.length)
    const pendingCount = computed(() => 
      borrowings.value.filter(b => b.tinhTrang === 'Chờ duyệt').length
    )
    const approvedCount = computed(() => 
      borrowings.value.filter(b => b.tinhTrang === 'Đã duyệt').length
    )
    const borrowingCount = computed(() => 
      borrowings.value.filter(b => b.tinhTrang === 'Đang mượn' && !isOverdue(b)).length
    )
    const returnedCount = computed(() => 
      borrowings.value.filter(b => b.tinhTrang === 'Đã trả').length
    )
    const overdueCount = computed(() => 
      borrowings.value.filter(b => b.tinhTrang === 'Đang mượn' && isOverdue(b)).length
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
        const data = response.data.data || response.data
        
        // DEBUG LOG
        console.log('📚 Raw borrowings data:', data);
        
        borrowings.value = data.map(item => {
          const mapped = {
            _id: item._id,
            ngayYeuCau: item.ngayYeuCau || item.ngayTao, // Fallback to ngayTao
            ngayDuyet: item.ngayDuyet,
            ngayMuon: item.ngayMuon,
            ngayHenTra: item.ngayHenTra,
            ngayTra: item.ngayTra,
            ngayHuy: item.ngayHuy,
            tinhTrang: item.tinhTrang,
            ghiChu: item.ghiChu,
            tienPhat: item.tienPhat,
            sach: item.sach || item.thongTinSach, // Fallback
            ngayTao: item.ngayTao
          }
          
          // DEBUG LOG cho item đầu tiên
          if (data.indexOf(item) === 0) {
            console.log('📝 Sample mapping:', {
              original: item,
              mapped: mapped
            });
          }
          
          return mapped;
        })
        
        console.log('✅ Final borrowings:', borrowings.value);
        
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
      if (borrowing.tinhTrang !== 'Đang mượn' || borrowing.ngayTra) return false
      if (!borrowing.ngayHenTra) return false
      return new Date() > new Date(borrowing.ngayHenTra)
    }

    const getStatusBadgeClass = (borrowing) => {
      switch(borrowing.tinhTrang) {
        case 'Chờ duyệt': return 'bg-warning text-dark'
        case 'Đã duyệt': return 'bg-info'
        case 'Đang mượn': 
          return isOverdue(borrowing) ? 'bg-danger' : 'bg-primary'
        case 'Đã trả': return 'bg-success'
        case 'Hủy mượn': return 'bg-secondary'
        default: return 'bg-secondary'
      }
    }

    const getStatusText = (borrowing) => {
      if (borrowing.tinhTrang === 'Đang mượn' && isOverdue(borrowing)) {
        return 'Quá hạn'
      }
      return borrowing.tinhTrang
    }

    const getProgressClass = (borrowing) => {
      switch(borrowing.tinhTrang) {
        case 'Chờ duyệt': return 'bg-warning'
        case 'Đã duyệt': return 'bg-info'
        case 'Đang mượn': return isOverdue(borrowing) ? 'bg-danger' : 'bg-primary'
        case 'Đã trả': return 'bg-success'
        case 'Hủy mượn': return 'bg-secondary'
        default: return 'bg-secondary'
      }
    }

    const getProgressWidth = (borrowing) => {
      switch(borrowing.tinhTrang) {
        case 'Chờ duyệt': return '25%'
        case 'Đã duyệt': return '50%'
        case 'Đang mượn': return '75%'
        case 'Đã trả': return '100%'
        case 'Hủy mượn': return '25%'
        default: return '0%'
      }
    }

    const cancelRequest = async (borrowing) => {
      // Kiểm tra điều kiện trước khi hủy
      if (borrowing.tinhTrang !== 'Chờ duyệt') {
        alert('Chỉ có thể hủy yêu cầu khi đang ở trạng thái "Chờ duyệt"')
        return
      }

      if (confirm('Bạn có chắc muốn hủy yêu cầu mượn sách này?\n\nSau khi hủy, bạn sẽ cần gửi yêu cầu mới nếu muốn mượn sách này.')) {
        try {
          loading.value = true // Thêm loading state

          await muonSachService.updateStatus(borrowing._id, {
            tinhTrang: 'Hủy mượn',
            ghiChu: 'Độc giả hủy yêu cầu mượn sách'
          })
          
          await fetchBorrowings()
          alert('Hủy yêu cầu thành công!')
          
        } catch (error) {
          console.error('Lỗi khi hủy yêu cầu:', error)
          
          let errorMessage = 'Có lỗi xảy ra khi hủy yêu cầu'
          
          if (error.response?.data?.message) {
            errorMessage = error.response.data.message
          } else if (error.response?.status === 403) {
            errorMessage = 'Bạn không có quyền thực hiện thao tác này'
          } else if (error.response?.status === 400) {
            errorMessage = 'Không thể hủy yêu cầu ở trạng thái hiện tại'
          }
          
          alert(errorMessage)
          
        } finally {
          loading.value = false
        }
      }
    }

    const canCancelRequest = (borrowing) => {
      return borrowing.tinhTrang === 'Chờ duyệt' && !loading.value
    }

    const getEmptyMessage = () => {
      switch (activeTab.value) {
        case 'pending':
          return 'Không có yêu cầu chờ duyệt'
        case 'approved':
          return 'Không có phiếu đã duyệt'
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
        case 'pending':
          return 'Bạn chưa có yêu cầu mượn sách nào chờ duyệt'
        case 'approved':
          return 'Bạn chưa có phiếu mượn nào được duyệt'
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
      try {
        const date = new Date(dateString)
        if (isNaN(date.getTime())) return 'Không xác định'
        return date.toLocaleDateString('vi-VN')
      } catch (error) {
        return 'Không xác định'
      }
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
      activeTab,
      filteredBorrowings,
      totalCount,
      pendingCount,
      approvedCount,
      borrowingCount,
      returnedCount,
      overdueCount,
      fetchBorrowings,
      setActiveTab,
      isOverdue,
      getStatusBadgeClass,
      getStatusText,
      getProgressClass,
      getProgressWidth,
      cancelRequest,
      canCancelRequest,
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

.progress {
  background-color: #e9ecef;
}
</style>
