# Railway Deployment Guide for Evo Resume Backend

## Prerequisites
1. Railway account (free tier available at https://railway.app)
2. GitHub repository with the Evo code pushed
3. Railway CLI installed (optional, but recommended)

## Deployment Steps

### Option 1: Deploy via Railway Dashboard (No CLI needed)

1. **Sign up / Login to Railway**
   - Go to https://railway.app
   - Sign up or log in with GitHub

2. **Create a New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Connect your GitHub account if needed
   - Select the `Antigravity/Evo-` repository

3. **Configure Service**
   - Railway auto-detects that this is a Python project
   - Select `backend` as the root directory (if prompted)
   - Click "Deploy"

4. **Set Environment Variables**
   - Go to your project dashboard
   - Select the backend service
   - Go to "Variables" tab
   - Add the following variables:
     ```
     PYTHONUNBUFFERED=1
     ```

5. **Monitor Deployment**
   - Watch the build logs in the Dashboard
   - Once deployed, you'll get a public URL (e.g., `https://evo-backend-prod.railway.app`)

### Option 2: Deploy via Railway CLI (Recommended)

1. **Install Railway CLI**
   ```bash
   npm install -g @railway/cli
   ```
   Or using Homebrew:
   ```bash
   brew install railwayapp/railway/railway
   ```

2. **Login to Railway**
   ```bash
   railway login
   ```
   - Opens browser for authentication

3. **Initialize Railway Project**
   ```bash
   cd /Users/hello/Antigravity/Evo-
   railway init
   ```
   - Select "Create a new project"
   - Give it a name (e.g., "evo")

4. **Configure Backend Root**
   ```bash
   railway service add backend
   railway env PYTHONUNBUFFERED=1
   ```

5. **Deploy**
   ```bash
   railway up
   ```
   - Uploads code and triggers build
   - Deployment completes in 2-5 minutes

6. **Get Public URL**
   ```bash
   railway env RAILWAY_PUBLIC_DOMAIN
   ```

## Post-Deployment

### Verify Deployment
```bash
curl https://your-railway-url/supported-providers
```

Should return:
```json
{
  "providers": {
    "gemini": {"default_model": "gemini-2.0-flash"},
    ...
  }
}
```

### Update Frontend API URL
After deployment, update your frontend to use the Railway backend URL:

1. In `/app/page.tsx`, change:
   ```typescript
   const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
   ```

2. Or set environment variable in your `.env.local`:
   ```
   NEXT_PUBLIC_API_URL=https://your-railway-url
   ```

## Environment Variables on Railway

Add these to the Railway dashboard Variables section if needed:

| Variable | Value | Required |
|----------|-------|----------|
| `PYTHONUNBUFFERED` | `1` | Yes |
| `GEMINI_API_KEY` | Your Gemini API Key | No* |
| `DEBUG` | `false` | No |

*If not set, users must provide their own API keys via frontend headers

## Logs & Monitoring

- **View Logs**: Railway Dashboard → Service → Logs tab
- **Monitor Metrics**: Railway Dashboard → Service → Metrics tab
- **Restart**: Dashboard → Service → More → Restart

## Costs

- **Free Tier**: $5 credit/month, 500 hours/month uptime
- **Paid**: $5/month per 1GB RAM instance
- Your first deployment is free

## Troubleshooting

### Deployment Fails
- Check build logs in Railway dashboard
- Ensure `Procfile` and `Dockerfile` exist in backend directory
- Verify `requirements.txt` is up to date

### 502 Bad Gateway
- Check if service is running: `railway logs`
- Verify no syntax errors: `python -m py_compile main.py`
- Restart the service from dashboard

### Port Issues
- Railway assigns `PORT` env variable automatically
- Dockerfile and Procfile already configured to use `$PORT`

## Useful Commands

```bash
# Login
railway login

# Initialize new project
railway init

# Check current service
railway service list

# View logs
railway logs --follow

# Check variables
railway env show

# Set variable
railway env PYTHONUNBUFFERED=1

# Deploy
railway up

# Open dashboard
railway open
```

## Support
- Railway Docs: https://docs.railway.app
- GitHub Issues: https://github.com/railwayapp/railway/issues
