import React, { useEffect } from 'react';
import { format, parseISO, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { Moon, Clock, TrendingUp, Calendar, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';
import { SleepRecord, UserSettings } from '../types';

interface Props {
  records: SleepRecord[];
  settings: UserSettings;
}

export default function SleepDashboard({ records, settings }: Props) {
  const today = new Date();
  const todayStr = format(today, 'yyyy-MM-dd');
  const todayRecord = records.find(r => format(parseISO(r.date), 'yyyy-MM-dd') === todayStr);
  
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(today, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const averageSleep = records.length > 0
    ? records.reduce((acc, r) => acc + r.durationMinutes, 0) / records.length
    : 0;

  const formatDuration = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h}h ${m}m`;
  };

  const goalMinutes = settings.sleepGoalHours * 60;
  const todayProgress = todayRecord ? (todayRecord.durationMinutes / goalMinutes) * 100 : 0;
  const isGoalMet = todayProgress >= 100;

  // Trigger confetti when goal is met
  useEffect(() => {
    if (isGoalMet) {
      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

      const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

      const interval: any = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        // since particles fall down, start a bit higher than random
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
      }, 250);

      return () => clearInterval(interval);
    }
  }, [isGoalMet]);

  return (
    <div className="space-y-6">
      {/* Today's Goal Progress */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ 
          opacity: 1, 
          scale: 1,
          boxShadow: isGoalMet ? "0 0 25px rgba(52, 211, 153, 0.3)" : "none"
        }}
        className={`glass-card p-6 border-none relative overflow-hidden transition-all duration-500 ${
          isGoalMet 
            ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white' 
            : 'bg-gradient-to-br from-indigo-600 to-violet-700 text-white'
        }`}
      >
        {/* Animated Background Sparkles for Goal Met */}
        {isGoalMet && (
          <motion.div 
            animate={{ opacity: [0.2, 0.5, 0.2] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-0 pointer-events-none"
          >
            <div className="absolute top-4 right-12 text-white/30"><Sparkles size={24} /></div>
            <div className="absolute bottom-8 left-1/4 text-white/20"><Sparkles size={16} /></div>
            <div className="absolute top-1/2 right-4 text-white/40"><Sparkles size={20} /></div>
          </motion.div>
        )}

        <div className="flex justify-between items-start mb-4 relative z-10">
          <div>
            <p className="text-white/70 text-sm font-medium">今日睡眠目标</p>
            <h3 className="text-3xl font-black mt-1">
              {todayRecord ? formatDuration(todayRecord.durationMinutes) : '尚未打卡'}
            </h3>
          </div>
          <div className={`backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold ${
            isGoalMet ? 'bg-white/30' : 'bg-white/20'
          }`}>
            目标: {settings.sleepGoalHours}h
          </div>
        </div>
        
        <div className="space-y-2 relative z-10">
          <div className="flex justify-between text-xs font-bold">
            <span>完成度 {Math.min(Math.round(todayProgress), 100)}%</span>
            {isGoalMet && (
              <motion.span 
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="flex items-center"
              >
                <TrendingUp size={12} className="mr-1" /> 达成目标！✨
              </motion.span>
            )}
          </div>
          <div className="h-3 bg-white/20 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(todayProgress, 100)}%` }}
              className={`h-full rounded-full ${isGoalMet ? 'bg-white shadow-[0_0_15px_rgba(255,255,255,0.8)]' : 'bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)]'}`}
            />
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-4 flex items-center space-x-3"
        >
          <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
            <Clock size={20} />
          </div>
          <div>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">平均时长</p>
            <p className="text-lg font-bold text-slate-800">
              {formatDuration(averageSleep)}
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-4 flex items-center space-x-3"
        >
          <div className="p-2 bg-amber-100 text-amber-600 rounded-lg">
            <TrendingUp size={20} />
          </div>
          <div>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">打卡天数</p>
            <p className="text-lg font-bold text-slate-800">{records.length} 天</p>
          </div>
        </motion.div>
      </div>

      {/* Weekly View */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-slate-800 flex items-center">
            <Calendar className="mr-2 text-indigo-500" size={20} />
            本周概览
          </h3>
          <span className="text-sm text-slate-500">
            {format(weekStart, 'MM月dd日')} - {format(weekEnd, 'MM月dd日')}
          </span>
        </div>
        
        <div className="flex justify-between items-stretch h-40 gap-2">
          {weekDays.map((day, idx) => {
            const dayStr = format(day, 'yyyy-MM-dd');
            const record = records.find(r => format(parseISO(r.date), 'yyyy-MM-dd') === dayStr);
            const height = record ? (record.durationMinutes / (settings.sleepGoalHours * 1.5 * 60)) * 100 : 0; // Scale relative to goal
            
            return (
              <div key={idx} className="flex-1 flex flex-col items-center group h-full">
                <div className="w-full relative flex flex-col justify-end h-full">
                  {/* Goal Line */}
                  <div 
                    className="absolute left-0 right-0 border-t border-dashed border-slate-200 z-0"
                    style={{ bottom: `${(1 / 1.5) * 100}%` }}
                  />
                  
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${Math.min(height, 100)}%` }}
                    className={`w-full rounded-t-lg transition-colors relative z-10 ${
                      isSameDay(day, today) 
                        ? (record && record.durationMinutes >= goalMinutes ? 'bg-emerald-500' : 'bg-indigo-500') 
                        : (record && record.durationMinutes >= goalMinutes ? 'bg-emerald-200 group-hover:bg-emerald-300' : 'bg-indigo-200 group-hover:bg-indigo-300')
                    }`}
                  />
                  {record && (
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20">
                      {formatDuration(record.durationMinutes)}
                    </div>
                  )}
                </div>
                <span className={`text-[10px] mt-2 font-medium ${
                  isSameDay(day, today) ? 'text-indigo-600' : 'text-slate-400'
                }`}>
                  {format(day, 'eee', { locale: zhCN })}
                </span>
              </div>
            );
          })}
        </div>
        <div className="mt-4 flex items-center justify-center space-x-4 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
          <div className="flex items-center"><div className="w-2 h-2 bg-emerald-300 rounded-full mr-1" /> 达成目标</div>
          <div className="flex items-center"><div className="w-2 h-2 bg-indigo-300 rounded-full mr-1" /> 未达成</div>
          <div className="flex items-center"><div className="w-2 h-2 border-t border-dashed border-slate-300 mr-1" /> 目标线</div>
        </div>
      </div>

      {/* Recent Records */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-bold text-slate-800 mb-4">最近记录</h3>
        <div className="space-y-3">
          {records.slice().reverse().map((record) => (
            <div key={record.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center shadow-sm">
                  {record.sourceType === 'watch' ? <Moon size={18} className="text-indigo-500" /> : <Clock size={18} className="text-amber-500" />}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    {format(parseISO(record.date), 'MM月dd日')}
                  </p>
                  <p className="text-xs text-slate-500">
                    {record.sourceType === 'watch' ? '手表数据' : '屏幕时间'} · 置信度 {(record.analysisConfidence * 100).toFixed(0)}%
                  </p>
                </div>
              </div>
              <p className="text-sm font-bold text-indigo-600">
                {formatDuration(record.durationMinutes)}
              </p>
            </div>
          ))}
          {records.length === 0 && (
            <div className="text-center py-8 text-slate-400 italic">
              暂无睡眠记录，快去上传截图打卡吧！
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
