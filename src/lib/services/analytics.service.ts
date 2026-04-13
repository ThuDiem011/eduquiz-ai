/**
 * Analytics Service
 * Tính toán điểm số, mastery score, và sinh nhận xét tiếng Việt
 */

import { Difficulty, QuestionCategory } from "@/types/enums";

interface AnswerData {
  questionId: string;
  isCorrect: boolean;
  difficulty: Difficulty;
  category: QuestionCategory;
  chapterId: string;
  chapterName: string;
  lessonId?: string | null;
  lessonName?: string | null;
}

interface ChapterStat {
  name: string;
  correct: number;
  total: number;
  accuracy: number;
}

interface LessonStat {
  name: string;
  chapterId: string;
  correct: number;
  total: number;
  accuracy: number;
}

interface CategoryStat {
  correct: number;
  total: number;
  accuracy: number;
}

interface DifficultyStat {
  correct: number;
  total: number;
  accuracy: number;
}

export interface AnalysisData {
  chapterStats: Record<string, ChapterStat>;
  lessonStats: Record<string, LessonStat>;
  categoryStats: Record<string, CategoryStat>;
  difficultyStats: Record<string, DifficultyStat>;
  comments: string[];
  suggestions: string[];
}

/**
 * Phân tích kết quả 1 bài kiểm tra và sinh nhận xét tự động
 */
export function analyzeAttempt(answers: AnswerData[]): AnalysisData {
  const chapterStats: Record<string, ChapterStat> = {};
  const lessonStats: Record<string, LessonStat> = {};
  const categoryStats: Record<string, CategoryStat> = {
    CONCEPT: { correct: 0, total: 0, accuracy: 0 },
    THEOREM: { correct: 0, total: 0, accuracy: 0 },
    PROPERTY: { correct: 0, total: 0, accuracy: 0 },
    EXERCISE: { correct: 0, total: 0, accuracy: 0 },
  };
  const difficultyStats: Record<string, DifficultyStat> = {
    EASY: { correct: 0, total: 0, accuracy: 0 },
    MEDIUM: { correct: 0, total: 0, accuracy: 0 },
    HARD: { correct: 0, total: 0, accuracy: 0 },
  };

  for (const answer of answers) {
    // Chapter stats
    if (!chapterStats[answer.chapterId]) {
      chapterStats[answer.chapterId] = {
        name: answer.chapterName,
        correct: 0,
        total: 0,
        accuracy: 0,
      };
    }
    chapterStats[answer.chapterId].total++;
    if (answer.isCorrect) chapterStats[answer.chapterId].correct++;

    // Lesson stats
    if (answer.lessonId && answer.lessonName) {
      if (!lessonStats[answer.lessonId]) {
        lessonStats[answer.lessonId] = {
          name: answer.lessonName,
          chapterId: answer.chapterId,
          correct: 0,
          total: 0,
          accuracy: 0,
        };
      }
      lessonStats[answer.lessonId].total++;
      if (answer.isCorrect) lessonStats[answer.lessonId].correct++;
    }

    // Category stats
    categoryStats[answer.category].total++;
    if (answer.isCorrect) categoryStats[answer.category].correct++;

    // Difficulty stats
    difficultyStats[answer.difficulty].total++;
    if (answer.isCorrect) difficultyStats[answer.difficulty].correct++;
  }

  // Calculate accuracy
  for (const key of Object.keys(chapterStats)) {
    const s = chapterStats[key];
    s.accuracy = s.total > 0 ? s.correct / s.total : 0;
  }
  for (const key of Object.keys(lessonStats)) {
    const s = lessonStats[key];
    s.accuracy = s.total > 0 ? s.correct / s.total : 0;
  }
  for (const key of Object.keys(categoryStats)) {
    const s = categoryStats[key];
    s.accuracy = s.total > 0 ? s.correct / s.total : 0;
  }
  for (const key of Object.keys(difficultyStats)) {
    const s = difficultyStats[key];
    s.accuracy = s.total > 0 ? s.correct / s.total : 0;
  }

  const comments = generateComments(chapterStats, lessonStats, categoryStats, difficultyStats);
  const suggestions = generateSuggestions(chapterStats, lessonStats, categoryStats, difficultyStats);

  return { chapterStats, lessonStats, categoryStats, difficultyStats, comments, suggestions };
}

const categoryNames: Record<string, string> = {
  CONCEPT: "Khái niệm",
  THEOREM: "Định lý",
  PROPERTY: "Tính chất",
  EXERCISE: "Dạng bài tập",
};

const difficultyNames: Record<string, string> = {
  EASY: "Dễ",
  MEDIUM: "Trung bình",
  HARD: "Khó",
};

function getAccuracyLabel(accuracy: number): string {
  if (accuracy >= 0.8) return "Nắm vững";
  if (accuracy >= 0.5) return "Tương đối ổn";
  return "Cần ôn tập thêm";
}

