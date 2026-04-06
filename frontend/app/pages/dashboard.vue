<template>
  <div class="container dashboard">
    <div class="dash-header">
      <div>
        <h1>Learning Dashboard</h1>
        <p class="dash-subtitle">Welcome, {{ auth.isGuest ? 'Guest' : auth.user?.username }}! Pick up where you left off.</p>
      </div>
      <div class="dash-stats">
        <div class="stat-item">
          <span class="stat-value">{{ progress.completedCount }}</span>
          <span class="stat-label">Completed</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">{{ modules.length }}</span>
          <span class="stat-label">Total</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">{{ overallPercent }}%</span>
          <span class="stat-label">Progress</span>
        </div>
      </div>
    </div>

    <!-- Overall progress bar -->
    <div class="overall-progress">
      <div class="progress-bar">
        <div class="progress-bar-fill" :style="{ width: overallPercent + '%' }"></div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Loading modules...</p>
    </div>

    <!-- Module cards -->
    <div v-else class="module-grid">
      <div
        v-for="mod in modules"
        :key="mod.id"
        class="card module-card"
        :class="{ 'module-completed': isCompleted(mod.id) }"
      >
        <div class="module-order">{{ mod.order }}</div>
        <div class="module-info">
          <h3>{{ mod.title }}</h3>
          <p>{{ mod.description }}</p>
          <div class="module-meta">
            <span class="badge" :class="typeBadge(mod.type)">{{ mod.type }}</span>
            <span v-if="getScore(mod.id) > 0" class="module-score">
              Score: {{ getScore(mod.id) }}%
            </span>
          </div>
        </div>
        <div class="module-action">
          <NuxtLink :to="`/modules/${mod.id}`" class="btn" :class="isCompleted(mod.id) ? 'btn-secondary' : 'btn-primary'">
            {{ isCompleted(mod.id) ? 'Review' : 'Start' }}
          </NuxtLink>
          <span v-if="isCompleted(mod.id)" class="completed-check">✅</span>
        </div>
      </div>
    </div>

    <!-- Quick links -->
    <div class="quick-links">
      <h3>Quick Access</h3>
      <div class="quick-grid">
        <NuxtLink to="/keywords" class="card quick-card">
          <span class="quick-icon">🃏</span>
          <span>Keyword Flashcards</span>
        </NuxtLink>
        <NuxtLink to="/strategies" class="card quick-card">
          <span class="quick-icon">🏆</span>
          <span>Strategy Guides</span>
        </NuxtLink>
        <NuxtLink to="/progress" class="card quick-card">
          <span class="quick-icon">📊</span>
          <span>Progress Tracker</span>
        </NuxtLink>
        <NuxtLink to="/settings" class="card quick-card">
          <span class="quick-icon">⚙️</span>
          <span>Settings</span>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const auth = useAuthStore();
const progress = useProgressStore();
const api = useApi();

const modules = ref<any[]>([]);
const loading = ref(true);

const overallPercent = computed(() => {
  if (modules.value.length === 0) return 0;
  return Math.round((progress.completedCount / modules.value.length) * 100);
});

function isCompleted(moduleId: number): boolean {
  const p = progress.getModuleProgress(moduleId);
  return p?.completed ?? false;
}

function getScore(moduleId: number): number {
  const p = progress.getModuleProgress(moduleId);
  return p?.score ?? 0;
}

function typeBadge(type: string): string {
  if (type === 'quiz') return 'badge-yellow';
  if (type === 'practice') return 'badge-blue';
  return 'badge-green';
}

onMounted(async () => {
  if (!auth.isLoggedIn) {
    navigateTo('/login');
    return;
  }
  try {
    const [mods] = await Promise.all([
      api.get<any[]>('/api/modules'),
      progress.fetchProgress(),
    ]);
    modules.value = mods;
  } catch (e) {
    console.error('Dashboard load error:', e);
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.dashboard { padding-bottom: 3rem; }

.dash-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
}
.dash-header h1 { font-size: 1.75rem; }
.dash-subtitle { color: var(--color-text-muted); margin-top: 0.25rem; }

.dash-stats {
  display: flex;
  gap: 1.5rem;
}
.stat-item { text-align: center; }
.stat-value {
  display: block;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-primary);
}
.stat-label {
  font-size: 0.75rem;
  color: var(--color-text-dim);
  text-transform: uppercase;
}

.overall-progress { margin-bottom: 2rem; }

.loading-state {
  text-align: center;
  padding: 3rem;
  color: var(--color-text-muted);
}
.loading-state .spinner { margin: 0 auto 1rem; }

.module-grid {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 3rem;
}

.module-card {
  display: flex;
  align-items: center;
  gap: 1.25rem;
}
.module-card:hover { transform: none; border-color: var(--color-primary); }
.module-completed { border-color: rgba(34,197,94,0.3); }

.module-order {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg-elevated);
  border-radius: 50%;
  font-weight: 700;
  font-size: 1.25rem;
  color: var(--color-primary);
  flex-shrink: 0;
}

.module-info { flex: 1; }
.module-info h3 { font-size: 1.05rem; margin-bottom: 0.25rem; }
.module-info p { color: var(--color-text-muted); font-size: 0.85rem; margin-bottom: 0.5rem; }
.module-meta { display: flex; align-items: center; gap: 0.75rem; }
.module-score { color: var(--color-secondary); font-size: 0.8rem; font-weight: 600; }

.module-action {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
}
.completed-check { font-size: 1.25rem; }

.quick-links { margin-top: 2rem; }
.quick-links h3 { margin-bottom: 1rem; font-size: 1.25rem; }
.quick-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}
.quick-card {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  text-decoration: none;
  color: var(--color-text);
  cursor: pointer;
}
.quick-icon { font-size: 1.5rem; }

@media (max-width: 768px) {
  .module-card { flex-direction: column; align-items: flex-start; }
  .module-action { width: 100%; }
  .module-action .btn { flex: 1; }
}
</style>
