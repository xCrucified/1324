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

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ProductPage({ params }: Props) {
  const { id } = await params;

  const session = await auth();

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      category: true,
      reviews: {
        include: {
          user: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
  });

  if (!product) {
    return notFound();
  }

  const allImages = [
    ...(product.images && product.images.length > 0 ? product.images : []),
    ...(product.image && (!product.images || !product.images.includes(product.image)) ? [product.image] : []),
  ];

  const seller = {
    name: "Pentu Artisan Studio",
    rating: 4.9,
    sales: "1.4k",
    avatar: "🏺",
    joined: "Member since 2022",
  };

  return (
    <>
      <TopBar />
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 py-8 bg-cream min-h-screen">
        <div className="flex items-center gap-2 text-xs text-oak font-body mb-6">
          <Link href="/" className="hover:text-bark">Home</Link>
          <span>/</span>
          {product.category && (
            <>
              <Link href={`/?category=${encodeURIComponent(product.category.name)}`} className="hover:text-bark">
                {product.category.name}
              </Link>
              <span>/</span>
            </>
          )}
          <span className="text-bark truncate max-w-50">{product.title}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-ivory border border-parchment p-6 rounded-sm">
          <ProductGallery images={allImages} title={product.title} />

          <div className="flex flex-col justify-between">
            <div>
              <span className="text-xs font-body text-caramel uppercase tracking-widest">
                {product.category?.name || "Handmade"}
              </span>
              <h1 className="font-display font-bold text-2xl md:text-3xl text-bark mt-1">
                {product.title}
              </h1>

              <div className="flex items-center gap-3 mt-3">
                <span className="font-display font-bold text-2xl text-amber">
                  {product.price} ₴
                </span>
                <span className="text-xs font-body bg-wheat text-bark px-2 py-1 rounded-sm">
                  Free Shipping
                </span>
              </div>

              <div className="mt-6 border-t border-parchment pt-4">
                <h3 className="font-display font-bold text-sm text-bark mb-2">Description</h3>
                <p className="font-body text-xs text-oak leading-relaxed">
                  {product.description || "No description provided for this artisan item. Crafted with care and high attention to detail."}
                </p>
              </div>

              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <BuyButton 
                  productId={product.id} 
                  priceInUah={product.price} 
                  title={product.title} 
                />
              </div>
            </div>

            <div className="mt-8 p-4 bg-wheat/50 border border-parchment rounded-sm flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-caramel/20 flex items-center justify-center text-lg">
                  {seller.avatar}
                </div>
                <div>
                  <h4 className="font-display font-bold text-xs text-bark">{seller.name}</h4>
                  <p className="font-body text-[10px] text-oak">{seller.joined} • ⭐ {seller.rating} ({seller.sales} sales)</p>
                </div>
              </div>
              <button className="border border-oak text-bark hover:bg-oak hover:text-cream transition-colors text-xs font-body px-3 py-1.5 rounded-sm cursor-pointer">
                Visit Seller
              </button>
            </div>
          </div>
        </div>

        <div className="mt-12 bg-ivory border border-parchment p-6 rounded-sm">
          <h3 className="font-display font-bold text-lg text-bark mb-4">Відгуки ({product.reviews.length})</h3>
          
          {product.reviews.length === 0 ? (
            <p className="text-xs text-oak font-body">No reviews yet. Be the first to leave a review!</p>
          ) : (
            <div className="space-y-4">
              {product.reviews.map((rev) => (
                <div key={rev.id} className="border-b border-parchment pb-4 last:border-none last:pb-0">
                  <div className="flex items-center justify-between">
                    <span className="font-display font-bold text-xs text-bark">
                      {rev.user.name || rev.user.email?.split('@')[0] || 'User'}
                    </span>
                    <span className="font-body text-[10px] text-oak">
                      {new Date(rev.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  
                  {/* Рендеримо рівно 5 зірочок: зафарбовані лише ті, що відповідають оцінці */}
                  <div className="flex items-center gap-0.5 text-xs my-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span key={star} className={rev.rating >= star ? "text-amber" : "text-gray-300"}>
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
      </main>

      <Footer />
    </>
  );
}