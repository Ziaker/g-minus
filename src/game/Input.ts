export class InputManager {
  public forward = false;    // X segurado
  public backward = false;   // SPACE (Freio)
  public left = false;       // Seta Esquerda (Apenas setas movem)
  public right = false;      // Seta Direita (Apenas setas movem)
  public tiltLeft = false;   // Z (Inclina pra esquerda)
  public tiltRight = false;  // C (Inclina pra direita)
  public drift = false;      // SPACE (Break / Drift)
  public boost = false;      // A (Boost)
  public sideAttackLeft = false;
  public sideAttackRight = false;
  public spinAttack = false;

  private pressed = new Set<string>();
  private lastZPressTime = 0;
  private lastCPressTime = 0;

  constructor() {
    window.addEventListener('keydown', this.onKeyDown.bind(this));
    window.addEventListener('keyup', this.onKeyUp.bind(this));
    window.addEventListener('blur', () => this.reset());
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) this.reset();
    });
  }

  public reset(): void {
    this.pressed.clear();
    this.forward = this.backward = this.left = this.right = this.drift = this.boost = false;
    this.tiltLeft = this.tiltRight = false;
    this.sideAttackLeft = this.sideAttackRight = this.spinAttack = false;
  }

  private onKeyDown(e: KeyboardEvent): void {
    const code = e.code;
    // Prevent browser scrolling and shortcuts on game keys
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space', 'KeyX', 'KeyZ', 'KeyC', 'KeyA'].includes(code)) {
      e.preventDefault();
    }
    if (e.repeat || this.pressed.has(code)) return;
    this.pressed.add(code);
    const now = performance.now();

    // 1. APENAS AS SETAS MOVEM A NAVE
    if (code === 'ArrowLeft') {
      this.left = true;
    }
    if (code === 'ArrowRight') {
      this.right = true;
    }

    // 2. X SEGURADO ACELERA
    if (code === 'KeyX') {
      this.forward = true;
    }

    // 3. SPACE É O BREAK / DRIFT
    if (code === 'Space') {
      this.backward = true;
      this.drift = true;
    }

    // 4. Z INCLINA PRA ESQUERDA (Double tap = Side Attack Esquerdo)
    if (code === 'KeyZ') {
      this.tiltLeft = true;
      if (now - this.lastZPressTime < 280) {
        this.sideAttackLeft = true;
      }
      this.lastZPressTime = now;
    }

    // 5. C INCLINA PRA DIREITA (Double tap = Side Attack Direito)
    if (code === 'KeyC') {
      this.tiltRight = true;
      if (now - this.lastCPressTime < 280) {
        this.sideAttackRight = true;
      }
      this.lastCPressTime = now;
    }

    // Z + C simultâneo ou Shift = Spin Attack 360°
    if ((this.pressed.has('KeyZ') && this.pressed.has('KeyC')) || code === 'ShiftLeft' || code === 'ShiftRight') {
      this.spinAttack = true;
    }

    // 6. A É O BOOST
    if (code === 'KeyA') {
      this.boost = true;
    }
  }

  private onKeyUp(e: KeyboardEvent): void {
    const code = e.code;
    this.pressed.delete(code);

    // 1. Setas
    this.left = this.pressed.has('ArrowLeft');
    this.right = this.pressed.has('ArrowRight');

    // 2. X Aceleração
    this.forward = this.pressed.has('KeyX');

    // 3. Space Freio / Drift
    this.backward = this.pressed.has('Space');
    this.drift = this.pressed.has('Space');

    // 4 & 5. Z e C Inclinação
    this.tiltLeft = this.pressed.has('KeyZ');
    this.tiltRight = this.pressed.has('KeyC');

    // 6. A Boost
    this.boost = this.pressed.has('KeyA');
  }

  public consumeSideAttack(): -1 | 0 | 1 {
    if (this.sideAttackLeft) {
      this.sideAttackLeft = false;
      return -1;
    }
    if (this.sideAttackRight) {
      this.sideAttackRight = false;
      return 1;
    }
    return 0;
  }

  public consumeSpinAttack(): boolean {
    if (this.spinAttack) {
      this.spinAttack = false;
      return true;
    }
    return false;
  }
}
