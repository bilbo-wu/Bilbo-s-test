
import React, { useState } from 'react';
import { Search, ChevronDown, ChevronRight, MessageSquarePlus, AlertCircle, Wand2, Upload, User, Phone, Home, X } from 'lucide-react';
import { MOCK_LOGS } from '../constants';
import { Student, LogEntry, UserProfile } from '../types';
import { generateParentMessage } from '../services/geminiService';

interface StudentsTabProps {
  students: Student[];
  setStudents: React.Dispatch<React.SetStateAction<Student[]>>;
  userProfile: UserProfile;
}

const StudentsTab: React.FC<StudentsTabProps> = ({ students, setStudents, userProfile }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedClass, setExpandedClass] = useState<string | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>(MOCK_LOGS);
  
  // Import State
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importText, setImportText] = useState('');
  
  // New Log State
  const [logContent, setLogContent] = useState('');
  const [followUp, setFollowUp] = useState(false);
  
  // AI Draft State
  const [drafting, setDrafting] = useState(false);
  const [draftedMessage, setDraftedMessage] = useState('');

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.className.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Group by class
  const groupedStudents = filteredStudents.reduce((acc, student) => {
    if (!acc[student.className]) acc[student.className] = [];
    acc[student.className].push(student);
    return acc;
  }, {} as Record<string, Student[]>);

  const handleAddLog = () => {
    if (!selectedStudent || !logContent.trim()) return;
    
    const newLog: LogEntry = {
      id: Date.now().toString(),
      studentId: selectedStudent.id,
      content: logContent,
      timestamp: new Date(),
      followUpNeeded: followUp,
      isResolved: false
    };
    
    setLogs([newLog, ...logs]);
    setLogContent('');
    setFollowUp(false);
  };

  const handleDraftMessage = async () => {
    if (!selectedStudent || !logContent.trim()) return;
    setDrafting(true);
    const msg = await generateParentMessage(selectedStudent.name, logContent, 'friendly');
    setDraftedMessage(msg);
    setDrafting(false);
  };

  const handleImport = () => {
    if (!importText.trim()) return;
    
    const rows = importText.trim().split('\n');
    const newStudents: Student[] = [];
    
    rows.forEach(row => {
      // Assuming Tab or Comma separated
      // Format: Name, Class, Gender, Contact, Dorm
      const cols = row.split(/[\t,]/).map(c => c.trim());
      if (cols.length >= 2) {
        newStudents.push({
          id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
          name: cols[0],
          className: cols[1],
          gender: (cols[2] as '男'|'女') || undefined,
          parentContact: cols[3] || undefined,
          dormNumber: cols[4] || undefined
        });
      }
    });

    if (newStudents.length > 0) {
      setStudents([...students, ...newStudents]);
      setIsImportModalOpen(false);
      setImportText('');
      alert(`成功导入 ${newStudents.length} 名学生`);
    } else {
      alert('无法解析数据，请检查格式');
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <header className="bg-white px-6 py-6 shadow-sm z-10 sticky top-0 flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">学生管理</h1>
          <button 
            onClick={() => setIsImportModalOpen(true)}
            className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100"
          >
            <Upload size={16} /> 导入Excel
          </button>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="搜索学生..." 
            className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </header>

      <div className="flex-1 p-6 overflow-y-auto">
        {Object.entries(groupedStudents).map(([className, students]) => (
          <div key={className} className="mb-4 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <button 
              onClick={() => setExpandedClass(expandedClass === className ? null : className)}
              className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <span className="font-bold text-gray-700">{className}</span>
              <div className="flex items-center gap-2">
                 <span className="text-xs text-gray-400">{students.length}人</span>
                 {expandedClass === className ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
              </div>
            </button>
            
            {expandedClass === className && (
              <div className="divide-y divide-gray-100">
                {students.map(student => (
                  <button 
                    key={student.id} 
                    onClick={() => setSelectedStudent(student)}
                    className="w-full p-4 flex items-center justify-between hover:bg-gray-50 group text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${student.gender === '女' ? 'bg-pink-100 text-pink-600' : 'bg-blue-100 text-blue-600'}`}>
                        {student.name.slice(0, 1)}
                      </div>
                      <span className="font-medium text-gray-800">{student.name}</span>
                    </div>
                    <div className="text-gray-300 group-hover:text-blue-600 transition-colors">
                      <MessageSquarePlus size={20} />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Import Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg">批量导入学生</h3>
              <button onClick={() => setIsImportModalOpen(false)}><X size={20} className="text-gray-400" /></button>
            </div>
            <p className="text-sm text-gray-500 mb-2">请从 Excel 复制并粘贴数据。列顺序：<br/>姓名 | 班级 | 性别 | 家长联系方式 | 宿舍号</p>
            <textarea
              className="w-full h-40 bg-gray-50 border rounded-lg p-2 text-xs font-mono mb-4"
              placeholder={`张三\t高一(3)班\t男\t13800001234\t101\n李四\t高一(3)班\t女\t13900005678\t202`}
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
            ></textarea>
            <button 
              onClick={handleImport}
              className="w-full py-2 bg-blue-600 text-white rounded-lg font-bold"
            >
              确认导入
            </button>
          </div>
        </div>
      )}

      {/* Student Profile Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-5 max-h-[90vh] flex flex-col">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-lg">学生档案</h3>
              <button onClick={() => { setSelectedStudent(null); setDraftedMessage(''); }} className="text-gray-400 hover:text-gray-600"><X size={20}/></button>
            </div>

            <div className="overflow-y-auto p-5">
               {/* Profile Card */}
               <div className="flex items-start gap-4 mb-6">
                 <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold ${selectedStudent.gender === '女' ? 'bg-pink-100 text-pink-600' : 'bg-blue-100 text-blue-600'}`}>
                    {selectedStudent.name.slice(0, 1)}
                 </div>
                 <div className="flex-1 space-y-1">
                   <h2 className="text-xl font-bold text-gray-800">{selectedStudent.name} <span className="text-sm font-normal text-gray-500 ml-2">{selectedStudent.className}</span></h2>
                   <div className="flex flex-wrap gap-2 text-sm text-gray-600">
                     {selectedStudent.dormNumber && <span className="flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded"><Home size={12}/> {selectedStudent.dormNumber}室</span>}
                     {selectedStudent.parentContact && <span className="flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded"><Phone size={12}/> {selectedStudent.parentContact}</span>}
                   </div>
                 </div>
               </div>

               <hr className="border-gray-100 mb-4" />

               {/* Log Input */}
               <div className="mb-6">
                 <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">新增观察记录</label>
                 <textarea 
                    className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm mb-2"
                    rows={3}
                    placeholder="记录观察情况..."
                    value={logContent}
                    onChange={(e) => setLogContent(e.target.value)}
                 ></textarea>

                 <div className="flex items-center gap-2 mb-3">
                   <input 
                     type="checkbox" 
                     id="followUp" 
                     checked={followUp} 
                     onChange={(e) => setFollowUp(e.target.checked)}
                     className="rounded text-blue-600 focus:ring-blue-500"
                   />
                   <label htmlFor="followUp" className="text-sm text-gray-600 flex items-center gap-1">
                     <AlertCircle size={14} className="text-orange-500" /> 添加待办 (需要跟进)
                   </label>
                 </div>
                 
                 <div className="grid grid-cols-2 gap-3">
                   <button 
                     onClick={handleDraftMessage}
                     disabled={drafting || !logContent}
                     className="flex items-center justify-center gap-2 py-2 px-4 rounded-lg border border-purple-200 bg-purple-50 text-purple-700 font-medium text-sm hover:bg-purple-100 transition-colors disabled:opacity-50"
                   >
                     {drafting ? '生成中...' : <><Wand2 size={16} /> AI 生成短信</>}
                   </button>
                   <button 
                     onClick={handleAddLog}
                     disabled={!logContent}
                     className="py-2 px-4 rounded-lg bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 disabled:opacity-50"
                   >
                     保存记录
                   </button>
                 </div>

                 {draftedMessage && (
                   <div className="mt-3 p-3 bg-purple-50 rounded-lg border border-purple-100">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-bold text-purple-800 uppercase">AI 建议</span>
                        <button 
                          onClick={() => navigator.clipboard.writeText(draftedMessage)}
                          className="text-xs text-purple-600 underline"
                        >复制</button>
                      </div>
                      <p className="text-sm text-gray-700 italic">"{draftedMessage}"</p>
                   </div>
                 )}
               </div>

               {/* History */}
               <div>
                 <h4 className="text-xs font-bold text-gray-500 uppercase mb-3">历史记录</h4>
                 <div className="space-y-3">
                   {logs.filter(l => l.studentId === selectedStudent.id).map(log => (
                     <div key={log.id} className="text-sm p-3 bg-gray-50 rounded-lg border border-gray-100">
                        <div className="flex justify-between items-center mb-1">
                           <span className="text-xs text-gray-400">{log.timestamp.toLocaleDateString()}</span>
                           {log.followUpNeeded && <span className="text-[10px] bg-orange-100 text-orange-600 px-1 rounded">需跟进</span>}
                        </div>
                        <p className="text-gray-700">{log.content}</p>
                     </div>
                   ))}
                   {logs.filter(l => l.studentId === selectedStudent.id).length === 0 && (
                     <p className="text-center text-gray-400 text-xs py-2">暂无历史记录</p>
                   )}
                 </div>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentsTab;
