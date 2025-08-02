<template>
  <div class="admin-borrowings">
    <div class="container-fluid py-4">
      <!-- Header -->
      <div class="row mb-4">
        <div class="col">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <h1 class="fw-bold">Quản Lý Mượn Trả</h1>
              <p class="text-muted">Theo dõi và quản lý việc mượn trả sách</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="card mb-4">
        <div class="card-body">
          <div class="row g-3">
            <div class="col-md-3">
              <input
                type="text"
                class="form-control"
                placeholder="Tìm theo tên độc giả, sách..."
                v-model="searchKeyword"
                @input="handleSearch"
              >
            </div>
            <div class="col-md-2">
              <select class="form-select" v-model="statusFilter" @change="handleSearch">
                <option value="">Tất cả trạng thái</option>
                <option value="dangmuon">Đang mượn</option>
                <option value="datra">Đã trả</option>
                <option value="quahan">Quá hạn</option>
              </select>
            </div>
            <div class="col-md-2">
              <input type="date" class="form-control" v-model="dateFrom" @change="handleSearch">
            </div>
            <div class="col-md-2">
              <input type="date" class="form-control" v-model="dateTo" @change="handleSearch">
            </div>
            <div class="col-md-3">
              <div class="d-flex gap-2">
                <button class="btn btn-outline-secondary" @click="clearFilters">
                  <i class="bi bi-arrow-clockwise me-1"></i>
                  Reset
                </button>
                <button class="btn btn-outline-primary" @click="exportData">
                  <i class="bi bi-download me-1"></i>
                  Xuất Excel
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Borrowings Table -->
      <div class="card">
        <div class="card-body">
          <div v-if="loading" class="text-center py-4">
            <div class="spinner-border text-primary"></div>
            <p class="mt-2 text-muted">Đang tải dữ liệu...</p>
          </div>

          <div v-else>
            <div class="table-responsive">
              <table class="table table-hover">
                <thead class="table-dark">
                  <tr>
                    <th>ID</th>
                    <th>Mã sách</th>
                    <th>Độc giả</th>
                    <th>Sách</th>
                    <th>Ngày mượn</th>
                    <th>Hạn trả</th>
                    <th>Ngày trả</th>
                    <th>Tiền phạt</th>
                    <th>Ghi chú</th>
                    <th>Nhân viên</th>
                    <th>Trạng thái</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="borrowing in borrowings" :key="borrowing._id">
                    <td>{{ borrowing._id.slice(-6) }}</td>
                    <td>
                      <span class="badge bg-secondary">{{ borrowing.sach?.maSach || 'N/A' }}</span>
                    </td>
                    <td>
                      <strong>{{ borrowing.docGia?.hoTen || borrowing.thongTinDocGia?.hoTen }}</strong><br>
                      <small class="text-muted">{{ borrowing.docGia?.email || borrowing.thongTinDocGia?.email }}</small>
                    </td>
                    <td>
                      <strong>{{ borrowing.sach?.tenSach || borrowing.thongTinSach?.tenSach }}</strong><br>
                      <small class="text-muted">{{ borrowing.sach?.tacGia || borrowing.thongTinSach?.tacGia }}</small>
                    </td>
                    <td>{{ formatDate(borrowing.ngayMuon) }}</td>
                    <td :class="{ 'text-danger': isOverdue(borrowing) }">
                      {{ formatDate(borrowing.hanTra || borrowing.ngayHenTra) }}
                    </td>
                    <td>{{ borrowing.ngayTra ? formatDate(borrowing.ngayTra) : '-' }}</td>
                    <td>
                      <span v-if="borrowing.tienPhat > 0" class="text-danger">
                        {{ formatCurrency(borrowing.tienPhat) }}
                      </span>
                      <span v-else class="text-muted">-</span>
                    </td>
                    <td>
                      <small class="text-muted" :title="borrowing.ghiChu">
                        {{ borrowing.ghiChu ? (borrowing.ghiChu.length > 20 ? borrowing.ghiChu.substring(0, 20) + '...' : borrowing.ghiChu) : '-' }}
                      </small>
                    </td>
                    <td>
                      <small class="text-muted">
                        {{ borrowing.nhanVien?.hoTenNV || borrowing.thongTinNhanVien?.hoTenNV || 'Tự động' }}
                      </small>
                    </td>
                    <td>
                      <span class="badge" :class="getStatusBadgeClass(borrowing)">
                        {{ getStatusText(borrowing) }}
                      </span>
                    </td>
                    <td>
                      <div class="btn-group btn-group-sm">
                        <button 
                          v-if="!borrowing.ngayTra"
                          class="btn btn-outline-success"
                          @click="returnBook(borrowing)"
                          title="Xác nhận trả sách"
                        >
                          <i class="bi bi-check-circle"></i>
                        </button>
                        <button 
                          class="btn btn-outline-info"
                          @click="viewDetails(borrowing)"
                          title="Xem chi tiết"
                        >
                          <i class="bi bi-eye"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Pagination -->
            <nav v-if="totalPages > 1">
              <ul class="pagination justify-content-center">
                <li class="page-item" :class="{ disabled: currentPage <= 1 }">
                  <button class="page-link" @click="changePage(currentPage - 1)">Trước</button>
                </li>
                <li 
                  v-for="page in visiblePages" 
                  :key="page"
                  class="page-item" 
                  :class="{ active: page === currentPage }"
                >
                  <button class="page-link" @click="changePage(page)">{{ page }}</button>
                </li>
                <li class="page-item" :class="{ disabled: currentPage >= totalPages }">
                  <button class="page-link" @click="changePage(currentPage + 1)">Sau</button>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </div>

    <!-- Create Borrowing Modal -->
    <div class="modal fade" :class="{ show: showAddModal }" :style="{ display: showAddModal ? 'block' : 'none' }">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Tạo Phiếu Mượn Mới</h5>
            <button type="button" class="btn-close" @click="closeModal"></button>
          </div>
          <form @submit.prevent="createBorrowing">
            <div class="modal-body">
              <div class="mb-3">
                <label class="form-label">Độc giả *</label>
                <select class="form-select" v-model="borrowingForm.docGiaId" required>
                  <option value="">Chọn độc giả</option>
                  <option v-for="reader in readers" :key="reader._id" :value="reader._id">
                    {{ reader.hoTen }} - {{ reader.email }}
                  </option>
                </select>
              </div>
              <div class="mb-3">
                <label class="form-label">Sách *</label>
                <select class="form-select" v-model="borrowingForm.sachId" required>
                  <option value="">Chọn sách</option>
                  <option v-for="book in availableBooks" :key="book._id" :value="book._id">
                    {{ book.tenSach }} - {{ book.tacGia }} (Còn: {{ book.soQuyen }})
                  </option>
                </select>
              </div>
              <div class="mb-3">
                <label class="form-label">Hạn trả</label>
                <input type="date" class="form-control" v-model="borrowingForm.hanTra" required>
              </div>
              <div class="mb-3">
                <label class="form-label">Ghi chú</label>
                <textarea class="form-control" v-model="borrowingForm.ghiChu" rows="2"></textarea>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" @click="closeModal">Hủy</button>
              <button type="submit" class="btn btn-primary" :disabled="saving">
                <span v-if="saving" class="spinner-border spinner-border-sm me-2"></span>
                {{ saving ? 'Đang tạo...' : 'Tạo phiếu mượn' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue'
import { muonSachService } from '../../services/muonsach.service.js'

export default {
  name: 'AdminBorrowings',
  setup() {
    const borrowings = ref([])
    const readers = ref([])
    const availableBooks = ref([])
    const loading = ref(false)
    const saving = ref(false)
    const showAddModal = ref(false)
    
    const searchKeyword = ref('')
    const statusFilter = ref('')
    const dateFrom = ref('')
    const dateTo = ref('')
    const currentPage = ref(1)
    const totalPages = ref(1)

    const borrowingForm = reactive({
      docGiaId: '',
      sachId: '',
      hanTra: '',
      ghiChu: ''
    })

    const visiblePages = computed(() => {
      const current = currentPage.value
      const total = totalPages.value
      const delta = 2
      
      let start = Math.max(1, current - delta)
      let end = Math.min(total, current + delta)
      
      const pages = []
      for (let i = start; i <= end; i++) {
        pages.push(i)
      }
      return pages
    })

    const isOverdue = (borrowing) => {
      if (borrowing.ngayTra) return false
      return new Date() > new Date(borrowing.hanTra)
    }

    const getStatusBadgeClass = (borrowing) => {
      if (borrowing.ngayTra) return 'bg-success'
      if (isOverdue(borrowing)) return 'bg-danger'
      return 'bg-warning'
    }

    const getStatusText = (borrowing) => {
      if (borrowing.ngayTra) return 'Đã trả'
      if (isOverdue(borrowing)) return 'Quá hạn'
      return 'Đang mượn'
    }

    const formatDate = (dateString) => {
      if (!dateString) return ''
      return new Date(dateString).toLocaleDateString('vi-VN')
    }

    const formatCurrency = (amount) => {
      if (!amount) return '0 ₫'
      return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
      }).format(amount)
    }

    const fetchBorrowings = async () => {
      loading.value = true
      try {
        const params = {
          page: currentPage.value,
          limit: 10
        }
        
        if (searchKeyword.value) params.search = searchKeyword.value
        if (statusFilter.value) params.status = statusFilter.value
        if (dateFrom.value) params.dateFrom = dateFrom.value
        if (dateTo.value) params.dateTo = dateTo.value
        
        const response = await muonSachService.getAll(params)
        borrowings.value = response.data.data || response.data
        
      } catch (error) {
        console.error('Lỗi khi tải danh sách mượn sách:', error)
      } finally {
        loading.value = false
      }
    }

    const handleSearch = () => {
      currentPage.value = 1
      fetchBorrowings()
    }

    const clearFilters = () => {
      searchKeyword.value = ''
      statusFilter.value = ''
      dateFrom.value = ''
      dateTo.value = ''
      fetchBorrowings()
    }

    const changePage = (page) => {
      if (page >= 1 && page <= totalPages.value) {
        currentPage.value = page
        fetchBorrowings()
      }
    }

    const returnBook = async (borrowing) => {
      if (confirm('Xác nhận trả sách?')) {
        try {
          await muonSachService.returnBook(borrowing._id, {
            ngayTra: new Date().toISOString()
          })
          fetchBorrowings()
        } catch (error) {
          alert('Có lỗi xảy ra khi trả sách')
        }
      }
    }

    const viewDetails = (borrowing) => {
      // TODO: Show borrowing details modal
      console.log('View details:', borrowing)
    }

    const closeModal = () => {
      showAddModal.value = false
      Object.assign(borrowingForm, {
        docGiaId: '',
        sachId: '',
        hanTra: '',
        ghiChu: ''
      })
    }

    const createBorrowing = async () => {
      saving.value = true
      try {
        await muonSachService.create(borrowingForm)
        closeModal()
        fetchBorrowings()
      } catch (error) {
        alert('Có lỗi xảy ra khi tạo phiếu mượn')
      } finally {
        saving.value = false
      }
    }

    const exportData = () => {
      // TODO: Implement export functionality
      alert('Tính năng xuất Excel đang được phát triển')
    }

    onMounted(() => {
      fetchBorrowings()
      // Set default return date to 2 weeks from now
      const defaultReturnDate = new Date()
      defaultReturnDate.setDate(defaultReturnDate.getDate() + 14)
      borrowingForm.hanTra = defaultReturnDate.toISOString().split('T')[0]
    })

    return {
      borrowings,
      readers,
      availableBooks,
      loading,
      saving,
      showAddModal,
      searchKeyword,
      statusFilter,
      dateFrom,
      dateTo,
      currentPage,
      totalPages,
      borrowingForm,
      visiblePages,
      isOverdue,
      getStatusBadgeClass,
      getStatusText,
      formatDate,
      formatCurrency,
      handleSearch,
      clearFilters,
      changePage,
      returnBook,
      viewDetails,
      closeModal,
      createBorrowing,
      exportData
    }
  }
}
</script>

<style scoped>
.admin-borrowings {
  background-color: #f8f9fa;
  min-height: 100vh;
}

.modal.show {
  display: block !important;
}

.modal {
  background-color: rgba(0, 0, 0, 0.5);
}
</style>
