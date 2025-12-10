import React from "react";
import { motion } from "motion/react";
import { Deal } from "../data/mockData";
import { Tag, Clock, Copy } from "lucide-react";
import { toast } from "sonner";

interface DesktopDealsSectionProps {
  deals: Deal[];
  onDealClick?: (deal: Deal) => void;
}

export const DesktopDealsSection = ({ deals, onDealClick }: DesktopDealsSectionProps) => {
  if (!deals || deals.length === 0) return null;

  const fallbackCopyTextToClipboard = (text: string) => {
    try {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.top = "0";
      textArea.style.left = "0";
      textArea.style.position = "fixed";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      if (successful) {
        toast.success(`Coupon code ${text} copied! 🎟️`);
      } else {
        toast.error("Could not copy code manually.");
      }
    } catch (err) {
      toast.error("Could not copy code manually.");
    }
  };

  const handleCopyCode = (code: string) => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(code)
        .then(() => {
          toast.success(`Coupon code ${code} copied! 🎟️`);
        })
        .catch(() => {
           fallbackCopyTextToClipboard(code);
        });
    } else {
      fallbackCopyTextToClipboard(code);
    }
  };

  return (
    <div className="w-full py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            Exclusive Offers
            <Tag className="w-6 h-6 text-orange-500" />
          </h2>
          <p className="text-gray-600">Grab these limited-time deals before they expire!</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6">
        {deals.map((deal, index) => {
          // Determine column span based on template
          const isMinimal = deal.template === 'minimal_list';
          const colSpan = isMinimal ? "lg:col-span-4" : "lg:col-span-6";

          return (
            <motion.div
              key={deal.id}
              onClick={() => onDealClick?.(deal)}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`relative overflow-hidden rounded-3xl group cursor-pointer shadow-lg ${colSpan}`}
              style={{
                background: deal.backgroundColor || '#FF9F40',
                color: deal.textColor || 'white',
                height: isMinimal ? '200px' : '260px',
              }}
            >
              {isMinimal ? (
                // Minimal List Template
                <div className="flex h-full">
                   <div className="w-2/5 relative overflow-hidden">
                      <img 
                        src={deal.image} 
                        alt={deal.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-black/10 to-transparent" />
                   </div>
                   <div className="w-3/5 p-5 flex flex-col justify-between" style={{ color: 'inherit' }}>
                      <div>
                         <span 
                           className="inline-block px-2 py-0.5 rounded backdrop-blur-md text-[10px] font-bold border mb-2"
                           style={{ 
                             background: 'rgba(255,255,255,0.2)', 
                             borderColor: 'rgba(255,255,255,0.2)' 
                           }}
                         >
                            {deal.discountPercentage}% OFF
                         </span>
                         <h3 className="text-lg font-black leading-tight mb-1 line-clamp-2">
                            {deal.title}
                         </h3>
                         <p className="text-xs font-medium opacity-80 line-clamp-2">
                            {deal.description}
                         </p>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <div 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopyCode(deal.couponCode);
                          }}
                          className="px-2 py-1 rounded border border-dashed flex items-center gap-2 transition-colors hover:bg-white/10"
                          style={{ 
                            background: 'rgba(255,255,255,0.1)', 
                            borderColor: 'rgba(255,255,255,0.2)' 
                          }}
                        >
                           <span className="font-mono font-black text-xs">{deal.couponCode}</span>
                           <Copy className="w-3 h-3" />
                        </div>
                      </div>
                   </div>
                </div>
              ) : (
                // Featured Grid Template (Original)
                <div className="absolute inset-0 flex items-center">
                  <div className="w-1/2 p-8 z-10 flex flex-col justify-center h-full" style={{ color: 'inherit' }}>
                    <div className="mb-auto">
                      <span 
                        className="inline-block px-3 py-1 rounded-lg backdrop-blur-md text-xs font-bold border mb-3"
                        style={{ 
                          background: 'rgba(255,255,255,0.2)', 
                          borderColor: 'rgba(255,255,255,0.2)' 
                        }}
                      >
                        {deal.discountPercentage}% OFF
                      </span>
                      <h3 className="text-2xl font-black leading-tight mb-2 line-clamp-2">
                        {deal.title}
                      </h3>
                      <p className="text-sm font-medium opacity-90 line-clamp-2 mb-4">
                        {deal.description}
                      </p>
                    </div>

                    <div className="space-y-3">
                      <div 
                        onClick={(e) => {
                            e.stopPropagation();
                            handleCopyCode(deal.couponCode);
                        }}
                        className="inline-flex items-center gap-3 transition-colors p-1 pr-3 rounded-lg border border-dashed cursor-pointer group/btn hover:bg-white/10"
                        style={{ 
                          background: 'rgba(255,255,255,0.1)', 
                          borderColor: 'rgba(255,255,255,0.2)' 
                        }}
                      >
                        <div className="px-2 py-1 rounded bg-white text-gray-900 font-black text-xs tracking-wider">
                          {deal.couponCode}
                        </div>
                        <span className="text-xs font-bold">Copy Code</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-xs font-medium opacity-75">
                        <Clock className="w-3 h-3" />
                        Valid until {new Date(deal.endDate).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <div className="w-1/2 h-full relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent z-10" />
                    <img 
                      src={deal.image} 
                      alt={deal.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
