<template>
  <div class="book-list">
    <div class="container py-4">
      <!-- Header -->
      <div class="row mb-4">
        <div class="col">
          <h1 class="fw-bold text-center mb-4">Danh Sách Sách</h1>
          
          <!-- Search and Filters -->
          <div class="card shadow-sm">
            <div class="card-body">
              <div class="row g-3">
                <div class="col-md-6">
                  <div class="input-group">
                    <input
                      type="text"
                      class="form-control"
                      placeholder="Tìm kiếm sách theo tên, tác giả..."
                      v-model="searchKeyword"
                      @keyup.enter="handleSearch"
                    >
                    <button class="btn btn-primary" @click="handleSearch">
                      <i class="bi bi-search"></i>
                    </button>
                  </div>
                </div>
                <div class="col-md-6">
                  <select class="form-select" v-model="sortBy" @change="handleSearch">
                    <option value="">Sắp xếp theo</option>
                    <option value="tenSach">Tên sách A-Z</option>
                    <option value="-tenSach">Tên sách Z-A</option>
                    <option value="namXuatBan">Năm xuất bản cũ</option>
                    <option value="-namXuatBan">Năm xuất bản mới</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="sachStore.loading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p class="mt-2 text-muted">Đang tải danh sách sách...</p>
      </div>

      <!-- Error -->
      <div v-if="sachStore.error" class="alert alert-danger" role="alert">
        <i class="bi bi-exclamation-circle me-2"></i>
        {{ sachStore.error }}
        <button class="btn btn-sm btn-outline-danger ms-2" @click="retryFetch">
          Thử lại
        </button>
      </div>

      <!-- Book Grid -->
      <div v-if="!sachStore.loading && sachStore.books.length > 0" class="row g-4 mb-4">
        <div 
          class="col-xl-3 col-lg-4 col-md-6" 
          v-for="book in sachStore.books" 
          :key="book._id"
        >
          <BookCard 
            :book="book" 
            :can-borrow="authStore.isAuthenticated && !authStore.isAdmin"
            @borrow="handleBorrow"
          />
        </div>
      </div>

      <!-- No Results -->
      <div v-if="!sachStore.loading && sachStore.books.length === 0" class="text-center py-5">
        <i class="bi bi-search display-4 text-muted mb-3"></i>
        <h4 class="text-muted">Không tìm thấy sách nào</h4>
        <p class="text-muted">Hãy thử điều chỉnh từ khóa tìm kiếm hoặc bộ lọc</p>
        <button class="btn btn-primary" @click="clearFilters">
          Xóa bộ lọc
        </button>
      </div>

      <!-- Pagination -->
      <nav v-if="sachStore.pagination.totalPages > 1" aria-label="Book pagination">
        <ul class="pagination justify-content-center">
          <li class="page-item" :class="{ disabled: sachStore.pagination.page <= 1 }">
            <button 
              class="page-link" 
              @click="changePage(sachStore.pagination.page - 1)"
              :disabled="sachStore.pagination.page <= 1"
            >
              <i class="bi bi-chevron-left"></i>
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
          
          <li 
            class="page-item" 
            :class="{ disabled: sachStore.pagination.page >= sachStore.pagination.totalPages }"
          >
            <button 
              class="page-link" 
              @click="changePage(sachStore.pagination.page + 1)"
              :disabled="sachStore.pagination.page >= sachStore.pagination.totalPages"
            >
              <i class="bi bi-chevron-right"></i>
            </button>
          </li>
        </ul>
        
        <div class="text-center text-muted">
          Trang {{ sachStore.pagination.page }} / {{ sachStore.pagination.totalPages }} 
          ({{ sachStore.pagination.total }} sách)
        </div>
      </nav>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth.js'
import { useSachStore } from '../stores/sach.js'
import BookCard from '../components/BookCard.vue'

export default {
  name: 'BookList',
  components: {
    BookCard
  },
  setup() {
    const authStore = useAuthStore()
    const sachStore = useSachStore()
    
    const searchKeyword = ref('')
    const sortBy = ref('')

    const visiblePages = computed(() => {
      const current = sachStore.pagination.page
      const total = sachStore.pagination.totalPages
      const delta = 2
      
      let start = Math.max(1, current - delta)
      let end = Math.min(total, current + delta)
      
      // Adjust if we're near the beginning or end
      if (end - start < delta * 2) {
        if (start === 1) {
          end = Math.min(total, start + delta * 2)
        } else if (end === total) {
          start = Math.max(1, end - delta * 2)
        }
      }
      
      const pages = []
      for (let i = start; i <= end; i++) {
        pages.push(i)
      }
      return pages
    })

    const handleSearch = async () => {
      const params = {}
      
      if (searchKeyword.value.trim()) {
        params.search = searchKeyword.value.trim()
      }
      
      if (sortBy.value) {
        params.sort = sortBy.value
      }
      
      sachStore.pagination.page = 1 // Reset to first page
      await sachStore.fetchBooks(params)
    }

    const handleBorrow = async (bookId) => {
      // TODO: Implement borrow functionality
      console.log('Borrow book:', bookId)
    }

    const changePage = async (page) => {
      if (page >= 1 && page <= sachStore.pagination.totalPages) {
        sachStore.pagination.page = page
        const params = {}
        
        if (searchKeyword.value.trim()) {
          params.search = searchKeyword.value.trim()
        }
        
        if (sortBy.value) {
          params.sort = sortBy.value
        }
        
        await sachStore.fetchBooks(params)
      }
    }

    const clearFilters = () => {
      searchKeyword.value = ''
      sortBy.value = ''
      sachStore.fetchBooks()
    }

    const retryFetch = () => {
      sachStore.clearError()
      sachStore.fetchBooks()
    }

    onMounted(() => {
      sachStore.fetchBooks()
    })

    return {
      authStore,
      sachStore,
      searchKeyword,
      sortBy,
      visiblePages,
      handleSearch,
      handleBorrow,
      changePage,
      clearFilters,
      retryFetch
    }
  }
}
</script>

<style scoped>
.book-list {
  background-color: #f8f9fa;
  min-height: 100vh;
}

.pagination .page-link {
  color: #007bff;
  border-color: #dee2e6;
}

.pagination .page-item.active .page-link {
  background-color: #007bff;
  border-color: #007bff;
}

.pagination .page-link:hover {
  color: #0056b3;
  background-color: #e9ecef;
  border-color: #dee2e6;
}

.form-select:focus,
.form-control:focus {
  border-color: #007bff;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}
</style>
