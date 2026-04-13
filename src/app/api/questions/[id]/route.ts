import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// DELETE single question
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session || session.user.role === "STUDENT") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  await prisma.question.delete({ where: { id } });
  return NextResponse.json({ success: true });
}

// GET single question
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const question = await prisma.question.findUnique({
    where: { id },
    include: {
      subject: true,
      chapter: true,
      lesson: true,
      choices: { orderBy: { orderIndex: "asc" } },
      createdBy: { select: { fullName: true } },
    },
  });

  if (!question) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(question);
}

// PUT update question
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session || session.user.role === "STUDENT") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();
  const { content, explanation, category, difficulty, status, choices, correctLabel } = body;

  const question = await prisma.question.update({
    where: { id },
    data: {
      content,
      explanation,
      category,
      difficulty,
      status,
    },
    include: { choices: true },
  });

  return NextResponse.json(question);
}
