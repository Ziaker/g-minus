import * as THREE from 'three';
import { Track } from './Track';
import { Vehicle, VehicleConfig, MachineModel, StatGrade } from './Vehicle';
import { CombatSystem } from './Combat';
import { AudioManager } from './Audio';
import { InputManager } from './Input';

export interface MachineDefinition {
  id: string;
  name: string;
  pilot: string;
  model: MachineModel;
  color: number;
  accentColor: number;
  stats: {
    body: StatGrade;
    boost: StatGrade;
    grip: StatGrade;
  };
  maxSpeed: number;
  acceleration: number;
  handling: number;
  boostMultiplier: number;
}

export const MACHINE_ROSTER: Record<string, MachineDefinition> = {
  falcon: {
    id: 'falcon',
    name: 'BLUE FALCON',
    pilot: 'CAPTAIN FALCON',
    model: 'falcon',
    color: 0x0044ff,
    accentColor: 0x00f0ff,
    stats: { body: 'B', boost: 'C', grip: 'B' },
    maxSpeed: 172,
    acceleration: 84,
    handling: 78,
    boostMultiplier: 1.55,
  },
  fox: {
    id: 'fox',
    name: 'GOLDEN FOX',
    pilot: 'DR. STEWART',
    model: 'fox',
    color: 0xf5b800,
    accentColor: 0xffffff,
    stats: { body: 'D', boost: 'A', grip: 'D' },
    maxSpeed: 167,
    acceleration: 94,
    handling: 72,
    boostMultiplier: 1.70,
  },
  goose: {
    id: 'goose',
    name: 'WILD GOOSE',
    pilot: 'PICO',
    model: 'goose',
    color: 0x228b22,
    accentColor: 0x9400d3,
    stats: { body: 'A', boost: 'B', grip: 'C' },
    maxSpeed: 173,
    acceleration: 81,
    handling: 68,
    boostMultiplier: 1.58,
  },
  stingray: {
    id: 'stingray',
    name: 'FIRE STINGRAY',
    pilot: 'SAMURAI GOROH',
    model: 'stingray',
    color: 0xd90429,
    accentColor: 0xffaa00,
    stats: { body: 'A', boost: 'D', grip: 'B' },
    maxSpeed: 180,
    acceleration: 75,
    handling: 76,
    boostMultiplier: 1.48,
  },
  white_cat: {
    id: 'white_cat',
    name: 'WHITE CAT',
    pilot: 'JODY SUMMER',
    model: 'falcon',
    color: 0xe0e6ed,
    accentColor: 0x00f0ff,
    stats: { body: 'C', boost: 'C', grip: 'A' },
    maxSpeed: 170,
    acceleration: 85,
    handling: 85,
    boostMultiplier: 1.52,
  },
  red_gazelle: {
    id: 'red_gazelle',
    name: 'RED GAZELLE',
    pilot: 'MIGHTY GAZELLE',
    model: 'fox',
    color: 0xb30000,
    accentColor: 0x222222,
    stats: { body: 'E', boost: 'A', grip: 'B' },
    maxSpeed: 174,
    acceleration: 90,
    handling: 80,
    boostMultiplier: 1.66,
  },
  iron_tiger: {
    id: 'iron_tiger',
    name: 'IRON TIGER',
    pilot: 'BABA',
    model: 'goose',
    color: 0xff7700,
    accentColor: 0x222222,
    stats: { body: 'B', boost: 'D', grip: 'A' },
    maxSpeed: 169,
    acceleration: 80,
    handling: 88,
    boostMultiplier: 1.46,
  },
  deep_claw: {
    id: 'deep_claw',
    name: 'DEEP CLAW',
    pilot: 'OCTOMAN',
    model: 'stingray',
    color: 0x7b2cbf,
    accentColor: 0xff006e,
    stats: { body: 'B', boost: 'B', grip: 'C' },
    maxSpeed: 172,
    acceleration: 83,
    handling: 75,
    boostMultiplier: 1.56,
  }
};

export class Game {
  private canvas: HTMLCanvasElement;
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;

  private track: Track;
  private combat: CombatSystem;
  public audio: AudioManager;
  public input: InputManager;

  public player!: Vehicle;
  public rivals: Vehicle[] = [];
  public allVehicles: Vehicle[] = [];

  private isRunning = false;
  private lastTime = 0;
  private playerKills = 0;
  private shownBoostOkBanner = false;

