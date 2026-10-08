import { Game } from './game/Game';

window.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
  const overlay = document.getElementById('overlay-screen') as HTMLElement;
  const playBtn = document.getElementById('btn-play') as HTMLButtonElement;

  if (!canvas) {
    console.error('Canvas element not found!');
    return;
  }

  const game = new Game(canvas);

  playBtn?.addEventListener('click', () => {
    overlay.style.display = 'none';
    game.start();
  });
});
