import { createRouter, createWebHistory } from "vue-router";
import CustomerPage from "./components/modules/customer/Customer.vue";
import LayoutPage from "./components/layouts/Layout.vue";
import LoginPage from "./components/modules/auth/Login.vue";
import { authGuard } from "./common/guards/auth.guard";
import RegisterPage from "./components/modules/customer/Register.vue";
import Course from "./components/modules/course/interface/Course.vue";
import CourseCategory from "./components/modules/course-category/CourseCategory.vue";

const routes = [
  {
    'path': "/",
    name: "layout",
    component: LayoutPage,

    children: [

      {
        'path': "/course",
        name: "course",
        component: Course,
      },

      {
        'path': "/coursecategory",
        name: "coursecategory",
        component: CourseCategory,
      },

      {
        'path': "/customer",
        name: "customer",
        component: CustomerPage,
      },
    ],
  },

  {
    'path': "/login",
    name: "login",
    component: LoginPage,
    meta: {
      skipAuthCheck: true
    }
  },

  {
    'path': "/register",
    name: "register",
    component: RegisterPage,
    meta: {
      skipAuthCheck: true
    }
  }



];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

authGuard(router);

export default router;
