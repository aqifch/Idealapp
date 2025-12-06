import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Zap, Clock, Copy, Check } from "lucide-react";
import { Deal } from "../data/mockData";
import { toast } from "sonner@2.0.3";

interface FlashSaleCardProps {
  deal?: Deal;
  onDealClick?: (deal: Deal) => void;
}

export const FlashSaleCard = ({ deal, onDealClick }: FlashSaleCardProps) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!deal?.endDate) return;

    const calculateTimeLeft = () => {
      const difference = +new Date(deal.endDate) - +new Date();
      
      if (difference > 0) {
        return {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        };
      }
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [deal?.endDate]);

  const handleCopyCode = () => {
    if (deal?.couponCode) {
      // Try modern API first
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(deal.couponCode)
          .then(() => {
            setCopied(true);
            toast.success("Coupon code copied! 🎟️");
            setTimeout(() => setCopied(false), 2000);
          })
          .catch((err) => {
             // Fallback for restricted environments (like iframe) without logging error to console
             fallbackCopyTextToClipboard(deal.couponCode);
          });
      } else {
        // Direct fallback
        fallbackCopyTextToClipboard(deal.couponCode);
      }
    }
  };

  const fallbackCopyTextToClipboard = (text: string) => {
    try {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      
      // Avoid scrolling to bottom
      textArea.style.top = "0";
      textArea.style.left = "0";
      textArea.style.position = "fixed";
      
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      
      if (successful) {
        setCopied(true);
        toast.success("Coupon code copied! 🎟️");
        setTimeout(() => setCopied(false), 2000);
      } else {
        toast.error("Could not copy code. Please copy manually.");
      }
    } catch (err) {
      toast.error("Could not copy code. Please copy manually.");
    }
  };

  if (!deal) return null;

  return (
    <div className="px-4 lg:px-0 mt-8 mb-12 max-w-7xl mx-auto">
      <motion.div 
        onClick={() => deal && onDealClick?.(deal)}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="relative overflow-hidden rounded-3xl shadow-2xl cursor-pointer hover:scale-[1.01] transition-transform"
        style={{
          background: deal.backgroundColor || 'linear-gradient(135deg, #FF6B35 0%, #FF8C61 100%)',
          color: deal.textColor || 'white',
          boxShadow: `0 20px 40px -10px ${deal.backgroundColor}50`
        }}
      >
        {/* Background Pattern */}
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-white/10 rounded-full blur-3xl transform rotate-45 pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-black/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 p-8 lg:p-12 items-center">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <span className="px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-sm font-bold flex items-center gap-2 border border-white/20 shadow-sm">
                <Zap className="w-4 h-4 text-yellow-300" fill="currentColor" />
                FLASH SALE
              </span>
              <span className="text-sm font-medium opacity-90 flex items-center gap-1">
                <Clock className="w-4 h-4" />
                Limited Time Offer
              </span>
            </div>
            
            <div>
              <h2 className="text-4xl lg:text-6xl font-black mb-4 leading-tight tracking-tight">
                {deal.title}
              </h2>
              <p className="text-lg lg:text-xl font-medium opacity-90 max-w-md leading-relaxed">
                {deal.description}
              </p>
            </div>
            
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                {timeLeft.days > 0 && (
                  <>
                    <div className="flex flex-col items-center bg-black/20 backdrop-blur-md rounded-xl w-16 py-3 border border-white/10">
                      <span className="font-black text-2xl leading-none">{String(timeLeft.days).padStart(2, '0')}</span>
                      <span className="text-[10px] opacity-70 uppercase font-bold mt-1">Days</span>
                    </div>
                    <span className="font-black text-2xl opacity-50">:</span>
                  </>
                )}
                <div className="flex flex-col items-center bg-black/20 backdrop-blur-md rounded-xl w-16 py-3 border border-white/10">
                  <span className="font-black text-2xl leading-none">{String(timeLeft.hours).padStart(2, '0')}</span>
                  <span className="text-[10px] opacity-70 uppercase font-bold mt-1">Hrs</span>
                </div>
                <span className="font-black text-2xl opacity-50">:</span>
                <div className="flex flex-col items-center bg-black/20 backdrop-blur-md rounded-xl w-16 py-3 border border-white/10">
                  <span className="font-black text-2xl leading-none">{String(timeLeft.minutes).padStart(2, '0')}</span>
                  <span className="text-[10px] opacity-70 uppercase font-bold mt-1">Min</span>
                </div>
                <span className="font-black text-2xl opacity-50">:</span>
                <div className="flex flex-col items-center bg-white text-red-600 rounded-xl w-16 py-3 shadow-lg">
                  <span className="font-black text-2xl leading-none">{String(timeLeft.seconds).padStart(2, '0')}</span>
                  <span className="text-[10px] text-red-600/60 uppercase font-bold mt-1">Sec</span>
                </div>
              </div>
            </div>

            {deal.couponCode && (
              <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-md p-2 pr-4 rounded-xl border border-white/20 border-dashed">
                <div className="px-3 py-1 rounded-lg bg-white text-gray-900 font-black tracking-widest">
                  {deal.couponCode}
                </div>
                <span className="text-sm font-medium">Use this code at checkout</span>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCopyCode();
                  }}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors ml-2"
                  title="Copy Code"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            )}
          </div>

          <div className="hidden lg:block relative h-full min-h-[300px] flex items-center justify-center">
             <motion.div
               animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
               transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
               className="relative z-10 w-full max-w-md aspect-square"
             >
               <img 
                 src={deal.image} 
                 alt={deal.title} 
                 className="w-full h-full object-cover rounded-full border-8 border-white/20 shadow-2xl"
               />
               <div className="absolute -bottom-6 -right-6 bg-white text-gray-900 px-6 py-4 rounded-2xl shadow-xl transform -rotate-6">
                 <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Discount</p>
                 <p className="text-4xl font-black text-red-600">{deal.discountPercentage}% OFF</p>
               </div>
             </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
