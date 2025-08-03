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

              <!-- Nút mượn sách với alert xác nhận -->
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

              <!-- Hiển thị thông báo nếu chưa đăng nhập -->
              <div v-else-if="!authStore.isAuthenticated" class="d-grid">
                <router-link to="/login" class="btn btn-outline-primary">
                  <i class="bi bi-box-arrow-in-right me-2"></i>
                  Đăng nhập để mượn sách
                </router-link>
              </div>

              <!-- Hiển thị thông báo nếu là nhân viên -->
              <div v-else-if="authStore.isNhanVien" class="text-muted">
                <i class="bi bi-info-circle me-1"></i>
                Chỉ độc giả mới có thể mượn sách
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
                  <span class="badge" :class="(book.soQuyen || 0) > 0 ? 'bg-success' : 'bg-danger'">
                    {{ book.soQuyen || 0 }} cuốn
                  </span>
                  <span v-if="(book.soQuyen || 0) <= 0" class="text-danger ms-2">
                    <i class="bi bi-exclamation-circle me-1"></i>
                    Hết sách
                  </span>
                </div>
              </div>

              <div class="row">
                <div class="col-sm-3">
                  <strong>Ngày thêm:</strong>
                </div>
                <div class="col-sm-9">
                  {{ formatDate(book.ngayTao) }}
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

    // Cập nhật function handleBorrow với alert xác nhận giống BookCard
    const handleBorrow = async () => {
      // Kiểm tra đăng nhập
      if (!authStore.isAuthenticated) {
        router.push('/login')
        return
      }

      // Kiểm tra role (chỉ độc giả mới được mượn)
      if (authStore.user?.role !== 'docgia') {
        alert('Chỉ độc giả mới có thể mượn sách!')
        return
      }

      // Kiểm tra sách có sẵn
      if (!book.value || (book.value.soQuyen || 0) <= 0) {
        alert('Sách đã hết, không thể mượn!')
        return
      }

      // Alert xác nhận giống BookCard
      const confirmBorrow = confirm(
        `Bạn có chắc chắn muốn mượn sách "${book.value.tenSach}" không?\n\n` +
        `Tác giả: ${book.value.tacGia}\n` +
        `Nhà xuất bản: ${book.value.nhaXuatBan?.tenNXB || book.value.maNXB || 'Chưa xác định'}\n` +
        `Năm xuất bản: ${book.value.namXuatBan}\n` +
        `Số lượng còn: ${book.value.soQuyen} cuốn\n\n` +
        `Yêu cầu sẽ được gửi đến admin để phê duyệt.`
      )

      if (!confirmBorrow) {
        return
      }

      borrowing.value = true
      
      try {
        console.log('📤 Sending borrow request for book:', book.value._id)
        
        // Gửi yêu cầu mượn sách (sẽ tạo với trạng thái "Chờ duyệt")
        const response = await muonSachService.create({
          sachId: book.value._id,
          ghiChu: `Yêu cầu mượn sách từ trang chi tiết: ${book.value.tenSach}`
        })
        
        console.log('✅ Borrow success:', response)
        
        // Alert thành công giống BookCard
        alert('Gửi yêu cầu mượn sách thành công! Vui lòng chờ admin phê duyệt.')
        
        // Giảm số lượng sách trong UI (optional)
        if (book.value.soQuyen > 0) {
          book.value.soQuyen -= 1
        }
        
        // Hỏi có muốn xem danh sách sách đã mượn không
        const goToMyBorrowings = confirm(
          'Bạn có muốn xem danh sách sách đã mượn không?'
        )
        
        if (goToMyBorrowings) {
          router.push('/my-borrowings')
        }
        
      } catch (error) {
        console.error('❌ Borrow error:', error)
        
        let errorMessage = 'Có lỗi xảy ra khi gửi yêu cầu mượn sách'
        
        if (error.response?.data?.message) {
          errorMessage = error.response.data.message
        } else if (error.response?.status === 400) {
          errorMessage = 'Bạn đã có yêu cầu mượn sách này hoặc đã vượt quá giới hạn mượn sách'
        } else if (error.response?.status === 401) {
          errorMessage = 'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại'
          // Chuyển về trang login
          router.push('/login')
        } else if (error.response?.status === 404) {
          errorMessage = 'Không tìm thấy sách hoặc tài khoản'
        }
        
        // Alert lỗi giống BookCard
        alert(errorMessage)
        
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
  transition: transform 0.2s ease;
}

.card:hover {
  transform: translateY(-2px);
}

.row.mb-3 {
  border-bottom: 1px solid #f8f9fa;
  padding-bottom: 0.75rem;
}

.row.mb-3:last-child {
  border-bottom: none;
}

.btn:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.spinner-border-sm {
  width: 0.875rem;
  height: 0.875rem;
}

/* Button hover effects */
.btn-primary:hover:not(:disabled) {
  background-color: #0b5ed7;
  border-color: #0a58ca;
  transform: translateY(-1px);
}

.btn-outline-primary:hover {
  background-color: #0d6efd;
  border-color: #0d6efd;
  color: white;
  transform: translateY(-1px);
}

.btn-secondary:hover {
  background-color: #5c636a;
  border-color: #565e64;
  transform: translateY(-1px);
}

/* Badge styling */
.badge.bg-success {
  background-color: #198754 !important;
}

.badge.bg-danger {
  background-color: #dc3545 !important;
}

/* Alert styling */
.alert {
  border-radius: 0.5rem;
  border: none;
}

/* Responsive */
@media (max-width: 768px) {
  .book-cover {
    padding: 1rem;
  }
  
  .btn-group {
    flex-direction: column;
  }
  
  .btn-group .btn {
    margin-bottom: 0.5rem;
  }
}
</style>
