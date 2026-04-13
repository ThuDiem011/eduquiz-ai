import { NextResponse } from "next/server";
export const dynamic = 'force-dynamic';
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";
  const limit = parseInt(searchParams.get("limit") || "50");
  const page = parseInt(searchParams.get("page") || "1");

  const subjects = await prisma.subject.findMany({
    where: search ? { name: { contains: search } } : {},
    include: {
      _count: { select: { chapters: true, questions: true, exams: true } },
    },
    orderBy: { name: "asc" },
    take: limit,
    skip: (page - 1) * limit,
  });

  const total = await prisma.subject.count({
    where: search ? { name: { contains: search } } : {},
  });

  return NextResponse.json({ subjects, total, page, limit });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session || !["ADMIN", "TEACHER"].includes(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { name, description, color, icon } = body;

  if (!name) return NextResponse.json({ error: "Tên môn học là bắt buộc" }, { status: 400 });

  const subject = await prisma.subject.create({
    data: { 
      name, 
      description, 
      color, 
      icon,
      chapters: {
        create: [
          {
            name: "Chương 1: Tổng quan",
            description: "Chương mặc định để bắt đầu thêm câu hỏi",
            orderIndex: 0
          }
        ]
      }
    },
  });

  return NextResponse.json(subject, { status: 201 });
}
