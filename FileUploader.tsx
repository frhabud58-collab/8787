import React, { useRef, useState } from 'react';

interface FileUploaderProps {
  onUpload: (base64: string, fileName: string) => void;
  currentImage?: string;
  label?: string;
  accept?: string;
  maxSizeMB?: number;
  className?: string;
}

export default function FileUploader({
  onUpload,
  currentImage,
  label = 'اختر صورة من الجهاز',
  accept = 'image/*',
  maxSizeMB = 5,
  className = ''
}: FileUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFile = (file: File) => {
    setError('');
    
    if (!file.type.startsWith('image/')) {
      setError('الملف المختار ليس صورة');
      return;
    }

    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`حجم الصورة يتجاوز ${maxSizeMB} ميغابايت`);
      return;
    }

    setLoading(true);
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setPreview(result);
      onUpload(result, file.name);
      setLoading(false);
    };
    reader.onerror = () => {
      setError('فشل قراءة الملف');
      setLoading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const displayImage = preview || currentImage;

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-zinc-400 text-xs font-semibold mb-1">{label}</label>
      )}
      
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all hover:border-amber-400/50 ${
          displayImage ? 'border-zinc-700 bg-zinc-900/40' : 'border-zinc-700 bg-zinc-900/20'
        }`}
      >
        {loading ? (
          <div className="flex items-center justify-center py-4">
            <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs text-zinc-400 mr-2">جاري رفع الصورة...</span>
          </div>
        ) : displayImage ? (
          <div className="relative group">
            <img
              src={displayImage}
              alt=""
              className="max-h-32 mx-auto rounded-lg object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
              <span className="text-xs text-white font-bold">اضغط لتغيير الصورة</span>
            </div>
          </div>
        ) : (
          <div className="py-4">
            <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-zinc-800 flex items-center justify-center">
              <svg className="w-5 h-5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <p className="text-xs text-zinc-400">اسحب الصورة هنا أو اضغط للاختيار</p>
            <p className="text-[9px] text-zinc-600 mt-1">PNG, JPG, GIF - حد أقصى {maxSizeMB}MB</p>
          </div>
        )}
      </div>

      {error && <p className="text-xs text-red-400">{error}</p>}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />

      {preview && (
        <button
          type="button"
          onClick={() => { setPreview(null); setError(''); }}
          className="text-[10px] text-red-400 hover:text-red-300 transition-colors cursor-pointer"
        >
          إلغاء وإعادة الاختيار
        </button>
      )}
    </div>
  );
}
