---
category:
  - 操作系统
  - Linux
tag:
  - Arch Linux
  - KDE
star: true
---

# Arch Linux 个人配（调）置（教）指南

[书接上回](ArchInstall.md)，指南写着写着发现能聊的点子还挺多的。这一篇就主打日常使用了。  
仍然与上篇一样，我默认讨论的是 KDE 桌面环境。

## 系统美化

> 「爱美之心，人皆有之。」

首先，我非常尊重你对「纯美」的追求；其次，容我指出一点，**系统美化从来不是「必需品」，而是你的「个人选择」**。
自然，别人没有义务为你的个人选择买单，**翻车的「善后工作」只能由你自己来完成**。

总之，美化之前先**调查清楚怎么装**，并且**做好预案**（备份）。~~在群里到处求助之前，做好被言语攻击的心理准备。~~

> [!tip]
> **风格统一**是「美观」的必要条件。

> [!warning]
> 目前大部分 KDE 美化方案适用于 KDE 5，换言之已经过时。比如`latte-dock`已明显无法用于 KDE 6。

::: details 【仅供参考】我自己的美化方案
只能说聊胜于无。

- 全局主题：`Nordic-darker`
  - 控件样式：`Kvantum`内安装的`Nordic-darker`
  - Plasma 外观：`Nordic-darker`
  - 图标：`Breeze`（默认）
  - 欢迎屏幕、登录屏幕可手动选`Nordic`系列。

- 仿 Mac
  - Dock 栏即原本的任务栏，只保留「图标任务管理器」组件。
    - 位于底部、居中、适宜宽度
    - 取消悬浮、避开窗口
  - Finder 栏即「应用程序菜单栏」（可在「编辑模式—添加面板」处找到）
    - 位于顶部、居中、填满宽度
    - 取消悬浮、常驻显示
    - 自左到右依次为：
      - 应用程序启动器（没错就是开始菜单）
      - 窗口列表
      - 全局菜单（默认提供）
      - 「面板间距」留白
      - 数字时钟
        - 日期保持在时间旁边，而不是上下两行
        - 字号略小于菜单栏高度，凭感觉捏
      - 「面板间距」留白
      - 系统托盘
:::

<!-- ::: info LinuxQQ 4:3.2.9_24568-1 启动后界面空白
经 Flysoft 排查，系`libssh2`未能加载。解决方案也很简单，在终端预加载之：
```bash
env LD_PRELOAD="/usr/lib/libssh2.so" linuxqq
```
::: -->

## GPG 密钥相关

主要是折腾提交签名（Commit Signing）时遇到的问题。

