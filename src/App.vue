<template>
  <div id="app">
    <NavBar />
    <main class="container-fluid px-0">
      <RouterView />
    </main>
  </div>
</template>

<script>
import NavBar from './components/NavBar.vue'
import { useAuthStore } from './stores/auth.js'

export default {
  name: 'App',
  components: {
    NavBar
  },
  setup() {
    const authStore = useAuthStore()
    
    // Khôi phục auth state khi app khởi động
    authStore.restoreAuth()
  }
}
</script>

<style>
body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: #f8f9fa;
}

.main-content {
  min-height: calc(100vh - 80px);
  padding-top: 20px;
}

.card-hover:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  transition: all 0.3s ease;
}

.btn-custom {
  border-radius: 25px;
  padding: 8px 20px;
  font-weight: 500;
}

.text-primary-custom {
  color: #007bff !important;
}

.bg-primary-custom {
  background-color: #007bff !important;
}
</style>