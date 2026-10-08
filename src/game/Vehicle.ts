import * as THREE from 'three';
import { Track } from './Track';
import { CombatSystem } from './Combat';
import { AudioManager } from './Audio';

export interface VehicleConfig {
  id: string;
  name: string;
  isAI: boolean;
  color: number;
  accentColor: number;
  maxSpeed: number;
  acceleration: number;
  handling: number;
  boostMultiplier: number;
}

export class Vehicle {
  public config: VehicleConfig;
  public group: THREE.Group;
  public track: Track;
  public combat: CombatSystem;
  public audio: AudioManager;

  // Track coordinates
  public progressT = 0; // [0, 1]
  public lateralOffset = 0; // Offset from center line
  public lateralVelocity = 0;
  public speed = 0; // World units / sec
  public currentLap = 1;
  public totalDistance = 0;

  // State & Combat
  public shield = 100;
  public maxShield = 100;
  public isDestroyed = false;
  public respawnTimer = 0;

  // Boost
  public isBoosting = false;
  public boostDurationRemaining = 0;

  // Side attack
  public isSideAttacking = false;
  public sideAttackTimer = 0;
  public sideAttackDir: -1 | 1 = 1;

  // Visuals
  private craftMesh: THREE.Group;
  private thrusterLight: THREE.PointLight;
  private thrusterPlumes: THREE.Mesh[] = [];
  public currentRoll = 0;


  // AI behavior
  private aiTargetOffset = 0;
  private aiNextDecision = 0;

  constructor(
    config: VehicleConfig,
    track: Track,
    combat: CombatSystem,
    audio: AudioManager,
    scene: THREE.Scene
  ) {
    this.config = config;
    this.track = track;
    this.combat = combat;
    this.audio = audio;

    this.group = new THREE.Group();
    this.craftMesh = this.buildCraftModel(config.color, config.accentColor);
    this.group.add(this.craftMesh);

    // Thruster glow
    this.thrusterLight = new THREE.PointLight(config.accentColor, 2.5, 18);
    this.thrusterLight.position.set(0, 0, -2.5);
    this.group.add(this.thrusterLight);

    scene.add(this.group);
  }

  private buildCraftModel(mainColor: number, accentColor: number): THREE.Group {
    const ship = new THREE.Group();

    const bodyMat = new THREE.MeshStandardMaterial({
      color: mainColor,
      roughness: 0.3,
      metalness: 0.85
    });

    const accentMat = new THREE.MeshStandardMaterial({
      color: accentColor,
      roughness: 0.2,
      metalness: 0.9
    });

    const cockpitMat = new THREE.MeshStandardMaterial({
      color: 0x05101a,
      roughness: 0.1,
      metalness: 0.95
    });

    const glowMat = new THREE.MeshBasicMaterial({
      color: accentColor
    });

    // Central fuselage / aerodynamic arrow body
    const bodyGeo = new THREE.ConeGeometry(1.4, 5.2, 5);
    bodyGeo.rotateX(Math.PI / 2);
    bodyGeo.scale(1.2, 0.45, 1);
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    ship.add(body);

    // Cockpit canopy
    const canopyGeo = new THREE.SphereGeometry(0.7, 8, 8);
    canopyGeo.scale(0.8, 0.45, 1.8);
    const canopy = new THREE.Mesh(canopyGeo, cockpitMat);
    canopy.position.set(0, 0.35, 0.3);
    ship.add(canopy);

    // Left and Right Swept Wings
    const wingGeo = new THREE.BoxGeometry(2.4, 0.12, 1.8);
    wingGeo.rotateY(0.2);

    const leftWing = new THREE.Mesh(wingGeo, accentMat);
    leftWing.position.set(-1.8, 0, -0.6);
    leftWing.rotation.z = 0.1;
    ship.add(leftWing);

    const rightWing = new THREE.Mesh(wingGeo, accentMat);
    rightWing.position.set(1.8, 0, -0.6);
    rightWing.rotation.z = -0.1;
    ship.add(rightWing);

    // Wingtip aerodynamic pods
    const podGeo = new THREE.BoxGeometry(0.2, 0.35, 1.6);
    const leftPod = new THREE.Mesh(podGeo, cockpitMat);
    leftPod.position.set(-2.8, 0.05, -0.4);
    ship.add(leftPod);

    const rightPod = new THREE.Mesh(podGeo, cockpitMat);
    rightPod.position.set(2.8, 0.05, -0.4);
    ship.add(rightPod);

    // Vertical stabilizers / Fins
    const finGeo = new THREE.BoxGeometry(0.1, 1.2, 1.4);
    const finLeft = new THREE.Mesh(finGeo, accentMat);
    finLeft.position.set(-1.1, 0.7, -1.2);
    finLeft.rotation.z = -0.25;
    ship.add(finLeft);

    const finRight = new THREE.Mesh(finGeo, accentMat);
    finRight.position.set(1.1, 0.7, -1.2);
    finRight.rotation.z = 0.25;
    ship.add(finRight);

    // Thruster exhaust cones
    const plumeGeo = new THREE.ConeGeometry(0.4, 1.6, 8);
    plumeGeo.rotateX(-Math.PI / 2);

    const leftPlume = new THREE.Mesh(plumeGeo, glowMat);
    leftPlume.position.set(-0.65, 0, -2.8);
    ship.add(leftPlume);

    const rightPlume = new THREE.Mesh(plumeGeo, glowMat);
    rightPlume.position.set(0.65, 0, -2.8);
    ship.add(rightPlume);

    this.thrusterPlumes.push(leftPlume, rightPlume);

    return ship;
  }

