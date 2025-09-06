// src/Game.js
import Board from './Board.js';

export default class Game {
  constructor({
    rows = 4,
    cols = 4,
    imgSrc,
    imgAlt = 'Гоблин',
    interval = 1000,                 // период появления гоблина (мс)
    rng = Math.random,               // для будущих тестов
    winHits = 10,                    // параметр победы для ограничение бесконечной игры
    maxMisses = 5,                   // игра заканчивается после N промахов
    mount = document.getElementById('game-root') || document.body,
  } = {}) {
    this.intervalMs = interval;
    this.rng = rng;

    this.board = new Board({ mount, rows, cols, imgSrc, imgAlt });

    // состояние
    this.currentIndex = -1;
    this.roundActive = false;        // активен ли текущий "шанс" попасть
    this.isOver = false;             // конец игры
    this.timerId = null;             // таймер скрытия гоблина

    // счёт
    this.hits = 0;
    this.misses = 0;
    this.winHits = winHits;
    this.maxMisses = maxMisses;

    // HUD
    this.hitsEl = document.getElementById('hits');
    this.missesEl = document.getElementById('misses');

    // модалка
    this.modal = document.getElementById('modal');
    this.modalTitle = document.getElementById('modal-title');
    this.modalText = document.getElementById('modal-text');
    this.modalBtn = document.getElementById('modal-btn');

    // бинды
    this.onBoardClick = this.onBoardClick.bind(this);
    this.onModalBtn = this.onModalBtn.bind(this);
  }

  // подготовка DOM
  init() {
    this.board.setup();
    this.board.boardEl.addEventListener('click', this.onBoardClick); // обработчик для доски
    this.modalBtn?.addEventListener('click', this.onModalBtn); // модалки
    this.updateHud();
  }

  // только очистка таймера (не трогает флаги раунда)
  cancelTimer() {
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
  }

  // полная остановка игры (таймер + закрыть раунд)
  stop() {
    this.cancelTimer();
    this.roundActive = false;
  }

  // запуск игрового цикла
  start() {
    if (!this.board.boardEl) this.init();
    if (this.timerId) return;

    this.isOver = false;
    this.scheduleNextSpawn(0); // первое появление гоблина
  }


  scheduleNextSpawn(delayMs = this.intervalMs) {
    this.cancelTimer(); // не копим таймеры

    this.timerId = setTimeout(() => {
      if (this.isOver) return;   // игра уже закончена — выходим
      this.spawn();              // показываем гоблина
      this.scheduleNextSpawn();  // планируем следующий тик с обычным интервалом
    }, delayMs);
  }

  // показать гоблина (если прошлый раунд не закрыт - это промах)
  spawn() {
    if (this.isOver) return;

    if (this.roundActive) {
      this.misses += 1;               // игрок не успел кликнуть
      this.updateHud();
      if (this.checkLose()) return;
    }

    const idx = this.nextIndex();
    this.board.showAt(idx);
    this.currentIndex = idx;
    this.roundActive = true;
  }

  // выбор следующего индекса
  nextIndex() {
    const max = this.board.cellCount();
    if (max <= 1) return 0;

    if (this.currentIndex < 0) {
      return Math.floor(this.rng() * max);
    }
    const shift = Math.floor(this.rng() * (max - 1)) + 1;
    return (this.currentIndex + shift) % max;
  }

  // обработка всех кликов по полю
  onBoardClick(e) {
    if (this.isOver) return;

    const cell = this.board.cellFromEvent(e);
    if (!cell) return;

    const img = this.board.goblinEl;
    const isHit = img && img.parentElement === cell;

    if (isHit && this.roundActive) {
      // 1) попадание
      this.hits += 1;
      this.roundActive = false;

      // 2) убрать гоблина и обновить HUD
      this.board.removeGoblin();
      this.updateHud();

      // 3) победа
      if (this.checkWin()) return;

      // 4) перезапуск тайминга от «сейчас»: новый ритм + моментальный показ
      this.scheduleNextSpawn(0);

    } else {
        // клик по пустой ячейке — промах
        this.misses += 1;
        this.updateHud();
        this.checkLose();
      }
  }

  // обновление табло
  updateHud() {
    if (this.hitsEl)   this.hitsEl.textContent = String(this.hits);
    if (this.missesEl) this.missesEl.textContent = String(this.misses);
  }

  // условия окончания
  checkWin() {
    if (this.hits >= this.winHits) {
      this.endGame(true);
      return true;
    }
    return false;
  }

  checkLose() {
    if (this.misses >= this.maxMisses) {
      this.endGame(false);
      return true;
    }
    return false;
  }

  endGame(isWin) {
    this.isOver = true;
    this.stop();                      // погасить таймер и закрыть раунд
    this.board.removeGoblin();

    const title = isWin ? 'Ты спас человечество! 🎉' : 'Гоблины вырвались на свободу и наступила эра порабощения 😢';
    const text  = `Итог: попаданий - ${this.hits}, промахов - ${this.misses}.`;
    this.openModal(title, text);
  }

  openModal(title, text) {
    if (!this.modal) return;
    this.modalTitle.textContent = title;
    this.modalText.textContent = text;
    this.modal.classList.remove('hidden');
  }
  // обработчик кнопки в модалке
  onModalBtn() {
    this.modal.classList.add('hidden');
    this.hits = 0;
    this.misses = 0;
    this.currentIndex = -1;
    this.roundActive = false;
    this.isOver = false;
    this.updateHud();
    this.scheduleNextSpawn(0);
  }

  // очистка при HMR/уничтожении
  destroy() {
    this.stop();
    if (this.board?.boardEl) {
      this.board.boardEl.removeEventListener('click', this.onBoardClick);
    }
    if (this.modalBtn) {
      this.modalBtn.removeEventListener('click', this.onModalBtn);
    }
    this.board?.removeGoblin?.();
  }
}