function generateComments(
  chapterStats: Record<string, ChapterStat>,
  lessonStats: Record<string, LessonStat>,
  categoryStats: Record<string, CategoryStat>,
  difficultyStats: Record<string, DifficultyStat>
): string[] {
  const comments: string[] = [];

  // Chapter comments
  for (const [, stat] of Object.entries(chapterStats)) {
    if (stat.total === 0) continue;
    const label = getAccuracyLabel(stat.accuracy);
    const percent = Math.round(stat.accuracy * 100);
    if (stat.accuracy >= 0.8) {
      comments.push(`✅ Bạn ${label.toLowerCase()} phần "${stat.name}" (${percent}% đúng)`);
    } else if (stat.accuracy >= 0.5) {
      comments.push(`⚠️ Bạn ${label.toLowerCase()} ở phần "${stat.name}" (${percent}% đúng)`);
    } else {
      comments.push(`❌ Bạn cần ôn tập thêm phần "${stat.name}" (chỉ ${percent}% đúng)`);
    }
  }

  // Category comments
  for (const [cat, stat] of Object.entries(categoryStats)) {
    if (stat.total === 0) continue;
    const percent = Math.round(stat.accuracy * 100);
    if (stat.accuracy < 0.5) {
      comments.push(`📌 Còn yếu ở dạng câu hỏi "${categoryNames[cat]}" (${percent}% đúng)`);
    }
  }

  // Difficulty comments
  for (const [diff, stat] of Object.entries(difficultyStats)) {
    if (stat.total === 0) continue;
    const percent = Math.round(stat.accuracy * 100);
    if (diff === "HARD" && stat.accuracy < 0.4) {
      comments.push(`🎯 Câu hỏi mức "${difficultyNames[diff]}" còn nhiều thách thức (${percent}% đúng) – cần luyện thêm`);
    } else if (diff === "EASY" && stat.accuracy >= 0.9) {
      comments.push(`💪 Bạn làm tốt các câu mức "${difficultyNames[diff]}" (${percent}% đúng)`);
    }
  }

  if (comments.length === 0) {
    comments.push("📊 Kết quả đã được phân tích. Hãy xem chi tiết bên dưới.");
  }

  return comments;
}

function generateSuggestions(
  chapterStats: Record<string, ChapterStat>,
  lessonStats: Record<string, LessonStat>,
  categoryStats: Record<string, CategoryStat>,
  difficultyStats: Record<string, DifficultyStat>
): string[] {
  const suggestions: string[] = [];

  // Weak chapters
  const weakChapters = Object.values(chapterStats)
    .filter((s) => s.accuracy < 0.6 && s.total > 0)
    .sort((a, b) => a.accuracy - b.accuracy)
    .slice(0, 3);

  for (const chapter of weakChapters) {
    suggestions.push(`📚 Ôn lại lý thuyết và bài tập trong "${chapter.name}"`);
  }

  // Weak lessons
  const weakLessons = Object.values(lessonStats)
    .filter((s) => s.accuracy < 0.5 && s.total > 0)
    .sort((a, b) => a.accuracy - b.accuracy)
    .slice(0, 3);

  for (const lesson of weakLessons) {
    suggestions.push(`📖 Xem lại bài "${lesson.name}" và làm thêm bài tập tương tự`);
  }

  // Weak categories
  for (const [cat, stat] of Object.entries(categoryStats)) {
    if (stat.accuracy < 0.5 && stat.total > 0) {
      suggestions.push(`🔍 Luyện thêm dạng câu hỏi "${categoryNames[cat]}"`);
    }
  }

  // Difficulty advice
  if (difficultyStats.HARD.total > 0 && difficultyStats.HARD.accuracy < 0.4) {
    suggestions.push("⚡ Hãy nắm chắc câu dễ và trung bình trước khi luyện câu khó");
  }

  if (suggestions.length === 0) {
    suggestions.push("🌟 Kết quả tốt! Hãy thử làm thêm đề khó hơn để nâng cao kiến thức");
  }

  return suggestions;
}

/**
 * Tính Mastery Score (0-100) với trọng số theo độ khó
 */
export function calculateMasteryScore(answers: AnswerData[]): number {
  if (answers.length === 0) return 0;

  const weights: Record<string, number> = { EASY: 1, MEDIUM: 1.5, HARD: 2 };
  let totalWeight = 0;
  let weightedCorrect = 0;

  for (const answer of answers) {
    const w = weights[answer.difficulty] || 1;
    totalWeight += w;
    if (answer.isCorrect) weightedCorrect += w;
  }

  return Math.round((weightedCorrect / totalWeight) * 100);
}

/**
 * Phân tích xu hướng qua nhiều bài kiểm tra
 */
export function analyzeTrend(scores: number[]): "improving" | "stable" | "declining" {
  if (scores.length < 2) return "stable";
  const recent = scores.slice(-3);
  const earlier = scores.slice(-6, -3);
  if (earlier.length === 0) return "stable";
  const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
  const earlierAvg = earlier.reduce((a, b) => a + b, 0) / earlier.length;
  if (recentAvg > earlierAvg + 5) return "improving";
  if (recentAvg < earlierAvg - 5) return "declining";
  return "stable";
}

/**
 * Sinh nhận xét tổng quan về xu hướng học tập
 */
export function generateTrendComment(trend: string, avgScore: number): string {
  if (trend === "improving") {
    return `📈 Bạn đang có xu hướng tiến bộ rõ rệt! Điểm trung bình đạt ${avgScore.toFixed(1)}/10. Tiếp tục phát huy!`;
  }
  if (trend === "declining") {
    return `📉 Điểm số của bạn có xu hướng giảm gần đây (trung bình ${avgScore.toFixed(1)}/10). Hãy xem lại lịch học để cải thiện.`;
  }
  return `📊 Kết quả học tập của bạn tương đối ổn định (trung bình ${avgScore.toFixed(1)}/10). Hãy thử thách bản thân với đề khó hơn!`;
}
