---
category:
  - 操作系统
  - Linux
tag:
  - Arch Linux
  - KDE
---

# Arch Linux 个人配（调）置（教）小贴士

[书接上回](ArchInstall.md)，指南写着写着发现能聊的点子还挺多的。这一篇就主打日常使用了。  
仍然与上篇一样，我默认讨论的是 KDE 桌面环境。

## 应用程序问题

::: important 邦不住辣
嗯呢，嗯呢嗯呢～（主要记录一些经常遇到的问题，以及有效的暂行办法喵～）  
嗯呢、呢，嗯呢……（有些问题可能随时间推移会有更好的解法、甚至不再出现，还请原谅我更新得比较慢辣……）  
嗯！嗯呢！（当然！有需要的话可以提 Issue、Pull Request 告知我的喵！）

> 注：笔者并未玩过「绝区零」。只是觉得群友模仿邦布很可爱，也「鹦鹉学舌」几句。
:::

### LinuxQQ 登录界面一片空白

之前 chamber777 就报过「更新`linuxqq-4:3.2.9_24568-1`打开程序后（登录）界面全空，什么都不显示」；
而今我没在 QQ 里安装更新，却在`paru -Syu`更新 KDE Plasma 软件包之后出现了同样的状况。

经 Flysoft 排查，发现`libssh2.so`未能加载。因此在终端里手动加载该库：
```bash
env LD_PRELOAD="/usr/lib/libssh2.so" linuxqq
```
或者，可以编辑开始菜单的 QQ 快捷方式（`qq.desktop`）：  
右键「编辑应用程序」，在「应用程序」页里粘贴`LD_PRELOAD="/usr/lib/libssh2.so"`环境变量。

## GPG 密钥相关

主要是折腾提交签名（Commit Signing）时遇到的问题。

### i. VSCode 提交签名
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

### ii. GPG 密钥备份（导出导入）
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
重新导入 Key 之后，可能还需要`gpg --edit-key`更改密码（`passwd`）、重设信任（`trust`）。

## Linux Shell 相关
Shell 编程说实话也是一门学问，但这里只讨论两个东西，别名`alias`和函数`function`。  
你可以把需要简记、快速调用的东西包装成别名或者函数，写进`~/.bashrc`（或者`~/.zshrc`，如果你换用 zsh 的话）。
如此，每次启动`bash`或`zsh`时，你都可以享受这些用户定义带来的效率红利了（笑）。

### i. 别名
语法很简单：`alias a="b"`。注意等号两边**没有空格**。

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

### ii. 函数

