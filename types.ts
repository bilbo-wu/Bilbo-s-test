
export enum TaskCategory {
  URGENT = 'URGENT', // Red - Admin/Urgent
  TEACHING = 'TEACHING', // Blue - Prep/Grading
  STUDENT = 'STUDENT', // Green - Communication
  LIFE = 'LIFE', // Amber - Personal
}

export enum ScheduleType {
  CLASS = 'CLASS',
  DUTY = 'DUTY', // Morning reading, Evening study, Dorm check
  BREAK = 'BREAK',
}

export interface UserProfile {
  name: string;
  myClasses: string[]; // List of classes managed by the teacher
  myLocations: string[]; // List of common locations
}

export interface Student {
  id: string;
  name: string;
  className: string;
  avatarUrl?: string;
  gender?: '男' | '女';
  parentContact?: string;
  dormNumber?: string;
}

export interface LogEntry {
  id: string;
  studentId: string;
  content: string;
  timestamp: Date;
  followUpNeeded: boolean;
  isResolved: boolean;
}

export interface Task {
  id: string;
  content: string;
  category: TaskCategory;
  isCompleted: boolean;
  dueDate: 'TODAY' | 'TOMORROW' | 'WEEK';
  dueDateTime?: string; // ISO String for specific date time
  linkedStudentId?: string; // Optional linking to a student
}

export interface ScheduleItem {
  id: string;
  date: string; // YYYY-MM-DD
  type: ScheduleType;
  subject?: string;
  className?: string; // e.g. "Grade 10 (3)"
  room?: string;
  startTime: string; // "08:00"
  endTime: string; // "08:45"
  preTasks: string[]; // Quick reminders before class
  postTasks: string[]; // Quick reminders after class
}

export interface Memo {
  id: string;
  content: string;
  createdAt: Date;
}
