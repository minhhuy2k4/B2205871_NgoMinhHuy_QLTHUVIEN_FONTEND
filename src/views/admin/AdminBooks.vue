<template>
  <div class="admin-books">
    <div class="container-fluid py-4">
      <!-- Header -->
      <div class="row mb-4">
        <div class="col">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <h1 class="fw-bold">Quản Lý Sách</h1>
              <p class="text-muted">Thêm, sửa, xóa sách trong hệ thống</p>
            </div>
            <router-link to="/admin/add-book" class="btn btn-primary">
              <i class="bi bi-plus-circle me-2"></i>
              Thêm sách mới
            </router-link>
          </div>
        </div>
      </div>

      <!-- Search and Filters -->
      <div class="card mb-4">
        <div class="card-body">
          <div class="row g-3">
            <div class="col-md-4">
              <input
                type="text"
                class="form-control"
                placeholder="Tìm kiếm sách..."
                v-model="searchKeyword"
                @input="handleSearch"
              >
            </div>
            <div class="col-md-4">
              <select class="form-select" v-model="sortBy" @change="handleSearch">
                <option value="">Sắp xếp theo</option>
                <option value="tenSach">Tên sách A-Z</option>
                <option value="-tenSach">Tên sách Z-A</option>
                <option value="namXuatBan">Năm xuất bản</option>
              </select>
            </div>
            <div class="col-md-2">
              <button class="btn btn-outline-secondary w-100" @click="clearFilters">
                <i class="bi bi-arrow-clockwise me-1"></i>
                Reset
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Books Table -->
      <div class="card">
        <div class="card-body">
          <div v-if="sachStore.loading" class="text-center py-4">
            <div class="spinner-border text-primary" role="status"></div>
            <p class="mt-2 text-muted">Đang tải dữ liệu...</p>
          </div>

          <div v-else-if="sachStore.error" class="alert alert-danger">
            <i class="bi bi-exclamation-circle me-2"></i>
            {{ sachStore.error }}
          </div>

          <div v-else>
            <div class="table-responsive">
              <table class="table table-hover">
                <thead class="table-dark">
                  <tr>
                    <th>Mã sách</th>
                    <th>Tên sách</th>
                    <th>Tác giả</th>
                    <th>Nhà xuất bản</th> <!-- Thêm dòng này -->
                    <th>Năm XB</th>
                    <th>Đơn giá</th>
                    <th>Số lượng</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="sachStore.books.length === 0">
                    <td colspan="8" class="text-center text-muted">Không có sách nào</td>
                  </tr>
                  <tr v-for="book in sachStore.books" :key="book._id">
                    <td>{{ book.maSach }}</td>
                    <td>
                      <strong>{{ book.tenSach }}</strong>
                    </td>
                    <td>{{ book.tacGia }}</td>
                    <td>{{ book.nhaXuatBan?.tenNXB || 'Chưa xác định' }}</td> <!-- Thêm dòng này -->
                    <td>{{ book.namXuatBan }}</td>
                    <td class="text-success fw-bold">{{ formatCurrency(book.donGia) }}</td>
                    <td>
                      <span class="badge" :class="getStockBadgeClass(book.soQuyen)">
                        {{ book.soQuyen }}
                      </span>
                    </td>
                    <td>
                      <div class="btn-group btn-group-sm">
                        <button class="btn btn-outline-primary" @click="editBook(book)">
                          <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-outline-danger" @click="deleteBook(book._id)">
                          <i class="bi bi-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Pagination -->
            <nav v-if="sachStore.pagination.totalPages > 1">
              <ul class="pagination justify-content-center">
                <li class="page-item" :class="{ disabled: sachStore.pagination.page <= 1 }">
                  <button class="page-link" @click="changePage(sachStore.pagination.page - 1)">
                    Trước
                  </button>
                </li>
                <li 
                  v-for="page in visiblePages" 
                  :key="page"
                  class="page-item" 
                  :class="{ active: page === sachStore.pagination.page }"
                >
                  <button class="page-link" @click="changePage(page)">
                    {{ page }}
                  </button>
                </li>
                <li class="page-item" :class="{ disabled: sachStore.pagination.page >= sachStore.pagination.totalPages }">
                  <button class="page-link" @click="changePage(sachStore.pagination.page + 1)">
                    Sau
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </div>

    <!-- Add/Edit Modal -->
    <div class="modal fade" tabindex="-1" :class="{ show: showAddModal || showEditModal }" :style="{ display: showAddModal || showEditModal ? 'block' : 'none' }">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              {{ isEditing ? 'Chỉnh sửa sách' : 'Thêm sách mới' }}
            </h5>
            <button type="button" class="btn-close" @click="closeModal"></button>
          </div>
          <form @submit.prevent="saveBook">
            <div class="modal-body">
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="form-label">Tên sách *</label>
                  <input type="text" class="form-control" v-model="bookForm.tenSach" required>
                </div>
                <div class="col-md-6 mb-3">
                  <label class="form-label">Tác giả *</label>
                  <input type="text" class="form-control" v-model="bookForm.tacGia" required>
                </div>
              </div>
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="form-label">Nhà xuất bản</label>
                  <select class="form-select" v-model="bookForm.maNXB">
                    <option value="">Chọn nhà xuất bản</option>
                    <option 
                      v-for="publisher in publishers" 
                      :key="publisher._id" 
                      :value="publisher.maNXB"
                    >
                      {{ publisher.tenNXB }} ({{ publisher.maNXB }})
                    </option>
                  </select>
                </div>
              </div>
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="form-label">Năm xuất bản</label>
                  <input type="number" class="form-control" v-model="bookForm.namXuatBan" min="1900" :max="currentYear">
                </div>
              </div>
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="form-label">Đơn giá (VNĐ)</label>
                  <input type="number" class="form-control" v-model="bookForm.donGia" min="0" step="1000">
                </div>
                <div class="col-md-6 mb-3">
                  <label class="form-label">Số lượng</label>
                  <input type="number" class="form-control" v-model="bookForm.soQuyen" min="1">
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" @click="closeModal">Hủy</button>
              <button type="submit" class="btn btn-primary" :disabled="saving">
                <span v-if="saving" class="spinner-border spinner-border-sm me-2"></span>
                {{ saving ? 'Đang lưu...' : 'Lưu' }}
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
import { useSachStore } from '../../stores/sach.js'
import { publisherService } from '../../services/publisher.service.js'

