
import React, { useState } from 'react';
import Layout from './components/Layout';
import ScheduleTab from './components/ScheduleTab';
import TasksTab from './components/TasksTab';
import StudentsTab from './components/StudentsTab';
import MemoTab from './components/MemoTab';
import ProfileTab from './components/ProfileTab';
import { MOCK_SCHEDULE, MOCK_TASKS, MOCK_STUDENTS, MOCK_USER_PROFILE } from './constants';
import { ScheduleItem, Task, ScheduleType, Student, UserProfile } from './types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('schedule');
  
  // Global State
  const [userProfile, setUserProfile] = useState<UserProfile>(MOCK_USER_PROFILE);
  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>(MOCK_SCHEDULE);
  const [tasks, setTasks] = useState<Task[]>(MOCK_TASKS);
  const [students, setStudents] = useState<Student[]>(MOCK_STUDENTS);

  // Handler to add a task, optionally syncing to schedule
  const handleAddTask = (newTask: Task, syncToSchedule: boolean) => {
    setTasks(prev => [newTask, ...prev]);

    if (syncToSchedule && newTask.dueDateTime) {
      const dateObj = new Date(newTask.dueDateTime);
      const dateStr = dateObj.toISOString().split('T')[0]; // YYYY-MM-DD
      const startTime = dateObj.toTimeString().slice(0, 5); // HH:mm
      
      // Default duration 45 mins
      const endDateObj = new Date(dateObj.getTime() + 45 * 60000);
      const endTime = endDateObj.toTimeString().slice(0, 5);

      const newScheduleItem: ScheduleItem = {
        id: `sync-${newTask.id}`,
        date: dateStr,
        type: ScheduleType.DUTY, // Default to DUTY for tasks
        subject: newTask.content,
        className: '',
        room: '',
        startTime: startTime,
        endTime: endTime,
        preTasks: [],
        postTasks: []
      };

      setScheduleItems(prev => [...prev, newScheduleItem].sort((a, b) => a.startTime.localeCompare(b.startTime)));
    }
  };

  const handleToggleTask = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, isCompleted: !t.isCompleted } : t));
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'schedule':
        return <ScheduleTab 
                 items={scheduleItems} 
                 setItems={setScheduleItems}
                 userProfile={userProfile}
               />;
      case 'tasks':
        return <TasksTab 
                 tasks={tasks} 
                 onAddTask={handleAddTask} 
                 onToggleTask={handleToggleTask} 
               />;
      case 'students':
        return <StudentsTab 
                 students={students} 
                 setStudents={setStudents}
                 userProfile={userProfile}
               />;
      case 'memo':
        return <MemoTab />;
      case 'profile':
        return <ProfileTab userProfile={userProfile} setUserProfile={setUserProfile} />;
      default:
        return <ScheduleTab 
                 items={scheduleItems} 
                 setItems={setScheduleItems} 
                 userProfile={userProfile}
               />;
    }
  };

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      {renderContent()}
    </Layout>
  );
};

export default App;
