import React, { useState, useRef, useEffect } from 'react';
import { Upload, Image as ImageIcon, X, Loader2, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { analyzeSleepScreenshot } from '../services/geminiService';
import { SleepRecord } from '../types';

interface Props {
  onRecordAnalyzed: (record: Partial<SleepRecord>) => void;
}

export default function ScreenshotUploader({ onRecordAnalyzed }: Props) {
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loadingMessage, setLoadingMessage] = useState('AI 正在分析您的睡眠截图...');

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isAnalyzing) {
      const messages = [
        'AI 正在分析您的睡眠截图...',
        '正在识别睡眠时长数据...',
        '正在为您计算睡眠质量...',
        '即将完成，请稍候...'
      ];
      let i = 0;
      interval = setInterval(() => {
        i = (i + 1) % messages.length;
        setLoadingMessage(messages[i]);
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [isAnalyzing]);

  const compressImage = (base64: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const maxDim = 1024;

        if (width > height && width > maxDim) {
          height *= maxDim / width;
          width = maxDim;
        } else if (height > maxDim) {
          width *= maxDim / height;
          height = maxDim;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };
      img.src = base64;
    });
  };

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('请上传图片文件');
      return;
    }

    setError(null);
    setIsAnalyzing(true);

    const reader = new FileReader();
    reader.onload = async (e) => {
      const originalBase64 = e.target?.result as string;
      setPreview(originalBase64);
      
      // Compress image before sending to AI
      const compressedBase64 = await compressImage(originalBase64);
      const result = await analyzeSleepScreenshot(compressedBase64);
      
      if (result.durationMinutes > 0) {
        onRecordAnalyzed({
          durationMinutes: result.durationMinutes,
          sourceType: result.sourceType,
          analysisConfidence: result.confidence,
          notes: result.explanation,
          screenshotUrl: originalBase64 // Keep original for preview
        });
      } else {
        setError(result.explanation || '未能识别睡眠时长，请确保截图清晰且包含相关数据。');
      }
      setIsAnalyzing(false);
    };
    reader.readAsDataURL(file);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  return (
    <div className="w-full">
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`
          relative border-2 border-dashed rounded-3xl p-8 transition-all cursor-pointer
          flex flex-col items-center justify-center min-h-[240px]
          ${isDragging ? 'border-indigo-500 bg-indigo-50/50' : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'}
          ${isAnalyzing ? 'pointer-events-none opacity-80' : ''}
        `}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          className="hidden"
          accept="image/*"
        />

        <AnimatePresence mode="wait">
          {isAnalyzing ? (
            <motion.div
              key="analyzing"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col items-center"
            >
              <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
              <p className="text-slate-600 font-medium">{loadingMessage}</p>
            </motion.div>
          ) : preview ? (
            <motion.div
              key="preview"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative w-full max-w-[200px] aspect-[9/16] rounded-xl overflow-hidden shadow-lg"
            >
              <img src={preview} alt="Preview" className="w-full h-full object-cover" />
              <button
                onClick={(e) => { e.stopPropagation(); setPreview(null); setError(null); }}
                className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full hover:bg-black/70"
              >
                <X size={16} />
              </button>
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                <CheckCircle2 className="text-white w-10 h-10" />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="upload"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center text-center"
            >
              <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mb-4 text-indigo-600">
                <Upload size={32} />
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-1">上传睡眠截图</h3>
              <p className="text-slate-500 text-sm max-w-[240px]">
                支持手表睡眠数据截图或手机屏幕使用时间截图
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 text-red-500 text-sm font-medium bg-red-50 px-4 py-2 rounded-full"
          >
            {error}
          </motion.p>
        )}
      </div>
    </div>
  );
}
