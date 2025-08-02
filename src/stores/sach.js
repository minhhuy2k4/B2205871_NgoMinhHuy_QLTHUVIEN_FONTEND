import { defineStore } from "pinia";
import { sachService } from "../services/Sach.service.js";

export const useSachStore = defineStore("sach", {
  state: () => ({
    books: [],
    currentBook: null,
    loading: false,
    error: null,
    pagination: {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0,
    },
    searchKeyword: "",
  }),

  actions: {
    async fetchBooks(params = {}) {
      this.loading = true;
      this.error = null;

      try {
        const response = await sachService.getAll({
          page: this.pagination.page,
          limit: this.pagination.limit,
          ...params,
        });

        this.books = response.data.data || response.data;

        if (response.data.pagination) {
          this.pagination = {
            ...this.pagination,
            ...response.data.pagination,
          };
        }

        return { success: true };
      } catch (error) {
        this.error =
          error.response?.data?.message || "Lỗi khi tải danh sách sách";
        return { success: false, error: this.error };
      } finally {
        this.loading = false;
      }
    },

    async fetchBookById(id) {
      this.loading = true;
      this.error = null;

      try {
        const response = await sachService.getById(id);
        this.currentBook = response.data.data || response.data;
        return { success: true, data: response.data.data || response.data };
      } catch (error) {
        this.error =
          error.response?.data?.message || "Lỗi khi tải thông tin sách";
        return { success: false, error: this.error };
      } finally {
        this.loading = false;
      }
    },

    async createBook(bookData) {
      this.loading = true;
      this.error = null;

      try {
        const response = await sachService.create(bookData);
        await this.fetchBooks(); // Reload danh sách
        return { success: true, data: response.data.data || response.data };
      } catch (error) {
        this.error = error.response?.data?.message || "Lỗi khi tạo sách mới";
        return { success: false, error: this.error };
      } finally {
        this.loading = false;
      }
    },

    async updateBook(id, bookData) {
      this.loading = true;
      this.error = null;

      try {
        const response = await sachService.update(id, bookData);
        await this.fetchBooks(); // Reload danh sách
        return { success: true, data: response.data.data || response.data };
      } catch (error) {
        this.error = error.response?.data?.message || "Lỗi khi cập nhật sách";
        return { success: false, error: this.error };
      } finally {
        this.loading = false;
      }
    },

    async deleteBook(id) {
      this.loading = true;
      this.error = null;

      try {
        await sachService.delete(id);
        await this.fetchBooks(); // Reload danh sách
        return { success: true };
      } catch (error) {
        this.error = error.response?.data?.message || "Lỗi khi xóa sách";
        return { success: false, error: this.error };
      } finally {
        this.loading = false;
      }
    },

    async searchBooks(keyword) {
      this.searchKeyword = keyword;
      this.pagination.page = 1; // Reset về trang đầu

      if (keyword.trim()) {
        return await this.fetchBooks({ search: keyword });
      } else {
        return await this.fetchBooks();
      }
    },

    setPage(page) {
      this.pagination.page = page;
      this.fetchBooks();
    },

    clearCurrentBook() {
      this.currentBook = null;
    },

    clearError() {
      this.error = null;
    },
  },
});
