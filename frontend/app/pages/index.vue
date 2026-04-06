<template>
  <div class="landing">
    <!-- Hero Section -->
    <section class="hero">
      <div class="container hero-content">
        <div class="hero-badge">🀄 Free Mahjong Learning Platform</div>
        <h1 class="hero-title">Master <span class="highlight">Riichi Mahjong</span><br/>One Tile at a Time</h1>
        <p class="hero-subtitle">
          Learn Mahjong Soul from absolute beginner to competent player with interactive lessons,
          terminology flashcards, and winning strategy guides.
        </p>
        <div class="hero-actions">
          <NuxtLink v-if="auth.isLoggedIn" to="/dashboard" class="btn btn-primary btn-lg">
            Go to Dashboard →
          </NuxtLink>
          <template v-else>
            <NuxtLink to="/login" class="btn btn-primary btn-lg">Start Learning</NuxtLink>
            <NuxtLink to="/login?guest=true" class="btn btn-ghost btn-lg">Try as Guest</NuxtLink>
          </template>
        </div>
      </div>
    </section>

    <!-- Features -->
    <section class="features container">
      <h2 class="section-title">What You'll Learn</h2>
      <div class="feature-grid">
        <div class="card feature-card">
          <div class="feature-icon">📚</div>
          <h3>5 Progressive Modules</h3>
          <p>From basic tiles and rules to advanced strategy — learn at your own pace with structured lessons.</p>
        </div>
        <div class="card feature-card">
          <div class="feature-icon">🃏</div>
          <h3>Keyword Flashcards</h3>
          <p>Master 25+ essential Mahjong terms with an interactive flashcard system. Never forget a term again.</p>
        </div>
        <div class="card feature-card">
          <div class="feature-icon">🏆</div>
          <h3>Winning Strategies</h3>
          <p>Learn proven closing strategies from beginner Tanyao plays to advanced endgame survival tactics.</p>
        </div>
        <div class="card feature-card">
          <div class="feature-icon">📊</div>
          <h3>Track Your Progress</h3>
          <p>Save your learning progress, take quizzes, and see how far you've come on your Mahjong journey.</p>
        </div>
      </div>
    </section>

    <!-- Module Preview -->
    <section class="modules-preview container">
      <h2 class="section-title">Learning Path</h2>
      <div class="path-list">
        <div class="path-item" v-for="(mod, i) in previewModules" :key="i">
          <div class="path-number">{{ i + 1 }}</div>
          <div class="path-info">
            <h4>{{ mod.title }}</h4>
            <p>{{ mod.desc }}</p>
          </div>
          <div class="path-badge" :class="mod.badge">{{ mod.level }}</div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
const auth = useAuthStore();

const previewModules = [
  { title: 'The Basics', desc: 'Tiles, hand structure, game flow', level: 'Beginner', badge: 'badge-green' },
  { title: 'Yaku Patterns', desc: 'Winning hand conditions and values', level: 'Beginner', badge: 'badge-green' },
  { title: 'Tile Efficiency', desc: 'Shanten, Ukeire, optimal discards', level: 'Intermediate', badge: 'badge-yellow' },
  { title: 'Defense Tactics', desc: 'Safe tiles, Betaori, reading opponents', level: 'Intermediate', badge: 'badge-yellow' },
  { title: 'Advanced Strategy', desc: 'Push/fold, placement play, scoring', level: 'Advanced', badge: 'badge-red' },
];
</script>

<style scoped>
.hero {
  text-align: center;
  padding: 4rem 0 3rem;
  background: linear-gradient(180deg, rgba(34,197,94,0.05) 0%, transparent 100%);
}
.hero-badge {
  display: inline-block;
  padding: 0.5rem 1rem;
  background: rgba(34,197,94,0.1);
  border: 1px solid rgba(34,197,94,0.3);
  border-radius: 9999px;
  color: var(--color-primary);
  font-size: 0.85rem;
  font-weight: 500;
  margin-bottom: 1.5rem;
}
.hero-title {
  font-size: 3rem;
  font-weight: 700;
  line-height: 1.2;
  margin-bottom: 1.25rem;
}
.highlight { color: var(--color-primary); }
.hero-subtitle {
  font-size: 1.15rem;
  color: var(--color-text-muted);
  max-width: 640px;
  margin: 0 auto 2rem;
}
.hero-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.features { padding: 3rem 0; }
.section-title {
  text-align: center;
  font-size: 1.75rem;
  margin-bottom: 2rem;
}
.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}
.feature-card { text-align: center; }
.feature-icon { font-size: 2.5rem; margin-bottom: 0.75rem; }
.feature-card h3 { margin-bottom: 0.5rem; font-size: 1.1rem; }
.feature-card p { color: var(--color-text-muted); font-size: 0.9rem; }

.modules-preview { padding: 2rem 0 4rem; }
.path-list {
  max-width: 700px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.path-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.5rem;
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
}
.path-number {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg-elevated);
  border-radius: 50%;
  font-weight: 700;
  color: var(--color-primary);
  flex-shrink: 0;
}
.path-info { flex: 1; }
.path-info h4 { font-size: 1rem; margin-bottom: 0.15rem; }
.path-info p { color: var(--color-text-muted); font-size: 0.85rem; }
.path-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  flex-shrink: 0;
}

@media (max-width: 768px) {
  .hero-title { font-size: 2rem; }
  .hero-subtitle { font-size: 1rem; }
}
</style>
