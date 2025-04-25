import { h } from "vue";
import type { Theme } from "vitepress";
import DefaultTheme from "vitepress/theme";
import Background from "./components/Background.vue";
import Layout from "./Layout.vue";

import "./styles/index.css";
import "./styles/tailwind.css";

export default {
  // Layout,
  Layout: () => {
    return h(Layout, null, {
      "home-hero-before": () => h(Background),
    });
  },
  enhanceApp({ app, router, siteData }) {
    // ...
  },
} satisfies Theme;
