import React, { useMemo } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { History, X, Calendar, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function HistorySlider() {
  const { getCurrentData, viewingDate, setViewingDate } = useAppStore();
  const currentData = getCurrentData();
  const history = currentData.history || [];

  // Group history by date (YYYY-MM-DD) and get unique sorted dates
  const { sortedDates, dateMap } = useMemo(() => {
    if (!history.length) return { sortedDates: [], dateMap: {} };

    const map: Record<string, typeof history> = {};
    const datesSet = new Set<string>();

    history.forEach((record) => {
      const dateKey = new Date(record.date).toISOString().split('T')[0]; // YYYY-MM-DD
      if (!map[dateKey]) map[dateKey] = [];
      map[dateKey].push(record);
      datesSet.add(dateKey);
    });

    // Add "today" or "now" if not present? 
    // Actually, let's just use the history dates. 
    // If the user wants "now", they exit the mode.
    
    const sorted = Array.from(datesSet).sort();
    return { sortedDates: sorted, dateMap: map };
  }, [history]);

  const isViewingHistory = viewingDate !== null;

  // Find index of current viewing date
  const currentIndex = useMemo(() => {
    if (!viewingDate) return sortedDates.length - 1;
    // Find exact match or closest previous date
    const idx = sortedDates.findIndex(d => d === viewingDate);
    if (idx >= 0) return idx;
    
    // Fallback: find closest date <= viewingDate
    for (let i = sortedDates.length - 1; i >= 0; i--) {
      if (sortedDates[i] <= viewingDate) return i;
    }
    return 0;
  }, [viewingDate, sortedDates]);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const index = parseInt(e.target.value, 10);
    const date = sortedDates[index];
    setViewingDate(date);
  };

  const stepBack = () => {
    if (currentIndex > 0) {
      setViewingDate(sortedDates[currentIndex - 1]);
    }
  };

  const stepForward = () => {
    if (currentIndex < sortedDates.length - 1) {
      setViewingDate(sortedDates[currentIndex + 1]);
    }
  };

  const exitHistoryMode = () => {
    setViewingDate(null);
  };

  // Format date for display
  const formatDisplayDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
      });
    } catch (e) {
      return dateStr;
    }
  };

  // Helper to check if a date is "real" (has snapshots) or interpolated
  // In this simplified version, we only iterate through sortedDates which ARE real dates.
  // So all displayed dates are valid snapshot dates.

  if (history.length === 0) return null;

  const currentDisplayDate = sortedDates[currentIndex];
  const snapshotsOnDay = dateMap[currentDisplayDate]?.length || 0;

  // Get the latest snapshot time for the selected day
  const latestSnapshot = dateMap[currentDisplayDate]?.[snapshotsOnDay - 1];
  const snapshotTime = latestSnapshot ? new Date(latestSnapshot.date).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }) : '';

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-lg px-4 z-50">
      <AnimatePresence>
        {isViewingHistory && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="bg-gray-900/95 backdrop-blur-xl border border-gold-primary/30 rounded-2xl p-5 shadow-2xl ring-1 ring-gold-primary/20"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-gold-primary">
                <RotateCcw size={18} />
                <span className="text-sm font-bold tracking-wide">时光机</span>
              </div>
              
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-400 font-mono bg-white/5 px-2 py-1 rounded">
                  {currentIndex + 1} / {sortedDates.length} 天
                </span>
                <button
                  onClick={exitHistoryMode}
                  className="p-1.5 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Date Display */}
            <div className="flex items-center justify-between mb-4 px-1">
              <button 
                onClick={stepBack}
                disabled={currentIndex === 0}
                className="p-1 text-gray-500 hover:text-white disabled:opacity-30 disabled:hover:text-gray-500 transition-colors"
              >
                <ChevronLeft size={24} />
              </button>
              
              <div className="text-center">
                <div className="text-lg font-bold text-white tabular-nums">
                  {formatDisplayDate(currentDisplayDate)}
                </div>
                <div className="flex items-center justify-center gap-2 mt-0.5">
                   <span className="text-xs text-gray-400">
                     {snapshotsOnDay} 个快照
                   </span>
                   {snapshotTime && (
                     <span className="text-xs text-gold-primary/80 font-mono bg-gold-primary/10 px-1.5 rounded">
                       {snapshotTime}
                     </span>
                   )}
                </div>
              </div>

              <button 
                onClick={stepForward}
                disabled={currentIndex === sortedDates.length - 1}
                className="p-1 text-gray-500 hover:text-white disabled:opacity-30 disabled:hover:text-gray-500 transition-colors"
              >
                <ChevronRight size={24} />
              </button>
            </div>

            {/* Slider */}
            <div className="relative h-8 flex items-center group">
               {/* Track background */}
               <div className="absolute inset-x-0 h-1.5 bg-gray-700/50 rounded-full overflow-hidden">
                 <div 
                   className="h-full bg-gold-primary/30 transition-all duration-150"
                   style={{ width: `${(currentIndex / (sortedDates.length - 1)) * 100}%` }}
                 />
               </div>
               
               {/* Ticks (optional, if not too many) */}
               {sortedDates.length < 20 && (
                 <div className="absolute inset-x-0 flex justify-between px-1 pointer-events-none">
                   {sortedDates.map((_, idx) => (
                     <div 
                        key={idx} 
                        className={`w-0.5 h-0.5 rounded-full ${idx <= currentIndex ? 'bg-gold-primary' : 'bg-gray-600'}`} 
                     />
                   ))}
                 </div>
               )}

               <input
                type="range"
                min={0}
                max={sortedDates.length - 1}
                step={1}
                value={currentIndex}
                onChange={handleSliderChange}
                className="relative w-full h-8 opacity-0 cursor-pointer z-10"
              />
              
              {/* Custom Thumb */}
              <div 
                className="absolute h-4 w-4 bg-gold-primary rounded-full shadow-lg pointer-events-none transition-all duration-150 flex items-center justify-center"
                style={{ 
                  left: `calc(${(currentIndex / (sortedDates.length - 1)) * 100}% - 8px)` 
                }}
              >
                <div className="w-1.5 h-1.5 bg-black rounded-full" />
              </div>
            </div>

          </motion.div>
        )}
      </AnimatePresence>

      {!isViewingHistory && history.length > 0 && (
         <motion.button
           initial={{ y: 100, opacity: 0 }}
           animate={{ y: 0, opacity: 1 }}
           whileHover={{ scale: 1.05 }}
           whileTap={{ scale: 0.95 }}
           onClick={() => setViewingDate(sortedDates[sortedDates.length - 1])}
           className="absolute bottom-0 right-4 bg-gray-800/90 backdrop-blur border border-gray-700 text-gold-primary p-3 rounded-full shadow-lg group"
         >
           <History size={20} className="group-hover:rotate-12 transition-transform" />
           <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity pointer-events-none border border-gray-700">
             进入时光机
           </span>
         </motion.button>
      )}
    </div>
  );
}
