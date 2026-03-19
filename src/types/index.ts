/**
 * Shared TypeScript interfaces used across multiple components.
 * Centralizes types that would otherwise be duplicated.
 */

export interface FooterSettings {
    // Typography
    headingSize: "text-sm" | "text-base" | "text-lg" | "text-xl";
    textSize: "text-xs" | "text-sm" | "text-base";
    // Visibility
    showHero: boolean;
    showPerks: boolean;
    // Hero Colors
    heroBgGradientStart: string;
    heroBgGradientEnd: string;
    heroTextColor: string;
    heroButtonBgStart: string;
    heroButtonBgEnd: string;
    heroButtonTextColor: string;
    // Perks Colors
    perksBgColor: string;
    perksTextColor: string;
    perksIconColor: string;
    // Main Footer Colors
    mainBgGradientStart: string;
    mainBgGradientEnd: string;
    headingColor: string;
    textColor: string;
    linkColor: string;
    linkHoverColor: string;
    iconBgColor: string;
    iconColor: string;
    bottomBarBorderColor: string;
    // Editable Text Content
    heroHeading: string;
    heroSubheading: string;
    heroDescription: string;
    perk1Title: string;
    perk1Sub: string;
    perk2Title: string;
    perk2Sub: string;
    perk3Title: string;
    perk3Sub: string;
    brandBlurb: string;
    fbUrl: string;
    igUrl: string;
    twUrl: string;
}

/**
 * Store settings for the Ideal Point shop.
 * Controls store identity, fees, layout, and operating hours.
 */
export interface StoreSettings {
    storeName: string;
    tagline: string;
    logo: string;
    logoBgColor: string;
    logoShape: 'square' | 'rounded' | 'circle' | 'none';
    logoPadding: number;
    email: string;
    phone: string;
    address: string;
    deliveryFee: number;
    taxRate: number;
    minOrder: number;
    currency: string;
    exchangeRate: number;
    bannerLayout: 'single' | 'carousel' | 'grid';
    bannerHeight: number;
    bannerPadding: number;
    isStoreOpen: boolean;
    enablePickup: boolean;
    enableNotifications: boolean;
    autoAcceptOrders: boolean;
    openingTime: string;
    closingTime: string;
    footerSettings?: FooterSettings;
}

/**
 * Default store settings used as fallback.
 */
export const defaultStoreSettings: StoreSettings = {
    storeName: 'IDEAL POINT',
    tagline: 'Fast Food',
    logo: '',
    logoBgColor: 'linear-gradient(135deg, #FF9F40 0%, #FFB74D 100%)',
    logoShape: 'rounded',
    logoPadding: 0,
    email: 'admin@idealpoint.com',
    phone: '+92 300 1234567',
    address: '123 Main Street, Karachi, Pakistan',
    deliveryFee: 150,
    taxRate: 0,
    minOrder: 500,
    currency: 'PKR',
    exchangeRate: 1,
    bannerLayout: 'single',
    bannerHeight: 500,
    bannerPadding: 12,
    isStoreOpen: true,
    enablePickup: true,
    enableNotifications: true,
    autoAcceptOrders: false,
    openingTime: '10:00',
    closingTime: '23:00',
    footerSettings: {
        headingSize: "text-sm",
        textSize: "text-sm",
        showHero: true,
        showPerks: true,
        heroBgGradientStart: "#1a0a00",
        heroBgGradientEnd: "#2d1200",
        heroTextColor: "#ffffff",
        heroButtonBgStart: "#FF9F40",
        heroButtonBgEnd: "#FF6B35",
        heroButtonTextColor: "#ffffff",
        perksBgColor: "#FF9F40",
        perksTextColor: "#ffffff",
        perksIconColor: "#ffffff",
        mainBgGradientStart: "#0f0500",
        mainBgGradientEnd: "#1a0a00",
        headingColor: "#ffffff",
        textColor: "#6b7280",
        linkColor: "#6b7280",
        linkHoverColor: "#fb923c",
        iconBgColor: "rgba(255,159,64,0.1)",
        iconColor: "#fb923c",
        bottomBarBorderColor: "rgba(255,159,64,0.12)",
        heroHeading: "Order Right Now.",
        heroSubheading: "Fresh & Fast.",
        heroDescription: "Minimum order PKR 500 • Delivery fee PKR 150",
        perk1Title: "Fast Delivery",
        perk1Sub: "30 min or less",
        perk2Title: "Fresh Daily",
        perk2Sub: "Made to order",
        perk3Title: "100% Safe",
        perk3Sub: "Hygienic prep",
        brandBlurb: "Bringing bold flavors and fresh ingredients straight to your door — because every craving deserves nothing but the best.",
        fbUrl: "https://facebook.com/",
        igUrl: "https://instagram.com/",
        twUrl: "https://twitter.com/"
    }
};
