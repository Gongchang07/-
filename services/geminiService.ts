import { GoogleGenAI } from "@google/genai";
import { Category, TimeLog } from "../types";

const apiKey = process.env.API_KEY || '';

export const generateProductivityInsight = async (
  logs: TimeLog[],
  categories: Category[]
): Promise<string> => {
  if (!apiKey) {
    return "未检测到 API Key，请配置后获取 AI 建议。";
  }

  // Aggregate data for the prompt
  const summary: Record<string, number> = {};
  const detailedBreakdown: string[] = [];

  logs.forEach(log => {
    const cat = categories.find((c) => c.id === log.categoryId);
    const catName = cat?.name || '未知';
    
    // Aggregate main category totals
    summary[catName] = (summary[catName] || 0) + log.durationSeconds;

    // Record detailed entry (for more context)
    let entryName = catName;
    if (log.subCategoryId && cat?.subCategories) {
      const subName = cat.subCategories.find(s => s.id === log.subCategoryId)?.name;
      if (subName) {
        entryName = `${catName}-${subName}`;
      }
    }
    detailedBreakdown.push(`${entryName}: ${Math.round(log.durationSeconds / 60)}分钟`);
  });

  let promptData = "这是我今天的时间投入情况：\n";
  // Use aggregated for main structure, but provide details if useful
  for (const [name, seconds] of Object.entries(summary)) {
    const minutes = Math.round(seconds / 60);
    promptData += `- ${name}: 共 ${minutes} 分钟\n`;
  }

  promptData += "\n详细记录:\n" + detailedBreakdown.join(", ");

  const prompt = `
    ${promptData}
    
    作为一个专业且贴心的效率教练。
    1. 分析我今天的时间分配，注意我具体的活动内容（如子分类）。
    2. 给出一个简短且鼓舞人心的观察。
    3. 基于此分布，为明天提供一个可执行的建议。
    
    请用中文回答，保持语气友好专业，总字数控制在150字以内。
  `;

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "暂时无法生成建议。";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "抱歉，目前无法连接到 AI 教练。";
  }
};