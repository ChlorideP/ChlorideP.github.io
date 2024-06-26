---
category:
  - Linux
  - RA2
tag:
  - Wine
  - Bottles
  - 虚拟环境
---

# 在 Linux 中游玩「星辰之光」

## 前言

这篇笔记算是我这几天折腾`wine`的一些小结。  

::: warning 前排提醒
我不得不遗憾地提醒你：本篇教程不适用于**原版红警 2、原版尤里复仇**，以及任何**仍在使用原版套娃 UI 的红警 2 mod**。  
由于 Bottles 的申必「懒加载『工作目录』」模式，原版套娃 UI 方式**无法加载完游戏数据，必然发生 Fatal Error。**

> 「懒加载」就是只复制那个 EXE 文件到映射目录，同目录其他文件、子目录什么的一概不过问。  
> 就算指定「工作目录」迫使它映射整个父文件夹，也可能出现路径偏差。原版启动器反正是废了。  
> 通过 WinPE Command（PECMD）调 WinAPI 运行 RA2MD.exe 或是 Syringe 命令行虽然可行，
> 但无论是单人战役还是遭遇战，均在读条 3/4 之后直接 BOOM。

截至目前为止，「星辰之光」模组可以完美应用以下方案反复体验游戏内容，其他使用 XNA CNCNet 客户端的 mod 尚不清楚。
:::

::: important 最新消息
原生`wine`^multilib^并无「懒加载」一说，`RA2MD.exe`原生启动器、**Ares 启动器均可以正常启动**游戏，读条进单人任务。
但已知如下问题，所以还是不能玩：
- 无论`RA2*.INI`设置分辨率多大，用原生`wine`^multilib^启动的游戏强制锁 800x600；
- 载入图界面掉色盘，疑似图形 API 兼容问题
- 未经 CNCNet Spawner `cncnet5.dll`（或`gamemd-spawn.exe`？）启动的游戏无法显示 UI 按键（但仍可以盲点）

我上面只加粗 Ares 启动器是因为，搭载了 FA2sp 的 FinalAlert2 地图编辑器终于可以使用了 ~~，至少我的目的达到了~~。
:::

那么正式开始之前，我有必要先说一下我的 Linux 环境。由于 Linux 发行版众多，我**无法保证别的包源、别的发行版能否这么操作**。

- 操作系统：Arch Linux
- 桌面环境：KDE 6
- 包源：flatpak（我是直接用 KDE 的应用商店，也能搜到）

## 一、Bottles

从头开始折腾 wine 那不得不说是大工程。况且现在有很多国产软件已经预先配置好 wine 了，再走原始人路子只能说吃饱了撑的。

Bottles 是由 [bottlesdevs](https://github.com/bottlesdevs) 开发的可视化 wine 配置工具，旨在「让用户便利地在喜欢的发行版里运行 Windows 程序」。实际体验下来，Bottles 创建的 wine 环境确实可以说开箱即用，但……就「玩红警」来说，还是有很多限制。

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

::: info 网络异常与换源
Linux 的包管理器默认从国外的包源获取数据，而国外包源对于简中网络来说可能并不太友好。  
你可能需要自行了解如何给 flatpak 换源，或者慢慢等那几十几百 KB/s 的小水管。
:::

### 1.2 初次运行

::: details 关于代理……
如果你配置了代理，建议你在启动 Bottles 前配置`HTTP_PROXY`和`HTTPS_PROXY`两个环境变量：
```zsh
# port 是你代理软件设置的端口号。
export HTTP_PROXY=http://localhost:<port>
export HTTPS_PROXY=http://localhost:<port>
```
因为建立 Wine 环境之后有**各种运行库需要下载安装**；而 Bottles 的**下载连的国外服务器，非常慢**。

![用「游戏」预设环境建立的 Bottle，有一堆依赖需要下崽](bottle_dependencies.webp)
:::

装完之后可以从终端里打开它：
```zsh
flatpak run com.usebottles.bottles
```

初次运行 Bottles 会弹出一个向导跟你 blabla，无脑下一步即可。
到最后一步时 Bottles 会下载额外的图形库文件，由于上面介绍过的原因，这里可能也会花费比较长的时间。

## 二、部署游戏

### 2.1 搭建 Wine 和游戏环境

进入 Bottles 的主界面，点击「新建 Bottle……」。  
对于「星辰之光」来说，应选「自定义」环境，并将 Wine 兼容层调整为「sys-wine-9.0」。

![新建 Bottle](bottles_new_venv.webp)

然后在右上角点击「创建」即可。

至于「星辰之光」本体，只需把游戏解压到一个显眼的位置即可。后续「添加快捷方式」时你应能快速地找到客户端的启动器`Extreme Starry.exe`。

### 2.2 补充设置

点开你刚刚建好的 Wine 环境。

- 「添加快捷方式」功能：可以为客户端启动器设置快捷入口，这样就不需要每次都找半天了。  

> [!tip]
> 在「选择可执行文件」对话框中，若找不到 exe，请在「过滤」那里改为`Supported Executables`。

> [!important]
> 由于开头提到的「懒加载」策略，直接启动客户端大概率会暴毙：
>
> ![Main Client executable not found!](client_not_found.webp)
>
> 因此需要手动指定启动器的「工作目录」：
> 
> ::: details 图文操作步骤（虽然文字很小）
> ![在右侧展开快捷方式菜单，点击「更改启动选项」](client_not_found_so1.webp)
>
> ![更改「工作目录」](client_not_found_so2.webp)
>
> 无论启动器是选`Extreme Starry.exe`还是直接选择`Resources/client*.exe`，
> 你的「工作目录」都应该**选择「游戏目录」**（也就是`gamemd.exe`所在目录）。因为客户端也是靠「工作目录」找到游戏本体的。
>
> ![Enjoy！](client_not_found_so3.webp)
> :::

- 设置：需要启用 DX/D3D 翻译，否则客户端无法正常显示。

  1. 将「组件」部分的 DXVK 和 VKD3D 打开；
  2. 可以考虑在「显示」部分启用独立显卡（我的笔记本没有捏）；
  <!-- 3. 「性能」部分的「Feral 游戏模式」可以考虑打开。 -->

- 依赖项：需要把运行库下载到当前 Bottle。（前面下载的是图形库，管窗口怎么显示给你看的）

::: details 推荐依赖（比较长，自己点开看罢）

无论如何都建议装的依赖：

- mono (wine mono) （耗时较长，建议最后安装）
- cjkfonts（中日韩字体，避免「口口文学」）

N 卡推荐：

- physx

游戏本体以及 XNA CNCNet 客户端推荐安装以下依赖：

- cnc-ddraw
- d3dcompiler_*.dll
- d3dx*
<!-- - gdiplus -->
:::

## 三、开玩

在做完全部配置之后，点击你建过的快捷方式右边的`▶`图标，开耍。

![在 Arch 里游玩「星辰之光」（图为尚处内测的萌 03）](linux_bottles_ES.webp)
