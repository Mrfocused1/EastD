# 🤖 EastDock AI Builder

Your personal AI coding assistant powered by GLM-4.7, integrated directly into the admin panel.

## 🎯 What It Does

The AI Builder is a chatbot that can:
- 📖 Read and understand your codebase
- ✏️ Create new pages, components, and sections
- 🐛 Fix bugs in your UI code
- 🎨 Update styles and layouts
- 🚀 Deploy changes directly to GitHub and Vercel

## 🔧 Features

### 🛡️ Safe by Design
- **File Whitelist**: Only modifies UI files (components, pages, styles)
- **Protected Areas**: Cannot touch API routes, configs, or sensitive files
- **Code Validation**: Checks for security issues before writing
- **Approval Required**: Shows you exactly what will change before deployment

### 🚀 Direct Deployment
- **Bypass Pull Requests**: Pushes directly to main branch
- **Auto-Deploy**: Vercel automatically deploys your changes
- **Deployment History**: Track all AI-made deployments
- **Rollback Support**: Undo changes if needed

### 💬 Smart Conversations
- **Context Preservation**: Remembers the entire conversation
- **Tool Execution**: Can read files, search code, and make changes
- **Streaming Responses**: Real-time updates as it works
- **Supabase Storage**: Conversation history saved to database

## 📁 File Structure

```
/app/api/ai-builder/
  ├── chat/route.ts          # Main chat endpoint with streaming
  └── deploy/route.ts        # Deployment and rollback endpoints

/components/admin/
  └── AIBuilderChat.tsx      # Chat UI component

/lib/
  ├── glm-client.ts          # GLM-4.7 API integration
  ├── github-deployer.ts     # GitHub API for direct push
  └── file-safety.ts         # File validation and security

Database Tables:
  ├── ai_builder_conversations  # Conversation history
  ├── ai_builder_messages       # Chat messages
  └── ai_builder_deployments    # Deployment tracking
```

## 🚀 Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

This will install:
- `openai` - GLM-4.7 API client
- `@octokit/rest` - GitHub API client

### 2. Configure Environment Variables

Copy the required variables from `.env.ai-builder` to your `.env.local`:

```bash
# GLM API Key (already provided)
GLM_API_KEY=b173f65bddf643859165f424036f20e8.SBNisaIvJgVEmyeh

# GitHub Configuration
GITHUB_PAT_TOKEN=your_github_pat_here
GITHUB_OWNER=your_username
GITHUB_REPO=EastD
GITHUB_BRANCH=main
```

### 3. Create GitHub Personal Access Token

1. Go to: https://github.com/settings/tokens
2. Click **"Generate new token"** → **"Generate new token (classic)"**
3. Name it: `EastDock AI Builder`
4. Select scopes:
   - ✅ **repo** (Full control of private repositories)
   - ✅ **workflow** (Update GitHub Action workflows)
