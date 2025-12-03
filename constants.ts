
import { ScheduleItem, ScheduleType, Student, Task, TaskCategory, LogEntry, UserProfile } from './types';

export const MOCK_USER_PROFILE: UserProfile = {
  name: '王老师',
  myClasses: ['高一(3)班', '高二(5)班'],
  myLocations: ['301教室', '402教室', '年级办公室', '操场'],
};

export const MOCK_STUDENTS: Student[] = [
  { id: 's1', name: '张爱丽', className: '高一(3)班', gender: '女', parentContact: '13800138000', dormNumber: '201' },
  { id: 's2', name: '李博', className: '高一(3)班', gender: '男', parentContact: '13900139000', dormNumber: '105' },
  { id: 's3', name: '王查理', className: '高一(3)班', gender: '男', parentContact: '13700137000', dormNumber: '106' },
  { id: 's4', name: '陈大卫', className: '高二(5)班', gender: '男', parentContact: '13600136000', dormNumber: '302' },
  { id: 's5', name: '吴伊娃', className: '高二(5)班', gender: '女', parentContact: '13500135000', dormNumber: '401' },
];

const today = new Date().toISOString().split('T')[0];

export const MOCK_SCHEDULE: ScheduleItem[] = [
  {
    id: 'sch1',
    date: today,
    type: ScheduleType.DUTY,
    subject: '早读值班',
    className: '高一(3)班',
    room: '301教室',
    startTime: '07:00',
    endTime: '07:45',
    preTasks: [],
    postTasks: ['检查考勤'],
  },
  {
    id: 'sch2',
    date: today,
    type: ScheduleType.CLASS,
    subject: '数学',
    className: '高一(3)班',
    room: '301教室',
    startTime: '08:00',
    endTime: '08:45',
    preTasks: ['收作业'],
    postTasks: ['布置周末卷'],
  },
  {
    id: 'sch3',
    date: today,
    type: ScheduleType.CLASS,
    subject: '数学',
    className: '高二(5)班',
    room: '402教室',
    startTime: '10:00',
    endTime: '10:45',
    preTasks: ['带三角板'],
    postTasks: [],
  },
  {
    id: 'sch4',
    date: today,
    type: ScheduleType.DUTY,
    subject: '晚自习',
    className: '高一(3)班',
    room: '301教室',
    startTime: '19:00',
    endTime: '21:00',
    preTasks: [],
    postTasks: ['关窗锁门'],
  },
];

export const MOCK_TASKS: Task[] = [
  {
    id: 't1',
    content: '提交月度考勤表',
    category: TaskCategory.URGENT,
    isCompleted: false,
    dueDate: 'TODAY',
  },
  {
    id: 't2',
    content: '批改高一(3)班期中试卷',
    category: TaskCategory.TEACHING,
    isCompleted: false,
    dueDate: 'WEEK',
  },
  {
    id: 't3',
    content: '联系张爱丽家长沟通数学成绩',
    category: TaskCategory.STUDENT,
    isCompleted: false,
    dueDate: 'TODAY',
    linkedStudentId: 's1',
  },
];

export const MOCK_LOGS: LogEntry[] = [
  {
    id: 'l1',
    studentId: 's1',
    content: '数学课上看起来心不在焉，一直看窗外。',
    timestamp: new Date(Date.now() - 86400000), // Yesterday
    followUpNeeded: true,
    isResolved: false,
  },
];

export const CATEGORY_COLORS = {
  [TaskCategory.URGENT]: 'bg-red-100 text-red-800 border-red-200',
  [TaskCategory.TEACHING]: 'bg-blue-100 text-blue-800 border-blue-200',
  [TaskCategory.STUDENT]: 'bg-green-100 text-green-800 border-green-200',
  [TaskCategory.LIFE]: 'bg-amber-100 text-amber-800 border-amber-200',
};

export const CATEGORY_LABELS = {
  [TaskCategory.URGENT]: '紧急/行政',
  [TaskCategory.TEACHING]: '教学/备课',
  [TaskCategory.STUDENT]: '学生/家长',
  [TaskCategory.LIFE]: '个人/琐事',
};