### （一）VSCode 提交签名
大体上跟着 [Commit Signing - VSCode Wiki](https://github.com/microsoft/vscode/wiki/Commit-Signing) 就可以了。唯一需要留意的是`pinentry`。

VSCode 的主侧栏「源代码管理」页提交时并不会走终端，也就莫得 pinentry 的 CUI；莫得 pinentry 输密码验证，提交就签不了名。
虽然有人好像搞了个`pinentry-extension`出来，但 6 月初我去看的时候它连说明书都莫得，也没有上架，那用集贸。

所以我选择编辑`~/.gnupg/gpg-agent.conf`：
```properties
default-cache-ttl 28800
pinentry-program /usr/bin/pinentry-qt
```
保存后重启`gpg-agent`：`gpg-connect-agent reloadagent /bye`。

虽然这么搞反倒在 SSH 上用不了了，但我平时还是用 KDE 图形界面比较多。

### （二）GPG 密钥备份（导出导入）
之前并没有意识到备份 key 的重要性，结果重装 Arch 重新配置提交签名时，
我发现 GitHub 和腾讯 Coding 会重置提交验证（同一个邮箱只能上传一个公钥），届时就是我痛苦的 rebase 重签了。
~~不过好在受影响的多数只是我的个人项目，变基无伤大雅。~~
```bash
gpg --list-secret-keys --keyid-format LONG
# export
gpg -a -o public-file.key --export <keyid>
gpg -a -o private-file.key --export-secret-keys <keyid>
# import
gpg --import ~/public-file.key
gpg --allow-secret-key-import --import ~/private-file.key
```
重新导入 Key 之后，可能还需要`gpg trust`重设信任、`gpg --edit-key`更改密码（`passwd`）。

## Linux Shell 相关
Shell 编程说实话也是一门学问，但这里只讨论两个东西，别名`alias`和函数`function`。  
你可以把需要简记、快速调用的东西包装成别名或者函数，写进`~/.bashrc`（或者`~/.zshrc`，如果你换用 zsh 的话）。
如此，每次启动`bash`或`zsh`时，你都可以享受这些用户定义带来的效率红利了（笑）。

> [!note]
> `~`被称为「家目录」，通常指代`/home/<user_id>`，比如`/home/chloridep`。类比下 Win7 的`C:\Users\ChlorideP`就知道了。

### （一）别名
语法很简单：`alias a="b"`。注意 a、b 之间**没有空格**。

你可以为内置命令附加一些特性，像默认的`.bashrc`有这么两条：
```bash
alias ls='ls --color=auto'
alias grep='grep --color=auto'
```
也可以「化繁为简」，把路径比较长的脚本、打字起来比较长的命令缩短成别名：
```bash
alias pac='sudo pacman'
```
然后你就可以用`pac -S wine`代替`sudo pacman -S wine`了。

### （二）函数

Shell 的函数是这么写的：
```bash
function func-name() {
}
```
函数适合「批处理」这种需要执行多条命令的场景。~~当然你也可以写`if`判断和`for`循环。但这不是重点。~~
目前来说，我只为了启动 OpenSeeFace 面捕 ~~（唉，底边皮套人）~~ 写了个函数：

> 关于面捕和 Live2D 皮套，参见
> [Running VTS on Linux - Vtube Studio Wiki](https://github.com/DenchiSoft/VTubeStudio/wiki/Running-VTS-on-Linux)

```bash
function start-facetrack() {
  # 记录当前目录
  curpath=$(pwd)
  # 切到 OSF 里用 Python 虚拟环境运行面捕
  cd ~/OpenSeeFace
  source .venv/bin/activate
  python facetracker.py  -W 1280 -H 720 --discard-after 0 --scan-every 0 --no-3d-adapt 1 --max-feature-updates 900 -c 0
  # Ctrl-C 退出 Python 进程后，离开虚拟环境
  deactivate
  # 从 OSF 返回当前目录
  cd $curpath
}
```

::: info 传参
我原本是 Win 玩家，初见 Shell 的函数发现与 PowerShell 那个比较像（无论编写还是调用）。
直到查了下[菜鸟教程](https://www.runoob.com/linux/linux-shell-func.html)，才发现是我倒反天罡了。

简单来说，Shell 的传参通过「位序」确定：
```bash
#!/bin/bash
# 取自菜鸟教程，有删减。完整版自行跳转。

funWithParam(){
  echo "第一个参数为 $1 !"
  echo "第十个参数为 ${10} !"
  echo "参数总数有 $# 个!"
}
funWithParam 1 2 3 4 5 6 7 8 9 34 73
```
:::

## 运行 Windows 程序

说到`.exe`，想必你肯定知道 Wine。当然，Steam 则另外用 Proton。它们都是为了在 Linux 系统里「兼容」Windows API 而生的兼容层。  
而说起 Wine，那确实能讲好几个夜晚，我也差不多摸索了半个月。毕竟我是搞红警 2 mod 出身的嘛，
姑且也为[游玩红警 2 模组「星辰之光」](../RA2/ExtremeStarryInLinux.md)的玩家写了一篇 Bottles 教程，这里就不再大篇幅去扯淡了，仅供参考。

原生`wine`^multilib^的配置建议参考[官方英文 Wiki](https://wiki.archlinux.org/title/wine)
和[中文社区的翻译](https://wiki.archlinuxcn.org/wiki/Wine)。
