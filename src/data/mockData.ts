export interface Category {
  id: string;
  name: string;
  image: string;
  icon?: string; // Emoji icon
  color?: string; // Theme color for category
  description?: string;
  isActive?: boolean; // Enable/disable category
  displayOrder?: number; // Sort order
}

export interface ProductSize {
  name: string;
  price: number;
  originalPrice?: number;
}

export interface Product {
  id: string;
  name: string;
  rating: number;
  image: string;
  price: number;
  isFavorite: boolean;
  category?: string;
  description?: string;
  discount?: number;
  originalPrice?: number;
  inStock?: boolean;
  isPopular?: boolean;
  isSpicy?: boolean;
  isVeg?: boolean;
  sizes?: ProductSize[];
  selectedSize?: ProductSize;
}

export interface Deal {
  id: string;
  title: string;
  description: string;
  discountPercentage: number;
  couponCode: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  image: string;
  backgroundColor?: string;
  textColor?: string;
  displayOrder?: number;
  template?: 'flash_sale' | 'featured_grid' | 'minimal_list';
  productId?: string; // Optional link to a product
}

export interface Banner {
  id: string;
  type: 'hero' | 'promo';
  title: string;
  subtitle?: string;
  description?: string;
  image: string;
  buttonText?: string;
  buttonLink?: string;
  isActive: boolean;
  displayOrder?: number;
  // Styling options
  textColor?: string;
  overlayColor?: string; // e.g. "from-black/70 to-black/30"
  buttonColor?: string; // e.g. "linear-gradient(135deg, #FF9F40 0%, #FFB74D 100%)"
}

export const categories: Category[] = [
  {
    id: "1",
    name: "Burgers",
    image: "https://images.unsplash.com/photo-1585238341267-1cfec2046a55?w=400&h=400&fit=crop",
    icon: "🍔",
    color: "#FF6B35",
    description: "Juicy burgers with premium ingredients",
    isActive: true,
    displayOrder: 1,
  },
  {
    id: "2",
    name: "Pizza",
    image: "https://images.unsplash.com/photo-1670819917475-d42114832433?w=400&h=400&fit=crop",
    icon: "🍕",
    color: "#E63946",
    description: "Fresh baked pizzas with authentic flavors",
    isActive: true,
    displayOrder: 2,
  },
  {
    id: "3",
    name: "Drinks",
    image: "https://images.unsplash.com/photo-1629257657047-9b40cd435eb0?w=400&h=400&fit=crop",
    icon: "🥤",
    color: "#457B9D",
    description: "Refreshing beverages and shakes",
    isActive: true,
    displayOrder: 3,
  },
  {
    id: "4",
    name: "Sides",
    image: "https://images.unsplash.com/photo-1630431341973-02e1b662ec35?w=400&h=400&fit=crop",
    icon: "🍟",
    color: "#F4A261",
    description: "Delicious side dishes and snacks",
    isActive: true,
    displayOrder: 4,
  },
  {
    id: "5",
    name: "Desserts",
    image: "https://images.unsplash.com/photo-1608847567708-1e0b5a46eb13?w=400&h=400&fit=crop",
    icon: "🍰",
    color: "#E07BE0",
    description: "Sweet treats and desserts",
    isActive: true,
    displayOrder: 5,
  },
  {
    id: "6",
    name: "Chicken",
    image: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=400&h=400&fit=crop",
    icon: "🍗",
    color: "#FF9F40",
    description: "Crispy fried and grilled chicken items",
    isActive: true,
    displayOrder: 6,
  },
];

export const defaultDeals: Deal[] = [
  {
    id: "1",
    title: "Summer Splash Deal",
    description: "Get 50% off on all cool drinks this summer!",
    discountPercentage: 50,
    couponCode: "SUMMER50",
    startDate: "2024-06-01",
    endDate: "2024-08-31",
    isActive: true,
    image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=800&q=80",
    backgroundColor: "#FF9F40",
    textColor: "#FFFFFF",
    displayOrder: 1,
    template: 'flash_sale'
  },
  {
    id: "2",
    title: "Burger Bonanza",
    description: "Buy 1 Get 1 Free on all Classic Burgers",
    discountPercentage: 100,
    couponCode: "BOGO24",
    startDate: "2024-01-01",
    endDate: "2024-12-31",
    isActive: true,
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80",
    backgroundColor: "#FF6B35",
    textColor: "#FFFFFF",
    displayOrder: 2,
    template: 'featured_grid'
  }
];

export const defaultBanners: Banner[] = [
  // Hero Slides
  {
    id: "hero-1",
    type: "hero",
    title: "THE ULTIMATE",
    subtitle: "CHEESEBURGER.",
    description: "Now available in spicy!",
    image: "https://images.unsplash.com/photo-1571507622407-80df135676b8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXJnZXIlMjBmb29kJTIwZGFya3xlbnwxfHx8fDE3NjQyNDM3Mzl8MA&ixlib=rb-4.1.0&q=80&w=1080",
    buttonText: "ORDER NOW",
    isActive: true,
    displayOrder: 1,
  },
  {
    id: "hero-2",
    type: "hero",
    title: "FRESHLY BAKED",
    subtitle: "PIZZA.",
    description: "Loaded with cheese!",
    image: "https://images.unsplash.com/photo-1628840042765-356cda07504e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZXBwZXJvbmklMjBwaXp6YXxlbnwxfHx8fDE3NjQxNzY5Mzh8MA&ixlib=rb-4.1.0&q=80&w=1080",
    buttonText: "ORDER NOW",
    isActive: true,
    displayOrder: 2,
  },
  {
    id: "hero-3",
    type: "hero",
    title: "CREAMY",
    subtitle: "MILKSHAKES.",
    description: "Cool down with flavors!",
    image: "https://images.unsplash.com/photo-1639536564468-ac3900552994?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaWxrc2hha2UlMjBkcmlua3xlbnwxfHx8fDE3NjQxOTc4ODd8MA&ixlib=rb-4.1.0&q=80&w=1080",
    buttonText: "ORDER NOW",
    isActive: true,
    displayOrder: 3,
  },
  // Promo Banner
  {
    id: "promo-1",
    type: "promo",
    title: "Get 50% OFF Your First Order!",
    description: "Sign up today and enjoy incredible savings on your favorite meals",
    image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1920",
    buttonText: "Order Now",
    isActive: true,
    displayOrder: 1,
  }
];

