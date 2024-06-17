---
category:
  - Linux
  - RA2
tag:
  - Wine
  - Bottles
  - 虚拟环境
---

# 在 Linux 中游玩红警 2

## 前言

写这篇文章之前，我还在享受 Moonlight 串流带来的利好：解放手机存储、随连随用、配合 ZeroTier 异地访问，等等。
但……搞串流的前提是，Win 主机的网得有足够的上行。然而，显然我目前的环境做不到。  
但砖还是要搬的，给别人做的地图总归要做完的。因此，我开始折腾起了`wine`。

那么正式开始之前，我有必要先说一下我的 Linux 环境。由于 Linux 发行版众多，我**无法保证别的包源、别的发行版能否这么操作**。

- 操作系统：Arch Linux
- 桌面环境：KDE 6
- 包源：flatpak（我是直接用 KDE 的应用商店，也能搜到）

## 一、Bottles

从头开始折腾 wine 那不得不说是大工程。况且现在有很多国产软件已经预先配置好 wine 了，再走原始人路子只能说吃饱了撑的。

Bottles 是由 [bottlesdevs](https://github.com/bottlesdevs) 开发的可视化 wine 配置工具，旨在「让用户便利地在喜欢的发行版里运行 Windows 程序」。实际体验下来，Bottles 创建的 wine 环境确实可以说开箱即用，但也尚存一些问题需要解决。

参考链接：[GitHub](https://github.com/bottlesdevs/Bottles) [官网](https://usebottles.com/)

### 1.1 获取

Bottles 可从 Flatpak 源获取。Flatpak 的安装可以参见 [FlatHub 的指引](https://flathub.org/setup)，
下面以 Arch 默认的包管理器`pacman`为例：

```zsh
sudo pacman -S flatpak
flatpak install com.usebottles.bottles
```

如果你恰好是 KDE 用户，你也可以从 Discover 软件中心中搜索到：

![Discover 软件中心](kde_discover_bottles_search.webp)

::: important 网络异常与换源
Linux 的包管理器默认从国外的包源获取数据，而国外包源对于简中网络来说可能并不太友好。  
你可能需要自行了解如何给 flatpak 换源，或者慢慢等那几十几百 KB/s 的小水管。
:::

### 1.2 初次运行

装完之后可以从终端里打开它：
```zsh
flatpak run com.usebottles.bottles
```

初次运行 Bottles 会弹出一个向导跟你 blabla，无脑下一步即可。
到最后一步时 Bottles 会下载额外的图形库文件，由于上面介绍过的原因，这里可能也会花费比较长的时间。

![「坐和放宽」.jpg（注：取自官方文档，不代表你的也是英文）](bottles_init_downloading.webp)

## 二、部署游戏

### 2.1 搭建 Wine 环境

进入 Bottles 的主界面，点击「新建 Bottle……」。  
对于带有 XNA CNCNet 客户端的 mod 来说，应选「自定义」环境，并将 Wine 兼容层调整为「sys-wine-9.0」。

> [!note]
> 我已经好久没有碰过原生 800x600 的套娃菜单 UI 了。  
> 如果只是运行尤里复仇，并且「soda-9.0-1」可用的话还请知会我一下。

然后在右上角点击「创建」即可。

![新建 Bottle](bottles_new_venv.webp)

### 2.2 准备好你的游戏

> [!important]
> 很遗憾，对于「没有搭载客户端」的纯 Ares mod，**Wine 无法正常调用 Syringe 启动游戏**。
> 考虑到 XNA CNCNet 客户端能够正常建立起游戏进程，你或许需要**额外准备一个 EXE 启动器**替代`RunAres.bat`。

把游戏解压到一个显眼的位置即可。后续「添加快捷方式」时你应能快速地找到游戏的启动器（`RA2*.exe`或是客户端程序）。

### 2.3 补充设置

点开你刚刚建好的 Wine 环境。

- 「添加快捷方式」功能：可以为你的客户端（或`RA2*.exe`启动器）设置快捷入口，这样就不需要每次都找半天了。  

> [!note]
> 在「选择可执行文件」对话框中，若找不到 exe，请在「过滤」那里改为`Supported Executables`。

- 设置：需要启用 DX/D3D 翻译，否则客户端无法正常显示。

  1. 将「组件」部分的 DXVK 和 VKD3D 打开；
  2. 可以考虑在「显示」部分启用独立显卡（我的笔记本没有捏）；
  3. 「性能」部分的「Feral 游戏模式」可以考虑打开。

- 依赖项：需要把运行库下载到当前 Bottle。（前面下载的是图形库，管窗口怎么显示给你看的）

::: details 推荐依赖（太长了，自己点开看罢）

无论如何都建议装的依赖：

- mono (wine mono) （耗时较长，建议最后安装）
- cjkfonts（中日韩字体，避免「口口文学」）

N 卡推荐：

- physx

红警 2 以及 XNA CNCNet 客户端推荐安装以下依赖：

- cnc-ddraw
- d3dcompiler_*.dll
- d3dx*
<!-- - gdiplus -->

FA2sp 推荐安装以下依赖：

- mfc42
- vcredist2022（最新版 C++ 运行时即可）

如有别的依赖推荐，也烦请知会我一下（x）
:::

## 三、开玩

在做完全部配置之后，点击你建过的快捷方式右边的`▶`图标，开耍。

::: details 若客户端启动器报错「Main client executable (Resources\clientdx.exe) not found!」
需要在快捷方式里手动指定游戏目录：

![在右侧展开快捷方式菜单，点击「更改启动选项」](client_not_found_so1.webp)

![更改「工作目录」](client_not_found_so2.webp)

注意你快捷方式所选的**启动器位于什么目录**，你的「工作目录」也应该**选择相同位置**。

![Enjoy！](client_not_found_so3.webp)
:::

![在 Arch 里游玩「星辰之光」](linux_bottles_ES.webp)
