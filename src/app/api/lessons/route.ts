import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const chapterId = searchParams.get("chapterId");

  const lessons = await prisma.lesson.findMany({
    where: chapterId ? { chapterId } : {},
    include: { _count: { select: { questions: true } } },
    orderBy: { orderIndex: "asc" },
  });

  return NextResponse.json({ lessons });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session || !["ADMIN", "TEACHER"].includes(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { chapterId, name, description, orderIndex, objectives } = await req.json();
  const lesson = await prisma.lesson.create({
    data: { chapterId, name, description, orderIndex: orderIndex || 0, objectives },
  });

  return NextResponse.json(lesson, { status: 201 });
}
