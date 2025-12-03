import { GoogleGenAI } from "@google/genai";
import { TaskCategory, ScheduleItem, ScheduleType } from "../types";

const apiKey = process.env.API_KEY || '';

const ai = new GoogleGenAI({ apiKey });

export const generateParentMessage = async (
  studentName: string,
  logContent: string,
  tone: 'formal' | 'friendly' | 'concerned'
): Promise<string> => {
  if (!apiKey) return "API Key 缺失，请配置。";

  const prompt = `
    角色: 你是一位经验丰富、专业但平易近人的中国高中班主任。
    任务: 给家长写一条简短的反馈信息（类似微信/短信风格，100字以内）。
    上下文:
    - 学生姓名: ${studentName}
    - 观察情况: ${logContent}
    - 语气: ${tone === 'formal' ? '正式' : tone === 'friendly' ? '亲切友好' : '关切严肃'}
    
    只输出短信内容，不要包含标题或占位符。请使用中文。
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "无法生成消息。";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "生成消息出错，请检查网络。";
  }
};

export const analyzeMemo = async (memoContent: string): Promise<{ suggestedCategory: TaskCategory, polishedText: string } | null> => {
  if (!apiKey) return null;

  const prompt = `
    分析这条老师的速记内容: "${memoContent}"。
    1. 将其分类为以下之一: URGENT (紧急/行政), TEACHING (教学/备课), STUDENT (学生/家长), LIFE (个人/琐事)。
    2. 将文本润色为一个清晰、可执行的待办事项标题（使用中文）。
    
    返回 JSON 格式: {"suggestedCategory": "...", "polishedText": "..."}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { responseMimeType: 'application/json' }
    });
    
    const text = response.text;
    if (!text) return null;
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini Parsing Error:", error);
    return null;
  }
};

export const parseScheduleFromText = async (text: string): Promise<ScheduleItem[]> => {
  if (!apiKey) return [];

  const prompt = `
    你是一个日程助手。请从以下文本中提取日程安排，并转换为 JSON 数组。
    文本: "${text}"
    
    要求:
    1. 每个日程项包含: subject (科目/事项), className (班级), room (地点), startTime (HH:mm), endTime (HH:mm), type (CLASS, DUTY, BREAK)。
    2. 如果没有具体时间，请根据上下文推断或留空。
    3. preTasks 和 postTasks 为空数组。
    4. 今天的日期假设为今天。
    
    返回 JSON 格式: [{ "subject": "...", "startTime": "...", ... }]
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { responseMimeType: 'application/json' }
    });
    
    const responseText = response.text;
    if (!responseText) return [];
    
    const items = JSON.parse(responseText);
    // Add IDs and ensure defaults
    return items.map((item: any) => ({
      ...item,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
      preTasks: item.preTasks || [],
      postTasks: item.postTasks || [],
      type: item.type || ScheduleType.CLASS
    }));
  } catch (error) {
    console.error("Gemini Schedule Parse Error:", error);
    return [];
  }
};

export const parseScheduleFromAudio = async (audioBase64: string): Promise<Partial<ScheduleItem> | null> => {
  if (!apiKey) return null;

  const prompt = `
    请听这段语音，提取其中的日程信息。
    返回一个 JSON 对象，包含: 
    - subject (科目或事项名称)
    - className (班级，如高一3班)
    - room (教室/地点)
    - startTime (开始时间 HH:mm)
    - endTime (结束时间 HH:mm)
    - type (CLASS, DUTY, BREAK - 默认为 CLASS)
    - preTasks (提到的课前任务，数组)
    - postTasks (提到的课后任务，数组)
    
    如果缺少某些信息，请留空。
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          { inlineData: { mimeType: "audio/webm", data: audioBase64 } },
          { text: prompt }
        ]
      },
      config: { responseMimeType: 'application/json' }
    });
    
    const text = response.text;
    if (!text) return null;
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini Audio Parse Error:", error);
    return null;
  }
};