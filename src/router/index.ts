import PlannerView from "@/views/PlannerView.vue";
import { createRouter, createWebHistory } from "vue-router";

const routes = [{ path: "/", name: "Home", component: PlannerView }];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
