<template>
  <div class="container mt-4">
    <div class="row justify-content-center">
      <div class="col-md-8">
        <div class="card">
          <div class="card-header">
            <h4 class="mb-0">
              <i class="bi bi-building-add me-2"></i>
              Thêm Nhà Xuất Bản
            </h4>
          </div>
          <div class="card-body">
            <form @submit.prevent="submitForm">
              <div class="mb-3">
                <label for="tenNXB" class="form-label">Tên Nhà Xuất Bản <span class="text-danger">*</span></label>
                <input
                  type="text"
                  class="form-control"
                  id="tenNXB"
                  v-model="form.tenNXB"
                  :class="{ 'is-invalid': errors.tenNXB }"
                  required
                >
                <div v-if="errors.tenNXB" class="invalid-feedback">
                  {{ errors.tenNXB }}
                </div>
              </div>

              <div class="mb-3">
                <label for="diaChi" class="form-label">Địa Chỉ</label>
                <textarea
                  class="form-control"
                  id="diaChi"
                  v-model="form.diaChi"
                  rows="3"
                  :class="{ 'is-invalid': errors.diaChi }"
                ></textarea>
                <div v-if="errors.diaChi" class="invalid-feedback">
                  {{ errors.diaChi }}
                </div>
              </div>

              <div class="mb-3">
                <label for="soDienThoai" class="form-label">Số Điện Thoại</label>
                <input
                  type="tel"
                  class="form-control"
                  id="soDienThoai"
                  v-model="form.soDienThoai"
                  :class="{ 'is-invalid': errors.soDienThoai }"
                >
                <div v-if="errors.soDienThoai" class="invalid-feedback">
                  {{ errors.soDienThoai }}
                </div>
              </div>

              <div class="mb-3">
                <label for="email" class="form-label">Email</label>
                <input
                  type="email"
                  class="form-control"
                  id="email"
                  v-model="form.email"
                  :class="{ 'is-invalid': errors.email }"
                >
                <div v-if="errors.email" class="invalid-feedback">
                  {{ errors.email }}
                </div>
              </div>

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
                  {{ loading ? 'Đang thêm...' : 'Thêm Nhà Xuất Bản' }}
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
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { publisherService } from '../../services/publisher.service.js'

export default {
  name: 'AddPublisher',
  setup() {
    const router = useRouter()
    const loading = ref(false)
    
    const form = reactive({
      tenNXB: '',
      diaChi: '',
      soDienThoai: '',
      email: ''
    })
    
    const errors = reactive({})
    
    const validateForm = () => {
      Object.keys(errors).forEach(key => delete errors[key])
      
      if (!form.tenNXB.trim()) {
        errors.tenNXB = 'Tên nhà xuất bản là bắt buộc'
      }
      
      if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
        errors.email = 'Email không hợp lệ'
      }
      
      if (form.soDienThoai && !/^[0-9]{10,11}$/.test(form.soDienThoai.replace(/\s/g, ''))) {
        errors.soDienThoai = 'Số điện thoại không hợp lệ (10-11 số)'
      }
      
      return Object.keys(errors).length === 0
    }
    
    const submitForm = async () => {
      if (!validateForm()) return
      
      loading.value = true
      
      try {
        const publisherData = {
          tenNXB: form.tenNXB.trim(),
          diaChi: form.diaChi.trim() || null,
          soDienThoai: form.soDienThoai.trim() || null,
          email: form.email.trim() || null
        }
        
        await publisherService.create(publisherData)
        
        // Hiển thị thông báo thành công
        alert('Thêm nhà xuất bản thành công!')
        
        // Redirect về danh sách nhà xuất bản
        router.push('/admin/publishers')
        
      } catch (error) {
        console.error('Error creating publisher:', error)
        alert('Có lỗi xảy ra: ' + (error.response?.data?.message || error.message))
      } finally {
        loading.value = false
      }
    }
    
    return {
      form,
      errors,
      loading,
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
</style>
