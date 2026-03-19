import { GoogleGenAI, ThinkingLevel } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export async function analyzeSleepScreenshot(base64Image: string): Promise<{
  durationMinutes: number;
  sourceType: 'watch' | 'screentime';
  confidence: number;
  explanation: string;
}> {
  const model = "gemini-3-flash-preview";
  
  const prompt = `
    你是一个睡眠数据分析专家。请分析这张截图并提取睡眠时长。
    
    截图可能是以下两种之一：
    1. 手表/健康应用的睡眠详情页：直接显示睡眠时长（如 "7小时30分" 或 "7h 30m"）。
    2. 手机的屏幕使用时间（Screen Time）统计页：请重点观察 23:00 到次日 09:00 之间的数据。请【最大程度地推算】睡眠时长：识别出主要的睡眠时间段，即使中间有极短的、零星的屏幕活动（通常是半夜醒来查看手机），也应将其视为同一段睡眠过程。请找出从入睡到彻底醒来之间的总时长。
    
    请返回以下 JSON 格式的数据：
    {
      "durationMinutes": 数字（总睡眠分钟数）,
      "sourceType": "watch" 或 "screentime",
      "confidence": 0到1之间的数字（置信度）,
      "explanation": "简短的分析说明"
    }
    
    如果无法识别，请在 explanation 中说明原因，并将 durationMinutes 设为 0。
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: [
        {
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: "image/jpeg",
                data: base64Image.split(',')[1] || base64Image
              }
            }
          ]
        }
      ],
      config: {
        responseMimeType: "application/json",
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW }
      }
    });

    const result = JSON.parse(response.text || '{}');
    return {
      durationMinutes: result.durationMinutes || 0,
      sourceType: result.sourceType || 'watch',
      confidence: result.confidence || 0,
      explanation: result.explanation || "未识别到有效数据"
    };
  } catch (error) {
    console.error("Gemini analysis error:", error);
    return {
      durationMinutes: 0,
      sourceType: 'watch',
      confidence: 0,
      explanation: "分析过程中出错，请重试。"
    };
  }
}