export const featuredProducts: Product[] = [
  {
    id: "1",
    name: "Pepperoni Pizza",
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1609732858591-725d6f2af10b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZXBwZXJvbmklMjBwaXp6YSUyMGNoZWVzZXxlbnwxfHx8fDE3NjM4MzA5MDd8MA&ixlib=rb-4.1.0&q=80&w=1080",
    price: 14.99,
    originalPrice: 19.99,
    discount: 25,
    isFavorite: false,
    isPopular: true,
    category: "Pizza",
    description: "Classic pepperoni with mozzarella cheese",
    inStock: true,
    isSpicy: true,
    isVeg: false,
  },
  {
    id: "2",
    name: "Crispy Fried Chicken",
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1672856399624-61b47d70d339?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjcmlzcHklMjBmcmllZCUyMGNoaWNrZW58ZW58MXx8fHwxNzYzODEwOTg2fDA&ixlib=rb-4.1.0&q=80&w=1080",
    price: 12.99,
    isFavorite: true,
    isPopular: true,
    category: "Chicken",
    description: "Golden fried chicken with special seasoning",
    inStock: true,
    isSpicy: false,
    isVeg: false,
  },
  {
    id: "3",
    name: "Double Cheeseburger",
    rating: 4.5,
    image: "https://images.unsplash.com/photo-1703945530449-81f526495c86?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaGVlc2VidXJnZXIlMjBiZWVmfGVufDF8fHx8MTc2Mzg4NzY4Mnww&ixlib=rb-4.1.0&q=80&w=1080",
    price: 10.99,
    originalPrice: 13.99,
    discount: 20,
    isFavorite: false,
    isPopular: true,
    category: "Burgers",
    description: "Double beef patties with cheddar cheese",
    inStock: true,
    isSpicy: false,
    isVeg: false,
  },
  {
    id: "4",
    name: "Strawberry Cupcake",
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1691775755581-0abf87ca44d5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdHJhd2JlcnJ5JTIwY3VwY2FrZSUyMGRlc3NlcnR8ZW58MXx8fHwxNzYzODg3NjgyfDA&ixlib=rb-4.1.0&q=80&w=1080",
    price: 4.99,
    isFavorite: false,
    isPopular: false,
    category: "Desserts",
    description: "Freshly baked with strawberry cream",
    inStock: true,
    isSpicy: false,
    isVeg: true,
  },
  {
    id: "5",
    name: "BBQ Chicken Wings",
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1592011432621-f7f576f44484?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYnElMjBjaGlja2VuJTIwd2luZ3N8ZW58MXx8fHwxNzYzODg3NjgzfDA&ixlib=rb-4.1.0&q=80&w=1080",
    price: 11.99,
    originalPrice: 14.99,
    discount: 20,
    isFavorite: true,
    isPopular: true,
    category: "Chicken",
    description: "Spicy BBQ sauce with tender chicken",
    inStock: true,
    isSpicy: true,
    isVeg: false,
  },
  {
    id: "6",
    name: "French Fries",
    rating: 4.6,
    image: "https://images.unsplash.com/photo-1599211469310-9b0b50a2955a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmcmVuY2glMjBmcmllZCUyMGNyaXNweXxlbnwxfHx8fDE3NjM4ODc2ODN8MA&ixlib=rb-4.1.0&q=80&w=1080",
    price: 3.99,
    isFavorite: false,
    isPopular: false,
    category: "Sides",
    description: "Crispy golden fries with sea salt",
    inStock: true,
    isSpicy: false,
    isVeg: true,
  },
  {
    id: "7",
    name: "Classic Hot Dog",
    rating: 4.4,
    image: "https://images.unsplash.com/photo-1732216714130-ff029bb556fb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob3QlMjBkb2clMjBzYXVzYWdlfGVufDF8fHx8MTc2Mzg4NzY4M3ww&ixlib=rb-4.1.0&q=80&w=1080",
    price: 6.99,
    isFavorite: false,
    isPopular: false,
    category: "Burgers",
    description: "All-beef hot dog with premium toppings",
    inStock: true,
    isSpicy: false,
    isVeg: false,
  },
  {
    id: "8",
    name: "Chocolate Milkshake",
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1730175602786-527a03831a2f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaG9jb2xhdGUlMjBtaWxrc2hha2UlMjBkcmlua3xlbnwxfHx8fDE3NjM4ODc2ODR8MA&ixlib=rb-4.1.0&q=80&w=1080",
    price: 5.49,
    originalPrice: 6.99,
    discount: 15,
    isFavorite: true,
    isPopular: true,
    category: "Drinks",
    description: "Rich chocolate shake with whipped cream",
    inStock: true,
    isSpicy: false,
    isVeg: true,
  },
];
