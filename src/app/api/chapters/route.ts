import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const subjectId = searchParams.get("subjectId");

  const chapters = await prisma.chapter.findMany({
    where: subjectId ? { subjectId } : {},
    include: {
      _count: { select: { lessons: true, questions: true } },
    },
    orderBy: { orderIndex: "asc" },
  });

  return NextResponse.json({ chapters });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session || !["ADMIN", "TEACHER"].includes(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { subjectId, name, description, orderIndex } = await req.json();
  const chapter = await prisma.chapter.create({
    data: { subjectId, name, description, orderIndex: orderIndex || 0 },
  });

  return NextResponse.json(chapter, { status: 201 });
}
