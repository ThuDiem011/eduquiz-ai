import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Users, Search, Filter, MoreVertical, CheckCircle2, XCircle } from "lucide-react";
import { formatDate, getRoleLabel } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { redirect } from "next/navigation";

export default async function UsersPage() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: {
          createdQuestions: true,
          createdExams: true,
          attempts: true,
        }
      }
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4 sm:items-center">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Quản lý người dùng</h1>
          <p className="text-gray-500 text-sm mt-1">Tổng số {users.length} tài khoản trong hệ thống</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">
            <Filter className="w-4 h-4" /> Lọc
          </button>
          <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors">
            <Users className="w-4 h-4" /> Thêm người dùng
          </button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="p-4 border-b border-gray-200 flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Tìm kiếm tài khoản, email..." 
                className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 focus:border-blue-500 rounded-xl text-sm outline-none transition-all"
              />
            </div>
            <select className="bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none">
              <option>Tất cả vai trò</option>
              <option>Quản trị viên</option>
              <option>Giáo viên</option>
              <option>Học sinh</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4">Người dùng</th>
                  <th className="px-6 py-4">Vai trò</th>
                  <th className="px-6 py-4">Trạng thái</th>
                  <th className="px-6 py-4">Hoạt động</th>
                  <th className="px-6 py-4">Ngày tham gia</th>
                  <th className="px-6 py-4 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center text-blue-700 font-bold flex-shrink-0">
                          {user.fullName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{user.fullName}</div>
                          <div className="text-gray-500 text-xs">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={
                        user.role === "ADMIN" ? "error" : 
                        user.role === "TEACHER" ? "default" : "secondary"
                      } className={user.role === "TEACHER" ? "bg-purple-100 text-purple-700 hover:bg-purple-100" : ""}>
                        {getRoleLabel(user.role)}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      {user.isActive ? (
                        <span className="flex items-center gap-1.5 text-green-600 font-medium text-xs">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Hoạt động
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-gray-400 font-medium text-xs">
                          <XCircle className="w-3.5 h-3.5" /> Bị khóa
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500">
                      {user.role === "STUDENT" ? (
                        <span>{user._count.attempts} lượt thi</span>
                      ) : (
                        <span>{user._count.createdQuestions} câu hỏi · {user._count.createdExams} đề</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="px-6 py-4">
                      <button className="p-2 w-full flex items-center justify-center text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
