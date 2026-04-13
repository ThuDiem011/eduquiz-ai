import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function findDuplicates() {
  const allQuestions = await prisma.question.findMany({
    select: {
      id: true,
      content: true,
      subjectId: true,
      chapterId: true,
      _count: {
        select: {
          examQuestions: true,
          studentAnswers: true
        }
      }
    }
  });

  const groups: Record<string, any[]> = {};
  allQuestions.forEach(q => {
    const key = `${q.subjectId}-${q.content.trim().toLowerCase()}`;
    if (!groups[key]) groups[key] = [];
    groups[key].push(q);
  });

  const duplicateGroups = Object.entries(groups).filter(([_, list]) => list.length > 1);

  console.log(`Found ${duplicateGroups.length} duplicate groups.`);
  
  let safeToDeleteCount = 0;
  let needMergingCount = 0;

  for (const [key, list] of duplicateGroups) {
    // Sort by number of relations descending, then by creation date (id or createdAt ideally, but here id is cuid)
    // We want the most "used" one as the master
    const sorted = [...list].sort((a, b) => {
      const aUsage = a._count.examQuestions + a._count.studentAnswers;
      const bUsage = b._count.examQuestions + b._count.studentAnswers;
      return bUsage - aUsage;
    });

    const master = sorted[0];
    const duplicates = sorted.slice(1);

    console.log(`\nGroup: ${key} (Master: ${master.id})`);
    duplicates.forEach(q => {
      const usage = q._count.examQuestions + q._count.studentAnswers;
      if (usage === 0) {
        console.log(` - DUPLICATE (SAFE): ${q.id}`);
        safeToDeleteCount++;
      } else {
        console.log(` - DUPLICATE (USED!!): ${q.id} (Exams: ${q._count.examQuestions}, Answers: ${q._count.studentAnswers})`);
        needMergingCount++;
      }
    });
  }

  console.log("\nSummary:");
  console.log(`Total duplicate questions to remove: ${safeToDeleteCount + needMergingCount}`);
  console.log(` - Safe to delete (no usage): ${safeToDeleteCount}`);
  console.log(` - Need merging (has usage): ${needMergingCount}`);
}

findDuplicates()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
