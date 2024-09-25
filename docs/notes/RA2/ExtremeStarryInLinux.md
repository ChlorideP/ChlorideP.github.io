---
category:
  - Linux
  - RA2
tag:
  - Wine
---

# 在 Linux 中游玩「星辰之光」

> [!warning]
> Wine 最新版本（v9.18）疑似干废 DDraw 渲染，本文所述原生 Wine 暂时不可用。  
> 主包临时使用`downgrade`^archlinuxcn^降级回 9.17 版本，并重建现有 wine 容器方可继续游玩。  
> 可能还是 Bottles 或者换用 Proton 更靠谱吧。

## 前言

这篇笔记算是我这阵子折腾 Wine 兼容层的一些小结。

::: important 前排提醒
本篇笔记仅以「星辰之光」这个红警 2 模组作为范例，因为它是我这里最早成功跑起来的红警 2 mod。
对于其他 mod，乃至其他游戏和 Windows 程序，本篇笔记的方案可能有一定参考价值，**但不保证能够成功运行**。

另外，本篇笔记的插图原图对于电脑端来说会偏大一些，因此我基本上都做了缩小处理——你可以点击图片查看原图。
如果您在用移动设备阅读，则这种缩小效果可能更明显些。还请见谅。
:::

那么正式开始之前，我有必要先说一下我的 Linux 环境。由于 Linux 发行版众多，我**无法保证别的包源、别的发行版能否这么操作**。

- 操作系统：Arch Linux
- 桌面环境：KDE 6

## 一、原生 Wine
之前依照律回指南的推荐折腾了下 Bottles。但遗憾的是，由于 Flatpak 沙箱等因素，它似乎只能运行「星辰之光」，像原版红红、心灵终结 3.3.6 均会在读条时 Fatal Error 弹窗。  
有一天我在玩《多娜多娜》的时候发现需要解决字符编码问题（存档找不到），遂折腾起了原生 Wine。在一番尝试之下，终于得到了更普适红警 2 的原生 Wine 运行方案。

