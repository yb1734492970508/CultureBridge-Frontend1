# GitHub Repository Creation and Code Upload Guide
# GitHub 仓库创建与代码上传指南

This document will guide you on how to create a GitHub repository for the CultureBridge frontend project and upload the initial code.
本文档将指导您如何为 CultureBridge 前端项目创建 GitHub 仓库并上传初始代码。

## 1. Create GitHub Repository
## 1. 创建 GitHub 仓库

1. Log in to your GitHub account.
1. 登录您的 GitHub 账户。
2. Click the "+" icon in the top right corner and select "New repository".
2. 点击右上角的 "+" 图标，选择 "New repository"。
3. Fill in the repository information:
3. 填写仓库信息：
   - Repository name: `CultureBridge-Frontend`
   - Repository name: `CultureBridge-Frontend`
   - Description: `Frontend code for the CultureBridge cross-cultural exchange platform`
   - Description: `CultureBridge 跨文化交流平台的前端代码`
   - Select "Public" or "Private" (according to your needs).
   - 选择 "Public" 或 "Private"（根据您的需求）。
   - Check "Add a README file" (optional, as we already have README.md).
   - 勾选 "Add a README file"（可选，因为我们已经有了README.md）。
   - Check "Add .gitignore", select "Node" template.
   - 勾选 "Add .gitignore"，选择 "Node" 模板。
   - Check "Choose a license", select "MIT License" (or your preferred license).
   - 勾选 "Choose a license"，选择 "MIT License"（或您偏好的许可证）。
4. Click the "Create repository" button.
4. 点击 "Create repository" 按钮。

## 2. Initialize Git Repository Locally and Upload Code
## 2. 在本地初始化 Git 仓库并上传代码

### If you have already downloaded the project files
### 如果您已下载项目文件

1. Open your terminal and navigate to the project directory:
1. 打开终端，进入项目目录：
   ```bash
   cd Your Download Path/CultureBridge-Frontend
   cd 您的下载路径/CultureBridge-Frontend
   ```

2. Initialize a Git repository:
2. 初始化 Git 仓库：
   ```bash
   git init
   ```

3. Add the remote repository:
3. 添加远程仓库：
   ```bash
   git remote add origin https://github.com/YourUsername/CultureBridge-Frontend.git
   git remote add origin https://github.com/您的用户名/CultureBridge-Frontend.git
   ```

4. Add all files to the staging area:
4. 添加所有文件到暂存区：
   ```bash
   git add .
   ```

5. Commit changes:
5. 提交更改：
   ```bash
   git commit -m "Initialize CultureBridge frontend project"
   git commit -m "初始化 CultureBridge 前端项目"
   ```

6. Push to GitHub:
6. 推送到 GitHub：
   ```bash
   git push -u origin main
   ```
   Note: If your default branch is master, please use `git push -u origin master`.
   注意：如果您的默认分支是 master，请使用 `git push -u origin master`。

### If you created a repository with initial files on GitHub
### 如果您在 GitHub 上创建了带有初始文件的仓库

1. Clone the repository to your local machine:
1. 克隆仓库到本地：
   ```bash
   git clone https://github.com/YourUsername/CultureBridge-Frontend.git
   git clone https://github.com/您的用户名/CultureBridge-Frontend.git
   ```

2. Copy the downloaded project files into the cloned directory.
2. 将下载的项目文件复制到克隆的目录中。

3. Add all files to the staging area:
3. 添加所有文件到暂存区：
   ```bash
   git add .
   ```

4. Commit changes:
4. 提交更改：
   ```bash
   git commit -m "Add CultureBridge frontend project files"
   git commit -m "添加 CultureBridge 前端项目文件"
   ```

5. Push to GitHub:
5. 推送到 GitHub：
   ```bash
   git push
   ```

## 3. Verify Upload
## 3. 验证上传

1. Visit your GitHub repository page: `https://github.com/YourUsername/CultureBridge-Frontend`
1. 访问您的 GitHub 仓库页面：`https://github.com/您的用户名/CultureBridge-Frontend`
2. Confirm that all files have been successfully uploaded.
2. 确认所有文件已成功上传。
3. Check if README.md is displayed correctly.
3. 查看 README.md 是否正确显示。

## 4. Share Repository Link
## 4. 分享仓库链接

After completing the above steps, you can share the repository link `https://github.com/YourUsername/CultureBridge-Frontend` with team members so they can continue development work using the identifier CB-FRONTEND.
完成上述步骤后，您可以将仓库链接 `https://github.com/您的用户名/CultureBridge-Frontend` 分享给团队成员，以便他们可以通过识别码 CB-FRONTEND 继续开发工作。

## Common Issues and Solutions
## 常见问题解决

### Push Rejected
### 推送被拒绝

If you encounter a "rejected" error when pushing, it may be because the remote repository contains commits not present locally. Try pulling remote changes first:
如果您在推送时遇到 "rejected" 错误，可能是因为远程仓库包含本地没有的提交。尝试先拉取远程更改：

```bash
git pull --rebase origin main
```

Then push again:
然后再次推送：

```bash
git push origin main
```

### Authentication Failed
### 身份验证失败

If you encounter authentication issues, please ensure:
如果遇到身份验证问题，请确保：

1. You have correctly configured your Git user information:
1. 您已正确配置 Git 用户信息：
   ```bash
   git config --global user.name "Your Name"
   git config --global user.name "您的名字"
   git config --global user.email "Your Email"
   git config --global user.email "您的邮箱"
   ```

2. Use a Personal Access Token (PAT) instead of a password:
2. 使用个人访问令牌（PAT）而不是密码：
   - Create a PAT in GitHub: Settings > Developer settings > Personal access tokens
   - 在 GitHub 中创建 PAT：Settings > Developer settings > Personal access tokens
   - Use the PAT as your password for authentication.
   - 使用 PAT 作为密码进行身份验证。

### .gitignore File
### .gitignore 文件

To avoid uploading unnecessary files to the repository, it is recommended to add the following content to the .gitignore file:
为避免将不必要的文件上传到仓库，建议添加以下内容到 .gitignore 文件：

```
# Dependencies
# 依赖
/node_modules
/.pnp
.pnp.js

# Testing
# 测试
/coverage

# Production Build
# 生产构建
/build
/dist

# Miscellaneous
# 杂项
.DS_Store
.env.local
.env.development.local
.env.test.local
.env.production.local

npm-debug.log*
yarn-debug.log*
yarn-error.log*
```


