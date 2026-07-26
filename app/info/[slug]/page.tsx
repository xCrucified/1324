import { notFound } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/header';
import Footer from '@/components/footer';
import TopBar from '@/components/shared/top-bar';

interface Props {
  params: Promise<{ slug: string }>;
}

// Данные для каждой страницы футера
const infoPages: Record<string, { title: string; subtitle: string; content: string[] }> = {
  // PENTU24 MARKET
  "about-us": {
    title: "About Us",
    subtitle: "Discover the story behind Pentu24 Marketplace",
    content: [
      "Pentu24 is a curated global marketplace dedicated to independent makers, local artisans, and boutique creators. Founded in 2026, our mission is to connect people who value authentic craftsmanship with extraordinary creators from around the world.",
      "Every item on our platform tells a unique story—crafted with care, sustainable materials, and true passion. We believe in slow commerce, fair wages, and supporting independent creative businesses.",
    ],
  },
  "careers": {
    title: "Careers at Pentu24",
    subtitle: "Build the future of independent commerce with us",
    content: [
      "We are always looking for passionate, creative, and driven individuals to join our growing team. Whether you're in engineering, design, maker relations, or customer support, Pentu24 offers a collaborative and inspiring workspace.",
      "Check back regularly for open positions or send your portfolio and resume directly to careers@pentu24.com.",
    ],
  },
  "press": {
    title: "Press & Media",
    subtitle: "News, brand assets, and media resources",
    content: [
      "Welcome to the Pentu24 Press Room. Here journalists, bloggers, and creators can find our latest press releases, brand guidelines, high-resolution logos, and media kits.",
      "For press inquiries, interview requests, or partnership opportunities, please contact our PR team at press@pentu24.com.",
    ],
  },
  "sustainability": {
    title: "Our Commitment to Sustainability",
    subtitle: "Conscious commerce for a healthier planet",
    content: [
      "At Pentu24, sustainability isn't just a buzzword—it's core to our identity. Because our products are made by independent makers rather than mass-produced in giant factories, the carbon footprint is significantly lower.",
      "We actively encourage plastic-free packaging, locally sourced materials, and durable goods designed to last a lifetime rather than end up in landfills.",
    ],
  },
  "maker-programme": {
    title: "Maker Programme",
    subtitle: "Empowering independent artisans and creators",
    content: [
      "Are you an artist, crafter, or boutique designer? Our Maker Programme is designed to help you scale your business, reach international buyers, and access powerful storefront tools.",
      "Enjoy low commission fees, dedicated support, and a community built exclusively for high-quality handmade and artisan goods.",
    ],
  },

  // HELP & SUPPORT
  "track-your-order": {
    title: "Track Your Order",
    subtitle: "Check the delivery status of your artisan parcels",
    content: [
      "You can easily track your active orders by navigating to the 'Orders' tab in the top right corner of the website navigation bar.",
      "Once your independent maker ships your item, tracking numbers and courier details will appear directly inside your order details history.",
    ],
  },
  "returns-policy": {
    title: "Returns & Refunds Policy",
    subtitle: "Hassle-free guidelines for handmade goods",
    content: [
      "Because many items on Pentu24 are custom-made or uniquely crafted by independent makers, return windows may vary slightly by shop. Generally, standard items are eligible for return within 14 days of delivery.",
      "To initiate a return, please visit your Orders history and click 'Contact Maker' or request a return authorization.",
    ],
  },
  "payment-methods": {
    title: "Payment Methods",
    subtitle: "Secure and flexible checkout options",
    content: [
      "We support a wide variety of secure payment methods to ensure your shopping experience is safe and smooth.",
      "We accept major credit/debit cards (Visa, MasterCard, American Express), Apple Pay, Google Pay, and localized secure digital payment gateways.",
    ],
  },
  "faq": {
    title: "Frequently Asked Questions",
    subtitle: "Got questions? We've got answers.",
    content: [
      "Q: How do I contact a shop owner?\nA: You can click on any shop name or use the chat/contact buttons on the product detail pages to speak directly with the maker.",
      "Q: Are all products handmade?\nA: Yes! Every single item on Pentu24 is vetted to ensure it comes from independent creators, vintage collectors, or small artisan studios.",
    ],
  },
  "contact-us": {
    title: "Contact Support",
    subtitle: "We're here to help you 24/7",
    content: [
      "Need assistance with an order, account settings, or technical issue? Our support squad is always ready to assist.",
      "Drop us an email at support@pentu24.com and we'll get back to you within 24 hours.",
    ],
  },

  // SELLER HUB
  "open-a-shop": {
    title: "Open Your Shop on Pentu24",
    subtitle: "Turn your passion into a thriving business",
    content: [
      "Starting your shop takes less than 5 minutes. Set up your storefront, customize your branding, and list your handmade creations to millions of conscious buyers worldwide.",
      "Enjoy powerful analytics, streamlined inventory management, and a supportive community of fellow creators.",
    ],
  },
  "seller-fees": {
    title: "Transparent Seller Fees",
    subtitle: "No hidden costs, straightforward pricing",
    content: [
      "We believe in keeping more money in the pockets of hardworking creators. Listing an item is completely free, and we only charge a small transparent commission fee when a successful sale is made.",
    ],
  },
  "seller-protection": {
    title: "Seller Protection Programme",
    subtitle: "Trading securely with peace of mind",
    content: [
      "Our Seller Protection framework safeguards you against fraudulent chargebacks, delivery disputes, and unauthorized transactions, ensuring you can focus purely on creating wonderful products.",
    ],
  },
  "community-forum": {
    title: "Maker Community Forum",
    subtitle: "Connect, share tips, and grow together",
    content: [
      "Join thousands of artisans in our global community forum. Exchange crafting tips, discuss photography styles, share marketing strategies, and collaborate on seasonal collection edits.",
    ],
  },
  "advertising": {
    title: "Pentu24 Ads & Promotion",
    subtitle: "Boost your shop visibility",
    content: [
      "Supercharge your product reach with on-site promotional tools and targeted placements across high-traffic categories and seasonal banner slots.",
    ],
  },

  // DISCOVER
  "gift-ideas": {
    title: "Curated Gift Ideas",
    subtitle: "Thoughtful presents for every special occasion",
    content: [
      "Stuck on what to gift? Explore our hand-picked selections of artisan ceramics, organic candles, bespoke leather goods, and personalized homeware designed to bring joy to your loved ones.",
    ],
  },
  "seasonal-edits": {
    title: "Seasonal Edits & Trends",
    subtitle: "Fresh inspirations for every time of year",
    content: [
      "From cozy autumn textiles and winter candle collections to breezy spring botanicals and summer table settings, explore our curated seasonal drops.",
    ],
  },
  "new-arrivals": {
    title: "New Arrivals",
    subtitle: "The freshest creations from our community",
    content: [
      "Be the first to explore brand-new items freshly uploaded by our independent makers today.",
    ],
  },
  "flash-deals": {
    title: "Flash Deals & Hot Items",
    subtitle: "Limited-time offers on exceptional finds",
    content: [
      "Discover daily special offers, fast-selling favorites, and discounted artisan goods before they run out.",
    ],
  },
  "top-shops": {
    title: "Top-Rated Shops",
    subtitle: "Meet our most beloved community creators",
    content: [
      "Explore star-rated independent studios with thousands of glowing customer reviews and stellar delivery track records.",
    ],
  },

  // BOTTOM BAR (Legal / Footer links)
  "privacy": {
    title: "Privacy Policy",
    subtitle: "How we protect and manage your data",
    content: [
      "Your privacy is critically important to us. This policy outlines what data we collect, how we use it, and your rights regarding your personal information under modern data protection regulations.",
    ],
  },
  "terms": {
    title: "Terms of Service",
    subtitle: "Rules and guidelines for using Pentu24",
    content: [
      "By accessing or using Pentu24, you agree to comply with our marketplace terms, buyer protection policies, and community conduct guidelines.",
    ],
  },
  "cookies": {
    title: "Cookie Policy",
    subtitle: "Understanding how we use cookies",
    content: [
      "We use cookies to enhance your shopping experience, analyze site traffic, and remember items in your cart. You can manage your preferences at any time.",
    ],
  },
  "sitemap": {
    title: "Marketplace Sitemap",
    subtitle: "Quick directory of all site sections",
    content: [
      "Easily navigate through every category, seller hub, support article, and legal document available across the Pentu24 platform.",
    ],
  },
};

export default async function InfoPage({ params }: Props) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  const pageData = infoPages[slug];

  if (!pageData) {
    return notFound();
  }

  return (
    <>
      <TopBar />
      <Header />

      <main className="max-w-4xl mx-auto px-4 py-12 bg-cream min-h-screen">
        {/* Хлебные крошки */}
        <div className="flex items-center gap-2 text-xs text-oak font-body mb-6">
          <Link href="/" className="hover:text-bark">Home</Link>
          <span>/</span>
          <span className="text-bark">{pageData.title}</span>
        </div>

        {/* Основной контент страницы */}
        <div className="bg-ivory border border-parchment p-8 rounded-sm">
          <h1 className="font-display font-bold text-3xl text-bark mb-2">
            {pageData.title}
          </h1>
          <p className="font-body text-xs text-caramel uppercase tracking-widest mb-6">
            {pageData.subtitle}
          </p>

          <div className="space-y-4 border-t border-parchment pt-6">
            {pageData.content.map((paragraph, idx) => (
              <p key={idx} className="font-body text-xs md:text-sm text-oak leading-relaxed whitespace-pre-line">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}