  public update(
    dt: number,
    input: {
      forward: boolean;
      backward: boolean;
      left: boolean;
      right: boolean;
      boost: boolean;
      sideAttack: -1 | 0 | 1;
    }
  ): void {
    if (this.isDestroyed) {
      this.respawnTimer -= dt;
      if (this.respawnTimer <= 0) {
        this.respawn();
      }
      return;
    }

    if (this.config.isAI) {
      this.updateAI(dt, input);
    }

    // Boost Handling
    if (input.boost && !this.isBoosting && this.shield > 15) {
      this.triggerBoost();
    }

    if (this.isBoosting) {
      this.boostDurationRemaining -= dt;
      // Boost consumes shield slowly over duration
      this.takeDamage(12 * dt, false);

      if (this.boostDurationRemaining <= 0 || this.shield <= 5) {
        this.isBoosting = false;
      }
    }

    // Side Attack Handling
    if (input.sideAttack !== 0 && !this.isSideAttacking) {
      this.triggerSideAttack(input.sideAttack);
    }

    if (this.isSideAttacking) {
      this.sideAttackTimer -= dt;
      this.lateralVelocity += this.sideAttackDir * 180 * dt;
      if (this.sideAttackTimer <= 0) {
        this.isSideAttacking = false;
      }
    }

    // Acceleration & Braking
    const maxSpeedCurrent = this.isBoosting
      ? this.config.maxSpeed * this.config.boostMultiplier
      : this.config.maxSpeed;

    if (input.forward) {
      const accel = this.isBoosting ? this.config.acceleration * 1.8 : this.config.acceleration;
      this.speed = Math.min(this.speed + accel * dt, maxSpeedCurrent);
    } else if (input.backward) {
      this.speed = Math.max(this.speed - this.config.acceleration * 1.5 * dt, 0);
    } else {
      // Natural drag
      this.speed = Math.max(this.speed - 25 * dt, 0);
    }

    // Lateral Steering & Drift
    let steerDir = 0;
    if (input.left) steerDir -= 1;
    if (input.right) steerDir += 1;

    const lateralForce = steerDir * this.config.handling * (0.4 + (this.speed / this.config.maxSpeed) * 0.6);
    this.lateralVelocity += lateralForce * dt;
    // Lateral friction / anti-gravity grip
    this.lateralVelocity *= Math.pow(0.04, dt);

    this.lateralOffset += this.lateralVelocity * dt;

    // Track boundary guardrail collision
    const halfWidth = this.track.trackWidth / 2 - 1.2;
    if (Math.abs(this.lateralOffset) > halfWidth) {
      this.lateralOffset = Math.sign(this.lateralOffset) * halfWidth;
      this.lateralVelocity = -this.lateralVelocity * 0.5; // Bounce back
      this.speed *= 0.85; // Speed scrub
      this.takeDamage(6, true);
      this.combat.spawnSparks(this.group.position, 12, 0x00f0ff);
      if (!this.config.isAI) {
        this.audio.playImpact();
      }
    }

    // Advance along track curve
    const trackLen = this.track.getTrackLength();
    const deltaT = (this.speed * dt) / trackLen;
    const prevT = this.progressT;
    this.progressT = (this.progressT + deltaT) % 1;
    this.totalDistance += this.speed * dt;

    // Lap counting
    if (prevT > 0.85 && this.progressT < 0.15) {
      this.currentLap++;
    }

    // Check Boost Pads
    for (const pad of this.track.boostPads) {
      const tDiff = Math.abs(this.progressT - pad.t);
      if (tDiff < 0.015 || tDiff > 0.985) {
        const offsetDiff = Math.abs(this.lateralOffset - pad.offset);
        if (offsetDiff < pad.width / 2 + 1.2) {
          this.speed = Math.min(this.speed + 80, this.config.maxSpeed * this.config.boostMultiplier);
          this.combat.spawnSparks(this.group.position, 15, 0xffaa00);
          if (!this.config.isAI) {
            this.audio.playBoost();
          }
        }
      }
    }

    // Check Pit Lane / Recharge Strips
    for (const pit of this.track.pitZones) {
      if (this.progressT >= pit.tStart && this.progressT <= pit.tEnd) {
        if (this.lateralOffset >= pit.offsetMin && this.lateralOffset <= pit.offsetMax) {
          // Recharge shield
          if (this.shield < this.maxShield) {
            this.shield = Math.min(this.shield + 45 * dt, this.maxShield);
            this.combat.spawnSparks(this.group.position, 2, 0x00ff88);
            if (!this.config.isAI && Math.random() < 0.2) {
              this.audio.playRecharge();
            }
          }
        }
      }
    }


    // Update 3D orientation & position
    this.updateTransform(dt, steerDir);

    // Audio Engine pitch for player
    if (!this.config.isAI) {
      const speedKmH = this.getSpeedKmH();
      this.audio.updateEnginePitch(speedKmH, this.isBoosting);
    }
  }

