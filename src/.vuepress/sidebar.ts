import { sidebar } from "vuepress-theme-hope";

export default sidebar({
  "/": [
    "",
    {
      text: "结论归档",
      icon: "folder-open",
      prefix: "archives/",
      children: "structure",
    },
    {
      text: "实验笔记",
      icon: "book",
      prefix: "notes/",
      children: "structure",
    },
    // "intro",
    "friends/"
  ],
});
