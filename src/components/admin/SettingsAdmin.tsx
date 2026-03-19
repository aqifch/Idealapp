import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Save, Store, DollarSign, Clock, MapPin, Phone, Mail, Shield,
  Upload, Loader2, Eye, LayoutTemplate, Palette, Type,
  Sun, Layers, ChevronDown, Settings2, Link2,
  FileText, Zap, Image, Monitor, Smartphone, Laptop
} from 'lucide-react';
import { toast } from 'sonner';
import { defaultStoreSettings, FooterSettings } from '../../types';
import { Footer } from '../layout/Footer';
import { AdminToggle } from './ui/AdminToggle';
import { Tooltip } from './ui/Tooltip';

/* ── Theme Presets ─────────────────────────────────── */
const THEME_PRESETS: { id: string; label: string; emoji: string; colors: string[]; data: Partial<FooterSettings> }[] = [
  {
    id: 'dark-orange', label: 'Dark Orange', emoji: '🔥',
    colors: ['#1a0a00', '#FF9F40', '#0f0500'],
    data: { heroBgGradientStart: '#1a0a00', heroBgGradientEnd: '#2d1200', heroTextColor: '#ffffff', heroButtonBgStart: '#FF9F40', heroButtonBgEnd: '#FF6B35', heroButtonTextColor: '#ffffff', perksBgColor: '#FF9F40', perksTextColor: '#ffffff', perksIconColor: '#ffffff', mainBgGradientStart: '#0f0500', mainBgGradientEnd: '#1a0a00', headingColor: '#ffffff', textColor: '#6b7280', linkColor: '#6b7280', linkHoverColor: '#fb923c', iconBgColor: 'rgba(255,159,64,0.1)', iconColor: '#fb923c', bottomBarBorderColor: 'rgba(255,159,64,0.12)' },
  },
  {
    id: 'midnight-blue', label: 'Midnight Blue', emoji: '🌊',
    colors: ['#0a0f1a', '#3b82f6', '#060c18'],
    data: { heroBgGradientStart: '#0a0f1a', heroBgGradientEnd: '#0f1e3d', heroTextColor: '#ffffff', heroButtonBgStart: '#3b82f6', heroButtonBgEnd: '#1d4ed8', heroButtonTextColor: '#ffffff', perksBgColor: '#1d4ed8', perksTextColor: '#ffffff', perksIconColor: '#ffffff', mainBgGradientStart: '#060c18', mainBgGradientEnd: '#0a0f1a', headingColor: '#ffffff', textColor: '#64748b', linkColor: '#64748b', linkHoverColor: '#60a5fa', iconBgColor: 'rgba(59,130,246,0.1)', iconColor: '#60a5fa', bottomBarBorderColor: 'rgba(59,130,246,0.12)' },
  },
  {
    id: 'forest-green', label: 'Forest Green', emoji: '🌿',
    colors: ['#071a0e', '#22c55e', '#030f07'],
    data: { heroBgGradientStart: '#071a0e', heroBgGradientEnd: '#0d2d18', heroTextColor: '#ffffff', heroButtonBgStart: '#22c55e', heroButtonBgEnd: '#16a34a', heroButtonTextColor: '#ffffff', perksBgColor: '#16a34a', perksTextColor: '#ffffff', perksIconColor: '#ffffff', mainBgGradientStart: '#030f07', mainBgGradientEnd: '#071a0e', headingColor: '#ffffff', textColor: '#6b7280', linkColor: '#6b7280', linkHoverColor: '#4ade80', iconBgColor: 'rgba(34,197,94,0.1)', iconColor: '#4ade80', bottomBarBorderColor: 'rgba(34,197,94,0.12)' },
  },
  {
    id: 'rose-gold', label: 'Rose Gold', emoji: '🌸',
    colors: ['#1a0810', '#f43f5e', '#0f0308'],
    data: { heroBgGradientStart: '#1a0810', heroBgGradientEnd: '#2d0e1e', heroTextColor: '#ffffff', heroButtonBgStart: '#f43f5e', heroButtonBgEnd: '#e11d48', heroButtonTextColor: '#ffffff', perksBgColor: '#e11d48', perksTextColor: '#ffffff', perksIconColor: '#ffffff', mainBgGradientStart: '#0f0308', mainBgGradientEnd: '#1a0810', headingColor: '#ffffff', textColor: '#6b7280', linkColor: '#6b7280', linkHoverColor: '#fb7185', iconBgColor: 'rgba(244,63,94,0.1)', iconColor: '#fb7185', bottomBarBorderColor: 'rgba(244,63,94,0.12)' },
  },
  {
    id: 'pure-light', label: 'Pure Light', emoji: '☀️',
    colors: ['#f8fafc', '#6366f1', '#ffffff'],
    data: { heroBgGradientStart: '#f1f5f9', heroBgGradientEnd: '#e2e8f0', heroTextColor: '#0f172a', heroButtonBgStart: '#6366f1', heroButtonBgEnd: '#4f46e5', heroButtonTextColor: '#ffffff', perksBgColor: '#6366f1', perksTextColor: '#ffffff', perksIconColor: '#ffffff', mainBgGradientStart: '#f8fafc', mainBgGradientEnd: '#f1f5f9', headingColor: '#0f172a', textColor: '#64748b', linkColor: '#64748b', linkHoverColor: '#6366f1', iconBgColor: 'rgba(99,102,241,0.08)', iconColor: '#6366f1', bottomBarBorderColor: 'rgba(99,102,241,0.15)' },
  },
  {
    id: 'neon-cyber', label: 'Neon Cyber', emoji: '⚡',
    colors: ['#05001a', '#a855f7', '#0a0024'],
    data: { heroBgGradientStart: '#05001a', heroBgGradientEnd: '#0c0033', heroTextColor: '#ffffff', heroButtonBgStart: '#a855f7', heroButtonBgEnd: '#06b6d4', heroButtonTextColor: '#ffffff', perksBgColor: '#a855f7', perksTextColor: '#ffffff', perksIconColor: '#ffffff', mainBgGradientStart: '#03000f', mainBgGradientEnd: '#05001a', headingColor: '#ffffff', textColor: '#6b7280', linkColor: '#6b7280', linkHoverColor: '#c084fc', iconBgColor: 'rgba(168,85,247,0.1)', iconColor: '#c084fc', bottomBarBorderColor: 'rgba(168,85,247,0.12)' },
  },
];

const DRAFT_KEY = 'footerDraft';

interface SettingsAdminProps {
  settings?: any;
  onUpdateSettings?: (settings: any) => void;
}

/* ── Reusable small components ─────────────────────── */
const SectionCard: React.FC<{ icon: React.ReactNode; title: string; subtitle?: string; accent?: string; children: React.ReactNode }> = ({ icon, title, subtitle, accent = 'from-blue-500 to-indigo-500', children }) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
    <div className="flex items-center gap-4 px-6 py-4 border-b border-gray-50">
      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${accent} flex items-center justify-center text-white shadow-sm`}>
        {icon}
      </div>
      <div>
        <h3 className="font-bold text-gray-900 text-sm">{title}</h3>
        {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
    </div>
    <div className="p-6 space-y-4">{children}</div>
  </div>
);

const Field: React.FC<{ label: string; children: React.ReactNode; inline?: boolean }> = ({ label, children, inline }) => (
  <div className={inline ? 'flex items-center justify-between gap-4' : 'space-y-1.5'}>
    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</label>
    {children}
  </div>
);

const TextInput: React.FC<{ icon?: React.ReactNode; name: string; value: string; onChange: (e: any) => void; type?: string; placeholder?: string; className?: string }> = ({ icon, name, value, onChange, type = 'text', placeholder, className = '' }) => (
  <div className="relative">
    {icon && <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">{icon}</div>}
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`w-full ${icon ? 'pl-10' : 'pl-4'} pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/10 outline-none transition-all text-sm text-gray-800 ${className}`}
    />
  </div>
);

const ColorRow: React.FC<{ label: string; name: string; value?: string; onChange: (e: any) => void; isText?: boolean }> = ({ label, name, value = '#000000', onChange, isText }) => (
  <div className="space-y-1.5">
    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</label>
    {isText ? (
      <input type="text" name={name} value={value} onChange={onChange} placeholder="rgba, hex..." className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 text-sm outline-none focus:border-indigo-400 focus:bg-white transition-all" />
    ) : (
      <div className="flex items-center gap-2">
        <label className="cursor-pointer flex-shrink-0 w-9 h-9 rounded-xl border-2 border-white shadow-md overflow-hidden ring-1 ring-gray-200" style={{ backgroundColor: value }}>
          <input type="color" name={name} value={value} onChange={onChange} className="opacity-0 w-full h-full cursor-pointer" />
        </label>
        <input type="text" name={name} value={value} onChange={(e) => onChange(e)} className="flex-1 px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 text-xs font-mono outline-none focus:border-indigo-400 focus:bg-white transition-all" />
      </div>
    )}
  </div>
);


const SelectInput: React.FC<{ name: string; value: string; onChange: (e: any) => void; options: { value: string; label: string }[] }> = ({ name, value, onChange, options }) => (
  <select
    name={name}
    value={value}
    onChange={onChange}
    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/10 outline-none transition-all text-sm text-gray-800 appearance-none"
  >
    {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
  </select>
);

/* ── Accordion Section ─────────────────────────────── */
const AccordionSection: React.FC<{
  id: string;
  open: string | null;
  onToggle: (id: string) => void;
  icon: React.ReactNode;
  title: string;
  badge?: string;
  accentClass?: string;
  badgeClass?: string;
  children: React.ReactNode;
}> = ({ id, open, onToggle, icon, title, badge, accentClass = 'bg-gradient-to-br from-slate-500 to-gray-600', badgeClass = 'bg-gray-100 text-gray-500', children }) => {
  const isOpen = open === id;
  return (
    <div className={`rounded-2xl border overflow-hidden transition-all duration-200 ${isOpen ? 'border-indigo-200 shadow-md shadow-indigo-100/60' : 'border-gray-100 shadow-sm'}`}>
      <button
        type="button"
        onClick={() => onToggle(id)}
        className={`w-full flex items-center gap-3 px-5 py-4 text-left transition-all ${isOpen ? 'bg-gradient-to-r from-indigo-50 to-purple-50' : 'bg-white hover:bg-gray-50/80'}`}
      >
        <div className={`w-9 h-9 rounded-xl ${accentClass} flex items-center justify-center text-white flex-shrink-0 shadow-sm`}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className={`font-bold text-sm ${isOpen ? 'text-indigo-800' : 'text-gray-800'}`}>{title}</p>
          {badge && <p className={`mt-1 inline-block px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${isOpen ? 'bg-indigo-100 text-indigo-500' : badgeClass}`}>{badge}</p>}
        </div>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className={`w-4 h-4 ${isOpen ? 'text-indigo-500' : 'text-gray-400'}`} />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="p-5 space-y-4 bg-white border-t border-gray-100">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ══════════════════════════════════════════════════════ */
export const SettingsAdmin = ({ settings, onUpdateSettings }: SettingsAdminProps) => {
  const [formData, setFormData] = useState({
    storeName: settings?.storeName || 'Ideal Point',
    tagline: settings?.tagline || 'Fast Food',
    logo: settings?.logo || '',
    logoBgColor: settings?.logoBgColor || 'linear-gradient(135deg, #FF9F40 0%, #FFB74D 100%)',
    logoShape: settings?.logoShape || 'rounded',
    logoPadding: settings?.logoPadding ?? 0,
    email: settings?.email || 'admin@idealpoint.com',
    phone: settings?.phone || '+92 300 1234567',
    address: settings?.address || '123 Main Street, Karachi, Pakistan',
    currency: settings?.currency || 'PKR',
    deliveryFee: settings?.deliveryFee || 150,
    taxRate: settings?.taxRate || 13,
    minOrder: settings?.minOrder || 500,
    openingTime: settings?.openingTime || '10:00',
    closingTime: settings?.closingTime || '23:00',
    isStoreOpen: settings?.isStoreOpen ?? true,
    enableNotifications: settings?.enableNotifications ?? true,
    autoAcceptOrders: settings?.autoAcceptOrders ?? false,
    enablePickup: settings?.enablePickup ?? true,
    footerSettings: settings?.footerSettings || defaultStoreSettings.footerSettings,
  });

  const [activeTab, setActiveTab] = useState<'general' | 'footer'>('general');
  const [openAccordion, setOpenAccordion] = useState<string | null>('visibility');
  const [previewScale, setPreviewScale] = useState(50);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [activePreset, setActivePreset] = useState<string | null>('dark-orange');
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  // Dirty state tracking
  const lastSavedRef = useRef(JSON.stringify(formData));
  const [isDirty, setIsDirty] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);

  // ── Store setup completion score ──
  const completionFields = [
    { key: 'logo',      label: 'Logo' },
    { key: 'storeName', label: 'Store Name' },
    { key: 'email',     label: 'Email' },
    { key: 'phone',     label: 'Phone' },
    { key: 'address',   label: 'Address' },
    { key: 'tagline',   label: 'Tagline' },
  ];
  const filledFields = completionFields.filter(f => !!(formData as any)[f.key]);
  const completionScore = Math.round((filledFields.length / completionFields.length) * 100);
  const missingFields   = completionFields.filter(f => !(formData as any)[f.key]);

  // ── Changed fields count ──
  const changesCount = (() => {
    try {
      const saved = JSON.parse(lastSavedRef.current) as typeof formData;
      return Object.keys(formData).filter(k => JSON.stringify((formData as any)[k]) !== JSON.stringify((saved as any)[k])).length;
    } catch { return 0; }
  })();

  // ── Relative time helper ──
  const getRelativeTime = (d: Date) => {
    const mins = Math.floor((Date.now() - d.getTime()) / 60000);
    if (mins < 1) return 'just now';
    if (mins === 1) return '1 minute ago';
    if (mins < 60) return `${mins} minutes ago`;
    const hrs = Math.floor(mins / 60);
    return hrs === 1 ? '1 hour ago' : `${hrs} hours ago`;
  };

  // Auto-save draft to localStorage whenever formData changes (used to be only footer)
  useEffect(() => {
    const draft = JSON.stringify(formData);
    localStorage.setItem(DRAFT_KEY, draft);
    setIsDirty(draft !== lastSavedRef.current);
  }, [formData]);

  // Restore draft on mount
  useEffect(() => {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return;
    try {
      const draft = JSON.parse(raw);
      const current = JSON.stringify(formData);
      if (raw !== current) {
        toast('📋 Draft from last session found!', {
          duration: 6000,
          action: {
            label: 'Restore',
            onClick: () => {
              setFormData(draft);
              toast.success('Draft restored ✅');
            },
          },
          cancel: { label: 'Discard', onClick: () => localStorage.removeItem(DRAFT_KEY) },
        });
      }
    } catch {}
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Global Keyboard Shortcut for Save (Ctrl+S / Cmd+S)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (isDirty) {
          handleSubmit();
        } else {
          toast.info('No changes to save');
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDirty, formData]);

  const applyTheme = useCallback((preset: typeof THEME_PRESETS[0]) => {
    setActivePreset(preset.id);
    setFormData(prev => ({
      ...prev,
      footerSettings: { ...prev.footerSettings!, ...preset.data },
    }));
    toast.success(`${preset.label} theme applied! ✨`);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    // Safely extract checked property, crucial for synthetic events from Toggle
    const isChecked = type === 'checkbox' ? (e.target as any).checked : false;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? isChecked : value
    }));
  };

  const handleFooterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    // Safely extract checked property, crucial for synthetic events from Toggle
    const isChecked = type === 'checkbox' ? (e.target as any).checked : false;
    setFormData(prev => ({
      ...prev,
      footerSettings: {
        ...prev.footerSettings!,
        [name]: type === 'checkbox' ? isChecked : value
      }
    }));
  };

  const toggleAccordion = (id: string) => setOpenAccordion(prev => prev === id ? null : id);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) { toast.error('Only JPG, PNG, WebP, and SVG images are allowed'); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be smaller than 5MB'); return; }
    setIsUploading(true);
    try {
      // Simulate upload if no real backend is connected yet, or use Supabase URL logic if provided
      const UPLOAD_API_URL = import.meta.env.VITE_UPLOAD_API_URL;
      
      if (!UPLOAD_API_URL) {
         // Mock upload success for frontend-only demo
         await new Promise(r => setTimeout(r, 1000));
         const fakeUrl = URL.createObjectURL(file);
         setFormData(prev => { const updated = { ...prev, logo: fakeUrl }; if (onUpdateSettings) onUpdateSettings(updated); return updated; });
         toast.success('Logo uploaded (Simulated)! ✅');
         return;
      }
      
      const uploadForm = new FormData();
      uploadForm.append('image', file);
      const response = await fetch(UPLOAD_API_URL, { method: 'POST', body: uploadForm });
      if (!response.ok) throw new Error(`Server responded with status ${response.status}`);
      const data = await response.json();
      if (data.success && data.url) {
        setFormData(prev => { const updated = { ...prev, logo: data.url }; if (onUpdateSettings) onUpdateSettings(updated); return updated; });
        toast.success('Logo uploaded! ✅');
      } else { throw new Error(data.error || 'Upload failed'); }
    } catch (err: any) {
      toast.error('Upload failed: ' + (err?.message || 'Make sure server is running'));
    } finally {
      setIsUploading(false);
      if (logoInputRef.current) logoInputRef.current.value = '';
    }
  };

  const validate = () => {
    const errors: Record<string, string> = {};
    if (!formData.storeName.trim()) errors.storeName = 'Store name is required';
    if (formData.email && !/^[^@]+@[^@]+\.[^@]+$/.test(formData.email)) errors.email = 'Enter a valid email address';
    if (formData.taxRate < 0 || formData.taxRate > 100) errors.taxRate = 'Must be between 0 and 100';
    if (formData.deliveryFee < 0) errors.deliveryFee = 'Cannot be negative';
    if (formData.minOrder < 0) errors.minOrder = 'Cannot be negative';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleRevert = () => {
    try {
      const saved = JSON.parse(lastSavedRef.current);
      setFormData(saved);
      setIsDirty(false);
      toast.info('Changes reverted to last saved state');
    } catch { toast.error('Could not revert changes'); }
  };

  const handleSubmit = async () => {
    if (!validate()) { toast.error('Please fix the errors before saving'); return; }
    setIsSaving(true);
    await new Promise(r => setTimeout(r, 600));
    if (onUpdateSettings) {
      onUpdateSettings(formData);
      toast.success('Settings saved successfully! ✨');
    } else {
      toast.info('Settings update simulated (Backend not connected)');
    }
    lastSavedRef.current = JSON.stringify(formData);
    setLastSavedAt(new Date());
    setIsDirty(false);
    setFormErrors({});
    localStorage.removeItem(DRAFT_KEY);
    setIsSaving(false);
  };

  const tabs = [
    { id: 'general', label: 'General Settings', icon: <Settings2 className="w-4 h-4" /> },
    { id: 'footer', label: 'Footer Appearance', icon: <LayoutTemplate className="w-4 h-4" /> },
  ];

  const fs = formData.footerSettings!;

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      {/* ── Page Header ────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold text-indigo-500 uppercase tracking-widest mb-1">⚙️ Admin Panel</p>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">Store Settings</h1>
          <p className="text-gray-500 mt-1 text-sm">Manage your store identity, preferences, and design.</p>
        </div>

        {/* Store Completion Bar */}
        <div className="flex-shrink-0 w-full sm:w-72">
          <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold text-gray-600 uppercase tracking-wider">Store Setup</p>
              <span className={`text-xs font-black ${
                completionScore >= 80 ? 'text-emerald-500' :
                completionScore >= 50 ? 'text-amber-500' : 'text-red-400'
              }`}>{completionScore}%</span>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  completionScore >= 80 ? 'bg-emerald-400' :
                  completionScore >= 50 ? 'bg-amber-400' : 'bg-red-400'
                }`}
                style={{ width: `${completionScore}%` }}
              />
            </div>
            {missingFields.length > 0 && (
              <p className="mt-2 text-xs text-gray-400">
                Missing: {missingFields.map(f => f.label).join(', ')}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── Tabs ──────────────────────────────────────── */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-2xl w-fit">
        {tabs.map(tab => {
          const isActive = activeTab === tab.id;
          const hasUnsaved = isDirty && isActive && changesCount > 0;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`relative flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 ${
                isActive ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.icon}
              {tab.label}
              {hasUnsaved && (
                <span className="ml-1 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-orange-100 text-orange-600 text-[10px] font-bold leading-none">
                  {changesCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {/* ══ TAB: General ══════════════════════════════ */}
        {activeTab === 'general' && (
          <motion.div key="general" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.2 }}>
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

              {/* LEFT: Identity */}
              <div className="xl:col-span-2 space-y-6">

                {/* Logo & Store Info */}
                <SectionCard icon={<Store className="w-5 h-5" />} title="Store Identity" subtitle="Name, logo, and contact" accent="from-blue-500 to-indigo-500">
                  {/* Logo Upload */}
                  <div className="flex gap-5 items-start">
                    <div
                      className="w-20 h-20 flex-shrink-0 flex items-center justify-center overflow-hidden border-2 border-dashed border-gray-200 transition-all"
                      style={{
                        borderRadius: formData.logoShape === 'circle' ? '50%' : formData.logoShape === 'square' ? '8px' : '16px',
                        background: formData.logoShape === 'none' ? 'transparent' : formData.logoBgColor,
                        padding: formData.logoShape === 'none' ? '0' : `${formData.logoPadding}px`
                      }}
                    >
                      {formData.logo ? (
                        <img src={formData.logo} alt="Logo" className="w-full h-full object-contain" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                      ) : (
                        <span className="text-3xl">🍔</span>
                      )}
                    </div>
                    <div className="flex-1 space-y-2">
                      <input ref={logoInputRef} type="file" accept="image/jpeg,image/jpg,image/png,image/webp,image/svg+xml" onChange={handleLogoUpload} className="hidden" />
                      <button
                        type="button"
                        onClick={() => logoInputRef.current?.click()}
                        disabled={isUploading}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-600 font-semibold text-sm hover:bg-indigo-100 transition-all disabled:opacity-60"
                      >
                        {isUploading ? <><Loader2 className="w-4 h-4 animate-spin" /> Uploading...</> : <><Upload className="w-4 h-4" /> Upload Logo</>}
                      </button>
                      {formData.logo && (
                        <button type="button" onClick={() => setFormData(p => ({ ...p, logo: '' }))} className="block text-xs text-red-400 hover:text-red-600 font-medium transition-colors">
                          Remove logo
                        </button>
                      )}
                      <p className="text-xs text-gray-400">JPG, PNG, WebP, SVG · Max 5MB</p>
                    </div>
                  </div>

                  {/* Logo styling */}
                  <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-50">
                    <Field label="Container Shape">
                      <SelectInput name="logoShape" value={formData.logoShape} onChange={handleChange} options={[
                        { value: 'rounded', label: 'Rounded Corners' },
                        { value: 'circle', label: 'Perfect Circle' },
                        { value: 'square', label: 'Square' },
                        { value: 'none', label: 'No Container' },
                      ]} />
                    </Field>
                    <Field label="BG Color">
                      <div className="flex items-center gap-2">
                        <label className="cursor-pointer w-10 h-10 rounded-xl border-2 border-white shadow-md overflow-hidden flex-shrink-0" style={{ backgroundColor: formData.logoBgColor.startsWith('#') ? formData.logoBgColor : '#ff9f40' }}>
                          <input type="color" value={formData.logoBgColor.startsWith('#') ? formData.logoBgColor : '#ffffff'} onChange={e => setFormData(p => ({ ...p, logoBgColor: e.target.value }))} className="opacity-0 w-full h-full cursor-pointer" />
                        </label>
                        <input type="text" value={formData.logoBgColor} onChange={e => setFormData(p => ({ ...p, logoBgColor: e.target.value }))} className="flex-1 px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 text-xs font-mono outline-none focus:border-indigo-400 transition-all" />
                      </div>
                    </Field>
                  </div>

                  {formData.logoShape !== 'none' && (
                    <div>
                      <div className="flex justify-between mb-2">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Inner Padding</label>
                        <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">{formData.logoPadding}px</span>
                      </div>
                      <input type="range" min="0" max="20" value={formData.logoPadding} onChange={e => setFormData(p => ({ ...p, logoPadding: parseInt(e.target.value) }))} className="w-full accent-indigo-600" />
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-50">
                    <Field label="Store Name">
                      <TextInput icon={<Store className="w-4 h-4" />} name="storeName" value={formData.storeName} onChange={handleChange} />
                    </Field>
                    <Field label="Tagline">
                      <TextInput name="tagline" value={formData.tagline} onChange={handleChange} placeholder="e.g. Fast Food" />
                    </Field>
                    <Field label="Email">
                      <TextInput icon={<Mail className="w-4 h-4" />} name="email" value={formData.email} onChange={handleChange} type="email" />
                    </Field>
                    <Field label="Phone">
                      <TextInput icon={<Phone className="w-4 h-4" />} name="phone" value={formData.phone} onChange={handleChange} />
                    </Field>
                    <div className="col-span-2">
                      <Field label="Address">
                        <TextInput icon={<MapPin className="w-4 h-4" />} name="address" value={formData.address} onChange={handleChange} />
                      </Field>
                    </div>
                  </div>
                </SectionCard>

                {/* Financial */}
                <SectionCard icon={<DollarSign className="w-5 h-5" />} title="Financial & Orders" subtitle="Fees, tax, and currency" accent="from-emerald-500 to-teal-500">
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Currency">
                      <SelectInput name="currency" value={formData.currency} onChange={handleChange} options={[
                        { value: 'PKR', label: 'PKR (Rs)' },
                        { value: 'USD', label: 'USD ($)' },
                        { value: 'EUR', label: 'EUR (€)' },
                        { value: 'GBP', label: 'GBP (£)' },
                      ]} />
                    </Field>
                    <div className="space-y-1.5">
                      <div className="flex items-center">
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">Tax Rate (%)</label>
                        <Tooltip text="Added to order subtotal at checkout. Set to 0 for tax-free orders." position="top" />
                      </div>
                      <TextInput name="taxRate" value={String(formData.taxRate)} onChange={handleChange} type="number"
                        className={formErrors.taxRate ? 'border-red-400 bg-red-50' : ''} />
                      {formErrors.taxRate && <p className="text-xs text-red-500 font-medium">{formErrors.taxRate}</p>}
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center">
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">Delivery Fee</label>
                        <Tooltip text="Flat fee charged per order for delivery. Set to 0 for free delivery." position="top" />
                      </div>
                      <TextInput name="deliveryFee" value={String(formData.deliveryFee)} onChange={handleChange} type="number"
                        className={formErrors.deliveryFee ? 'border-red-400 bg-red-50' : ''} />
                      {formErrors.deliveryFee && <p className="text-xs text-red-500 font-medium">{formErrors.deliveryFee}</p>}
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center">
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">Min Order Value</label>
                        <Tooltip text="Orders below this amount cannot be placed. Helps cover delivery costs." position="top" />
                      </div>
                      <TextInput name="minOrder" value={String(formData.minOrder)} onChange={handleChange} type="number"
                        className={formErrors.minOrder ? 'border-red-400 bg-red-50' : ''} />
                      {formErrors.minOrder && <p className="text-xs text-red-500 font-medium">{formErrors.minOrder}</p>}
                    </div>
                  </div>
                </SectionCard>

                {/* Hours */}
                <SectionCard icon={<Clock className="w-5 h-5" />} title="Operating Hours" subtitle="Opening and closing times" accent="from-amber-500 to-orange-500">
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Opening Time">
                      <TextInput name="openingTime" value={formData.openingTime} onChange={handleChange} type="time" />
                    </Field>
                    <Field label="Closing Time">
                      <TextInput name="closingTime" value={formData.closingTime} onChange={handleChange} type="time" />
                    </Field>
                  </div>
                </SectionCard>
              </div>

              {/* RIGHT: Preferences */}
              <div className="space-y-6">
                <SectionCard icon={<Shield className="w-5 h-5" />} title="Preferences" subtitle="Store behaviour" accent="from-violet-500 to-purple-500">
                  <div className="space-y-0 divide-y divide-gray-50">
                    {(
                      [
                        { name: 'isStoreOpen' as const, label: 'Store Open', desc: 'Allow customers to order', color: '#22c55e' },
                        { name: 'enablePickup' as const, label: 'Enable Pickup', desc: 'Allow self-pickup orders', color: '#3b82f6' },
                        { name: 'enableNotifications' as const, label: 'Order Alerts', desc: 'Sound for new orders', color: '#a855f7' },
                        { name: 'autoAcceptOrders' as const, label: 'Auto-Accept', desc: 'Confirm orders instantly', color: '#10b981' },
                      ] as const
                    ).map(({ name, label, desc, color }) => (
                      <div key={name} className="flex items-center justify-between py-4">
                        <div>
                          <p className="text-sm font-bold text-gray-800">{label}</p>
                          <p className="text-xs text-gray-400">{desc}</p>
                        </div>
                        <AdminToggle
                          id={`toggle-${name}`}
                          checked={!!formData[name]}
                          onChange={(val) => setFormData(prev => ({ ...prev, [name]: val }))}
                          onColor={color}
                        />
                      </div>
                    ))}
                  </div>
                </SectionCard>

                {/* Quick Info Card */}
                <div className="rounded-2xl p-5 text-white overflow-hidden relative" style={{ background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' }}>
                  <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full bg-white/10" />
                  <div className="absolute -bottom-6 -left-6 w-32 h-32 rounded-full bg-white/5" />
                  <div className="relative z-10">
                    <p className="text-indigo-200 text-xs font-semibold uppercase tracking-wider mb-1">Quick Status</p>
                    <p className={`text-2xl font-black ${formData.isStoreOpen ? 'text-white' : 'text-red-300'}`}>
                      {formData.isStoreOpen ? '🟢 We\'re Open' : '🔴 Closed'}
                    </p>
                    <p className="text-indigo-200 text-sm mt-1">{formData.openingTime} – {formData.closingTime}</p>
                    <div className="mt-4 pt-4 border-t border-white/20 grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-indigo-200 text-xs">Delivery</p>
                        <p className="text-white font-bold text-sm">{formData.currency} {formData.deliveryFee}</p>
                      </div>
                      <div>
                        <p className="text-indigo-200 text-xs">Min Order</p>
                        <p className="text-white font-bold text-sm">{formData.currency} {formData.minOrder}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ══ TAB: Footer ═══════════════════════════════════ */}
        {activeTab === 'footer' && (
          <motion.div key="footer" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.2 }}>
            <div className="flex gap-6 items-start">

              {/* ── LEFT: Controls Panel ───────────────────── */}
              <div className="w-[420px] flex-shrink-0 space-y-3 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 240px)' }}>

                {/* Section label */}
                <div className="flex items-center gap-2 mb-3 px-1">
                  <div className="w-1.5 h-5 rounded-full bg-gradient-to-b from-indigo-500 to-purple-500" />
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Footer Editor</p>
                </div>

                {/* ── Theme Presets Row ──────────────────────────── */}
                <div className="mb-1">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 px-1 flex items-center gap-1.5">
                    <Palette className="w-3.5 h-3.5 text-indigo-400" /> Quick Theme Presets
                  </p>
                  <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {THEME_PRESETS.map(preset => (
                      <button
                        key={preset.id}
                        onClick={() => applyTheme(preset)}
                        title={preset.label}
                        className={`flex-shrink-0 group relative rounded-xl overflow-hidden transition-all duration-200 ${
                          activePreset === preset.id
                            ? 'ring-2 ring-indigo-500 ring-offset-2 scale-105'
                            : 'hover:scale-105 hover:shadow-lg ring-1 ring-gray-200'
                        }`}
                        style={{ width: 72 }}
                      >
                        {/* Color swatch bar */}
                        <div className="h-10 flex">
                          {preset.colors.map((c, i) => (
                            <div key={i} className="flex-1" style={{ background: c }} />
                          ))}
                        </div>
                        {/* Label */}
                        <div className={`px-1 py-1.5 text-center ${
                          activePreset === preset.id ? 'bg-indigo-50' : 'bg-white'
                        }`}>
                          <span className="text-xs">{preset.emoji}</span>
                          <p className={`text-[9px] font-bold leading-none mt-0.5 truncate ${
                            activePreset === preset.id ? 'text-indigo-700' : 'text-gray-600'
                          }`}>{preset.label}</p>
                        </div>
                        {/* Active checkmark */}
                        {activePreset === preset.id && (
                          <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-indigo-500 flex items-center justify-center">
                            <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 12 12" fill="none">
                              <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 1. Visibility */}
                <AccordionSection
                  id="visibility"
                  open={openAccordion}
                  onToggle={toggleAccordion}
                  icon={<Eye className="w-4 h-4" />}
                  title="Visibility"
                  badge="Show or hide sections"
                  accentClass="bg-gradient-to-br from-slate-500 to-gray-600"
                  badgeClass="bg-slate-100 text-slate-500"
                >
                  {[
                    { name: 'showHero', label: 'Hero CTA Banner', desc: '"Order Right Now" section' },
                    { name: 'showPerks', label: 'Perks Strip', desc: 'Fast delivery, fresh daily, etc.' },
                  ].map(({ name, label, desc }) => (
                    <div key={name} className="flex items-center justify-between py-1">
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{label}</p>
                        <p className="text-xs text-gray-400">{desc}</p>
                      </div>
                      <AdminToggle
                        id={`footer-toggle-${name}`}
                        checked={!!fs?.[name as keyof typeof fs]}
                        onChange={(val) => setFormData(prev => ({
                          ...prev,
                          footerSettings: { ...prev.footerSettings!, [name]: val }
                        }))}
                        onColor="#f97316"
                      />
                    </div>
                  ))}
                </AccordionSection>

                {/* 2. Content / Text */}
                <AccordionSection
                  id="content"
                  open={openAccordion}
                  onToggle={toggleAccordion}
                  icon={<FileText className="w-4 h-4" />}
                  title="Text Content"
                  badge="Edit headings, perks, blurb & links"
                  accentClass="bg-gradient-to-br from-violet-500 to-purple-600"
                  badgeClass="bg-purple-100 text-purple-600"
                >
                  {/* Hero text */}
                  <div className="pb-3 mb-1 border-b border-gray-100">
                    <p className="text-xs font-bold text-orange-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                      <Sun className="w-3.5 h-3.5" /> Hero Section
                    </p>
                    <div className="space-y-3">
                      <Field label="Main Heading">
                        <TextInput name="heroHeading" value={fs?.heroHeading || ''} onChange={handleFooterChange} placeholder="Order Right Now." />
                      </Field>
                      <Field label="Subheading (gradient)">
                        <TextInput name="heroSubheading" value={fs?.heroSubheading || ''} onChange={handleFooterChange} placeholder="Fresh & Fast." />
                      </Field>
                      <Field label="Description">
                        <textarea
                          name="heroDescription"
                          value={fs?.heroDescription || ''}
                          onChange={handleFooterChange}
                          rows={2}
                          placeholder="Short description below heading..."
                          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/10 outline-none transition-all text-sm text-gray-800 resize-none"
                        />
                      </Field>
                    </div>
                  </div>

                  {/* Perks */}
                  <div className="pb-3 mb-1 border-b border-gray-100">
                    <p className="text-xs font-bold text-teal-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5" /> Perks Strip Labels
                    </p>
                    <div className="space-y-3">
                      {[
                        { titleName: 'perk1Title', subName: 'perk1Sub', emoji: '🚚', defaultTitle: 'Fast Delivery', defaultSub: '30 min or less' },
                        { titleName: 'perk2Title', subName: 'perk2Sub', emoji: '⚡', defaultTitle: 'Fresh Daily', defaultSub: 'Made to order' },
                        { titleName: 'perk3Title', subName: 'perk3Sub', emoji: '🛡', defaultTitle: '100% Safe', defaultSub: 'Hygienic prep' },
                      ].map(({ titleName, subName, emoji, defaultTitle, defaultSub }) => (
                        <div key={titleName} className="rounded-xl border border-gray-100 bg-gray-50/50 p-3 space-y-2">
                          <p className="text-xs font-semibold text-gray-500">{emoji} Perk {titleName.replace('perk', '').replace('Title', '')}</p>
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              name={titleName}
                              value={(fs as any)?.[titleName] || ''}
                              onChange={handleFooterChange}
                              placeholder={defaultTitle}
                              className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm outline-none focus:border-indigo-400 transition-all"
                            />
                            <input
                              name={subName}
                              value={(fs as any)?.[subName] || ''}
                              onChange={handleFooterChange}
                              placeholder={defaultSub}
                              className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-xs text-gray-500 outline-none focus:border-indigo-400 transition-all"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Brand blurb */}
                  <div className="pb-3 mb-1 border-b border-gray-100">
                    <p className="text-xs font-bold text-indigo-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                      <Image className="w-3.5 h-3.5" /> Brand Section
                    </p>
                    <Field label="Brand Description">
                      <textarea
                        name="brandBlurb"
                        value={fs?.brandBlurb || ''}
                        onChange={handleFooterChange}
                        rows={3}
                        placeholder="Bringing bold flavors..."
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/10 outline-none transition-all text-sm text-gray-800 resize-none"
                      />
                    </Field>
                  </div>

                  {/* Social links */}
                  <div>
                    <p className="text-xs font-bold text-blue-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                      <Link2 className="w-3.5 h-3.5" /> Social Links
                    </p>
                    <div className="space-y-2">
                      <Field label="Facebook URL">
                        <TextInput name="fbUrl" value={fs?.fbUrl || ''} onChange={handleFooterChange} placeholder="https://facebook.com/..." />
                      </Field>
                      <Field label="Instagram URL">
                        <TextInput name="igUrl" value={fs?.igUrl || ''} onChange={handleFooterChange} placeholder="https://instagram.com/..." />
                      </Field>
                      <Field label="Twitter / X URL">
                        <TextInput name="twUrl" value={fs?.twUrl || ''} onChange={handleFooterChange} placeholder="https://twitter.com/..." />
                      </Field>
                    </div>
                  </div>
                </AccordionSection>

                {/* 3. Hero Colors */}
                <AccordionSection
                  id="heroColors"
                  open={openAccordion}
                  onToggle={toggleAccordion}
                  icon={<Sun className="w-4 h-4" />}
                  title="Hero Section Colors"
                  badge="CTA banner gradient & button"
                  accentClass="bg-gradient-to-br from-orange-500 to-amber-500"
                  badgeClass="bg-orange-100 text-orange-600"
                >
                  <div className="grid grid-cols-2 gap-3">
                    <ColorRow label="BG Start" name="heroBgGradientStart" value={fs?.heroBgGradientStart} onChange={handleFooterChange} />
                    <ColorRow label="BG End" name="heroBgGradientEnd" value={fs?.heroBgGradientEnd} onChange={handleFooterChange} />
                  </div>
                  <ColorRow label="Heading Text Color" name="heroTextColor" value={fs?.heroTextColor} onChange={handleFooterChange} />
                  <div className="grid grid-cols-2 gap-3">
                    <ColorRow label="Button Start" name="heroButtonBgStart" value={fs?.heroButtonBgStart} onChange={handleFooterChange} />
                    <ColorRow label="Button End" name="heroButtonBgEnd" value={fs?.heroButtonBgEnd} onChange={handleFooterChange} />
                  </div>
                  <ColorRow label="Button Text Color" name="heroButtonTextColor" value={fs?.heroButtonTextColor} onChange={handleFooterChange} />
                </AccordionSection>

                {/* 4. Perks Strip Colors */}
                <AccordionSection
                  id="perksColors"
                  open={openAccordion}
                  onToggle={toggleAccordion}
                  icon={<Palette className="w-4 h-4" />}
                  title="Perks Strip Colors"
                  badge="Icon strip below the hero"
                  accentClass="bg-gradient-to-br from-teal-500 to-emerald-500"
                  badgeClass="bg-emerald-100 text-emerald-600"
                >
                  <div className="grid grid-cols-2 gap-3">
                    <ColorRow label="Background" name="perksBgColor" value={fs?.perksBgColor} onChange={handleFooterChange} />
                    <ColorRow label="Text Color" name="perksTextColor" value={fs?.perksTextColor} onChange={handleFooterChange} />
                    <ColorRow label="Icon Color" name="perksIconColor" value={fs?.perksIconColor} onChange={handleFooterChange} />
                  </div>
                </AccordionSection>

                {/* 5. Main Footer Colors */}
                <AccordionSection
                  id="mainColors"
                  open={openAccordion}
                  onToggle={toggleAccordion}
                  icon={<Layers className="w-4 h-4" />}
                  title="Main Footer Colors"
                  badge="Dark body section appearance"
                  accentClass="bg-gradient-to-br from-violet-600 to-indigo-600"
                  badgeClass="bg-indigo-100 text-indigo-600"
                >
                  <div className="grid grid-cols-2 gap-3">
                    <ColorRow label="BG Start" name="mainBgGradientStart" value={fs?.mainBgGradientStart} onChange={handleFooterChange} />
                    <ColorRow label="BG End" name="mainBgGradientEnd" value={fs?.mainBgGradientEnd} onChange={handleFooterChange} />
                    <ColorRow label="Heading Color" name="headingColor" value={fs?.headingColor} onChange={handleFooterChange} />
                    <ColorRow label="Body Text" name="textColor" value={fs?.textColor} onChange={handleFooterChange} />
                    <ColorRow label="Link Color" name="linkColor" value={fs?.linkColor} onChange={handleFooterChange} />
                    <ColorRow label="Link Hover" name="linkHoverColor" value={fs?.linkHoverColor} onChange={handleFooterChange} />
                    <ColorRow label="Icon Color" name="iconColor" value={fs?.iconColor} onChange={handleFooterChange} />
                  </div>
                  <ColorRow label="Icon Container BG" name="iconBgColor" value={fs?.iconBgColor} onChange={handleFooterChange} isText />
                  <ColorRow label="Bottom Bar Border" name="bottomBarBorderColor" value={fs?.bottomBarBorderColor} onChange={handleFooterChange} isText />
                </AccordionSection>

                {/* 6. Typography */}
                <AccordionSection
                  id="typography"
                  open={openAccordion}
                  onToggle={toggleAccordion}
                  icon={<Type className="w-4 h-4" />}
                  title="Typography"
                  badge="Font sizes for headings and body"
                  accentClass="bg-gradient-to-br from-pink-500 to-rose-500"
                  badgeClass="bg-pink-100 text-pink-600"
                >
                  <Field label="Heading Size">
                    <SelectInput name="headingSize" value={fs?.headingSize || 'text-sm'} onChange={handleFooterChange} options={[
                      { value: 'text-sm', label: 'Small' },
                      { value: 'text-base', label: 'Medium' },
                      { value: 'text-lg', label: 'Large' },
                      { value: 'text-xl', label: 'Extra Large' },
                    ]} />
                  </Field>
                  <Field label="Body Text Size">
                    <SelectInput name="textSize" value={fs?.textSize || 'text-sm'} onChange={handleFooterChange} options={[
                      { value: 'text-xs', label: 'Extra Small' },
                      { value: 'text-sm', label: 'Small' },
                      { value: 'text-base', label: 'Medium' },
                    ]} />
                  </Field>
                </AccordionSection>

              </div>

              {/* ── RIGHT: Compact Live Preview ─────────────── */}
              <div className="flex-1 min-w-0">
                <div className="sticky top-6">
                  {/* Preview header: Live badge + Desktop/Mobile toggle + scale slider */}
                  <div className="flex items-center justify-between mb-3 px-1 gap-3">
                    {/* Left: live dot */}
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                      <span className="text-sm font-bold text-gray-700">Live Preview</span>
                    </div>

                    {/* Center: Desktop/Mobile toggle */}
                    <div className="flex items-center bg-gray-100 rounded-xl p-0.5 gap-0.5">
                      <button
                        onClick={() => setPreviewMode('desktop')}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                          previewMode === 'desktop'
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        <Laptop className="w-3.5 h-3.5" /> Desktop
                      </button>
                      <button
                        onClick={() => setPreviewMode('mobile')}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                          previewMode === 'mobile'
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        <Smartphone className="w-3.5 h-3.5" /> Mobile
                      </button>
                    </div>

                    {/* Right: Scale slider (desktop only) */}
                    {previewMode === 'desktop' ? (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400 font-mono w-8 text-right">{previewScale}%</span>
                        <input
                          type="range"
                          min={25} max={100} step={5}
                          value={previewScale}
                          onChange={e => setPreviewScale(Number(e.target.value))}
                          className="w-20 h-1.5 rounded-full appearance-none bg-gray-200 accent-indigo-500 cursor-pointer"
                        />
                        <span className="text-xs text-gray-500 font-semibold">Zoom</span>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full font-mono">375px</span>
                    )}
                  </div>

                  {/* Browser chrome frame */}
                  <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-2xl shadow-gray-300/50">
                    {/* Browser top bar */}
                    <div className="bg-gray-100 px-4 py-3 flex items-center gap-3 border-b border-gray-200">
                      <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-red-400" />
                        <div className="w-3 h-3 rounded-full bg-yellow-400" />
                        <div className="w-3 h-3 rounded-full bg-green-400" />
                      </div>
                      <div className="flex-1 bg-white rounded-lg px-3 py-1.5 flex items-center gap-2">
                        <div className="w-3 h-3 text-gray-300">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                        </div>
                        <span className="text-xs text-gray-400 font-mono">idealpoint.com</span>
                      </div>
                    </div>

                    {/* Page content mock */}
                    <div className="bg-white">
                      {/* Simulated page content above footer */}
                      <div className="bg-gradient-to-br from-gray-50 to-gray-100 px-8 py-10 flex flex-col items-center justify-center border-b border-gray-200/60">
                        <div
                          className="w-10 h-10 mb-2 flex items-center justify-center text-xl rounded-xl shadow-sm"
                          style={{
                            background: formData.logoBgColor,
                            borderRadius: formData.logoShape === 'circle' ? '50%' : '12px',
                            padding: `${formData.logoPadding}px`
                          }}
                        >
                          {formData.logo ? (
                            <img src={formData.logo} alt="Logo" className="w-full h-full object-contain" />
                          ) : '🍔'}
                        </div>
                        <p className="text-gray-700 font-black text-base">{formData.storeName || 'Ideal Point'}</p>
                        <p className="text-gray-400 text-xs mt-1">{formData.tagline || 'Fast Food'}</p>
                        <div className="mt-3 flex gap-1">
                          {[...Array(4)].map((_, i) => (
                            <div key={i} className="h-1.5 rounded-full bg-gray-200" style={{ width: `${40 + i * 15}px` }} />
                          ))}
                        </div>
                        <p className="text-xs text-gray-300 mt-3 font-medium tracking-wider">— SITE CONTENT ABOVE —</p>
                      </div>

                      {/* Scaled footer preview - conditioned on previewMode */}
                      {previewMode === 'desktop' ? (
                        <div
                          className="overflow-hidden relative transition-all duration-200"
                          style={{ height: `${Math.round(840 * (previewScale / 100))}px` }}
                        >
                          <div
                            className="pointer-events-none absolute top-0 left-0"
                            style={{
                              width: '1200px',
                              transform: `scale(${previewScale / 100})`,
                              transformOrigin: 'top left',
                            }}
                          >
                            <Footer storeSettings={formData as any} />
                          </div>
                        </div>
                      ) : (
                        /* Mobile phone frame */
                        <div className="flex justify-center py-4 bg-gray-50">
                          <div className="relative" style={{ width: 200 }}>
                            {/* Phone shell */}
                            <div className="relative bg-gray-900 rounded-[28px] p-2 shadow-2xl ring-4 ring-gray-800">
                              {/* Notch */}
                              <div className="absolute top-3 left-1/2 -translate-x-1/2 w-16 h-4 bg-gray-900 rounded-full z-10" />
                              {/* Screen */}
                              <div className="rounded-[22px] overflow-hidden bg-white relative" style={{ height: 500 }}>
                                <div className="absolute inset-0 overflow-y-auto overflow-x-hidden scrollbar-hide">
                                  <div
                                    className="pointer-events-auto"
                                    style={{
                                      width: '375px',
                                      transform: 'scale(0.533)',
                                      transformOrigin: 'top left',
                                    }}
                                  >
                                    <Footer storeSettings={formData as any} />
                                  </div>
                                </div>
                              </div>
                              {/* Home bar */}
                              <div className="flex justify-center mt-1.5">
                                <div className="w-16 h-1 bg-gray-600 rounded-full" />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Upgraded Sticky Save Bar ──────────────────── */}
      <div className="sticky bottom-0 left-0 right-0 z-50 pt-2 pb-1">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.4, ease: 'easeOut' }}
          className="relative overflow-hidden rounded-2xl"
          style={{
            background: 'linear-gradient(135deg, rgba(99,102,241,0.97) 0%, rgba(79,70,229,0.97) 100%)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 -4px 30px rgba(99,102,241,0.35), 0 4px 40px rgba(0,0,0,0.15)',
          }}
        >
          <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/10 blur-xl" />
          <div className="absolute -bottom-8 -left-8 w-28 h-28 rounded-full bg-purple-400/20 blur-xl" />

          <div className="relative z-10 flex items-center justify-between px-8 py-4 gap-4">
            {/* Left — status info */}
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center flex-shrink-0">
                <Save className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-white font-bold text-sm leading-none">Save All Changes</p>
                  {isDirty && changesCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-yellow-400/20 text-yellow-300 text-[10px] font-bold border border-yellow-400/30">
                      {changesCount} {changesCount === 1 ? 'field' : 'fields'} changed
                    </span>
                  )}
                </div>
                <p className="text-indigo-200 text-xs mt-0.5">
                  {lastSavedAt
                    ? `Last saved: ${getRelativeTime(lastSavedAt)}`
                    : isDirty ? 'You have unsaved changes' : 'All changes saved'}
                </p>
              </div>
            </div>

            {/* Right — actions */}
            <div className="flex items-center gap-3">
              {isDirty && (
                <div className="hidden sm:flex items-center gap-1.5 text-indigo-200 text-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
                  Unsaved
                </div>
              )}

              {/* Revert button */}
              {isDirty && (
                <button
                  type="button"
                  onClick={handleRevert}
                  className="px-4 py-2.5 rounded-xl text-white/80 border border-white/20 font-semibold text-sm hover:bg-white/10 transition-all active:scale-95 flex items-center gap-1.5"
                >
                  ↩ Revert
                </button>
              )}

              {/* Discard to server state */}
              <button
                type="button"
                onClick={() => setFormData({
                  storeName: settings?.storeName || 'Ideal Point',
                  tagline: settings?.tagline || 'Fast Food',
                  logo: settings?.logo || '',
                  logoBgColor: settings?.logoBgColor || 'linear-gradient(135deg, #FF9F40 0%, #FFB74D 100%)',
                  logoShape: settings?.logoShape || 'rounded',
                  logoPadding: settings?.logoPadding ?? 0,
                  email: settings?.email || 'admin@idealpoint.com',
                  phone: settings?.phone || '+92 300 1234567',
                  address: settings?.address || '123 Main Street, Karachi, Pakistan',
                  currency: settings?.currency || 'PKR',
                  deliveryFee: settings?.deliveryFee || 150,
                  taxRate: settings?.taxRate || 13,
                  minOrder: settings?.minOrder || 500,
                  openingTime: settings?.openingTime || '10:00',
                  closingTime: settings?.closingTime || '23:00',
                  isStoreOpen: settings?.isStoreOpen ?? true,
                  enableNotifications: settings?.enableNotifications ?? true,
                  autoAcceptOrders: settings?.autoAcceptOrders ?? false,
                  enablePickup: settings?.enablePickup ?? true,
                  footerSettings: settings?.footerSettings || defaultStoreSettings.footerSettings,
                })}
                className="hidden sm:block px-4 py-2.5 rounded-xl text-white/60 font-semibold text-sm hover:text-white/80 transition-all"
              >
                Discard
              </button>

              {/* Save */}
              <motion.button
                onClick={handleSubmit}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                disabled={isSaving}
                className="flex items-center gap-2.5 px-7 py-2.5 rounded-xl font-bold text-sm transition-all disabled:opacity-60 shadow-lg"
                style={{
                  background: 'linear-gradient(135deg, #f59e0b, #f97316)',
                  boxShadow: '0 4px 20px rgba(249,115,22,0.45)',
                  color: '#fff',
                }}
              >
                {isSaving ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
                ) : (
                  <><Save className="w-4 h-4" /> Save Changes</>
                )}
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
