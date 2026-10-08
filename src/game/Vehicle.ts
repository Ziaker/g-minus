import * as THREE from 'three';
import { Track } from './Track';
import { CombatSystem } from './Combat';
import { AudioManager } from './Audio';

export type StatGrade = 'A' | 'B' | 'C' | 'D' | 'E';

export interface VehicleStats {
  body: StatGrade;  // Armoring & mass in collisions
  boost: StatGrade; // Boost velocity multiplier & acceleration
  grip: StatGrade;  // Turning traction vs drift slip
}

export type MachineModel = 'falcon' | 'fox' | 'goose' | 'stingray' | 'generic';

export interface VehicleConfig {
  id: string;
  name: string;
  pilot?: string;
  isAI: boolean;
  model: MachineModel;
  color: number;
  accentColor: number;
  stats: VehicleStats;
  maxSpeed: number;
  acceleration: number;
  handling: number;
  boostMultiplier: number;
  engineBalance?: number; // -1 (Max Accel) to +1 (Max Top Speed), default 0
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

  // State
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

  // Spin attack (F-Zero X signature 360 Whirl)
  public isSpinAttacking = false;
  public spinAttackTimer = 0;
  public spinAttackRotation = 0;

  // Visuals
  private craftMesh: THREE.Group;
  private thrusterLight: THREE.PointLight;
  private thrusterPlumes: THREE.Mesh[] = [];
  public currentRoll = 0;

  // AI behavior
  private aiTargetOffset = 0;
  private aiNextDecision = 0;

  // Computed stat multipliers
  public effectiveMaxSpeed: number;
  public effectiveAcceleration: number;
  public bodyArmorFactor: number;
  public gripFactor: number;

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

    // Apply Engine Balance & Stat Grades
    const balance = config.engineBalance ?? 0; // -1..+1
    let speedMult = 1.0;
    let accelMult = 1.0;

    if (balance > 0) {
      speedMult += balance * 0.18;
      accelMult -= balance * 0.14;
    } else if (balance < 0) {
      speedMult -= Math.abs(balance) * 0.12;
      accelMult += Math.abs(balance) * 0.28;
    }

    this.effectiveMaxSpeed = config.maxSpeed * speedMult;
    this.effectiveAcceleration = config.acceleration * accelMult;

    // Body grade multipliers (A is tank, E is paper)
    const bodyGradeMap: Record<StatGrade, number> = { A: 0.65, B: 0.85, C: 1.0, D: 1.25, E: 1.5 };
    this.bodyArmorFactor = bodyGradeMap[config.stats.body] ?? 1.0;

    // Grip grade multipliers (A grips tight, E drifts wild)
    const gripGradeMap: Record<StatGrade, number> = { A: 0.02, B: 0.04, C: 0.07, D: 0.11, E: 0.16 };
    this.gripFactor = gripGradeMap[config.stats.grip] ?? 0.05;

    this.group = new THREE.Group();
    this.craftMesh = this.buildCraftModel(config.model, config.color, config.accentColor);
    this.group.add(this.craftMesh);

    // Thruster glow
    this.thrusterLight = new THREE.PointLight(config.accentColor, 2.5, 20);
    this.thrusterLight.position.set(0, 0, -2.5);
    this.group.add(this.thrusterLight);

