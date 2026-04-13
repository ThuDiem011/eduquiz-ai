import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role = session.user.role;
  const assignments = await prisma.assignment.findMany({
    where: role === "STUDENT" ? { studentId: session.user.id } : { assignedById: session.user.id },
    include: {
      exam: { select: { title: true, durationMinutes: true, totalQuestions: true } },
      student: { select: { fullName: true, email: true } },
      class: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" }
  });

  return NextResponse.json({ assignments });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session || !["ADMIN", "TEACHER"].includes(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { examId, studentId, classId, maxAttempts } = await req.json();

  if (!examId || (!studentId && !classId)) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const assignment = await prisma.assignment.create({
    data: {
      examId,
      assignedById: session.user.id,
      studentId: studentId || null,
      classId: classId || null,
      maxAttempts: maxAttempts || 1,
      status: "ACTIVE",
    }
  });

  return NextResponse.json(assignment, { status: 201 });
}