  private updateTransform(dt: number, steerDir: number): void {
    const info = this.track.getTrackInfoAt(this.progressT);

    // Levitation height
    const hoverHeight = 1.35;
    const pos = info.position.clone()
      .add(info.binormal.clone().multiplyScalar(this.lateralOffset))
      .add(info.normal.clone().multiplyScalar(hoverHeight));

    this.group.position.copy(pos);

    // Roll banking based on turning or side attack
    let targetRoll = -steerDir * 0.45;
    if (this.isSideAttacking) {
      targetRoll = this.sideAttackDir * Math.PI * 1.5; // Barrel roll whip
    }
    this.currentRoll = THREE.MathUtils.lerp(this.currentRoll, targetRoll, Math.min(dt * 12, 1));

    // Align ship with track surface Frenet frame
    const rotMatrix = new THREE.Matrix4().makeBasis(info.binormal, info.normal, info.tangent);
    this.group.quaternion.setFromRotationMatrix(rotMatrix);

    // Apply banking roll to mesh
    this.craftMesh.rotation.z = this.currentRoll;

    // Thruster scale FX
    const plumeScale = (this.speed / this.config.maxSpeed) * (this.isBoosting ? 2.5 : 1.2);
    for (const plume of this.thrusterPlumes) {
      plume.scale.set(1, 1, Math.max(plumeScale, 0.4));
    }
    this.thrusterLight.intensity = this.isBoosting ? 5.0 : 2.0;
  }

  private triggerBoost(): void {
    this.isBoosting = true;
    this.boostDurationRemaining = 2.4;
    this.speed = Math.max(this.speed, this.config.maxSpeed * 1.15);
    this.takeDamage(10, false); // initial burst cost
    this.combat.spawnSparks(this.group.position, 25, this.config.accentColor);
    if (!this.config.isAI) {
      this.audio.playBoost();
      const boostFlash = document.getElementById('boost-flash');
      if (boostFlash) {
        boostFlash.style.opacity = '0.9';
        setTimeout(() => (boostFlash.style.opacity = '0'), 350);
      }
    }
  }

  private triggerSideAttack(dir: -1 | 1): void {
    this.isSideAttacking = true;
    this.sideAttackDir = dir;
    this.sideAttackTimer = 0.35;
    this.combat.spawnSparks(this.group.position, 20, 0xff0055);
    if (!this.config.isAI) {
      this.audio.playImpact();
    }
  }

  public takeDamage(amount: number, flash = true): void {
    this.shield = Math.max(this.shield - amount, 0);

    if (flash && !this.config.isAI) {
      const dmgFlash = document.getElementById('damage-flash');
      if (dmgFlash) {
        dmgFlash.style.opacity = '0.7';
        setTimeout(() => (dmgFlash.style.opacity = '0'), 180);
      }
    }

    if (this.shield <= 0 && !this.isDestroyed) {
      this.destroy();
    }
  }

  public destroy(): void {
    this.isDestroyed = true;
    this.respawnTimer = 3.0;
    this.group.visible = false;
    this.combat.spawnExplosion(this.group.position);
    this.audio.playExplosion();
  }

  public respawn(): void {
    this.isDestroyed = false;
    this.shield = 80;
    this.speed = 100;
    this.lateralOffset = 0;
    this.lateralVelocity = 0;
    this.group.visible = true;
  }

  private updateAI(
    _dt: number,
    inputState: {
      forward: boolean;
      backward: boolean;
      left: boolean;
      right: boolean;
      boost: boolean;
      sideAttack: -1 | 0 | 1;
    }
  ): void {
    const now = performance.now();
    if (now > this.aiNextDecision) {
      this.aiNextDecision = now + 1200 + Math.random() * 1500;
      // Pick a random racing line offset
      this.aiTargetOffset = (Math.random() - 0.5) * (this.track.trackWidth - 8);
    }

    // Always accelerate forward
    inputState.forward = true;

    // Steer towards target line
    const offsetErr = this.aiTargetOffset - this.lateralOffset;
    if (offsetErr > 1.2) inputState.right = true;
    else if (offsetErr < -1.2) inputState.left = true;

    // Use boost occasionally if shield is healthy
    if (this.shield > 65 && Math.random() < 0.008) {
      inputState.boost = true;
    }

    // Aggressive AI side-attack when jostling nearby rivals
    if (Math.random() < 0.005) {
      inputState.sideAttack = Math.random() > 0.5 ? 1 : -1;
    }
  }

  public getSpeedKmH(): number {
    return Math.round(this.speed * 6.8);
  }
}
