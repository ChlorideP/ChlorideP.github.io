import { defineUserConfig } from "vuepress";
import theme from "./theme.js";

export default defineUserConfig({
  base: "/",

  lang: "zh-CN",
  title: "氯喵实验室",
  description: "氯喵总是捣鼓些奇奇怪怪的东西捏。",

  temp: ".temp",
  cache: ".cache",
  public: "public",
  dest: "dist",

  theme,

  // 和 PWA 一起启用
  shouldPrefetch: false,
});
