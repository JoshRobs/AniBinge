import PlannerView from "@/views/PlannerView.vue";
import ShareView from "@/views/ShareView.vue";
import { createRouter, createWebHistory } from "vue-router";

const routes = [
  { path: "/", name: "Home", component: PlannerView },
  { path: "/share", name: "Share", component: ShareView },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