export default {
  name: 'AdminBooks',
  setup() {
    const sachStore = useSachStore()
    
    const searchKeyword = ref('')
    const sortBy = ref('')
    const showAddModal = ref(false)
    const showEditModal = ref(false)
    const saving = ref(false)
    const currentEditId = ref(null)
    const publishers = ref([])
    
    const bookForm = reactive({
      tenSach: '',
      tacGia: '',
      maNXB: '',
      namXuatBan: new Date().getFullYear(),
      soQuyen: 1,
      donGia: 0
    })

    const isEditing = computed(() => !!currentEditId.value)
    const currentYear = computed(() => new Date().getFullYear())

    const visiblePages = computed(() => {
      const current = sachStore.pagination.page
      const total = sachStore.pagination.totalPages
      const delta = 2
      
      let start = Math.max(1, current - delta)
      let end = Math.min(total, current + delta)
      
      const pages = []
      for (let i = start; i <= end; i++) {
        pages.push(i)
      }
      return pages
    })

    const getStockBadgeClass = (stock) => {
      if (stock <= 0) return 'bg-danger'
      if (stock <= 5) return 'bg-warning'
      return 'bg-success'
    }

    const formatCurrency = (amount) => {
      return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
      }).format(amount || 0)
    }

    const handleSearch = () => {
      const params = {}
      if (searchKeyword.value) params.search = searchKeyword.value
      if (sortBy.value) params.sort = sortBy.value
      
      sachStore.pagination.page = 1
      sachStore.fetchBooks(params)
    }

    const clearFilters = () => {
      searchKeyword.value = ''
      sortBy.value = ''
      sachStore.fetchBooks()
    }

    const changePage = (page) => {
      if (page >= 1 && page <= sachStore.pagination.totalPages) {
        sachStore.setPage(page)
      }
    }

    const resetForm = () => {
      Object.assign(bookForm, {
        tenSach: '',
        tacGia: '',
        maNXB: '',
        namXuatBan: new Date().getFullYear(),
        soQuyen: 1,
        donGia: 0
      })
    }

    const editBook = (book) => {
      currentEditId.value = book._id
      Object.assign(bookForm, {
        tenSach: book.tenSach,
        tacGia: book.tacGia,
        maNXB: book.maNXB || '',
        namXuatBan: book.namXuatBan,
        soQuyen: book.soQuyen,
        donGia: book.donGia || 0
      })
      showEditModal.value = true
    }

    const closeModal = () => {
      showAddModal.value = false
      showEditModal.value = false
      currentEditId.value = null
      resetForm()
    }

    const saveBook = async () => {
      saving.value = true
      try {
        const data = {
          tenSach: bookForm.tenSach,
          tacGia: bookForm.tacGia,
          theLoai: bookForm.theLoai,
          maNXB: bookForm.maNXB,
          namXuatBan: bookForm.namXuatBan,
          soLuong: bookForm.soQuyen, // Map soQuyen -> soLuong cho backend
          donGia: bookForm.donGia
        }
        
        if (isEditing.value) {
          await sachStore.updateBook(currentEditId.value, data)
        } else {
          await sachStore.createBook(data)
        }
        closeModal()
      } catch (error) {
        console.error('Lỗi khi lưu sách:', error)
      } finally {
        saving.value = false
      }
    }

    const deleteBook = async (id) => {
      if (confirm('Bạn có chắc chắn muốn xóa sách này?')) {
        await sachStore.deleteBook(id)
      }
    }

    const loadPublishers = async () => {
      try {
        const response = await publisherService.getAll()
        publishers.value = response.data.data || response.data || []
      } catch (error) {
        console.error('Error loading publishers:', error)
      }
    }

    onMounted(() => {
      sachStore.fetchBooks()
      loadPublishers()
    })

    return {
      sachStore,
      publishers,
      searchKeyword,
      sortBy,
      showAddModal,
      showEditModal,
      saving,
      bookForm,
      isEditing,
      currentYear,
      visiblePages,
      getStockBadgeClass,
      formatCurrency,
      handleSearch,
      clearFilters,
      changePage,
      editBook,
      closeModal,
      saveBook,
      deleteBook
    }
  }
}
</script>

<style scoped>
.admin-books {
  background-color: #f8f9fa;
  min-height: 100vh;
}

.table th {
  background-color: #343a40;
  color: white;
  border: none;
}

.modal.show {
  display: block !important;
}

.modal {
  background-color: rgba(0, 0, 0, 0.5);
}
</style>