> 对于原生 wine 更详尽的介绍建议查阅[官方英文 Wiki](https://wiki.archlinux.org/title/wine) 和[中文社区的翻译](https://wiki.archlinuxcn.org/wiki/Wine)。

我这里安装了`wine`^multilib^和`winetricks`^multilib^两个软件包。前者提供最基本的兼容环境，后者则为环境的搭建、管理提供一定辅助。
```bash
sudo pacman -S wine winetricks
```

> [!note]
> multi-lib 软件源需要在 pacman 设置里手动启用。参见 [Arch 安装流程](../OS/ArchInstall.md#_3-2-包管理器配置)。

安装好之后，在终端里跑一下`regedit`，让 wine 帮你建立默认容器（位于`~/.wine`）。出现注册表编辑器的界面之后，容器也就建立完成，可以关掉这个界面了。

> [!note]
> 在 Linux 中，`~`和`$HOME`^①^通常指代`/home/<user_id>`，比如`/home/chloridep`。
> 类比下 Win7 的`%UserProfile%`和`C:\Users\chloridep`就知道了。
> 
> ① Linux 的路径是**区分大小写**的，终端里的环境变量（通常全大写）也是。
> ::: center
> YURI.exe &ne; yuri.EXE；$HOME &ne; $home
> :::

## 二、准备游戏文件
「星辰之光」目前采用 ZIP 压缩包方式分发。在 Windows 中 ZIP 里面文件名是用 ANSI（简中实为 GB2312）编码的，这种编码在 UTF-8 系统中不兼容：

![反之，UTF-8 强转 GBK 容易出现「锟斤拷」。](./es_archive_gb2312.webp =50%x50%)

所以我们在终端里用`unzip`解压：

```bash
sudo pacman -S unzip
# 请根据实际情况替换压缩包路径
unzip -O GBK -o '~/Documents/Extreme Starry v0.6.zip'
# 如果网络不好，不方便更新，并且群里恰有离线更新包，也可以直接下载、覆盖更新
unzip -O GBK -o '~/Documents/0.6.2 离线更新包.zip' -d './Extreme Starry'
```

::: details unzip 命令行解释
`unzip [opt] </path/to/zip> [-d extract_dir]`

- `-O encoding`：指定在 Windows 里打包的 ZIP 采用什么编码打开。
- `-o`（注意大小写不一样）：有相同文件名的，一律覆盖。
- `/path/to/zip`：zip 路径。
> 遇到空格需要加反斜杠转义，或者像我那样直接打引号。
- `-d extract_dir`：解压到单独的文件夹。
> 像上面离线包直接解压出来是散装跟`Extreme Starry`并列放的。而`~/Documents`可能不止放「星辰之光」。

更多细节还请自行`unzip -h`。虽然解说都是英文。
:::

如果你不仅仅打算玩「星辰之光」，还想尝试别的 mod 的话，推荐你把公用的文件用「软链接」的方式共享。

::: tip 软链接
Linux 的文件管理思路与 Windows 不太一样，喜欢「复用」，也就是用软链接实现文件的共享。  
在 Linux Shell 里，`ln`命令用来创建链接（和 Windows CMD 的`mklink`命令类似）：
```sh
ln -s src dst
```

尽管不同红警 2 mod 的包体各有差异，但这 7 个文件是大部分 mod 必需的：
`binkw32.dll` `blowfish.dll` `gamemd.exe` `language.mix` `langmd.mix` `ra2.mix` `ra2md.mix`。我们完全可以在不同 mod 之间「复用」它们：

```sh
ln -s ~/Documents/cnc2yuri/ra2.mix ~/Documents/MentalOmega330Mod/ra2.mix
ln -s ~/Documents/cnc2yuri/gamemd.exe ~/Documents/MentalOmega330Mod/gamemd.exe
...
```
这样就把原版红红的文件共享给了心灵终结 3.3。
:::

## 三、Wine 容器配置
前面说过，Wine 容器配置主要用`winetricks`。但需要注意，`winetricks`会优先从 GitHub 下载文件，对于无法裸连 GitHub 的地区，需要在终端指定代理环境变量：
```bash
# 端口 7890 是大部分代理软件默认占用的端口号。
# 至于 Linux 里如何配置代理，还请自行搜索相关博客、论坛。
env HTTP_PROXY=http://localhost:7890 env HTTPS_PROXY=http://localhost:7890 winetricks
```
执行这个命令片刻后，Winetricks 界面出现。

![Winetricks（中文有点搞）](./winetricks_1.webp =50%x50%)

上面我们让 wine 建过默认容器，直接「选择默认的 Wine 容器」OK 就可以了。

### I. 安装 Windows DLL 或组件
点进去选中上述小标题那项，OK 再进一层界面。

![安装运行时依赖](./winetricks_2.webp =50%x50%)

对于红警 2，需要安装如下组件（可以在组件列表里多选）：
- `cnc_ddraw`
- `d3dcompiler_*`（星号表示全都要，下同）
- `d3dx9`（Reshade 用）
> 此外还有`d3dx10`和`d3dx11_*`，就红红而言没有必要）
- `dxvk`（没有星号，只装最新的）
> 用于 DirectX 转 Vulkan，否则客户端、Reshade 特效等无法显示
- `dxvk_nvapi????`（问号表示只看最新版，下同）
> NVIDIA 显卡推荐用这个，不行再考虑上一个

> [!warning]
> cnc_ddraw 默认食用 dx，无法用于 FinalAlert2 地图编辑器，但 wine 内置的 ddraw 可以。

此外推荐以下组件：
- `vcrun????`
- `physx`（用于 NVIDIA 显卡）

全部安装完成之后会自动退回上一级界面，便于你接下来操作。

### II. 安装字体
如果你像我一样还玩别的游戏 ~~Unity 小黄油~~，或者是制作地图需要运行 FA2，那么需要补全中文~~和日文~~字体。当然你也可以图方便，直接从别人的 C 盘里复制字体：
- `C:\Windows\Fonts`（全部用户）
- `C:\Users\meloland\AppData\Local\Microsoft\Windows\Fonts`（仅`meloland`这个用户）

但我是讨厌微软雅黑的。所以我还是选择安装替代字体。还是选中小标题那项，OK 进去装：

![安装字体](./winetricks_3.webp =50%x50%)

- `fakechinese`：用思源黑体替代默认中文字体
- `fakejapanese*`：用 思源黑体、IPAMona、VLGothic 字体替代日文默认字体和 Meriyo 字体

装完就可以关掉了。

## 四、开玩

在做完全部配置之后，便可以启动游戏了：

![在 Arch 里玩「星辰之光」训练关](./gamemd_archlinux.webp)

## 五、注意事项
这里记录一些我遇到的问题，仅供参考。

### I. Syringe 命令行参数解析失败
Linux 里允许文件名带双引号`"gamemd".exe`，如此一来在终端里试图用 Syringe 注入会引发歧义：
```log
[20:41:50] Syringe 0.7.2.2
[20:41:50] ===============

[20:41:50] WinMain: arguments = "\"FA2.dat\""
[20:41:52] WinMain: No or invalid command line arguments given, exiting...
[20:41:52] WinMain: Exiting on failure.
```

解决方法也很简单。官版 Ares 把命令行写在`RunAres.bat`里，我们稍微修改一下它：
```batch
PUSHD %~dp0
Syringe.exe "gamemd.exe" -SPEEDCONTROL -CD -LOG
```
然后就可以`wine cmd /c 'path/to/batch'`了：

![注意在 cmd 里不要用 ~，Windows 里没这玩意](./syringe_winecmd.webp =50%x50%)

### II. 部分 mod 无法打开 CNCNet 客户端
不同 mod 客户端要求的 .NET 运行库版本不同。像 Project Phantom（幽灵计划，简称 PP）的客户端需要 .NET Framework 4.8.1，而 Winetricks 目前最高支持 .NET Framework 4.8.0。

对于所需运行库尚未支持的客户端/程序，可能还是虚拟机法或者直接在 Windows To Go 里玩更为合适。毕竟 Wine 再怎么兼容也不如真正的 Windows 地道。
