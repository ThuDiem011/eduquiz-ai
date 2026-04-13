import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

const registerSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["STUDENT", "TEACHER"]).default("STUDENT"),
  school: z.string().optional(),
  className: z.string().optional(),
  subject: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = registerSchema.parse(body);

    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) {
      return NextResponse.json({ message: "Email đã được sử dụng" }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
      data: {
        fullName: data.fullName,
        email: data.email,
        passwordHash,
        role: data.role,
        school: data.school,
        className: data.className,
        subject: data.subject,
        avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.email}`,
      },
    });

    return NextResponse.json({ id: user.id, email: user.email, role: user.role }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: "Dữ liệu không hợp lệ", errors: (error as any).errors }, { status: 422 });
    }
    return NextResponse.json({ message: "Lỗi server" }, { status: 500 });
  }
}
