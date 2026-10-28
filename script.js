// Экран загрузки: счётчик 0→100, затем экран уезжает вверх
const loader = document.querySelector('.loader');
const loaderNums = document.querySelectorAll('.loader__num');
const LOADER_TIME = 1800;
let pageLoaded = document.readyState === 'complete';
window.addEventListener('load', () => { pageLoaded = true; });
window.scrollTo(0, 0);

const loaderStart = performance.now();
const tick = (now) => {
  const t = Math.min((now - loaderStart) / LOADER_TIME, 1);
  const eased = 1 - Math.pow(1 - t, 3);
  // пока страница не загрузилась, держимся на 90
  const value = Math.round(pageLoaded ? eased * 100 : Math.min(eased * 100, 90));
  // заливка отстаёт от счётчика, чтобы цифра «разрезалась» цветом
  loader.style.setProperty('--p', Math.pow(value / 100, 2.5) * 100 + '%');
  loaderNums.forEach((n) => { n.textContent = value; });

  if (value < 100) {
    requestAnimationFrame(tick);
    return;
  }
  setTimeout(() => {
    window.scrollTo(0, 0);
    loader.classList.add('is-done');
    document.documentElement.classList.remove('is-loading');
    loader.addEventListener('transitionend', () => loader.remove(), { once: true });
  }, 250);
};
requestAnimationFrame(tick);

// Подложка шапки после начала скролла
const header = document.querySelector('.header');
const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 40);
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// Тестовое переключение цветовых тем (выбор запоминается в браузере)
const themeButtons = document.querySelectorAll('.themes [data-theme]');
const setTheme = (name) => {
  document.documentElement.dataset.theme = name;
  themeButtons.forEach((b) => b.classList.toggle('is-active', b.dataset.theme === name));
  try { localStorage.setItem('theme', name); } catch (e) {}
};
themeButtons.forEach((btn) => btn.addEventListener('click', () => setTheme(btn.dataset.theme)));
let savedTheme = 'violet';
try { savedTheme = localStorage.getItem('theme') || 'violet'; } catch (e) {}
setTheme(savedTheme);

// Фильтр работ
const filterButtons = document.querySelectorAll('[data-filter]');
const cases = document.querySelectorAll('.case');

filterButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    filterButtons.forEach((b) => b.classList.remove('is-active'));
    btn.classList.add('is-active');
    const filter = btn.dataset.filter;
    cases.forEach((c) => {
      c.classList.toggle('is-hidden', filter !== 'all' && c.dataset.cat !== filter);
    });
    casesTrack.scrollTo({ left: 0 });
    buildDots();
  });
});

// Карусель работ на мобильном: точки-индикаторы
const casesTrack = document.querySelector('.cases');
const dotsBox = document.querySelector('.cases-dots');
const visibleCases = () => [...cases].filter((c) => !c.classList.contains('is-hidden'));

const updateDots = () => {
  const items = visibleCases();
  const center = casesTrack.scrollLeft + casesTrack.clientWidth / 2;
  let active = 0;
  items.forEach((c, i) => {
    if (Math.abs(c.offsetLeft + c.offsetWidth / 2 - center) <
        Math.abs(items[active].offsetLeft + items[active].offsetWidth / 2 - center)) active = i;
  });
  [...dotsBox.children].forEach((d, i) => d.classList.toggle('is-active', i === active));
};
const buildDots = () => {
  dotsBox.innerHTML = visibleCases().map(() => '<i></i>').join('');
  updateDots();
};
casesTrack.addEventListener('scroll', updateDots, { passive: true });
buildDots();

// Мобильное меню
const burger = document.querySelector('.burger');
const toggleMenu = (open) => {
  document.documentElement.classList.toggle('menu-open', open);
  burger.setAttribute('aria-expanded', open);
  burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
};
burger.addEventListener('click', () => toggleMenu(!document.documentElement.classList.contains('menu-open')));
document.querySelectorAll('.mmenu a').forEach((a) => a.addEventListener('click', () => toggleMenu(false)));

// Плавное появление блоков при скролле (карточки карусели на мобильном не прячем)
const isMobile = window.matchMedia('(max-width: 720px)').matches;
const revealItems = document.querySelectorAll('.section-head, .card, .ph:not(.ph--case), .photo, ' + (isMobile ? '' : '.case, ') + '.logo-card, .step, .review, .contact');
revealItems.forEach((el) => el.classList.add('reveal'));

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

revealItems.forEach((el) => observer.observe(el));
