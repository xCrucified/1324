{
  "Title": "Corpse & Co. platform",
  "Badges": [
    "Next.js",
    "TypeScript",
    "PostgreSQL",
    "Prisma",
    "TailwindCSS"
  ],
  "Description": "An automated, high-performance dropshipping engine designed to connect Asian suppliers (1688, Pinduoduo) with the European market. Built with a two-tier architecture to separate public storefront operations from internal administration and scraping tools.",
  "System architecture": {
    "Description": "This repository contains two Next.js applications that operate independently but share a single PostgreSQL database.",
    "Structure": {
      "corpse-and-co/": {
        "apps/": {
          "admin-app/": "Local control panel (localhost:3001)",
          "client-app/": "Public storefront (Vercel)"
        },
        "packages/": {
          "database/": "Shared Prisma schema and client",
          "ui/": "Shared Tailwind components (optional)"
        },
        ".env": "Global environment variables",
        "package.json": "Project metadata and workspace config"
      }
    }
  },
  "Core features": {
    "Admin core (Localhost)": [
      "Smart scraper: Paste a 1688/Pinduoduo URL to automatically fetch product variations, images, and prices.",
      "AI localization: Integrates OpenAI to translate Chinese descriptions and strip supplier branding.",
      "Dynamic pricing: Auto-calculates retail prices (EUR) based on daily CNY rates and custom margin multipliers.",
      "Fulfillment hub: Formats order data for one-click copy-pasting into the Meest China logistics dashboard."
    ],
    "Client storefront (Public)": [
      "Optimized catalog: Server-Side Rendered (SSR) pages with next/image for lightning-fast loading and SEO.",
      "Frictionless checkout: Custom European address validation built with Zod.",
      "Crypto payments: Fully integrated with Cryptomus API (no traditional KYC/acquiring required). Webhooks automatically mark orders as PAID.",
      "Order tracking: A dedicated /track portal for customers to check their logistics status."
    ]
  },
  "Quick start": {
    "Prerequisites": [
      "Node.js 18+",
      "PostgreSQL database (Supabase / Neon)",
      "API Keys: Cryptomus, OpenAI, Telegram Bot"
    ],
    "Installation steps": [
      {
        "Step": "Clone and install",
        "Commands": [
          "git clone https://github.com/yourusername/corpse-and-co.git",
          "cd corpse-and-co",
          "npm install"
        ]
      },
      {
        "Step": "Database setup",
        "Description": "Configure your .env file with DATABASE_URL, then push the schema",
        "Commands": [
          "cd packages/database",
          "npx prisma db push",
          "npx prisma generate"
        ]
      },
      {
        "Step": "Run development servers",
        "Description": "Start the public storefront (Port 3000) and admin panel (Port 3001)",
        "Commands": [
          "npm run dev --filter client-app",
          "npm run dev --filter admin-app"
        ]
      }
    ]
  },
  "Infrastructure & workflows": {
    "Logistics": "Orders are forwarded to a Meest China warehouse in Guangzhou. We utilize the 'remove original packaging' service to ensure a white-label experience for European customers.",
    "Currency sync": "A Vercel Cron Job triggers daily to update the CNY/EUR exchange rate, adjusting storefront prices automatically to protect margins.",
    "Alerts": "The Telegram Bot API pings the admin chat instantly upon successful Cryptomus webhook payloads."
  }
}