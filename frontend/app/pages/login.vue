<template>
  <div class="container auth-page">
    <div class="auth-card card">
      <div class="auth-header">
        <span class="auth-icon">🀄</span>
        <h2>{{ isRegister ? 'Create Account' : 'Welcome Back' }}</h2>
        <p class="auth-subtitle">{{ isRegister ? 'Start your Mahjong learning journey' : 'Continue your Mahjong training' }}</p>
      </div>

      <div v-if="errorMsg" class="error-banner">{{ errorMsg }}</div>

      <form @submit.prevent="handleSubmit" class="auth-form">
        <div class="form-group" v-if="isRegister">
          <label>Username</label>
          <input v-model="username" type="text" class="input" placeholder="Your display name" required />
        </div>
        <div class="form-group">
          <label>Email</label>
          <input v-model="email" type="email" class="input" placeholder="your@email.com" required />
        </div>
        <div class="form-group">
          <label>Password</label>
          <input v-model="password" type="password" class="input" placeholder="Min 6 characters" required minlength="6" />
        </div>

        <button type="submit" class="btn btn-primary btn-lg full-width" :disabled="auth.loading">
          {{ auth.loading ? 'Please wait...' : (isRegister ? 'Create Account' : 'Log In') }}
        </button>
      </form>

      <div class="auth-divider"><span>or</span></div>

      <button class="btn btn-gold full-width" @click="handleGuest" :disabled="auth.loading">
        👤 Continue as Guest
      </button>

      <p class="auth-toggle">
        {{ isRegister ? 'Already have an account?' : "Don't have an account?" }}
        <a href="#" @click.prevent="isRegister = !isRegister">
          {{ isRegister ? 'Log In' : 'Register' }}
        </a>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
const auth = useAuthStore();
const route = useRoute();
const router = useRouter();

const isRegister = ref(false);
const email = ref('');
const password = ref('');
const username = ref('');
const errorMsg = ref('');

// Auto-guest if ?guest=true
onMounted(async () => {
  if (route.query.guest === 'true') {
    await handleGuest();
  }
  if (auth.isLoggedIn) {
    router.push('/dashboard');
  }
});

async function handleSubmit() {
  errorMsg.value = '';
  try {
    if (isRegister.value) {
      await auth.register(email.value, password.value, username.value);
    } else {
      await auth.login(email.value, password.value);
    }
    router.push('/dashboard');
  } catch (e: any) {
    errorMsg.value = e?.data?.error || e?.message || 'Something went wrong';
  }
}

async function handleGuest() {
  errorMsg.value = '';
  try {
    await auth.continueAsGuest();
    router.push('/dashboard');
  } catch (e: any) {
    errorMsg.value = e?.data?.error || e?.message || 'Failed to create guest session';
  }
}
</script>

<style scoped>
.auth-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 200px);
}
.auth-card {
  max-width: 440px;
  width: 100%;
}
.auth-card:hover { transform: none; }
.auth-header { text-align: center; margin-bottom: 1.5rem; }
.auth-icon { font-size: 2.5rem; display: block; margin-bottom: 0.5rem; }
.auth-subtitle { color: var(--color-text-muted); font-size: 0.9rem; margin-top: 0.25rem; }

.error-banner {
  background: rgba(239,68,68,0.15);
  border: 1px solid rgba(239,68,68,0.3);
  color: var(--color-danger);
  padding: 0.75rem 1rem;
  border-radius: var(--radius-sm);
  margin-bottom: 1rem;
  font-size: 0.9rem;
}

.auth-form { display: flex; flex-direction: column; gap: 1rem; }
.form-group label {
  display: block;
  margin-bottom: 0.35rem;
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--color-text-muted);
}
.full-width { width: 100%; }

.auth-divider {
  text-align: center;
  margin: 1.25rem 0;
  position: relative;
  color: var(--color-text-dim);
  font-size: 0.85rem;
}
.auth-divider::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background: var(--color-border);
}
.auth-divider span {
  background: var(--color-bg-card);
  padding: 0 1rem;
  position: relative;
}

.auth-toggle {
  text-align: center;
  margin-top: 1.25rem;
  color: var(--color-text-muted);
  font-size: 0.9rem;
}
.auth-toggle a { color: var(--color-primary); font-weight: 600; }
</style>