Shell 的函数是这么写的：
```bash
function func-name() { }
```
函数适合「批处理」这种需要执行多条命令的场景。~~当然你也可以写`if`判断和`for`循环。但这不是重点。~~
目前来说，我只为了启动 OpenSeeFace 面捕 ~~（唉，底边皮套壬）~~ 写了个函数：

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
参考资料：[菜鸟教程](https://www.runoob.com/linux/linux-shell-func.html)

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

除了最简单的虚拟机大法之外，你也许听说过 Wine。当然 Steam 则采用 Proton。它们都是为了在 Linux 系统里「兼容」WinAPI 而生的兼容层。  
而说起 Wine，那确实能讲好几个夜晚，我也差不多摸索了半个月。毕竟我是搞红警 2 mod 出身的嘛，
姑且也为[游玩红警 2 模组「星辰之光」](../RA2/ExtremeStarryInLinux.md)的玩家写了一篇 Bottles 教程，这里就不再大篇幅去扯淡了，仅供参考。

原生`wine`^multilib^的配置建议参考[官方英文 Wiki](https://wiki.archlinux.org/title/wine)
和[中文社区的翻译](https://wiki.archlinuxcn.org/wiki/Wine)。

## 系统美化

> 「爱美之心，人皆有之。」

> [!tip]
> - **风格统一**是「美观」的必要条件。
> - 少搞「侵入性」美化。或者说，需要**修改系统文件、注入系统进程、破坏系统稳定的美化尽量少做**。
> - **谨遵发布页面附送的安装指引**（KDE 主题可以参考项目 GitHub），否则可能安装不全。

> [!warning]
> 目前大部分 KDE 美化方案适用于 KDE 5，换言之已经过时。比如`latte-dock`已明显无法用于 KDE 6。

### i. 仿 Mac
KDE 原生的桌面 UI 就挺 Windows 的，但胜在自由度足够高。
我**个人觉得** Mac OS 那种双栏比较好看、比较方便，所以稍微按照如下配置调整了面板布局。

仅供参考咯。

::: details Dock 栏
即原本的任务栏。
- 位于底部、居中、适宜宽度、取消悬浮、避开窗口
- 除「图标任务管理器」外，其余组件全部移除。
:::

::: details Finder 栏
即「应用程序菜单栏」（可在「编辑模式—添加面板」处找到）
- 位于顶部、居中、填满宽度、取消悬浮、常驻显示
- 自左到右依次为：
  - 应用程序启动器（类比开始菜单）
  - 窗口列表
  - 全局菜单（默认提供）
  - 「面板间距」留白
  - 数字时钟
    - 日期保持在时间旁边，而不是上下两行
    - 字号略小于菜单栏高度，凭感觉捏
  - 「面板间距」留白
  - 系统监视传感器
    - 横向柱状图（平均 CPU 温度、最高 CPU 温度）
    - 仅文字（网络上行、下行速度；网络上传、下载的总流量）
  - 系统托盘
:::

除了 Finder 栏外，可以在系统设置里更改屏幕四周的鼠标表现。
比如，鼠标移动到左上角可以自动弹出「应用程序启动器」，移到右上角可以切换你的桌面，等等。

### ii. Wine / Windows 字体选取

这个议题本身是出于我个人对字体的强迫症，以及个人对经典「微软雅黑」的偏见展开的，本来也没有讨论的必要。
但在探索 work around 时对 Windows 字体回落机制的 ~~阉阄~~ 研究还是值得一小节笔记的。

::: details Windows 字体选取机制
参考资料：[微软文档 -「全球化」- UI - 字体](https://learn.microsoft.com/zh-cn/globalization/fonts-layout/fonts)

Windows 主要通过注册表 `HKLM\SoftWare\Microsoft\Windows NT\CurrentVersion`
里的三个子项`Fonts` `FontSubstitutes` `FontLink\SystemLink`进行字体选取。

首先检索`Fonts`里对应字体规格是否有文件对应。例如，「微软雅黑 (TrueType)」会对应`msyh.ttc`。
一般 Windows Vista 及以上系统显然**有这个文件**，点开这个字体**文件也有名为「微软雅黑」的字体规格**，
那么系统便直接取指定文件的指定规格，去渲染**刷了指定字体格式的文字**（比如 Word、OBS 文字层、程序资源文件等）。
> 根据微软文档，字体「回落」首先发生在渲染引擎。比如，CSS 的`font-family`可以指定一系列字体，以应对不同操作系统的字体库差异。  
> 渲染引擎的「回落」在 Windows 里应该是仍遵循 Fonts 对应原则的。因为此时检索的还是具体的字体规格字符串，或者至少是字体名称字符串。

若找不到对应的字体规格，则尝试系统层面的 FallBack（即「回落」）。微软文档对 Windows 的回落机制有个大致的叙述：

> The Windows operating system allows for font substitution,
> but font substitution **should be considered a last resort approach**.

简单来说，**「链接」优先，「替代」保底**。
其中，「替代」是一对一的关系（值的类型均为`REG_SZ`，且并未看到过填入多个值的案例）；「链接」则维护备选的字体列表。
若原字体没有收录某个字、渲染不出来，则转而查询链接表；若仍猹不到，则直接将这类字体统一替代成相应的字体和代码页（即编码）。
:::

当然，随着我这边把系统区域与语言改为英语（美国），Wine 这边不可避免地出现编码混乱的问题（需要手动指定`LANG`环境变量），
动注册表触发系统级字体回落机制的办法已然失效。

## 重建 Grub 引导
虽然对多数人（乃至现在的我）来说重建引导似乎挺简单的，但还是需要说明一下，因为 Grub 引导钛脆弱辣。  
简而言之，一旦 Arch 系统硬盘出了什么变故（被 ChkDsk、DiskGenius 干过，或是换了块硬盘又换回来），其 Grub 引导均会失效（BIOS 不识别），但此时硬盘分区（含 EFI 分区）均完好。

重建 Grub 引导的详细介绍可以看[这篇文章](https://medium.com/@rahulsabinkar/how-to-restore-your-broken-grub-boot-loader-on-arch-linux-using-chroot-2fbc38bb01d9)；省流版说实话就是重走一遍安装系统时的「刷入 Grub 引导」流程：

- 从 LiveCD 启动，挂载`mount`相应分区。
- 【注意】确认分区实际 UUID 是否与挂载表`fstab`记载一致。如不放心，重新`genfstab`生成挂载表。
- 切换`arch-chroot`进挂载的 Arch 系统；
- 重刷 Grub `grub-install`。

上面提到的文章末尾还推荐你改用 [rEFInd](https://wiki.archlinux.org/title/REFInd)，但相关的介绍和教程已经在 Miku 指南里提及过了，这里就不再赘述。

::: details EFIStub 简介
参考资料：[Arch Wiki - EFIStub](https://wiki.archlinux.org/title/EFISTUB)

Arch 默认安装的 Linux 内核允许直接通过计算机固件（或者说 BIOS？）引导，并相应地加载、进入 Arch Linux 系统。

当然，有一些固件可能本身就支持新增、删除引导项（如华硕 Adol14Z）。方便的话，也可以直接在 BIOS 里操作；此外，还有一些固件不支持传递内核参数，需要另外包装成`.efi`文件交给固件引导（Wiki 2.1 注）。

我参考的两篇安装指南都有涉及`efibootmgr`软件包的安装，理论上你可以直接使用它来创建 UEFI 启动项：
```bash
# 以 Btrfs 文件系统为例（仅供参考）
sudo efibootmgr --create --disk /dev/nvme0n1 --part 1 \
  --label "Arch Linux" --loader /vmlinuz-linux \
  --unicode 'root=UUID=f6419b76-c55b-4d7b-92f7-99c3b04a2a6f rw rootflags=subvol=@  loglevel=3 quiet initrd=\intel-ucode.img initrd=\initramfs-linux.img'
```
`--unicode`后面跟着的就是**内核参数**。需要重点留意：
- `root=` Arch 系统根目录`/`分区
- `resume=` 休眠挂起、恢复的 Swap 分区
> 像上面的`UUID=`传参法需要确认好分区 UUID，可用`lsblk -o name,mountpoint,size,uuid`猹询。
> 此外尚不清楚`/dev/nvme0n1pX`这种写法可不可行。目前没有条件实机测试。

- `initrd=` 初始化镜像。每个镜像都要前置`initrd=`，并且挂载遵循先后顺序。
> 像`/boot/grub/grub.cfg`、`/boot/refind_linux.conf`这些启动管理器的配置文件都会写清楚要挂载的映像。

出于篇幅与安全性考虑，这里就不对 efibootmgr 作进一步介绍了。  
创建完启动项后可以重启、进入主板启动选项（想想你怎么用 U 盘装系统的）、选中你刚刚建好的启动项回车。若一切无误，你应该能直接看到 Linux 内核日志刷屏，然后便是用户登录界面。
:::
