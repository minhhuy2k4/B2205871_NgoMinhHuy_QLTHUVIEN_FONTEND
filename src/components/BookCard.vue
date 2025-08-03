<template>
  <div class="card h-100 card-hover">
    <div class="card-body d-flex flex-column">
      <h5 class="card-title">{{ book.tenSach }}</h5>
      <p class="card-text text-muted mb-2">
        <i class="bi bi-person me-1"></i>
        {{ book.tacGia }}
      </p>
      <p class="card-text text-muted mb-2">
        <i class="bi bi-building me-1"></i>
        {{ book.nhaXuatBan?.tenNXB || 'Chưa xác định' }}
      </p>
      <p class="card-text text-muted mb-2">
        <i class="bi bi-calendar me-1"></i>
        {{ book.namXuatBan }}
      </p>
      
      <div class="mt-auto">
        <div class="d-flex justify-content-between align-items-center mb-2">
          <span class="badge" :class="book.soQuyen > 0 ? 'bg-success' : 'bg-danger'">
            {{ book.soQuyen }} cuốn
          </span>
          <span v-if="book.soQuyen <= 0" class="text-danger small">
            <i class="bi bi-exclamation-circle me-1"></i>Hết sách
          </span>
        </div>
        
        <div class="d-grid gap-2">
          <router-link 
            :to="`/books/${book._id}`" 
            class="btn btn-primary btn-sm"
          >
            <i class="bi bi-eye me-1"></i>
            Xem chi tiết
          </router-link>
          
          <!-- Nút mượn sách giống BookDetail -->
          <button 
            v-if="canBorrow" 
            class="btn btn-outline-success btn-sm"
            @click="handleBorrow"
            :disabled="book.soQuyen <= 0 || borrowing"
          >
            <span v-if="borrowing" class="spinner-border spinner-border-sm me-1"></span>
            <i v-else class="bi bi-bookmark-plus me-1"></i>
            {{ borrowing ? 'Đang mượn...' : 'Mượn sách' }}
          </button>
          
          <!-- Nút đăng nhập nếu chưa login -->
          <router-link 
            v-else-if="!authStore.isAuthenticated"
            to="/login" 
            class="btn btn-outline-primary btn-sm"
          >
            <i class="bi bi-box-arrow-in-right me-1"></i>
            Đăng nhập để mượn
          </router-link>
          
          <!-- Thông báo nếu không phải độc giả -->
          <span v-else-if="authStore.user?.role !== 'docgia'" class="text-muted small text-center">
            <i class="bi bi-info-circle me-1"></i>
            Chỉ độc giả mới có thể mượn sách
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'
import { muonSachService } from '../services/muonsach.service.js'

export default {
  name: 'BookCard',
  props: {
    book: {
      type: Object,
      required: true
    },
    canBorrow: {
      type: Boolean,
      default: false
    }
  },
  emits: ['borrowed', 'borrow-error'],
  setup(props, { emit }) {
    const router = useRouter()
    const authStore = useAuthStore()
    const borrowing = ref(false)

    // Hàm xử lý mượn sách giống hệt như BookDetail
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
      if (!props.book || (props.book.soQuyen || 0) <= 0) {
        alert('Sách đã hết, không thể mượn!')
        return
      }

      // Alert xác nhận giống BookDetail
      const confirmBorrow = confirm(
        `Bạn có chắc chắn muốn mượn sách "${props.book.tenSach}" không?\n\n` +
        `Tác giả: ${props.book.tacGia}\n` +
        `Số lượng còn: ${props.book.soQuyen} cuốn\n\n` +
        `Yêu cầu sẽ được gửi đến admin để phê duyệt.`
      )

      if (!confirmBorrow) {
        return
      }

      borrowing.value = true
      
      try {
        console.log('📤 Sending borrow request for book:', props.book._id)
        
        // Gửi yêu cầu mượn sách (sẽ tạo với trạng thái "Chờ duyệt")
        const response = await muonSachService.create({
          sachId: props.book._id,
          ghiChu: `Yêu cầu mượn sách từ danh sách: ${props.book.tenSach}`
        })
        
        console.log('✅ Borrow success:', response)
        
        // Alert thành công giống BookDetail
        alert('Gửi yêu cầu mượn sách thành công! Vui lòng chờ admin phê duyệt.')
        
        // Emit event để parent component cập nhật
        emit('borrowed', {
          bookId: props.book._id,
          bookTitle: props.book.tenSach,
          borrowData: response.data
        })
        
        // Giảm số lượng sách trong UI (optional)
        if (props.book.soQuyen > 0) {
          props.book.soQuyen -= 1
        }
        
        // Chuyển đến trang sách đã mượn (giống BookDetail)
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
        
        // Alert lỗi giống BookDetail
        alert(errorMessage)
        
        // Emit error event
        emit('borrow-error', {
          bookId: props.book._id,
          bookTitle: props.book.tenSach,
          error: errorMessage
        })
        
      } finally {
        borrowing.value = false
      }
    }

    return {
      router,
      authStore,
      borrowing,
      handleBorrow
    }
  }
}
</script>

<style scoped>
.card-hover {
  transition: all 0.3s ease;
  cursor: pointer;
}

.card-hover:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.15);
}

.card-title {
  font-weight: 600;
  color: #2c3e50;
  font-size: 1rem;
  line-height: 1.4;
  max-height: 2.8rem;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.card-text {
  font-size: 0.9rem;
}

.badge {
  font-size: 0.75rem;
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
.btn-outline-success:hover {
  background-color: #198754;
  border-color: #198754;
  color: white;
  transform: translateY(-1px);
}

.btn-outline-primary:hover {
  background-color: #0d6efd;
  border-color: #0d6efd;
  color: white;
  transform: translateY(-1px);
}

.btn-primary:hover {
  background-color: #0b5ed7;
  border-color: #0a58ca;
  transform: translateY(-1px);
}

/* Badge colors */
.bg-success {
  background-color: #198754 !important;
}

.bg-danger {
  background-color: #dc3545 !important;
}

/* Responsive adjustments */
@media (max-width: 576px) {
  .card-title {
    font-size: 0.9rem;
  }
  
  .card-text {
    font-size: 0.8rem;
  }
  
  .btn-sm {
    font-size: 0.8rem;
    padding: 0.25rem 0.5rem;
  }
}
</style>
