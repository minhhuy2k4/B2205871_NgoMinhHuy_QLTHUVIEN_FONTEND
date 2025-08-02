<template>
  <div class="admin-publishers">
    <div class="container-fluid py-4">
      <!-- Header -->
      <div class="row mb-4">
        <div class="col">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <h1 class="fw-bold">Quản Lý Nhà Xuất Bản</h1>
              <p class="text-muted">Thêm, sửa, xóa nhà xuất bản trong hệ thống</p>
            </div>
            <button @click="openAddModal" class="btn btn-primary">
              <i class="bi bi-plus-circle me-2"></i>
              Thêm nhà xuất bản
            </button>
          </div>
        </div>
      </div>

      <!-- Search -->
      <div class="card mb-4">
        <div class="card-body">
          <div class="row g-3">
            <div class="col-md-6">
              <input
                type="text"
                class="form-control"
                placeholder="Tìm kiếm nhà xuất bản..."
                v-model="searchKeyword"
                @input="handleSearch"
              >
            </div>
            <div class="col-md-6">
              <button class="btn btn-outline-secondary" @click="loadPublishers">
                <i class="bi bi-arrow-clockwise me-2"></i>
                Làm mới
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Đang tải...</span>
        </div>
      </div>

      <!-- Publishers Table -->
      <div v-else class="card">
        <div class="card-header">
          <h5 class="mb-0">Danh sách nhà xuất bản ({{ totalPublishers }})</h5>
        </div>
        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="table table-hover mb-0">
              <thead class="table-light">
                <tr>
                  <th>STT</th>
                  <th>Mã NXB</th>
                  <th>Tên nhà xuất bản</th>
                  <th>Địa chỉ</th>
                  <th class="text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="publishers.length === 0">
                  <td colspan="5" class="text-center py-4 text-muted">
                    <i class="bi bi-inbox fs-1 d-block mb-2"></i>
                    {{ searchKeyword ? 'Không tìm thấy nhà xuất bản nào' : 'Chưa có nhà xuất bản nào' }}
                  </td>
                </tr>
                <tr v-for="(publisher, index) in publishers" :key="publisher._id">
                  <td>{{ (currentPage - 1) * itemsPerPage + index + 1 }}</td>
                  <td>
                    <span class="badge bg-primary">{{ publisher.maNXB || '-' }}</span>
                  </td>
                  <td>
                    <div class="fw-bold">{{ publisher.tenNXB }}</div>
                  </td>
                  <td>{{ publisher.diaChi || '-' }}</td>
                  <td class="text-center">
                    <div class="btn-group btn-group-sm">
                      <button 
                        class="btn btn-outline-primary"
                        @click="editPublisher(publisher)"
                        title="Sửa"
                      >
                        <i class="bi bi-pencil"></i>
                      </button>
                      <button 
                        class="btn btn-outline-danger"
                        @click="confirmDelete(publisher)"
                        title="Xóa"
                      >
                        <i class="bi bi-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="card-footer">
          <nav>
            <ul class="pagination pagination-sm justify-content-center mb-0">
              <li class="page-item" :class="{ disabled: currentPage === 1 }">
                <a class="page-link" @click="changePage(1)" href="#">Đầu</a>
              </li>
              <li class="page-item" :class="{ disabled: currentPage === 1 }">
                <a class="page-link" @click="changePage(currentPage - 1)" href="#">Trước</a>
              </li>
              <li 
                v-for="page in visiblePages" 
                :key="page"
                class="page-item" 
                :class="{ active: currentPage === page }"
              >
                <a class="page-link" @click="changePage(page)" href="#">{{ page }}</a>
              </li>
              <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                <a class="page-link" @click="changePage(currentPage + 1)" href="#">Sau</a>
              </li>
              <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                <a class="page-link" @click="changePage(totalPages)" href="#">Cuối</a>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      <!-- Edit/Add Modal -->
      <div class="modal fade" tabindex="-1" :class="{ show: showModal }" :style="{ display: showModal ? 'block' : 'none' }">
        <div class="modal-dialog">
          <div class="modal-content">
            <form @submit.prevent="savePublisher">
              <div class="modal-header">
                <h5 class="modal-title">
                  {{ isEditing ? 'Sửa nhà xuất bản' : 'Thêm nhà xuất bản mới' }}
                </h5>
                <button type="button" class="btn-close" @click="closeModal"></button>
              </div>
              <div class="modal-body">
                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label class="form-label">Tên nhà xuất bản <span class="text-danger">*</span></label>
                    <input 
                      type="text" 
                      class="form-control" 
                      v-model="publisherForm.tenNXB"
                      required
                      placeholder="Nhập tên nhà xuất bản"
                    >
                  </div>
                </div>
                <div class="mb-3">
                  <label class="form-label">Địa chỉ</label>
                  <textarea 
                    class="form-control" 
                    v-model="publisherForm.diaChi"
                    rows="3"
                    placeholder="Nhập địa chỉ nhà xuất bản"
                  ></textarea>
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

      <!-- Modal backdrop -->
      <div v-if="showModal" class="modal-backdrop fade show"></div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue'
import { publisherService } from '../../services/publisher.service.js'

