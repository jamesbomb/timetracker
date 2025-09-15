import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../store/auth';

import Login from '../views/Login.vue';
import Signup from '../views/Signup.vue';
import Dashboard from '../views/Dashboard.vue';
import Manager from '../views/Manager.vue';
import Admin from '../views/Admin.vue';

const routes = [
  { path: '/login', name: 'Login', component: Login },
  { path: '/signup', name: 'Signup', component: Signup },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    meta: { requiresAuth: true },
  },
  {
    path: '/manager',
    name: 'Manager',
    component: Manager,
    meta: { requiresAuth: true, requiresManager: true },
  },
  {
    path: '/admin',
    name: 'Admin',
    component: Admin,
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  { path: '/:pathMatch(.*)*', redirect: '/dashboard' },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to, from, next) => {
  const auth = useAuthStore();
  if (auth.token && !auth.currentUser) {
    try {
      await auth.fetchUser();
    } catch {
      // ignore
    }
  }

  if (to.meta.requiresAuth && !auth.token) {
    return next({ name: 'Login' });
  }
  if (to.meta.requiresManager && !auth.currentUser?.is_manager) {
    return next({ name: 'Dashboard' });
  }
  if (to.meta.requiresAdmin && !auth.currentUser?.is_superuser) {
    return next({ name: 'Dashboard' });
  }
  next();
});

export default router;