  // Camera Shake
  private cameraShakeIntensity = 0;

  // DOM HUD elements
  private hudSpeed: HTMLElement | null;
  private hudPos: HTMLElement | null;
  private hudLap: HTMLElement | null;
  private hudEnergyFill: HTMLElement | null;
  private hudEnergyPct: HTMLElement | null;
  private hudKills: HTMLElement | null;
  private hudBoostStatus: HTMLElement | null;
  private boostOkBanner: HTMLElement | null;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;

    // Setup Renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;

    // Scene & Fog
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x02040c);
    this.scene.fog = new THREE.FogExp2(0x02040c, 0.0015);

    // Camera
    this.camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.5, 3000);

    // Systems
    this.audio = new AudioManager();
    this.input = new InputManager();
    this.combat = new CombatSystem(this.scene);
    this.track = new Track(this.scene);

    // Lighting
    this.setupLighting();

    // Cache HUD elements
    this.hudSpeed = document.getElementById('hud-speed');
    this.hudPos = document.getElementById('hud-pos');
    this.hudLap = document.getElementById('hud-lap');
    this.hudEnergyFill = document.getElementById('hud-energy-fill');
    this.hudEnergyPct = document.getElementById('hud-energy-pct');
    this.hudKills = document.getElementById('hud-kills');
    this.hudBoostStatus = document.getElementById('hud-boost-status');
    this.boostOkBanner = document.getElementById('boost-ok-banner');

    window.addEventListener('resize', this.onWindowResize.bind(this));
  }

  private setupLighting(): void {
    const ambient = new THREE.AmbientLight(0x334466, 1.4);
    this.scene.add(ambient);

    const dirLight = new THREE.DirectionalLight(0xaaccff, 2.2);
    dirLight.position.set(200, 400, 200);
    this.scene.add(dirLight);

    const cyanPoint = new THREE.PointLight(0x00f0ff, 3.5, 1000);
    cyanPoint.position.set(0, 150, 0);
    this.scene.add(cyanPoint);
  }

  public initRoster(selectedId: string = 'falcon', engineBalance: number = 0): void {
    const playerDef = MACHINE_ROSTER[selectedId] || MACHINE_ROSTER['falcon'];

    const playerConfig: VehicleConfig = {
      ...playerDef,
      id: 'player',
      isAI: false,
      engineBalance
    };

    this.player = new Vehicle(playerConfig, this.track, this.combat, this.audio, this.scene);
    this.player.progressT = 0.002;
    this.player.lateralOffset = 0;
    this.player.speed = 45;

    // Spawn 7 Rivals staggered on starting grid
    const rivalKeys = Object.keys(MACHINE_ROSTER).filter(k => k !== selectedId).slice(0, 7);
    this.rivals = [];

    const gridOffsets = [-6, 6, -3, 3, -7, 7, 0];
    const gridProgress = [0.012, 0.020, 0.028, 0.036, 0.044, 0.052, 0.060];

    for (let i = 0; i < rivalKeys.length; i++) {
      const def = MACHINE_ROSTER[rivalKeys[i]];
      const rivalConfig: VehicleConfig = {
        ...def,
        id: `rival-${i + 1}`,
        isAI: true,
        engineBalance: (Math.random() - 0.5) * 0.5
      };

      const v = new Vehicle(rivalConfig, this.track, this.combat, this.audio, this.scene);
      v.progressT = gridProgress[i];
      v.lateralOffset = gridOffsets[i];
      v.speed = 90 + Math.random() * 20;
      this.rivals.push(v);
    }

    this.allVehicles = [this.player, ...this.rivals];
  }

  public start(selectedId: string = 'falcon', engineBalance: number = 0): void {
    this.initRoster(selectedId, engineBalance);
    this.audio.init();
    this.isRunning = true;
    this.lastTime = performance.now();
    requestAnimationFrame(this.loop.bind(this));
  }

  private loop(currentTime: number): void {
    if (!this.isRunning) return;

    const dt = Math.min((currentTime - this.lastTime) / 1000, 0.05);
    this.lastTime = currentTime;

    this.update(dt);
    this.render();

    requestAnimationFrame(this.loop.bind(this));
  }

  private update(dt: number): void {
    // 1. Update Player
    const playerSideAttack = this.input.consumeSideAttack();
    const playerSpinAttack = this.input.consumeSpinAttack();

    this.player.update(dt, {
      forward: this.input.forward,
      backward: this.input.backward,
      left: this.input.left,
      right: this.input.right,
      boost: this.input.boost,
      sideAttack: playerSideAttack,
      spinAttack: playerSpinAttack
    });

    // 2. Update Rivals
    for (const rival of this.rivals) {
      rival.update(dt, {
        forward: true,
        backward: false,
        left: false,
        right: false,
        boost: false,
        sideAttack: 0
      });
    }

    // 3. Update Particle FX (Sparks, Collisions)
    this.combat.update(dt);

    // 4. Vehicle vs Vehicle Ramming Collisions & Spin Attacks
    this.checkVehicleCollisions();

    // 5. Update Camera
    this.updateCamera(dt);

    // 6. Update HUD
    this.updateHUD();
  }

  private checkVehicleCollisions(): void {
    const radius = 2.5;

    for (let i = 0; i < this.allVehicles.length; i++) {
      const vA = this.allVehicles[i];
      if (vA.isDestroyed) continue;

      for (let j = i + 1; j < this.allVehicles.length; j++) {
        const vB = this.allVehicles[j];
        if (vB.isDestroyed) continue;

        const dist = vA.group.position.distanceTo(vB.group.position);
        const midPoint = vA.group.position.clone().add(vB.group.position).multiplyScalar(0.5);

        // F-Zero X SPIN ATTACK AOE Check (Within Whirl radius)
        if (vA.isSpinAttacking || vB.isSpinAttacking) {
          if (dist < 6.8) {
            if (vA.isSpinAttacking) {
              const pushDir = Math.sign(vB.lateralOffset - vA.lateralOffset) || 1;
              vB.lateralVelocity += pushDir * 150;
              vB.takeDamage(45, true);
              if (vA.config.id === 'player' && vB.isDestroyed) {
                this.playerKills++;
              }
            }
            if (vB.isSpinAttacking) {
              const pushDir = Math.sign(vA.lateralOffset - vB.lateralOffset) || -1;
              vA.lateralVelocity += pushDir * 150;
              vA.takeDamage(45, true);
            }

            this.combat.spawnSparks(midPoint, 36, 0x00f0ff);
            this.audio.playImpact();
            if (vA === this.player || vB === this.player) {
              this.addCameraShake(0.7);
            }
            continue;
          }
        }

        // Physical vehicle-to-vehicle contact
        if (dist < radius * 2) {
          const sideAttackA = vA.isSideAttacking;
          const sideAttackB = vB.isSideAttacking;

          if (sideAttackA || sideAttackB) {
            // High-impact Side-Attack bash
            if (sideAttackA) {
              vB.lateralVelocity += vA.sideAttackDir * 135;
              vB.takeDamage(36, true);
              if (vA.config.id === 'player' && vB.isDestroyed) this.playerKills++;
            }
            if (sideAttackB) {
              vA.lateralVelocity += vB.sideAttackDir * 135;
              vA.takeDamage(36, true);
            }
            this.combat.spawnSparks(midPoint, 28, 0xff0055);
            this.audio.playImpact();
            if (vA === this.player || vB === this.player) {
              this.addCameraShake(0.6);
            }
          } else {
            // Glancing bump with body weight transfer
            const lateralDiff = vA.lateralOffset - vB.lateralOffset;
            const impulse = Math.sign(lateralDiff) * 36;
            vA.lateralVelocity += impulse / vA.bodyArmorFactor;
            vB.lateralVelocity -= impulse / vB.bodyArmorFactor;

            vA.takeDamage(5, true);
            vB.takeDamage(5, true);

            this.combat.spawnSparks(midPoint, 10, 0xffaa00);
            if (vA === this.player || vB === this.player) {
              this.audio.playImpact();
              this.addCameraShake(0.2);
            }
          }
        }
      }
    }
  }

  private addCameraShake(intensity: number): void {
    this.cameraShakeIntensity = Math.min(this.cameraShakeIntensity + intensity, 1.2);
  }

  private updateCamera(dt: number): void {
    const playerInfo = this.track.getTrackInfoAt(this.player.progressT);
    const playerPos = this.player.group.position;

    const speedRatio = Math.min(this.player.speed / this.player.effectiveMaxSpeed, 1.6);
    const targetFov = 65 + (speedRatio - 0.5) * 26 + (this.player.isBoosting ? 14 : 0);
    this.camera.fov = THREE.MathUtils.lerp(this.camera.fov, targetFov, Math.min(dt * 5, 1));
    this.camera.updateProjectionMatrix();

    const chaseDist = 13.5;
    const chaseHeight = 4.8;

    const backward = playerInfo.tangent.clone().negate();
    const up = playerInfo.normal.clone();

    const idealCamPos = playerPos.clone()
      .add(backward.multiplyScalar(chaseDist))
      .add(up.multiplyScalar(chaseHeight));

    if (this.cameraShakeIntensity > 0) {
      idealCamPos.x += (Math.random() - 0.5) * this.cameraShakeIntensity * 1.5;
      idealCamPos.y += (Math.random() - 0.5) * this.cameraShakeIntensity * 1.5;
      idealCamPos.z += (Math.random() - 0.5) * this.cameraShakeIntensity * 1.5;
      this.cameraShakeIntensity = Math.max(this.cameraShakeIntensity - dt * 2.2, 0);
    }

    this.camera.position.lerp(idealCamPos, Math.min(dt * 14, 1));

    const lookTarget = playerPos.clone().add(playerInfo.tangent.clone().multiplyScalar(15));
    this.camera.up.copy(playerInfo.normal);
    this.camera.lookAt(lookTarget);
  }

  private updateHUD(): void {
    // Speed (KM/H)
    if (this.hudSpeed) {
      this.hudSpeed.textContent = this.player.getSpeedKmH().toString();
    }

    // Energy Shield percentage
    const energyPct = Math.round((this.player.shield / this.player.maxShield) * 100);
    if (this.hudEnergyPct) {
      this.hudEnergyPct.textContent = `${energyPct}%`;
    }
    if (this.hudEnergyFill) {
      this.hudEnergyFill.style.width = `${energyPct}%`;
      if (energyPct < 25) {
        this.hudEnergyFill.style.background = '#ff0055';
      } else if (energyPct < 55) {
        this.hudEnergyFill.style.background = 'linear-gradient(90deg, #ff0055, #ffcc00)';
      } else {
        this.hudEnergyFill.style.background = 'linear-gradient(90deg, #ff0055, #ffcc00, #00f0ff)';
      }
    }

    // Lap
    if (this.hudLap) {
      this.hudLap.textContent = `LAP: ${Math.min(this.player.currentLap, 3)} / 3`;
    }

    // Boost Status (Lap 1 = Locked, Lap 2+ = OK)
    if (this.hudBoostStatus) {
      if (this.player.canBoost()) {
        this.hudBoostStatus.textContent = 'BOOST: OK!';
        this.hudBoostStatus.style.color = '#00ff88';
        this.hudBoostStatus.style.textShadow = '0 0 12px #00ff88';
      } else {
        this.hudBoostStatus.textContent = 'BOOST: LOCKED (LAP 1)';
        this.hudBoostStatus.style.color = '#ffaa00';
        this.hudBoostStatus.style.textShadow = '0 0 8px #ffaa00';
      }
    }

    // "BOOST OK" Banner on Lap 2
    if (this.player.currentLap >= 2 && !this.shownBoostOkBanner) {
      this.shownBoostOkBanner = true;
      if (this.boostOkBanner) {
        this.boostOkBanner.style.display = 'block';
        this.boostOkBanner.style.opacity = '1';
        setTimeout(() => {
          if (this.boostOkBanner) {
            this.boostOkBanner.style.opacity = '0';
            setTimeout(() => {
              if (this.boostOkBanner) this.boostOkBanner.style.display = 'none';
            }, 500);
          }
        }, 1800);
      }
    }

    // Race Rank / Position
    if (this.hudPos) {
      const sorted = [...this.allVehicles].sort((a, b) => {
        const scoreA = a.currentLap + a.progressT;
        const scoreB = b.currentLap + b.progressT;
        return scoreB - scoreA;
      });

      const playerRank = sorted.findIndex(v => v.config.id === 'player') + 1;
      this.hudPos.textContent = `POS: ${playerRank} / ${this.allVehicles.length}`;
    }

    // K.O.s (F-Zero Style)
    if (this.hudKills) {
      this.hudKills.textContent = `${this.playerKills} K.O.`;
    }
  }

  private render(): void {
    this.renderer.render(this.scene, this.camera);
  }

  private onWindowResize(): void {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}
