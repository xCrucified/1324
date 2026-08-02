'use client';

import { useState } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Header from '@/components/header';
import Footer from '@/components/footer';
import TopBar from '@/components/shared/top-bar';

interface Props {
  params: Promise<{ slug: string }>;
}

interface FaqItem {
  question: string;
  answer: string;
}

interface FaqSection {
  category: string;
  items: FaqItem[];
}

interface PageData {
  title: string;
  subtitle: string;
  content?: string[];
  faqSections?: FaqSection[];
}

const infoPages: Record<string, PageData> = {
  // PENTU24 MARKET
  "about-us": {
    title: "Про нас",
    subtitle: "Дізнайтеся більше про маркетплейс Pentu24",
    content: [
      "Pentu24 — це сучасний міжнародний маркетплейс, який об'єднує продавців і покупців, надаючи зручну платформу для пошуку та придбання якісних товарів. Наша мета — зробити онлайн-шопінг простим, безпечним і доступним для кожного.",
      "Ми співпрацюємо з перевіреними продавцями та прагнемо забезпечити широкий асортимент товарів, конкурентні ціни, надійні способи оплати й швидку доставку. Команда Pentu24 постійно працює над удосконаленням сервісу, щоб кожен клієнт отримував найкращий досвід покупок."
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
    title: "Політика повернення та відшкодування",
    subtitle: "Умови повернення товарів та відшкодування коштів",
    content: [
      "Усі товари, представлені на маркетплейсі Pentu24, постачаються безпосередньо від міжнародних продавців та виробників. З огляду на особливості міжнародної логістики, індивідуальну комплектацію замовлень та значні витрати на зворотне транспортування, повернення товарів належної якості після їх отримання не здійснюється.",
      "У разі отримання товару з виробничим браком, пошкодженням під час транспортування або отримання товару, що істотно не відповідає оформленому замовленню, покупець має право звернутися до служби підтримки протягом 14 календарних днів з моменту отримання замовлення. Кожне звернення розглядається індивідуально, і за результатами перевірки можуть бути запропоновані часткове або повне відшкодування вартості товару, повторне відправлення або інше взаємоприйнятне рішення без обов'язкового повернення товару.",
      "Оформлюючи замовлення на Pentu24, покупець підтверджує, що ознайомився та погоджується з умовами цієї Політики повернення та відшкодування."
    ]
  },
  "payment-methods": {
    title: "Способи оплати",
    subtitle: "Безпечні та зручні варіанти оплати",
    content: [
      "Pentu24 підтримує сучасні та захищені способи оплати, щоб забезпечити безпечний, швидкий і зручний процес оформлення замовлення для кожного покупця.",
      "Ми приймаємо оплату банківськими картками Visa, MasterCard та іншими доступними платіжними засобами, що підтримуються на сторінці оформлення замовлення. Усі платіжні операції здійснюються через сертифікованих платіжних провайдерів із використанням сучасних технологій шифрування та захисту даних. Pentu24 не зберігає реквізити банківських карток користувачів."
    ]
  },
  "faq": {
    title: "Поширені запитання",
    subtitle: "Відповіді на найпоширеніші запитання наших покупців",
    faqSections: [
      {
        category: "Доставка та замовлення",
        items: [
          {
            question: "Скільки часу займає доставка?",
            answer: "Терміни доставки залежать від продавця, країни відправлення та обраного способу доставки. Орієнтовний термін доставки вказується під час оформлення замовлення та може змінюватися залежно від роботи логістичних служб."
          },
          {
            question: "Чи можу я скасувати замовлення?",
            answer: "Замовлення можна скасувати лише до моменту його передачі продавцем до служби доставки. Якщо замовлення вже відправлено, його скасування може бути неможливим."
          }
        ]
      },
      {
        category: "Повернення та гарантії",
        items: [
          {
            question: "Що робити, якщо товар пошкоджений або не відповідає опису?",
            answer: "Зверніться до служби підтримки Pentu24 протягом 14 календарних днів після отримання замовлення, додавши фотографії товару та опис проблеми. Ми розглянемо звернення та запропонуємо відповідне рішення."
          },
          {
            question: "Чи можна повернути товар?",
            answer: "Через особливості міжнародної доставки повернення товарів належної якості не здійснюється. У випадку браку, пошкодження або отримання неправильного товару кожне звернення розглядається індивідуально."
          }
        ]
      },
      {
        category: "Оплата",
        items: [
          {
            question: "Які способи оплати підтримуються?",
            answer: "Ми приймаємо оплату банківськими картками Visa, MasterCard та іншими способами оплати, доступними під час оформлення замовлення. Усі платежі здійснюються через захищених платіжних провайдерів."
          }
        ]
      }
    ]
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
    title: "Політика конфіденційності",
    subtitle: "Ми поважаємо право кожного користувача на конфіденційність та прагнемо забезпечити надійний захист персональних даних.",
    content: [
      "Ми поважаємо право кожного користувача на конфіденційність та прагнемо забезпечити надійний захист персональних даних. Використовуючи наш вебсайт, ви погоджуєтесь із умовами цієї Політики конфіденційності. Ми збираємо лише ту інформацію, яка необхідна для надання наших послуг, обробки замовлень, покращення роботи сайту та виконання вимог чинного законодавства.\n\nПід час використання сайту ми можемо збирати персональні дані, такі як ім'я, прізвище, адреса електронної пошти, номер телефону, адреса доставки, інформація про замовлення, IP-адреса, тип браузера, операційна система, дані про пристрій, а також іншу інформацію, яку користувач добровільно надає під час оформлення замовлення або звернення до служби підтримки.\n\nОтримані персональні дані використовуються для оформлення та виконання замовлень, обробки платежів, доставки товарів, зв'язку з користувачем, надання технічної підтримки, покращення якості сервісу, аналізу роботи сайту, запобігання шахрайству, виконання юридичних зобов'язань, а також для надсилання інформаційних повідомлень або маркетингових матеріалів лише за згодою користувача.\n\nНаш сайт використовує файли Cookie та аналогічні технології для забезпечення коректної роботи вебсайту, збереження налаштувань користувача, авторизації, аналізу відвідуваності та покращення функціональності сервісу. Користувач може змінити налаштування використання Cookie у своєму браузері, однак це може вплинути на доступність окремих функцій сайту.\n\nМи можемо передавати персональні дані лише тим третім сторонам, які беруть участь у наданні наших послуг, зокрема платіжним сервісам, службам доставки, постачальникам хостингу, сервісам веб-аналітики або державним органам у випадках, передбачених законодавством. Ми не продаємо, не здаємо в оренду та не передаємо персональні дані третім особам у маркетингових цілях без попередньої згоди користувача.\n\nДля захисту персональної інформації ми застосовуємо сучасні технічні та організаційні заходи безпеки, спрямовані на запобігання несанкціонованому доступу, втраті, зміні, розголошенню або знищенню даних. Попри це, жоден спосіб передачі інформації через мережу Інтернет або електронного зберігання не може гарантувати абсолютну безпеку.\n\nПерсональні дані зберігаються лише протягом строку, необхідного для досягнення цілей їх обробки, виконання юридичних зобов'язань, вирішення можливих спорів та забезпечення безпеки сервісу. Після завершення необхідного строку дані видаляються або анонімізуються відповідно до чинного законодавства.\n\nКористувач має право отримати інформацію про свої персональні дані, вимагати їх виправлення, оновлення, видалення, обмеження обробки, відкликати згоду на обробку даних, отримати копію своїх персональних даних, а також звернутися до компетентного органу із захисту персональних даних у разі порушення своїх прав.\n\nНаш сайт може містити посилання на сторонні вебресурси. Ми не несемо відповідальності за зміст таких сайтів, а також за їхню політику конфіденційності або способи обробки персональних даних.\n\nСайт не призначений для використання особами молодше 16 років. Ми свідомо не збираємо персональні дані дітей без дозволу їхніх законних представників.\n\nМи залишаємо за собою право в будь-який час змінювати або оновлювати цю Політику конфіденційності. Актуальна редакція завжди публікується на цьому вебсайті та набирає чинності з моменту її розміщення.\n\nЯкщо у вас виникли запитання щодо цієї Політики конфіденційності або обробки персональних даних, ви можете зв'язатися з нами через контактну форму або за адресою електронної пошти, зазначеною на нашому вебсайті.",
    ],
  },
  "terms": {
    title: "Умови використання",
    subtitle: "Правила користування маркетплейсом Pentu24",
    content: [
      "Ці Умови використання (далі — «Умови») регулюють порядок використання вебсайту Pentu24 (далі — «Сайт», «Маркетплейс», «Pentu24»). Отримуючи доступ до Сайту, створюючи обліковий запис або оформлюючи замовлення, користувач підтверджує, що повністю ознайомився з цими Умовами, розуміє їх зміст та безумовно погоджується їх дотримуватися. Якщо користувач не погоджується з будь-яким положенням цих Умов, він зобов'язаний припинити використання Сайту.",
      "Pentu24 є інформаційною платформою (маркетплейсом), що забезпечує можливість придбання товарів у міжнародних продавців та постачальників. Якщо інше прямо не зазначено у відомостях про конкретний товар, Pentu24 не є виробником, імпортером або власником товарів, що реалізуються через Сайт, та не гарантує їх придатність для конкретної мети, окрім випадків, передбачених законодавством.",
      "Інформація про товари, включаючи фотографії, описи, характеристики, комплектацію, кольори, ціни, строки доставки та наявність, надається продавцями або іншими джерелами інформації. Pentu24 докладає розумних зусиль для забезпечення актуальності та достовірності такої інформації, однак не гарантує її абсолютної точності, повноти чи відсутності технічних, друкарських або інших помилок. Зображення товарів можуть відрізнятися від фактичного вигляду залежно від налаштувань дисплея користувача або особливостей виробництва.",
      "Pentu24 залишає за собою право без попереднього повідомлення змінювати або оновлювати інформацію про товари, їх характеристики, ціни, умови продажу, умови доставки, спеціальні пропозиції та інші матеріали, розміщені на Сайті. Виявлення очевидної технічної або цінової помилки є підставою для скасування або коригування відповідного замовлення з обов'язковим повідомленням покупця.",
      "Користувач несе відповідальність за достовірність, повноту та актуальність персональних даних, зазначених під час реєстрації або оформлення замовлення. Pentu24 не несе відповідальності за наслідки, що виникли внаслідок надання користувачем недостовірної, неповної або помилкової інформації, включаючи неможливість доставки товару або зв'язку з покупцем.",
      "Терміни доставки є орієнтовними та можуть змінюватися залежно від країни відправлення, митного оформлення, діяльності логістичних компаній, перевізників, державних органів, погодних умов, форс-мажорних обставин та інших факторів, що не перебувають під контролем Pentu24. Затримка доставки не вважається порушенням зобов'язань Pentu24 та сама по собі не є підставою для стягнення збитків або застосування штрафних санкцій.",
      "Порядок повернення товарів, відшкодування коштів та розгляду звернень покупців визначається окремою Політикою повернення та відшкодування, яка є невід'ємною частиною цих Умов. Оформлюючи замовлення, користувач підтверджує, що ознайомився з відповідною Політикою та погоджується з її положеннями.",
      "Усі платіжні операції здійснюються за допомогою незалежних сертифікованих платіжних сервісів. Pentu24 не зберігає реквізити банківських карток, CVV-коди або інші конфіденційні платіжні дані користувачів та не несе відповідальності за перебої, відмови чи помилки у роботі банків, платіжних систем або інших фінансових установ.",
      "Користувач зобов'язується використовувати Сайт виключно у законний спосіб та утримуватися від будь-яких дій, що можуть порушувати права інших осіб, завдавати шкоди роботі Сайту або його інфраструктурі, включаючи несанкціонований доступ до інформаційних систем, автоматизований збір інформації, використання програмних засобів для обходу технічних обмежень, поширення шкідливого програмного забезпечення, шахрайські дії або будь-яке інше використання Сайту всупереч законодавству чи цим Умовам.",
      "У максимальному обсязі, дозволеному чинним законодавством, Pentu24 не несе відповідальності за будь-які прямі, непрямі, випадкові, спеціальні чи опосередковані збитки, включаючи втрату прибутку, доходу, ділової репутації, даних або інші майнові чи немайнові втрати, що виникли внаслідок використання або неможливості використання Сайту, придбання товарів, затримки доставки, дій чи бездіяльності продавців, виробників, перевізників, митних органів, платіжних сервісів або інших третіх осіб.",
      "У разі виникнення обставин непереборної сили (форс-мажору), включаючи, але не обмежуючись, стихійними лихами, воєнними діями, терористичними актами, епідеміями, перебоями в роботі мереж зв'язку, діями органів державної влади або іншими подіями, що знаходяться поза розумним контролем Pentu24, виконання відповідних зобов'язань може бути повністю або частково призупинено на період дії таких обставин без виникнення відповідальності.",
      "Усі права інтелектуальної власності на програмний код, дизайн, логотипи, торговельні позначення, тексти, фотографії, графічні матеріали, елементи інтерфейсу та інший контент Сайту належать Pentu24 або використовуються на законних підставах. Будь-яке копіювання, відтворення, розповсюдження, модифікація або інше використання зазначених матеріалів без попереднього письмового дозволу правовласника забороняється.",
      "Pentu24 має право в будь-який час, без попереднього повідомлення та на власний розсуд, призупинити або припинити доступ користувача до Сайту чи окремих його функцій у разі порушення цих Умов, вимог законодавства або у випадку проведення технічних, профілактичних чи інших робіт, необхідних для належного функціонування сервісу.",
      "Pentu24 залишає за собою право вносити зміни до цих Умов у будь-який час. Оновлена редакція набирає чинності з моменту її публікації на Сайті, якщо інше не передбачено новою редакцією. Подальше використання Сайту після опублікування змін означає повне та безумовне прийняття користувачем оновлених Умов використання."
    ]
  },
  "cookies": {
    title: "Політика використання файлів cookie",
    subtitle: "Інформація про використання файлів cookie та аналогічних технологій",
    content: [
      "Ця Політика використання файлів cookie пояснює, яким чином Pentu24 використовує файли cookie та інші подібні технології під час відвідування нашого вебсайту. Продовжуючи користуватися Сайтом, ви погоджуєтеся на використання файлів cookie відповідно до цієї Політики, якщо інше не встановлено у налаштуваннях вашого браузера або панелі керування згодою.",
      "Файли cookie — ці невеликі текстові файли, які зберігаються на вашому пристрої під час відвідування вебсайту. Вони дозволяють розпізнавати користувача, запам'ятовувати його налаштування, забезпечувати коректну роботу окремих функцій Сайту, підвищувати рівень безпеки та покращувати загальний користувацький досвід.",
      "Pentu24 використовує обов'язкові (технічні) файли cookie, необхідні для належного функціонування Сайту, забезпечення авторизації користувачів, роботи кошика, оформлення замовлень, захисту від шахрайства та підтримки безпеки інформаційних систем.",
      "Також можуть використовуватися аналітичні файли cookie, які допомагають отримувати статистичну інформацію про використання Сайту, аналізувати поведінку користувачів, оцінювати ефективність роботи функціоналу та вдосконалювати якість наших сервісів. Такі дані обробляються в узагальненому або знеособленому вигляді, якщо інше не передбачено чинним законодавством.",
      "За наявності відповідної згоди користувача можуть використовуватися функціональні та маркетингові файли cookie, які дозволяють запам'ятовувати індивідуальні налаштування, персоналізувати контент, демонструвати релевантні пропозиції, а також оцінювати ефективність рекламних кампаній.",
      "Окремі файли cookie можуть встановлюватися сторонніми сервісами, які використовуються Pentu24 для забезпечення роботи окремих функцій Сайту, обробки платежів, проведення аналітики, захисту від шахрайства або інших законних цілей. Використання таких файлів cookie регулюється політиками конфіденційності відповідних постачальників послуг.",
      "Користувач має право у будь-який час змінити налаштування використання файлів cookie через параметри свого веббраузера або інші доступні засоби керування згодою. Водночас вимкнення окремих категорій файлів cookie може призвести до некоректної роботи окремих функцій Сайту або обмеження доступу до деяких сервісів.",
      "Pentu24 залишає за собою право змінювати або оновлювати цю Політику використання файлів cookie відповідно до змін законодавства, технологічних процесів або функціональних можливостей Сайту. Актуальна редакція Політики набирає чинності з моменту її опублікування на вебсайті."
    ]
  },
  "sitemap": {
    title: "Marketplace Sitemap",
    subtitle: "Quick directory of all site sections",
    content: [
      "Easily navigate through every category, seller hub, support article, and legal document available across the Pentu24 platform.",
    ],
  },
};

// Керований клієнтський компонент для акордеону FAQ
function FaqAccordion({ sections }: { sections: FaqSection[] }) {
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});

  const toggleItem = (sectionIdx: number, itemIdx: number) => {
    const key = `${sectionIdx}-${itemIdx}`;
    setOpenItems(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <div className="space-y-8 w-full">
      {sections.map((section, sectionIdx) => (
        <div key={sectionIdx} className="w-full">
          <h2 className="font-display text-xl text-bark mb-4 font-semibold">
            {section.category}
          </h2>
          
          <div className="space-y-3 w-full">
            {section.items.map((item, itemIdx) => {
              const key = `${sectionIdx}-${itemIdx}`;
              const isOpen = !!openItems[key];

              return (
                <div 
                  key={itemIdx} 
                  className="w-full bg-white border border-parchment rounded-md overflow-hidden transition-all duration-200"
                >
                  <button
                    type="button"
                    onClick={() => toggleItem(sectionIdx, itemIdx)}
                    className="w-full flex items-center justify-between gap-4 cursor-pointer font-body text-sm text-bark p-4 font-medium hover:bg-cream transition-colors text-left outline-none"
                  >
                    <span className="flex-1">{item.question}</span>
                    <span className={`transition-transform duration-300 text-caramel flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m6 9 6 6 6-6"/>
                      </svg>
                    </span>
                  </button>
                  
                  {isOpen && (
                    <div className="px-4 pb-4 pt-1 text-xs md:text-sm text-oak leading-relaxed border-t border-parchment/30 bg-white break-words w-full">
                      {item.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

export default async function InfoPage({ params }: Props) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  const pageData = infoPages[slug];

  if (!pageData) {
    return notFound();
  }

  return (
    <>
      <style>{`
        html, body {
          scrollbar-gutter: stable;
        }
      `}</style>

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
        <div className="bg-ivory border border-parchment p-8 rounded-sm w-full">
          <h1 className="font-display font-bold text-3xl text-bark mb-2">
            {pageData.title}
          </h1>
          <p className="font-body text-xs text-caramel uppercase tracking-widest mb-6">
            {pageData.subtitle}
          </p>

          <div className="border-t border-parchment pt-6 w-full">
            {pageData.faqSections ? (
              <FaqAccordion sections={pageData.faqSections} />
            ) : (
              <div className="space-y-4 w-full">
                {pageData.content?.map((paragraph, idx) => (
                  <p key={idx} className="font-body text-xs md:text-sm text-oak leading-relaxed whitespace-pre-line break-words w-full">
                    {paragraph}
                  </p>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}