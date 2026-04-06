import { defineStore } from 'pinia';

interface UserData {
  id: number;
  email: string;
  username: string;
  createdAt: string;
}

interface GuestData {
  id: number;
  sessionToken: string;
  createdAt: string;
  expiresAt: string;
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: null as string | null,
    user: null as UserData | null,
    guest: null as GuestData | null,
    isGuest: false,
    isLoggedIn: false,
    loading: false,
  }),

  actions: {
    init() {
      if (import.meta.server) return;
      const token = localStorage.getItem('auth_token');
      const userData = localStorage.getItem('auth_user');
      const guestData = localStorage.getItem('auth_guest');
      const isGuest = localStorage.getItem('auth_is_guest') === 'true';

      if (token) {
        this.token = token;
        this.isLoggedIn = true;
        this.isGuest = isGuest;
        if (userData) this.user = JSON.parse(userData);
        if (guestData) this.guest = JSON.parse(guestData);
      }
    },

    setAuth(data: { token: string; user?: UserData; guest?: GuestData; isGuest: boolean }) {
      this.token = data.token;
      this.isGuest = data.isGuest;
      this.isLoggedIn = true;

      if (data.user) this.user = data.user;
      if (data.guest) this.guest = data.guest;

      if (import.meta.client) {
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('auth_is_guest', String(data.isGuest));
        if (data.user) localStorage.setItem('auth_user', JSON.stringify(data.user));
        if (data.guest) localStorage.setItem('auth_guest', JSON.stringify(data.guest));
      }
    },

    async register(email: string, password: string, username: string) {
      this.loading = true;
      try {
        const api = useApi();
        const data = await api.post<any>('/api/auth/register', { email, password, username });
        this.setAuth(data);
      } finally {
        this.loading = false;
      }
    },

    async login(email: string, password: string) {
      this.loading = true;
      try {
        const api = useApi();
        const data = await api.post<any>('/api/auth/login', { email, password });
        this.setAuth(data);
      } finally {
        this.loading = false;
      }
    },

    async continueAsGuest() {
      this.loading = true;
      try {
        const api = useApi();
        const data = await api.post<any>('/api/auth/guest');
        this.setAuth(data);
      } finally {
        this.loading = false;
      }
    },

    logout() {
      this.token = null;
      this.user = null;
      this.guest = null;
      this.isGuest = false;
      this.isLoggedIn = false;

      if (import.meta.client) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        localStorage.removeItem('auth_guest');
        localStorage.removeItem('auth_is_guest');
      }

      navigateTo('/login');
    },

    get displayName(): string {
      if (this.user) return this.user.username;
      if (this.guest) return 'Guest';
      return '';
    },
  },
});