export default {
  name: 'AdminPublishers',
  setup() {
    const loading = ref(false)
    const publishers = ref([])
    const searchKeyword = ref('')
    const currentPage = ref(1)
    const itemsPerPage = 10
    const totalPublishers = ref(0)
    
    // Modal states
    const showModal = ref(false)
    const saving = ref(false)
    const isEditing = ref(false)
    const currentEditId = ref(null)
    
    // Form data
    const publisherForm = reactive({
      maNXB: '',
      tenNXB: '',
      diaChi: ''
    })

    const totalPages = computed(() => 
      Math.ceil(totalPublishers.value / itemsPerPage)
    )

    const visiblePages = computed(() => {
      const pages = []
      const start = Math.max(1, currentPage.value - 2)
      const end = Math.min(totalPages.value, currentPage.value + 2)
      
      for (let i = start; i <= end; i++) {
        pages.push(i)
      }
      return pages
    })

    const loadPublishers = async (page = 1, search = '') => {
      loading.value = true
      try {
        const params = {
          page,
          limit: itemsPerPage
        }
        
        if (search.trim()) {
          params.search = search.trim()
        }

        const response = await publisherService.getAll(params)
        publishers.value = response.data.data || response.data || []
        
        if (response.data.pagination) {
          totalPublishers.value = response.data.pagination.total
        } else {
          totalPublishers.value = publishers.value.length
        }
      } catch (error) {
        console.error('Error loading publishers:', error)
        alert('Không thể tải danh sách nhà xuất bản')
      } finally {
        loading.value = false
      }
    }

    const handleSearch = () => {
      currentPage.value = 1
      loadPublishers(1, searchKeyword.value)
    }

    const resetForm = () => {
      Object.assign(publisherForm, {
        maNXB: '',
        tenNXB: '',
        diaChi: ''
      })
    }

    const openAddModal = () => {
      resetForm()
      isEditing.value = false
      currentEditId.value = null
      showModal.value = true
    }

    const editPublisher = (publisher) => {
      Object.assign(publisherForm, {
        maNXB: publisher.maNXB || '',
        tenNXB: publisher.tenNXB || '',
        diaChi: publisher.diaChi || ''
      })
      isEditing.value = true
      currentEditId.value = publisher._id
      showModal.value = true
    }

    const closeModal = () => {
      showModal.value = false
      isEditing.value = false
      currentEditId.value = null
      resetForm()
    }

    const savePublisher = async () => {
      saving.value = true
      try {
        const data = {
          maNXB: publisherForm.maNXB,
          tenNXB: publisherForm.tenNXB,
          diaChi: publisherForm.diaChi
        }

        if (isEditing.value) {
          await publisherService.update(currentEditId.value, data)
          alert('Cập nhật nhà xuất bản thành công!')
        } else {
          await publisherService.create(data)
          alert('Thêm nhà xuất bản thành công!')
        }
        
        closeModal()
        loadPublishers(currentPage.value, searchKeyword.value)
      } catch (error) {
        console.error('Error saving publisher:', error)
        const message = error.response?.data?.message || 'Có lỗi xảy ra khi lưu nhà xuất bản'
        alert(message)
      } finally {
        saving.value = false
      }
    }

    const confirmDelete = (publisher) => {
      if (confirm(`Bạn có chắc chắn muốn xóa nhà xuất bản "${publisher.tenNXB}"?`)) {
        deletePublisher(publisher._id)
      }
    }

    const deletePublisher = async (id) => {
      try {
        await publisherService.delete(id)
        alert('Xóa nhà xuất bản thành công!')
        loadPublishers(currentPage.value, searchKeyword.value)
      } catch (error) {
        console.error('Error deleting publisher:', error)
        const message = error.response?.data?.message || 'Có lỗi xảy ra khi xóa nhà xuất bản'
        alert(message)
      }
    }

    const changePage = (page) => {
      if (page >= 1 && page <= totalPages.value) {
        currentPage.value = page
        loadPublishers(page, searchKeyword.value)
      }
    }

    onMounted(() => {
      loadPublishers()
    })

    return {
      loading,
      publishers,
      searchKeyword,
      currentPage,
      itemsPerPage,
      totalPublishers,
      totalPages,
      visiblePages,
      showModal,
      saving,
      isEditing,
      publisherForm,
      loadPublishers,
      handleSearch,
      openAddModal,
      editPublisher,
      closeModal,
      savePublisher,
      confirmDelete,
      changePage
    }
  }
}
</script>

<style scoped>
.admin-publishers {
  background-color: #f8f9fa;
  min-height: 100vh;
}

.card {
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
  border: 1px solid rgba(0, 0, 0, 0.125);
}

.table th {
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.875rem;
  letter-spacing: 0.025em;
}

.btn-group-sm > .btn {
  padding: 0.25rem 0.5rem;
}

.pagination .page-link {
  color: #0d6efd;
  cursor: pointer;
}

.pagination .page-item.active .page-link {
  background-color: #0d6efd;
  border-color: #0d6efd;
}

.pagination .page-item.disabled .page-link {
  cursor: not-allowed;
}

.modal.show {
  display: block !important;
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
</style>
