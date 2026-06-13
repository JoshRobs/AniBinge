import { ref, watch } from "vue";

export function usePersistedState<T>(key: string, initial: T) {
  const state = ref<T>(
    JSON.parse(localStorage.getItem(key) || "null") ?? initial
  );

  watch(
    state,
    (val) => {
      localStorage.setItem(key, JSON.stringify(val));
    },
    { deep: true }
  );

  return state;
}
