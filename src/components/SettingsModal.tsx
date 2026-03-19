import React, { useState } from 'react';
import { X, User, Target, Bell, Trash2, Save, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { UserSettings } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: UserSettings;
  onSave: (settings: UserSettings) => void;
  onClearData: () => void;
}

export default function SettingsModal({ isOpen, onClose, settings, onSave, onClearData }: SettingsModalProps) {
  const [localSettings, setLocalSettings] = useState<UserSettings>(settings);
  const [showConfirmClear, setShowConfirmClear] = useState(false);

  const handleSave = () => {
    onSave(localSettings);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="text-xl font-bold text-slate-900">应用设置</h3>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-8 overflow-y-auto">
              {/* Personal Info */}
              <section className="space-y-4">
                <div className="flex items-center space-x-2 text-indigo-600">
                  <User size={18} />
                  <h4 className="font-bold">个人信息</h4>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 block">昵称</label>
                    <input 
                      type="text"
                      value={localSettings.nickname}
                      onChange={(e) => setLocalSettings({ ...localSettings, nickname: e.target.value })}
                      placeholder="输入你的昵称"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                    />
                  </div>
                </div>
              </section>

              {/* Sleep Goal */}
              <section className="space-y-4">
                <div className="flex items-center space-x-2 text-indigo-600">
                  <Target size={18} />
                  <h4 className="font-bold">睡眠目标</h4>
                </div>
                <div className="bg-indigo-50 rounded-2xl p-4 flex items-center justify-between">
                  <span className="text-indigo-900 font-medium">每日目标时长</span>
                  <div className="flex items-center space-x-3">
                    <button 
                      onClick={() => setLocalSettings({ ...localSettings, sleepGoalHours: Math.max(4, localSettings.sleepGoalHours - 0.5) })}
                      className="w-8 h-8 bg-white rounded-full shadow-sm flex items-center justify-center text-indigo-600 hover:bg-indigo-100"
                    >
                      -
                    </button>
                    <span className="font-black text-indigo-600 w-12 text-center">{localSettings.sleepGoalHours}h</span>
                    <button 
                      onClick={() => setLocalSettings({ ...localSettings, sleepGoalHours: Math.min(12, localSettings.sleepGoalHours + 0.5) })}
                      className="w-8 h-8 bg-white rounded-full shadow-sm flex items-center justify-center text-indigo-600 hover:bg-indigo-100"
                    >
                      +
                    </button>
                  </div>
                </div>
              </section>

              {/* Reminders */}
              <section className="space-y-4">
                <div className="flex items-center space-x-2 text-indigo-600">
                  <Bell size={18} />
                  <h4 className="font-bold">提醒设置</h4>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-700 font-medium">开启就寝提醒</span>
                    <button 
                      onClick={() => setLocalSettings({ ...localSettings, remindersEnabled: !localSettings.remindersEnabled })}
                      className={`w-12 h-6 rounded-full transition-colors relative ${localSettings.remindersEnabled ? 'bg-indigo-600' : 'bg-slate-200'}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${localSettings.remindersEnabled ? 'left-7' : 'left-1'}`} />
                    </button>
                  </div>
                  {localSettings.remindersEnabled && (
                    <div className="flex items-center justify-between animate-in fade-in slide-in-from-top-2">
                      <span className="text-slate-500 text-sm">提醒时间</span>
                      <input 
                        type="time"
                        value={localSettings.reminderTime}
                        onChange={(e) => setLocalSettings({ ...localSettings, reminderTime: e.target.value })}
                        className="px-3 py-1 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 outline-none"
                      />
                    </div>
                  )}
                </div>
              </section>

              {/* Data Management */}
              <section className="space-y-4 pt-4 border-t border-slate-100">
                <div className="flex items-center space-x-2 text-rose-600">
                  <Trash2 size={18} />
                  <h4 className="font-bold">数据管理</h4>
                </div>
                <button 
                  onClick={() => setShowConfirmClear(true)}
                  className="w-full py-3 px-4 border border-rose-200 text-rose-600 rounded-xl font-bold hover:bg-rose-50 transition-colors flex items-center justify-center space-x-2"
                >
                  <Trash2 size={16} />
                  <span>清空所有历史记录</span>
                </button>
              </section>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-slate-100 bg-slate-50/50">
              <button 
                onClick={handleSave}
                className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center space-x-2"
              >
                <Save size={20} />
                <span>保存设置</span>
              </button>
            </div>
          </motion.div>

          {/* Confirm Clear Modal */}
          <AnimatePresence>
            {showConfirmClear && (
              <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-md">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="bg-white rounded-3xl p-8 w-full max-w-xs shadow-2xl text-center"
                >
                  <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertTriangle size={32} />
                  </div>
                  <h5 className="text-xl font-bold text-slate-900 mb-2">确认清空？</h5>
                  <p className="text-slate-500 text-sm mb-6">此操作将永久删除您所有的睡眠历史记录，且无法恢复。</p>
                  <div className="space-y-3">
                    <button 
                      onClick={() => {
                        onClearData();
                        setShowConfirmClear(false);
                        onClose();
                      }}
                      className="w-full py-3 bg-rose-600 text-white rounded-xl font-bold shadow-lg shadow-rose-100"
                    >
                      确认删除
                    </button>
                    <button 
                      onClick={() => setShowConfirmClear(false)}
                      className="w-full py-3 text-slate-500 font-bold"
                    >
                      取消
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </div>
      )}
    </AnimatePresence>
  );
}
