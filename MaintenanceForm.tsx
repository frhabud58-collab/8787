import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { DeviceType, UrgencyType, MaintenanceRequest } from '../types';
import { Smartphone, Headphones, Zap, Tablet, Upload, X, CheckCircle, AlertTriangle, Calendar, Clock, Wrench } from 'lucide-react';
import { motion } from 'motion/react';

interface MaintenanceFormProps {
  storeId: string;
  onComplete?: () => void;
}

const loadRequests = (): MaintenanceRequest[] => {
  try { return JSON.parse(localStorage.getItem('mix_maintenance_requests') || '[]'); }
  catch { return []; }
};

const saveRequests = (requests: MaintenanceRequest[]) => {
  localStorage.setItem('mix_maintenance_requests', JSON.stringify(requests));
  window.dispatchEvent(new CustomEvent('local-storage-change', { detail: { key: 'mix_maintenance_requests' } }));
};

export const MaintenanceForm: React.FC<MaintenanceFormProps> = ({ storeId, onComplete }) => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;

  const [deviceType, setDeviceType] = useState<DeviceType>('phone');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [description, setDescription] = useState('');
  const [urgency, setUrgency] = useState<UrgencyType>('normal');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submittedId, setSubmittedId] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const deviceCards = [
    { id: 'phone' as DeviceType, icon: Smartphone, labelAr: t('maintenance_smartphone'), labelEn: 'Smartphone' },
    { id: 'earphone' as DeviceType, icon: Headphones, labelAr: t('maintenance_earphone'), labelEn: 'Earphones / Mic' },
    { id: 'charger' as DeviceType, icon: Zap, labelAr: t('maintenance_charger'), labelEn: 'Chargers / Cables' },
    { id: 'tablet' as DeviceType, icon: Tablet, labelAr: t('maintenance_tablet'), labelEn: 'Tablet / iPad' },
  ];

  const urgencyOptions = [
    { id: 'normal' as UrgencyType, labelAr: t('maintenance_normal'), labelEn: 'Normal', color: 'border-green-500/30 text-green-400' },
    { id: 'medium' as UrgencyType, labelAr: t('maintenance_medium'), labelEn: 'Medium', color: 'border-amber-500/30 text-amber-400' },
    { id: 'urgent' as UrgencyType, labelAr: t('maintenance_urgent'), labelEn: 'Very Urgent', color: 'border-red-500/30 text-red-400' },
  ];

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    Array.from(files).forEach(async (file) => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result && typeof e.target.result === 'string') {
          setImages(prev => [...prev, e.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  const removeImage = (idx: number) => {
    setImages(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!brand || !model || !description || !date || !time) return;

    setIsSubmitting(true);
    const requests = loadRequests();
    const newRequest: MaintenanceRequest = {
      id: `mnt-${Date.now()}`,
      type: deviceType,
      deviceBrand: brand,
      deviceModel: model,
      description,
      images,
      urgency,
      appointmentDate: date,
      appointmentTime: time,
      status: 'pending',
      createdAt: new Date().toISOString(),
      storeId,
    };
    requests.unshift(newRequest);
    saveRequests(requests);
    setSubmittedId(newRequest.id);
    setSubmitted(true);
    setIsSubmitting(false);
  };

  if (submitted) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="bg-[#121212] border border-[#2B2B2B] rounded-2xl p-6 sm:p-10 text-center max-w-xl mx-auto"
      >
        <div className="w-16 h-16 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10" />
        </div>
        <h3 className="text-xl sm:text-2xl font-black text-white mb-2">{t('maintenance_success')}</h3>
        <p className="text-sm text-zinc-400 mb-8">{t('maintenance_success_desc').replace('{id}', submittedId)}</p>
        <div className="bg-[#0B0B0B] border border-[#2B2B2B] rounded-2xl p-6 mb-6 inline-block">
          <div className="w-32 h-32 bg-[#0B0B0B] border-2 border-[#D4A63D]/30 rounded-xl mx-auto flex flex-col items-center justify-center p-2">
            <div className="grid grid-cols-6 gap-1 w-full h-full opacity-60">
              {Array.from({ length: 36 }).map((_, i) => (
                <div key={i} className={`rounded-xs ${(i % 5 === 0 || i < 6 || i % 6 === 0 || i > 30) ? 'bg-zinc-300' : 'bg-transparent'}`} />
              ))}
            </div>
            <div className="absolute w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center text-[8px] text-white font-black">MIX</div>
          </div>
          <p className="text-xs font-mono text-zinc-500 font-bold mt-3">MNT-{submittedId}</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <button onClick={() => { setSubmitted(false); setBrand(''); setModel(''); setDescription(''); setDate(''); setTime(''); setImages([]); }}
            className="flex-1 bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 px-5 rounded-xl text-sm transition-colors">
            {t('maintenance_new_request')}
          </button>
          {onComplete && (
            <button onClick={onComplete}
              className="flex-1 border border-[#2B2B2B] hover:bg-[#1a1a1a] text-zinc-300 font-bold py-3 px-5 rounded-xl text-sm transition-colors">
              {lang === 'en' ? 'Back to Store' : 'العودة للمتجر'}
            </button>
          )}
        </div>
      </motion.div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6 border-b border-[#2B2B2B] pb-4">
        <div className="flex-1 text-right">
          <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2 justify-end">
            <Wrench className="w-6 h-6 text-amber-400" />
            {t('maintenance_title')}
          </h2>
          <p className="text-xs text-zinc-500">{t('maintenance_subtitle')}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="text-xs font-bold text-zinc-400 mb-2 block text-right">{t('maintenance_select_device')}</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {deviceCards.map(card => {
              const Icon = card.icon;
              const isSel = deviceType === card.id;
              return (
                <button key={card.id} type="button" onClick={() => setDeviceType(card.id)}
                  className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all text-center group ${isSel ? 'border-amber-500 bg-amber-500/10 text-amber-400 scale-[1.02]' : 'border-[#2B2B2B] hover:border-zinc-600 bg-[#121212] text-zinc-400'}`}>
                  <Icon className={`w-6 h-6 mb-2 transition-transform group-hover:scale-110 ${isSel ? 'text-amber-400' : 'text-zinc-500'}`} />
                  <span className="text-xs font-bold">{lang === 'ar' ? card.labelAr : card.labelEn}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-zinc-400 mb-1.5 block text-right">{t('maintenance_brand')} <span className="text-red-500">*</span></label>
            <input type="text" required placeholder="Apple, Samsung, Anker..." value={brand} onChange={e => setBrand(e.target.value)}
              className="w-full px-4 py-2.5 text-sm rounded-xl border border-[#2B2B2B] bg-[#121212] focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-white placeholder-zinc-600 text-right" />
          </div>
          <div>
            <label className="text-xs font-bold text-zinc-400 mb-1.5 block text-right">{t('maintenance_model')} <span className="text-red-500">*</span></label>
            <input type="text" required placeholder="iPhone 15 Pro, Galaxy S24..." value={model} onChange={e => setModel(e.target.value)}
              className="w-full px-4 py-2.5 text-sm rounded-xl border border-[#2B2B2B] bg-[#121212] focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-white placeholder-zinc-600 text-right" />
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-zinc-400 mb-1.5 block text-right">{t('maintenance_defect')} <span className="text-red-500">*</span></label>
          <textarea required rows={4} placeholder={lang === 'ar' ? 'اشرح المشكلة التي تواجهها بالتفصيل...' : 'Describe the problem in detail...'}
            value={description} onChange={e => setDescription(e.target.value)}
            className="w-full px-4 py-2.5 text-sm rounded-xl border border-[#2B2B2B] bg-[#121212] focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-white placeholder-zinc-600 text-right" />
        </div>

        <div>
          <label className="text-xs font-bold text-zinc-400 mb-2 block text-right">{t('maintenance_upload_images')}</label>
          <input type="file" ref={fileInputRef} onChange={e => handleFiles(e.target.files)} accept="image/*" multiple className="hidden" />
          <div onDragOver={e => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)} onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all bg-[#121212] ${dragOver ? 'border-amber-500 bg-amber-500/5' : 'border-[#2B2B2B] hover:border-zinc-600'}`}>
            <div className="w-11 h-11 rounded-full bg-[#0B0B0B] text-zinc-500 flex items-center justify-center mx-auto mb-3">
              <Upload className="w-5 h-5 text-amber-500" />
            </div>
            <p className="text-xs sm:text-sm font-bold text-zinc-300">{t('maintenance_drag_drop')}</p>
            <p className="text-[10px] text-zinc-500 mt-1">{lang === 'ar' ? 'JPG, PNG, WEBP - حتى 5 صور' : 'JPG, PNG, WEBP - up to 5 images'}</p>
          </div>
          {images.length > 0 && (
            <div className="mt-4">
              <p className="text-[10px] font-bold text-zinc-500 mb-2">{t('maintenance_attached_photos')}</p>
              <div className="flex flex-wrap gap-3">
                {images.map((img, idx) => (
                  <div key={idx} className="relative w-16 h-16 rounded-xl overflow-hidden border border-[#2B2B2B]">
                    <img src={img} alt="" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => removeImage(idx)}
                      className="absolute top-0.5 right-0.5 bg-red-500/80 text-white rounded-full p-0.5">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-zinc-400 mb-1.5 block text-right">{t('maintenance_urgency')}</label>
            <div className="space-y-2">
              {urgencyOptions.map(urg => {
                const isSel = urgency === urg.id;
                return (
                  <button key={urg.id} type="button" onClick={() => setUrgency(urg.id)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-xs font-bold transition-all ${isSel ? `${urg.color} border-amber-500` : 'border-[#2B2B2B] bg-[#121212] text-zinc-500 hover:border-zinc-600'}`}>
                    <span>{urg.id === 'urgent' && <AlertTriangle className="w-3.5 h-3.5 inline" />}</span>
                    <span>{lang === 'ar' ? urg.labelAr : urg.labelEn}</span>
                  </button>
                );
              })}
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-zinc-400 mb-1.5 block text-right">{t('maintenance_date')} <span className="text-red-500">*</span></label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input type="date" required value={date} onChange={e => setDate(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-[#2B2B2B] bg-[#121212] focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-white text-right" />
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-zinc-400 mb-1.5 block text-right">{t('maintenance_time')} <span className="text-red-500">*</span></label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input type="time" required value={time} onChange={e => setTime(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-[#2B2B2B] bg-[#121212] focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-white text-right" />
              </div>
            </div>
          </div>
        </div>

        <button type="submit" disabled={isSubmitting}
          className="w-full bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 disabled:from-zinc-700 disabled:to-zinc-700 text-white font-black py-4 rounded-xl text-sm shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 disabled:text-zinc-500">
          {isSubmitting ? (
            <><svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>{t('maintenance_submitting')}</>
          ) : t('maintenance_submit')}
        </button>
      </form>
    </div>
  );
};

export default MaintenanceForm;
