import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/auth';
import ProductGallery from '@/components/shared/product-gallery';
import BuyButton from '@/components/shared/buy-button';
import ReviewForm from '@/components/shared/review-form';
import { getCategoryDetails } from '@/constants/categories';

interface Props {
  params: Promise<{ id: string }>;
}

function formatStringArray(items: unknown[] | null | undefined): string[] {
  if (!Array.isArray(items)) return [];
  return items
    .map((item) => (typeof item === 'object' && item !== null ? (item as any).name || (item as any).value || '' : String(item)))
    .map((s) => s.trim())
    .filter(Boolean);
}

function processDescriptionAndVariants(
  rawDescription: string | null,
  initialSizes: string[],
  initialColors: string[]
) {
  let description = rawDescription
    ? rawDescription.replace(/^Source:.*$/gmi, '').replace(/\n\s*\n/g, '\n').trim()
    : 'Опис для цього товару відсутній.';

  let sizes = initialSizes;
  let colors = initialColors;

  if (sizes.length === 0) {
    const sizeMatch = description.match(/Sizes?:\s*([^\n]+)/i);
    if (sizeMatch) {
      sizes = sizeMatch[1].split(',').map((s) => s.trim()).filter(Boolean);
      description = description.replace(sizeMatch[0], '').trim();
    }
  }

  if (colors.length === 0) {
    const colorMatch = description.match(/Colors?:\s*([^\n]+)/i);
    if (colorMatch) {
      colors = colorMatch[1].split(',').map((c) => c.trim()).filter(Boolean);
      description = description.replace(colorMatch[0], '').trim();
    }
  }

  return { description, sizes, colors };
}

export default async function ProductPage({ params }: Props) {
  const { id } = await params;

  const [session, product] = await Promise.all([
    auth(),
    prisma.product.findUnique({
      where: { id },
      include: {
        reviews: {
          select: {
            id: true,
            rating: true,
            text: true,
            createdAt: true,
            user: { select: { name: true, email: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    }),
  ]);

  if (!product) return notFound();

  const categoryInfo = getCategoryDetails(product.categoryId);
  const allImages = Array.from(
    new Set([
      ...(product.images || []),
      ...(product.image ? [product.image] : []),
    ])
  );

  const rawSizes = formatStringArray(product.sizes);
  const rawColors = formatStringArray(product.colorVariants?.toString().split(','));
  const { description, sizes, colors } = processDescriptionAndVariants(
    product.description,
    rawSizes,
    rawColors
  );

  return (
    <>
      {/* Хлібні крихти */}
      <div className="flex items-center gap-2 text-xs text-oak font-body mb-6">
        <Link href="/" className="hover:text-bark">
          Головна
        </Link>
        <span>/</span>
        {categoryInfo && (
          <>
            <Link
              href={`/?category=${encodeURIComponent(categoryInfo.id)}`}
              className="hover:text-bark"
            >
              {categoryInfo.name}
            </Link>
            <span>/</span>
          </>
        )}
        <span className="text-bark truncate max-w-50">{product.title}</span>
      </div>

      {/* Картка товару */}
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
                {description}
              </p>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <BuyButton
                productId={product.id}
                priceInUah={product.price}
                title={product.title}
                sizes={sizes}
                colors={colors}
                images={allImages}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Відгуки */}
      <div className="mt-12 bg-ivory border border-parchment p-6 rounded-sm">
        <h3 className="font-display font-bold text-lg text-bark mb-4">
          Відгуки ({product.reviews.length})
        </h3>
        {product.reviews.length === 0 ? (
          <p className="text-xs text-oak font-body">
            Ще немає відгуків. Будьте першим, хто залишить відгук!
          </p>
        ) : (
          <div className="space-y-4">
            {product.reviews.map((rev) => (
              <div
                key={rev.id}
                className="border-b border-parchment pb-4 last:border-none last:pb-0"
              >
                <div className="flex items-center justify-between">
                  <span className="font-display font-bold text-xs text-bark">
                    {rev.user?.name || rev.user?.email?.split('@')[0] || 'Користувач'}
                  </span>
                  <span className="font-body text-[10px] text-oak">
                    {new Date(rev.createdAt).toLocaleDateString('uk-UA')}
                  </span>
                </div>
                <div className="flex items-center gap-0.5 text-xs my-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      className={rev.rating >= star ? 'text-amber' : 'text-gray-300'}
                    >
                      ★
                    </span>
                  ))}
                </div>
                <p className="font-body text-xs text-oak">{rev.text}</p>
              </div>
            ))}
          </div>
        )}
        <ReviewForm productId={product.id} isLoggedIn={!!session?.user} />
      </div>
    </>
  );
}