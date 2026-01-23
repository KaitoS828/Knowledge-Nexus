import { GoogleGenAI } from "@google/genai";

const getApiKey = () => {
    return import.meta.env.VITE_GEMINI_API_KEY || '';
};

export interface ExtractedDocument {
  content: string;
  summary: string;
  keyPoints: string[];
  chapters: { title: string; content: string; summary: string }[];
}

// Extract text from PDF using PDF.js (browser-compatible)
export const extractTextFromPDF = async (file: File): Promise<string> => {
  // Dynamic import for PDF.js
  const pdfjsLib = await import('pdfjs-dist');

  // Import worker from node_modules
  const pdfjsWorker = await import('pdfjs-dist/build/pdf.worker.min.mjs?url');
  pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker.default;

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  
  let fullText = '';
  
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item: any) => item.str)
      .join(' ');
    fullText += `\n--- Page ${i} ---\n${pageText}`;
  }
  
  return fullText;
};

// Analyze document with Gemini AI
export const analyzeDocument = async (
  content: string,
  documentName: string
): Promise<{ summary: string; keyPoints: string[]; chapters: { title: string; content: string; summary: string }[] }> => {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error("Gemini API key not found");
  }

  const ai = new GoogleGenAI({ apiKey });
  const model = 'gemini-3-flash-preview';
  
  const prompt = `
以下のドキュメント「${documentName}」を分析してください。

# 必要な出力（JSON形式）:
{
  "summary": "ドキュメント全体の要約（200-300文字）",
  "keyPoints": ["重要ポイント1", "重要ポイント2", ...],
  "chapters": [
    {
      "title": "章タイトル",
      "content": "章の主要内容",
      "summary": "章の要約（50文字程度）"
    }
  ]
}

# ドキュメント内容:
${content.slice(0, 15000)}
`;

  try {
    const result = await ai.models.generateContent({ model, contents: prompt });
    const text = result.text || '';
    
    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    // Fallback if JSON parsing fails
    return {
      summary: text.slice(0, 300),
      keyPoints: ["分析に失敗しました"],
      chapters: []
    };
  } catch (error) {
    console.error("Document analysis failed:", error);
    return {
      summary: "ドキュメントの分析に失敗しました。",
      keyPoints: ["エラーが発生しました"],
      chapters: []
    };
  }
};

// Process uploaded document
export const processDocument = async (file: File): Promise<ExtractedDocument> => {
  const content = await extractTextFromPDF(file);
  const analysis = await analyzeDocument(content, file.name);
  
  return {
    content,
    summary: analysis.summary,
    keyPoints: analysis.keyPoints,
    chapters: analysis.chapters
  };
};
