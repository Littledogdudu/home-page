# 1 Plugin：离线状态下为Claude Code安装插件

## 1.1 Download：通过`git clone`或直接下载压缩包

> [!tip] 检查你的插件文件
> - 使用`git clone`克隆项目后注意查看项目根目录下是否包含`.claude-plugin/marketplace.json`
> - 如果直接下载压缩包，解压后也要注意查看项目根目录下是否包含`.claude-plugin/marketplace.json`

## 1.2 Marketplace：添加插件市场到Claude

1. 终端打开Claude Code
2. 在Claude Code中输入`/plugin`打开插件设置
3. 左右键移动到`Marketplaces`选项
4. 选择`Add Marketplace`并把第一步克隆或解压的项目文件夹路径复制粘贴到输入框，路径需要注意以下几点👇

> [!danger] 路径要点
> - 路径必须是`.claude-plugin`文件夹的父级文件夹，Claude Code会自动添加`.claude-plugin/marketplace.json`以便正确添加插件市场
> - 路径尽可能填写绝对路径，相对路径是相对于启动Claude Code时的路径。如果每个项目都包含自己的插件，则可以使用相对路径引入

## 1.3 Discover：添加插件到Claude

1. 添加插件市场后会自动跳转到插件设置的`Discover`，没有自动跳转则需要手动左右方向键选中插件设置的`Discover`
2. 在`Discover`中查询插件进行安装即可