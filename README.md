# Image Background Remover

AI-powered image background removal tool. Upload an image, remove the background, and download the result as a transparent PNG.

## Features

- 🚀 Drag & drop image upload
- 🎨 AI-powered background removal (via Remove.bg API)
- 📸 Side-by-side preview comparison
- ⬇️ One-click download
- 📱 Mobile friendly

## Tech Stack

- **Framework**: Next.js 16 (App Router)
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

Edit `.env.local` and add your Remove.bg API key:

```
REMOVE_BG_API_KEY=your_api_key_here
```

Get a free API key at [remove.bg](https://www.remove.bg/).

### 4. Run the development server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deploy to Cloudflare Pages

1. Push your code to GitHub
2. Connect your repository to Cloudflare Pages
3. Set the build command: `pnpm build`
4. Set the output directory: `.next`
5. Add environment variable: `REMOVE_BG_API_KEY`

## Usage

1. Drag and drop an image (JPG, PNG, or WebP, max 10MB)
2. Wait for AI processing
3. Preview the result side-by-side
4. Click "Download" to save the transparent PNG

## License

MIT
