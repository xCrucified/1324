markdown_content = """# Corpse & co. platform

![Next.js](https://img.shields.io/badge/Next.js-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

An automated, high-performance dropshipping engine designed to connect Asian suppliers (1688, Pinduoduo) with the European market. Built with a two-tier architecture to separate public storefront operations from internal administration and scraping tools.

## System architecture

This repository contains two Next.js applications that operate independently but share a single PostgreSQL database.

```text
corpse-and-co/
├── apps/
│   ├── admin-app/       # Local control panel (localhost:3001)
│   └── client-app/      # Public storefront (Vercel)
├── packages/
│   ├── database/        # Shared Prisma schema and client
│   └── ui/              # Shared Tailwind components (optional)
├── .env                 # Global environment variables
└── package.json         # Project metadata and workspace config# 1324
