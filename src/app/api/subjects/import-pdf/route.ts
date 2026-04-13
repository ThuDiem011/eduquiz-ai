import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const session = await auth();
  if (!session || !["ADMIN", "TEACHER"].includes(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const pdfParse = require("pdf-parse"); // Dynamic require inside handler
    const formData = await req.formData();
    const file = formData.get("file") as File;
    
    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // 1. Đọc nội dung file PDF bằng pdf-parse
    const buffer = Buffer.from(await file.arrayBuffer());
    let pdfText = "";
    try {
      const data = await pdfParse(buffer);
      pdfText = data.text;
    } catch (parseError) {
      console.error("PDF Parse error:", parseError);
      return NextResponse.json({ error: "Không thể đọc nội dung file PDF. Vui lòng thử file khác." }, { status: 400 });
    }

    // Lấy 20,000 ký tự đầu tiên để AI đọc (Chứa trang bìa và mục lục, khoảng 10-20 trang)
    // Điều này để tiết kiệm Token và tránh quá tải API
    const textChunk = pdfText.substring(0, 20000);

    // 2. Chuyển cho Gemini phân tích (Nếu có API KEY)
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey.length < 10) {
      return NextResponse.json({ 
        error: "Hệ thống chưa được cấu hình GEMINI_API_KEY trong file .env để thực sự đọc chữ. Vui lòng thêm biến môi trường này." 
      }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      Bạn là một chuyên gia giáo dục phân tích Sách giáo khoa từ văn bản thô.
      Dưới đây là nội dung trích xuất từ phần đầu của một tệp PDF Sách giáo khoa. 
      Nhiệm vụ của bạn là đọc nội dung và trả về MỘT CHUỖI JSON DUY NHẤT (không dùng markdown code block, không có ký tự dư thừa).
      Cấu trúc JSON bắt buộc phải tuân theo định dạng sau:
      {
        "subjectName": "Tên môn học hoặc Tên cuốn sách (vd: Tin học 10 Kết nối tri thức)",
        "description": "Mô tả ngắn gọn nội dung cuốn sách dựa trên thông tin đọc được",
        "chapters": [
          {
            "name": "Tên chương (hoặc Chủ đề gốc, vd: Chủ đề 1: Máy tính và xã hội...)",
            "description": "Nội dung học hoặc mô tả ngắn gọn của chương này dựa theo mục lục"
          }
        ],
        "questions": [
          {
            "content": "Câu hỏi trắc nghiệm liên quan đến kiến thức tìm được trong sách (Tạo khoảng 2-3 câu hỏi để ví dụ)",
            "explanation": "Lời giải thích ngắn gọn dựa theo lời văn trong sách",
            "choices": [
              { "label": "A", "content": "Nội dung đáp án A" },
              { "label": "B", "content": "Nội dung đáp án B" },
              { "label": "C", "content": "Nội dung đáp án C" },
              { "label": "D", "content": "Nội dung đáp án D" }
            ],
            "correctLabel": "A"
          }
        ]
      }

      Hãy cung cấp khoảng 4 đến 8 chương (dựa theo mục lục bạn đọc được) và 2-3 câu hỏi trắc nghiệm ví dụ.
      Đây là nội dung văn bản PDF:
      ---------------------
      ${textChunk}
      ---------------------
    `;

    const result = await model.generateContent(prompt);
    let responseText = result.response.text().trim();
    
    // Làm sạch Markdown nếu Gemini bướng bỉnh trả về ```json
    if (responseText.startsWith("```json")) {
      responseText = responseText.replace(/^```json/, "").replace(/```$/, "").trim();
    }

    let parsedData;
    try {
      parsedData = JSON.parse(responseText);
    } catch (parseJSONError) {
      console.error("Failed to parse Gemini JSON:", responseText);
      return NextResponse.json({ error: "AI trả về cấu trúc không chính xác. Hãy thử lại." }, { status: 500 });
    }

    // 3. Đẩy dữ liệu vào Database
    const subject = await prisma.subject.create({
      data: {
        name: parsedData.subjectName || (file.name.replace(".pdf", "") + " (AI Trích xuất)"),
        description: parsedData.description || "Tự động trích xuất bằng AI Gemini.",
        color: "#10B981", // Màu xanh lá
        icon: "BookOpen",
        chapters: {
          create: (parsedData.chapters || []).map((ch: any, i: number) => ({
            name: ch.name || `Phần ${i + 1}`,
            description: ch.description || "",
            orderIndex: i + 1
          }))
        }
      },
      include: { chapters: true }
    });

    // Nếu có Questions mẫu, cho vào Chương 1
    if (subject.chapters.length > 0 && parsedData.questions && parsedData.questions.length > 0) {
      for (const q of parsedData.questions) {
        const questionData = await prisma.question.create({
          data: {
            subjectId: subject.id,
            chapterId: subject.chapters[0].id,
            category: "CONCEPT",
            difficulty: "MEDIUM",
            content: q.content,
            explanation: q.explanation || "Không có",
            status: "APPROVED",
            sourceType: "AI_GENERATED",
            createdById: session.user.id,
            choices: {
              create: (q.choices || []).map((c: any, i: number) => ({
                label: c.label || ["A", "B", "C", "D"][i] || "A",
                content: c.content || "",
                orderIndex: i
              }))
            }
          }
        });
        
        // Cập nhật correctChoice
        const correct = await prisma.choice.findFirst({ 
          where: { questionId: questionData.id, label: q.correctLabel || "A" } 
        });
        if(correct) {
          await prisma.question.update({ where: { id: questionData.id }, data: { correctChoiceId: correct.id } });
        }
      }
    }

    return NextResponse.json({ subject, message: "Đã đọc PDF và trích xuất thành công bằng Ai!" });
    
  } catch (error) {
    console.error("PDF Import Complete Error:", error);
    return NextResponse.json({ error: "Có lỗi xảy ra trong quá trình gọi AI." }, { status: 500 });
  }
}
