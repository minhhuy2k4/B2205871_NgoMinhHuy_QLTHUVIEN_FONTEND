<template>
  <div class="container mt-4">
    <div class="row justify-content-center">
      <div class="col-md-10">
        <div class="card">
          <div class="card-header">
            <h4 class="mb-0">
              <i class="bi bi-book-half me-2"></i>
              Thêm Sách Mới
            </h4>
          </div>
          <div class="card-body">
            <form @submit.prevent="submitForm">
              <div class="row">
                <!-- Cột trái -->
                <div class="col-md-6">
                  <div class="mb-3">
                    <label for="tenSach" class="form-label">Tên Sách <span class="text-danger">*</span></label>
                    <input
                      type="text"
                      class="form-control"
                      id="tenSach"
                      v-model="form.tenSach"
                      :class="{ 'is-invalid': errors.tenSach }"
                      required
                    >
                    <div v-if="errors.tenSach" class="invalid-feedback">
                      {{ errors.tenSach }}
                    </div>
                  </div>

                  <div class="mb-3">
                    <label for="tacGia" class="form-label">Tác Giả <span class="text-danger">*</span></label>
                    <input
                      type="text"
                      class="form-control"
                      id="tacGia"
                      v-model="form.tacGia"
                      :class="{ 'is-invalid': errors.tacGia }"
                      required
                    >
                    <div v-if="errors.tacGia" class="invalid-feedback">
                      {{ errors.tacGia }}
                    </div>
                  </div>


                </div>

                <!-- Cột phải -->
                <div class="col-md-6">
                  <div class="mb-3">
                    <label for="namXuatBan" class="form-label">Năm Xuất Bản</label>
                    <input
                      type="number"
                      class="form-control"
                      id="namXuatBan"
                      v-model.number="form.namXuatBan"
                      :class="{ 'is-invalid': errors.namXuatBan }"
                      :min="1900"
                      :max="new Date().getFullYear()"
                    >
                    <div v-if="errors.namXuatBan" class="invalid-feedback">
                      {{ errors.namXuatBan }}
                    </div>
                  </div>

                  <div class="mb-3">
                    <label for="maNXB" class="form-label">Nhà Xuất Bản</label>
                    <select
                      class="form-select"
                      id="maNXB"
                      v-model="form.maNXB"
                      :class="{ 'is-invalid': errors.maNXB }"
                    >
                      <option value="">Chọn nhà xuất bản</option>
                      <option 
                        v-for="publisher in publishers" 
                        :key="publisher._id" 
                        :value="publisher.maNXB"
                      >
                        {{ publisher.tenNXB }} ({{ publisher.maNXB }})
                      </option>
                    </select>
                    <div v-if="errors.maNXB" class="invalid-feedback">
                      {{ errors.maNXB }}
                    </div>
                    <small class="form-text text-muted">
                      <router-link to="/admin/add-publisher" class="text-decoration-none">
                        + Thêm nhà xuất bản mới
                      </router-link>
                    </small>
                  </div>

                  <div class="mb-3">
                    <label for="soLuong" class="form-label">Số Lượng <span class="text-danger">*</span></label>
                    <input
                      type="number"
                      class="form-control"
                      id="soLuong"
                      v-model.number="form.soLuong"
                      :class="{ 'is-invalid': errors.soLuong }"
                      min="1"
                      required
                    >
                    <div v-if="errors.soLuong" class="invalid-feedback">
                      {{ errors.soLuong }}
                    </div>
                  </div>

                  <div class="mb-3">
                    <label for="donGia" class="form-label">Đơn Giá (VNĐ) <span class="text-danger">*</span></label>
                    <input
                      type="number"
                      class="form-control"
                      id="donGia"
                      v-model.number="form.donGia"
                      :class="{ 'is-invalid': errors.donGia }"
                      min="0"
                      step="1000"
                      required
                    >
                    <div v-if="errors.donGia" class="invalid-feedback">
                      {{ errors.donGia }}
                    </div>
                  </div>


                </div>
              </div>



              <!-- Buttons -->
              <div class="d-flex justify-content-between">
                <button 
                  type="button" 
                  class="btn btn-secondary"
                  @click="$router.go(-1)"
                >
                  <i class="bi bi-arrow-left me-1"></i>
                  Quay Lại
                </button>
                
                <button 
                  type="submit" 
                  class="btn btn-primary"
                  :disabled="loading"
                >
                  <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                  <i v-else class="bi bi-plus-circle me-1"></i>
                  {{ loading ? 'Đang thêm...' : 'Thêm Sách' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { sachService } from '../../services/Sach.service.js'
import { publisherService } from '../../services/publisher.service.js'

export default {
  name: 'AddBook',
  setup() {
    const router = useRouter()
    const loading = ref(false)
    const publishers = ref([])
    
    const form = reactive({
      tenSach: '',
      tacGia: '',
      namXuatBan: new Date().getFullYear(),
      maNXB: '',
      soLuong: 1,
      donGia: 0
    })
    
    const errors = reactive({})
    
    const loadPublishers = async () => {
      try {
        const response = await publisherService.getAll()
        publishers.value = response.data.data || response.data || []
      } catch (error) {
        console.error('Error loading publishers:', error)
        alert('Không thể tải danh sách nhà xuất bản')
      }
    }
    
    const validateForm = () => {
      Object.keys(errors).forEach(key => delete errors[key])
      
      if (!form.tenSach.trim()) {
        errors.tenSach = 'Tên sách là bắt buộc'
      }
      
      if (!form.tacGia.trim()) {
        errors.tacGia = 'Tác giả là bắt buộc'
      }
      
      if (!form.soLuong || form.soLuong < 1) {
        errors.soLuong = 'Số lượng phải lớn hơn 0'
      }
      
      if (!form.donGia || form.donGia < 0) {
        errors.donGia = 'Đơn giá phải lớn hơn hoặc bằng 0'
      }
      
      if (form.namXuatBan && (form.namXuatBan < 1900 || form.namXuatBan > new Date().getFullYear())) {
        errors.namXuatBan = 'Năm xuất bản không hợp lệ'
      }
      
      return Object.keys(errors).length === 0
    }
    
    const submitForm = async () => {
      if (!validateForm()) return
      
      loading.value = true
      
      try {
        const bookData = {
          tenSach: form.tenSach.trim(),
          tacGia: form.tacGia.trim(),
          namXuatBan: form.namXuatBan || null,
          maNXB: form.maNXB || null,
          soLuong: form.soLuong, // Backend sẽ map thành soQuyen
          donGia: form.donGia
        }
        
        await sachService.create(bookData)
        
        // Hiển thị thông báo thành công
        alert('Thêm sách thành công!')
        
        // Redirect về danh sách sách
        router.push('/admin/books')
        
      } catch (error) {
        console.error('Error creating book:', error)
        alert('Có lỗi xảy ra: ' + (error.response?.data?.message || error.message))
      } finally {
        loading.value = false
      }
    }
    
    onMounted(() => {
      loadPublishers()
    })
    
    return {
      form,
      errors,
      loading,
      publishers,
      submitForm
    }
  }
}
</script>

<style scoped>
.card {
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
  border: 1px solid rgba(0, 0, 0, 0.125);
}

.card-header {
  background-color: #f8f9fa;
  border-bottom: 1px solid rgba(0, 0, 0, 0.125);
}

.form-label {
  font-weight: 500;
}

.text-danger {
  color: #dc3545 !important;
}

.btn-primary {
  background-color: #0d6efd;
  border-color: #0d6efd;
}

.btn-primary:hover {
  background-color: #0b5ed7;
  border-color: #0a58ca;
}

.form-text a {
  color: #0d6efd;
  font-size: 0.875rem;
}

.form-text a:hover {
  color: #0b5ed7;
}
</style>
