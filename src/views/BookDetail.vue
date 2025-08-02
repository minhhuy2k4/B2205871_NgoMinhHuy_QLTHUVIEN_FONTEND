<template>
  <div class="book-detail">
    <div class="container py-4">
      <!-- Loading -->
      <div v-if="loading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p class="mt-2 text-muted">Đang tải thông tin sách...</p>
      </div>

      <!-- Error -->
      <div v-if="error" class="alert alert-danger" role="alert">
        <i class="bi bi-exclamation-circle me-2"></i>
        {{ error }}
        <button class="btn btn-sm btn-outline-danger ms-2" @click="fetchBook">
          Thử lại
        </button>
      </div>

      <!-- Book Details -->
      <div v-if="book && !loading" class="row">
        <div class="col-lg-4 mb-4">
          <div class="card">
            <div class="card-body text-center">
              <div class="book-cover mb-3">
                <i class="bi bi-book display-1 text-muted"></i>
              </div>
              <h4 class="card-title">{{ book.tenSach }}</h4>
              <p class="text-muted mb-3">{{ book.tacGia }}</p>

              <div v-if="authStore.isAuthenticated && !authStore.isNhanVien" class="d-grid">
                <button 
                  class="btn btn-primary"
                  @click="handleBorrow"
                  :disabled="(book.soQuyen || 0) <= 0 || borrowing"
                >
                  <span v-if="borrowing" class="spinner-border spinner-border-sm me-2"></span>
                  <i v-else class="bi bi-bookmark-plus me-2"></i>
                  {{ borrowing ? 'Đang mượn...' : 'Mượn sách này' }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="col-lg-8">
          <div class="card">
            <div class="card-header">
              <h5 class="card-title mb-0">
                <i class="bi bi-info-circle me-2"></i>
                Thông tin chi tiết
              </h5>
            </div>
            <div class="card-body">
              <div class="row mb-3">
                <div class="col-sm-3">
                  <strong>Tên sách:</strong>
                </div>
                <div class="col-sm-9">
                  {{ book.tenSach }}
                </div>
              </div>

              <div class="row mb-3">
                <div class="col-sm-3">
                  <strong>Tác giả:</strong>
                </div>
                <div class="col-sm-9">
                  {{ book.tacGia }}
                </div>
              </div>

              <div class="row mb-3">
                <div class="col-sm-3">
                  <strong>Nhà xuất bản:</strong>
                </div>
                <div class="col-sm-9">
                  {{ book.nhaXuatBan?.tenNXB || book.maNXB || 'Chưa xác định' }}
                </div>
              </div>

              <div class="row mb-3">
                <div class="col-sm-3">
                  <strong>Năm xuất bản:</strong>
                </div>
                <div class="col-sm-9">
                  {{ book.namXuatBan }}
                </div>
              </div>

              <div class="row mb-3">
                <div class="col-sm-3">
                  <strong>Số lượng:</strong>
                </div>
                <div class="col-sm-9">
                  <span class="badge bg-success">
                    {{ book.soQuyen }} cuốn
                  </span>
                </div>
              </div>

              <div class="row">
                <div class="col-sm-3">
                  <strong>Ngày thêm:</strong>
                </div>
                <div class="col-sm-9">
                  {{ formatDate(book.createdAt) }}
                </div>
              </div>
            </div>
          </div>

          <!-- Admin Actions -->
          <div v-if="authStore.isAdmin" class="card mt-4">
            <div class="card-header">
              <h5 class="card-title mb-0">
                <i class="bi bi-tools me-2"></i>
                Thao tác quản trị
              </h5>
            </div>
            <div class="card-body">
              <div class="btn-group" role="group">
                <button class="btn btn-outline-primary" @click="editBook">
                  <i class="bi bi-pencil me-1"></i>
                  Chỉnh sửa
                </button>
                <button class="btn btn-outline-danger" @click="deleteBook">
                  <i class="bi bi-trash me-1"></i>
                  Xóa sách
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Navigation -->
      <div class="text-center mt-4">
        <router-link to="/books" class="btn btn-secondary">
          <i class="bi bi-arrow-left me-2"></i>
          Quay lại danh sách
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'
import { sachService } from '../services/Sach.service.js'
import { muonSachService } from '../services/muonsach.service.js'

export default {
  name: 'BookDetail',
  setup() {
    const route = useRoute()
    const router = useRouter()
    const authStore = useAuthStore()
    
    const book = ref(null)
    const loading = ref(false)
    const error = ref('')
    const borrowing = ref(false)

    const fetchBook = async () => {
      loading.value = true
      error.value = ''
      
      try {
        console.log('Fetching book with ID:', route.params.id)
        const response = await sachService.getById(route.params.id)
        console.log('Book response:', response)
        book.value = response.data.data // Backend trả về {message, data}
        console.log('Book data:', book.value)
      } catch (err) {
        error.value = 'Không thể tải thông tin sách'
        console.error('Lỗi khi tải sách:', err)
      } finally {
        loading.value = false
      }
    }

    const handleBorrow = async () => {
      if (!authStore.isAuthenticated) {
        router.push('/login')
        return
      }

      if (!book.value || (book.value.soQuyen || 0) <= 0) {
        alert('Sách đã hết, không thể mượn')
        return
      }

      borrowing.value = true
      try {
        await muonSachService.borrowBook(book.value._id, {
          docGiaId: authStore.user.id,
          ghiChu: ''
        })
        
        // Cập nhật số lượng sách sau khi mượn thành công
        book.value.soQuyen = (book.value.soQuyen || 0) - 1
        
        alert('Mượn sách thành công!')
        
        // Chuyển đến trang sách đã mượn
        router.push('/my-borrowings')
      } catch (err) {
        console.error('Lỗi khi mượn sách:', err)
        alert(err.response?.data?.message || 'Có lỗi xảy ra khi mượn sách')
      } finally {
        borrowing.value = false
      }
    }

    const editBook = () => {
      // TODO: Navigate to edit form
      router.push(`/admin/books/edit/${book.value._id}`)
    }

    const deleteBook = async () => {
      if (confirm('Bạn có chắc chắn muốn xóa sách này?')) {
        try {
          await sachService.delete(book.value._id)
          alert('Xóa sách thành công!')
          router.push('/admin/books')
        } catch (err) {
          alert('Có lỗi xảy ra khi xóa sách')
        }
      }
    }

    const formatDate = (dateString) => {
      if (!dateString) return 'Không xác định'
      return new Date(dateString).toLocaleDateString('vi-VN')
    }

    onMounted(() => {
      fetchBook()
    })

    return {
      authStore,
      book,
      loading,
      error,
      borrowing,
      fetchBook,
      handleBorrow,
      editBook,
      deleteBook,
      formatDate
    }
  }
}
</script>

<style scoped>
.book-detail {
  background-color: #f8f9fa;
  min-height: 100vh;
}

.book-cover {
  padding: 2rem;
  background: linear-gradient(145deg, #f8f9fa, #e9ecef);
  border-radius: 0.5rem;
  margin-bottom: 1rem;
}

.card {
  border: none;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
}

.row.mb-3 {
  border-bottom: 1px solid #f8f9fa;
  padding-bottom: 0.75rem;
}

.row.mb-3:last-child {
  border-bottom: none;
}
</style>
