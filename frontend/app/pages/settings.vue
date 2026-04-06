<template>
  <div class="container settings-page">
    <div class="page-header">
      <h1>⚙️ Settings</h1>
      <p>Manage your account and learning preferences.</p>
    </div>

    <!-- Account info -->
    <div class="card settings-section">
      <h3>Account</h3>
      <div class="setting-row">
        <span class="setting-label">Status</span>
        <span class="badge" :class="auth.isGuest ? 'badge-yellow' : 'badge-green'">{{ auth.isGuest ? 'Guest' : 'Registered' }}</span>
      </div>
      <div class="setting-row" v-if="auth.user">
        <span class="setting-label">Username</span>
        <span>{{ auth.user.username }}</span>
      </div>
      <div class="setting-row" v-if="auth.user">
        <span class="setting-label">Email</span>
        <span>{{ auth.user.email }}</span>
      </div>
      <div class="setting-row" v-if="auth.isGuest">
        <span class="setting-label">Session</span>
        <span class="setting-info">Guest sessions expire after 72 hours. Register to save progress permanently.</span>
      </div>
    </div>

    <!-- Progress management -->
    <div class="card settings-section">
      <h3>Progress Management</h3>
      <div class="setting-row">
        <div>
          <span class="setting-label">Restart Progress</span>
          <p class="setting-desc">Reset all module completion and quiz scores. This cannot be undone.</p>
        </div>
        <button class="btn btn-danger btn-sm" @click="confirmReset" :disabled="resetting">
          {{ resetting ? 'Resetting...' : '🗑️ Reset All Progress' }}
        </button>
      </div>
      <div v-if="resetMessage" class="reset-message" :class="resetError ? 'error' : 'success'">
        {{ resetMessage }}
      </div>
    </div>

    <!-- Logout -->
    <div class="card settings-section">
      <h3>Session</h3>
      <div class="setting-row">
        <span class="setting-label">Sign out of your account</span>
        <button class="btn btn-ghost btn-sm" @click="auth.logout()">Logout</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const auth = useAuthStore();
const progress = useProgressStore();

const resetting = ref(false);
const resetMessage = ref('');
const resetError = ref(false);

async function confirmReset() {
  if (!confirm('Are you sure you want to reset ALL progress? This cannot be undone!')) return;

  resetting.value = true;
  resetMessage.value = '';
  resetError.value = false;

  try {
    await progress.resetProgress();
    resetMessage.value = 'Progress has been reset successfully!';
  } catch (e: any) {
    resetError.value = true;
    resetMessage.value = e?.message || 'Failed to reset progress';
  } finally {
    resetting.value = false;
  }
}

onMounted(() => {
  if (!auth.isLoggedIn) navigateTo('/login');
});
</script>

<style scoped>
.settings-page { padding-bottom: 3rem; max-width: 700px; }
.page-header { margin-bottom: 2rem; }
.page-header h1 { font-size: 1.75rem; }
.page-header p { color: var(--color-text-muted); margin-top: 0.25rem; }

.settings-section { margin-bottom: 1.5rem; }
.settings-section:hover { transform: none; }
.settings-section h3 { font-size: 1.1rem; margin-bottom: 1rem; padding-bottom: 0.75rem; border-bottom: 1px solid var(--color-border); }

.setting-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  gap: 1rem;
}
.setting-row + .setting-row { border-top: 1px solid var(--color-border); }

.setting-label { font-weight: 500; }
.setting-desc { color: var(--color-text-muted); font-size: 0.85rem; margin-top: 0.25rem; }
.setting-info { color: var(--color-text-muted); font-size: 0.85rem; }

.reset-message {
  margin-top: 0.75rem;
  padding: 0.75rem 1rem;
  border-radius: var(--radius-sm);
  font-size: 0.9rem;
}
.reset-message.success { background: rgba(34,197,94,0.15); color: var(--color-primary); }
.reset-message.error { background: rgba(239,68,68,0.15); color: var(--color-danger); }
</style>
