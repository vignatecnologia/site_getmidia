
import React from 'react';
import { MessageCircle } from 'lucide-react';

const WhatsappButton = () => {
    const phoneNumber = "5519998489447";
    const message = encodeURIComponent("Olá! Gostaria de saber mais sobre a GetMídia.");
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;

    return (
        <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="fixed bottom-6 right-6 z-[999] bg-[#25D366] hover:bg-[#20ba56] text-white p-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 flex items-center justify-center group"
            aria-label="Conversar no WhatsApp"
        >
            <MessageCircle className="w-8 h-8" />
            <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs group-hover:ml-2 transition-all duration-500 font-bold uppercase text-xs tracking-wider">
                Fale Conosco
            </span>
        </a>
    );
};

export default WhatsappButton;
