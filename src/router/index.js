import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "../stores/auth.js";
import NotFound from "../views/NotFound.vue";
// Lazy load components
const Home = () => import("../views/Home.vue");
const Login = () => import("../views/Login.vue");
const Register = () => import("../views/Register.vue");
const BookList = () => import("../views/BookList.vue");
const BookDetail = () => import("../views/BookDetail.vue");
const Profile = () => import("../views/Profile.vue");
const MyBorrowings = () => import("../views/MyBorrowings.vue");

// Admin views
const AdminBooks = () => import("../views/admin/AdminBooks.vue");
const AdminBorrowings = () => import("../views/admin/AdminBorrowings.vue");
const AdminPublishers = () => import("../views/admin/AdminPublishers.vue");
const AddBook = () => import("../views/admin/AddBook.vue");
const AddPublisher = () => import("../views/admin/AddPublisher.vue");
const UserManagement = () => import("../views/admin/UserManagement.vue");

const routes = [
  {
    path: "/",
    name: "Home",
    component: Home,
  },
  {
    path: "/login",
    name: "Login",
    component: Login,
    meta: { guest: true },
  },
  {
    path: "/register",
    name: "Register",
    component: Register,
    meta: { guest: true },
  },
  {
    path: "/books",
    name: "BookList",
    component: BookList,
  },
  {
    path: "/books/:id",
    name: "BookDetail",
    component: BookDetail,
    props: true,
  },
  {
    path: "/profile",
    name: "Profile",
    component: Profile,
    meta: { requiresAuth: true },
  },
  {
    path: "/my-borrowings",
    name: "MyBorrowings",
    component: MyBorrowings,
    meta: { requiresAuth: true, requiresDocGia: true },
  },
  {
    path: "/admin/books",
    name: "AdminBooks",
    component: AdminBooks,
    meta: { requiresAuth: true, requiresNhanVien: true },
  },
  {
    path: "/admin/publishers",
    name: "AdminPublishers",
    component: AdminPublishers,
    meta: { requiresAuth: true, requiresNhanVien: true },
  },
  {
    path: "/admin/add-book",
    name: "AddBook",
    component: AddBook,
    meta: { requiresAuth: true, requiresNhanVien: true },
  },
  {
    path: "/admin/add-publisher",
    name: "AddPublisher",
    component: AddPublisher,
    meta: { requiresAuth: true, requiresNhanVien: true },
  },
  {
    path: "/admin/borrowings",
    name: "AdminBorrowings",
    component: AdminBorrowings,
    meta: { requiresAuth: true, requiresNhanVien: true },
  },
  {
    path: "/admin/users",
    name: "UserManagement",
    component: UserManagement,
    meta: {
      requiresAuth: true,
      requiresNhanVien: true,
      requiresAdmin: true, // Thêm meta này để kiểm tra admin
    },
  },
  {
    path: "/:pathMatch(.*)*",
    name: "NotFound",
    component: NotFound,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Route guard
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();

  // Khôi phục auth state nếu chưa có
  if (!authStore.isAuthenticated && authStore.token) {
    authStore.restoreAuth();
  }

  // Kiểm tra route cần đăng nhập
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next("/login");
    return;
  }

  // Kiểm tra route cần quyền nhân viên
  if (to.meta.requiresNhanVien && !authStore.isNhanVien) {
    next({ name: "NotFound" });
    return;
  }
  // Kiểm tra route chỉ dành cho độc giả
  if (to.meta.requiresDocGia && !authStore.isDocGia) {
    next({ name: "NotFound" });
    return;
  }
  // Kiểm tra route chỉ dành cho guest (chưa đăng nhập)
  if (to.meta.guest && authStore.isAuthenticated) {
    next("/");
    return;
  }

  next();
});

export default router;
