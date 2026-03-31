# Image Background Remover

AI-powered image background removal tool. Upload an image, remove the background, and download the result as a transparent PNG.

## Features

- 🚀 Drag & drop image upload
- 🎨 AI-powered background removal (via Remove.bg API)
- 📸 Side-by-side preview comparison
- ⬇️ One-click download
- 🔐 Google account sign-in
- 📱 Mobile friendly

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Authentication**: NextAuth.js v5 (Google OAuth)
- **Styling**: Tailwind CSS
- **API**: Remove.bg

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/lucascrischan/image-background-remover.git
cd image-background-remover
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Set up environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
# Google OAuth credentials
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
NEXTAUTH_SECRET=your_nextauth_secret_here
NEXTAUTH_URL=http://localhost:3000

# Remove.bg API (for background removal)
REMOVE_BG_API_KEY=your_api_key_here
```

### 4. Set up Google OAuth (required for login)

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create a new project (or select existing)
3. Enable **Google+ API**
4. Go to **Credentials** → **Create Credentials** → **OAuth client ID**
5. Application type: **Web application**
6. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
7. Copy **Client ID** and **Client Secret** to `.env.local`

### 5. Run the development server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deploy to Cloudflare Pages

Since this app uses NextAuth.js for authentication, it requires **Cloudflare Pages Functions** (not static export).

### Option 1: Cloudflare Pages (Recommended)

1. Push your code to GitHub
2. Connect your repository to [Cloudflare Pages](https://pages.cloudflare.com)
3. Go to **Settings** → **Functions** → **Compatibility mode** and set to **2024-04-01**
4. Set the build command: `pnpm build`
5. Set the output directory: `.next`
6. Add environment variables in **Settings** → **Environment variables**:
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL` (set to your Cloudflare Pages domain, e.g., `https://your-project.pages.dev`)
7. Deploy

For the Google OAuth redirect URI, add:
- `https://your-project.pages.dev/api/auth/callback/google`

### Option 2: Vercel (Easiest)

```bash
npm i -g vercel
vercel
```

Add environment variables in the Vercel dashboard.

## Usage

1. Sign in with Google (optional)
2. Drag and drop an image (JPG, PNG, or WebP, max 10MB)
3. Wait for AI processing
4. Preview the result side-by-side
5. Click "Download" to save the transparent PNG
6. xxxx

## License

MIT
