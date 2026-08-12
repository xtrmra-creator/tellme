export default function MirrorIcon({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="1.2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={`${className} text-amber-500`}
    >
      {/* Klasik El Aynası Dış Çerçevesi (Barok Hatlar) */}
      <path d="M12 2C8 2 6 5 6 9c0 3 1.5 5 3 6v4a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2v-4c1.5-1 3-3 3-6 0-4-2-7-6-7z" />
      
      {/* Aynanın Sap Kısmı */}
      <line x1="12" y1="19" x2="12" y2="22" />
      
      {/* Aynanın İçine Gömülü Dünya Küresi */}
      <circle cx="12" cy="9" r="3.5" className="fill-zinc-900/90" />
      {/* Dünya Enlem ve Boylam Çizgileri */}
      <path d="M8.5 9h7" strokeWidth="0.8" />
      <path d="M12 5.5v7" strokeWidth="0.8" />
      <path d="M9.5 6.5c1 1 1 3 0 5" strokeWidth="0.7" />
      <path d="M14.5 6.5c-1 1-1 3 0 5" strokeWidth="0.7" />
    </svg>
  );
}