export type RiskStatus = "safe" | "warning" | "risk";

export interface RiskResult {
  status: RiskStatus;
  avgRecent: number;
  avgEarlier: number;
  trend: number;
}

export interface ProbabilityResult {
  grade5: number;
  grade4: number;
  grade3: number;
}

export interface WeakSubjectResult {
  subjectKey: string;
  grade: number;
  topics: string[];
}

export function calculateStudentRisk(grades: number[]): RiskResult {
  if (grades.length < 5) {
    const avg = grades.length > 0 ? grades.reduce((a, b) => a + b, 0) / grades.length : 0;
    return { status: "safe", avgRecent: avg, avgEarlier: avg, trend: 0 };
  }

  const last5 = grades.slice(-5);
  const earlier = grades.slice(0, -5);

  const avgRecent = last5.reduce((a, b) => a + b, 0) / last5.length;
  const avgEarlier = earlier.length > 0
    ? earlier.reduce((a, b) => a + b, 0) / earlier.length
    : avgRecent;

  const trend = avgRecent - avgEarlier;

  let status: RiskStatus = "safe";
  if (trend <= -0.5) {
    status = "risk";
  } else if (trend <= -0.2) {
    status = "warning";
  }

  return { status, avgRecent, avgEarlier, trend: Math.round(trend * 100) / 100 };
}

export function calculateGradeProbability(
  sorGrades: number[],
  sochGrade: number | null
): ProbabilityResult {
  const allAssessments = [...sorGrades];
  if (sochGrade !== null) allAssessments.push(sochGrade);

  if (allAssessments.length === 0) {
    return { grade5: 0, grade4: 0, grade3: 0 };
  }

  const avg = allAssessments.reduce((a, b) => a + b, 0) / allAssessments.length;
  const variance = allAssessments.reduce((sum, g) => sum + Math.pow(g - avg, 2), 0) / allAssessments.length;
  const stdDev = Math.sqrt(variance);

  function normalCDF(x: number, mean: number, sd: number): number {
    if (sd === 0) return x >= mean ? 1 : 0;
    const t = 1 / (1 + 0.2316419 * Math.abs((x - mean) / sd));
    const d = 0.3989422804014327 / (sd > 0 ? sd : 0.001);
    const p = d * Math.exp(-0.5 * Math.pow((x - mean) / sd, 2)) *
      (0.3193815 * t - 0.3565638 * t * t + 1.781478 * t * t * t -
       1.821256 * t * t * t * t + 1.330274 * t * t * t * t * t);
    return (x - mean) / sd > 0 ? 1 - p : p;
  }

  const remainingWeight = 0.3;
  const projectedAvg = avg;

  const prob5 = Math.round(Math.min(100, Math.max(0, (1 - normalCDF(4.5, projectedAvg, Math.max(stdDev, 0.3))) * 100)));
  const prob4 = Math.round(Math.min(100 - prob5, Math.max(0, (normalCDF(4.5, projectedAvg, Math.max(stdDev, 0.3)) - normalCDF(3.5, projectedAvg, Math.max(stdDev, 0.3))) * 100)));
  const prob3 = Math.round(Math.min(100 - prob5 - prob4, Math.max(0, (normalCDF(3.5, projectedAvg, Math.max(stdDev, 0.3)) - normalCDF(2.5, projectedAvg, Math.max(stdDev, 0.3))) * 100)));

  return {
    grade5: prob5,
    grade4: prob4,
    grade3: prob3,
  };
}

const TOPICS_DB: Record<string, Record<string, string[]>> = {
  math: {
    ru: ["Линейные уравнения", "Квадратичные функции", "Теория вероятностей", "Тригонометрия", "Логарифмы"],
    kk: ["Сызықты теңдеулер", "Квадраттық функциялар", "Ықтималдықтар теориясы", "Тригонометрия", "Логарифмдер"],
    en: ["Linear equations", "Quadratic functions", "Probability theory", "Trigonometry", "Logarithms"],
  },
  physics: {
    ru: ["Механика", "Термодинамика", "Электричество", "Оптика", "Кинематика"],
    kk: ["Механика", "Термодинамика", "Электр", "Оптика", "Кинематика"],
    en: ["Mechanics", "Thermodynamics", "Electricity", "Optics", "Kinematics"],
  },
  chemistry: {
    ru: ["Периодическая таблица", "Химические реакции", "Органическая химия", "Кислоты и основания", "Окисление"],
    kk: ["Периодтық кесте", "Химиялық реакциялар", "Органикалық химия", "Қышқылдар мен негіздер", "Тотығу"],
    en: ["Periodic table", "Chemical reactions", "Organic chemistry", "Acids and bases", "Oxidation"],
  },
  history: {
    ru: ["Древний мир", "Средневековье", "Новое время", "Казахстан в XX веке", "Независимость РК"],
    kk: ["Ежелгі дәуір", "Орта ғасырлар", "Жаңа заман", "Қазақстан XX ғасырда", "Тәуелсіздік"],
    en: ["Ancient world", "Middle Ages", "Modern era", "Kazakhstan in XX century", "Independence of RK"],
  },
  literature: {
    ru: ["Анализ стихотворения", "Проза XIX века", "Современная литература", "Литературные жанры", "Теория литературы"],
    kk: ["Өлең талдау", "XIX ғасыр прозасы", "Заманауи әдебиет", "Әдеби жанрлар", "Әдебиет теориясы"],
    en: ["Poetry analysis", "XIX century prose", "Modern literature", "Literary genres", "Literary theory"],
  },
  english: {
    ru: ["Грамматика: времена", "Лексика", "Аудирование", "Письмо эссе", "Разговорная речь"],
    kk: ["Грамматика: уақыттар", "Лексика", "Тыңдау", "Эссе жазу", "Ауызша сөйлеу"],
    en: ["Grammar: tenses", "Vocabulary", "Listening", "Essay writing", "Speaking"],
  },
  biology: {
    ru: ["Клеточная биология", "Генетика", "Экология", "Анатомия человека", "Эволюция"],
    kk: ["Жасуша биологиясы", "Генетика", "Экология", "Адам анатомиясы", "Эволюция"],
    en: ["Cell biology", "Genetics", "Ecology", "Human anatomy", "Evolution"],
  },
  cs: {
    ru: ["Алгоритмы", "Программирование", "Базы данных", "Компьютерные сети", "Web-разработка"],
    kk: ["Алгоритмдер", "Бағдарламалау", "Дерекқорлар", "Компьютерлік желілер", "Web-әзірлеу"],
    en: ["Algorithms", "Programming", "Databases", "Computer networks", "Web development"],
  },
  algebra: {
    ru: ["Уравнения", "Неравенства", "Функции", "Прогрессии", "Комбинаторика"],
    kk: ["Теңдеулер", "Теңсіздіктер", "Функциялар", "Прогрессиялар", "Комбинаторика"],
    en: ["Equations", "Inequalities", "Functions", "Progressions", "Combinatorics"],
  },
};

export function getTopicRecommendations(subjectKey: string, lang: string = "ru"): string[] {
  const subjectTopics = TOPICS_DB[subjectKey];
  if (!subjectTopics) return [];
  return subjectTopics[lang] || subjectTopics["ru"] || [];
}

export function getWeakSubject(
  subjects: { name: string; grade: number }[]
): WeakSubjectResult | null {
  if (subjects.length === 0) return null;

  let weakest = subjects[0];
  for (const s of subjects) {
    if (s.grade < weakest.grade) weakest = s;
  }

  const topics = getTopicRecommendations(weakest.name);

  return {
    subjectKey: weakest.name,
    grade: weakest.grade,
    topics,
  };
}
