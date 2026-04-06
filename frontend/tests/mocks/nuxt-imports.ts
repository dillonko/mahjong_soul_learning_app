/**
 * Mocks for #imports (Nuxt auto-imports).
 */
export {
  ref,
  computed,
  reactive,
  watch,
  watchEffect,
  onMounted,
  onUnmounted,
  nextTick,
  toRef,
  toRefs,
  defineComponent,
  h,
} from 'vue';

export { defineStore, storeToRefs } from 'pinia';

export {
  useRuntimeConfig,
  navigateTo,
  useRoute,
  useRouter,
  definePageMeta,
} from './nuxt-app';
