import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Wifi } from 'lucide-react';
import { translations, Language } from '../lib/i18n';

interface InfoCardProps {
  lang: Language;
  qrLink: string;
  wifiLogin: string;
  wifiPassword: string;
}

export const InfoCard: React.FC<InfoCardProps> = ({ lang, qrLink, wifiLogin, wifiPassword }) => {
  const t = translations[lang];

  return (
    <div className="w-full max-w-[480px] h-full bg-white rounded-[40px] p-6 lg:p-10 flex flex-col items-center justify-between text-center card-shadow border-4 border-white transition-all overflow-hidden flex-shrink-0">
      <div className="flex-1 min-h-0 flex flex-col items-center justify-center w-full">
        <div className="relative p-6 bg-white rounded-3xl shadow-[0_5px_20px_rgba(0,0,0,0.05)] border border-gray-100 mb-6 mx-auto shrink min-h-0 flex items-center justify-center aspect-square max-h-[220px] mt-auto">
          {qrLink ? (
            <QRCodeSVG
              value={qrLink}
              size={180}
              level="H"
              includeMargin={false}
              fgColor="#2D3748"
              style={{ width: '100%', height: '100%' }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 aspect-square">
              <p className="text-gray-400 text-[10px] px-6 italic uppercase font-bold">{t.qrNotFound}</p>
            </div>
          )}
        </div>

        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest max-w-[280px] leading-relaxed shrink-0 mb-auto">
          {t.scanQr}
        </p>
      </div>

      {/* Wi-Fi Info */}
      {(wifiLogin || wifiPassword) && (
        <div className="w-full flex flex-col gap-3 mt-4 border-t border-gray-100 pt-6 shrink-0 pb-2">
          <div className="flex items-center justify-center gap-2 text-[#0A3C43]">
            <Wifi className="w-5 h-5 shrink-0" />
            <span className="font-bold text-xs uppercase tracking-widest leading-none">{t.wifiDetails}</span>
          </div>
          <div className="bg-gray-50 rounded-2xl p-4 flex flex-col gap-2.5">
            {wifiLogin && (
              <div className="flex justify-between items-center text-sm gap-4">
                <span className="text-gray-500 font-medium shrink-0">{t.wifiName}:</span>
                <span className="font-bold text-[#2D3748] truncate text-right">{wifiLogin}</span>
              </div>
            )}
            {wifiPassword && (
              <div className="flex justify-between items-center text-sm gap-4">
                <span className="text-gray-500 font-medium shrink-0">{t.wifiPasswordText}:</span>
                <span className="font-bold text-[#2D3748] truncate text-right">{wifiPassword}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
