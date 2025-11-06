# EASTDOC STUDIOS

A modern, professional studio booking website built with Next.js 14, TypeScript, and Tailwind CSS.

## Features

- 🎨 Modern, responsive design
- 🎭 Smooth animations with Framer Motion
- 📝 Fully functional booking form with validation
- 📧 Email integration ready (Resend/SendGrid)
- ⚡ Optimized for Vercel deployment
- 🔍 SEO-friendly with Next.js App Router
- 📱 Mobile-first responsive design

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Navigate to the project directory:
```bash
cd eastdoc-studios-nextjs
```

2. Install dependencies:
```bash
npm install
```

3. Create your environment file:
```bash
cp .env.example .env.local
```

4. Add your email service API key (optional for local development):
```bash
# .env.local
RESEND_API_KEY=your_api_key_here
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment to Vercel

### Option 1: Deploy with Vercel CLI

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel
```

3. Follow the prompts to link your project.

### Option 2: Deploy with GitHub

1. Push your code to GitHub:
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin your-repo-url
git push -u origin main
```

2. Go to [vercel.com](https://vercel.com)
3. Click "New Project"
4. Import your GitHub repository
5. Configure environment variables:
   - Add `RESEND_API_KEY` (or your email service key)
   - Add `BOOKING_EMAIL` and `ADMIN_EMAIL`
6. Click "Deploy"

## Email Service Setup

### Using Resend (Recommended)

1. Sign up at [resend.com](https://resend.com)
2. Get your API key
3. Add to `.env.local`:
```bash
RESEND_API_KEY=re_xxxxxxxxxxxxx
```

4. Update `app/api/booking/route.ts` and uncomment the Resend code

### Using SendGrid

1. Sign up at [sendgrid.com](https://sendgrid.com)
2. Get your API key
3. Install SendGrid:
```bash
npm install @sendgrid/mail
```

4. Update the API route accordingly

## Project Structure

```
eastdoc-studios-nextjs/
├── app/
│   ├── api/booking/          # API route for form submission
│   ├── globals.css           # Global styles
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Homepage
├── components/
│   ├── BookingForm.tsx       # Booking form with validation
│   ├── Header.tsx            # Navigation header
│   ├── Hero.tsx              # Hero section
│   ├── MembersSection.tsx    # Client testimonials
│   └── Studios.tsx           # Studios showcase
├── public/                   # Static assets
├── lib/                      # Utility functions
├── next.config.js            # Next.js configuration
├── tailwind.config.ts        # Tailwind CSS configuration
└── package.json              # Dependencies
```

## Customization

### Updating Content

- **Studios**: Edit `components/Studios.tsx`
- **Members**: Edit `components/MembersSection.tsx`
- **Contact Info**: Edit `components/BookingForm.tsx`

### Styling

The project uses Tailwind CSS. Modify:
- `tailwind.config.ts` for theme customization
- `app/globals.css` for global styles

### Fonts

Fonts are loaded via Next.js Font Optimization in `app/layout.tsx`:
- Montserrat (headings)
- Lora (elegant text)
- Roboto (body text)

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `RESEND_API_KEY` | Resend email API key | No (but recommended) |
| `BOOKING_EMAIL` | Email to receive bookings | No |
| `ADMIN_EMAIL` | Admin email address | No |

## Performance

- ⚡ Next.js 14 with App Router
- 🖼️ Optimized images with Next/Image
- 📦 Code splitting and lazy loading
- 🎯 Server-side rendering where beneficial

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

Private - All Rights Reserved

## Support

For issues or questions, contact: admin@eastdocstudios.com
