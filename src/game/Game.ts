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
    model: 'white_cat',
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
    model: 'red_gazelle',
    color: 0xb30000,
    accentColor: 0xff4444,
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
    model: 'iron_tiger',
    color: 0xff7700,
    accentColor: 0xffaa00,
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
    model: 'deep_claw',
    color: 0x7b2cbf,
    accentColor: 0xff006e,
    stats: { body: 'B', boost: 'B', grip: 'C' },
    maxSpeed: 172,
    acceleration: 83,
    handling: 75,
    boostMultiplier: 1.56,
  },
  black_bull: {
    id: 'black_bull',
    name: 'BLACK BULL',
    pilot: 'BLACK SHADOW',
    model: 'black_bull',
    color: 0x161822,
    accentColor: 0xcc0033,
    stats: { body: 'A', boost: 'A', grip: 'E' },
    maxSpeed: 178,
    acceleration: 88,
    handling: 66,
    boostMultiplier: 1.68,
  },
  blood_hawk: {
    id: 'blood_hawk',
    name: 'BLOOD HAWK',
    pilot: 'BLOOD FALCON',
    model: 'blood_hawk',
    color: 0x880011,
    accentColor: 0xff0044,
    stats: { body: 'B', boost: 'A', grip: 'E' },
    maxSpeed: 175,
    acceleration: 91,
    handling: 74,
    boostMultiplier: 1.64,
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
  private isRaceFinished = false;
  private raceStartTime = 0;
  private raceElapsed = 0;
  private accumulator = 0;
  private finishTimes = new Map<string, number>();
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
  private resultsScreen: HTMLElement | null;
  private resultsPos: HTMLElement | null;
  private resultsDetails: HTMLElement | null;
  private countdownOverlay: HTMLElement | null;
  private wrongWayBanner: HTMLElement | null;
  private isCountingDown = false;
  private countdownTimer = 0;
  private lastCountBeep = -1;
  private attackCooldowns: Map<string, number> = new Map();

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
    this.resultsScreen = document.getElementById('results-screen');
    this.resultsPos = document.getElementById('results-pos');
    this.resultsDetails = document.getElementById('results-details');
    this.countdownOverlay = document.getElementById('countdown-overlay');
    this.wrongWayBanner = document.getElementById('wrong-way-banner');

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
    this.player.speed = 0;

    // Spawn 7 Rivals staggered on starting grid
    const rivalKeys = Object.keys(MACHINE_ROSTER).filter(k => k !== playerDef.id).slice(0, 7);
    this.rivals = [];

    const gridOffsets = [-6, 6, -3, 3, -7, 7, 0];
    const gridProgress = [0.010, 0.016, 0.022, 0.028, 0.034, 0.040, 0.046];

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
      v.speed = 0;
      this.rivals.push(v);
    }

    this.allVehicles = [this.player, ...this.rivals];
    for (const vehicle of this.allVehicles) vehicle.updateTransform(0, 0);
  }

  public start(selectedId: string = 'falcon', engineBalance: number = 0): void {
    if (this.isRunning) return;
    this.initRoster(selectedId, engineBalance);
    this.audio.init();
    this.isRunning = true;
    this.isRaceFinished = false;
    this.isCountingDown = true;
    this.countdownTimer = 3.6;
    this.lastCountBeep = -1;
    this.lastTime = performance.now();
    this.raceElapsed = this.accumulator = 0;
    this.finishTimes.clear();
    this.input.reset();
    this.updateCamera(1);

    if (this.countdownOverlay) {
      this.countdownOverlay.textContent = '3';
      this.countdownOverlay.style.display = 'block';
    }

    requestAnimationFrame(this.loop.bind(this));
  }

  private loop(currentTime: number): void {
    if (!this.isRunning) return;

    const dt = Math.max(0, Math.min((currentTime - this.lastTime) / 1000, 0.25));
    this.lastTime = currentTime;

    if (!document.hidden && !this.isRaceFinished) this.accumulator += dt;
    else { this.accumulator = 0; this.audio.silenceEngine(); }
    const step = 1 / 120;
    while (this.accumulator + 1e-10 >= step && !this.isRaceFinished) {
      this.update(step);
      this.accumulator -= step;
    }
    this.render();

    requestAnimationFrame(this.loop.bind(this));
  }

  private update(dt: number): void {
    if (this.isRaceFinished) return;
    // 0. Starting Countdown Sequence [GDD 13]
    if (this.isCountingDown) {
      this.countdownTimer -= dt;

      if (this.countdownTimer > 2.5) {
        if (this.lastCountBeep !== 3) {
          this.lastCountBeep = 3;
          if (this.countdownOverlay) this.countdownOverlay.textContent = '3';
          this.audio.playCountdownBeep(false);
        }
      } else if (this.countdownTimer > 1.5) {
        if (this.lastCountBeep !== 2) {
          this.lastCountBeep = 2;
          if (this.countdownOverlay) this.countdownOverlay.textContent = '2';
          this.audio.playCountdownBeep(false);
        }
      } else if (this.countdownTimer > 0.5) {
        if (this.lastCountBeep !== 1) {
          this.lastCountBeep = 1;
          if (this.countdownOverlay) this.countdownOverlay.textContent = '1';
          this.audio.playCountdownBeep(false);
        }
      } else if (this.countdownTimer > 0) {
        if (this.lastCountBeep !== 0) {
          this.lastCountBeep = 0;
          if (this.countdownOverlay) {
            this.countdownOverlay.textContent = 'GO!';
            this.countdownOverlay.style.color = '#00ff88';
          }
          this.audio.playCountdownBeep(true);
          this.isCountingDown = false;
          this.input.consumeSideAttack();
          this.input.consumeSpinAttack();
          setTimeout(() => {
            if (this.countdownOverlay) this.countdownOverlay.style.display = 'none';
          }, 500);
        }
      } else {
        this.isCountingDown = false;
        if (this.countdownOverlay) this.countdownOverlay.style.display = 'none';
        this.raceStartTime = performance.now();
      }

      this.updateCamera(dt);
      this.updateHUD();
      return;
    }

    const previousScores = new Map(this.allVehicles.map(v => [v.config.id, v.currentLap + v.progressT]));
    // 1. Update Player
    const playerSideAttack = this.input.consumeSideAttack();
    const playerSpinAttack = this.input.consumeSpinAttack();

    this.player.update(dt, {
      forward: this.input.forward,
      backward: this.input.backward,
      left: this.input.left,
      right: this.input.right,
      tiltLeft: this.input.tiltLeft,
      tiltRight: this.input.tiltRight,
      drift: this.input.drift,
      boost: this.input.boost,
      sideAttack: playerSideAttack,
      spinAttack: playerSpinAttack
    });

    // 2. Update Rivals
    for (const rival of this.rivals) {
      if (this.finishTimes.has(rival.config.id)) continue;
      rival.update(dt, {
        forward: true,
        backward: false,
        left: false,
        right: false,
        boost: false,
        sideAttack: 0
      });
    }

    // Keep the interpolated finish instant: post-line progress is not finish order.
    for (const vehicle of this.allVehicles) {
      const before = previousScores.get(vehicle.config.id)!;
      const after = vehicle.currentLap + vehicle.progressT;
      if (!this.finishTimes.has(vehicle.config.id) && before < 4 && after >= 4) {
        this.finishTimes.set(vehicle.config.id, this.raceElapsed + dt * (4 - before) / (after - before));
      }
    }
    this.raceElapsed += dt;

    // 3. Update Particle FX (Sparks, Collisions)
    this.combat.update(dt);

    // 4. Vehicle vs Vehicle Ramming Collisions & Spin Attacks
    this.checkVehicleCollisions(dt);

    // 5. Update Camera
    this.updateCamera(dt);

    // 6. Update HUD
    this.updateHUD();
  }

  private checkVehicleCollisions(dt: number): void {
    const radius = 2.5;

    // Decay attack cooldowns
    for (const [key, time] of this.attackCooldowns.entries()) {
      const remaining = time - dt;
      if (remaining <= 0) {
        this.attackCooldowns.delete(key);
      } else {
        this.attackCooldowns.set(key, remaining);
      }
    }

    for (let i = 0; i < this.allVehicles.length; i++) {
      const vA = this.allVehicles[i];
      if (vA.isDestroyed || this.finishTimes.has(vA.config.id)) continue;

      for (let j = i + 1; j < this.allVehicles.length; j++) {
        const vB = this.allVehicles[j];
        if (vA.isDestroyed) break;
        if (vB.isDestroyed || this.finishTimes.has(vB.config.id)) continue;

        const dist = vA.group.position.distanceTo(vB.group.position);
        const midPoint = vA.group.position.clone().add(vB.group.position).multiplyScalar(0.5);

        // F-Zero X SPIN ATTACK AOE Check (Within Whirl radius)
        if (vA.isSpinAttacking || vB.isSpinAttacking) {
          if (dist < 6.8) {
            if (vA.isSpinAttacking) {
              const cdKey = `spin-${vA.config.id}-${vA.attackSerial}-${vB.config.id}`;
              if (!this.attackCooldowns.has(cdKey)) {
                this.attackCooldowns.set(cdKey, 0.6);
                const pushDir = Math.sign(vB.lateralOffset - vA.lateralOffset) || 1;
                vB.lateralVelocity += pushDir * 150;
                vB.takeDamage(45, true);
                if (vA.config.id === 'player' && vB.isDestroyed) {
                  this.playerKills++;
                }
                this.combat.spawnSparks(midPoint, 36, 0x00f0ff);
                this.audio.playImpact();
                if (vA === this.player || vB === this.player) {
                  this.addCameraShake(0.7);
                }
              }
            }
            if (!vB.isDestroyed && vB.isSpinAttacking) {
              const cdKey = `spin-${vB.config.id}-${vB.attackSerial}-${vA.config.id}`;
              if (!this.attackCooldowns.has(cdKey)) {
                this.attackCooldowns.set(cdKey, 0.6);
                const pushDir = Math.sign(vA.lateralOffset - vB.lateralOffset) || -1;
                vA.lateralVelocity += pushDir * 150;
                vA.takeDamage(45, true);
                this.combat.spawnSparks(midPoint, 36, 0x00f0ff);
                this.audio.playImpact();
                if (vA === this.player || vB === this.player) {
                  this.addCameraShake(0.7);
                }
              }
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
              const cdKey = `side-${vA.config.id}-${vA.attackSerial}-${vB.config.id}`;
              if (!this.attackCooldowns.has(cdKey)) {
                this.attackCooldowns.set(cdKey, 0.6);
                vB.lateralVelocity += vA.sideAttackDir * 135;
                vB.takeDamage(36, true);
                if (vA.config.id === 'player' && vB.isDestroyed) this.playerKills++;
                this.combat.spawnSparks(midPoint, 28, 0xff0055);
                this.audio.playImpact();
                if (vA === this.player || vB === this.player) {
                  this.addCameraShake(0.6);
                }
              }
            }
            if (!vB.isDestroyed && sideAttackB) {
              const cdKey = `side-${vB.config.id}-${vB.attackSerial}-${vA.config.id}`;
              if (!this.attackCooldowns.has(cdKey)) {
                this.attackCooldowns.set(cdKey, 0.6);
                vA.lateralVelocity += vB.sideAttackDir * 135;
                vA.takeDamage(36, true);
                this.combat.spawnSparks(midPoint, 28, 0xff0055);
                this.audio.playImpact();
                if (vA === this.player || vB === this.player) {
                  this.addCameraShake(0.6);
                }
              }
            }
          } else {
            // Smooth glancing bump with elastic separation
            const lateralDiff = vA.lateralOffset - vB.lateralOffset;
            const pushDir = Math.sign(lateralDiff) || 1;
            const overlap = Math.max((radius * 2) - dist, 0.1);

            // A single impulse per contact episode; heavy Body resists displacement.
            const contactKey = `contact-${vA.config.id}-${vB.config.id}`;
            const freshContact = !this.attackCooldowns.has(contactKey);
            if (freshContact) {
              vA.lateralVelocity += pushDir * 18 * vA.bodyArmorFactor;
              vB.lateralVelocity -= pushDir * 18 * vB.bodyArmorFactor;
            }
            this.attackCooldowns.set(contactKey, 0.1);

            // Separate vehicles to prevent interpenetration sticking
            vA.lateralOffset += pushDir * overlap * 0.3;
            vB.lateralOffset -= pushDir * overlap * 0.3;

            vA.takeDamage(6 * dt, false);
            vB.takeDamage(6 * dt, false);

            if (freshContact) this.combat.spawnSparks(midPoint, 4, 0xffaa00);
            if (freshContact && (vA === this.player || vB === this.player)) {
              this.audio.playImpact();
              this.addCameraShake(0.08);
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
    const sorted = [...this.allVehicles].sort((a, b) => {
      const finishA = this.finishTimes.get(a.config.id);
      const finishB = this.finishTimes.get(b.config.id);
      if (finishA !== undefined || finishB !== undefined) return (finishA ?? Infinity) - (finishB ?? Infinity);
      const scoreA = a.currentLap + a.progressT;
      const scoreB = b.currentLap + b.progressT;
      return scoreB - scoreA;
    });

    const playerRank = sorted.findIndex(v => v.config.id === 'player') + 1;
    if (this.hudPos) {
      this.hudPos.textContent = `POS: ${playerRank} / ${this.allVehicles.length}`;
    }

    // K.O.s (F-Zero Style)
    if (this.hudKills) {
      this.hudKills.textContent = `${this.playerKills} K.O.`;
    }

    // Wrong Way Check
    if (this.wrongWayBanner) {
      if (!this.isCountingDown && this.player.speed < -2) {
        this.wrongWayBanner.style.display = 'block';
      } else {
        this.wrongWayBanner.style.display = 'none';
      }
    }

    // Race Finish Check (After 3 Laps)
    if (this.player.currentLap > 3 && !this.isRaceFinished) {
      this.isRaceFinished = true;
      this.input.reset();
      this.audio.silenceEngine();
      this.audio.playVictoryFanfare();
      const totalSec = this.finishTimes.get(this.player.config.id) ?? this.raceElapsed;
      const mins = Math.floor(totalSec / 60).toString().padStart(2, '0');
      const secs = (totalSec % 60).toFixed(2).padStart(5, '0');
      const timeStr = `${mins}:${secs}`;

      if (this.resultsScreen && this.resultsPos && this.resultsDetails) {
        this.resultsPos.textContent = `${playerRank}º LUGAR`;
        this.resultsPos.style.color = playerRank === 1 ? '#00ff88' : (playerRank <= 3 ? '#00f0ff' : '#ff0055');
        this.resultsDetails.textContent = `Tempo Total: ${timeStr} | K.O.s: ${this.playerKills}`;
        this.resultsScreen.style.display = 'flex';
      }
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
