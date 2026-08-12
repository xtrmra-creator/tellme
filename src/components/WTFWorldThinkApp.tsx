// @ts-nocheck
'use client';

import { useState, useEffect } from 'react';
import { t } from '@/lib/i18n';

export default function WTFWorldThinkApp({ initialChoice = 'date' }) {
  const [country, setCountry] = useState('USA');
  const [day, setDay] = useState(12);
  const [month, setMonth] = useState(8);
  const [year, setYear] = useState(2026);
  const [emailInput, setEmailInput] = useState('');
  
  // Kullanıcının sosyal medya adı / künye imzası için state
  const [userHandle, setUserHandle] = useState('@seferkayis');
  
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [showBadge, setShowBadge] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');

  const [predictionCount, setPredictionCount] = useState(24891);

  useEffect(() => {
    const countInterval = setInterval(() => {
      if (Math.random() > 0.6) {
        setPredictionCount(prev => prev + Math.floor(Math.random() * 3) + 1);
      }
    }, 3000);
    return () => clearInterval(countInterval);
  }, []);

  const spinWheel = (setter, current, min, max, direction) => {
    let newVal = current + direction;
    if (newVal > max) newVal = min;
    if (newVal < min) newVal = max;
    setter(newVal);
  };

  // İsyankar Buton: Hangi kararla geldiyse o künyeyi açar
  const handleRebelAction = () => {
    setRegisteredEmail('baban@gmail.com');
    setShowBadge(true);
  };

  const handleAuthAction = () => {
    const emailToUse = emailInput.trim() || 'baban@gmail.com';
    setRegisteredEmail(emailToUse);
    setIsUnlocked(true);
    setShowBadge(true);
  };

  const stats = [
    { code: '🇺🇸', name: 'USA', red: 64, green: 36 },
    { code: '🇹🇷', name: 'TÜRKİYE', red: 82, green: 18 },
    { code: '🇷🇺', name: 'RUSSIA', red: 75, green: 25 },
    { code: '🇩🇪', name: 'GERMANY', red: 45, green: 55 },
    { code: '🇫🇷', name: 'FRANCE', red: 52, green: 48 },
    { code: '🇬🇧', name: 'UK', red: 58, green: 42 },
    { code: '🇨🇳', name: 'CHINA', red: 70, green: 30 },
    { code: '🇺🇦', name: 'UKRAINE', red: 91, green: 9 },
  ];

  // Hangi butondan geldiğine göre künye karar metni
  const decisionText = initialChoice === 'nowar' 
    ? { label: t('worldThink.decisionPeace'), color: 'text-emerald-400' }
    : { label: t('worldThink.decisionWar'), color: 'text-red-500' };

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col gap-6 relative">
      
      {/* TAHMİN KÜNYESİ MODALI (SOSYAL MEDYA PAYLAŞIM KARTI) */}
      {showBadge && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="relative w-full max-w-md bg-[#0a0a0a] border border-amber-500/50 p-8 shadow-[0_0_50px_rgba(245,158,11,0.2)] flex flex-col items-center text-center">
            
            <button 
              onClick={() => setShowBadge(false)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-white font-mono text-xs"
            >
              {t('worldThink.close')}
            </button>

            <span className="text-[10px] font-mono text-amber-500 tracking-[0.3em] uppercase mb-1">{t('worldThink.eyebrow')}</span>
            <h3 className="text-2xl font-black text-white italic tracking-tighter mb-4">{t('worldThink.sealed')}</h3>

            {/* KÜNYE ÜSTÜNE İMZA GİRİŞ KUTUSU */}
            <div className="w-full mb-4 text-left">
              <label className="text-[9px] font-mono text-zinc-400 uppercase tracking-widest block mb-1">
                {t('worldThink.handleLabel')}
              </label>
              <input 
                type="text" 
                value={userHandle}
                onChange={(e) => setUserHandle(e.target.value)}
                placeholder={t('worldThink.handlePlaceholder')}
                className="w-full bg-black border border-amber-500/40 text-amber-400 px-3 py-2 text-xs font-mono outline-none focus:border-amber-400"
              />
            </div>

            {/* Künye Kartı Önizlemesi */}
            <div className="w-full bg-black border border-zinc-800 p-6 space-y-4 mb-6 text-left font-mono">
              <div className="flex justify-between text-xs text-zinc-400 border-b border-zinc-900 pb-2">
                <span>{t('worldThink.signature')}</span>
                <span className="text-amber-400 font-bold">{userHandle || t('worldThink.anon')}</span>
              </div>
              <div className="flex justify-between text-xs text-zinc-400 border-b border-zinc-900 pb-2">
                <span>{t('worldThink.location')}</span>
                <span className="text-white">{country}</span>
              </div>
              <div className="flex justify-between text-xs text-zinc-400 border-b border-zinc-900 pb-2">
                <span>{t('worldThink.markedDate')}</span>
                <span className="text-white">{String(day).padStart(2, '0')}.{String(month).padStart(2, '0')}.{year}</span>
              </div>
              <div className="flex justify-between text-xs text-zinc-400">
                <span>{t('worldThink.systemDecision')}</span>
                <span className={`${decisionText.color} font-bold`}>{decisionText.label}</span>
              </div>
            </div>

            <p className="text-[11px] text-zinc-400 mb-6 font-light">
              {t('worldThink.sealedFor', { handle: userHandle || t('worldThink.anon') })}
            </p>

            <button 
              onClick={() => alert(t('worldThink.copied'))}
              className="w-full bg-amber-500 hover:bg-amber-400 text-black py-3 text-xs font-bold tracking-widest uppercase transition-colors"
            >
              {t('worldThink.shareCta')}
            </button>
          </div>
        </div>
      )}

      {/* ANA PANEL */}
      <div className="flex flex-col md:flex-row gap-8 p-8 border border-zinc-800 bg-zinc-900/30 items-center">
        
        {/* SOL: SEÇİM ALANI */}
        <div className="flex-1 w-full space-y-6">
          <label className="text-[9px] uppercase tracking-widest text-zinc-500 font-mono">{t('worldThink.selectNationality')}</label>
          <select 
            value={country} 
            onChange={(e) => setCountry(e.target.value)}
            className="w-full bg-black border border-zinc-700 text-white p-3 outline-none focus:border-amber-500 uppercase tracking-widest text-xs font-mono"
          >
            <option>USA</option>
            <option>TÜRKİYE</option>
            <option>GERMANY</option>
            <option>RUSSIA</option>
            <option>FRANCE</option>
            <option>UK</option>
          </select>

          <div className="flex gap-4">
            {[
              { key: 'day', label: t('worldThink.day'), setter: setDay, value: day, max: 31 },
              { key: 'month', label: t('worldThink.month'), setter: setMonth, value: month, max: 12 },
              { key: 'year', label: t('worldThink.year'), setter: setYear, value: year, max: 2040 },
            ].map((item) => (
              <div key={item.key} className="flex-1 flex flex-col items-center">
                <span className="text-[8px] text-zinc-600 mb-2">{item.label}</span>
                <div className="relative w-full bg-black border border-zinc-800 h-16 flex items-center justify-center overflow-hidden">
                  <button onClick={() => spinWheel(item.setter, item.value, 1, item.max, -1)} className="absolute top-0 w-full text-zinc-700 hover:text-amber-500">▲</button>
                  <span className="text-lg font-mono text-white">{item.value.toString().padStart(2, '0')}</span>
                  <button onClick={() => spinWheel(item.setter, item.value, 1, item.max, 1)} className="absolute bottom-0 w-full text-zinc-700 hover:text-amber-500">▼</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SAĞ: ÖZET */}
        <div className="flex-1 border-l border-zinc-800 pl-8">
          <h2 className="text-2xl font-light text-white mb-2 leading-tight">
            {t('worldThink.peopleThink', { country })}
          </h2>
          <p className="text-zinc-500 text-[11px] leading-relaxed font-light">
            {t('worldThink.readyHint')}
          </p>
        </div>
      </div>

      {/* HOOK PANELİ */}
      <div className="relative p-6 border border-zinc-800 bg-zinc-900/10 overflow-hidden">
        
        {/* BLUR PERDESİ */}
        {!isUnlocked && (
          <div className="absolute inset-0 backdrop-blur-[3px] bg-black/80 flex flex-col items-center justify-center z-10 p-6 text-center">
            
            {/* İSYANKAR BUTON (Sadece künye açar, bluru kaldırmaz) */}
            <button 
              onClick={handleRebelAction}
              className="w-full max-w-sm mb-5 bg-[#b55500] hover:bg-[#c95f00] text-white py-3 px-4 text-[11px] font-bold uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer border border-amber-600/40"
            >
              <span>{t('worldThink.rebelCta')}</span>
            </button>

            <span className="text-zinc-400 text-[10px] tracking-widest uppercase mb-3 font-mono">
              {t('worldThink.orConnect')}
            </span>
            
            {/* MANUEL MAİL GİRİŞİ + "GÖR" */}
            <div className="w-full max-w-sm mb-2 flex gap-2">
              <input 
                type="email" 
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck="false"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder={t('worldThink.emailPlaceholder')}
                className="flex-1 bg-black/60 border border-zinc-700 text-white p-3 text-[10px] tracking-widest placeholder:text-zinc-600 focus:border-amber-500 outline-none transition-colors lowercase"
              />
              <button 
                onClick={handleAuthAction}
                className="bg-zinc-800 hover:bg-zinc-700 text-white px-4 text-[10px] font-bold uppercase tracking-widest border border-zinc-700 transition-colors"
              >
                {t('worldThink.view')}
              </button>
            </div>

            <p className="text-[9px] text-zinc-500 mb-4 max-w-xs font-mono">
              {t('worldThink.emailNote')}
            </p>

            <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm mb-4">
              {/* Google */}
              <button 
                onClick={handleAuthAction}
                className="flex-1 bg-white text-black py-2.5 px-4 text-[10px] font-bold uppercase tracking-wider hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24"><path fill="currentColor" d="M12.24 10.285V13.5h6.806c-.275 1.765-2.056 5.174-6.806 5.174-4.095 0-7.439-3.389-7.439-7.574s3.344-7.574 7.439-7.574c2.33 0 3.891.989 4.785 1.849l3.254-3.138C18.189 1.186 15.479 0 12.24 0 5.48 0 0 5.48 0 12.24s5.48 12.24 12.24 12.24c7.058 0 11.733-4.96 11.733-11.96 0-.828-.086-1.46-.19-2.235H12.24z"/></svg>
                {t('worldThink.google')}
              </button>
              {/* Apple */}
              <button 
                onClick={handleAuthAction}
                className="flex-1 bg-zinc-800 text-white py-2.5 px-4 text-[10px] font-bold uppercase tracking-wider hover:bg-zinc-700 transition-colors flex items-center justify-center gap-2 border border-zinc-700"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 5.35c.57-.69.96-1.65.85-2.61-.84.04-1.85.56-2.44 1.25-.53.61-.99 1.59-.86 2.55 0 .02.04.04.07.04.81 0 1.83-.56 2.38-1.23z"/></svg>
                {t('worldThink.apple')}
              </button>
            </div>

            {/* CANLI SAYAÇ */}
            <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-400 border border-zinc-800 bg-black/60 px-4 py-1.5 rounded-full">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>{t('worldThink.liveCount', { count: predictionCount.toLocaleString('en-US') })}</span>
            </div>

          </div>
        )}
        
        {/* Altındaki Kırmızı & Yeşil Bar Savaşları */}
        <div className={`select-none space-y-4 font-mono text-xs transition-opacity duration-500 ${isUnlocked ? 'opacity-100' : 'opacity-40'}`}>
          {stats.map((item, idx) => (
            <div key={idx}>
              <div className="flex justify-between mb-1 text-zinc-400 text-[10px]">
                <span>{item.code} {item.name}: %{item.red} {t('worldThink.statWar')}</span>
                <span className="text-emerald-400">%{item.green} {t('worldThink.statPeace')}</span>
              </div>
              <div className="w-full h-2 bg-zinc-800 flex overflow-hidden">
                <div style={{ width: `${item.red}%` }} className="bg-red-600 transition-all duration-500"></div>
                <div style={{ width: `${item.green}%` }} className="bg-emerald-500 transition-all duration-500"></div>
              </div>
            </div>
          ))}
        </div>

      </div>

    </div>
  );
}