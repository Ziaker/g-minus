export class InputManager {
  public forward = false;
  public backward = false;
  public left = false;
  public right = false;
  public boost = false;
  public sideAttackLeft = false;
  public sideAttackRight = false;
  public spinAttack = false;

  constructor() {
    window.addEventListener('keydown', this.onKeyDown.bind(this));
    window.addEventListener('keyup', this.onKeyUp.bind(this));
    window.addEventListener('blur', () => this.reset());
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) this.reset();
    });
  }

  private reset(): void {
    this.forward = this.backward = this.left = this.right = this.boost = false;
    this.sideAttackLeft = this.sideAttackRight = this.spinAttack = false;
  }

  private onKeyDown(e: KeyboardEvent): void {
    const code = e.code;

    if (code === 'KeyW' || code === 'ArrowUp') this.forward = true;
    if (code === 'KeyS' || code === 'ArrowDown') this.backward = true;

    // Pure Steering on A / D / Arrow keys (no accidental side-attack rolls)
    if (code === 'KeyA' || code === 'ArrowLeft') {
      this.left = true;
    }

    if (code === 'KeyD' || code === 'ArrowRight') {
      this.right = true;
    }

    // Direct side-attack keys (Q / E)
    if (code === 'KeyQ') {
      this.sideAttackLeft = true;
    }
    if (code === 'KeyE') {
      this.sideAttackRight = true;
    }

    // F-Zero X Spin Attack (Z or Shift)
    if (code === 'KeyZ' || code === 'ShiftLeft' || code === 'ShiftRight') {
      this.spinAttack = true;
    }

    if (code === 'Space') {
      this.boost = true;
      e.preventDefault();
    }
  }

  private onKeyUp(e: KeyboardEvent): void {
    const code = e.code;
    if (code === 'KeyW' || code === 'ArrowUp') this.forward = false;
    if (code === 'KeyS' || code === 'ArrowDown') this.backward = false;
    if (code === 'KeyA' || code === 'ArrowLeft') this.left = false;
    if (code === 'KeyD' || code === 'ArrowRight') this.right = false;
    if (code === 'KeyQ') this.sideAttackLeft = false;
    if (code === 'KeyE') this.sideAttackRight = false;
    if (code === 'Space') this.boost = false;
    if (code === 'KeyZ' || code === 'ShiftLeft' || code === 'ShiftRight') {
      this.spinAttack = false;
    }
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
