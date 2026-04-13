import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const subject = await prisma.subject.findUnique({
    where: { id },
    include: {
      chapters: {
        orderBy: { orderIndex: "asc" }
      },
      _count: { select: { chapters: true, questions: true, exams: true } },
    },
  });

  if (!subject) return NextResponse.json({ error: "Thực thể không tồn tại" }, { status: 404 });

  return NextResponse.json(subject);
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || !["ADMIN", "TEACHER"].includes(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();
  const { name, description } = body;

  const subject = await prisma.subject.update({
    where: { id },
    data: { name, description },
  });

  return NextResponse.json(subject);
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || !["ADMIN", "TEACHER"].includes(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  await prisma.subject.delete({
    where: { id },
  });

  return NextResponse.json({ success: true });
}
