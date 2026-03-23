import React from 'react';
import { MessageCircle } from 'lucide-react';

const WhatsAppFloat: React.FC = () => {
    const phoneNumber = '919711108615';
    const message = 'Hello! I would like to know more about Survey Panel Go.';

    const handleClick = () => {
        const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank', 'noopener,noreferrer');
    };

    return (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[9999]">
            <button
                onClick={handleClick}
                className="group relative flex items-center gap-3"
                aria-label="Chat with us on WhatsApp"
            >
                {/* Chat Bubble Tooltip */}
                <div className="absolute right-full mr-2 sm:mr-4 bg-white border-2 border-navy px-3 py-1 sm:px-4 sm:py-2 rounded-2xl shadow-hard-sm opacity-0 group-hover:opacity-100 translate-x-2 sm:translate-x-4 group-hover:translate-x-0 transition-all duration-300 pointer-events-none whitespace-nowrap max-w-[200px] sm:max-w-none">
                    <p className="font-outfit font-bold text-navy text-xs sm:text-sm">Chat with us! 👋</p>
                </div>

                {/* Floating Button */}
                <div className="relative w-12 h-12 sm:w-16 sm:h-16 bg-[#25D366] border-2 border-navy rounded-full shadow-hard transition-all duration-300 transform group-hover:-translate-y-1 group-hover:shadow-hard-lg active:translate-y-0 active:shadow-hard flex items-center justify-center overflow-hidden">
                    <MessageCircle className="w-6 h-6 sm:w-8 sm:h-8 text-white" />

                    {/* Shine effect */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent translate-y-full group-hover:translate-y-[-100%] transition-transform duration-1000" />
                </div>

                {/* Animated pulse rings */}
                <div className="absolute inset-0 z-[-1]">
                    <div className="absolute inset-0 bg-[#25D366] rounded-full animate-ping opacity-20 scale-125" />
                    <div className="absolute inset-0 bg-[#25D366] rounded-full animate-ping opacity-10 scale-150 animation-delay-300" />
                </div>
            </button>
        </div>
    );
};

export default WhatsAppFloat;
