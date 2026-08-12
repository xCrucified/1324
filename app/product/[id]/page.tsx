import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/auth';
import Header from '@/components/header';
import Footer from '@/components/footer';
import TopBar from '@/components/shared/top-bar';
import ProductGallery from '@/components/shared/product-gallery';
import BuyButton from '@/components/shared/buy-button';
import ReviewForm from '@/components/shared/review-form';
import { getCategoryDetails } from '@/constants/categories';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ProductPage({ params }: Props) {
  const { id } = await params;
  const session = await auth();

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      reviews: {
        include: { user: true },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!product) return notFound();

  const categoryInfo = getCategoryDetails(product.categoryId);

  const allImages = [
    ...(product.images && product.images.length > 0 ? product.images : []),
    ...(product.image && (!product.images || !product.images.includes(product.image)) ? [product.image] : []),
  ];

  let displayDescription = product.description
    ? product.description.replace(/^Source:.*$/gmi, '').replace(/\n\s*\n/g, '\n').trim()
    : "Опис для цього товару відсутній.";

  // --- БЕЗПЕЧНИЙ ПАРСИНГ РОЗМІРІВ ---
  let parsedSizes: string[] = [];
  if (product.sizes && typeof product.sizes === 'string') {
    try {
      const parsedJson = JSON.parse(product.sizes);
      if (Array.isArray(parsedJson)) {
        parsedSizes = parsedJson.map((s: any) => typeof s === 'object' ? (s.name || s.value || '') : String(s)).filter(Boolean);
      }
    } catch (e) {
      const sizesStr = String(product.sizes);
      if (sizesStr.includes(',')) {
        parsedSizes = sizesStr.split(',').map(s => s.trim()).filter(Boolean);
      } else {
        parsedSizes = sizesStr.split(/\s+/).map(s => s.trim()).filter(Boolean);
      }
    }
  }

  // --- БЕЗПЕЧНИЙ ПАРСИНГ КОЛЬОРІВ ---
  let parsedColors: any[] = [];
  if (product.colorVariants && typeof product.colorVariants === 'string') {
    try {
      const parsedJson = JSON.parse(product.colorVariants);
      if (Array.isArray(parsedJson)) {
        parsedColors = parsedJson;
      }
    } catch (e) {
      parsedColors = product.colorVariants.split(',').map(c => c.trim()).filter(Boolean);
    }
  }

  const sizeMatch = displayDescription.match(/Sizes?:\s*([^\n]+)/i);
  if (sizeMatch && parsedSizes.length === 0) {
    parsedSizes = sizeMatch[1].split(',').map(s => s.trim()).filter(Boolean);
    displayDescription = displayDescription.replace(sizeMatch[0], '').trim();
  }

  const colorMatch = displayDescription.match(/Colors?:\s*([^\n]+)/i);
  if (colorMatch && parsedColors.length === 0) {
    parsedColors = colorMatch[1].split(',').map(c => c.trim()).filter(Boolean);
    displayDescription = displayDescription.replace(colorMatch[0], '').trim();
  }

  return (
    <>
      <TopBar />
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 py-8 bg-cream min-h-screen">
        <div className="flex items-center gap-2 text-xs text-oak font-body mb-6">
          <Link href="/" className="hover:text-bark">Головна</Link>
          <span>/</span>
          {categoryInfo && (
            <>
              <Link href={`/?category=${encodeURIComponent(categoryInfo.id)}`} className="hover:text-bark">{categoryInfo.name}</Link>
              <span>/</span>
            </>
          )}
          <span className="text-bark truncate max-w-50">{product.title}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-ivory border border-parchment p-6 rounded-sm">
          <ProductGallery images={allImages} title={product.title} />

          <div className="flex flex-col justify-between">
            <div>
              <h1 className="font-display font-bold text-2xl md:text-3xl text-bark mt-1">
                {product.title}
              </h1>

              <div className="mt-4 border-t border-parchment pt-4">
                <h3 className="font-display font-bold text-sm text-bark mb-2">Опис</h3>
                <p className="font-body text-xs text-oak leading-relaxed whitespace-pre-wrap">
                  {displayDescription}
                </p>
              </div>

              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <BuyButton 
                  productId={product.id} 
                  priceInUah={product.price} 
                  title={product.title}
                  sizes={parsedSizes}
                  colors={parsedColors}
                  images={allImages}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 bg-ivory border border-parchment p-6 rounded-sm">
          <h3 className="font-display font-bold text-lg text-bark mb-4">Відгуки ({product.reviews.length})</h3>
          {product.reviews.length === 0 ? (
            <p className="text-xs text-oak font-body">Ще немає відгуків. Будьте першим, хто залишить відгук!</p>
          ) : (
            <div className="space-y-4">
              {product.reviews.map((rev) => (
                <div key={rev.id} className="border-b border-parchment pb-4 last:border-none last:pb-0">
                  <div className="flex items-center justify-between">
                    <span className="font-display font-bold text-xs text-bark">
                      {rev.user.name || rev.user.email?.split('@')[0] || 'Користувач'}
                    </span>
                    <span className="font-body text-[10px] text-oak">
                      {new Date(rev.createdAt).toLocaleDateString('uk-UA')}
                    </span>
                  </div>
                  <div className="flex items-center gap-0.5 text-xs my-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span key={star} className={rev.rating >= star ? "text-amber" : "text-gray-300"}>★</span>
                    ))}
                  </div>
                  <p className="font-body text-xs text-oak">{rev.text}</p>
                </div>
              ))}
            </div>
          )}
          <ReviewForm productId={product.id} isLoggedIn={!!session?.user} />
        </div>
      </main>

      <Footer />
    </>
  );
}