5. Click **"Generate token"**
6. **Copy the token immediately** (you won't see it again!)
7. Paste it in `.env.local` as `GITHUB_PAT_TOKEN`

### 4. Configure GitHub Repository

If your `main` branch has branch protection enabled:

**Option A:** Disable branch protection (simplest)
- Go to: Repository → Settings → Branches
- Remove protection from `main` branch

**Option B:** Allow bypass (recommended)
- Go to: Repository → Settings → Branches → Edit protection rules
- Under "Allow specified actors to bypass required pull requests"
- Add your GitHub App or create a GitHub App for this purpose

### 5. Add Environment Variables to Vercel

For production deployment:

1. Go to: Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add the same variables from `.env.local`
3. Make sure to add them for **Production**, **Preview**, and **Development**

### 6. Start Development Server

```bash
npm run dev
```

The AI Builder chat button will appear in the bottom-right corner of the admin panel!

## 📖 Usage Guide

### Opening the Chat

1. Navigate to any admin page (e.g., `/admin`)
2. Click the **blue floating button** in the bottom-right corner
3. The chat window will expand

### Example Requests

#### Creating New Components
```
"Add a testimonials section to the homepage with 3 cards"
```

#### Fixing Bugs
```
"The navigation menu is not closing on mobile. Can you fix it?"
```

#### Updating Styles
```
"Make the hero section taller and change the background to a gradient"
```

#### Creating Pages
```
"Create a new FAQ page with accordion-style questions"
```

### Deployment Flow

1. **Request**: Ask the AI to make changes
2. **Processing**: AI reads relevant files and generates code
3. **Preview**: Shows you which files will be modified
4. **Approval**: Click "Deploy to Production" to push changes
5. **Deployment**: Code pushed to GitHub → Vercel deploys automatically
6. **Live**: Changes live in ~2-3 minutes

## 🔒 Security Features

### File Whitelisting

**Can modify:**
- ✅ `/app` - Pages and layouts (except `/app/api`)
- ✅ `/components` - React components
- ✅ `/app/globals.css` - Global styles
- ✅ `/tailwind.config.ts` - Tailwind config

**Cannot modify:**
- ❌ `/app/api` - API routes
- ❌ `.env*` - Environment files
- ❌ `/lib/supabase.ts` - Database config
- ❌ `/lib/stripe.ts` - Payment config
- ❌ `package.json` - Dependencies
- ❌ `next.config.js` - Next.js config

### Code Validation

Automatically checks for:
- ❌ `eval()` calls
- ❌ `dangerouslySetInnerHTML`
- ❌ `require('child_process')`
- ❌ Direct file system access in client code
- ❌ Direct `process.env` access in client code

### Manual Approval

- All deployments require manual approval
- See exactly what changes before pushing
- Cancel deployments if something looks wrong

## 🛠️ Advanced Features

### Viewing Deployment History

```bash
GET /api/ai-builder/deploy
```

Returns the last 10 deployments made by AI Builder.

### Rolling Back Changes

```bash
POST /api/ai-builder/deploy
{
  "action": "rollback",
  "commitSha": "abc123..."
}
```

Reverts to a previous commit.

### Conversation Persistence

All conversations are saved to Supabase:
- `ai_builder_conversations` - Conversation metadata
- `ai_builder_messages` - Individual messages
- `ai_builder_deployments` - Deployment tracking

## 🐛 Troubleshooting

### "GITHUB_PAT_TOKEN is not configured"

**Solution**: Make sure you've added your GitHub PAT to `.env.local` and restarted the dev server.

### "Permission denied" when pushing to GitHub

**Solutions**:
1. Check that your PAT has `repo` and `workflow` scopes
2. Disable branch protection on `main`, OR
3. Add your PAT to the bypass list in branch protection settings

### Chat not appearing

**Solutions**:
1. Clear browser cache and reload
2. Check browser console for errors
3. Make sure you're on an `/admin/*` page

### Deployment takes too long

**Expected**: Vercel deployments typically take 2-3 minutes. The chat will show "Live in ~2-3 minutes" after successful push.

### Changes not showing up

**Solutions**:
1. Wait 2-3 minutes for Vercel deployment
2. Hard refresh the page (Cmd+Shift+R or Ctrl+Shift+F5)
3. Check Vercel dashboard for deployment status

## 💡 Tips & Best Practices

### 1. Be Specific
❌ "Make it look better"
✅ "Increase the hero section height to 80vh and add a subtle gradient background"

### 2. One Task at a Time
❌ "Add testimonials, update the footer, and fix the contact form"
✅ "Add a testimonials section to the homepage"

### 3. Review Before Deploying
- Always check the file diff preview
- Make sure only intended files are being modified
- Cancel if you see unexpected changes

### 4. Keep Conversations Focused
- Start a new chat for unrelated tasks
- This helps maintain context and prevents confusion

### 5. Test After Deployment
- Wait for deployment to complete
- Test the changes on the live site
- Use rollback if something breaks

## 📊 Cost Estimate

- **GLM-4.7 API**: $3/month (unlimited usage on coding plan)
- **Vercel**: Free tier or your current plan
- **Supabase**: Free tier or your current plan
- **GitHub**: Free (PAT tokens included)

**Total additional cost: ~$3/month**

## 🤝 Support

If you encounter issues:

1. Check this README first
2. Look at the browser console for errors
3. Check Vercel deployment logs
4. Review the Supabase database for conversation history

## 🎉 Enjoy!

You now have a personal AI coding assistant that can build and deploy features on your website with just a conversation!

Ask it to build something and watch the magic happen. ✨
