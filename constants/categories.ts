export const CATEGORY_TREE = [
  { 
    id: 'clothing', 
    name: '👗 Одяг та Взуття', 
    subcategories: [ 
      { id: 'clothing-women', name: 'Жіночий одяг' }, 
      { id: 'clothing-men', name: 'Чоловічий одяг' }, 
      { id: 'clothing-kids', name: 'Дитячий одяг' }, 
      { id: 'clothing-sleep', name: 'Піжами' }, 
      { id: 'clothing-sport', name: 'Спортивні костюми' }, 
      { id: 'clothing-shoes', name: 'Взуття' }, 
      { id: 'clothing-other', name: 'Інше' } 
    ] 
  },
  { 
    id: 'accessories', 
    name: '🎒 Аксесуари', 
    subcategories: [ 
      { id: 'acc-bags', name: 'Сумки та барсетки' }, 
      { id: 'acc-backpacks', name: 'Рюкзаки' }, 
      { id: 'acc-jewelry', name: 'Біжутерія' }, 
      { id: 'acc-hair', name: 'Аксесуари для волосся' }, 
      { id: 'acc-smart', name: 'Смарт-годинники та браслети' }, 
      { id: 'acc-glasses', name: 'Окуляри' }, 
      { id: 'acc-other', name: 'Інше' } 
    ] 
  },
  { 
    id: 'home', 
    name: '🏠 Товари для дому', 
    subcategories: [ 
      { id: 'home-organizers', name: 'Органайзери' }, 
      { id: 'home-smart-gadgets', name: 'Міні-гаджети' }, 
      { id: 'home-kitchen', name: 'Кухонне приладдя та посуд' }, 
      { id: 'home-decor', name: 'Декор' }, 
      { id: 'home-textile', name: 'Текстиль' }, 
      { id: 'home-other', name: 'Інше' } 
    ] 
  },
];

export function getCategoryDetails(catId?: string | null): { name: string; id: string } | null {
  if (!catId) return null;
  for (const parent of CATEGORY_TREE) {
    if (parent.id === catId) return { name: parent.name, id: parent.id };
    const sub = parent.subcategories.find((s) => s.id === catId);
    if (sub) return { name: `${parent.name} → ${sub.name}`, id: sub.id };
  }
  return { name: catId, id: catId };
}

// НОВА ФУНКЦІЯ: Повертає масив ID ( саму категорію + всі її підкатегорії )
export function getCategoryAndSubIds(catId?: string | null): string[] {
  if (!catId) return [];
  
  const parent = CATEGORY_TREE.find((p) => p.id === catId);
  if (parent) {
    // Якщо це головна категорія, беремо її ID та ID всіх її підкатегорій
    return [parent.id, ...parent.subcategories.map((sub) => sub.id)];
  }
  
  // Якщо це вже конкретна підкатегорія або інший ID
  return [catId];
}