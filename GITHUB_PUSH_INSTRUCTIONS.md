# Steps to Push Code to GitHub

## Step 1: Initialize Git Repository
```bash
cd "C:\projects\instagram Mini Clone"
git init
```

## Step 2: Add All Files
```bash
git add .
```

## Step 3: Make Initial Commit
```bash
git commit -m "Initial commit: Instagram Mini Clone project"
```

## Step 4: Create Repository on GitHub
1. Go to https://github.com
2. Click the "+" icon in the top right
3. Select "New repository"
4. Name it: `instagram-mini-clone` (or any name you prefer)
5. **DO NOT** initialize with README, .gitignore, or license (we already have these)
6. Click "Create repository"

## Step 5: Add Remote and Push
After creating the repository, GitHub will show you commands. Use these:

```bash
git remote add origin https://github.com/YOUR_USERNAME/instagram-mini-clone.git
git branch -M main
git push -u origin main
```

Replace `YOUR_USERNAME` with your actual GitHub username.

## Alternative: If you already have a repository
If you already created the repository on GitHub, just use:
```bash
git remote add origin YOUR_REPOSITORY_URL
git branch -M main
git push -u origin main
```

## Important Notes:
- Make sure you have a `.env` file in the Backend folder (it's in .gitignore, so it won't be pushed)
- The `.gitignore` file will prevent `node_modules` and sensitive files from being pushed
- You may need to authenticate with GitHub (use Personal Access Token if 2FA is enabled)

