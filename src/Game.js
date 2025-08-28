import Board from './Board.js';

export default class Game {
  constructor({
    rows = 4,
    cols = 4,
    imgSrc,
    interval = 1000,   // период появления гоблина (мс)
    rng = Math.random, // для будущих тестов
    winScore = 10,     // параметр победы для ограничение бесконечной игры
    maxMisses = 5,     // игра заканчивается после N промахов
    mount = document.getElementById('game-root') || document.body
  } = {}) {
 
    this.rng = rng;
    this.intervalMs = interval;
    this.board = new Board({ mount, rows, cols, imgSrc });
    // состояние
    this.currentIndex = -1;
    this.timer = null;
    this.roundActive = false; // активен ли текущий "шанс" попасть
    this.roundTimer = null; //// таймер скрытия гоблина
    // счет
    this.score = 0;
    this.misses = 0;
    this.winScore = winScore;
    this.maxMisses = maxMisses;
    // обработчик кликов
    this.onCellClick = this.onCellClick.bind(this);
  }

  init() {
    this.board.setup();
    this.board.boardEl.addEventListener('click', this.onCellClick); // обработчик для доски
  }

  start() {
    if (!this.board.boardEl) this.init();
    if (this.timer) return;
    this.spawn(); // первое появление гоблина
    this.timer = setInterval(() => this.spawn(), this.intervalMs); //появление гоблина в последующие интервалы
  }

  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
     if (this.roundTimer) {
      clearTimeout(this.roundTimer);
      this.roundTimer = null;
    }
  }

  // полная остановка и очистка игры
  destroy() {
    this.stop();
    if (this.board.boardEl) {
      this.board.boardEl.removeEventListener('click', this.onCellClick);
    }
  }

  // логика раундов
  spawn() {
    if (this.roundActive) {
      this.misses += 1;
      if (this.misses >= this.maxMisses) {
        this.gameOver('lose');
        return;
      }
    }

    // показ гоблина в новой ячейке
    const idx = this.nextIndex();
    this.board.showAt(idx);    
    this.currentIndex = idx;
    this.roundActive = true;

    // скрытие гоблина через 1 секунду (независимо от исхода клика пользователя)
    if (this.roundTimer) clearTimeout(this.roundTimer);
    this.roundTimer = setTimeout(() => {
      this.board.hide();
    }, this.intervalMs);
  }

  onCellClick(e) {
    if (!this.roundActive) return;

    const img = this.board.goblinEl;
    if (!img || !img.parentElement) return;

    // засчитываем попадание при клике в ячейку с гоблином
    const cellWithGoblin = img.parentElement;
    if (cellWithGoblin.contains(e.target)) {
      this.score += 1;
      this.roundActive = false; // второй клик в этот раунд не засчитывается
      this.board.hide();        // прячем гоблина
    }

    if (this.score >= this.winScore) {
      this.gameOver('win');
    }
  }

  // выбор следующего индекса
  nextIndex() {
    const max = this.board.cellCount();
    if (max <= 1) return 0;

    // первый выбор — равномерно из всех ячеек
    if (this.currentIndex < 0) {
      return Math.floor(this.rng() * max);
    }

    // последующие сдвиги
    const shift = Math.floor(this.rng() * (max - 1)) + 1;
    return (this.currentIndex + shift) % max;
  }

   gameOver(kind) {
    this.stop();
    this.roundActive = false;
    this.board.hide();

    const msg =
      kind === 'win'
        ? `Ты спас человечество! 🎉\nСчёт: ${this.score} попаданий, промахов: ${this.misses}`
        : `OMG! Гоблины вырвались на свободу и наступила эра порабощения 😢\nСчёт: ${this.score} попаданий, промахов: ${this.misses}`;
    alert(msg);
  }
}