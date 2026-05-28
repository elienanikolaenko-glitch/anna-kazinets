import { useEffect, useRef, useState, useCallback, type ReactNode } from "react";
import { motion, useScroll, useSpring, AnimatePresence } from "framer-motion";
import Lenis from "lenis";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial } from "@react-three/drei";
import * as THREE from "three";

/* ═══════════════════════════════════════════
   HOOKS
   ═══════════════════════════════════════════ */

function useLenis() {
  useEffect(() => {
    const lenis = new Lenis({ duration: 1.2, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
    function raf(t: number) { lenis.raf(t); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);
    return () => lenis.destroy();
  }, []);
}

function useMousePosition() {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const handler = useCallback((e: MouseEvent) => setPos({ x: e.clientX, y: e.clientY }), []);
  useEffect(() => { window.addEventListener("mousemove", handler); return () => window.removeEventListener("mousemove", handler); }, [handler]);
  return pos;
}

function useScrollProgress() {
  const { scrollYProgress } = useScroll();
  const smooth = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
  return smooth;
}

/* ═══════════════════════════════════════════
   3D SCENE
   ═══════════════════════════════════════════ */

function TorusKnot() {
  return (
    <Float speed={1.2} rotationIntensity={0.6} floatIntensity={0.5}>
      <mesh scale={2.2}>
        <torusKnotGeometry args={[0.8, 0.3, 128, 16]} />
        <MeshDistortMaterial
          color="#acd1ee"
          emissive="#acd1ee"
          emissiveIntensity={0.12}
          roughness={0.15}
          metalness={0.85}
          wireframe
        />
      </mesh>
    </Float>
  );
}

function Particles({ count = 60 }) {
  const ref = useRef<THREE.Points>(null!);
  const pos = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    pos[i * 3] = (Math.random() - 0.5) * 15;
    pos[i * 3 + 1] = (Math.random() - 0.5) * 15;
    pos[i * 3 + 2] = (Math.random() - 0.5) * 8 - 4;
  }
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.y = clock.getElapsedTime() * 0.015;
      ref.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.008) * 0.05;
    }
  });
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[pos, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.025} color="#acd1ee" transparent opacity={0.15} sizeAttenuation />
    </points>
  );
}

/* ═══════════════════════════════════════════
   COMPONENTS
   ═══════════════════════════════════════════ */

function Cursor({ mouse }: { mouse: { x: number; y: number } }) {
  return (
    <>
      <motion.div className="cursor-dot" animate={{ x: mouse.x - 3, y: mouse.y - 3 }} transition={{ duration: 0 }} />
      <motion.div className="cursor-ring" animate={{ x: mouse.x - 16, y: mouse.y - 16 }} transition={{ duration: 0.15 }} />
    </>
  );
}

function ScrollBar() {
  const progress = useScrollProgress();
  return <motion.div style={{ scaleX: progress, transformOrigin: "0% 50%" }} className="fixed top-0 left-0 right-0 h-[2px] z-[10001] origin-left metallic-solid" />;
}

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <>
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed top-0 left-0 right-0 z-[100] px-5 md:px-10 py-4 flex items-center justify-between transition-all duration-500 ${
          scrolled ? "bg-[#070606]/80 backdrop-blur-xl border-b border-[rgba(240,236,231,0.06)]" : ""
        }`}
      >
        <a href="#" className="text-sm font-medium tracking-tight text-[#f0ece7]">
          <span className="text-[#acd1ee]">Anna</span>Kazinets
        </a>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6">
          {["Услуги", "Кейсы", "Процесс"].map((item) => (
            <a key={item} href={`#${item === "Услуги" ? "services" : item === "Кейсы" ? "cases" : "process"}`}
              className="text-xs text-[#8a7f75] hover:text-[#f0ece7] transition-colors tracking-wide">{item}</a>
          ))}
          <a href="#contact" className="text-xs px-4 py-2 border border-[rgba(172,209,238,0.2)] text-[#acd1ee] hover:bg-[rgba(172,209,238,0.08)] transition-all rounded">Связаться</a>
        </div>

        {/* Mobile burger */}
        <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden flex flex-col gap-1.5 p-2">
          <span className={`block w-5 h-[1.5px] bg-[#f0ece7] transition-all ${menuOpen ? "rotate-45 translate-y-[5px]" : ""}`} />
          <span className={`block w-5 h-[1.5px] bg-[#f0ece7] transition-all ${menuOpen ? "opacity-0" : ""}`} />
          <span className={`block w-5 h-[1.5px] bg-[#f0ece7] transition-all ${menuOpen ? "-rotate-45 -translate-y-[5px]" : ""}`} />
        </button>
      </motion.nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed top-[57px] left-0 right-0 z-[99] bg-[#070606]/95 backdrop-blur-xl border-b border-[rgba(240,236,231,0.06)] md:hidden"
          >
            <div className="flex flex-col gap-4 px-5 py-6">
              {["Услуги", "Кейсы", "Процесс"].map((item) => (
                <a key={item} href={`#${item === "Услуги" ? "services" : item === "Кейсы" ? "cases" : "process"}`}
                  onClick={() => setMenuOpen(false)}
                  className="text-sm text-[#8a7f75] hover:text-[#f0ece7] transition-colors">{item}</a>
              ))}
              <a href="#contact" onClick={() => setMenuOpen(false)}
                className="text-sm px-4 py-3 border border-[rgba(172,209,238,0.2)] text-[#acd1ee] rounded text-center">Связаться</a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function SplitText({ text, className = "", delay = 0 }: { text: string; className?: string; delay?: number }) {
  const words = text.split(" ");
  return (
    <span className={`inline ${className}`}>
      {words.map((word, i) => (
        <span key={i} className="split-word" style={{ display: "inline-block", overflow: "hidden", verticalAlign: "top" }}>
          <motion.span
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.7, delay: delay + i * 0.05, ease: [0.16, 1, 0.3, 1] }}
            style={{ display: "inline-block" }}
          >
            {word}{i < words.length - 1 ? " " : ""}
          </motion.span>
        </span>
      ))}
    </span>
  );
}

