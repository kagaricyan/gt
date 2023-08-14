import { createApp } from "vue";
import { router } from "./router";
import App from "./App.vue";
import "./style.css";
import { createPinia } from "pinia";
import { useStore } from "./store";

const pinia = createPinia();

(async function init() {
  await useStore(pinia).init();
  createApp(App).use(router).use(pinia).mount("#app");
})();
