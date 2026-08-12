import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Очистка старых данных...');
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();

  console.log('Создание категорий...');
  const electronics = await prisma.category.create({
    data: { name: 'Electronics & Decor', slug: 'electronics' },
  });

  const handmade = await prisma.category.create({
    data: { name: 'Handmade & Craft', slug: 'handmade' },
  });

  console.log('Добавление товаров в базу...');

  await prisma.product.createMany({
    data: [
      {
        title: 'Керамическая кружка ручной работы',
        price: 18.50,
        description: 'Уютная глиняная кружка для утреннего кофе или чая. Каждое изделие уникально.',
        image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=800&auto=format&fit=crop',
        images: ['https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=800&auto=format&fit=crop'],
        categoryId: handmade.id,
      },
      {
        title: 'Ароматическая свеча из соевого воска',
        price: 24.00,
        description: 'Натуральная свеча с ароматом ванили и сандалового дерева. Время горения — до 40 часов.',
        image: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?q=80&w=800&auto=format&fit=crop',
        images: ['https://images.unsplash.com/photo-1603006905003-be475563bc59?q=80&w=800&auto=format&fit=crop'],
        categoryId: handmade.id,
      },
      {
        title: 'Минималистичные настольные часы',
        price: 32.00,
        description: 'Бесшумные электронные часы в стильном корпусе под бетон.',
        image: 'https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?q=80&w=800&auto=format&fit=crop',
        images: ['https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?q=80&w=800&auto=format&fit=crop'],
        categoryId: electronics.id,
      },
    ],
  });

  console.log('База данных успешно заполнена!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });