import React, { useState } from "react";
import { motion } from "motion/react";
import {
    Plus,
    Edit2,
    Trash2,
    Eye,
    Search,
    Gift,
    Image as ImageIcon,
    CheckCircle,
    XCircle,
    Clock,
} from "lucide-react";
import { Deal, Banner } from "../../data/mockData";

interface AdminMarketingTabProps {
    deals: Deal[];
    banners: Banner[];
    onUpdateDeal: (dealId: string, dealData: Partial<Deal>) => void;
    onDeleteDeal: (dealId: string) => void;
    onUpdateBanner: (bannerId: string, bannerData: Partial<Banner>) => void;
    onDeleteBanner: (bannerId: string) => void;
    onOpenAddDealModal: () => void;
    onOpenEditDealModal: (deal: Deal) => void;
    onOpenAddBannerModal: () => void;
    onOpenEditBannerModal: (banner: Banner) => void;
    onPreviewBanner: (banner: Banner) => void;
}

export const AdminMarketingTab: React.FC<AdminMarketingTabProps> = ({
    deals,
    banners,
    onUpdateDeal,
    onDeleteDeal,
    onUpdateBanner,
    onDeleteBanner,
    onOpenAddDealModal,
    onOpenEditDealModal,
    onOpenAddBannerModal,
    onOpenEditBannerModal,
    onPreviewBanner,
}) => {
    const [marketingTab, setMarketingTab] = useState<'deals' | 'banners'>('deals');
    const [bannerSearchQuery, setBannerSearchQuery] = useState("");
    const [bannerFilterType, setBannerFilterType] = useState<'all' | 'hero' | 'promo'>('all');
    const [bannerFilterStatus, setBannerFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-black text-gray-900">Marketing & Promotions</h2>
                    <p className="text-gray-600">Manage your banners, deals, and special offers</p>
                </div>

                {marketingTab === 'deals' ? (
                    <motion.button
                        onClick={onOpenAddDealModal}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-6 py-3 rounded-xl font-bold flex items-center gap-2"
                        style={{
                            background: 'linear-gradient(135deg, #EC4899 0%, #DB2777 100%)',
                            color: 'white',
                            boxShadow: '0 4px 16px rgba(236, 72, 153, 0.3)',
                        }}
                    >
                        <Plus className="w-5 h-5" />
                        Add Deal
                    </motion.button>
                ) : (
                    <motion.button
                        onClick={onOpenAddBannerModal}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-6 py-3 rounded-xl font-bold flex items-center gap-2"
                        style={{
                            background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
                            color: 'white',
                            boxShadow: '0 4px 16px rgba(139, 92, 246, 0.3)',
                        }}
                    >
                        <Plus className="w-5 h-5" />
                        Add Banner
                    </motion.button>
                )}
            </div>

            {/* Tabs */}
            <div className="flex gap-2 p-1 rounded-xl bg-white/50 backdrop-blur-sm border border-white/60 w-fit">
                <button
                    onClick={() => setMarketingTab('deals')}
                    className={`px-6 py-2.5 rounded-lg font-bold text-sm transition-all flex items-center gap-2 ${marketingTab === 'deals'
                            ? 'bg-white text-pink-600 shadow-md'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                >
                    <Gift className="w-4 h-4" />
                    Deals & Offers
                </button>
                <button
                    onClick={() => setMarketingTab('banners')}
                    className={`px-6 py-2.5 rounded-lg font-bold text-sm transition-all flex items-center gap-2 ${marketingTab === 'banners'
                            ? 'bg-white text-purple-600 shadow-md'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                >
                    <ImageIcon className="w-4 h-4" />
                    Hero Banners
                </button>
            </div>

            {marketingTab === 'deals' ? (
                // DEALS SECTION
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {deals
                        .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
                        .map(deal => (
                            <div
                                key={deal.id}
                                className={`relative rounded-2xl overflow-hidden group transition-all ${!deal.isActive ? 'opacity-60 grayscale' : ''}`}
                                style={{
                                    background: deal.backgroundColor,
                                    color: deal.textColor || 'white',
                                    minHeight: '180px'
                                }}
                            >
                                <div className="p-6 relative z-10">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex gap-2">
                                            <span className="px-2 py-1 rounded-lg bg-white/20 backdrop-blur-md text-xs font-bold border border-white/30">
                                                {deal.couponCode}
                                            </span>
                                            {!deal.isActive && (
                                                <span className="px-2 py-1 rounded-lg bg-black/40 text-white text-xs font-bold">
                                                    Inactive
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 p-1 rounded-lg backdrop-blur-sm">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onUpdateDeal(deal.id, { isActive: !deal.isActive });
                                                }}
                                                className={`p-1.5 rounded-lg transition-colors ${deal.isActive ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'}`}
                                                title={deal.isActive ? "Deactivate" : "Activate"}
                                            >
                                                {deal.isActive ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                                            </button>

                                            <button
                                                onClick={() => onOpenEditDealModal(deal)}
                                                className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 transition-colors backdrop-blur-md text-white"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    if (window.confirm('Delete this deal?')) onDeleteDeal(deal.id);
                                                }}
                                                className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 transition-colors backdrop-blur-md text-white"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xs font-medium opacity-70 uppercase tracking-wider">
                                            Order: {deal.displayOrder || 0}
                                        </span>
                                        <span className="w-1 h-1 rounded-full bg-white/40"></span>
                                        <span className="text-xs font-medium opacity-70 uppercase tracking-wider">
                                            {deal.template ? deal.template.replace('_', ' ') : 'Default'}
                                        </span>
                                    </div>

                                    <h3 className="text-2xl font-black mb-1 leading-tight">{deal.title}</h3>
                                    <p className="opacity-90 text-sm mb-4 line-clamp-2">{deal.description}</p>

                                    <div className="flex items-center gap-2 text-xs font-bold opacity-80">
                                        <Clock className="w-3 h-3" />
                                        Expires: {new Date(deal.endDate).toLocaleDateString()}
                                    </div>
                                </div>
                                <div className="absolute -bottom-10 -right-10 w-32 h-32 rounded-full bg-white/10 blur-2xl" />
                            </div>
                        ))}
                </div>
            ) : (
                // BANNERS SECTION
                <div className="space-y-6">
                    {/* Banner Statistics */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-white rounded-xl p-4 border border-gray-200">
                            <div className="text-sm text-gray-500 font-medium mb-1">Total Banners</div>
                            <div className="text-2xl font-black text-gray-900">{banners.length}</div>
                        </div>
                        <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
                            <div className="text-sm text-purple-600 font-medium mb-1">Hero Banners</div>
                            <div className="text-2xl font-black text-purple-700">
                                {banners.filter(b => b.type === 'hero').length}
                            </div>
                            <div className="text-xs text-purple-500 mt-1">
                                {banners.filter(b => b.type === 'hero' && b.isActive).length} active
                            </div>
                        </div>
                        <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
                            <div className="text-sm text-orange-600 font-medium mb-1">Promo Banners</div>
                            <div className="text-2xl font-black text-orange-700">
                                {banners.filter(b => b.type === 'promo').length}
                            </div>
                            <div className="text-xs text-orange-500 mt-1">
                                {banners.filter(b => b.type === 'promo' && b.isActive).length} active
                            </div>
                        </div>
                        <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                            <div className="text-sm text-green-600 font-medium mb-1">Active Banners</div>
                            <div className="text-2xl font-black text-green-700">
                                {banners.filter(b => b.isActive).length}
                            </div>
                            <div className="text-xs text-green-500 mt-1">
                                {banners.filter(b => !b.isActive).length} inactive
                            </div>
                        </div>
                    </div>

                    {/* Filters and Search */}
                    <div className="flex flex-wrap gap-4 items-center">
                        <div className="flex-1 min-w-[200px] relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                value={bannerSearchQuery}
                                onChange={(e) => setBannerSearchQuery(e.target.value)}
                                placeholder="Search banners..."
                                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 outline-none transition-all bg-white"
                            />
                        </div>

                        <div className="flex gap-2 p-1 rounded-xl bg-white border border-gray-200">
                            {(['all', 'hero', 'promo'] as const).map(type => (
                                <button
                                    key={type}
                                    onClick={() => setBannerFilterType(type)}
                                    className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${bannerFilterType === type
                                            ? 'bg-purple-500 text-white'
                                            : 'text-gray-600 hover:bg-gray-100'
                                        }`}
                                >
                                    {type === 'all' ? 'All Types' : type.charAt(0).toUpperCase() + type.slice(1)}
                                </button>
                            ))}
                        </div>

                        <div className="flex gap-2 p-1 rounded-xl bg-white border border-gray-200">
                            {(['all', 'active', 'inactive'] as const).map(status => (
                                <button
                                    key={status}
                                    onClick={() => setBannerFilterStatus(status)}
                                    className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${bannerFilterStatus === status
                                            ? (status === 'inactive' ? 'bg-gray-500 text-white' : 'bg-green-500 text-white')
                                            : 'text-gray-600 hover:bg-gray-100'
                                        }`}
                                >
                                    {status.charAt(0).toUpperCase() + status.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Filtered Banners */}
                    {(() => {
                        const filteredBanners = banners
                            .filter(banner => {
                                if (bannerFilterType !== 'all' && banner.type !== bannerFilterType) return false;
                                if (bannerFilterStatus === 'active' && !banner.isActive) return false;
                                if (bannerFilterStatus === 'inactive' && banner.isActive) return false;
                                if (bannerSearchQuery) {
                                    const query = bannerSearchQuery.toLowerCase();
                                    return (
                                        banner.title?.toLowerCase().includes(query) ||
                                        banner.subtitle?.toLowerCase().includes(query) ||
                                        banner.description?.toLowerCase().includes(query)
                                    );
                                }
                                return true;
                            })
                            .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

                        if (filteredBanners.length === 0) {
                            return (
                                <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
                                    <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                    <p className="text-gray-500 font-bold text-lg">No banners found</p>
                                    <p className="text-gray-400 text-sm mt-2">Try adjusting your filters</p>
                                </div>
                            );
                        }

                        return (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {filteredBanners.map(banner => (
                                    <div
                                        key={banner.id}
                                        className={`relative rounded-2xl overflow-hidden group shadow-lg transition-all ${!banner.isActive ? 'opacity-60 grayscale' : ''
                                            }`}
                                    >
                                        <div className="relative aspect-[21/9]">
                                            <img
                                                src={banner.image}
                                                alt={banner.title}
                                                className="w-full h-full object-cover"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent flex flex-col justify-center p-6">
                                                <div className="max-w-md text-white">
                                                    <h3 className="text-2xl font-black mb-1">{banner.title}</h3>
                                                    {banner.subtitle && (
                                                        <p className="text-lg opacity-90 mb-2">{banner.subtitle}</p>
                                                    )}
                                                    {banner.buttonText && (
                                                        <span className="px-4 py-2 rounded-full bg-white/20 backdrop-blur-md border border-white/30 font-bold text-sm inline-block">
                                                            {banner.buttonText}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Banner Info Badge */}
                                            <div className="absolute top-4 left-4 flex flex-col gap-2">
                                                <span className={`px-3 py-1 rounded-lg text-xs font-bold backdrop-blur-md border ${banner.type === 'hero'
                                                        ? 'bg-purple-500/80 text-white border-purple-400/50'
                                                        : 'bg-orange-500/80 text-white border-orange-400/50'
                                                    }`}>
                                                    {banner.type === 'hero' ? '🏠 Hero' : '📢 Promo'}
                                                </span>
                                                <span className={`px-3 py-1 rounded-lg text-xs font-bold backdrop-blur-md border ${banner.isActive
                                                        ? 'bg-green-500/80 text-white border-green-400/50'
                                                        : 'bg-gray-500/80 text-white border-gray-400/50'
                                                    }`}>
                                                    {banner.isActive ? '✓ Active' : '✗ Inactive'}
                                                </span>
                                                {banner.displayOrder && (
                                                    <span className="px-3 py-1 rounded-lg text-xs font-bold backdrop-blur-md bg-blue-500/80 text-white border border-blue-400/50">
                                                        Order: {banner.displayOrder}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Display Location Info */}
                                            <div className="absolute bottom-4 left-4 right-4">
                                                <div className="bg-black/60 backdrop-blur-md rounded-lg p-3 border border-white/20">
                                                    <p className="text-white text-xs font-bold mb-1">📍 Display Location:</p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {banner.type === 'hero' ? (
                                                            <>
                                                                <span className="px-2 py-1 rounded bg-white/20 text-white text-xs font-bold">Mobile Home</span>
                                                                <span className="px-2 py-1 rounded bg-white/20 text-white text-xs font-bold">Desktop Home</span>
                                                            </>
                                                        ) : (
                                                            <span className="px-2 py-1 rounded bg-white/20 text-white text-xs font-bold">Desktop Only</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => onPreviewBanner(banner)}
                                                    className="p-2 rounded-xl bg-blue-500/80 hover:bg-blue-500 backdrop-blur-md text-white transition-colors"
                                                    title="Preview"
                                                >
                                                    <Eye className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => onOpenEditBannerModal(banner)}
                                                    className="p-2 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-md text-white transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit2 className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onUpdateBanner(banner.id, { isActive: !banner.isActive });
                                                    }}
                                                    className={`p-2 rounded-xl backdrop-blur-md text-white transition-colors ${banner.isActive
                                                            ? 'bg-green-500/80 hover:bg-green-500'
                                                            : 'bg-gray-500/80 hover:bg-gray-500'
                                                        }`}
                                                    title={banner.isActive ? "Deactivate" : "Activate"}
                                                >
                                                    {banner.isActive ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        if (window.confirm('Delete this banner?')) onDeleteBanner(banner.id);
                                                    }}
                                                    className="p-2 rounded-xl bg-red-500/80 hover:bg-red-500 backdrop-blur-md text-white transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        );
                    })()}
                </div>
            )}
        </div>
    );
};
