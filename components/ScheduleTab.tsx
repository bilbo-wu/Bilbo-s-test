
import React, { useState, useEffect, useRef } from 'react';
import { Clock, MapPin, Briefcase, BookOpen, Moon, Plus, Mic, FileInput, X, Loader2, Edit, Trash, MicOff, ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { ScheduleItem, ScheduleType, UserProfile } from '../types';
import { parseScheduleFromAudio } from '../services/geminiService';

interface ScheduleTabProps {
  items: ScheduleItem[];
  setItems: React.Dispatch<React.SetStateAction<ScheduleItem[]>>;
  userProfile: UserProfile;
}

const ScheduleTab: React.FC<ScheduleTabProps> = ({ items: scheduleItems, setItems: setScheduleItems, userProfile }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit' | 'import'>('add');
  const [currentItem, setCurrentItem] = useState<Partial<ScheduleItem>>({});
  const [importText, setImportText] = useState('');
  
  // Voice & AI States
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Simulate clock ticking
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const changeDate = (days: number) => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() + days);
    setSelectedDate(date.toISOString().split('T')[0]);
  };

  const filteredItems = scheduleItems.filter(item => item.date === selectedDate).sort((a, b) => a.startTime.localeCompare(b.startTime));

  const getNextClass = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    if (selectedDate !== todayStr) return null; // Only show countdown for today

    const nowStr = currentTime.toTimeString().slice(0, 5);
    return filteredItems.find(s => s.startTime > nowStr);
  };

  const nextClass = getNextClass();

  const getIcon = (type: ScheduleType) => {
    switch (type) {
      case ScheduleType.DUTY: return <Briefcase size={18} className="text-orange-600" />;
      case ScheduleType.CLASS: return <BookOpen size={18} className="text-blue-600" />;
      default: return <Clock size={18} />;
    }
  };

  const getBgColor = (type: ScheduleType) => {
    switch (type) {
      case ScheduleType.DUTY: return 'bg-orange-50 border-l-4 border-orange-400';
      case ScheduleType.CLASS: return 'bg-white border-l-4 border-blue-500';
      default: return 'bg-gray-50';
    }
  };

  // --- CRUD Operations ---
  const handleDelete = (id: string) => {
    if (confirm('确定要删除这个日程吗？')) {
      setScheduleItems(prev => prev.filter(item => item.id !== id));
    }
  };

  const handleEdit = (item: ScheduleItem) => {
    setCurrentItem(item);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (modalMode === 'import') {
      handleImportProcess();
      return;
    }

    if (!currentItem.startTime || !currentItem.subject || !currentItem.date) {
      alert('请填写必要信息（日期、时间、科目）');
      return;
    }

    const newItem: ScheduleItem = {
      id: currentItem.id || Date.now().toString(),
      date: currentItem.date,
      type: currentItem.type || ScheduleType.CLASS,
      subject: currentItem.subject || '未命名',
      className: currentItem.className || '',
      room: currentItem.room || '',
      startTime: currentItem.startTime || '00:00',
      endTime: currentItem.endTime || '00:00',
      preTasks: currentItem.preTasks || [],
      postTasks: currentItem.postTasks || [],
    };

    if (modalMode === 'add') {
      setScheduleItems(prev => [...prev, newItem].sort((a, b) => a.startTime.localeCompare(b.startTime)));
    } else {
      setScheduleItems(prev => prev.map(item => item.id === newItem.id ? newItem : item).sort((a, b) => a.startTime.localeCompare(b.startTime)));
    }
    
    setIsModalOpen(false);
    setCurrentItem({});
  };

  const handleImportProcess = () => {
    if (!importText.trim()) return;
    
    const rows = importText.trim().split('\n');
    const newItems: ScheduleItem[] = [];

    rows.forEach(row => {
      // Expected Format (Excel Paste): Date | Subject | Start | End | Class | Room | Type | Note
      const cols = row.split(/[\t,]/).map(c => c.trim());
      if (cols.length >= 3) {
        newItems.push({
          id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
          date: cols[0].includes('-') ? cols[0] : selectedDate, // Try to parse date, fallback to selected
          subject: cols[1],
          startTime: cols[2],
          endTime: cols[3] || '',
          className: cols[4] || '',
          room: cols[5] || '',
          type: cols[6] === '值班' ? ScheduleType.DUTY : ScheduleType.CLASS,
          preTasks: [],
          postTasks: cols[7] ? [cols[7]] : []
        });
      }
    });
    
    if (newItems.length > 0) {
      setScheduleItems(prev => [...prev, ...newItems].sort((a, b) => a.startTime.localeCompare(b.startTime)));
      setIsModalOpen(false);
      setImportText('');
      alert(`已导入 ${newItems.length} 条日程`);
    } else {
      alert('无法识别日程，请检查文本格式（日期 日程 开始时间...）。');
    }
  };

  // --- Voice Logic ---
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        setIsProcessing(true);
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64Audio = (reader.result as string).split(',')[1];
          const parsedItem = await parseScheduleFromAudio(base64Audio);
          setIsProcessing(false);
          
          if (parsedItem) {
            setCurrentItem({ ...parsedItem, date: selectedDate });
            setModalMode('add');
            setIsModalOpen(true);
          } else {
            alert('未能识别语音内容，请重试。');
          }
        };
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Error accessing microphone:', err);
      alert('无法访问麦克风');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 relative">
      {/* Header */}
      <header className="bg-white px-6 py-4 shadow-sm z-10 sticky top-0">
        
        {/* Date Filter Bar */}
        <div className="flex items-center justify-between mb-4 bg-gray-100 p-1 rounded-lg">
          <button onClick={() => changeDate(-1)} className="p-2 text-gray-500 hover:bg-white hover:shadow-sm rounded-md transition-all"><ChevronLeft size={16}/></button>
          <div className="flex items-center gap-2 font-medium text-gray-700">
            <CalendarIcon size={16} />
            <input 
              type="date" 
              value={selectedDate} 
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent outline-none text-center w-28" 
            />
          </div>
          <button onClick={() => changeDate(1)} className="p-2 text-gray-500 hover:bg-white hover:shadow-sm rounded-md transition-all"><ChevronRight size={16}/></button>
        </div>

        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">日程表</h1>
            <span className="text-sm font-medium text-gray-500">
              {new Date(selectedDate).toLocaleDateString('zh-CN', { weekday: 'long', month: 'short', day: 'numeric' })}
            </span>
          </div>
          <div className="flex gap-2">
            <button 
              onMouseDown={startRecording}
              onMouseUp={stopRecording}
              onTouchStart={startRecording}
              onTouchEnd={stopRecording}
              disabled={isProcessing}
              className={`p-2 rounded-full transition-all ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              title="按住说话添加"
            >
              {isProcessing ? <Loader2 size={20} className="animate-spin" /> : isRecording ? <MicOff size={20} /> : <Mic size={20} />}
            </button>
            <button 
              onClick={() => { setModalMode('import'); setIsModalOpen(true); }}
              className="p-2 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-colors"
              title="Excel导入"
            >
              <FileInput size={20} />
            </button>
            <button 
              onClick={() => { setCurrentItem({ date: selectedDate }); setModalMode('add'); setIsModalOpen(true); }}
              className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors shadow-md"
              title="手动添加"
            >
              <Plus size={20} />
            </button>
          </div>
        </div>
        
        {/* Next Class Countdown Card (Only if selected date is today) */}
        {selectedDate === new Date().toISOString().split('T')[0] && (
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl p-4 text-white shadow-lg relative overflow-hidden transition-all hover:scale-[1.01]">
            <div className="absolute right-0 top-0 opacity-10 transform translate-x-2 -translate-y-2">
              <Clock size={100} />
            </div>
            {nextClass ? (
              <>
                <p className="text-blue-100 text-xs uppercase tracking-wider font-semibold mb-1">下一节</p>
                <div className="flex justify-between items-end">
                  <div>
                    <h2 className="text-xl font-bold">{nextClass.subject}</h2>
                    <p className="text-blue-100 text-sm">{nextClass.className} • {nextClass.room}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-3xl font-bold">{nextClass.startTime}</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="py-2">
                <h2 className="text-lg font-bold">今日课程已结束！</h2>
                <p className="text-blue-100 text-sm">休息一下，或批改作业。</p>
              </div>
            )}
          </div>
        )}
      </header>

      {/* Timeline */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="relative">
          {/* Vertical Line */}
          <div className="absolute left-[19px] top-0 bottom-0 w-0.5 bg-gray-200"></div>

          <div className="space-y-6">
            {filteredItems.map((item) => (
              <div key={item.id} className="relative flex group">
                {/* Time Node */}
                <div className="absolute left-0 top-4 w-10 flex flex-col items-center z-10">
                   <div className={`w-3 h-3 rounded-full border-2 border-white shadow-sm ${item.type === ScheduleType.CLASS ? 'bg-blue-500' : 'bg-orange-500'}`}></div>
                </div>

                {/* Content Card */}
                <div className="ml-10 flex-1">
                  <div className={`rounded-xl p-4 shadow-sm border border-gray-100 transition-all ${getBgColor(item.type)}`}>
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        {getIcon(item.type)}
                        <span className="text-xs font-bold uppercase text-gray-500 tracking-wide">
                          {item.startTime} - {item.endTime}
                        </span>
                      </div>
                      
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button onClick={() => handleEdit(item)} className="p-1 text-gray-400 hover:text-blue-600"><Edit size={14} /></button>
                         <button onClick={() => handleDelete(item.id)} className="p-1 text-gray-400 hover:text-red-600"><Trash size={14} /></button>
                      </div>
                    </div>

                    <h3 className="text-lg font-bold text-gray-800 leading-tight">{item.subject}</h3>
                    <div className="flex items-center text-gray-500 text-sm mt-1 mb-3">
                      {item.room && <><MapPin size={14} className="mr-1" />{item.room}</>}
                      {item.room && item.className && <span className="mx-2">•</span>}
                      {item.className && <><BookOpen size={14} className="mr-1" />{item.className}</>}
                    </div>

                    {/* Pre/Post Tasks */}
                    {(item.preTasks?.length > 0 || item.postTasks?.length > 0) && (
                      <div className="mt-3 space-y-2 border-t border-black/5 pt-2">
                        {item.preTasks?.map((task, idx) => (
                          <div key={`pre-${idx}`} className="flex items-center gap-2 text-sm text-red-600 bg-red-50 px-2 py-1 rounded-md w-fit">
                            <span className="text-[10px] font-bold border border-red-200 px-1 rounded bg-white">课前</span>
                            {task}
                          </div>
                        ))}
                         {item.postTasks?.map((task, idx) => (
                          <div key={`post-${idx}`} className="flex items-center gap-2 text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded-md w-fit">
                            <span className="text-[10px] font-bold border border-blue-200 px-1 rounded bg-white">课后</span>
                            {task}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {filteredItems.length === 0 && (
              <div className="text-center py-10 text-gray-400 ml-10">
                <p>该日期没有日程安排。</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Unified Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95">
             <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
               <h3 className="font-bold text-lg text-gray-800">
                 {modalMode === 'add' ? '添加日程' : modalMode === 'edit' ? '编辑日程' : 'Excel 导入'}
               </h3>
               <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={20}/></button>
             </div>
             
             <div className="p-6">
                {modalMode === 'import' ? (
                  <div className="space-y-4">
                     <p className="text-sm text-gray-500">请从 Excel 复制并粘贴数据。列顺序：<br/>日期 | 事项 | 开始 | 结束 | 班级 | 地点 | 类型 | 备注</p>
                     <textarea 
                       className="w-full h-32 p-3 bg-gray-50 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none text-xs font-mono"
                       placeholder={`2023-10-01\t数学\t08:00\t08:45\t高一3班\t301\t课程\t记得收作业`}
                       value={importText}
                       onChange={(e) => setImportText(e.target.value)}
                     ></textarea>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase block mb-1">日期</label>
                      <input 
                        type="date" 
                        className="w-full p-2 bg-gray-50 rounded border text-sm"
                        value={currentItem.date || selectedDate}
                        onChange={(e) => setCurrentItem({...currentItem, date: e.target.value})}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-gray-500 uppercase block mb-1">开始时间</label>
                        <input 
                          type="time" 
                          className="w-full p-2 bg-gray-50 rounded border text-sm"
                          value={currentItem.startTime || ''}
                          onChange={(e) => setCurrentItem({...currentItem, startTime: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-500 uppercase block mb-1">结束时间</label>
                        <input 
                          type="time" 
                          className="w-full p-2 bg-gray-50 rounded border text-sm"
                          value={currentItem.endTime || ''}
                          onChange={(e) => setCurrentItem({...currentItem, endTime: e.target.value})}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase block mb-1">科目 / 事项</label>
                      <input 
                        type="text" 
                        className="w-full p-2 bg-gray-50 rounded border text-sm font-medium"
                        placeholder="例如：数学"
                        value={currentItem.subject || ''}
                        onChange={(e) => setCurrentItem({...currentItem, subject: e.target.value})}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                         <label className="text-xs font-bold text-gray-500 uppercase block mb-1">班级</label>
                         <select 
                            className="w-full p-2 bg-gray-50 rounded border text-sm appearance-none"
                            value={currentItem.className || ''}
                            onChange={(e) => setCurrentItem({...currentItem, className: e.target.value})}
                          >
                            <option value="">选择班级</option>
                            {userProfile.myClasses.map(c => <option key={c} value={c}>{c}</option>)}
                         </select>
                      </div>
                      <div>
                         <label className="text-xs font-bold text-gray-500 uppercase block mb-1">地点</label>
                         <select 
                            className="w-full p-2 bg-gray-50 rounded border text-sm appearance-none"
                            value={currentItem.room || ''}
                            onChange={(e) => setCurrentItem({...currentItem, room: e.target.value})}
                          >
                            <option value="">选择地点</option>
                            {userProfile.myLocations.map(l => <option key={l} value={l}>{l}</option>)}
                         </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase block mb-1">类型</label>
                      <div className="flex gap-2">
                        {[ScheduleType.CLASS, ScheduleType.DUTY, ScheduleType.BREAK].map(type => (
                           <button 
                             key={type}
                             onClick={() => setCurrentItem({...currentItem, type})}
                             className={`flex-1 py-1.5 text-xs font-bold rounded border ${currentItem.type === type ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200'}`}
                           >
                             {type === ScheduleType.CLASS ? '课程' : type === ScheduleType.DUTY ? '值班' : '休息'}
                           </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase block mb-1">任务备注 (逗号分隔)</label>
                      <input 
                         type="text"
                         className="w-full p-2 bg-gray-50 rounded border text-sm mb-2"
                         placeholder="课前任务 (例如：收作业)"
                         value={currentItem.preTasks?.join(',') || ''}
                         onChange={(e) => setCurrentItem({...currentItem, preTasks: e.target.value.split(',').filter(Boolean)})}
                      />
                      <input 
                         type="text"
                         className="w-full p-2 bg-gray-50 rounded border text-sm"
                         placeholder="课后任务 (例如：布置试卷)"
                         value={currentItem.postTasks?.join(',') || ''}
                         onChange={(e) => setCurrentItem({...currentItem, postTasks: e.target.value.split(',').filter(Boolean)})}
                      />
                    </div>
                  </div>
                )}
             </div>

             <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3">
               <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 font-medium text-sm hover:bg-gray-200 rounded-lg">取消</button>
               <button 
                 onClick={handleSave}
                 disabled={isProcessing}
                 className="px-6 py-2 bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 rounded-lg shadow flex items-center gap-2 disabled:opacity-50"
               >
                 {isProcessing && <Loader2 size={14} className="animate-spin" />}
                 {modalMode === 'import' ? '确认导入' : '保存'}
               </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScheduleTab;
