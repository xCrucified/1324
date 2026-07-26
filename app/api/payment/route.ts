import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    console.log('\n========================================');
    console.log('🚀 /api/payment START');
    console.log('========================================');

    const body = await request.json();

    console.log('📦 BODY:');
    console.dir(body, { depth: null });


    let priceAmount = Number(body.priceAmount || body.total || 0);


    if (
      priceAmount <= 0 &&
      Array.isArray(body.items) &&
      body.items.length > 0
    ) {
      priceAmount = body.items.reduce(
        (sum: number, item: any) =>
          sum +
          (Number(item.price) || 0) *
            (Number(item.quantity) || 1),
        0
      );
    }


    console.log('💰 PRICE:', priceAmount);


    if (priceAmount <= 0) {
      console.error('❌ PRICE ERROR');

      return NextResponse.json(
        {
          error: 'Сума замовлення повинна бути більшою за нуль',
          receivedBody: body,
        },
        {
          status: 400,
        }
      );
    }


    const orderId = `order_${Date.now()}`;

    console.log('🆔 ORDER ID:', orderId);



    if (Array.isArray(body.items)) {

      console.log('🛒 ITEMS');
      console.dir(body.items, { depth: null });


      for (const item of body.items) {

        const productId = item.productId || item.id;

        console.log('🔍 CHECK PRODUCT:', productId);


        const product = await prisma.product.findUnique({
          where: {
            id: productId,
          },
        });


        console.log('PRODUCT RESULT:');
        console.dir(product, { depth: null });

      }
    }



    console.log('==============================');
    console.log('CREATE ORDER');
    console.log('==============================');


    const order = await prisma.order.create({

      data: {

        id: orderId,


        firstName: body.firstName || 'Гість',
        lastName: body.lastName || '',
        email:
          body.email ||
          'client@pentu24.com',


        phone: body.phone || '',
        city: body.city || '',
        warehouse: body.warehouse || '',
        telegram: body.telegram || null,


        total: priceAmount,


        itemsCount:
          Array.isArray(body.items)
            ? body.items.reduce(
                (acc:number,item:any)=>
                  acc +
                  (Number(item.quantity)||1),
                0
              )
            : 1,


        status:'Processing',


        orderItems:{

          create:
            Array.isArray(body.items) &&
            body.items.length > 0

            ? body.items.map((item:any)=>({

                productId:
                  item.productId ||
                  item.id,

                quantity:
                  Number(item.quantity)||1,

                price:
                  Number(item.price) ||
                  priceAmount,

                size:
                  item.size || null,

                color:
                  item.color || null,

              }))

            : []

        }

      }

    });



    console.log('✅ ORDER CREATED');

    console.dir(order,{depth:null});




    /*
      ==============================
      MONOBANK
      ==============================
    */


    const publicJarCode =
      process.env.MONOBANK_PUBLIC_JAR_CODE;


    const apiJarId =
      process.env.MONOBANK_JAR_ID;



    console.log('🏦 API JAR ID:', apiJarId);

    console.log(
      '🌐 PUBLIC JAR CODE:',
      publicJarCode
    );



    const shortOrderId =
      order.id.length > 10
        ? order.id.slice(-8)
        : order.id;



    console.log(
      '🆔 COMMENT:',
      shortOrderId
    );



    if(!publicJarCode){

      console.error(
        '❌ MONOBANK_PUBLIC_JAR_CODE отсутствует'
      );


      return NextResponse.json(
        {
          error:
          'Monobank public jar code missing'
        },
        {
          status:500
        }
      );

    }



    /*
      ВАЖНО:
      тут используется 49ajfBcfgj
      а НЕ P-tBrz...
    */


    const paymentUrl =
      `https://send.monobank.ua/jar/${publicJarCode}?a=${priceAmount}`;



    console.log('🔗 PAYMENT URL:');

    console.log(paymentUrl);



    console.log('================================');
    console.log('✅ RESPONSE');
    console.log('================================');



    return NextResponse.json({

      success:true,

      payment_id:
        order.id,


      short_order_id:
        shortOrderId,


      payment_url:
        paymentUrl,


      pay_amount:
        priceAmount

    });



  } catch(e){


    console.log('================================');
    console.log('🔥 FATAL ERROR');
    console.log('================================');


    console.error(e);


    if(e instanceof Error){

      console.error(
        'MESSAGE:',
        e.message
      );


      console.error(
        'STACK:',
        e.stack
      );

    }


    return NextResponse.json(

      {
        error:
          'Внутрішня помилка сервера',

        details:
          e instanceof Error
            ? e.message
            : String(e)
      },

      {
        status:500
      }

    );

  }
}