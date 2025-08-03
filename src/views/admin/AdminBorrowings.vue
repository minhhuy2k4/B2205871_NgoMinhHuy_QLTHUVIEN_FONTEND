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
            <div class="col-md-6">
              <input
                type="text"
                class="form-control"
                placeholder="Tìm theo tên độc giả, sách..."
                v-model="searchKeyword"
                @input="handleSearch"
              >
            </div>
            <div class="col-md-3">
              <select class="form-select" v-model="statusFilter" @change="handleSearch">
                <option value="">Tất cả trạng thái</option>
                <option value="Chờ duyệt">Chờ duyệt</option>
                <option value="Đã duyệt">Đã duyệt</option>
                <option value="Đang mượn">Đang mượn</option>
                <option value="Đã trả">Đã trả</option>
                <option value="Hủy mượn">Hủy mượn</option>
              </select>
            </div>
            <div class="col-md-3">
              <div class="d-flex gap-2">
                <button class="btn btn-outline-secondary" @click="clearFilters">
                  <i class="bi bi-arrow-clockwise me-1"></i>
                  Reset
                </button>
                <button class="btn btn-primary" @click="handleSearch">
                  <i class="bi bi-search me-1"></i>
                  Tìm kiếm
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="row mb-4">
        <div class="col-md-3">
          <div class="card bg-warning text-dark">
            <div class="card-body">
              <div class="d-flex align-items-center">
                <i class="bi bi-clock-history display-6 me-3"></i>
                <div>
                  <h5 class="card-title mb-0">{{ stats.pending }}</h5>
                  <small>Chờ duyệt</small>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card bg-info text-white">
            <div class="card-body">
              <div class="d-flex align-items-center">
                <i class="bi bi-check-circle display-6 me-3"></i>
                <div>
                  <h5 class="card-title mb-0">{{ stats.approved }}</h5>
                  <small>Đã duyệt</small>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card bg-primary text-white">
            <div class="card-body">
              <div class="d-flex align-items-center">
                <i class="bi bi-book display-6 me-3"></i>
                <div>
                  <h5 class="card-title mb-0">{{ stats.borrowing }}</h5>
                  <small>Đang mượn</small>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card bg-success text-white">
            <div class="card-body">
              <div class="d-flex align-items-center">
                <i class="bi bi-bookmark-check display-6 me-3"></i>
                <div>
                  <h5 class="card-title mb-0">{{ stats.returned }}</h5>
                  <small>Đã trả</small>
                </div>
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
                    <th>Ngày yêu cầu</th>
                    <th>Ngày mượn</th>
                    <th>Hạn trả</th>
                    <th>Ngày trả</th>
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
                      <small class="text-muted">{{ borrowing.sach?.tacGia || borrowing.thongTinSach?.tacGia }}</small><br>
                      <small class="text-info">Mã NXB: {{ borrowing.sach?.maNXB || borrowing.thongTinSach?.maNXB || 'N/A' }}</small>
                    </td>
                    <td>{{ formatDate(borrowing.ngayYeuCau || borrowing.ngayTao) }}</td>
                    <td>{{ borrowing.ngayMuon ? formatDate(borrowing.ngayMuon) : '-' }}</td>
                    <td>
                      <span v-if="borrowing.ngayHenTra" :class="{ 'text-danger': isOverdue(borrowing) }">
                        {{ formatDate(borrowing.ngayHenTra) }}
                      </span>
                      <span v-else>-</span>
                    </td>
                    <td>{{ borrowing.ngayTra ? formatDate(borrowing.ngayTra) : '-' }}</td>
                    <td>
                      <small class="text-muted">
                        {{ borrowing.nhanVien?.hoTenNV || borrowing.thongTinNhanVien?.hoTenNV || '-' }}
                      </small>
                    </td>
                    <td>
                      <select 
                        class="form-select form-select-sm"
                        :value="borrowing.tinhTrang"
                        @change="updateBorrowingStatus(borrowing, $event.target.value)"
                        :disabled="loading"
                      >
                        <option :value="borrowing.tinhTrang">{{ borrowing.tinhTrang }}</option>
                        <option 
                          v-for="status in getValidStatusesForBorrowing(borrowing)"
                          :key="status"
                          :value="status"
                        >
                          {{ status }}
                        </option>
                      </select>
                      
                      <small class="text-muted d-block mt-1">
                        {{ getStatusDescription(borrowing) }}
                      </small>
                    </td>
                    <td>
                      <div class="btn-group btn-group-sm">
                        <button 
                          class="btn btn-outline-info"
                          @click="viewDetails(borrowing)"
                          title="Xem chi tiết"
                        >
                          <i class="bi bi-eye"></i>
                        </button>
                        
                        <button 
                          v-if="['Đã trả', 'Hủy mượn'].includes(borrowing.tinhTrang)"
                          class="btn btn-outline-danger"
                          @click="deleteBorrowing(borrowing)"
                          title="Xóa phiếu"
                        >
                          <i class="bi bi-trash"></i>
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

    <!-- Detail Modal -->
    <div class="modal fade" :class="{ show: showDetailModal }" :style="{ display: showDetailModal ? 'block' : 'none' }" tabindex="-1">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="bi bi-info-circle me-2"></i>
              Chi Tiết Phiếu Mượn
            </h5>
            <button type="button" class="btn-close" @click="closeDetailModal"></button>
          </div>
          <div class="modal-body" v-if="selectedBorrowing">
            <div class="row">
              <!-- Thông tin phiếu mượn -->
              <div class="col-md-6">
                <div class="card mb-3">
                  <div class="card-header">
                    <h6 class="mb-0"><i class="bi bi-file-text me-2"></i>Thông tin phiếu</h6>
                  </div>
                  <div class="card-body">
                    <table class="table table-sm table-borderless">
                      <tr>
                        <td class="fw-bold">Mã phiếu:</td>
                        <td>{{ selectedBorrowing._id }}</td>
                      </tr>
                      <tr>
                        <td class="fw-bold">Ngày yêu cầu:</td>
                        <td>{{ formatDateTime(selectedBorrowing.ngayYeuCau || selectedBorrowing.ngayTao) }}</td>
                      </tr>
                      <tr v-if="selectedBorrowing.ngayDuyet">
                        <td class="fw-bold">Ngày duyệt:</td>
                        <td>{{ formatDateTime(selectedBorrowing.ngayDuyet) }}</td>
                      </tr>
                      <tr v-if="selectedBorrowing.ngayMuon">
                        <td class="fw-bold">Ngày mượn:</td>
                        <td>{{ formatDateTime(selectedBorrowing.ngayMuon) }}</td>
                      </tr>
                      <tr v-if="selectedBorrowing.ngayHenTra">
                        <td class="fw-bold">Hạn trả:</td>
                        <td>{{ formatDate(selectedBorrowing.ngayHenTra) }}</td>
                      </tr>
                      <tr v-if="selectedBorrowing.ngayTra">
                        <td class="fw-bold">Ngày trả:</td>
                        <td>{{ formatDateTime(selectedBorrowing.ngayTra) }}</td>
                      </tr>
                      <tr>
                        <td class="fw-bold">Trạng thái:</td>
                        <td>
                          <span class="badge" :class="getDetailedStatusClass(selectedBorrowing)">
                            {{ selectedBorrowing.tinhTrang }}
                          </span>
                        </td>
                      </tr>
                      <tr v-if="selectedBorrowing.ghiChu">
                        <td class="fw-bold">Ghi chú:</td>
                        <td>{{ selectedBorrowing.ghiChu }}</td>
                      </tr>
                    </table>
                  </div>
                </div>
              </div>

              <!-- Thông tin độc giả -->
              <div class="col-md-6">
                <div class="card mb-3">
                  <div class="card-header">
                    <h6 class="mb-0"><i class="bi bi-person me-2"></i>Thông tin độc giả</h6>
                  </div>
                  <div class="card-body">
                    <table class="table table-sm table-borderless">
                      <tr>
                        <td class="fw-bold">Họ tên:</td>
                        <td>{{ selectedBorrowing.docGia?.hoTen || selectedBorrowing.thongTinDocGia?.hoTen }}</td>
                      </tr>
                      <tr>
                        <td class="fw-bold">Email:</td>
                        <td>{{ selectedBorrowing.docGia?.email || selectedBorrowing.thongTinDocGia?.email }}</td>
                      </tr>
                      <tr>
                        <td class="fw-bold">Điện thoại:</td>
                        <td>{{ selectedBorrowing.docGia?.soDienThoai || selectedBorrowing.thongTinDocGia?.dienThoai || 'Chưa có' }}</td>
                      </tr>
                      <tr>
                        <td class="fw-bold">Địa chỉ:</td>
                        <td>{{ selectedBorrowing.docGia?.diaChi || selectedBorrowing.thongTinDocGia?.diaChi || 'Chưa có' }}</td>
                      </tr>
                    </table>
                  </div>
                </div>
              </div>

              <!-- Thông tin sách -->
              <div class="col-12">
                <div class="card mb-3">
                  <div class="card-header">
                    <h6 class="mb-0"><i class="bi bi-book me-2"></i>Thông tin sách</h6>
                  </div>
                  <div class="card-body">
                    <div class="row">
                      <div class="col-md-6">
                        <table class="table table-sm table-borderless">
                          <tr>
                            <td class="fw-bold">Mã sách:</td>
                            <td>{{ selectedBorrowing.sach?.maSach || selectedBorrowing.thongTinSach?.maSach }}</td>
                          </tr>
                          <tr>
                            <td class="fw-bold">Tên sách:</td>
                            <td>{{ selectedBorrowing.sach?.tenSach || selectedBorrowing.thongTinSach?.tenSach }}</td>
                          </tr>
                          <tr>
                            <td class="fw-bold">Tác giả:</td>
                            <td>{{ selectedBorrowing.sach?.tacGia || selectedBorrowing.thongTinSach?.tacGia }}</td>
                          </tr>
                        </table>
                      </div>
                      <div class="col-md-6">
                        <table class="table table-sm table-borderless">
                          <tr>
                            <td class="fw-bold">NXB:</td>
                            <td>{{ selectedBorrowing.sach?.maNXB || selectedBorrowing.thongTinSach?.maNXB || 'N/A' }}</td>
                          </tr>
                          <tr>
                            <td class="fw-bold">Năm xuất bản:</td>
                            <td>{{ selectedBorrowing.sach?.namXuatBan || selectedBorrowing.thongTinSach?.namXuatBan }}</td>
                          </tr>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Thông tin nhân viên -->
              <div class="col-12" v-if="selectedBorrowing.nhanVien || selectedBorrowing.thongTinNhanVien">
                <div class="card">
                  <div class="card-header">
                    <h6 class="mb-0"><i class="bi bi-person-badge me-2"></i>Nhân viên xử lý</h6>
                  </div>
                  <div class="card-body">
                    <table class="table table-sm table-borderless">
                      <tr>
                        <td class="fw-bold">Họ tên:</td>
                        <td>{{ selectedBorrowing.nhanVien?.hoTenNV || selectedBorrowing.thongTinNhanVien?.hoTenNV }}</td>
                      </tr>
                      <tr>
                        <td class="fw-bold">Chức vụ:</td>
                        <td>{{ selectedBorrowing.nhanVien?.chucVu || selectedBorrowing.thongTinNhanVien?.chucVu || 'Nhân viên' }}</td>
                      </tr>
                      <tr>
                        <td class="fw-bold">SDT:</td>
                        <td>{{ selectedBorrowing.nhanVien?.soDienThoai || selectedBorrowing.thongTinNhanVien?.soDienThoai }}</td>
                      </tr>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeDetailModal">Đóng</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal backdrop -->
    <div v-if="showDetailModal" class="modal-backdrop fade show"></div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import { muonSachService } from '../../services/muonsach.service.js'

export default {
  name: 'AdminBorrowings',
  setup() {
    const borrowings = ref([])
    const loading = ref(false)
    const showDetailModal = ref(false)
    const selectedBorrowing = ref(null)
    
    const searchKeyword = ref('')
    const statusFilter = ref('')
    const currentPage = ref(1)
    const totalPages = ref(1)
    const searchTimeout = ref(null)

    // Stats
    const stats = computed(() => {
      return {
        pending: borrowings.value.filter(b => b.tinhTrang === 'Chờ duyệt').length,
        approved: borrowings.value.filter(b => b.tinhTrang === 'Đã duyệt').length,
        borrowing: borrowings.value.filter(b => b.tinhTrang === 'Đang mượn').length,
        returned: borrowings.value.filter(b => b.tinhTrang === 'Đã trả').length,
      }
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

    // Danh sách trạng thái hợp lệ cho mỗi trạng thái hiện tại
    const statusTransitions = {
      "Chờ duyệt": ["Đã duyệt", "Hủy mượn"],
      "Đã duyệt": ["Đang mượn", "Hủy mượn"],
      "Đang mượn": ["Đã trả"],
      "Đã trả": [],
      "Hủy mượn": []
    }

    const getValidStatusesForBorrowing = (borrowing) => {
      return statusTransitions[borrowing.tinhTrang] || []
    }

    const getDetailedStatusClass = (borrowing) => {
      switch(borrowing.tinhTrang) {
        case 'Chờ duyệt': return 'bg-warning text-dark'
        case 'Đã duyệt': return 'bg-info'
        case 'Đang mượn': return 'bg-primary'
        case 'Đã trả': return 'bg-success'
        case 'Hủy mượn': return 'bg-danger'
        default: return 'bg-secondary'
      }
    }

    const getStatusDescription = (borrowing) => {
      switch(borrowing.tinhTrang) {
        case 'Chờ duyệt': 
          return borrowing.ngayYeuCau ? formatDateTime(borrowing.ngayYeuCau) : 'Chờ xử lý'
        case 'Đã duyệt': 
          return borrowing.ngayDuyet ? `Duyệt: ${formatDateTime(borrowing.ngayDuyet)}` : 'Đã phê duyệt'
        case 'Đang mượn': 
          return borrowing.ngayHenTra ? `Hạn: ${formatDate(borrowing.ngayHenTra)}` : 'Đang mượn'
        case 'Đã trả': 
          return borrowing.ngayTra ? `Trả: ${formatDateTime(borrowing.ngayTra)}` : 'Đã trả'
        case 'Hủy mượn': 
          return borrowing.ngayHuy ? `Hủy: ${formatDateTime(borrowing.ngayHuy)}` : 'Đã hủy'
        default: return ''
      }
    }

    const isOverdue = (borrowing) => {
      if (borrowing.ngayTra || borrowing.tinhTrang !== 'Đang mượn') return false
      if (!borrowing.ngayHenTra) return false
      return new Date() > new Date(borrowing.ngayHenTra)
    }

    const fetchBorrowings = async () => {
      loading.value = true
      try {
        const params = {
          page: currentPage.value,
          limit: 10
        }
        
        // Thêm search parameter
        if (searchKeyword.value && searchKeyword.value.trim()) {
          params.search = searchKeyword.value.trim()
        }
        
        if (statusFilter.value) {
          params.status = statusFilter.value
        }
        
        console.log('🔍 Fetching with params:', params)
        
        const response = await muonSachService.getAll(params)
        console.log('📥 Response:', response.data)
        
        borrowings.value = response.data.data || response.data
        totalPages.value = response.data.pagination?.totalPages || response.data.totalPages || 1
        
      } catch (error) {
        console.error('❌ Lỗi khi tải danh sách mượn sách:', error)
        borrowings.value = []
        totalPages.value = 1
      } finally {
        loading.value = false
      }
    }

    // Debounced search function
    const debouncedSearch = () => {
      if (searchTimeout.value) {
        clearTimeout(searchTimeout.value)
      }
      
      searchTimeout.value = setTimeout(() => {
        currentPage.value = 1
        fetchBorrowings()
      }, 500) // Delay 500ms
    }

    const handleSearch = () => {
      debouncedSearch()
    }

    const handleInstantSearch = () => {
      currentPage.value = 1
      fetchBorrowings()
    }

    const clearFilters = () => {
      searchKeyword.value = ''
      statusFilter.value = ''
      currentPage.value = 1
      fetchBorrowings()
    }

    const changePage = (page) => {
      if (page >= 1 && page <= totalPages.value) {
        currentPage.value = page
        fetchBorrowings()
      }
    }

    const updateBorrowingStatus = async (borrowing, newStatus) => {
      if (newStatus === borrowing.tinhTrang) return

      let confirmMessage = `Chuyển trạng thái từ "${borrowing.tinhTrang}" sang "${newStatus}"?`
      let ghiChu = ''

      if (newStatus === 'Hủy mượn') {
        ghiChu = prompt('Lý do hủy mượn:') || 'Hủy theo yêu cầu'
        if (!ghiChu.trim()) return
        confirmMessage += `\nLý do: ${ghiChu}`
      }

      if (!confirm(confirmMessage)) return

      try {
        loading.value = true
        
        await muonSachService.updateStatus(borrowing._id, {
          tinhTrang: newStatus,
          ghiChu
        })

        await fetchBorrowings()
        alert(`Cập nhật trạng thái thành công!`)

      } catch (error) {
        console.error('Lỗi cập nhật trạng thái:', error)
        
        let errorMessage = 'Có lỗi xảy ra khi cập nhật trạng thái'
        if (error.response?.data?.message) {
          errorMessage = error.response.data.message
        }
        
        alert(errorMessage)
        await fetchBorrowings()
        
      } finally {
        loading.value = false
      }
    }

    const deleteBorrowing = async (borrowing) => {
      if (confirm(`Bạn có chắc muốn xóa phiếu mượn này?\n\nĐộc giả: ${borrowing.docGia?.hoTen || borrowing.thongTinDocGia?.hoTen}\nSách: ${borrowing.sach?.tenSach || borrowing.thongTinSach?.tenSach}`)) {
        try {
          await muonSachService.delete(borrowing._id)
          fetchBorrowings()
          alert('Xóa phiếu mượn thành công!')
        } catch (error) {
          console.error('Lỗi khi xóa phiếu mượn:', error)
          alert('Có lỗi xảy ra khi xóa phiếu mượn')
        }
      }
    }

    const viewDetails = (borrowing) => {
      selectedBorrowing.value = borrowing
      showDetailModal.value = true
    }

    const closeDetailModal = () => {
      showDetailModal.value = false
      selectedBorrowing.value = null
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

    const formatDateTime = (dateString) => {
      if (!dateString) return 'Không xác định'
      try {
        const date = new Date(dateString)
        if (isNaN(date.getTime())) return 'Không xác định'
        return date.toLocaleString('vi-VN')
      } catch (error) {
        return 'Không xác định'
      }
    }

    // Watch cho auto search
    watch(searchKeyword, () => {
      debouncedSearch()
    })

    onMounted(() => {
      fetchBorrowings()
    })

    return {
      borrowings,
      loading,
      showDetailModal,
      selectedBorrowing,
      searchKeyword,
      statusFilter,
      currentPage,
      totalPages,
      stats,
      visiblePages,
      getValidStatusesForBorrowing,
      getDetailedStatusClass,
      getStatusDescription,
      isOverdue,
      updateBorrowingStatus,
      formatDate,
      formatDateTime,
      handleSearch,
      handleInstantSearch,
      clearFilters,
      changePage,
      deleteBorrowing,
      viewDetails,
      closeDetailModal,
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

.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1040;
  width: 100vw;
  height: 100vh;
  background-color: #000;
  opacity: 0.5;
}

.table-borderless td {
  border: none !important;
  padding: 0.25rem 0.5rem;
}

.card-header h6 {
  color: #495057;
}

.form-select-sm {
  font-size: 0.875rem;
  min-width: 120px;
}

.text-muted {
  font-size: 0.75rem;
}

/* Filter improvements */
.card .card-body .row.g-3 {
  align-items: center;
}

.btn-group {
  flex-wrap: nowrap;
}

/* Table improvements */
.table th {
  font-weight: 600;
  font-size: 0.875rem;
}

.table td {
  vertical-align: middle;
  font-size: 0.875rem;
}

.badge {
  font-size: 0.75rem;
}

/* Responsive */
@media (max-width: 768px) {
  .d-flex.gap-2 {
    flex-direction: column;
    gap: 0.5rem !important;
  }
  
  .btn-group {
    flex-direction: column;
  }
  
  .table-responsive {
    font-size: 0.8rem;
  }
}
</style>
