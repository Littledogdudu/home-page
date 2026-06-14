# 基于Quartz v5的个人博客网站

## Let's Start

### 安装依赖

```shell
npm i
```

### 安装插件

```shell
npm run build:plugins
```

> 这条命令包括两个步骤
>
> - npm run build-plugin（构建本地plugins文件夹下的插件）
> - npm run install-plugins（安装quartz5社区插件）
>
> 如果修改了plugins文件夹下的内容，需要重新执行`npm run build-plugin`或在对应插件目录下（例如home文件夹下）执行`npm run build`命令，
> 并`npm run dev`重启服务器才能生效

### 启动命令

```shell
npm run dev
```

## 部署到Cloudflare

在项目根目录下的`.github/workflows`目录下有如下文件：

- build-preview.yaml（pull request，即别人向你推送PR请求时自动部署到Cloudflare生成预览）
- ci.yaml（pull request、push后自动进行全流程测试，检查代码是否可正常运行）
- deploy-preview.yaml（build-preview.yaml运行后的预览部署配置）
- deploy-v5.yaml（v5分支push后自动部署到Cloudflare的配置）

在这些文件中包含三个环境变量需要自行创建：

- secrets.CLOUDFLARE_API_TOKEN
- secrets.CLOUDFLARE_ACCOUNT_ID

> secrets.GITHUB_TOKEN由Github流水线启动时自动创建

### 在哪里配置？

> 前提：你需要先创建一个Github仓库

![github-repo-setting.png](.github/assets/github-repo-setting.png)

1. 进入仓库，点击顶部菜单栏中的`Settings`
2. 左侧边栏找到`Secrets and variables`并单击
3. 单击`Actions`进入Actions页面
4. 在Actions内容页面中左键单击绿色按钮`New repository secret`

### CLOUDFLARE_API_TOKEN

进入到Cloudflare主页面

1. 点击网页右上角的头像，弹出的下拉框选择`profile`
2. 在左侧边栏左键单击选择`API Tokens`
3. 在右边页面左键单击右上角蓝色按钮`+ Create Token`
4. 左键单击第一个`Create Custom Token`后面的`Get started`按钮

![cloudflare-APIToken.png](.github/assets/cloudflare-APIToken.png)

1. 填写`Token name`
2. `Permissions`栏中第一个选择框选择`Account`
3. `Permissions`栏中第二个选择框选择`Cloudflare Pages`
4. `Permissions`栏中第三个选择框选择`Edit`权限
5. `Account Resources`栏中第一个选择框选择`Include`
6. `Account Resources`栏中第二个选择框选择你自己的账户（⚠️ 这个账户和下面你复制的Account ID的账户必须是同一个）
7. 鼠标左键单击页面底部的蓝色按钮`Continue to summary`
8. 二次确认窗口鼠标左键单击蓝色按钮`Create Token`

> ⚠️ 务必在此页面点击复制按钮复制token，之后Cloudflare将不会再提供该token，如果忘记复制了则需要重新生成新的token

### CLOUDFLARE_ACCOUNT_ID

鼠标左键单击左上角Cloudflare图标返回到Cloudflare主页面

![cloudflare-accountId.png](.github/assets/cloudflare-accountId.png)

1. 在左侧边栏找到Build一栏，鼠标左键`Compute`
2. 再单击`Workers & Pages`
3. 点击右边页面`Account ID`的复制按钮即可复制

### 修改部署在CloudFlare的Pages名称

在以下两个部署配置文件中

- deploy-preview.yaml
- deploy-v5.yaml

存在两个配置项：

- projectName
- deploymentName

你可以通过修改`projectName`来更改在CloudFlare Pages上的名称  
通过修改`deploymentName`来更改Github Pages上的名称
