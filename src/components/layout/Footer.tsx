import React from "react";
import { useNavigate } from "react-router-dom";
import {
  MapPin, Phone, Mail, Clock, Instagram, Facebook, Twitter,
  Heart, ArrowRight, ChevronRight, Zap, Shield, Truck
} from "lucide-react";
import { StoreSettings, defaultStoreSettings } from "../../types";

interface FooterProps {
  storeSettings: StoreSettings;
}

export const Footer: React.FC<FooterProps> = ({ storeSettings }) => {
  const navigate = useNavigate();
  const year = new Date().getFullYear();
  const footerSettings = storeSettings.footerSettings || defaultStoreSettings.footerSettings!;

  const navLinks = [
    { label: "Home", path: "/" },
    { label: "Menu", path: "/products" },
    { label: "My Cart", path: "/cart" },
    { label: "My Orders", path: "/orders" },
    { label: "Account", path: "/account" },
  ];

  const perks = [
    { icon: <Truck className="w-5 h-5" />, title: footerSettings.perk1Title || 'Fast Delivery', sub: footerSettings.perk1Sub || '30 min or less' },
    { icon: <Zap className="w-5 h-5" />, title: footerSettings.perk2Title || 'Fresh Daily', sub: footerSettings.perk2Sub || 'Made to order' },
    { icon: <Shield className="w-5 h-5" />, title: footerSettings.perk3Title || '100% Safe', sub: footerSettings.perk3Sub || 'Hygienic prep' },
  ];

  return (
    <footer className="relative overflow-hidden mt-20">

      {/* ── Hero CTA Band ─────────────────────────────── */}
      {footerSettings.showHero && (
        <div
          className="relative py-14 px-6 lg:px-16 flex flex-col lg:flex-row items-center justify-between gap-8 overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${footerSettings.heroBgGradientStart} 0%, ${footerSettings.heroBgGradientEnd} 100%)`,
          }}
        >
          {/* Blurred glow circles */}
          <div className="absolute -top-10 -left-10 w-64 h-64 rounded-full"
            style={{ background: "radial-gradient(circle, rgba(255,159,64,0.35) 0%, transparent 70%)", filter: "blur(40px)" }} />
          <div className="absolute -bottom-10 right-20 w-56 h-56 rounded-full"
            style={{ background: "radial-gradient(circle, rgba(220,80,30,0.3) 0%, transparent 70%)", filter: "blur(50px)" }} />

          <div className="relative z-10 text-center lg:text-left">
            <p className="text-sm font-bold tracking-widest uppercase mb-2" style={{ color: footerSettings.heroButtonBgStart }}>🍔 Craving Something?</p>
            <h2 className="text-3xl lg:text-5xl font-black leading-tight" style={{ color: footerSettings.heroTextColor }}>
              {footerSettings.heroHeading || 'Order Right Now.'}<br />
              <span style={{ background: `linear-gradient(90deg, ${footerSettings.heroButtonBgStart}, ${footerSettings.heroButtonBgEnd})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                {footerSettings.heroSubheading || 'Fresh & Fast.'}
              </span>
            </h2>
            <p className="mt-3 text-sm lg:text-base max-w-md opacity-70" style={{ color: footerSettings.heroTextColor }}>
              {footerSettings.heroDescription || `Minimum order ${storeSettings.currency} ${storeSettings.minOrder?.toLocaleString() ?? '500'} • Delivery fee ${storeSettings.currency} ${storeSettings.deliveryFee ?? 150}`}
            </p>
          </div>

          <button
            onClick={() => navigate("/products")}
            className="relative z-10 group flex items-center gap-3 px-8 py-4 rounded-2xl font-black text-lg shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 whitespace-nowrap"
            style={{
              background: `linear-gradient(135deg, ${footerSettings.heroButtonBgStart} 0%, ${footerSettings.heroButtonBgEnd} 100%)`,
              boxShadow: `0 8px 32px ${footerSettings.heroButtonBgStart}66`, // 40% opacity hex
              color: footerSettings.heroButtonTextColor
            }}
          >
            Order Now
            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      )}

      {/* ── Perks Strip ───────────────────────────────── */}
      {footerSettings.showPerks && (
        <div
          className="grid grid-cols-3 divide-x divide-white/20"
          style={{ background: footerSettings.perksBgColor }}
        >
          {perks.map(({ icon, title, sub }) => (
            <div key={title} className="flex items-center justify-center gap-3 py-4 px-4">
              <div style={{ color: footerSettings.perksIconColor, opacity: 0.9 }}>{icon}</div>
              <div className="hidden sm:block">
                <p className="font-bold text-sm leading-none" style={{ color: footerSettings.perksTextColor }}>{title}</p>
                <p className="text-xs leading-none mt-0.5" style={{ color: footerSettings.perksTextColor, opacity: 0.75 }}>{sub}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Main Footer Body ──────────────────────────── */}
      <div style={{ background: `linear-gradient(180deg, ${footerSettings.mainBgGradientStart} 0%, ${footerSettings.mainBgGradientEnd} 100%)` }}>
        <div className="max-w-[1600px] mx-auto px-6 lg:px-16 pt-16 pb-8">

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 mb-12">

            {/* Brand — 4 cols */}
            <div className="lg:col-span-4">
              {/* Logo row */}
              <div className="flex items-center gap-3 mb-5">
                {storeSettings.logo ? (
                  <img
                    src={storeSettings.logo}
                    alt={storeSettings.storeName}
                    className="w-14 h-14 object-contain"
                    style={{
                      background: storeSettings.logoShape !== 'none' ? storeSettings.logoBgColor : 'transparent',
                      padding: storeSettings.logoShape !== 'none' ? `${storeSettings.logoPadding || 4}px` : '0',
                      borderRadius: storeSettings.logoShape === 'circle' ? '50%' : storeSettings.logoShape === 'rounded' ? '14px' : '0',
                    }}
                  />
                ) : (
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-black text-white"
                    style={{ background: "linear-gradient(135deg, #FF9F40, #FF6B35)" }}
                  >
                    {storeSettings?.storeName?.charAt(0) || 'I'}
                  </div>
                )}
                <div>
                  <h3 className="font-black text-xl" style={{ color: footerSettings.headingColor }}>{storeSettings.storeName}</h3>
                  <p className="text-xs font-semibold tracking-widest uppercase mt-0.5" style={{ color: footerSettings.iconColor }}>
                    {storeSettings.tagline}
                  </p>
                </div>
              </div>

              <p className={`${footerSettings.textSize} leading-relaxed mb-6 max-w-xs`} style={{ color: footerSettings.textColor }}>
                {footerSettings.brandBlurb || 'Bringing bold flavors and fresh ingredients straight to your door — because every craving deserves nothing but the best.'}
              </p>

              {/* Open/Close pill */}
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold mb-7 border
                ${storeSettings.isStoreOpen
                  ? "border-green-500/30 bg-green-500/10 text-green-400"
                  : "border-red-500/30 bg-red-500/10 text-red-400"}`}>
                <span className={`w-2 h-2 rounded-full ${storeSettings.isStoreOpen ? "bg-green-400 animate-pulse" : "bg-red-400"}`} />
                {storeSettings.isStoreOpen ? "We are Open Now" : "Currently Closed"} &bull;&nbsp;
                {storeSettings.openingTime || "10:00"} – {storeSettings.closingTime || "23:00"}
              </div>

              {/* Social icons */}
              <div className="flex gap-3">
                {[
                  { Icon: Facebook, label: "Facebook", href: footerSettings.fbUrl || "https://facebook.com/" },
                  { Icon: Instagram, label: "Instagram", href: footerSettings.igUrl || "https://instagram.com/" },
                  { Icon: Twitter, label: "Twitter", href: footerSettings.twUrl || "https://twitter.com/" },
                ].map(({ Icon, label, href }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="group w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-110"
                    style={{
                      background: footerSettings.iconBgColor,
                      border: `1px solid ${footerSettings.iconColor}33`, // 20% opacity
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = `${footerSettings.iconBgColor.replace('0.1', '0.25')}`)}
                    onMouseLeave={e => (e.currentTarget.style.background = footerSettings.iconBgColor)}
                  >
                    <Icon className="w-4 h-4" style={{ color: footerSettings.iconColor }} />
                  </a>
                ))}
              </div>
            </div>

            {/* Spacer */}
            <div className="hidden lg:block lg:col-span-1" />

            {/* Quick Links — 2 cols */}
            <div className="lg:col-span-2">
              <h4 className={`font-black tracking-widest uppercase mb-6 flex items-center gap-2 ${footerSettings.headingSize}`} style={{ color: footerSettings.headingColor }}>
                <span className="w-5 h-0.5 rounded" style={{ background: footerSettings.iconColor }} />
                Quick Links
              </h4>
              <ul className="space-y-3">
                {navLinks.map(({ label, path }) => (
                  <li key={label}>
                    <button
                      onClick={() => navigate(path)}
                      className={`group flex items-center gap-2 transition-colors duration-200 ${footerSettings.textSize}`}
                      style={{ color: footerSettings.linkColor }}
                      onMouseEnter={e => (e.currentTarget.style.color = footerSettings.linkHoverColor)}
                      onMouseLeave={e => (e.currentTarget.style.color = footerSettings.linkColor)}
                    >
                      <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all -translate-x-1 group-hover:translate-x-0" style={{ color: footerSettings.iconColor }} />
                      {label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact — 5 cols */}
            <div className="lg:col-span-5">
              <h4 className={`font-black tracking-widest uppercase mb-6 flex items-center gap-2 ${footerSettings.headingSize}`} style={{ color: footerSettings.headingColor }}>
                <span className="w-5 h-0.5 rounded" style={{ background: footerSettings.iconColor }} />
                Get In Touch
              </h4>

              <div className="grid sm:grid-cols-1 gap-4">
                {[
                  { icon: <MapPin className="w-4 h-4" />, value: storeSettings.address, href: undefined },
                  { icon: <Phone className="w-4 h-4" />, value: storeSettings.phone, href: `tel:${storeSettings.phone}` },
                  { icon: <Mail className="w-4 h-4" />, value: storeSettings.email, href: `mailto:${storeSettings.email}` },
                ].filter(i => i.value).map(({ icon, value, href }) => (
                  <div key={value} className="flex items-center gap-4 group">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200 group-hover:scale-110"
                      style={{ background: footerSettings.iconBgColor, border: `1px solid ${footerSettings.iconColor}33` }}
                    >
                      <span style={{ color: footerSettings.iconColor }}>{icon}</span>
                    </div>
                    {href ? (
                      <a 
                        href={href} 
                        className={`transition-colors truncate ${footerSettings.textSize}`}
                        style={{ color: footerSettings.linkColor }}
                        onMouseEnter={e => (e.currentTarget.style.color = footerSettings.linkHoverColor)}
                        onMouseLeave={e => (e.currentTarget.style.color = footerSettings.linkColor)}
                      >
                        {value}
                      </a>
                    ) : (
                      <span style={{ color: footerSettings.textColor }} className={footerSettings.textSize}>{value}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* ── Bottom Bar ─────────────────────────────── */}
          <div
            className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6"
            style={{ borderTop: `1px solid ${footerSettings.bottomBarBorderColor}` }}
          >
            <p className="opacity-80 text-xs" style={{ color: footerSettings.textColor }}>
              © {year}&nbsp;
              <span className="font-semibold" style={{ color: footerSettings.iconColor }}>{storeSettings.storeName}</span>.
              &nbsp;All rights reserved.
            </p>
            <p className="opacity-80 text-xs flex items-center gap-1.5" style={{ color: footerSettings.textColor }}>
              Made with <Heart className="w-3 h-3 text-red-500 fill-red-500" /> for food lovers
            </p>
          </div>

        </div>
      </div>
    </footer>
  );
};