    scene.add(this.group);
  }

  public canBoost(): boolean {
    return this.currentLap >= 2;
  }

  private buildCraftModel(model: MachineModel, mainColor: number, accentColor: number): THREE.Group {
    const ship = new THREE.Group();

    const bodyMat = new THREE.MeshStandardMaterial({
      color: mainColor,
      roughness: 0.28,
      metalness: 0.85
    });

    const accentMat = new THREE.MeshStandardMaterial({
      color: accentColor,
      roughness: 0.22,
      metalness: 0.9
    });

    const cockpitMat = new THREE.MeshStandardMaterial({
      color: 0x05101a,
      roughness: 0.08,
      metalness: 0.96
    });

    const glowMat = new THREE.MeshBasicMaterial({
      color: accentColor
    });

    if (model === 'fox') {
      // Golden Fox: Needle nose, compact lightweight body
      const fuselage = new THREE.Mesh(new THREE.ConeGeometry(1.0, 5.6, 6).rotateX(Math.PI / 2).scale(1.0, 0.4, 1.0), bodyMat);
      ship.add(fuselage);

      const canopy = new THREE.Mesh(new THREE.SphereGeometry(0.55, 8, 8).scale(0.7, 0.45, 1.6), cockpitMat);
      canopy.position.set(0, 0.32, 0.2);
      ship.add(canopy);

      // Angled delta fins
      const wingL = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.1, 1.5), accentMat);
      wingL.position.set(-1.4, 0.1, -0.8);
      wingL.rotation.z = 0.2;
      ship.add(wingL);

      const wingR = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.1, 1.5), accentMat);
      wingR.position.set(1.4, 0.1, -0.8);
      wingR.rotation.z = -0.2;
      ship.add(wingR);

      // Twin upright stabilizers
      const finL = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.4, 1.2), accentMat);
      finL.position.set(-0.9, 0.7, -1.5);
      ship.add(finL);

      const finR = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.4, 1.2), accentMat);
      finR.position.set(0.9, 0.7, -1.5);
      ship.add(finR);
    } else if (model === 'goose') {
      // Wild Goose: Heavy blocky faceted tank prow
      const prow = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.9, 4.6), bodyMat);
      prow.position.set(0, 0.1, 0);
      ship.add(prow);

      const noseCone = new THREE.Mesh(new THREE.ConeGeometry(1.2, 1.8, 4).rotateX(Math.PI / 2), accentMat);
      noseCone.position.set(0, 0.1, 2.8);
      ship.add(noseCone);

      const canopy = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.6, 1.8), cockpitMat);
      canopy.position.set(0, 0.65, 0.3);
      ship.add(canopy);

      // Heavy armor side skirts
      const skirtL = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.7, 3.4), accentMat);
      skirtL.position.set(-1.5, 0, -0.3);
      ship.add(skirtL);

      const skirtR = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.7, 3.4), accentMat);
      skirtR.position.set(1.5, 0, -0.3);
      ship.add(skirtR);
    } else if (model === 'stingray') {
      // Fire Stingray: Broad sweeping flat manta lifting body
      const manta = new THREE.Mesh(new THREE.CylinderGeometry(2.6, 2.9, 0.5, 7).scale(1.2, 0.7, 1.4), bodyMat);
      manta.position.set(0, 0, 0);
      ship.add(manta);

      const canopy = new THREE.Mesh(new THREE.SphereGeometry(0.8, 8, 8).scale(0.8, 0.5, 1.5), cockpitMat);
      canopy.position.set(0, 0.45, 0.5);
      ship.add(canopy);

      // Wide rear wing slats
      const slatL = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.15, 1.2), accentMat);
      slatL.position.set(-2.2, 0.2, -1.0);
      ship.add(slatL);

      const slatR = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.15, 1.2), accentMat);
      slatR.position.set(2.2, 0.2, -1.0);
      ship.add(slatR);
    } else {
      // Blue Falcon / Dart Interceptor Default
      const bodyGeo = new THREE.ConeGeometry(1.3, 5.2, 5);
      bodyGeo.rotateX(Math.PI / 2);
      bodyGeo.scale(1.2, 0.45, 1);
      const body = new THREE.Mesh(bodyGeo, bodyMat);
      ship.add(body);

      const canopy = new THREE.Mesh(new THREE.SphereGeometry(0.7, 8, 8).scale(0.8, 0.45, 1.8), cockpitMat);
      canopy.position.set(0, 0.35, 0.3);
      ship.add(canopy);

      const wingL = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.12, 1.8).rotateY(0.2), accentMat);
      wingL.position.set(-1.8, 0, -0.6);
      wingL.rotation.z = 0.1;
      ship.add(wingL);

      const wingR = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.12, 1.8).rotateY(-0.2), accentMat);
      wingR.position.set(1.8, 0, -0.6);
      wingR.rotation.z = -0.1;
      ship.add(wingR);

      const podL = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.35, 1.6), cockpitMat);
      podL.position.set(-2.8, 0.05, -0.4);
      ship.add(podL);

      const podR = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.35, 1.6), cockpitMat);
      podR.position.set(2.8, 0.05, -0.4);
      ship.add(podR);

      const finL = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.2, 1.4), accentMat);
      finL.position.set(-1.1, 0.7, -1.2);
      finL.rotation.z = -0.25;
      ship.add(finL);

      const finR = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.2, 1.4), accentMat);
      finR.position.set(1.1, 0.7, -1.2);
      finR.rotation.z = 0.25;
      ship.add(finR);
    }

    // Dual Thruster plumes
    const plumeGeo = new THREE.ConeGeometry(0.38, 1.8, 8).rotateX(-Math.PI / 2);
    const leftPlume = new THREE.Mesh(plumeGeo, glowMat);
    leftPlume.position.set(-0.65, 0, -2.6);
    ship.add(leftPlume);

    const rightPlume = new THREE.Mesh(plumeGeo, glowMat);
    rightPlume.position.set(0.65, 0, -2.6);
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
      spinAttack?: boolean;
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

    // Boost Handling (Requires Lap 2+)
    if (input.boost && !this.isBoosting) {
      if (this.canBoost()) {
        if (this.shield > 15) {
          this.triggerBoost();
        }
      }
    }

    if (this.isBoosting) {
      this.boostDurationRemaining -= dt;
      // Boost consumes shield continuously
      this.takeDamage(14 * dt, false);

      if (this.boostDurationRemaining <= 0 || this.shield <= 5) {
        this.isBoosting = false;
      }
    }

    // Side Attack Handling
    if (input.sideAttack !== 0 && !this.isSideAttacking && !this.isSpinAttacking) {
      this.triggerSideAttack(input.sideAttack);
    }

    if (this.isSideAttacking) {
      this.sideAttackTimer -= dt;
      this.lateralVelocity += this.sideAttackDir * 190 * dt;
      if (this.sideAttackTimer <= 0) {
        this.isSideAttacking = false;
      }
    }

    // Spin Attack Handling (F-Zero X Whirl)
    if (input.spinAttack && !this.isSpinAttacking && !this.isSideAttacking) {
      this.triggerSpinAttack();
    }

    if (this.isSpinAttacking) {
      this.spinAttackTimer -= dt;
      this.spinAttackRotation += dt * Math.PI * 8; // Rapid axial spin
      if (this.spinAttackTimer <= 0) {
        this.isSpinAttacking = false;
        this.spinAttackRotation = 0;
      }
    }

    // Acceleration & Braking
    const maxSpeedCurrent = this.isBoosting
      ? this.effectiveMaxSpeed * this.config.boostMultiplier
      : this.effectiveMaxSpeed;

    if (input.forward) {
      const accel = this.isBoosting ? this.effectiveAcceleration * 1.85 : this.effectiveAcceleration;
      this.speed = Math.min(this.speed + accel * dt, maxSpeedCurrent);
    } else if (input.backward) {
      this.speed = Math.max(this.speed - this.effectiveAcceleration * 1.5 * dt, 0);
    } else {
      // Atmospheric drag
      this.speed = Math.max(this.speed - 24 * dt, 0);
    }

    // Lateral Steering & Grip Dynamics
    let steerDir = 0;
    if (input.left) steerDir -= 1;
    if (input.right) steerDir += 1;

    const lateralForce = steerDir * this.config.handling * (0.35 + (this.speed / this.effectiveMaxSpeed) * 0.65);
    this.lateralVelocity += lateralForce * dt;

    // Lateral friction governed by Grip stat (A is sticky, E slides)
    this.lateralVelocity *= Math.pow(this.gripFactor, dt);

    this.lateralOffset += this.lateralVelocity * dt;

    // Track boundary guardrail collision
    const halfWidth = this.track.trackWidth / 2 - 1.2;
    if (Math.abs(this.lateralOffset) > halfWidth) {
      this.lateralOffset = Math.sign(this.lateralOffset) * halfWidth;
      this.lateralVelocity = -this.lateralVelocity * 0.45;
      this.speed = Math.max(this.speed - 120 * dt, 20);
      this.takeDamage(18 * dt * this.bodyArmorFactor, false);
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
      if (!this.config.isAI && this.currentLap === 2) {
        this.audio.playBoostOk();
      }
    }

    // Check Dash Plates (Boost Pads)
    for (const pad of this.track.boostPads) {
      const tDiff = Math.abs(this.progressT - pad.t);
      if (tDiff < 0.015 || tDiff > 0.985) {
        const offsetDiff = Math.abs(this.lateralOffset - pad.offset);
        if (offsetDiff < pad.width / 2 + 1.2) {
          this.speed = Math.min(this.speed + 95, this.effectiveMaxSpeed * this.config.boostMultiplier);
          this.combat.spawnSparks(this.group.position, 18, 0xffaa00);
          if (!this.config.isAI) {
            this.audio.playDashPlate();
          }
        }
      }
    }

    // Check Pit Lane / Recharge Strips
    for (const pit of this.track.pitZones) {
      if (this.progressT >= pit.tStart && this.progressT <= pit.tEnd) {
        if (this.lateralOffset >= pit.offsetMin && this.lateralOffset <= pit.offsetMax) {
          if (this.shield < this.maxShield) {
            this.shield = Math.min(this.shield + 48 * dt, this.maxShield);
            this.combat.spawnSparks(this.group.position, 3, 0x00ff88);
            if (!this.config.isAI && Math.random() < 0.22) {
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
      if (this.shield < 22 && Math.random() < 0.05) {
        this.audio.playLowEnergyAlarm();
      }
    }
  }

  private updateTransform(dt: number, steerDir: number): void {
    const info = this.track.getTrackInfoAt(this.progressT);

    const hoverHeight = 1.35;
    const pos = info.position.clone()
      .add(info.binormal.clone().multiplyScalar(this.lateralOffset))
      .add(info.normal.clone().multiplyScalar(hoverHeight));

    this.group.position.copy(pos);

    // Roll banking based on turning or side attack
    let targetRoll = -steerDir * 0.48;
    if (this.isSideAttacking) {
      targetRoll = this.sideAttackDir * Math.PI * 1.5;
    }
    this.currentRoll = THREE.MathUtils.lerp(this.currentRoll, targetRoll, Math.min(dt * 12, 1));

    // Align ship with track surface Frenet frame
    const rotMatrix = new THREE.Matrix4().makeBasis(info.binormal, info.normal, info.tangent);
    this.group.quaternion.setFromRotationMatrix(rotMatrix);

    // Apply banking roll to mesh + spin attack yaw
    this.craftMesh.rotation.z = this.currentRoll;
    if (this.isSpinAttacking) {
      this.craftMesh.rotation.y = this.spinAttackRotation;
    } else {
      this.craftMesh.rotation.y = 0;
    }

    // Thruster scale FX
    const plumeScale = (this.speed / this.effectiveMaxSpeed) * (this.isBoosting ? 2.6 : 1.25);
    for (const plume of this.thrusterPlumes) {
      plume.scale.set(1, 1, Math.max(plumeScale, 0.4));
    }
    this.thrusterLight.intensity = this.isBoosting ? 5.5 : 2.0;
  }

  public triggerBoost(): void {
    this.isBoosting = true;
    this.boostDurationRemaining = 2.4;
    this.speed = Math.max(this.speed, this.effectiveMaxSpeed * 1.15);
    this.takeDamage(10 * this.bodyArmorFactor, false); // initial burst cost
    this.combat.spawnSparks(this.group.position, 28, this.config.accentColor);
    if (!this.config.isAI) {
      this.audio.playBoost();
      const boostFlash = document.getElementById('boost-flash');
      if (boostFlash) {
        boostFlash.style.opacity = '0.9';
        setTimeout(() => (boostFlash.style.opacity = '0'), 350);
      }
    }
  }

  public triggerSideAttack(dir: -1 | 1): void {
    this.isSideAttacking = true;
    this.sideAttackDir = dir;
    this.sideAttackTimer = 0.35;
    this.combat.spawnSparks(this.group.position, 22, 0xff0055);
    if (!this.config.isAI) {
      this.audio.playImpact();
    }
  }

  public triggerSpinAttack(): void {
    this.isSpinAttacking = true;
    this.spinAttackTimer = 0.48;
    this.spinAttackRotation = 0;
    this.combat.spawnSparks(this.group.position, 36, 0x00f0ff);
    if (!this.config.isAI) {
      this.audio.playSpinAttack();
    }
  }

  public takeDamage(amount: number, flash = true): void {
    const reducedAmount = amount * this.bodyArmorFactor;
    this.shield = Math.max(this.shield - reducedAmount, 0);

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
    this.respawnTimer = 3.2;
    this.group.visible = false;
    this.combat.spawnExplosion(this.group.position);
    this.audio.playExplosion();
  }

  public respawn(): void {
    this.isDestroyed = false;
    this.shield = 75;
    this.speed = 90;
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
      spinAttack?: boolean;
    }
  ): void {
    const now = performance.now();
    if (now > this.aiNextDecision) {
      this.aiNextDecision = now + 900 + Math.random() * 1200;
      this.aiTargetOffset = (Math.random() - 0.5) * (this.track.trackWidth - 8);
    }

    inputState.forward = true;

    const offsetErr = this.aiTargetOffset - this.lateralOffset;
    if (offsetErr > 1.2) inputState.right = true;
    else if (offsetErr < -1.2) inputState.left = true;

    // AI Boost allowed only on Lap 2+
    if (this.canBoost() && this.shield > 60 && Math.random() < 0.012) {
      inputState.boost = true;
    }

    // AI aggressive contact maneuvers
    if (Math.random() < 0.006) {
      inputState.sideAttack = Math.random() > 0.5 ? 1 : -1;
    } else if (Math.random() < 0.003) {
      inputState.spinAttack = true;
    }
  }

  public getSpeedKmH(): number {
    return Math.round(this.speed * 6.8);
  }
}
