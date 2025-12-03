
import React from 'react';
import { Calendar, CheckSquare, Users, PenTool, UserCircle } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, onTabChange }) => {
  return (
    <div className="flex flex-col h-screen bg-gray-50 max-w-md mx-auto shadow-2xl overflow-hidden relative">
      {/* Content Area */}
      <main className="flex-1 overflow-y-auto pb-20 scroll-smooth">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="absolute bottom-0 w-full bg-white border-t border-gray-200 h-16 flex items-center justify-around z-50 pb-safe">
        <button
          onClick={() => onTabChange('schedule')}
          className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
            activeTab === 'schedule' ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <Calendar size={24} strokeWidth={activeTab === 'schedule' ? 2.5 : 2} />
          <span className="text-[10px] font-medium">日程</span>
        </button>

        <button
          onClick={() => onTabChange('tasks')}
          className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
            activeTab === 'tasks' ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <CheckSquare size={24} strokeWidth={activeTab === 'tasks' ? 2.5 : 2} />
          <span className="text-[10px] font-medium">待办</span>
        </button>

        <button
          onClick={() => onTabChange('students')}
          className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
            activeTab === 'students' ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <Users size={24} strokeWidth={activeTab === 'students' ? 2.5 : 2} />
          <span className="text-[10px] font-medium">学生</span>
        </button>

        <button
          onClick={() => onTabChange('memo')}
          className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
            activeTab === 'memo' ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <PenTool size={24} strokeWidth={activeTab === 'memo' ? 2.5 : 2} />
          <span className="text-[10px] font-medium">速记</span>
        </button>

        <button
          onClick={() => onTabChange('profile')}
          className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
            activeTab === 'profile' ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <UserCircle size={24} strokeWidth={activeTab === 'profile' ? 2.5 : 2} />
          <span className="text-[10px] font-medium">我的</span>
        </button>
      </nav>
    </div>
  );
};

export default Layout;
