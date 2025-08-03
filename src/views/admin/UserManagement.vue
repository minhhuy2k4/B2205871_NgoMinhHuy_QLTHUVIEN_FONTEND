<template>
  <div class="user-management">
    <div class="container-fluid py-4">
      <!-- Header -->
      <div class="row mb-4">
        <div class="col">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <h1 class="fw-bold">Quản Lý Người Dùng</h1>
              <p class="text-muted">Quản lý nhân viên và độc giả trong hệ thống</p>
            </div>
            <button 
              class="btn btn-primary"
              @click="openCreateEmployeeModal"
            >
              <i class="bi bi-person-plus me-2"></i>
              Thêm nhân viên
            </button>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="card mb-4">
        <div class="card-body">
          <div class="row g-3">
            <div class="col-md-4">
              <div class="input-group">
                <input
                  type="text"
                  class="form-control"
                  placeholder="Tìm theo tên, email, số điện thoại..."
                  v-model="searchKeyword"
                  @keyup.enter="handleSearch"
                >
                <button class="btn btn-outline-secondary" type="button" @click="handleSearch">
                  <i class="bi bi-search"></i>
                </button>
              </div>
            </div>
            <div class="col-md-3">
              <select class="form-select" v-model="userTypeFilter" @change="handleSearch">
                <option value="">Tất cả người dùng</option>
                <option value="nhanvien">Nhân viên</option>
                <option value="docgia">Độc giả</option>
              </select>
            </div>
            <div class="col-md-2">
              <select class="form-select" v-model="pagination.limit" @change="handleLimitChange">
                <option value="10">10 / trang</option>
                <option value="25">25 / trang</option>
                <option value="50">50 / trang</option>
              </select>
            </div>
            <div class="col-md-3">
              <div class="d-flex gap-2">
                <button class="btn btn-outline-secondary" @click="clearFilters">
                  <i class="bi bi-arrow-clockwise me-1"></i>
                  Reset
                </button>
                <button class="btn btn-info" @click="fetchUsers">
                  <i class="bi bi-arrow-clockwise me-1"></i>
                  Làm mới
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="row mb-4" v-if="stats">
        <div class="col-md-6">
          <div class="card bg-primary text-white">
            <div class="card-body">
              <div class="d-flex align-items-center">
                <i class="bi bi-people-fill display-6 me-3"></i>
                <div>
                  <h5 class="card-title mb-0">{{ stats.totalNhanVien }}</h5>
                  <small>Nhân viên</small>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-6">
          <div class="card bg-success text-white">
            <div class="card-body">
              <div class="d-flex align-items-center">
                <i class="bi bi-person-check-fill display-6 me-3"></i>
                <div>
                  <h5 class="card-title mb-0">{{ stats.totalDocGia }}</h5>
                  <small>Độc giả</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Users Table -->
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
                    <th>Tên</th>
                    <th>Email</th>
                    <th>Điện thoại</th>
                    <th>Loại</th>
                    <th>Chức vụ/Vai trò</th>
                    <th>Ngày tạo</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="user in users" :key="`${user.userType}-${user._id}`">
                    <td>
                      <code>{{ user._id.slice(-6) }}</code>
                    </td>
                    <td>
                      <strong>{{ user.displayName }}</strong>
                    </td>
                    <td>{{ user.email || 'Không có' }}</td>
                    <td>{{ user.soDienThoai || 'Chưa có' }}</td>
                    <td>
                      <span 
                        class="badge" 
                        :class="user.userType === 'nhanvien' ? 'bg-primary' : 'bg-success'"
                      >
                        {{ user.userType === 'nhanvien' ? 'Nhân viên' : 'Độc giả' }}
                      </span>
                    </td>
                    <td>
                      <span 
                        class="badge"
                        :class="getRoleBadgeClass(user)"
                      >
                        {{ user.displayRole }}
                      </span>
                    </td>
                    <td>{{ formatDate(user.ngayTao) }}</td>
                    <td>
                      <div class="btn-group btn-group-sm">
                        <button 
                          class="btn btn-outline-info"
                          @click="viewUser(user)"
                          title="Xem chi tiết"
                        >
                          <i class="bi bi-eye"></i>
                        </button>
                        
                        <button 
                          class="btn btn-outline-warning"
                          @click="editUser(user)"
                          title="Chỉnh sửa"
                        >
                          <i class="bi bi-pencil"></i>
                        </button>
                        
                        <button 
                          class="btn btn-outline-danger"
                          @click="deleteUser(user)"
                          title="Xóa"
                          :disabled="user.userType === 'nhanvien' && user.chucVu === 'admin' && user._id === authStore.user?.id"
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
            <nav v-if="totalPages > 1" class="mt-4">
              <ul class="pagination justify-content-center">
                <li class="page-item" :class="{ disabled: pagination.page <= 1 }">
                  <button class="page-link" @click="changePage(pagination.page - 1)">Trước</button>
                </li>
                <li 
                  v-for="page in visiblePages" 
                  :key="page"
                  class="page-item" 
                  :class="{ active: page === pagination.page }"
                >
                  <button class="page-link" @click="changePage(page)">{{ page }}</button>
                </li>
                <li class="page-item" :class="{ disabled: pagination.page >= totalPages }">
                  <button class="page-link" @click="changePage(pagination.page + 1)">Sau</button>
                </li>
              </ul>
              
              <div class="text-center text-muted mt-2">
                <small>
                  Trang {{ pagination.page }} / {{ totalPages }} 
                  ({{ pagination.total }} người dùng)
                </small>
              </div>
            </nav>

            <!-- No Results -->
            <div v-if="users.length === 0" class="text-center py-5">
              <i class="bi bi-people display-4 text-muted mb-3"></i>
              <h4 class="text-muted">Không tìm thấy người dùng nào</h4>
              <p class="text-muted">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Create/Edit Employee Modal -->
    <div 
      class="modal fade" 
      :class="{ show: showEmployeeModal }" 
      :style="{ display: showEmployeeModal ? 'block' : 'none' }" 
      tabindex="-1"
    >
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="bi bi-person-plus me-2"></i>
              {{ editingEmployee ? 'Sửa nhân viên' : 'Thêm nhân viên mới' }}
            </h5>
            <button type="button" class="btn-close" @click="closeEmployeeModal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveEmployee">
              <!-- ROW 1: Họ và tên + (Mã nhân viên chỉ khi tạo mới) -->
              <div class="row">
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label">Họ và tên <span class="text-danger">*</span></label>
                    <input
                      type="text"
                      class="form-control"
                      v-model="employeeForm.hoTenNV"
                      required
                      :disabled="employeeSaving"
                      placeholder="Nhập họ và tên"
                    >
                  </div>
                </div>
                <!-- ✅ CHỈ HIỂN THỊ TRƯỜNG MÃ NHÂN VIÊN KHI TẠO MỚI -->
                <div v-if="!editingEmployee" class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label">
                      Mã nhân viên 
                      <span class="text-muted">(tự động tạo nếu để trống)</span>
                    </label>
                    <input
                      type="text"
                      class="form-control"
                      v-model="employeeForm.msnv"
                      :disabled="employeeSaving"
                      placeholder="VD: NV001, NV002..."
                    >
                  </div>
                </div>
                <!-- ✅ KHI CHỈNH SỬA, HIỂN THỊ MSNV HIỆN TẠI (READONLY) -->
                <div v-else class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label">MSNV hiện tại</label>
                    <div class="form-control-plaintext">
                      <span class="badge bg-secondary fs-6">{{ editingEmployee.msnv || 'Chưa có' }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- ROW 2: Mật khẩu + Chức vụ -->
              <div class="row">
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label">
                      Mật khẩu 
                      <span v-if="!editingEmployee" class="text-danger">*</span>
                      <span v-else class="text-muted">(để trống nếu không đổi)</span>
                    </label>
                    <input
                      type="password"
                      class="form-control"
                      v-model="employeeForm.password"
                      :required="!editingEmployee"
                      :disabled="employeeSaving"
                      placeholder="Nhập mật khẩu"
                    >
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label">Chức vụ</label>
                    <select 
                      class="form-select" 
                      v-model="employeeForm.chucVu"
                      :disabled="employeeSaving"
                    >
                      <option value="nhanvien">Nhân viên</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                </div>
              </div>

              <!-- ROW 3: Số điện thoại + empty -->
              <div class="row">
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label">Số điện thoại</label>
                    <input
                      type="tel"
                      class="form-control"
                      v-model="employeeForm.soDienThoai"
                      :disabled="employeeSaving"
                      placeholder="Nhập số điện thoại"
                    >
                  </div>
                </div>
                <div class="col-md-6">
                  <!-- Empty column for spacing -->
                </div>
              </div>

              <!-- ROW 4: Địa chỉ (full width) -->
              <div class="row">
                <div class="col-md-12">
                  <div class="mb-3">
                    <label class="form-label">Địa chỉ</label>
                    <input
                      type="text"
                      class="form-control"
                      v-model="employeeForm.diaChi"
                      :disabled="employeeSaving"
                      placeholder="Nhập địa chỉ"
                    >
                  </div>
                </div>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button 
              type="button" 
              class="btn btn-secondary" 
              @click="closeEmployeeModal"
              :disabled="employeeSaving"
            >
              Hủy
            </button>
            <button 
              type="button" 
              class="btn btn-primary" 
              @click="saveEmployee"
              :disabled="employeeSaving"
            >
              <span v-if="employeeSaving" class="spinner-border spinner-border-sm me-2"></span>
              {{ editingEmployee ? 'Cập nhật' : 'Tạo mới' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit Reader Modal -->
    <div 
      class="modal fade" 
      :class="{ show: showReaderModal }" 
      :style="{ display: showReaderModal ? 'block' : 'none' }" 
      tabindex="-1"
    >
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="bi bi-person-gear me-2"></i>
              Sửa thông tin độc giả
            </h5>
            <button type="button" class="btn-close" @click="closeReaderModal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveReader">
              <div class="mb-3">
                <label class="form-label">Họ và tên <span class="text-danger">*</span></label>
                <input
                  type="text"
                  class="form-control"
                  v-model="readerForm.hoTen"
                  required
                  :disabled="readerSaving"
                >
              </div>

              <div class="mb-3">
                <label class="form-label">Email <span class="text-danger">*</span></label>
                <input
                  type="email"
                  class="form-control"
                  v-model="readerForm.email"
                  required
                  :disabled="readerSaving"
                >
              </div>

              <div class="mb-3">
                <label class="form-label">
                  Mật khẩu mới 
                  <span class="text-muted">(để trống nếu không đổi)</span>
                </label>
                <input
                  type="password"
                  class="form-control"
                  v-model="readerForm.password"
                  :disabled="readerSaving"
                >
              </div>

              <div class="mb-3">
                <label class="form-label">Số điện thoại</label>
                <input
                  type="tel"
                  class="form-control"
                  v-model="readerForm.soDienThoai"
                  :disabled="readerSaving"
                >
              </div>

              <div class="mb-3">
                <label class="form-label">Địa chỉ</label>
                <input
                  type="text"
                  class="form-control"
                  v-model="readerForm.diaChi"
                  :disabled="readerSaving"
                >
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button 
              type="button" 
              class="btn btn-secondary" 
              @click="closeReaderModal"
              :disabled="readerSaving"
            >
              Hủy
            </button>
            <button 
              type="button" 
              class="btn btn-primary" 
              @click="saveReader"
              :disabled="readerSaving"
            >
              <span v-if="readerSaving" class="spinner-border spinner-border-sm me-2"></span>
              Cập nhật
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- View User Detail Modal -->
    <div 
      class="modal fade" 
      :class="{ show: showDetailModal }" 
      :style="{ display: showDetailModal ? 'block' : 'none' }" 
      tabindex="-1"
    >
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="bi bi-person-lines-fill me-2"></i>
              Thông tin chi tiết
            </h5>
            <button type="button" class="btn-close" @click="closeDetailModal"></button>
          </div>
          <div class="modal-body" v-if="selectedUser">
            <div class="row">
              <div class="col-sm-4"><strong>ID:</strong></div>
              <div class="col-sm-8"><code>{{ selectedUser._id }}</code></div>
            </div>
            
            <!-- ✅ THÊM HIỂN THỊ MSNV CHO NHÂN VIÊN -->
            <div v-if="selectedUser.userType === 'nhanvien'" class="row">
              <hr>
              <div class="col-sm-4"><strong>MSNV:</strong></div>
              <div class="col-sm-8">
                <span class="badge bg-secondary">{{ selectedUser.msnv || 'Chưa có' }}</span>
              </div>
            </div>
            
            <hr>
            <div class="row">
              <div class="col-sm-4"><strong>Tên:</strong></div>
              <div class="col-sm-8">{{ selectedUser.displayName }}</div>
            </div>
            <hr>
            <div class="row">
              <div class="col-sm-4"><strong>Email:</strong></div>
              <div class="col-sm-8">{{ selectedUser.email }}</div>
            </div>
            <hr>
            <div class="row">
              <div class="col-sm-4"><strong>Điện thoại:</strong></div>
              <div class="col-sm-8">{{ selectedUser.soDienThoai || 'Chưa có' }}</div>
            </div>
            <hr>
            <div class="row">
              <div class="col-sm-4"><strong>Địa chỉ:</strong></div>
              <div class="col-sm-8">{{ selectedUser.diaChi || 'Chưa có' }}</div>
            </div>
            <hr>
            <div class="row">
              <div class="col-sm-4"><strong>Loại:</strong></div>
              <div class="col-sm-8">
                <span 
                  class="badge" 
                  :class="selectedUser.userType === 'nhanvien' ? 'bg-primary' : 'bg-success'"
                >
                  {{ selectedUser.userType === 'nhanvien' ? 'Nhân viên' : 'Độc giả' }}
                </span>
              </div>
            </div>
            <hr>
            <div class="row">
              <div class="col-sm-4"><strong>Vai trò:</strong></div>
              <div class="col-sm-8">
                <span 
                  class="badge"
                  :class="getRoleBadgeClass(selectedUser)"
                >
                  {{ selectedUser.displayRole }}
                </span>
              </div>
            </div>
            <hr>
            <div class="row">
              <div class="col-sm-4"><strong>Ngày tạo:</strong></div>
              <div class="col-sm-8">{{ formatDateTime(selectedUser.ngayTao) }}</div>
            </div>
            <div v-if="selectedUser.ngayCapNhat" class="row">
              <hr>
              <div class="col-sm-4"><strong>Cập nhật cuối:</strong></div>
              <div class="col-sm-8">{{ formatDateTime(selectedUser.ngayCapNhat) }}</div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeDetailModal">Đóng</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal backdrop -->
    <div v-if="showEmployeeModal || showReaderModal || showDetailModal" class="modal-backdrop fade show"></div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import { useAuthStore } from '../../stores/auth.js'
import { userManagementService } from '../../services/usermanagement.service.js'

export default {
  name: 'UserManagement',
  setup() {
    const authStore = useAuthStore()

    // Kiểm tra quyền admin
    if (!authStore.isAuthenticated || authStore.user?.chucVu !== 'admin') {
      // Redirect về trang chủ nếu không phải admin
      window.location.href = '/'
      return {}
    }

    const users = ref([])
    const loading = ref(false)
    const stats = ref(null)

    // Pagination
    const pagination = ref({
      page: 1,
      limit: 10,
      total: 0
    })

    // Filters
    const searchKeyword = ref('')
    const userTypeFilter = ref('')

    // Modals
    const showEmployeeModal = ref(false)
    const showReaderModal = ref(false)
    const showDetailModal = ref(false)
    const selectedUser = ref(null)

    // Forms
    const editingEmployee = ref(null)
    const employeeSaving = ref(false)
    const employeeForm = ref({
      hoTenNV: '',
      msnv: '', 
      password: '',
      chucVu: 'nhanvien',
      soDienThoai: '',
      diaChi: ''
      // ✅ BỎ EMAIL HOÀN TOÀN
    })

    const readerSaving = ref(false)
    const readerForm = ref({
      hoTen: '',
      email: '',
      password: '',
      soDienThoai: '',
      diaChi: ''
    })

    // Computed
    const totalPages = computed(() => Math.ceil(pagination.value.total / pagination.value.limit))

    const visiblePages = computed(() => {
      const current = pagination.value.page
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

    // Methods
    const fetchUsers = async () => {
      loading.value = true
      try {
        const params = {
          page: pagination.value.page,
          limit: pagination.value.limit
        }

        if (searchKeyword.value.trim()) {
          params.search = searchKeyword.value.trim()
        }

        if (userTypeFilter.value) {
          params.type = userTypeFilter.value
        }

        const response = await userManagementService.getUsers(params)
        
        users.value = response.data.data || []
        pagination.value.total = response.data.pagination?.total || 0
        stats.value = response.data.stats || null

      } catch (error) {
        console.error('Lỗi khi tải danh sách người dùng:', error)
        users.value = []
        pagination.value.total = 0
      } finally {
        loading.value = false
      }
    }

    const handleSearch = () => {
      pagination.value.page = 1
      fetchUsers()
    }

    const handleLimitChange = () => {
      pagination.value.page = 1
      fetchUsers()
    }

    const clearFilters = () => {
      searchKeyword.value = ''
      userTypeFilter.value = ''
      pagination.value.page = 1
      fetchUsers()
    }

    const changePage = (page) => {
      if (page >= 1 && page <= totalPages.value) {
        pagination.value.page = page
        fetchUsers()
      }
    }

    const getRoleBadgeClass = (user) => {
      if (user.userType === 'nhanvien') {
        return user.chucVu === 'admin' ? 'bg-danger' : 'bg-info'
      }
      return 'bg-success'
    }

    // Employee Modal Functions
    const openCreateEmployeeModal = () => {
      editingEmployee.value = null
      employeeForm.value = {
        hoTenNV: '',
        msnv: '', // ✅ RESET msnv
        password: '',
        chucVu: 'nhanvien',
        soDienThoai: '',
        diaChi: ''
      }
      showEmployeeModal.value = true
    }

    const editUser = (user) => {
      if (user.userType === 'nhanvien') {
        editingEmployee.value = user
        employeeForm.value = {
          hoTenNV: user.hoTenNV || '',
          msnv: user.msnv || '', // ✅ LOAD msnv
          password: '',
          chucVu: user.chucVu || 'nhanvien',
          soDienThoai: user.soDienThoai || '',
          diaChi: user.diaChi || ''
        }
        showEmployeeModal.value = true
      } else {
        readerForm.value = {
          hoTen: user.hoTen || '',
          email: user.email || '',
          password: '',
          soDienThoai: user.soDienThoai || '',
          diaChi: user.diaChi || ''
        }
        selectedUser.value = user
        showReaderModal.value = true
      }
    }

    const closeEmployeeModal = () => {
      showEmployeeModal.value = false
      editingEmployee.value = null
      employeeForm.value = {
        hoTenNV: '',
        msnv: '',
        password: '',
        chucVu: 'nhanvien',
        soDienThoai: '',
        diaChi: ''
      }
    }

    const saveEmployee = async () => {
      if (!employeeForm.value.hoTenNV.trim() || !employeeForm.value.msnv) {
        alert('Vui lòng nhập họ và tên')
        return
      }

      if (!editingEmployee.value && !employeeForm.value.password.trim()) {
        alert('Vui lòng nhập mật khẩu')
        return
      }

      employeeSaving.value = true
      try {
        if (editingEmployee.value) {
          await userManagementService.updateEmployee(editingEmployee.value._id, employeeForm.value)
          alert('Cập nhật nhân viên thành công!')
        } else {
          await userManagementService.createEmployee(employeeForm.value)
          alert('Tạo nhân viên thành công!')
        }

        closeEmployeeModal()
        fetchUsers()

      } catch (error) {
        console.error('Lỗi khi lưu nhân viên:', error)
        alert(error.response?.data?.message || 'Có lỗi xảy ra khi lưu nhân viên')
      } finally {
        employeeSaving.value = false
      }
    }

    // Reader Modal Functions
    const closeReaderModal = () => {
      showReaderModal.value = false
      selectedUser.value = null
      readerForm.value = {
        hoTen: '',
        email: '',
        password: '',
        soDienThoai: '',
        diaChi: ''
      }
    }

    const saveReader = async () => {
      if (!readerForm.value.hoTen || !readerForm.value.email) {
        alert('Vui lòng điền đầy đủ thông tin bắt buộc')
        return
      }

      readerSaving.value = true
      try {
        await userManagementService.updateReader(selectedUser.value._id, readerForm.value)
        alert('Cập nhật độc giả thành công!')

        closeReaderModal()
        fetchUsers()

      } catch (error) {
        console.error('Lỗi khi cập nhật độc giả:', error)
        alert(error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật độc giả')
      } finally {
        readerSaving.value = false
      }
    }

    // Detail Modal Functions
    const viewUser = (user) => {
      selectedUser.value = user
      showDetailModal.value = true
    }

    const closeDetailModal = () => {
      showDetailModal.value = false
      selectedUser.value = null
    }

    // Delete Functions
    const deleteUser = async (user) => {
      const confirmMessage = `Bạn có chắc muốn xóa ${user.userType === 'nhanvien' ? 'nhân viên' : 'độc giả'}: ${user.displayName}?\n\nHành động này không thể hoàn tác.`
      
      if (!confirm(confirmMessage)) return

      try {
        if (user.userType === 'nhanvien') {
          await userManagementService.deleteEmployee(user._id)
          alert('Xóa nhân viên thành công!')
        } else {
          await userManagementService.deleteReader(user._id)
          alert('Xóa độc giả thành công!')
        }

        fetchUsers()

      } catch (error) {
        console.error('Lỗi khi xóa người dùng:', error)
        alert(error.response?.data?.message || 'Có lỗi xảy ra khi xóa người dùng')
      }
    }

    // Utility Functions
    const formatDate = (dateString) => {
      if (!dateString) return 'Không xác định'
      try {
        return new Date(dateString).toLocaleDateString('vi-VN')
      } catch {
        return 'Không xác định'
      }
    }

    const formatDateTime = (dateString) => {
      if (!dateString) return 'Không xác định'
      try {
        return new Date(dateString).toLocaleString('vi-VN')
      } catch {
        return 'Không xác định'
      }
    }

    // Auto search
    watch(searchKeyword, () => {
      const timeout = setTimeout(() => {
        handleSearch()
      }, 500)
      return () => clearTimeout(timeout)
    })

    onMounted(() => {
      fetchUsers()
    })

    return {
      authStore,
      users,
      loading,
      stats,
      pagination,
      totalPages,
      visiblePages,
      searchKeyword,
      userTypeFilter,
      showEmployeeModal,
      showReaderModal,
      showDetailModal,
      selectedUser,
      editingEmployee,
      employeeSaving,
      employeeForm,
      readerSaving,
      readerForm,
      fetchUsers,
      handleSearch,
      handleLimitChange,
      clearFilters,
      changePage,
      getRoleBadgeClass,
      openCreateEmployeeModal,
      editUser,
      closeEmployeeModal,
      saveEmployee,
      closeReaderModal,
      saveReader,
      viewUser,
      closeDetailModal,
      deleteUser,
      formatDate,
      formatDateTime
    }
  }
}
</script>

<style scoped>
.user-management {
  background-color: #f8f9fa;
  min-height: 100vh;
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

code {
  font-size: 0.8rem;
}

.btn-group {
  flex-wrap: nowrap;
}

/* Form styling */
.form-label {
  font-weight: 500;
}

.form-control:focus,
.form-select:focus {
  border-color: #86b7fe;
  box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
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
  
  .modal-dialog {
    margin: 0.5rem;
  }
}
</style>