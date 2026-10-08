export class InputManager {
  public forward = false;
  public backward = false;
  public left = false;
  public right = false;
  public boost = false;
  public sideAttackLeft = false;
  public sideAttackRight = false;
  public spinAttack = false;

  private lastLeftPress = 0;
  private lastRightPress = 0;
  private readonly DOUBLE_TAP_MS = 280;

  constructor() {
    window.addEventListener('keydown', this.onKeyDown.bind(this));
    window.addEventListener('keyup', this.onKeyUp.bind(this));
  }

  private onKeyDown(e: KeyboardEvent): void {
    const code = e.code;
    const now = performance.now();

    if (code === 'KeyW' || code === 'ArrowUp') this.forward = true;
    if (code === 'KeyS' || code === 'ArrowDown') this.backward = true;

    if (code === 'KeyA' || code === 'ArrowLeft') {
      if (!this.left && (now - this.lastLeftPress < this.DOUBLE_TAP_MS)) {
        this.sideAttackLeft = true;
      }
      this.lastLeftPress = now;
      this.left = true;
    }

    if (code === 'KeyD' || code === 'ArrowRight') {
      if (!this.right && (now - this.lastRightPress < this.DOUBLE_TAP_MS)) {
        this.sideAttackRight = true;
      }
      this.lastRightPress = now;
      this.right = true;
    }

    // Direct side-attack keys (Q / E) like classic airbrakes / side bash
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
