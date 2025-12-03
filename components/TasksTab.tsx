import React, { useState } from 'react';
import { Plus, Trash2, Calendar, User, CheckCircle2, Circle, Clock, CheckSquare } from 'lucide-react';
import { Task, TaskCategory } from '../types';
import { CATEGORY_COLORS, CATEGORY_LABELS } from '../constants';

interface TasksTabProps {
  tasks: Task[];
  onAddTask: (task: Task, syncToSchedule: boolean) => void;
  onToggleTask: (id: string) => void;
}

const TasksTab: React.FC<TasksTabProps> = ({ tasks, onAddTask, onToggleTask }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newTaskContent, setNewTaskContent] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<TaskCategory>(TaskCategory.URGENT);
  
  // New States for enhanced task creation
  const [dueDateTime, setDueDateTime] = useState('');
  const [syncToSchedule, setSyncToSchedule] = useState(false);

  const handleAddTaskClick = () => {
    if (!newTaskContent.trim()) return;
    
    // Determine generic due date label from the datetime if possible, or fallback to TODAY
    let genericDueDate: 'TODAY' | 'TOMORROW' | 'WEEK' = 'TODAY';
    if (dueDateTime) {
      const date = new Date(dueDateTime);
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      if (date.toDateString() === today.toDateString()) genericDueDate = 'TODAY';
      else if (date.toDateString() === tomorrow.toDateString()) genericDueDate = 'TOMORROW';
      else genericDueDate = 'WEEK';
    }

    const newTask: Task = {
      id: Date.now().toString(),
      content: newTaskContent,
      category: selectedCategory,
      isCompleted: false,
      dueDate: genericDueDate,
      dueDateTime: dueDateTime || undefined,
    };
    
    onAddTask(newTask, syncToSchedule);
    
    // Reset state
    setNewTaskContent('');
    setDueDateTime('');
    setSyncToSchedule(false);
    setIsAdding(false);
  };

  const activeTasks = tasks.filter(t => !t.isCompleted);
  const completedTasks = tasks.filter(t => t.isCompleted);

  const getDueDateLabel = (task: Task) => {
    if (task.dueDateTime) {
      const date = new Date(task.dueDateTime);
      return date.toLocaleString('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    }
    
    switch (task.dueDate) {
      case 'TODAY': return '今天';
      case 'TOMORROW': return '明天';
      case 'WEEK': return '本周';
      default: return task.dueDate;
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <header className="bg-white px-6 py-6 shadow-sm sticky top-0 z-10">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">待办事项</h1>
          <button 
            onClick={() => setIsAdding(!isAdding)}
            className="bg-blue-600 text-white rounded-full p-2 hover:bg-blue-700 transition-colors shadow-md"
          >
            <Plus size={24} />
          </button>
        </div>

        {/* Categories Legend */}
        <div className="flex gap-2 mt-4 overflow-x-auto pb-2 scrollbar-hide">
          {Object.values(TaskCategory).map(cat => (
             <span key={cat} className={`text-[10px] px-2 py-1 rounded-full border whitespace-nowrap font-medium ${CATEGORY_COLORS[cat]}`}>
               {CATEGORY_LABELS[cat]}
             </span>
          ))}
        </div>
      </header>

      {/* Quick Add Modal/Area */}
      {isAdding && (
        <div className="p-4 bg-white border-b border-gray-200 animate-in slide-in-from-top-2">
          <input
            autoFocus
            type="text"
            placeholder="有什么需要完成的？"
            className="w-full text-lg font-medium placeholder:text-gray-300 outline-none mb-3"
            value={newTaskContent}
            onChange={(e) => setNewTaskContent(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddTaskClick()}
          />
          
          <div className="flex flex-col gap-3 mb-4">
             {/* DateTime Picker */}
             <div className="flex items-center gap-2 text-gray-500 bg-gray-50 p-2 rounded-lg">
                <Clock size={16} />
                <input 
                  type="datetime-local" 
                  className="bg-transparent text-sm w-full outline-none"
                  value={dueDateTime}
                  onChange={(e) => setDueDateTime(e.target.value)}
                />
             </div>

             {/* Sync Toggle */}
             <div className="flex items-center gap-2">
               <button 
                 onClick={() => setSyncToSchedule(!syncToSchedule)}
                 className={`flex items-center gap-2 text-sm px-3 py-1.5 rounded-full border transition-all ${syncToSchedule ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-gray-50 border-gray-200 text-gray-500'}`}
               >
                  <CheckSquare size={14} className={syncToSchedule ? 'fill-current' : ''} />
                  同步至日程
               </button>
             </div>
          </div>

          <div className="flex justify-between items-center">
             <div className="flex gap-2">
                {(Object.keys(CATEGORY_LABELS) as TaskCategory[]).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`w-6 h-6 rounded-full border-2 ${selectedCategory === cat ? 'ring-2 ring-offset-1 ring-gray-400' : 'opacity-60'} ${CATEGORY_COLORS[cat].split(' ')[0]} border-transparent`}
                  />
                ))}
             </div>
             <button 
               onClick={handleAddTaskClick}
               className="px-4 py-1.5 bg-gray-900 text-white text-sm font-semibold rounded-lg"
             >
               添加
             </button>
          </div>
        </div>
      )}

      {/* Task List */}
      <div className="flex-1 p-6 overflow-y-auto space-y-6">
        
        {/* Active */}
        <div className="space-y-3">
          {activeTasks.length === 0 && !isAdding && (
             <div className="text-center py-10 text-gray-400">
                <CheckCircle2 size={48} className="mx-auto mb-2 opacity-20" />
                <p>暂时没有待办事项！</p>
             </div>
          )}
          {activeTasks.map(task => (
            <div key={task.id} className="group bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all flex gap-3 items-start">
              <button 
                onClick={() => onToggleTask(task.id)}
                className="mt-0.5 text-gray-300 hover:text-blue-600 transition-colors"
              >
                <Circle size={22} />
              </button>
              
              <div className="flex-1">
                <p className="text-gray-800 font-medium leading-snug">{task.content}</p>
                <div className="flex flex-wrap gap-2 mt-2 items-center">
                  <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold border ${CATEGORY_COLORS[task.category]}`}>
                    {CATEGORY_LABELS[task.category].split('/')[0]}
                  </span>
                  
                  {task.linkedStudentId && (
                    <span className="flex items-center gap-1 text-[10px] font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">
                      <User size={10} /> 关联学生
                    </span>
                  )}
                  
                  <span className="flex items-center gap-1 text-[10px] font-medium text-gray-400">
                    <Calendar size={10} /> {getDueDateLabel(task)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Completed */}
        {completedTasks.length > 0 && (
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">已完成</h3>
            <div className="space-y-2 opacity-60">
              {completedTasks.map(task => (
                <div key={task.id} className="flex gap-3 items-center p-3 rounded-lg bg-gray-50 border border-transparent">
                  <button onClick={() => onToggleTask(task.id)} className="text-green-600">
                    <CheckCircle2 size={20} />
                  </button>
                  <span className="text-gray-500 line-through text-sm">{task.content}</span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default TasksTab;