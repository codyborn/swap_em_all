# Deploying Swap 'Em All to Vercel

## Prerequisites

1. A [Vercel account](https://vercel.com/signup) (free tier works)
2. [Vercel CLI](https://vercel.com/docs/cli) installed (optional but recommended)

## Quick Deploy (Web UI)

1. **Push your code to GitHub** (if not already):
   ```bash
   git push origin main
   ```

2. **Go to Vercel**:
   - Visit [vercel.com](https://vercel.com)
   - Click "Import Project"
   - Import your GitHub repository

3. **Configure**:
   - Framework Preset: **Next.js** (auto-detected)
   - Root Directory: `./` (leave as default)
   - Build Command: `npm run build` (auto-detected)
   - Output Directory: `.next` (auto-detected)

4. **Add Environment Variables**:
   Click "Environment Variables" and add:

   ```
   UNISWAP_API_KEY=your_api_key_here
   NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id_here
   ```

5. **Deploy**:
   - Click "Deploy"
   - Wait 2-3 minutes for deployment to complete
   - You'll get a URL like: `https://your-app.vercel.app`

## Deploy via CLI (Faster)

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Login**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   vercel
   ```

   Follow the prompts:
   - Set up and deploy? **Y**
   - Which scope? (select your account)
   - Link to existing project? **N**
   - Project name? (press Enter to use default)
   - In which directory is your code located? **./** (press Enter)

4. **Add Environment Variables**:
   ```bash
   vercel env add UNISWAP_API_KEY
   # Paste your API key when prompted

   vercel env add NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID
   # Paste your WalletConnect project ID when prompted
   ```

5. **Redeploy with environment variables**:
   ```bash
   vercel --prod
   ```

## Environment Variables

Required environment variables:

- `UNISWAP_API_KEY` - Your Uniswap Trading API key (get from https://portal.uniswap.org/)
- `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` - Your WalletConnect project ID (get from https://cloud.walletconnect.com/)

## Automatic Deployments

Once deployed, Vercel will automatically deploy:
- **Production**: Every push to `main` branch
- **Preview**: Every push to other branches or pull requests

## Custom Domain (Optional)

1. Go to your project in Vercel dashboard
2. Click "Settings" > "Domains"
3. Add your custom domain
4. Update DNS records as instructed

## Troubleshooting

### Build fails with "Module not found"
- Make sure all dependencies are in `package.json`
- Run `npm install` locally to verify

### Environment variables not working
- Make sure you added them in Vercel dashboard
- Redeploy after adding environment variables
- Client-side variables must start with `NEXT_PUBLIC_`

### Wallet connection issues
- Make sure `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` is set
- Check that your domain is added to WalletConnect project settings

## Monitoring

- **Analytics**: Automatically enabled in Vercel dashboard
- **Logs**: View in Vercel dashboard under "Logs"
- **Performance**: Check Web Vitals in dashboard
