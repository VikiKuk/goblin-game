import './style.css';
import Game from './Game.js';
import goblinImg from './goblin.png';
import hammerImg from './hammer.png';

// остановка предыдущей игры 
if (window.__goblinGame) {
  window.__goblinGame.destroy?.();
}

const root = document.getElementById('game-root') || document.body;
const game = new Game({
  mount: root,
  rows: 4,
  cols: 4,
  imgSrc: goblinImg,
  interval: 1000,
});

window.__goblinGame = game;

game.start();

// замена стандартного курсора на молоток
const hammer = document.createElement('img');
hammer.src = hammerImg;
hammer.classList.add('hammer');
hammer.draggable = false;
document.body.append(hammer);
document.addEventListener('mousemove', (e) => {
  hammer.style.left = `${e.clientX}px`;
  hammer.style.top  = `${e.clientY}px`;
});

document.addEventListener('mousedown', () => hammer.classList.add('hit'));
document.addEventListener('mouseup',   () => hammer.classList.remove('hit'));