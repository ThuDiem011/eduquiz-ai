import { Difficulty, QuestionCategory } from "@/types/enums";
import { GoogleGenerativeAI } from "@google/generative-ai";

export interface GeneratedQuestion {
  content: string;
  choices: { label: string; content: string }[];
  correctLabel: string;
  explanation: string;
  category: QuestionCategory;
  difficulty: Difficulty;
}

export interface AIGeneratorInput {
  subjectName: string;
  chapterName: string;
  lessonName?: string;
  category: QuestionCategory;
  difficulty: Difficulty;
  count: number;
  language?: string;
  customPrompt?: string;
  excludeContents?: string[]; // Danh sách nội dung câu hỏi đã tồn tại để tránh trùng lặp
}

interface AIProvider {
  generateQuestions(input: AIGeneratorInput): Promise<GeneratedQuestion[]>;
}

// ==================== Gemini AI Provider ====================

class GeminiAIProvider implements AIProvider {
  private genAI: GoogleGenerativeAI;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY || "";
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  async generateQuestions(input: AIGeneratorInput): Promise<GeneratedQuestion[]> {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("Hệ thống chưa cấu hình GEMINI_API_KEY. Không thể sử dụng AI.");
    }

    const model = this.genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: {
        temperature: 0.8,
        topP: 0.95,
        topK: 64,
        maxOutputTokens: 2048,
      }
    });
    
    const excludeSection = input.excludeContents && input.excludeContents.length > 0
      ? `\nTUYỆT ĐỐI KHÔNG tạo câu hỏi trùng lặp hoặc tương tự với danh sách nội dung sau đây:\n${input.excludeContents.map((c, i) => `${i + 1}. ${c}`).join("\n")}\n`
      : "";

    const prompt = `
      Bạn là một chuyên gia khảo thí và xây dựng ngân hàng câu hỏi trắc nghiệm chuyên nghiệp, sáng tạo.
      Nhiệm vụ: Hãy tự mình suy duy và tạo ra ${input.count} câu hỏi trắc nghiệm MỚI TINH, ĐỘC BẢN cho nội dung sau:
      - Môn học: ${input.subjectName}
      - Chương: ${input.chapterName}
      ${input.lessonName ? `- Bài học: ${input.lessonName}` : ""}
      - Loại kiến thức: ${input.category} (${getCategoryDesc(input.category)})
      - Độ khó: ${input.difficulty} (${getDiffDesc(input.difficulty)})
      - Ngôn ngữ: ${input.language || "Tiếng Việt"}
      ${input.customPrompt ? `- Yêu cầu đặc biệt: ${input.customPrompt}` : ""}
      ${excludeSection}

      Yêu cầu về chất lượng và sự đa dạng:
      1. TỰ THÂN SÁNG TẠO: Không dùng các câu hỏi rập khuôn, máy móc. 
      2. ĐA DẠNG: Sử dụng nhiều hình thức hỏi khác nhau (tình huống thực tế, phân tích đúng/sai, suy luận logic, hoặc giải quyết vấn đề).
      3. CHI TIẾT: Nội dung đáp án phải có tính gây nhiễu tốt (các đáp án sai phải trông có vẻ hợp lý nhưng có lỗi sai cụ thể).
      
      Yêu cầu về định dạng đầu ra (JSON ARRAY):
      [
        {
          "content": "Câu hỏi sáng tạo, thực tế...",
          "choices": [
            {"label": "A", "content": "..."},
            {"label": "B", "content": "..."},
            {"label": "C", "content": "..."},
            {"label": "D", "content": "..."}
          ],
          "correctLabel": "X",
          "explanation": "Giải thích sâu sắc tại sao đáp án đó đúng và tại sao các đáp án khác sai...",
          "category": "${input.category}",
          "difficulty": "${input.difficulty}"
        }
      ]
    `;

    try {
      const result = await model.generateContent(prompt);
      let responseText = result.response.text().trim();
      
      // Clean markdown if AI includes it
      if (responseText.startsWith("```json")) {
        responseText = responseText.replace(/^```json/, "").replace(/```$/, "").trim();
      } else if (responseText.startsWith("```")) {
        responseText = responseText.replace(/^```/, "").replace(/```$/, "").trim();
      }

      const parsed = JSON.parse(responseText);
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch (error) {
      console.error("GEMINI_AI_ERROR:", error);
      throw error; // Ném lỗi để API route xử lý và báo cho người dùng
    }
  }
}

function getCategoryDesc(cat: string) {
  const map: Record<string, string> = {
    CONCEPT: "Khái niệm, định nghĩa cơ bản",
    THEOREM: "Định lý, nguyên lý, quy luật",
    PROPERTY: "Tính chất, đặc điểm",
    EXERCISE: "Bài tập áp dụng, tính toán",
  };
  return map[cat] || cat;
}

function getDiffDesc(diff: string) {
  const map: Record<string, string> = {
    EASY: "Nhận biết - Câu hỏi đơn giản, trực tiếp",
    MEDIUM: "Thông hiểu - Yêu cầu phân tích nhẹ",
    HARD: "Vận dụng - Đòi hỏi tư duy sâu hoặc tính toán phức tạp",
  };
  return map[diff] || diff;
}

// ==================== Service ====================

const provider: AIProvider = new GeminiAIProvider();

export async function generateQuestionsWithAI(
  input: AIGeneratorInput
): Promise<GeneratedQuestion[]> {
  return provider.generateQuestions(input);
}
