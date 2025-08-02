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
          <span class="badge bg-success">
            {{ book.soQuyen }} cuốn
          </span>
        </div>
        
        <div class="d-grid gap-2">
          <router-link 
            :to="`/books/${book._id}`" 
            class="btn btn-primary btn-sm"
          >
            Xem chi tiết
          </router-link>
          <button 
            v-if="canBorrow" 
            class="btn btn-outline-success btn-sm"
            @click="$emit('borrow', book._id)"
            :disabled="book.soQuyen <= 0"
          >
            <i class="bi bi-bookmark-plus me-1"></i>
            Mượn sách
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
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
  emits: ['borrow']
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
}

.card-text {
  font-size: 0.9rem;
}

.badge {
  font-size: 0.75rem;
}
</style>
