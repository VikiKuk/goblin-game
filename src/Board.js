export default class Board {
  constructor({ mount, rows = 4, cols = 4, imgSrc }) {
    this.mount = mount;
    this.rows = rows;
    this.cols = cols;
    this.imgSrc = imgSrc;

    this.boardEl = null;
    this.cells = [];
    this.goblinEl = null;
  }
// создание доски и гоблина
  setup() {
    const board = document.createElement('div');
    board.className = 'board';
    this.mount.appendChild(board);
    this.boardEl = board;

    const frag = document.createDocumentFragment();
    for (let i = 0; i < this.rows * this.cols; i += 1) {
      const c = document.createElement('div');
      c.className = 'cell';
      frag.appendChild(c);
      this.cells.push(c);
    }
    board.appendChild(frag);

    // гоблин
    const img = document.createElement('img');
    img.className = 'goblin';
    img.src = this.imgSrc;
    img.setAttribute('hidden', '');       // гоблин изначально скрыт
    this.goblinEl = img;
  }

  // показ гоблина в указанной ячейке (изменение родителя и минус hidden)
  showAt(index) {
    const img = this.goblinEl;
    img.removeAttribute('hidden');
    this.cells[index].appendChild(img);
  }

  // спрятать гоблина после клика пользователя на него
  hide() {
    if (this.goblinEl) {
      this.goblinEl.setAttribute('hidden', '');
    }
  }

  cellCount() {
    return this.cells.length; //для Game возвращает кол-во ячеек
  }
}