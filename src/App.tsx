import React, { useState, useEffect } from 'react';
import { Moon, Sparkles, History, LayoutDashboard, PlusCircle, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import SleepDashboard from './components/SleepDashboard';
import ScreenshotUploader from './components/ScreenshotUploader';
import SettingsModal from './components/SettingsModal';
import { SleepRecord, UserSettings } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'upload' | 'history'>('dashboard');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [userSettings, setUserSettings] = useState<UserSettings>(() => {
    const saved = localStorage.getItem('user_settings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to load settings", e);
      }
    }
    return {
      nickname: '',
      sleepGoalHours: 8,
      remindersEnabled: false,
      reminderTime: '22:30'
    };
  });
  const [records, setRecords] = useState<SleepRecord[]>(() => {
    const saved = localStorage.getItem('sleep_records');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to load records", e);
      }
    }
    return [];
  });
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [pendingRecord, setPendingRecord] = useState<Partial<SleepRecord> | null>(null);
  const [adjustedMinutes, setAdjustedMinutes] = useState(0);
  const [showToast, setShowToast] = useState(false);

  const hasCheckedInToday = () => {
    const today = new Date().toDateString();
    return records.some(r => new Date(r.date).toDateString() === today);
  };

  // Update adjustedMinutes when pendingRecord is set
  useEffect(() => {
    if (pendingRecord?.durationMinutes) {
      setAdjustedMinutes(pendingRecord.durationMinutes);
    }
  }, [pendingRecord]);

  // Save records to localStorage
  useEffect(() => {
    localStorage.setItem('sleep_records', JSON.stringify(records));
  }, [records]);

  // Save settings to localStorage
  useEffect(() => {
    localStorage.setItem('user_settings', JSON.stringify(userSettings));
  }, [userSettings]);

  const handleRecordAnalyzed = (record: Partial<SleepRecord>) => {
    setPendingRecord(record);
    setIsCheckingIn(true);
  };

  const confirmCheckIn = () => {
    if (pendingRecord) {
      if (hasCheckedInToday()) {
        alert('您今天已经打过卡了哦！');
        setPendingRecord(null);
        setIsCheckingIn(false);
        return;
      }

      const newRecord: SleepRecord = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        durationMinutes: adjustedMinutes,
        sourceType: pendingRecord.sourceType || 'watch',
        screenshotUrl: pendingRecord.screenshotUrl,
        analysisConfidence: pendingRecord.analysisConfidence || 1,
        notes: pendingRecord.notes
      };
      
      // Check if today already has a record and replace it or just add
      const today = new Date().toDateString();
      const filtered = records.filter(r => new Date(r.date).toDateString() !== today);
      setRecords([...filtered, newRecord]);
      
      setPendingRecord(null);
      setIsCheckingIn(false);
      setActiveTab('dashboard');
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    const name = userSettings.nickname || '同学';
    if (hour >= 5 && hour < 11) return `早安，${name}！✨`;
    if (hour >= 11 && hour < 14) return `午安，${name}！✨`;
    if (hour >= 14 && hour < 18) return `下午好，${name}！✨`;
    return `晚安，${name}！✨`;
  };

  const getSubtitle = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 11) return '今天也要保持充足的睡眠哦。';
    if (hour >= 11 && hour < 14) return '午间小憩一下，精神更充沛。';
    if (hour >= 14 && hour < 18) return '忙碌之余，别忘了关注睡眠质量。';
    return '早点休息，祝你有个好梦。';
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
              <Moon size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">校园睡</h1>
              <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest">Campus Sleep</p>
            </div>
          </div>
          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"
          >
            <Settings size={20} />
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-8">
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-slate-800 mb-2">{getGreeting()}</h2>
                <p className="text-slate-500">{getSubtitle()}</p>
              </div>
              <SleepDashboard records={records} settings={userSettings} />
            </motion.div>
          )}

          {activeTab === 'upload' && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-slate-800 mb-2">上传截图打卡</h2>
                <p className="text-slate-500">AI 将自动识别您的睡眠时长</p>
              </div>
              
              {hasCheckedInToday() ? (
                <div className="glass-card p-12 text-center space-y-4">
                  <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Sparkles size={40} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800">今天已经打过卡啦！</h3>
                  <p className="text-slate-500 text-sm">良好的睡眠习惯贵在坚持，明天再来记录吧 ✨</p>
                  <button 
                    onClick={() => setActiveTab('dashboard')}
                    className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all"
                  >
                    返回首页
                  </button>
                </div>
              ) : (
                <>
                  <ScreenshotUploader onRecordAnalyzed={handleRecordAnalyzed} />
                  
                  <div className="glass-card p-6 bg-indigo-50/50 border-indigo-100">
                    <h4 className="font-bold text-indigo-900 mb-2 flex items-center">
                      <Sparkles size={16} className="mr-2" />
                      打卡小贴士
                    </h4>
                    <ul className="text-sm text-indigo-800/70 space-y-2 list-disc list-inside">
                      <li>上传手表睡眠详情页截图，识别最准确。</li>
                      <li>也可以上传“屏幕使用时间”截图，AI 会根据夜间不活跃时间估算。</li>
                      <li>每日打卡可获得睡眠勋章（即将上线）。</li>
                    </ul>
                  </div>
                </>
              )}
            </motion.div>
          )}

          {activeTab === 'history' && (
            <motion.div
              key="history"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <h2 className="text-2xl font-bold text-slate-800 mb-6">历史记录</h2>
              <div className="space-y-4">
                {records.slice().reverse().map(record => (
                  <div key={record.id} className="glass-card p-4 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {record.screenshotUrl && (
                        <img src={record.screenshotUrl} className="w-12 h-12 rounded-lg object-cover" alt="Source" />
                      )}
                      <div>
                        <p className="font-bold text-slate-800">{new Date(record.date).toLocaleDateString()}</p>
                        <p className="text-xs text-slate-500">{record.notes || '无备注'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-indigo-600">
                        {Math.floor(record.durationMinutes / 60)}h {record.durationMinutes % 60}m
                      </p>
                    </div>
                  </div>
                ))}
                {records.length === 0 && (
                  <div className="text-center py-20 text-slate-400">
                    <History size={48} className="mx-auto mb-4 opacity-20" />
                    <p>还没有任何睡眠历史</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Check-in Modal */}
      <AnimatePresence>
        {isCheckingIn && pendingRecord && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl"
            >
              <h3 className="text-2xl font-bold text-slate-900 mb-2">确认睡眠时长</h3>
              <p className="text-slate-500 mb-6">AI 识别结果如下，您可以根据实际情况微调：</p>
              
              <div className="bg-indigo-50 rounded-2xl p-6 mb-6 text-center">
                <div className="flex items-center justify-center space-x-6 mb-4">
                  <button 
                    onClick={() => {
                      const original = pendingRecord.durationMinutes || 0;
                      const confidence = pendingRecord.analysisConfidence || 1;
                      const delta = Math.max(30, Math.round((1 - confidence) * 300));
                      setAdjustedMinutes(m => Math.max(original - delta, Math.max(0, m - 15)));
                    }}
                    className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-indigo-600 hover:bg-indigo-100 transition-colors"
                  >
                    -
                  </button>
                  <div className="text-indigo-600 font-black text-4xl">
                    {Math.floor(adjustedMinutes / 60)}h {adjustedMinutes % 60}m
                  </div>
                  <button 
                    onClick={() => {
                      const original = pendingRecord.durationMinutes || 0;
                      const confidence = pendingRecord.analysisConfidence || 1;
                      const delta = Math.max(30, Math.round((1 - confidence) * 300));
                      setAdjustedMinutes(m => Math.min(original + delta, m + 15));
                    }}
                    className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-indigo-600 hover:bg-indigo-100 transition-colors"
                  >
                    +
                  </button>
                </div>
                
                <div className="space-y-2">
                  <p className="text-indigo-800/60 text-xs font-medium">
                    识别来源：{pendingRecord.sourceType === 'watch' ? '手表/健康应用' : '屏幕使用时间'}
                  </p>
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-24 h-1.5 bg-indigo-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-indigo-500" 
                        style={{ width: `${(pendingRecord.analysisConfidence || 0) * 100}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-indigo-400 font-bold">
                      置信度 {( (pendingRecord.analysisConfidence || 0) * 100 ).toFixed(0)}%
                    </span>
                  </div>
                  <p className="text-[10px] text-indigo-300 italic">
                    * 根据置信度，允许调整范围：±{Math.max(30, Math.round((1 - (pendingRecord.analysisConfidence || 1)) * 300))}分钟
                  </p>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setIsCheckingIn(false)}
                  className="flex-1 py-4 rounded-2xl font-bold text-slate-500 hover:bg-slate-100 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={confirmCheckIn}
                  className="flex-1 py-4 rounded-2xl font-bold bg-indigo-600 text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-95"
                >
                  确认打卡
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Settings Modal */}
      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={userSettings}
        onSave={setUserSettings}
        onClearData={() => setRecords([])}
      />

      {/* Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-t border-slate-200 px-6 py-3 z-40">
        <div className="max-w-md mx-auto flex items-center justify-around">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex flex-col items-center p-2 transition-colors ${activeTab === 'dashboard' ? 'text-indigo-600' : 'text-slate-400'}`}
          >
            <LayoutDashboard size={24} />
            <span className="text-[10px] font-bold mt-1">首页</span>
          </button>
          
          <button
            onClick={() => setActiveTab('upload')}
            className={`relative -top-8 w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-xl shadow-indigo-200 transition-transform active:scale-90 ${activeTab === 'upload' ? 'scale-110' : ''}`}
          >
            <PlusCircle size={32} />
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex flex-col items-center p-2 transition-colors ${activeTab === 'history' ? 'text-indigo-600' : 'text-slate-400'}`}
          >
            <History size={24} />
            <span className="text-[10px] font-bold mt-1">历史</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
