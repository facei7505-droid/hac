import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const SYSTEM_PROMPT =
  "Ты — дружелюбный ИИ-помощник инновационного лицея Aqbobek. Отвечай кратко, вежливо и по делу. Помогай с вопросами об учебе, расписании и портале. Если не знаешь ответ, скажи, чтобы обратились к администратору.";

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "API-ключ не настроен. Добавьте GEMINI_API_KEY в .env.local" },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { message } = body;

    if (!message || typeof message !== "string" || !message.trim()) {
      return NextResponse.json(
        { error: "Сообщение не может быть пустым" },
        { status: 400 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: SYSTEM_PROMPT,
    });

    const result = await model.generateContent(message.trim());
    const text = result.response.text();

    if (!text) {
      return NextResponse.json(
        { error: "ИИ не смог сгенерировать ответ" },
        { status: 500 }
      );
    }

    return NextResponse.json({ reply: text });
  } catch (error: any) {
    const msg = error?.message || String(error);
    console.error("Gemini API error:", msg);

    if (msg.includes("429") || msg.includes("quota")) {
      return NextResponse.json(
        { error: "Превышен лимит запросов к Gemini API. Подождите минуту." },
        { status: 429 }
      );
    }

    if (msg.includes("403") || msg.includes("PERMISSION_DENIED")) {
      return NextResponse.json(
        { error: "API-ключ не имеет доступа к Gemini. Проверьте ключ." },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: `Ошибка Gemini: ${msg}` },
      { status: 500 }
    );
  }
}
