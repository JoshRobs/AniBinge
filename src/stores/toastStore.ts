import { defineStore } from "pinia";
import { ref } from "vue";

export const useToastStore = defineStore("toast", () => {
  const visible = ref(false);
  const message = ref("");
  const title = ref("");
  const titleColor = ref("#f3f4f6");
  const showAction = ref(false);
  let timer: ReturnType<typeof setTimeout> | null = null;

  function show(
    msg: string,
    opts?: { title?: string; titleColor?: string; showAction?: boolean; duration?: number },
  ) {
    message.value = msg;
    title.value = opts?.title ?? "";
    titleColor.value = opts?.titleColor ?? "#f3f4f6";
    showAction.value = opts?.showAction ?? false;
    visible.value = true;
    if (timer) clearTimeout(timer);
    timer = setTimeout(dismiss, opts?.duration ?? 5000);
  }

  function dismiss() {
    visible.value = false;
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
  }

  return { visible, message, title, titleColor, showAction, show, dismiss };
});
