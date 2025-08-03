<template>
  <div class="not-found text-center py-5">
    <h1 class="display-1 text-primary">404</h1>
    <h2 class="mb-3">Không tìm thấy trang</h2>
    <p class="text-muted mb-4">
      Trang bạn tìm kiếm không tồn tại hoặc đã bị xóa.<br>
      Vui lòng kiểm tra lại đường dẫn hoặc quay về trang chủ.
    </p>
    <router-link to="/" class="btn btn-primary">
      Quay về trang chủ
    </router-link>
  </div>
</template>

<script>
export default {
  name: 'NotFound'
}
</script>

<style scoped>
.not-found {
  min-height: 60vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
</style>