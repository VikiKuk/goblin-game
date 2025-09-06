export default class Board {
  constructor({ mount, rows = 4, cols = 4, imgSrc, imgAlt = 'Гоблин' }) {
    this.mount = mount;
    this.rows = rows;
    this.cols = cols;
    this.imgSrc = imgSrc;
    this.imgAlt = imgAlt;

    this.boardEl = null;
    this.cells = [];
    this.goblinEl = null;
  }
// создание доски и гоблина
  setup() {
    const board = document.createElement('div');
    board.className = 'board';
    this.mount.append(board);
    this.boardEl = board;

    const frag = document.createDocumentFragment();
    for (let i = 0; i < this.rows * this.cols; i += 1) {
      const c = document.createElement('div');
      c.className = 'cell';
      frag.append(c);
      this.cells.push(c);
    }
    board.append(frag);

    // гоблин
    const img = document.createElement('img');
    img.className = 'goblin';
    img.src = this.imgSrc;
    img.alt = this.imgAlt; 
    img.draggable = false;
    this.goblinEl = img;
  }

  // показ гоблина в указанной ячейке
  showAt(index) {
    this.cells[index].append(this.goblinEl);
  }

  // убираем гоблина после клика пользователя на него
  removeGoblin() {
    this.goblinEl?.remove();         
    }

  cellCount() {
    return this.cells.length; //для Game возвращает кол-во ячеек
  }

   cellFromEvent(e) {
    return e.target.closest('.cell');
  }
}