function SectionHeader({ eyebrow, title, sub }: { eyebrow: string; title: ReactNode; sub?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="text-center mb-12 md:mb-16"
    >
      <span className="text-[10px] tracking-[3px] uppercase text-[#acd1ee] font-mono mb-3 block">{eyebrow}</span>
      <h2 className="text-[clamp(26px,3.5vw,48px)] font-light tracking-tight text-[#f0ece7] leading-[0.95]">{title}</h2>
      {sub && <p className="text-sm text-[#8a7f75] mt-3 md:mt-4 max-w-md mx-auto px-4">{sub}</p>}
    </motion.div>
  );
}

function Reveal({ children, className = "", delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function MagneticButton({ children, href, className = "" }: { children: ReactNode; href: string; className?: string }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const handleMove = (e: React.MouseEvent) => {
    const el = ref.current; if (!el) return;
    const rect = el.getBoundingClientRect();
    setPos({ x: (e.clientX - rect.left - rect.width / 2) * 0.3, y: (e.clientY - rect.top - rect.height / 2) * 0.3 });
  };
  const handleLeave = () => setPos({ x: 0, y: 0 });
  return (
    <a ref={ref} href={href} onMouseMove={handleMove} onMouseLeave={handleLeave}
      className={`inline-block ${className}`}
      style={{ transform: `translate(${pos.x}px, ${pos.y}px)`, transition: "transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)" }}>
      {children}
    </a>
  );
}

function Counter({ to, label }: { to: number; label: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        let start = 0;
        const step = Math.ceil(to / (2000 / 16));
        const interval = setInterval(() => {
          start += step;
          if (start >= to) { setCount(to); clearInterval(interval); }
          else setCount(start);
        }, 16);
        observer.disconnect();
      }
    }, { threshold: 0.5 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [to]);
  return (
    <div className="text-center">
      <span ref={ref} className="text-2xl md:text-3xl font-mono text-[#f0ece7] tabular-nums">{count}</span>
      <span className="block text-[9px] md:text-[10px] tracking-[2px] uppercase text-[#8a7f75] font-mono mt-1">{label}</span>
    </div>
  );
}

/* ═══════════════════════════════════════════
   SECTIONS DATA
   ═══════════════════════════════════════════ */

const SERVICES = [
  {
    icon: "📱", title: "SMM",
    desc: "Ведение соцсетей с нуля: контент-план, Reels, Stories, вовлечение аудитории",
    tags: ["Instagram", "Telegram", "VK"],
    price: "от 20 000 ₽",
  },
  {
    icon: "📅", title: "Контент-план",
    desc: "Стратегия на месяц: рубрикатор, редакционная сетка, тренды, семантика",
    tags: ["SEO", "Аналитика", "Тренды"],
    price: "от 10 000 ₽",
  },
  {
    icon: "📢", title: "PR",
    desc: "Медиаплан, базы блогеров и СМИ, инфлюенс-маркетинг, коммуникации",
    tags: ["Медиа", "Блогеры", "Пресса"],
    price: "от 30 000 ₽",
  },
  {
    icon: "🎯", title: "Реклама",
    desc: "Таргет VK/TG, контекст Яндекс.Директ, ретаргетинг, сквозная аналитика",
    tags: ["VK Ads", "Яндекс", "ROI"],
    price: "от 25 000 ₽",
  },
  {
    icon: "🔍", title: "Парсинг",
    desc: "Сбор данных из Telegram, сайтов, маркетплейсов. Мониторинг цен и конкурентов",
    tags: ["Telethon", "Playwright", "AI"],
    price: "от 15 000 ₽",
  },
  {
    icon: "⚙️", title: "Автоматизация",
    desc: "n8n, Make, Python-скрипты: воронки продаж, автоворонки, ETL-процессы",
    tags: ["n8n", "Make", "Python"],
    price: "от 20 000 ₽",
  },
  {
    icon: "🤖", title: "Чат-боты",
    desc: "TG-боты с AI: GPT-ассистенты, автопродажи, квалификация лидов, консультации",
    tags: ["GPT", "RAG", "TgBot"],
    price: "от 12 000 ₽",
  },
  {
    icon: "📊", title: "CRM",
    desc: "AmoCRM / Bitrix24: настройка, интеграции, дашборды, автоматизация сделок",
    tags: ["AmoCRM", "Bitrix24", "API"],
    price: "от 25 000 ₽",
  },
  {
    icon: "📈", title: "Лидогенерация",
    desc: "AI-поиск ЦА, парсинг аудитории, авторассылки, прогревы, квалификация",
    tags: ["AI", "Парсинг", "Автоворонка"],
    price: "от 15 000 ₽",
  },
  {
    icon: "✨", title: "AI-контент",
    desc: "Фото, видео, Reels, цифровые аватары, озвучка, сценарии. Нейросети под ключ",
    tags: ["Flux", "HeyGen", "GPT-4o"],
    price: "от 8 000 ₽",
  },
  {
    icon: "🎬", title: "UGC",
    desc: "Продакшн аутентичного контента, AI-аватары, видеоотзывы, вирусные Reels",
    tags: ["Съёмка", "AI", "Монтаж"],
    price: "от 5 000 ₽",
  },
];

const CASES = [
  {
    tag: "Парсинг + Лидген",
    client: "Агентство недвижимости",
    business: "Недвижимость · 15 менеджеров",
    problem: "Менеджеры вручную мониторили 50+ Telegram-чатов — 6-7 часов в день. Качество лидов низкое, конверсия 8%. Много пустых заявок.",
    solution: "Парсер на Telethon сканирует 50 чатов каждые 15 минут. AI-фильтр на GPT отсеивает пустые аккаунты и спам. Чистые лиды через n8n уходят в Telegram-бот с оффером, затем в CRM с напоминанием менеджеру.",
    result: "5 000+ лидов в день · Конверсия 40% · 3 000 чистая прибыль с каждого закрытого лида",
    savings: "−40 часов ручного труда в неделю · −120 000 ₽ на менеджерах в месяц",
    tech: ["Telethon", "GPT-4o", "n8n", "AmoCRM"],
    timeline: "1 неделя",
  },
  {
    tag: "AI-контент + SMM",
    client: "Интернет-магазин одежды",
    business: "E-com · 3 сотрудника на контент",
    problem: "Тратили 180 000 ₽/мес на дизайнера + копирайтера + монтажёра. 5 постов в неделю, Reels нет, охваты падают, контент нерегулярный.",
    solution: "GPT-4o генерирует 30+ постов в неделю по брифу. Flux создаёт фото моделей в одежде бренда. HeyGen делает Reels с аватаром. Make публикует в Telegram и Instagram по расписанию. Весь цикл — 15 минут вместо 3 часов.",
    result: "30+ постов в неделю · Средний охват 12 000 · Reels с 500K+ просмотров",
    savings: "−150 000 ₽/мес на команде · −20 часов ручного труда в неделю",
    tech: ["GPT-4o", "Flux", "HeyGen", "Make"],
    timeline: "2 недели",
  },
  {
    tag: "Автоматизация + CRM",
    client: "Маркетинговое агентство",
    business: "Услуги B2B · 8 сотрудников",
    problem: "Заявки терялись в Telegram, сделки не закрывались, встречи накладывались, отчётность вручную в Excel. Никакой CRM.",
    solution: "n8n связала AmoCRM → Telegram → Google Calendar → e-mail. Бот квалифицирует заявки по BANT, создаёт карточку сделки, подбирает слот. Автоматические напоминания клиенту за 24ч и за 1ч. Ежедневный автоотчёт CEO в Telegram.",
    result: "30 секунд вместо 3 минут на лида · 87% задач в автоматическом режиме · +34% конверсии в сделку",
    savings: "−15 часов админ-работы в неделю · −80 000 ₽ на ассистенте в месяц",
    tech: ["AmoCRM", "n8n", "TG Bot", "GCal API"],
    timeline: "5 дней",
  },
  {
    tag: "PR + Реклама",
    client: "AI-стартап",
    business: "B2B SaaS · Без маркетолога",
    problem: "Бюджет $500, нужно 100 платящих пользователей за 2 недели. Нет команды, нет базы, нет медиаплана. Стартап на стадии pre-seed.",
    solution: "Распарсила базу 6 500 бухгалтеров из открытых источников. AI-персонализация — 12 вариантов оффера под разные сегменты. Ретаргетинг VK на тёплую аудиторию + 20 микроблогеров за бартер.",
    result: "300+ заявок в день · Стоимость лида $2.4 · ROI 340%",
    savings: "−$4 000 на рекламном бюджете против стандартного запуска · −3 недели времени",
    tech: ["Python", "VK Ads", "GPT", "Telethon"],
    timeline: "10 дней",
  },
  {
    tag: "GPT + Чат-бот",
    client: "Онлайн-школа",
    business: "EdTech · 200+ заявок в день",
    problem: "200+ заявок в день, менеджеры успевали обработать половину. Квалификации нет — 60% лидов терялось. Время ответа — 4+ часа.",
    solution: "TG-бот c RAG: знает все курсы, цены, даты и программу. Квалифицирует по BANT за 2 минуты. Тёплых записывает на бесплатный урок. Горячего лида передаёт менеджеру с полной историей диалога. Холодных в автоворонку прогрева.",
    result: "2 000+ диалогов в месяц · 68% закрываются без оператора · NPS 8.7",
    savings: "−3 менеджера в колл-центре · −210 000 ₽/мес на зарплатах",
    tech: ["GPT-4o", "RAG", "TG Bot", "Make"],
    timeline: "1 неделя",
  },
  {
    tag: "Парсинг + Данные",
    client: "Продавец электроники",
    business: "E-com WB/Ozon · 30 конкурентов",
    problem: "Вручную отслеживал 30 конкурентов — 3 часа в день. Реакция на изменение цены — сутки. Маржа уходила конкурентам из-за медленной реакции.",
    solution: "Парсер на Playwright + AI обходит 10 000 карточек в день. Мгновенные алерты в Telegram при изменении цены у конкурента. Дашборд с динамикой цен + авторекомендация оптимальной цены на основе эластичности спроса.",
    result: "10 000 карточек в день · 99.2% точность данных · +22% маржи",
    savings: "−20 часов ручного мониторинга в неделю · +500 000 ₽ дополнительной прибыли в месяц",
    tech: ["Playwright", "Python", "TG Bot", "AI"],
    timeline: "2 недели",
  },
];

const PROCESS = [
  {
    num: "01", title: "Анализ",
    desc: "Изучаю нишу, конкурентов, ЦА. Определяю боли, точки роста, KPI проекта",
    details: ["Аудит текущего", "Конкуренты", "Портрет ЦА", "Метрики"],
  },
  {
    num: "02", title: "Стратегия",
    desc: "Готовлю план, сроки, стек технологий и дорожную карту с milestones",
    details: ["Дорожная карта", "Выбор стека", "Бюджет", "Риски"],
  },
  {
    num: "03", title: "Реализация",
    desc: "Собираю решение: код, контент, интеграции. Еженедельные отчёты",
    details: ["Разработка", "Контент", "Интеграции", "Тесты"],
  },
  {
    num: "04", title: "Запуск",
    desc: "Тестирую, запускаю, передаю с инструкцией. Пост-запуск поддержка 2 недели",
    details: ["QA", "Запуск", "Документация", "Поддержка"],
  },
];

const TESTIMONIALS = [
  {
    text: `Обратилась к Ане, когда поняла, что вебинары — это ад. 50 заявок в день, я физически не успевала всем отвечать. Она за неделю собрала бота, который сам записывает людей, напоминает о старте, присылает запись.\n\nЯ просто захожу и провожу эфир. Сэкономила месяцы нервов и тысяч 80 на менеджере.`,
    author: "Вера", role: "основатель онлайн-школы", initials: "В", color: "#b794f4", time: "14:23",
    project: "AI-ассистент продаж",
  },
  {
    text: `До Ани мы лидогенерили как в каменном веке — менеджеры сидели в чатах и копипастили. Она автоматизировала всё: парсинг, первый контакт, квалификацию.\n\nЧерез месяц у нас 200+ контактов в день, а команда просто берет тёплых и закрывает. Я в шоке от KPI — окупилось за первую неделю.`,
    author: "Дмитрий", role: "CEO агентства", initials: "Д", color: "#63b3ed", time: "09:47",
    project: "Бот-лидогенератор",
  },
  {
    text: `У нас был дизайнер за 120к, который делал 5 постов в неделю. Аня подключила нейронки — и теперь выходит 30+ постов, визуал в разы круче, плюс Reels с аватаром бренда.\n\nДизайнера уволили, экономия 150к в месяц. Я не верила, что такое возможно, но цифры не врут.`,
    author: "Елена", role: "SMM-менеджер", initials: "Е", color: "#fbbf24", time: "11:05",
    project: "Контент-фабрика",
  },
  {
    text: `Заказали UGC с цифровыми аватарами — думал будет кринж. Оказалось, реально работает: подписчики пишут «это вы настоящий?» и конверсия в личку выросла в 3 раза.\n\nЦена копейки, просмотры миллионные. Уже запустили вторую партию на 20 аватаров.`,
    author: "Алексей", role: "маркетолог e-commerce", initials: "А", color: "#f472b6", time: "16:52",
    project: "UGC + AI-аватары",
  },
];

/* ═══════════════════════════════════════════
   APP
   ═══════════════════════════════════════════ */

export default function App() {
  useLenis();
  const mouse = useMousePosition();
  const [canvasMounted, setCanvasMounted] = useState(false);
  useEffect(() => { setCanvasMounted(true); }, []);

  return (
    <div className="noise">
      <Cursor mouse={mouse} />
      <ScrollBar />
      <div className="grid-overlay" />
      <Navbar />

      {/* ─── Background shapes ─── */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        {canvasMounted && (
          <div className="absolute inset-0 opacity-30 md:opacity-40">
            <Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
              <ambientLight intensity={0.3} />
              <directionalLight position={[5, 5, 5]} intensity={0.5} />
              <TorusKnot />
              <Particles />
            </Canvas>
          </div>
        )}
        <div className="absolute top-[-15%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-[radial-gradient(ellipse_at_30%_50%,rgba(172,209,238,0.04),transparent_70%)]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[50vw] h-[50vw] rounded-full bg-[radial-gradient(ellipse_at_70%_50%,rgba(172,209,238,0.025),transparent_60%)]" />
        <div className="absolute top-[30%] right-[-8%] w-[40vw] h-[40vw] border border-[rgba(172,209,238,0.04)] rounded-full" />
        <div className="absolute top-[20%] left-[5%] w-[20vw] h-[20vw] border border-[rgba(172,209,238,0.03)] rotate-45" />
        <svg className="absolute top-[10%] left-[50%] -translate-x-1/2 w-[80vw] h-[80vw] opacity-[0.015]" viewBox="0 0 100 100">
          <defs>
            <pattern id="grid" width="8" height="8" patternUnits="userSpaceOnUse">
              <path d="M 8 0 L 0 0 0 8" fill="none" stroke="#acd1ee" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#grid)" />
        </svg>
        <svg className="absolute bottom-[20%] left-[-10%] w-[40vw] h-[40vw] opacity-[0.02]" viewBox="0 0 200 200">
          <path d="M 20 180 Q 100 20 180 180" fill="none" stroke="#acd1ee" strokeWidth="0.5" />
          <path d="M 40 180 Q 100 40 160 180" fill="none" stroke="#acd1ee" strokeWidth="0.3" />
          <path d="M 60 180 Q 100 60 140 180" fill="none" stroke="#acd1ee" strokeWidth="0.2" />
        </svg>
        <svg className="absolute top-[15%] right-[-5%] w-[30vw] h-[30vw] opacity-[0.015]" viewBox="0 0 100 100">
          <polygon points="50,5 95,35 78,85 22,85 5,35" fill="none" stroke="#acd1ee" strokeWidth="0.5" />
          <polygon points="50,22 75,40 65,68 35,68 25,40" fill="none" stroke="#acd1ee" strokeWidth="0.3" />
        </svg>
        <svg className="hidden md:block absolute top-[50%] right-[10%] w-[15vw] h-[15vw] opacity-[0.025]" viewBox="0 0 100 100">
          {Array.from({ length: 10 }).map((_, i) => (
            Array.from({ length: 10 }).map((_, j) => (
              <circle key={`${i}-${j}`} cx={i * 11 + 5} cy={j * 11 + 5} r="1" fill="#acd1ee" />
            ))
          ))}
        </svg>
      </div>

      {/* ─── Hero ─── */}
      <section className="min-h-screen flex items-center px-5 md:px-10 relative z-10 overflow-hidden">
        <div className="mx-auto max-w-6xl w-full grid md:grid-cols-2 gap-8 md:gap-12 items-center">
          {/* Left: text */}
          <div className="text-center md:text-left">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 border border-[rgba(240,236,231,0.06)] rounded-full text-[9px] md:text-[10px] tracking-[2px] uppercase text-[#8a7f75] font-mono mb-6 md:mb-8"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e]" />
              Open to projects · 2026
            </motion.div>

            <h1 className="text-[clamp(28px,5vw,72px)] font-light tracking-tight text-[#f0ece7] leading-[0.9] mb-5 md:mb-6">
              <span className="metallic"><SplitText text="AI Automation" delay={0.2} /></span>
              <br />
              <span className="metallic italic"><SplitText text="& Marketing" delay={0.5} /></span>
              <br />
              <span className="metallic"><SplitText text="Specialist" delay={0.8} /></span>
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.1 }}
              className="text-sm md:text-base text-[#8a7f75] max-w-lg mb-8 md:mb-10 leading-relaxed"
            >
              SMM · контент · PR · реклама · парсинг · автоматизация · чат-боты · CRM · лидоген · AI-контент · UGC
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.3 }}
              className="flex gap-3 md:gap-4 flex-wrap justify-center md:justify-start"
            >
              <MagneticButton href="#cases" className="px-7 md:px-8 py-3 md:py-3.5 metallic-btn text-[#070606] text-xs font-medium tracking-wide rounded">
                Смотреть кейсы
              </MagneticButton>
              <MagneticButton href="#contact" className="px-7 md:px-8 py-3 md:py-3.5 border border-[rgba(240,236,231,0.12)] text-[#f0ece7] text-xs font-medium tracking-wide rounded hover:border-[rgba(172,209,238,0.3)] transition-colors">
                Связаться
              </MagneticButton>
            </motion.div>
          </div>

          {/* Right: full photo */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="flex justify-center items-end"
          >
            <div className="relative w-full max-w-[280px] md:max-w-none">
              <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(172,209,238,0.06),transparent_50%,rgba(172,209,238,0.03))] rounded-2xl" />
              <img
                src="/images/me.jpg"
                alt="Anna Kazinets"
                className="w-full md:h-[80vh] md:w-auto object-contain relative z-10"
              />
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-[9px] tracking-[3px] uppercase text-[#8a7f75] font-mono animate-bounce"
        >
          scroll ↓
        </motion.div>
      </section>

      {/* ─── Tickertape ─── */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="overflow-hidden border-y border-[rgba(240,236,231,0.06)] py-3 relative z-10"
      >
        <motion.div
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 40, ease: "linear", repeat: Infinity }}
          className="flex gap-8 md:gap-12 w-max"
        >
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex gap-8 md:gap-12 items-center text-[9px] md:text-[10px] tracking-[2px] uppercase text-[#8a7f75] font-mono whitespace-nowrap">
              <span className="text-[#acd1ee]">✦</span> SMM <span className="text-[#acd1ee]">✦</span> Контент <span className="text-[#acd1ee]">✦</span> PR
              <span className="text-[#acd1ee]">✦</span> Реклама <span className="text-[#acd1ee]">✦</span> Парсинг <span className="text-[#acd1ee]">✦</span> Автоматизация
              <span className="text-[#acd1ee]">✦</span> Чат-боты <span className="text-[#acd1ee]">✦</span> CRM <span className="text-[#acd1ee]">✦</span> Лидген
              <span className="text-[#acd1ee]">✦</span> AI-контент <span className="text-[#acd1ee]">✦</span> UGC
            </div>
          ))}
        </motion.div>
      </motion.div>

      {/* ─── Stats ─── */}
      <section className="relative z-10 border-b border-[rgba(240,236,231,0.06)]">
        <div className="flex justify-center gap-6 md:gap-20 py-10 md:py-14 px-5 md:px-10 flex-wrap">
          <Counter to={40} label="проектов" />
          <Counter to={97} label="% точности AI" />
          <Counter to={3} label="дня средний срок" />
          <Counter to={5000} label="лидов/день макс" />
        </div>
        <div className="flex justify-center gap-4 md:gap-8 pb-6 md:pb-8 px-5 md:px-10 flex-wrap">
          <span className="text-[9px] font-mono text-[#5a5a5a] tracking-wide">Telethon · Python · n8n · Make · GPT-4o · AmoCRM · Bitrix24 · Playwright · Flux · HeyGen</span>
        </div>
      </section>

      {/* ─── Services ─── */}
      <section id="services" className="py-16 md:py-24 px-5 md:px-10 max-w-6xl mx-auto relative z-10">
        <SectionHeader eyebrow="[ services ]" title={<>Что я <span className="text-[#acd1ee] italic">делаю</span></>} sub="11 направлений — от контента до автоматизации" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-px bg-[rgba(240,236,231,0.06)] rounded-lg overflow-hidden">
          {SERVICES.map((s, i) => (
            <Reveal key={i} delay={i * 0.03} className="p-5 md:p-6 bg-[#0d0c0b] hover:bg-[#161411] transition-colors cursor-default group">
              <div className="flex items-start justify-between mb-2 md:mb-3">
                <span className="text-lg md:text-xl">{s.icon}</span>
                <span className="text-[9px] md:text-[10px] font-mono text-[#acd1ee] opacity-0 group-hover:opacity-100 transition-opacity">{s.price}</span>
              </div>
              <h3 className="text-xs md:text-sm font-medium text-[#f0ece7] mb-1 md:mb-1.5">{s.title}</h3>
              <p className="text-[11px] md:text-xs text-[#8a7f75] leading-relaxed mb-2 md:mb-3">{s.desc}</p>
              <div className="flex gap-1.5 flex-wrap">
                {s.tags.map((t, j) => (
                  <span key={j} className="text-[8px] md:text-[9px] font-mono text-[#5a5a5a] tracking-wide">{t}{j < s.tags.length - 1 ? " /" : ""}</span>
                ))}
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ─── Cases ─── */}
      <section id="cases" className="py-16 md:py-24 px-5 md:px-10 max-w-5xl mx-auto relative z-10">
        <SectionHeader eyebrow="[ portfolio ]" title={<><span className="text-[#acd1ee] italic">Кейсы</span></>} sub="Реальные проекты с измеримыми результатами" />
        <div className="space-y-3">
          {CASES.map((c, i) => (
            <Reveal key={i} delay={i * 0.05}>
              <motion.div className="p-5 md:p-8 bg-[#0d0c0b] border border-[rgba(240,236,231,0.06)] rounded-lg hover:border-[rgba(172,209,238,0.15)] transition-colors cursor-default">
                <div className="flex flex-wrap items-start justify-between gap-2 mb-2 md:mb-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[8px] md:text-[9px] tracking-[1.5px] uppercase font-mono text-[#acd1ee] bg-[rgba(172,209,238,0.06)] px-2 md:px-2.5 py-1 rounded">{c.tag}</span>
                    <span className="text-[8px] md:text-[9px] font-mono text-[#5a5a5a]">⏱ {c.timeline}</span>
                  </div>
                </div>

                {/* Клиент */}
                <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3">
                  <span className="text-[11px] md:text-xs text-[#f0ece7] font-medium">{c.client}</span>
                  <span className="text-[8px] md:text-[9px] font-mono text-[#5a5a5a]">· {c.business}</span>
                </div>

                {/* Проблема */}
                <div className="mb-3 md:mb-4">
                  <span className="text-[9px] md:text-[10px] tracking-[1px] uppercase text-[#a0635f] font-mono block mb-1">Проблема</span>
                  <p className="text-xs md:text-sm text-[#8a7f75] leading-relaxed">{c.problem}</p>
                </div>

                {/* Решение */}
                <div className="mb-3 md:mb-4">
                  <span className="text-[9px] md:text-[10px] tracking-[1px] uppercase text-[#b1a3b5] font-mono block mb-1">Решение</span>
                  <p className="text-xs md:text-sm text-[#8a7f75] leading-relaxed">{c.solution}</p>
                </div>

                {/* Результат */}
                <div className="mb-3">
                  <span className="text-[9px] md:text-[10px] tracking-[1px] uppercase text-[#22c55e] font-mono block mb-1">Результат</span>
                  <p className="text-[11px] md:text-xs text-[#22c55e]/80 font-mono leading-relaxed">{c.result}</p>
                </div>

                {/* Экономия */}
                <div className="mb-3 md:mb-4 p-3 md:p-3.5 bg-[rgba(172,209,238,0.04)] border border-[rgba(172,209,238,0.08)] rounded">
                  <span className="text-[9px] md:text-[10px] tracking-[1px] uppercase text-[#acd1ee] font-mono block mb-1">Экономия</span>
                  <p className="text-[11px] md:text-xs text-[#acd1ee]/70 font-mono leading-relaxed">{c.savings}</p>
                </div>

                {/* Tech stack */}
                <div className="flex gap-1.5 md:gap-2 flex-wrap">
                  {c.tech.map((t, j) => (
                    <span key={j} className="text-[8px] md:text-[9px] font-mono text-[#5a5a5a] border border-[rgba(240,236,231,0.06)] px-1.5 md:px-2 py-0.5 rounded">{t}</span>
                  ))}
                </div>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ─── Process ─── */}
      <section id="process" className="py-16 md:py-24 px-5 md:px-10 max-w-4xl mx-auto relative z-10">
        <SectionHeader eyebrow="[ process ]" title={<>Как я <span className="text-[#acd1ee] italic">работаю</span></>} />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
          {PROCESS.map((p, i) => (
            <Reveal key={i} delay={i * 0.1}>
              <motion.div whileHover={{ y: -4 }} className="p-5 md:p-6 bg-[#0d0c0b] border border-[rgba(240,236,231,0.06)] rounded-lg text-center cursor-default group">
                <div className="text-xl md:text-2xl font-mono text-[#acd1ee] opacity-30 mb-2 md:mb-3">{p.num}</div>
                <h3 className="text-xs md:text-sm font-medium text-[#f0ece7] mb-0.5 md:mb-1">{p.title}</h3>
                <p className="text-[11px] md:text-xs text-[#8a7f75] mb-2 md:mb-3">{p.desc}</p>
                <div className="flex flex-wrap justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {p.details.map((d, j) => (
                    <span key={j} className="text-[8px] md:text-[9px] font-mono text-[#5a5a5a]">{d}{j < p.details.length - 1 ? " ·" : ""}</span>
                  ))}
                </div>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ─── Testimonials ─── */}
      <section className="py-16 md:py-24 px-5 md:px-10 max-w-4xl mx-auto relative z-10">
        <SectionHeader eyebrow="[ reviews ]" title={<>Клиенты</>} />
        <div className="grid md:grid-cols-2 gap-4 md:gap-5">
          {TESTIMONIALS.map((t, i) => (
            <Reveal key={i} delay={i * 0.08}>
              <div className="bg-[#0d0c0b] border border-[rgba(240,236,231,0.06)] rounded-xl overflow-hidden cursor-default">
                {/* Telegram chat header */}
                <div className="flex items-center gap-3 p-3 md:p-4 border-b border-[rgba(240,236,231,0.06)]">
                  <div className="w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center text-sm font-medium text-white shrink-0" style={{background: t.color}}>
                    {t.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs md:text-sm font-medium text-[#f0ece7] truncate">{t.author}</div>
                    <div className="text-[10px] md:text-[11px] text-[#8a7f75] font-mono truncate">{t.role}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-[10px] md:text-[11px] text-[#5a5a5a] font-mono">{t.time}</div>
                    <div className="text-[8px] text-[#acd1ee] font-mono">{t.project}</div>
                  </div>
                </div>
                {/* Telegram message bubble */}
                <div className="px-3 md:px-4 pt-3 pb-4 md:pb-5">
                  <div className="bg-[#161411] rounded-lg rounded-tl-sm px-3.5 md:px-4 py-2.5 md:py-3 inline-block max-w-full">
                    <p className="text-[12px] md:text-[13px] text-[#d4d0c8] leading-relaxed whitespace-pre-line">{t.text}</p>
                  </div>
                  <div className="flex items-center gap-1.5 mt-1 ml-1">
                    <span className="text-[9px] text-[#5a5a5a] font-mono">{t.time}</span>
                    <svg className="w-3.5 h-3.5" viewBox="0 0 16 11" fill="#5a5a5a">
                      <path d="M11.071.653a.457.457 0 0 0-.304-.102.493.493 0 0 0-.381.178l-6.19 7.636-2.011-2.095a.463.463 0 0 0-.332-.14.457.457 0 0 0-.346.14.473.473 0 0 0-.14.336c0 .13.047.243.14.336l2.453 2.555c.102.112.22.168.355.168a.47.47 0 0 0 .381-.178l6.575-8.095a.398.398 0 0 0 .093-.254.464.464 0 0 0-.14-.335l-.003-.01ZM5.269 6.498l-.003.01.003-.01Z"/>
                      <path d="M11.071.653a.457.457 0 0 0-.304-.102.493.493 0 0 0-.381.178l-6.19 7.636-2.011-2.095a.463.463 0 0 0-.332-.14.457.457 0 0 0-.346.14.473.473 0 0 0-.14.336c0 .13.047.243.14.336l2.453 2.555c.102.112.22.168.355.168a.47.47 0 0 0 .381-.178l6.575-8.095a.398.398 0 0 0 .093-.254.464.464 0 0 0-.14-.335l-.003-.01Z" fill="#5a5a5a"/>
                    </svg>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
        {/* Telegram watermark hint */}
        <div className="text-center mt-8">
          <span className="text-[9px] tracking-[1.5px] uppercase text-[#5a5a5a] font-mono">скриншоты из Telegram</span>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section id="contact" className="py-20 md:py-28 px-5 md:px-10 text-center relative z-10 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] md:w-[400px] h-[300px] md:h-[400px] rounded-full bg-[rgba(172,209,238,0.04)] pointer-events-none" />
        <Reveal>
          <div className="max-w-lg mx-auto relative">
            <span className="text-[9px] md:text-[10px] tracking-[3px] uppercase text-[#acd1ee] font-mono mb-2 block">[ контакты ]</span>
            <h2 className="text-[clamp(24px,4vw,48px)] font-light tracking-tight leading-[0.95] mb-3 md:mb-4 metallic">
              Давай обсудим
            </h2>
            <p className="text-xs md:text-sm text-[#8a7f75] mb-2">Напиши в Telegram — отвечу в течение часа</p>
            <p className="text-[10px] md:text-[11px] text-[#5a5a5a] font-mono mb-6 md:mb-8">Работаю с РФ и СНГ · Оплата — карта/крипта/USDT</p>
            <div className="flex flex-col items-center gap-4">
              <MagneticButton href="https://t.me/kkkkazinets" className="px-8 md:px-10 py-3.5 md:py-4 metallic-btn text-[#070606] text-xs font-medium tracking-wide rounded">
                @kkkkazinets →
              </MagneticButton>
              <div className="flex gap-6 text-[9px] md:text-[10px] font-mono text-[#5a5a5a]">
                <span>чат-боты</span>
                <span className="text-[#acd1ee]">✦</span>
                <span>автоматизация</span>
                <span className="text-[#acd1ee]">✦</span>
                <span>AI-контент</span>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ─── Footer ─── */}
      <footer className="py-5 md:py-6 px-5 md:px-10 border-t border-[rgba(240,236,231,0.06)] flex items-center justify-between text-[9px] md:text-[10px] font-mono text-[#8a7f75] tracking-wide relative z-10">
        <span className="text-[#f0ece7]"><span className="text-[#acd1ee]">Anna</span>Kazinets</span>
        <div className="flex gap-4 md:gap-5">
          <a href="#services" className="hover:text-[#f0ece7] transition-colors">Услуги</a>
          <a href="#cases" className="hover:text-[#f0ece7] transition-colors">Кейсы</a>
          <a href="#process" className="hover:text-[#f0ece7] transition-colors">Процесс</a>
        </div>
        <span>2026</span>
      </footer>
    </div>
  );
}
