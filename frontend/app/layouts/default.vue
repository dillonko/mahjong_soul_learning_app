<template>
  <div class="app-layout">
    <!-- Navigation -->
    <nav class="navbar">
      <div class="container nav-content">
        <NuxtLink to="/" class="nav-logo">
          <span class="logo-icon">🀄</span>
          <span class="logo-text">Mahjong Academy</span>
        </NuxtLink>

        <div class="nav-links" v-if="auth.isLoggedIn">
          <NuxtLink to="/dashboard" class="nav-link">Dashboard</NuxtLink>
          <NuxtLink to="/keywords" class="nav-link">Keywords</NuxtLink>
          <NuxtLink to="/strategies" class="nav-link">Strategies</NuxtLink>
          <NuxtLink to="/progress" class="nav-link">Progress</NuxtLink>
        </div>

        <div class="nav-actions">
          <template v-if="auth.isLoggedIn">
            <span class="nav-user">
              <span class="user-icon">{{ auth.isGuest ? '👤' : '🎮' }}</span>
              {{ auth.isGuest ? 'Guest' : auth.user?.username }}
            </span>
            <button class="btn btn-ghost btn-sm" @click="auth.logout()">Logout</button>
          </template>
          <template v-else>
            <NuxtLink to="/login" class="btn btn-primary btn-sm">Login</NuxtLink>
          </template>
        </div>

        <!-- Mobile menu toggle -->
        <button class="mobile-toggle" @click="mobileOpen = !mobileOpen" v-if="auth.isLoggedIn">
          <span>{{ mobileOpen ? '✕' : '☰' }}</span>
        </button>
      </div>

      <!-- Mobile menu -->
      <div class="mobile-menu" v-if="mobileOpen && auth.isLoggedIn">
        <NuxtLink to="/dashboard" class="mobile-link" @click="mobileOpen = false">Dashboard</NuxtLink>
        <NuxtLink to="/keywords" class="mobile-link" @click="mobileOpen = false">Keywords</NuxtLink>
        <NuxtLink to="/strategies" class="mobile-link" @click="mobileOpen = false">Strategies</NuxtLink>
        <NuxtLink to="/progress" class="mobile-link" @click="mobileOpen = false">Progress</NuxtLink>
        <NuxtLink to="/settings" class="mobile-link" @click="mobileOpen = false">Settings</NuxtLink>
      </div>
    </nav>

    <!-- Main content -->
    <main class="main-content">
      <slot />
    </main>

    <!-- Footer -->
    <footer class="footer">
      <div class="container">
        <p>🀄 Mahjong Soul Academy &mdash; Learn Riichi Mahjong step by step</p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
const auth = useAuthStore();
const mobileOpen = ref(false);
</script>

<style scoped>
.app-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.navbar {
  background: var(--color-bg-card);
  border-bottom: 1px solid var(--color-border);
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-content {
  display: flex;
  align-items: center;
  height: 64px;
  gap: 2rem;
}

.nav-logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 1.1rem;
  color: var(--color-text);
  text-decoration: none;
}
.nav-logo:hover { color: var(--color-primary); }
.logo-icon { font-size: 1.5rem; }

.nav-links {
  display: flex;
  gap: 1.5rem;
  flex: 1;
}

.nav-link {
  color: var(--color-text-muted);
  font-weight: 500;
  font-size: 0.9rem;
  transition: color var(--transition);
  text-decoration: none;
}
.nav-link:hover, .nav-link.router-link-active { color: var(--color-primary); }

.nav-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.nav-user {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--color-text-muted);
  font-size: 0.9rem;
}
.user-icon { font-size: 1.2rem; }

.mobile-toggle {
  display: none;
  background: none;
  border: none;
  color: var(--color-text);
  font-size: 1.5rem;
  cursor: pointer;
}

.mobile-menu {
  display: none;
  flex-direction: column;
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--color-border);
}
.mobile-link {
  padding: 0.75rem 0;
  color: var(--color-text-muted);
  border-bottom: 1px solid var(--color-border);
  text-decoration: none;
}

.main-content {
  flex: 1;
  padding: 2rem 0;
}

.footer {
  background: var(--color-bg-card);
  border-top: 1px solid var(--color-border);
  padding: 1.5rem 0;
  text-align: center;
  color: var(--color-text-dim);
  font-size: 0.85rem;
}

@media (max-width: 768px) {
  .nav-links, .nav-actions { display: none; }
  .mobile-toggle { display: block; }
  .mobile-menu { display: flex; }
  .nav-content { justify-content: space-between; }
}
</style>
