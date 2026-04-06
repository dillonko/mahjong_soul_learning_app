<template>
  <div class="container progress-page">
    <div class="page-header">
      <h1>📊 Progress Tracker</h1>
      <p>See how far you've come in your Mahjong learning journey.</p>
    </div>

    <div v-if="loading" class="loading-state"><div class="spinner"></div></div>

    <template v-else>
      <!-- Stats overview -->
      <div class="stats-grid">
        <div class="card stat-card">
          <div class="stat-icon">📚</div>
          <div class="stat-value">{{ progress.completedCount }} / {{ totalModules }}</div>
          <div class="stat-label">Modules Completed</div>
        </div>
        <div class="card stat-card">
          <div class="stat-icon">🎯</div>
          <div class="stat-value">{{ avgScore }}%</div>
          <div class="stat-label">Average Quiz Score</div>
        </div>
        <div class="card stat-card">
          <div class="stat-icon">{{ completionPercent === 100 ? '🏆' : '📈' }}</div>
          <div class="stat-value">{{ completionPercent }}%</div>
          <div class="stat-label">Overall Completion</div>
        </div>
      </div>

      <!-- Overall progress -->
      <div class="overall-section">
        <h3>Overall Progress</h3>
        <div class="progress-bar" style="height:12px">
          <div class="progress-bar-fill" :style="{ width: completionPercent + '%' }"></div>
        </div>
      </div>

      <!-- Per-module progress -->
      <div class="module-progress-list">
        <h3>Module Details</h3>
        <div v-for="mod in modules" :key="mod.id" class="card module-progress-card">
          <div class="mp-info">
            <div class="mp-order">{{ mod.order }}</div>
            <div>
              <h4>{{ mod.title }}</h4>
              <div class="mp-meta">
                <span v-if="getModProgress(mod.id)" class="badge" :class="getModProgress(mod.id)!.completed ? 'badge-green' : 'badge-yellow'">
                  {{ getModProgress(mod.id)!.completed ? 'Completed' : 'In Progress' }}
                </span>
                <span v-else class="badge badge-blue">Not Started</span>
                <span v-if="getModProgress(mod.id)?.score" class="mp-score">
                  Score: {{ getModProgress(mod.id)!.score }}%
                </span>
              </div>
            </div>
          </div>
          <div class="progress-bar">
            <div class="progress-bar-fill" :style="{ width: (getModProgress(mod.id)?.completed ? 100 : getModProgress(mod.id) ? 50 : 0) + '%' }"></div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
const api = useApi();
const auth = useAuthStore();
const progress = useProgressStore();

const modules = ref<any[]>([]);
const loading = ref(true);
const totalModules = ref(0);

const avgScore = computed(() => {
  const scored = progress.items.filter(p => p.score > 0);
  if (scored.length === 0) return 0;
  return Math.round(scored.reduce((s, p) => s + p.score, 0) / scored.length);
});

const completionPercent = computed(() => {
  if (totalModules.value === 0) return 0;
  return Math.round((progress.completedCount / totalModules.value) * 100);
});

function getModProgress(moduleId: number) {
  return progress.getModuleProgress(moduleId);
}

onMounted(async () => {
  if (!auth.isLoggedIn) { navigateTo('/login'); return; }
  try {
    const [mods] = await Promise.all([
      api.get<any[]>('/api/modules'),
      progress.fetchProgress(),
    ]);
    modules.value = mods;
    totalModules.value = mods.length;
  } catch (e) {
    console.error(e);
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.progress-page { padding-bottom: 3rem; max-width: 900px; }
.page-header { margin-bottom: 2rem; }
.page-header h1 { font-size: 1.75rem; }
.page-header p { color: var(--color-text-muted); margin-top: 0.25rem; }

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}
.stat-card { text-align: center; }
.stat-card:hover { transform: none; }
.stat-icon { font-size: 2rem; margin-bottom: 0.5rem; }
.stat-card .stat-value { font-size: 1.75rem; font-weight: 700; color: var(--color-primary); }
.stat-card .stat-label { font-size: 0.8rem; color: var(--color-text-dim); text-transform: uppercase; margin-top: 0.25rem; }

.overall-section { margin-bottom: 2rem; }
.overall-section h3 { margin-bottom: 0.75rem; }

.module-progress-list h3 { margin-bottom: 1rem; }
.module-progress-card { margin-bottom: 0.75rem; }
.module-progress-card:hover { transform: none; }

.mp-info { display: flex; align-items: center; gap: 1rem; margin-bottom: 0.75rem; }
.mp-order {
  width: 36px; height: 36px;
  display: flex; align-items: center; justify-content: center;
  background: var(--color-bg-elevated); border-radius: 50%;
  font-weight: 700; color: var(--color-primary); flex-shrink: 0;
}
.mp-meta { display: flex; align-items: center; gap: 0.75rem; margin-top: 0.25rem; }
.mp-score { font-size: 0.8rem; color: var(--color-secondary); font-weight: 600; }

.loading-state { text-align: center; padding: 3rem; }
.loading-state .spinner { margin: 0 auto; }
</style>
