import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const duplicateIds = [
  "cmnwx0do3003ulyd05r61w1kj",
  "cmnwx0dpd0040lyd0fowr5svd",
  "cmnwx0dqc0046lyd0yhf5ecod",
  "cmnwx0dr8004clyd0i6lgz72l",
  "cmnwx0ds4004ilyd0thp4cc64"
];

async function deleteDuplicates() {
  console.log(`Starting deletion of ${duplicateIds.length} questions...`);

  const deleteResult = await prisma.question.deleteMany({
    where: {
      id: { in: duplicateIds }
    }
  });

  console.log(`Successfully deleted ${deleteResult.count} questions.`);
}

deleteDuplicates()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
