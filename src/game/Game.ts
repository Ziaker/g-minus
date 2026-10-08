import * as THREE from 'three';
import { Track } from './Track';
import { Vehicle, VehicleConfig } from './Vehicle';
import { CombatSystem } from './Combat';
import { AudioManager } from './Audio';
import { InputManager } from './Input';

export class Game {
  private canvas: HTMLCanvasElement;
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;

  private track: Track;
  private combat: CombatSystem;
  private audio: AudioManager;
  private input: InputManager;

  public player: Vehicle;
  public rivals: Vehicle[] = [];
  public allVehicles: Vehicle[] = [];

  private isRunning = false;
  private lastTime = 0;
  private playerKills = 0;

  // Camera Shake
  private cameraShakeIntensity = 0;

  // DOM HUD elements
  private hudSpeed: HTMLElement | null;
  private hudPos: HTMLElement | null;
  private hudLap: HTMLElement | null;
  private hudEnergyFill: HTMLElement | null;
  private hudEnergyPct: HTMLElement | null;
  private hudKills: HTMLElement | null;

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
    this.renderer.toneMappingExposure = 1.1;

    // Scene & Fog
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x030611);
    this.scene.fog = new THREE.FogExp2(0x030611, 0.0016);

    // Camera
    this.camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.5, 3000);

    // Systems
    this.audio = new AudioManager();
    this.input = new InputManager();
    this.combat = new CombatSystem(this.scene);
    this.track = new Track(this.scene);

    // Lighting
    this.setupLighting();

    // Spawn Player and Rival Interceptors
    this.player = this.createPlayer();
    this.rivals = this.createRivals();
    this.allVehicles = [this.player, ...this.rivals];

    // Cache HUD elements
    this.hudSpeed = document.getElementById('hud-speed');
    this.hudPos = document.getElementById('hud-pos');
    this.hudLap = document.getElementById('hud-lap');
    this.hudEnergyFill = document.getElementById('hud-energy-fill');
    this.hudEnergyPct = document.getElementById('hud-energy-pct');
    this.hudKills = document.getElementById('hud-kills');

    window.addEventListener('resize', this.onWindowResize.bind(this));
  }

  private setupLighting(): void {
    const ambient = new THREE.AmbientLight(0x334466, 1.2);
    this.scene.add(ambient);

    const dirLight = new THREE.DirectionalLight(0xaaccff, 2.0);
    dirLight.position.set(200, 400, 200);
    this.scene.add(dirLight);

    const cyanPoint = new THREE.PointLight(0x00f0ff, 3.0, 1000);
    cyanPoint.position.set(0, 150, 0);
    this.scene.add(cyanPoint);
  }

  private createPlayer(): Vehicle {
    const config: VehicleConfig = {
      id: 'player',
      name: 'BLUE FALCON-X',
      isAI: false,
      color: 0x0044ff,
      accentColor: 0x00f0ff,
      maxSpeed: 175,
      acceleration: 85,
      handling: 75,
      boostMultiplier: 1.55
    };

    const vehicle = new Vehicle(config, this.track, this.combat, this.audio, this.scene);
    vehicle.progressT = 0.002;
    vehicle.lateralOffset = 0;
    vehicle.speed = 40;
    return vehicle;
  }

  private createRivals(): Vehicle[] {
    const rivalConfigs: VehicleConfig[] = [
      {
        id: 'rival-1',
        name: 'FIRE STINGRAY-V',
        isAI: true,
        color: 0xd90036,
        accentColor: 0xffaa00,
        maxSpeed: 170,
        acceleration: 82,
        handling: 70,
        boostMultiplier: 1.5
      },
      {
        id: 'rival-2',
        name: 'GOLDEN FOX-Z',
        isAI: true,
        color: 0xffbb00,
        accentColor: 0xffffff,
        maxSpeed: 168,
        acceleration: 88,
        handling: 80,
        boostMultiplier: 1.48
      },
      {
        id: 'rival-3',
        name: 'WILD GOOSE-M',
        isAI: true,
        color: 0x6600cc,
        accentColor: 0x00ff88,
        maxSpeed: 173,
        acceleration: 80,
        handling: 68,
        boostMultiplier: 1.52
      }
    ];

    const rivals: Vehicle[] = [];
    const offsets = [-5.5, 5.5, -2.5];
    const progressOffsets = [0.015, 0.025, 0.035];

    for (let i = 0; i < rivalConfigs.length; i++) {
      const v = new Vehicle(rivalConfigs[i], this.track, this.combat, this.audio, this.scene);
      v.progressT = progressOffsets[i];
      v.lateralOffset = offsets[i];
      v.speed = 90;
      rivals.push(v);
    }

    return rivals;
  }

  public start(): void {
    this.audio.init();
    this.isRunning = true;
    this.lastTime = performance.now();
    requestAnimationFrame(this.loop.bind(this));
  }

  private loop(currentTime: number): void {
    if (!this.isRunning) return;

    const dt = Math.min((currentTime - this.lastTime) / 1000, 0.05); // Clamp dt to prevent tunneling
    this.lastTime = currentTime;

    this.update(dt);
    this.render();

    requestAnimationFrame(this.loop.bind(this));
  }

  private update(dt: number): void {
    // 1. Update Player
    const playerSideAttack = this.input.consumeSideAttack();
    this.player.update(dt, {
      forward: this.input.forward,
      backward: this.input.backward,
      left: this.input.left,
      right: this.input.right,
      boost: this.input.boost,
      sideAttack: playerSideAttack
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

    // 4. Vehicle vs Vehicle Ramming Collisions
    this.checkVehicleCollisions();

    // 5. Update Camera
    this.updateCamera(dt);

    // 6. Update HUD
    this.updateHUD();
  }

  private checkVehicleCollisions(): void {
    const radius = 2.4;

    for (let i = 0; i < this.allVehicles.length; i++) {
      const vA = this.allVehicles[i];
      if (vA.isDestroyed) continue;

      for (let j = i + 1; j < this.allVehicles.length; j++) {
        const vB = this.allVehicles[j];
        if (vB.isDestroyed) continue;

        const dist = vA.group.position.distanceTo(vB.group.position);
        if (dist < radius * 2) {
          // Collision occurred!
          const midPoint = vA.group.position.clone().add(vB.group.position).multiplyScalar(0.5);

          // Check if either is executing a Side-Attack
          const sideAttackA = vA.isSideAttacking;
          const sideAttackB = vB.isSideAttacking;

          if (sideAttackA || sideAttackB) {
            // Massive damage & violent deflection!
            if (sideAttackA) {
              vB.lateralVelocity += vA.sideAttackDir * 120;
              vB.takeDamage(35, true);
              if (vA.config.id === 'player' && vB.isDestroyed) this.playerKills++;
            }
            if (sideAttackB) {
              vA.lateralVelocity += vB.sideAttackDir * 120;
              vA.takeDamage(35, true);
            }
            this.combat.spawnSparks(midPoint, 30, 0xff0055);
            this.audio.playImpact();
            if (vA === this.player || vB === this.player) {
              this.addCameraShake(0.6);
            }
          } else {
            // Glancing bump
            const lateralDiff = vA.lateralOffset - vB.lateralOffset;
            const impulse = Math.sign(lateralDiff) * 35;
            vA.lateralVelocity += impulse;
            vB.lateralVelocity -= impulse;

            vA.takeDamage(4, true);
            vB.takeDamage(4, true);

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

    // Dynamic FOV based on speed (F-Zero Warp sensation)
    const speedRatio = Math.min(this.player.speed / this.player.config.maxSpeed, 1.6);
    const targetFov = 65 + (speedRatio - 0.5) * 25 + (this.player.isBoosting ? 12 : 0);
    this.camera.fov = THREE.MathUtils.lerp(this.camera.fov, targetFov, Math.min(dt * 5, 1));
    this.camera.updateProjectionMatrix();

    // Chase distance behind and above craft
    const chaseDist = 13.5;
    const chaseHeight = 4.8;

    const backward = playerInfo.tangent.clone().negate();
    const up = playerInfo.normal.clone();

    const idealCamPos = playerPos.clone()
      .add(backward.multiplyScalar(chaseDist))
      .add(up.multiplyScalar(chaseHeight));

    // Camera shake offset
    if (this.cameraShakeIntensity > 0) {
      idealCamPos.x += (Math.random() - 0.5) * this.cameraShakeIntensity * 1.5;
      idealCamPos.y += (Math.random() - 0.5) * this.cameraShakeIntensity * 1.5;
      idealCamPos.z += (Math.random() - 0.5) * this.cameraShakeIntensity * 1.5;
      this.cameraShakeIntensity = Math.max(this.cameraShakeIntensity - dt * 2.2, 0);
    }

    // Smooth camera lerp
    this.camera.position.lerp(idealCamPos, Math.min(dt * 14, 1));

    // Look slightly ahead of player ship
    const lookTarget = playerPos.clone().add(playerInfo.tangent.clone().multiplyScalar(15));
    this.camera.lookAt(lookTarget);
    this.camera.up.copy(playerInfo.normal);
  }

  private updateHUD(): void {
    // Speed
    if (this.hudSpeed) {
      this.hudSpeed.textContent = this.player.getSpeedKmH().toString();
    }

    // Energy / Shield bar
    if (this.hudEnergyFill && this.hudEnergyPct) {
      const pct = Math.max(0, Math.min(100, Math.round(this.player.shield)));
      this.hudEnergyPct.textContent = `${pct}%`;
      this.hudEnergyFill.style.width = `${pct}%`;

      if (pct < 25) {
        this.hudEnergyFill.style.background = '#ff0055';
      } else if (pct < 55) {
        this.hudEnergyFill.style.background = 'linear-gradient(90deg, #ff0055, #ffcc00)';
      } else {
        this.hudEnergyFill.style.background = 'linear-gradient(90deg, #ff0055, #ffcc00, #00f0ff)';
      }
    }

    // Lap
    if (this.hudLap) {
      this.hudLap.textContent = `LAP: ${Math.min(this.player.currentLap, 3)} / 3`;
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
