import { defineStore } from 'pinia';

interface ProgressItem {
  id: number;
  moduleId: number;
  completed: boolean;
  score: number;
  lastAccessed: string;
  module?: any;
}

export const useProgressStore = defineStore('progress', {
  state: () => ({
    items: [] as ProgressItem[],
    loading: false,
  }),

  getters: {
    completedCount: (state) => state.items.filter((p) => p.completed).length,
    totalModules: (state) => state.items.length,
    overallScore: (state) => {
      if (state.items.length === 0) return 0;
      const total = state.items.reduce((sum, p) => sum + p.score, 0);
      return Math.round(total / state.items.length);
    },
    getModuleProgress: (state) => (moduleId: number) => {
      return state.items.find((p) => p.moduleId === moduleId) || null;
    },
  },

  actions: {
    async fetchProgress() {
      this.loading = true;
      try {
        const api = useApi();
        this.items = await api.get<ProgressItem[]>('/api/progress');
      } catch {
        // Not logged in or no progress yet
        this.items = [];
      } finally {
        this.loading = false;
      }
    },

    async saveProgress(moduleId: number, completed: boolean, score: number) {
      try {
        const api = useApi();
        const result = await api.post<ProgressItem>('/api/progress', { moduleId, completed, score });
        // Update or add to local state
        const idx = this.items.findIndex((p) => p.moduleId === moduleId);
        if (idx >= 0) {
          this.items[idx] = result;
        } else {
          this.items.push(result);
        }
        return result;
      } catch (e) {
        console.error('Failed to save progress:', e);
        throw e;
      }
    },

    async resetProgress() {
      try {
        const api = useApi();
        await api.del('/api/progress');
        this.items = [];
      } catch (e) {
        console.error('Failed to reset progress:', e);
        throw e;
      }
    },
  },
});
