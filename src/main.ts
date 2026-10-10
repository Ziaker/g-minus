import { Game } from './game/Game';

window.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
  const overlay = document.getElementById('overlay-screen') as HTMLElement;
  const playBtn = document.getElementById('btn-play') as HTMLButtonElement;
  const cards = document.querySelectorAll<HTMLElement>('.machine-card');
  const slider = document.getElementById('engine-slider') as HTMLInputElement;
  const balanceLabel = document.getElementById('balance-val-label') as HTMLElement;

  if (!canvas) {
    console.error('Canvas element not found!');
    return;
  }

  let selectedMachine = 'falcon';
  let selectedProfile: 'A' | 'B' | 'C' = 'C';

  const profileCards = document.querySelectorAll<HTMLElement>('.profile-card');
  const profileDescLabel = document.getElementById('profile-desc-label');

  cards.forEach(card => {
    card.addEventListener('click', () => {
      cards.forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      selectedMachine = card.dataset.id || 'falcon';
    });
  });

  profileCards.forEach(card => {
    card.addEventListener('click', () => {
      profileCards.forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      selectedProfile = (card.dataset.profile as 'A' | 'B' | 'C') || 'A';
      if (profileDescLabel) {
        if (selectedProfile === 'A') {
          profileDescLabel.textContent = 'A — DIRETO / PRECISO';
          profileDescLabel.style.color = '#00ff88';
        } else if (selectedProfile === 'B') {
          profileDescLabel.textContent = 'B — PROGRESSIVO';
          profileDescLabel.style.color = '#00f0ff';
        } else {
          profileDescLabel.textContent = 'C — INERCIAL / DRIFT';
          profileDescLabel.style.color = '#ffaa00';
        }
      }
    });
  });

  slider?.addEventListener('input', () => {
    const val = parseInt(slider.value, 10);
    if (val < -25) {
      balanceLabel.textContent = `ACELERAÇÃO (+${Math.round(Math.abs(val) * 0.28)}%)`;
      balanceLabel.style.color = '#38f9d7';
    } else if (val > 25) {
      balanceLabel.textContent = `VELOCIDADE FINAL (+${Math.round(val * 0.18)}%)`;
      balanceLabel.style.color = '#ff0055';
    } else {
      balanceLabel.textContent = 'BALANCED (50/50)';
      balanceLabel.style.color = '#ffde59';
    }
  });

  const game = new Game(canvas);

  playBtn?.addEventListener('click', () => {
    overlay.style.display = 'none';
    const rawBalance = slider ? parseInt(slider.value, 10) / 100 : 0;
    game.start(selectedMachine, rawBalance, selectedProfile);
  });
});
