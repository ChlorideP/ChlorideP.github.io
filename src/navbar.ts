import { navbar } from "vuepress-theme-hope";

export default navbar([
  "/",
  "/archives/",
  "/notes/",
  {
    text: "友链",
    icon: "heart",
    link: "/friends/",
  },
]);
