export interface QuestQuestion {
  question: string;
  questionKk: string;
  questionEn: string;
  options: string[];
  optionsKk: string[];
  optionsEn: string[];
  correctIndex: number;
  difficulty: "easy" | "medium" | "hard";
}

type GradeLevel = "grade_9" | "grade_10" | "grade_11";

const QUEST_BANK: Record<string, Record<GradeLevel, QuestQuestion[]>> = {
  basic_math: {
    grade_9: [
      {
        question: "Реши уравнение: 3(x − 2) = 2(x + 5). Чему равен x?",
        questionKk: "Теңдеуді шеш: 3(x − 2) = 2(x + 5). x қанша?",
        questionEn: "Solve: 3(x − 2) = 2(x + 5). What is x?",
        options: ["x = 14", "x = 16", "x = 12", "x = 10"],
        optionsKk: ["x = 14", "x = 16", "x = 12", "x = 10"],
        optionsEn: ["x = 14", "x = 16", "x = 12", "x = 10"],
        correctIndex: 1, difficulty: "easy",
      },
      {
        question: "Вычисли: (−3)² × (−2)³ + 5² = ?",
        questionKk: "Есепте: (−3)² × (−2)³ + 5² = ?",
        questionEn: "Compute: (−3)² × (−2)³ + 5² = ?",
        options: ["−47", "47", "−97", "97"],
        optionsKk: ["−47", "47", "−97", "97"],
        optionsEn: ["−47", "47", "−97", "97"],
        correctIndex: 0, difficulty: "easy",
      },
    ],
    grade_10: [
      {
        question: "Решите систему: x + y = 7, x² + y² = 25. Найдите xy.",
        questionKk: "Жүйені шешіңіз: x + y = 7, x² + y² = 25. xy табыңыз.",
        questionEn: "Solve: x + y = 7, x² + y² = 25. Find xy.",
        options: ["12", "10", "14", "8"],
        optionsKk: ["12", "10", "14", "8"],
        optionsEn: ["12", "10", "14", "8"],
        correctIndex: 0, difficulty: "medium",
      },
      {
        question: "Решите неравенство: log₂(x² − 3x) > log₂(2x + 24)",
        questionKk: "Теңсіздікті шешіңіз: log₂(x² − 3x) > log₂(2x + 24)",
        questionEn: "Solve the inequality: log₂(x² − 3x) > log₂(2x + 24)",
        options: ["x ∈ (−3; 0) ∪ (8; +∞)", "x ∈ (−∞; −3) ∪ (8; +∞)", "x ∈ (0; 8)", "x ∈ (−3; 8)"],
        optionsKk: ["x ∈ (−3; 0) ∪ (8; +∞)", "x ∈ (−∞; −3) ∪ (8; +∞)", "x ∈ (0; 8)", "x ∈ (−3; 8)"],
        optionsEn: ["x ∈ (−3; 0) ∪ (8; +∞)", "x ∈ (−∞; −3) ∪ (8; +∞)", "x ∈ (0; 8)", "x ∈ (−3; 8)"],
        correctIndex: 0, difficulty: "hard",
      },
    ],
    grade_11: [
      {
        question: "Найдите производную f(x) = x³·ln(x) при x = e.",
        questionKk: "f(x) = x³·ln(x) функциясының x = e-дегі туындысын табыңыз.",
        questionEn: "Find the derivative of f(x) = x³·ln(x) at x = e.",
        options: ["4e²", "3e²", "e³ + 3e²", "4e³"],
        optionsKk: ["4e²", "3e²", "e³ + 3e²", "4e³"],
        optionsEn: ["4e²", "3e²", "e³ + 3e²", "4e³"],
        correctIndex: 0, difficulty: "hard",
      },
      {
        question: "Вычислите: ∫₀¹ (3x² + 2x) dx = ?",
        questionKk: "Есептеңіз: ∫₀¹ (3x² + 2x) dx = ?",
        questionEn: "Compute: ∫₀¹ (3x² + 2x) dx = ?",
        options: ["2", "1", "3", "1.5"],
        optionsKk: ["2", "1", "3", "1.5"],
        optionsEn: ["2", "1", "3", "1.5"],
        correctIndex: 0, difficulty: "hard",
      },
    ],
  },

  geometry: {
    grade_9: [
      {
        question: "В прямоугольном треугольнике катеты 5 и 12. Найдите гипотенузу.",
        questionKk: "Тік бұрышты үшбұрышта катеттер 5 және 12. Гипотенуза табыңыз.",
        questionEn: "In a right triangle, legs are 5 and 12. Find the hypotenuse.",
        options: ["13", "15", "17", "11"],
        optionsKk: ["13", "15", "17", "11"],
        optionsEn: ["13", "15", "17", "11"],
        correctIndex: 0, difficulty: "easy",
      },
      {
        question: "Площадь квадрата равна 49 см². Чему равна его диагональ?",
        questionKk: "Шаршының ауданы 49 см². Оның диагоналы қанша?",
        questionEn: "The area of a square is 49 cm². What is its diagonal?",
        options: ["7√2", "14", "7", "14√2"],
        optionsKk: ["7√2", "14", "7", "14√2"],
        optionsEn: ["7√2", "14", "7", "14√2"],
        correctIndex: 0, difficulty: "easy",
      },
    ],
    grade_10: [
      {
        question: "Радиус основания цилиндра 3, высота 8. Найдите площадь боковой поверхности.",
        questionKk: "Цилиндр негізінің радиусы 3, биіктігі 8. Беткі ауданды табыңыз.",
        questionEn: "Cylinder base radius is 3, height is 8. Find the lateral surface area.",
        options: ["48π", "24π", "66π", "36π"],
        optionsKk: ["48π", "24π", "66π", "36π"],
        optionsEn: ["48π", "24π", "66π", "36π"],
        correctIndex: 0, difficulty: "medium",
      },
      {
        question: "Вписан четырёхугольник. Два угла 70° и 110°. Чему равна сумма остальных двух?",
        questionKk: "Төртбұрыш салынған. Екі бұрышы 70° және 110°. Қалған екеуінің қосындысы қанша?",
        questionEn: "A quadrilateral is inscribed. Two angles are 70° and 110°. What is the sum of the other two?",
        options: ["180°", "160°", "200°", "90°"],
        optionsKk: ["180°", "160°", "200°", "90°"],
        optionsEn: ["180°", "160°", "200°", "90°"],
        correctIndex: 0, difficulty: "medium",
      },
    ],
    grade_11: [
      {
        question: "Найдите расстояние от точки (1,2,3) до плоскости 2x + 2y + z − 10 = 0",
        questionKk: "(1,2,3) нүктесінен 2x + 2y + z − 10 = 0 жазықтығына дейінгі қашықтықты табыңыз",
        questionEn: "Find the distance from point (1,2,3) to the plane 2x + 2y + z − 10 = 0",
        options: ["1", "√3", "3", "2"],
        optionsKk: ["1", "√3", "3", "2"],
        optionsEn: ["1", "√3", "3", "2"],
        correctIndex: 0, difficulty: "hard",
      },
      {
        question: "Расстояние между параллельными прямыми x/2 = (y−1)/3 = z/1 и x/2 = (y+2)/3 = (z−4)/1",
        questionKk: "x/2 = (y−1)/3 = z/1 және x/2 = (y+2)/3 = (z−4)/1 параллель түзулер арасындағы қашықтық",
        questionEn: "Distance between parallel lines x/2 = (y−1)/3 = z/1 and x/2 = (y+2)/3 = (z−4)/1",
        options: ["3√2", "√14", "√11", "5"],
        optionsKk: ["3√2", "√14", "√11", "5"],
        optionsEn: ["3√2", "√14", "√11", "5"],
        correctIndex: 0, difficulty: "hard",
      },
    ],
  },

  probability: {
    grade_9: [
      {
        question: "Бросают две игральные кости. Какова вероятность, что сумма очков будет простым числом?",
        questionKk: "Екі ойын тасын лақтырады. Түскен ұпайлар қосындысы жай сан болу ықтималдығы қандай?",
        questionEn: "Two dice are rolled. What is the probability that the sum is a prime number?",
        options: ["5/12", "1/2", "7/36", "15/36"],
        optionsKk: ["5/12", "1/2", "7/36", "15/36"],
        optionsEn: ["5/12", "1/2", "7/36", "15/36"],
        correctIndex: 0, difficulty: "medium",
      },
      {
        question: "В классе 20 учеников. Сколькими способами можно выбрать старосту и заместителя?",
        questionKk: "Сыныпта 20 оқушы бар. Староста мен орынбасарын қанша тәсілмен таңдауға болады?",
        questionEn: "There are 20 students. How many ways to choose a class monitor and deputy?",
        options: ["380", "400", "190", "210"],
        optionsKk: ["380", "400", "190", "210"],
        optionsEn: ["380", "400", "190", "210"],
        correctIndex: 0, difficulty: "medium",
      },
    ],
    grade_10: [
      {
        question: "В первой урне 4 белых и 6 чёрных шаров, во второй — 5 белых и 3 чёрных. Из первой переложили 1 шар во вторую. Какова вероятность вытащить белый из второй?",
        questionKk: "Бірінші урнада 4 ақ және 6 қара доп, екіншісінде — 5 ақ және 3 қара. Біріншіден екіншіге 1 доп салды. Екіншіден ақ доп алу ықтималдығы?",
        questionEn: "First urn: 4 white, 6 black. Second: 5 white, 3 black. Transfer 1 ball. P(draw white from second)?",
        options: ["0.6", "0.54", "0.62", "0.45"],
        optionsKk: ["0.6", "0.54", "0.62", "0.45"],
        optionsEn: ["0.6", "0.54", "0.62", "0.45"],
        correctIndex: 0, difficulty: "hard",
      },
      {
        question: "Стрелок попадает в цель с вероятностью 0.8. Сколько выстрелов нужно сделать, чтобы вероятность хотя бы одного попадания была ≥ 0.99?",
        questionKk: "Атқыш нысанаға 0.8 ықтималдықпен тиеді. Кем дегенде бір тию ықтималдығы ≥ 0.99 болу үшін қанша оқ ату керек?",
        questionEn: "Shooter hits with P=0.8. How many shots for P(at least one hit) ≥ 0.99?",
        options: ["3", "4", "2", "5"],
        optionsKk: ["3", "4", "2", "5"],
        optionsEn: ["3", "4", "2", "5"],
        correctIndex: 0, difficulty: "hard",
      },
    ],
    grade_11: [
      {
        question: "Случайная величина X имеет распределение: P(X=0)=0.3, P(X=1)=0.4, P(X=2)=0.3. Найдите D(X).",
        questionKk: "X кездейкөз шамасы: P(X=0)=0.3, P(X=1)=0.4, P(X=2)=0.3. D(X) табыңыз.",
        questionEn: "Random variable X: P(X=0)=0.3, P(X=1)=0.4, P(X=2)=0.3. Find D(X).",
        options: ["0.6", "0.8", "0.4", "1.0"],
        optionsKk: ["0.6", "0.8", "0.4", "1.0"],
        optionsEn: ["0.6", "0.8", "0.4", "1.0"],
        correctIndex: 0, difficulty: "hard",
      },
      {
        question: "Нормальное распределение N(100, 15²). Найдите P(85 < X < 115), если Φ(1)=0.8413.",
        questionKk: "N(100, 15²) қалыпты бөлініс. P(85 < X < 115) табыңыз, егер Φ(1)=0.8413.",
        questionEn: "Normal distribution N(100, 15²). Find P(85 < X < 115), given Φ(1)=0.8413.",
        options: ["0.6826", "0.9544", "0.8413", "0.5"],
        optionsKk: ["0.6826", "0.9544", "0.8413", "0.5"],
        optionsEn: ["0.6826", "0.9544", "0.8413", "0.5"],
        correctIndex: 0, difficulty: "hard",
      },
    ],
  },

  trigonometry: {
    grade_9: [
      {
        question: "Чему равен cos(60°)?",
        questionKk: "cos(60°) қанша?",
        questionEn: "What is cos(60°)?",
        options: ["0.5", "√3/2", "1", "√2/2"],
        optionsKk: ["0.5", "√3/2", "1", "√2/2"],
        optionsEn: ["0.5", "√3/2", "1", "√2/2"],
        correctIndex: 0, difficulty: "easy",
      },
      {
        question: "Найдите tg(α), если sin(α)=3/5 и α∈(0°, 90°).",
        questionKk: "sin(α)=3/5 және α∈(0°, 90°) болса, tg(α) табыңыз.",
        questionEn: "Find tg(α), if sin(α)=3/5 and α∈(0°, 90°).",
        options: ["3/4", "4/3", "3/5", "5/3"],
        optionsKk: ["3/4", "4/3", "3/5", "5/3"],
        optionsEn: ["3/4", "4/3", "3/5", "5/3"],
        correctIndex: 0, difficulty: "easy",
      },
    ],
    grade_10: [
      {
        question: "Решите: sin(2x) = √3/2 на интервале [0, π]. Сколько корней?",
        questionKk: "[0, π] аралығында sin(2x) = √3/2 шешіңіз. Тамырлар саны?",
        questionEn: "Solve sin(2x) = √3/2 on [0, π]. How many roots?",
        options: ["4", "2", "3", "6"],
        optionsKk: ["4", "2", "3", "6"],
        optionsEn: ["4", "2", "3", "6"],
        correctIndex: 0, difficulty: "medium",
      },
      {
        question: "Упростите: sin²(α) + sin²(α)·ctg²(α) = ?",
        questionKk: "Жеңілдетіңіз: sin²(α) + sin²(α)·ctg²(α) = ?",
        questionEn: "Simplify: sin²(α) + sin²(α)·ctg²(α) = ?",
        options: ["1", "cos²(α)", "sin⁴(α)", "2sin²(α)"],
        optionsKk: ["1", "cos²(α)", "sin⁴(α)", "2sin²(α)"],
        optionsEn: ["1", "cos²(α)", "sin⁴(α)", "2sin²(α)"],
        correctIndex: 0, difficulty: "medium",
      },
    ],
    grade_11: [
      {
        question: "Решите уравнение: sin(x) + sin(3x) = 0. Сколько корней на [0; 2π]?",
        questionKk: "Теңдеуді шешіңіз: sin(x) + sin(3x) = 0. [0; 2π] аралығында қанша тамыр?",
        questionEn: "Solve: sin(x) + sin(3x) = 0. How many roots on [0; 2π]?",
        options: ["6", "4", "8", "5"],
        optionsKk: ["6", "4", "8", "5"],
        optionsEn: ["6", "4", "8", "5"],
        correctIndex: 0, difficulty: "hard",
      },
      {
        question: "Найдите arcsin(sin(5π/4)).",
        questionKk: "arcsin(sin(5π/4)) табыңыз.",
        questionEn: "Find arcsin(sin(5π/4)).",
        options: ["−π/4", "5π/4", "π/4", "3π/4"],
        optionsKk: ["−π/4", "5π/4", "π/4", "3π/4"],
        optionsEn: ["−π/4", "5π/4", "π/4", "3π/4"],
        correctIndex: 0, difficulty: "hard",
      },
    ],
  },

  programming: {
    grade_9: [
      {
        question: "Что выведет код: for i in range(3): print(i)?",
        questionKk: "Код не шығарады: for i in range(3): print(i)?",
        questionEn: "What does this print: for i in range(3): print(i)?",
        options: ["0 1 2", "1 2 3", "0 1 2 3", "1 2"],
        optionsKk: ["0 1 2", "1 2 3", "0 1 2 3", "1 2"],
        optionsEn: ["0 1 2", "1 2 3", "0 1 2 3", "1 2"],
        correctIndex: 0, difficulty: "easy",
      },
      {
        question: "Какой тип данных в Python используется для хранения пар ключ-значение?",
        questionKk: "Python-да кілт-мән жұптарын сақтау үшін қандай деректер түрі қолданылады?",
        questionEn: "Which Python data type stores key-value pairs?",
        options: ["dict", "list", "tuple", "set"],
        optionsKk: ["dict", "list", "tuple", "set"],
        optionsEn: ["dict", "list", "tuple", "set"],
        correctIndex: 0, difficulty: "easy",
      },
    ],
    grade_10: [
      {
        question: "Какая сложность поиска элемента в сбалансированном BST с n элементами?",
        questionKk: "n элементі бар теңгерілген BST-де элемент іздеу күрделілігі?",
        questionEn: "What is the search complexity in a balanced BST with n elements?",
        options: ["O(log n)", "O(n)", "O(n log n)", "O(1)"],
        optionsKk: ["O(log n)", "O(n)", "O(n log n)", "O(1)"],
        optionsEn: ["O(log n)", "O(n)", "O(n log n)", "O(1)"],
        correctIndex: 0, difficulty: "medium",
      },
      {
        question: "Что такое рекурсия в программировании?",
        questionKk: "Бағдарламалаудағы рекурсия дегеніміз не?",
        questionEn: "What is recursion in programming?",
        options: ["Функция, вызывающая саму себя", "Цикл с счётчиком", "Глобальная переменная", "Тип данных"],
        optionsKk: ["Өзін-өзі шақыратын функция", "Санағышы бар цикл", "Жалпы айнымалы", "Деректер түрі"],
        optionsEn: ["A function calling itself", "A counted loop", "A global variable", "A data type"],
        correctIndex: 0, difficulty: "medium",
      },
    ],
    grade_11: [
      {
        question: "Какой алгоритм имеет худшую сложность O(n log n) и использует 'разделяй и властвуй'?",
        questionKk: "Қай алгоритмнің ең жаман күрделілігі O(n log n) және 'бөліп ал және билік ет' қолданады?",
        questionEn: "Which algorithm has worst-case O(n log n) and uses divide-and-conquer?",
        options: ["Merge Sort", "Bubble Sort", "Insertion Sort", "Selection Sort"],
        optionsKk: ["Merge Sort", "Bubble Sort", "Insertion Sort", "Selection Sort"],
        optionsEn: ["Merge Sort", "Bubble Sort", "Insertion Sort", "Selection Sort"],
        correctIndex: 0, difficulty: "hard",
      },
      {
        question: "В языке C, что делает указатель int *p = NULL; при разыменовании?",
        questionKk: "C тілінде int *p = NULL; көрсеткішін көрсету кезінде не болады?",
        questionEn: "In C, what happens when dereferencing int *p = NULL;?",
        options: ["Undefined behavior / crash", "Возвращает 0", "Создаёт переменную", "Компиляционная ошибка"],
        optionsKk: ["Анықталмаған мінез-құлық / қате", "0 қайтарады", "Айнымалы жасайды", "Компиляция қатесі"],
        optionsEn: ["Undefined behavior / crash", "Returns 0", "Creates a variable", "Compile error"],
        correctIndex: 0, difficulty: "hard",
      },
    ],
  },

  scientific: {
    grade_9: [
      {
        question: "Какой метод основан на наблюдении и формулировке гипотез?",
        questionKk: "Бақылау және болжам құруға негізделген әдіс?",
        questionEn: "Which method is based on observation and hypothesis formulation?",
        options: ["Научный метод", "Метод проб и ошибок", "Аналогия", "Интуиция"],
        optionsKk: ["Ғылыми әдіс", "Қателіктер мен сынама әдісі", "Аналогия", "Интуиция"],
        optionsEn: ["Scientific method", "Trial and error", "Analogy", "Intuition"],
        correctIndex: 0, difficulty: "easy",
      },
      {
        question: "Что такое контрольная группа в эксперименте?",
        questionKk: "Тәжірибедегі бақылау тобы дегеніміз не?",
        questionEn: "What is a control group in an experiment?",
        options: ["Группа без изменений для сравнения", "Группа с максимальным воздействием", "Случайная выборка", "Группа учёных"],
        optionsKk: ["Салыстыру үшін өзгеріссіз топ", "Максималды әсері бар топ", "Кездейкөз таңдау", "Ғалымдар тобы"],
        optionsEn: ["Group with no changes for comparison", "Group with max treatment", "Random sample", "Group of scientists"],
        correctIndex: 0, difficulty: "easy",
      },
    ],
    grade_10: [
      {
        question: "Что такое фальсифицируемость в науке?",
        questionKk: "Ғылымдағы жалғандалғыштық дегеніміз не?",
        questionEn: "What is falsifiability in science?",
        options: ["Возможность опровергнуть теорию экспериментом", "Доказательство теории", "Повторяемость эксперимента", "Статистический анализ"],
        optionsKk: ["Теорияны тәжірибемен жоққа шығару мүмкіндігі", "Теорияны дәлелдеу", "Тәжірибені қайталау", "Статистикалық талдау"],
        optionsEn: ["Ability to disprove a theory by experiment", "Proving a theory", "Experiment reproducibility", "Statistical analysis"],
        correctIndex: 0, difficulty: "medium",
      },
    ],
    grade_11: [
      {
        question: "В чём разница между корреляцией и причинно-следственной связью?",
        questionKk: "Корреляция мен себеп-салдар байланысының айырмашылығы неде?",
        questionEn: "What is the difference between correlation and causation?",
        options: ["Корреляция не подразумевает причину", "Они одинаковы", "Причинность слабее", "Корреляция всегда ложна"],
        optionsKk: ["Корреляция себепті білдірмейді", "Олар бірдей", "Себеп-салдар әлсіз", "Корреляция әрқашан жалған"],
        optionsEn: ["Correlation doesn't imply causation", "They are the same", "Causation is weaker", "Correlation is always false"],
        correctIndex: 0, difficulty: "hard",
      },
    ],
  },

  critical: {
    grade_9: [
      {
        question: "Какое утверждение является логической ошибкой (ad hominem)?",
        questionKk: "Қай тұжырым логикалық қате (ad hominem)?",
        questionEn: "Which statement is an ad hominem fallacy?",
        options: ["Он неправ, потому что он глупый", "2+2=4, потому что это аксиома", "Все металлы проводят ток", "Солнце встаёт на востоке"],
        optionsKk: ["Ол қате, өйткені ол ақымақ", "2+2=4, өйткені бұл аксиома", "Барлық металдар ток өткізеді", "Күн шығыстан шығады"],
        optionsEn: ["He's wrong because he's stupid", "2+2=4 by axiom", "All metals conduct electricity", "The sun rises in the east"],
        correctIndex: 0, difficulty: "easy",
      },
    ],
    grade_10: [
      {
        question: "Что такое когнитивное искажение 'подтверждение своей точки зрения' (confirmation bias)?",
        questionKk: "'Өз көзқарасын растау' когнитивтік бұрмалау дегеніміз не?",
        questionEn: "What is confirmation bias?",
        options: ["Искать только информацию, подтверждающую убеждения", "Забывать всё", "Бояться перемен", "Следовать за большинством"],
        optionsKk: ["Тек наным-сенімді растайтын ақпаратты іздеу", "Барлығын ұмыту", "Өзгерістерден қорқу", "Көпшілікке еру"],
        optionsEn: ["Seeking only info that confirms beliefs", "Forgetting everything", "Fear of change", "Following the majority"],
        correctIndex: 0, difficulty: "medium",
      },
    ],
    grade_11: [
      {
        question: "В аргументе 'Если A, то B. B истинно. Значит, A истинно.' — какая ошибка?",
        questionKk: "'Егер A, онда B. B шын. Демек, A шын.' — қандай қате?",
        questionEn: "In 'If A then B. B is true. Therefore A is true.' — what fallacy is this?",
        options: ["Утверждение следствия", "Отрицание основания", "Ложная дилемма", "Соломенное чучело"],
        optionsKk: ["Салдарды растау", "Негізді жоққа шығару", "Жалған дилемма", "Қорқытылған қуыршақ"],
        optionsEn: ["Affirming the consequent", "Denying the antecedent", "False dilemma", "Straw man"],
        correctIndex: 0, difficulty: "hard",
      },
    ],
  },

  calculus: {
    grade_9: [
      {
        question: "Чему равна производная константы f(x) = 5?",
        questionKk: "f(x) = 5 тұрақтысының туындысы қанша?",
        questionEn: "What is the derivative of constant f(x) = 5?",
        options: ["0", "5", "1", "5x"],
        optionsKk: ["0", "5", "1", "5x"],
        optionsEn: ["0", "5", "1", "5x"],
        correctIndex: 0, difficulty: "easy",
      },
    ],
    grade_10: [
      {
        question: "Найдите производную f(x) = sin(x)·cos(x).",
        questionKk: "f(x) = sin(x)·cos(x) туындысын табыңыз.",
        questionEn: "Find the derivative of f(x) = sin(x)·cos(x).",
        options: ["cos(2x)", "−sin(2x)", "2cos(2x)", "sin(2x)"],
        optionsKk: ["cos(2x)", "−sin(2x)", "2cos(2x)", "sin(2x)"],
        optionsEn: ["cos(2x)", "−sin(2x)", "2cos(2x)", "sin(2x)"],
        correctIndex: 0, difficulty: "medium",
      },
    ],
    grade_11: [
      {
        question: "Вычислите ∫ x·eˣ dx.",
        questionKk: "∫ x·eˣ dx есептеңіз.",
        questionEn: "Compute ∫ x·eˣ dx.",
        options: ["x·eˣ − eˣ + C", "x·eˣ + C", "eˣ(x+1) + C", "x·eˣ/2 + C"],
        optionsKk: ["x·eˣ − eˣ + C", "x·eˣ + C", "eˣ(x+1) + C", "x·eˣ/2 + C"],
        optionsEn: ["x·eˣ − eˣ + C", "x·eˣ + C", "eˣ(x+1) + C", "x·eˣ/2 + C"],
        correctIndex: 0, difficulty: "hard",
      },
    ],
  },

  leadership: {
    grade_9: [
      {
        question: "Какой стиль лидерства предполагает совместное принятие решений?",
        questionKk: "Қай көшбасшылық стилі бірлескен шешім қабылдауды қарастырады?",
        questionEn: "Which leadership style involves shared decision-making?",
        options: ["Демократический", "Автократический", "Laissez-faire", "Ситуативный"],
        optionsKk: ["Демократиялық", "Автократтық", "Laissez-faire", "Ситуациялық"],
        optionsEn: ["Democratic", "Autocratic", "Laissez-faire", "Situational"],
        correctIndex: 0, difficulty: "easy",
      },
    ],
    grade_10: [
      {
        question: "Что такое эмоциональный интеллект в контексте лидерства?",
        questionKk: "Көшбасшылық контекстіндегі эмоционалды интеллект дегеніміз не?",
        questionEn: "What is emotional intelligence in leadership context?",
        options: ["Способность понимать и управлять эмоциями", "Высокий IQ", "Техническая экспертиза", "Харизма"],
        optionsKk: ["Эмоцияларды түсіну және басқару қабілеті", "Жоғары IQ", "Техникалық сараптама", "Харизма"],
        optionsEn: ["Ability to understand and manage emotions", "High IQ", "Technical expertise", "Charisma"],
        correctIndex: 0, difficulty: "medium",
      },
    ],
    grade_11: [
      {
        question: "Согласно модели ситуационного лидерства Херси-Бланчарда, какой стиль для компетентных, но незаинтересованных?",
        questionKk: "Херси-Бланчардтың ситуациялық көшбасшылық моделі бойынша, қабілетті бірақ қызығушылығы жоқтарға қандай стиль?",
        questionEn: "In Hersey-Blanchard model, what style for competent but unmotivated followers?",
        options: ["Убеждение/участие", "Приказ", "Делегирование", "Обучение"],
        optionsKk: ["Сендіру/қатысу", "Бұйрық", "Өкілеттік беру", "Оқыту"],
        optionsEn: ["Selling/Participating", "Telling", "Delegating", "Coaching"],
        correctIndex: 0, difficulty: "hard",
      },
    ],
  },

  mastery: {
    grade_9: [
      {
        question: "Какой навык считается фундаментальным для всех STEM-дисциплин?",
        questionKk: "Барлық STEM пәндері үшін негізгі дағды қайсысы?",
        questionEn: "Which skill is fundamental for all STEM disciplines?",
        options: ["Математическое мышление", "Каллиграфия", "Заучивание дат", "Публичные выступления"],
        optionsKk: ["Математикалық ойлау", "Каллиграфия", "Күндерді жаттау", "Публикалық сөйлеу"],
        optionsEn: ["Mathematical thinking", "Calligraphy", "Memorizing dates", "Public speaking"],
        correctIndex: 0, difficulty: "easy",
      },
    ],
    grade_10: [
      {
        question: "Что такое метапознание?",
        questionKk: "Метатану дегеніміз не?",
        questionEn: "What is metacognition?",
        options: ["Осознание и контроль собственного мышления", "Многозадачность", "Быстрое чтение", "Память"],
        optionsKk: ["Өз ойлауын сезіну және бақылау", "Көптапсырмалық", "Жылдам оқу", "Есте сақтау"],
        optionsEn: ["Awareness and control of own thinking", "Multitasking", "Speed reading", "Memory"],
        correctIndex: 0, difficulty: "medium",
      },
    ],
    grade_11: [
      {
        question: "Какой подход лучше всего развивает все когнитивные навыки одновременно?",
        questionKk: "Барлық когнитивтік дағдыларды бір уақытта дамытатын қай тәсіл?",
        questionEn: "Which approach best develops all cognitive skills simultaneously?",
        options: ["Междисциплинарные проектные задачи", "Репетиторство по одному предмету", "Тестирование", "Лекции"],
        optionsKk: ["Пәнаралық жобалық тапсырмалар", "Бір пәннен репетиторлық", "Тестілеу", "Дәрістер"],
        optionsEn: ["Interdisciplinary project-based tasks", "Tutoring one subject", "Testing", "Lectures"],
        correctIndex: 0, difficulty: "hard",
      },
    ],
  },
};

function getGradeLevel(studentClass: string): GradeLevel {
  if (studentClass.startsWith("9")) return "grade_9";
  if (studentClass.startsWith("11")) return "grade_11";
  return "grade_10";
}

export function generateTask(skillId: string, studentClass: string): QuestQuestion | null {
  const level = getGradeLevel(studentClass);
  const bank = QUEST_BANK[skillId];
  if (!bank) return null;

  const pool = bank[level] || bank["grade_10"] || [];
  if (pool.length === 0) return null;

  const idx = Math.floor(Math.random() * pool.length);
  return pool[idx];
}
