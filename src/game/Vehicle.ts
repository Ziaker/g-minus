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

export type MachineModel =
  | 'falcon'
  | 'fox'
  | 'goose'
  | 'stingray'
  | 'white_cat'
  | 'red_gazelle'
  | 'iron_tiger'
  | 'deep_claw'
  | 'black_bull'
  | 'blood_hawk'
  | 'generic';

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
  public attackSerial = 0;
  private activePads = new Set<number>();

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

  /**
   * Complete 4-Piece Modular Craft Overhaul (GDD [71-78]):
   * 1. Piece 1: Nose & Prow (Bico / Proa Aerodinâmica)
   * 2. Piece 2: Cockpit Canopy & Visor (Cabine / Domo Translúcido)
   * 3. Piece 3: Wings & Side Pods (Asas / Pods Laterais / Estabilizadores / Blindagens)
   * 4. Piece 4: Propulsion Engine Block (Bloco de Turbinas / Bocais / Plumas)
   */
  private buildCraftModel(model: MachineModel, mainColor: number, accentColor: number): THREE.Group {
    const ship = new THREE.Group();
    this.thrusterPlumes = [];

    const bodyMat = new THREE.MeshStandardMaterial({
      color: mainColor,
      roughness: 0.26,
      metalness: 0.88
    });

    const accentMat = new THREE.MeshStandardMaterial({
      color: accentColor,
      roughness: 0.20,
      metalness: 0.92
    });

    const darkMetalMat = new THREE.MeshStandardMaterial({
      color: 0x121722,
      roughness: 0.35,
      metalness: 0.95
    });

    const cockpitMat = new THREE.MeshStandardMaterial({
      color: 0x050f1a,
      roughness: 0.06,
      metalness: 0.98
    });

    const glowMat = new THREE.MeshBasicMaterial({
      color: accentColor
    });

    // 4 Modular Pieces Groups
    const piece1_Nose = new THREE.Group();
    piece1_Nose.name = 'Piece1_Nose';

    const piece2_Cockpit = new THREE.Group();
    piece2_Cockpit.name = 'Piece2_Cockpit';

    const piece3_Wings = new THREE.Group();
    piece3_Wings.name = 'Piece3_Wings';

    const piece4_Engines = new THREE.Group();
    piece4_Engines.name = 'Piece4_Engines';

    if (model === 'fox') {
      // 1. GOLDEN FOX: Ultra-slender acceleration needle
      // Piece 1: Slender Needle Nose + Aero Canards
      const noseCone = new THREE.Mesh(
        new THREE.ConeGeometry(0.85, 5.8, 6).rotateX(Math.PI / 2).scale(0.9, 0.36, 1.1),
        bodyMat
      );
      noseCone.position.set(0, 0.05, 0.6);
      piece1_Nose.add(noseCone);

      const canardL = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.06, 0.9).rotateY(0.3), accentMat);
      canardL.position.set(-0.75, 0.05, 1.3);
      const canardR = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.06, 0.9).rotateY(-0.3), accentMat);
      canardR.position.set(0.75, 0.05, 1.3);
      piece1_Nose.add(canardL, canardR);

      // Piece 2: Teardrop Cockpit Canopy
      const canopy = new THREE.Mesh(new THREE.SphereGeometry(0.5, 10, 8).scale(0.65, 0.4, 1.5), cockpitMat);
      canopy.position.set(0, 0.3, 0.2);
      const spine = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.16, 1.6), darkMetalMat);
      spine.position.set(0, 0.44, -0.2);
      piece2_Cockpit.add(canopy, spine);

      // Piece 3: Razor Delta Wings + Winglets
      const wingL = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.08, 1.5).rotateY(0.2), accentMat);
      wingL.position.set(-1.4, 0.05, -0.7);
      wingL.rotation.z = 0.15;
      const wingletL = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.7, 0.9), accentMat);
      wingletL.position.set(-2.25, 0.35, -0.8);

      const wingR = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.08, 1.5).rotateY(-0.2), accentMat);
      wingR.position.set(1.4, 0.05, -0.7);
      wingR.rotation.z = -0.15;
      const wingletR = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.7, 0.9), accentMat);
      wingletR.position.set(2.25, 0.35, -0.8);

      const finL = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.3, 1.1), bodyMat);
      finL.position.set(-0.75, 0.7, -1.4);
      const finR = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.3, 1.1), bodyMat);
      finR.position.set(0.75, 0.7, -1.4);
      piece3_Wings.add(wingL, wingletL, wingR, wingletR, finL, finR);

      // Piece 4: Twin High-Output Boost Thrusters
      const engL = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.42, 1.6, 8).rotateX(Math.PI / 2), darkMetalMat);
      engL.position.set(-0.55, 0, -1.7);
      const engR = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.42, 1.6, 8).rotateX(Math.PI / 2), darkMetalMat);
      engR.position.set(0.55, 0, -1.7);
      piece4_Engines.add(engL, engR);

      const plumeGeo = new THREE.ConeGeometry(0.32, 1.8, 8).rotateX(-Math.PI / 2);
      const pL = new THREE.Mesh(plumeGeo, glowMat);
      pL.position.set(-0.55, 0, -2.6);
      const pR = new THREE.Mesh(plumeGeo, glowMat);
      pR.position.set(0.55, 0, -2.6);
      piece4_Engines.add(pL, pR);
      this.thrusterPlumes.push(pL, pR);

    } else if (model === 'goose') {
      // 2. WILD GOOSE: Heavy armored battering ram
      // Piece 1: Faceted Heavy Ram Prow
      const prow = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.95, 4.4), bodyMat);
      prow.position.set(0, 0.1, 0.2);
      const ramNose = new THREE.Mesh(new THREE.ConeGeometry(1.2, 1.7, 4).rotateX(Math.PI / 2), accentMat);
      ramNose.position.set(0, 0.1, 2.8);
      const ramBar = new THREE.Mesh(new THREE.BoxGeometry(2.7, 0.35, 0.5), darkMetalMat);
      ramBar.position.set(0, 0, 3.2);
      piece1_Nose.add(prow, ramNose, ramBar);

      // Piece 2: Armored Slit Visor Cabin
      const canopy = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.65, 1.9), cockpitMat);
      canopy.position.set(0, 0.65, 0.3);
      const visorCap = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.15, 1.8), darkMetalMat);
      visorCap.position.set(0, 0.98, 0.3);
      piece2_Cockpit.add(canopy, visorCap);

      // Piece 3: Heavy Reinforced Side Skirts & Bash Bumpers
      const skirtL = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.75, 3.8), accentMat);
      skirtL.position.set(-1.55, 0, -0.2);
      const bumperL = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.45, 1.6), darkMetalMat);
      bumperL.position.set(-1.9, 0, 0.2);

      const skirtR = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.75, 3.8), accentMat);
      skirtR.position.set(1.55, 0, -0.2);
      const bumperR = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.45, 1.6), darkMetalMat);
      bumperR.position.set(1.9, 0, 0.2);
      piece3_Wings.add(skirtL, bumperL, skirtR, bumperR);

      // Piece 4: Dual Block Rocket Engine Array
      const engBox = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.8, 1.4), darkMetalMat);
      engBox.position.set(0, 0.1, -1.8);
      const nozL = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.46, 0.8, 8).rotateX(Math.PI / 2), accentMat);
      nozL.position.set(-0.65, 0.1, -2.4);
      const nozR = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.46, 0.8, 8).rotateX(Math.PI / 2), accentMat);
      nozR.position.set(0.65, 0.1, -2.4);
      piece4_Engines.add(engBox, nozL, nozR);

      const plumeGeo = new THREE.ConeGeometry(0.42, 2.0, 8).rotateX(-Math.PI / 2);
      const pL = new THREE.Mesh(plumeGeo, glowMat);
      pL.position.set(-0.65, 0.1, -3.0);
      const pR = new THREE.Mesh(plumeGeo, glowMat);
      pR.position.set(0.65, 0.1, -3.0);
      piece4_Engines.add(pL, pR);
      this.thrusterPlumes.push(pL, pR);

    } else if (model === 'stingray') {
      // 3. FIRE STINGRAY: Broad sweeping manta lifting body
      // Piece 1: Wide Manta Aero Prow
      const manta = new THREE.Mesh(new THREE.CylinderGeometry(2.7, 3.0, 0.55, 8).scale(1.25, 0.65, 1.4), bodyMat);
      manta.position.set(0, 0, 0.1);
      const scoop = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.28, 1.2), darkMetalMat);
      scoop.position.set(0, -0.12, 1.8);
      piece1_Nose.add(manta, scoop);

      // Piece 2: Wide Panoramic Visor Dome
      const canopy = new THREE.Mesh(new THREE.SphereGeometry(0.85, 12, 10).scale(0.85, 0.45, 1.5), cockpitMat);
      canopy.position.set(0, 0.45, 0.5);
      piece2_Cockpit.add(canopy);

      // Piece 3: Sweeping Manta Wings & Airbrake Slats
      const wingL = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.16, 1.6), accentMat);
      wingL.position.set(-2.4, 0.15, -0.8);
      const flapL = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.08, 0.8), darkMetalMat);
      flapL.position.set(-2.5, 0.25, -1.6);

      const wingR = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.16, 1.6), accentMat);
      wingR.position.set(2.4, 0.15, -0.8);
      const flapR = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.08, 0.8), darkMetalMat);
      flapR.position.set(2.5, 0.25, -1.6);
      piece3_Wings.add(wingL, flapL, wingR, flapR);

      // Piece 4: Massive Dual Atomic Propulsion Cylinders
      const engL = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.6, 1.8, 8).rotateX(Math.PI / 2), darkMetalMat);
      engL.position.set(-0.9, 0.05, -1.8);
      const engR = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.6, 1.8, 8).rotateX(Math.PI / 2), darkMetalMat);
      engR.position.set(0.9, 0.05, -1.8);
      piece4_Engines.add(engL, engR);

      const plumeGeo = new THREE.ConeGeometry(0.5, 2.2, 8).rotateX(-Math.PI / 2);
      const pL = new THREE.Mesh(plumeGeo, glowMat);
      pL.position.set(-0.9, 0.05, -2.8);
      const pR = new THREE.Mesh(plumeGeo, glowMat);
      pR.position.set(0.9, 0.05, -2.8);
      piece4_Engines.add(pL, pR);
      this.thrusterPlumes.push(pL, pR);

    } else if (model === 'white_cat') {
      // 4. WHITE CAT: Elegant twin-fork feline speeder
      // Piece 1: Feline Twin-Fork Prow
      const forkL = new THREE.Mesh(new THREE.ConeGeometry(0.45, 3.2, 5).rotateX(Math.PI / 2), bodyMat);
      forkL.position.set(-0.55, 0.05, 1.8);
      const forkR = new THREE.Mesh(new THREE.ConeGeometry(0.45, 3.2, 5).rotateX(Math.PI / 2), bodyMat);
      forkR.position.set(0.55, 0.05, 1.8);
      const centerKeel = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.25, 2.4), accentMat);
      centerKeel.position.set(0, 0, 0.6);
      piece1_Nose.add(forkL, forkR, centerKeel);

      // Piece 2: Crystal Cyan Streamlined Canopy
      const canopy = new THREE.Mesh(new THREE.SphereGeometry(0.6, 10, 8).scale(0.7, 0.45, 1.7), cockpitMat);
      canopy.position.set(0, 0.35, 0.2);
      piece2_Cockpit.add(canopy);

      // Piece 3: Curved High-Grip Wings & Upright Ear Fins
      const wingL = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.1, 1.6).rotateY(0.15), accentMat);
      wingL.position.set(-1.6, 0.05, -0.6);
      const earFinL = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.1, 0.9), accentMat);
      earFinL.position.set(-0.8, 0.65, -1.1);

      const wingR = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.1, 1.6).rotateY(-0.15), accentMat);
      wingR.position.set(1.6, 0.05, -0.6);
      const earFinR = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.1, 0.9), accentMat);
      earFinR.position.set(0.8, 0.65, -1.1);
      piece3_Wings.add(wingL, earFinL, wingR, earFinR);

      // Piece 4: Chrome Cylindrical Turbo Jet Block
      const engL = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.42, 1.6, 8).rotateX(Math.PI / 2), bodyMat);
      engL.position.set(-0.6, 0, -1.8);
      const engR = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.42, 1.6, 8).rotateX(Math.PI / 2), bodyMat);
      engR.position.set(0.6, 0, -1.8);
      piece4_Engines.add(engL, engR);

      const plumeGeo = new THREE.ConeGeometry(0.35, 1.8, 8).rotateX(-Math.PI / 2);
      const pL = new THREE.Mesh(plumeGeo, glowMat);
      pL.position.set(-0.6, 0, -2.6);
      const pR = new THREE.Mesh(plumeGeo, glowMat);
      pR.position.set(0.6, 0, -2.6);
      piece4_Engines.add(pL, pR);
      this.thrusterPlumes.push(pL, pR);

    } else if (model === 'red_gazelle') {
      // 5. RED GAZELLE: Lightweight aerodynamic rocket
      // Piece 1: Crimson Razor Needle Prow
      const needle = new THREE.Mesh(new THREE.ConeGeometry(0.75, 5.6, 5).rotateX(Math.PI / 2).scale(0.85, 0.38, 1.1), bodyMat);
      needle.position.set(0, 0.05, 0.7);
      piece1_Nose.add(needle);

      // Piece 2: Cybernetic Pilot Capsule
      const canopy = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.45, 1.4), cockpitMat);
      canopy.position.set(0, 0.32, 0.2);
      piece2_Cockpit.add(canopy);

      // Piece 3: Lightweight Delta Wings & Strakes
      const wingL = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.08, 1.4).rotateY(0.25), accentMat);
      wingL.position.set(-1.45, 0.05, -0.6);
      const finL = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.2, 1.0), bodyMat);
      finL.position.set(-0.85, 0.65, -1.3);

      const wingR = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.08, 1.4).rotateY(-0.25), accentMat);
      wingR.position.set(1.45, 0.05, -0.6);
      const finR = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.2, 1.0), bodyMat);
      finR.position.set(0.85, 0.65, -1.3);
      piece3_Wings.add(wingL, finL, wingR, finR);

      // Piece 4: High-Boost Dual Rocket Block
      const engL = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.4, 1.6, 8).rotateX(Math.PI / 2), darkMetalMat);
      engL.position.set(-0.55, 0, -1.8);
      const engR = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.4, 1.6, 8).rotateX(Math.PI / 2), darkMetalMat);
      engR.position.set(0.55, 0, -1.8);
      piece4_Engines.add(engL, engR);

      const plumeGeo = new THREE.ConeGeometry(0.34, 1.9, 8).rotateX(-Math.PI / 2);
      const pL = new THREE.Mesh(plumeGeo, glowMat);
      pL.position.set(-0.55, 0, -2.6);
      const pR = new THREE.Mesh(plumeGeo, glowMat);
      pR.position.set(0.55, 0, -2.6);
      piece4_Engines.add(pL, pR);
      this.thrusterPlumes.push(pL, pR);

    } else if (model === 'iron_tiger') {
      // 6. IRON TIGER: Industrial stepped tiger rammer
      // Piece 1: Stepped Angular Ram Prow + Grille
      const prow = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.85, 4.2), bodyMat);
      prow.position.set(0, 0.05, 0.2);
      const grille = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.35, 0.4), darkMetalMat);
      grille.position.set(0, 0, 2.4);
      piece1_Nose.add(prow, grille);

      // Piece 2: Armored Roll-Cage Visor
      const canopy = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.62, 1.8), cockpitMat);
      canopy.position.set(0, 0.58, 0.2);
      piece2_Cockpit.add(canopy);

      // Piece 3: Stepped Side Sponsons & Tiger Fins
      const sponsonL = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.65, 3.4), accentMat);
      sponsonL.position.set(-1.5, 0.05, -0.4);
      const sponsonR = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.65, 3.4), accentMat);
      sponsonR.position.set(1.5, 0.05, -0.4);
      const centerFin = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.0, 1.2), bodyMat);
      centerFin.position.set(0, 0.85, -1.4);
      piece3_Wings.add(sponsonL, sponsonR, centerFin);

      // Piece 4: Heavy Industrial Triple Turbine Array
      const engL = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.44, 1.6, 8).rotateX(Math.PI / 2), darkMetalMat);
      engL.position.set(-0.75, 0, -1.8);
      const engR = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.44, 1.6, 8).rotateX(Math.PI / 2), darkMetalMat);
      engR.position.set(0.75, 0, -1.8);
      const engC = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.4, 1.4, 8).rotateX(Math.PI / 2), darkMetalMat);
      engC.position.set(0, 0.25, -1.7);
      piece4_Engines.add(engL, engR, engC);

      const plumeGeo = new THREE.ConeGeometry(0.38, 1.9, 8).rotateX(-Math.PI / 2);
      const pL = new THREE.Mesh(plumeGeo, glowMat);
      pL.position.set(-0.75, 0, -2.6);
      const pR = new THREE.Mesh(plumeGeo, glowMat);
      pR.position.set(0.75, 0, -2.6);
      piece4_Engines.add(pL, pR);
      this.thrusterPlumes.push(pL, pR);

    } else if (model === 'deep_claw') {
      // 7. DEEP CLAW: Biomorphic alien claw
      // Piece 1: Biomorphic Pincer Prow
      const clawL = new THREE.Mesh(new THREE.ConeGeometry(0.45, 3.2, 5).rotateX(Math.PI / 2).rotateY(-0.15), bodyMat);
      clawL.position.set(-0.75, 0.05, 2.0);
      const clawR = new THREE.Mesh(new THREE.ConeGeometry(0.45, 3.2, 5).rotateX(Math.PI / 2).rotateY(0.15), bodyMat);
      clawR.position.set(0.75, 0.05, 2.0);
      const bioCore = new THREE.Mesh(new THREE.SphereGeometry(0.7, 8, 8).scale(1.1, 0.45, 1.8), accentMat);
      bioCore.position.set(0, 0.05, 0.4);
      piece1_Nose.add(clawL, clawR, bioCore);

      // Piece 2: Bulbous Magenta Ocular Canopy
      const canopy = new THREE.Mesh(new THREE.SphereGeometry(0.72, 10, 8).scale(0.8, 0.55, 1.3), cockpitMat);
      canopy.position.set(0, 0.45, 0.3);
      piece2_Cockpit.add(canopy);

      // Piece 3: Organic Side Flippers & Glowing Bio-Spines
      const flipperL = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.12, 1.8).rotateY(0.2), bodyMat);
      flipperL.position.set(-1.8, 0.08, -0.6);
      const flipperR = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.12, 1.8).rotateY(-0.2), bodyMat);
      flipperR.position.set(1.8, 0.08, -0.6);
      piece3_Wings.add(flipperL, flipperR);

      // Piece 4: Plasma Siphon Exhaust Manifolds
      const engL = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.45, 1.6, 8).rotateX(Math.PI / 2), accentMat);
      engL.position.set(-0.65, 0.05, -1.8);
      const engR = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.45, 1.6, 8).rotateX(Math.PI / 2), accentMat);
      engR.position.set(0.65, 0.05, -1.8);
      piece4_Engines.add(engL, engR);

      const plumeGeo = new THREE.ConeGeometry(0.38, 1.9, 8).rotateX(-Math.PI / 2);
      const pL = new THREE.Mesh(plumeGeo, glowMat);
      pL.position.set(-0.65, 0.05, -2.6);
      const pR = new THREE.Mesh(plumeGeo, glowMat);
      pR.position.set(0.65, 0.05, -2.6);
      piece4_Engines.add(pL, pR);
      this.thrusterPlumes.push(pL, pR);

    } else if (model === 'black_bull') {
      // 8. BLACK BULL: Demonic armored dark rammer
      // Piece 1: Horned Matte-Black Heavy Ram Prow
      const prow = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.95, 4.4), bodyMat);
      prow.position.set(0, 0.1, 0.2);
      const hornL = new THREE.Mesh(new THREE.ConeGeometry(0.35, 2.4, 5).rotateX(Math.PI / 2).rotateY(0.2), accentMat);
      hornL.position.set(-1.1, 0.25, 2.6);
      const hornR = new THREE.Mesh(new THREE.ConeGeometry(0.35, 2.4, 5).rotateX(Math.PI / 2).rotateY(-0.2), accentMat);
      hornR.position.set(1.1, 0.25, 2.6);
      piece1_Nose.add(prow, hornL, hornR);

      // Piece 2: Angular Stealth Cockpit
      const canopy = new THREE.Mesh(new THREE.ConeGeometry(0.85, 2.2, 4).rotateX(Math.PI / 2), cockpitMat);
      canopy.position.set(0, 0.65, 0.3);
      piece2_Cockpit.add(canopy);

      // Piece 3: Spiked Heavy Shields & Devil Fins
      const shieldL = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.8, 3.8), bodyMat);
      shieldL.position.set(-1.7, 0.1, -0.2);
      const finL = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.4, 1.2), accentMat);
      finL.position.set(-1.0, 0.85, -1.4);
      finL.rotation.z = -0.2;

      const shieldR = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.8, 3.8), bodyMat);
      shieldR.position.set(1.7, 0.1, -0.2);
      const finR = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.4, 1.2), accentMat);
      finR.position.set(1.0, 0.85, -1.4);
      finR.rotation.z = 0.2;
      piece3_Wings.add(shieldL, finL, shieldR, finR);

      // Piece 4: Dual Colossal Dark-Matter Nozzles
      const engL = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.55, 1.8, 8).rotateX(Math.PI / 2), darkMetalMat);
      engL.position.set(-0.8, 0.1, -1.9);
      const engR = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.55, 1.8, 8).rotateX(Math.PI / 2), darkMetalMat);
      engR.position.set(0.8, 0.1, -1.9);
      piece4_Engines.add(engL, engR);

      const plumeGeo = new THREE.ConeGeometry(0.48, 2.2, 8).rotateX(-Math.PI / 2);
      const pL = new THREE.Mesh(plumeGeo, glowMat);
      pL.position.set(-0.8, 0.1, -2.8);
      const pR = new THREE.Mesh(plumeGeo, glowMat);
      pR.position.set(0.8, 0.1, -2.8);
      piece4_Engines.add(pL, pR);
      this.thrusterPlumes.push(pL, pR);

    } else if (model === 'blood_hawk') {
      // 9. BLOOD HAWK: Predatory crimson razor hawk
      // Piece 1: Crimson Hawk Beak Prow
      const beak = new THREE.Mesh(new THREE.ConeGeometry(1.2, 5.2, 4).rotateX(Math.PI / 2).scale(1.0, 0.45, 1.1), bodyMat);
      beak.position.set(0, 0.05, 0.6);
      const teethL = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.1, 1.2).rotateY(0.2), accentMat);
      teethL.position.set(-0.65, -0.05, 1.6);
      const teethR = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.1, 1.2).rotateY(-0.2), accentMat);
      teethR.position.set(0.65, -0.05, 1.6);
      piece1_Nose.add(beak, teethL, teethR);

      // Piece 2: Obsidian Visor with Crimson Glow Frame
      const canopy = new THREE.Mesh(new THREE.SphereGeometry(0.68, 10, 8).scale(0.75, 0.45, 1.7), cockpitMat);
      canopy.position.set(0, 0.38, 0.3);
      piece2_Cockpit.add(canopy);

      // Piece 3: Inverted Forward-Swept Gull Wings & Tailfins
      const wingL = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.12, 1.7).rotateY(-0.2), bodyMat);
      wingL.position.set(-1.8, 0.08, -0.5);
      wingL.rotation.z = -0.12;
      const finL = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.3, 1.3), accentMat);
      finL.position.set(-1.15, 0.75, -1.3);

      const wingR = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.12, 1.7).rotateY(0.2), bodyMat);
      wingR.position.set(1.8, 0.08, -0.5);
      wingR.rotation.z = 0.12;
      const finR = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.3, 1.3), accentMat);
      finR.position.set(1.15, 0.75, -1.3);
      piece3_Wings.add(wingL, finL, wingR, finR);

      // Piece 4: Twin Crimson Plasma Boosters
      const engL = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.46, 1.7, 8).rotateX(Math.PI / 2), darkMetalMat);
      engL.position.set(-0.65, 0, -1.8);
      const engR = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.46, 1.7, 8).rotateX(Math.PI / 2), darkMetalMat);
      engR.position.set(0.65, 0, -1.8);
      piece4_Engines.add(engL, engR);

      const plumeGeo = new THREE.ConeGeometry(0.4, 2.0, 8).rotateX(-Math.PI / 2);
      const pL = new THREE.Mesh(plumeGeo, glowMat);
      pL.position.set(-0.65, 0, -2.6);
      const pR = new THREE.Mesh(plumeGeo, glowMat);
      pR.position.set(0.65, 0, -2.6);
      piece4_Engines.add(pL, pR);
      this.thrusterPlumes.push(pL, pR);

    } else {
      // 10. BLUE FALCON / DEFAULT INTERCEPTOR
      // Piece 1: Iconic Dart Fuselage & Intakes
      const bodyGeo = new THREE.ConeGeometry(1.25, 5.0, 5);
      bodyGeo.rotateX(Math.PI / 2);
      bodyGeo.scale(1.15, 0.45, 1.0);
      const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
      bodyMesh.position.set(0, 0, 0.4);
      const intakeL = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.25, 1.4), darkMetalMat);
      intakeL.position.set(-0.8, -0.05, 0.8);
      const intakeR = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.25, 1.4), darkMetalMat);
      intakeR.position.set(0.8, -0.05, 0.8);
      piece1_Nose.add(bodyMesh, intakeL, intakeR);

      // Piece 2: Sleek Bubble Canopy & Spine
      const canopy = new THREE.Mesh(new THREE.SphereGeometry(0.7, 10, 8).scale(0.8, 0.45, 1.8), cockpitMat);
      canopy.position.set(0, 0.35, 0.3);
      const crest = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.18, 1.4), accentMat);
      crest.position.set(0, 0.52, 0.2);
      piece2_Cockpit.add(canopy, crest);

      // Piece 3: Swept Delta Wings + Outrigger Pods + Vertical Fins
      const wingL = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.12, 1.8).rotateY(0.2), accentMat);
      wingL.position.set(-1.8, 0, -0.6);
      wingL.rotation.z = 0.1;
      const podL = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.35, 1.6), darkMetalMat);
      podL.position.set(-2.8, 0.05, -0.4);
      const finL = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.2, 1.4), accentMat);
      finL.position.set(-1.1, 0.7, -1.2);
      finL.rotation.z = -0.25;

      const wingR = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.12, 1.8).rotateY(-0.2), accentMat);
      wingR.position.set(1.8, 0, -0.6);
      wingR.rotation.z = -0.1;
      const podR = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.35, 1.6), darkMetalMat);
      podR.position.set(2.8, 0.05, -0.4);
      const finR = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.2, 1.4), accentMat);
      finR.position.set(1.1, 0.7, -1.2);
      finR.rotation.z = 0.25;
      piece3_Wings.add(wingL, podL, finL, wingR, podR, finR);

      // Piece 4: Twin Titanium Jet Turbines
      const engL = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 1.8, 8).rotateX(Math.PI / 2), darkMetalMat);
      engL.position.set(-0.65, 0, -1.8);
      const engR = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 1.8, 8).rotateX(Math.PI / 2), darkMetalMat);
      engR.position.set(0.65, 0, -1.8);
      piece4_Engines.add(engL, engR);

      const plumeGeo = new THREE.ConeGeometry(0.38, 1.8, 8).rotateX(-Math.PI / 2);
      const pL = new THREE.Mesh(plumeGeo, glowMat);
      pL.position.set(-0.65, 0, -2.6);
      const pR = new THREE.Mesh(plumeGeo, glowMat);
      pR.position.set(0.65, 0, -2.6);
      piece4_Engines.add(pL, pR);
      this.thrusterPlumes.push(pL, pR);
    }

    // Assemble all 4 Pieces into the ship
    ship.add(piece1_Nose);
    ship.add(piece2_Cockpit);
    ship.add(piece3_Wings);
    ship.add(piece4_Engines);

    return ship;
  }

  public update(
    dt: number,
    input: {
      forward: boolean;     // X segurado
      backward: boolean;    // Space (Freio)
      left: boolean;        // Seta Esquerda
      right: boolean;       // Seta Direita
      tiltLeft?: boolean;   // Z (Inclina pra esquerda)
      tiltRight?: boolean;  // C (Inclina pra direita)
      drift?: boolean;      // Space (Break / Drift)
      boost: boolean;       // A (Boost)
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

    // Boost Handling (A button - Requires Lap 2+)
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

    // Side Attack Handling (Double-tap Z / C)
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

    // Spin Attack Handling (F-Zero X Whirl - Z + C together or Shift)
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

    // Acceleration & Braking (X held accelerates, Space brakes / drifts)
    const maxSpeedCurrent = this.isBoosting
      ? this.effectiveMaxSpeed * this.config.boostMultiplier
      : this.effectiveMaxSpeed;

    const isBrakingOrDrifting = !!(input.backward || input.drift);

    if (isBrakingOrDrifting) {
      this.speed = Math.max(this.speed - this.effectiveAcceleration * 2.2 * dt, 0);
    } else if (input.forward) {
      const accel = this.isBoosting ? this.effectiveAcceleration * 1.85 : this.effectiveAcceleration;
      this.speed = this.speed > maxSpeedCurrent
        ? Math.max(maxSpeedCurrent, this.speed - 24 * dt)
        : Math.min(this.speed + accel * dt, maxSpeedCurrent);
    } else {
      // Atmospheric drag when X is not held
      this.speed = Math.max(this.speed - 24 * dt, 0);
    }

    // 1. Steering from Arrow Keys (Apenas as setas movem a nave)
    let steerDir = 0;
    if (input.left) steerDir -= 1;
    if (input.right) steerDir += 1;

    // 2. Leaning / Strafing from Z and C keys
    let tiltDir = 0;
    if (input.tiltLeft) tiltDir -= 1;
    if (input.tiltRight) tiltDir += 1;

    // Drift Detection (Space held + steering)
    const isDrifting = isBrakingOrDrifting && steerDir !== 0;

    // Lateral Force calculation
    const steerForce = steerDir * this.config.handling * (0.38 + (this.speed / this.effectiveMaxSpeed) * 0.62);
    const tiltForce = tiltDir * this.config.handling * 0.85;
    this.lateralVelocity += (steerForce + tiltForce) * dt;

    // Lateral friction / Grip (Drift reduces grip to allow power-sliding)
    if (isDrifting) {
      const driftGrip = Math.max(this.gripFactor * 0.35, 0.008);
      this.lateralVelocity *= Math.pow(driftGrip, dt);
      if (this.speed > 50) {
        this.combat.spawnSparks(this.group.position, 2, 0x00f0ff);
      }
    } else {
      this.lateralVelocity *= Math.pow(this.gripFactor, dt);
    }

    this.lateralOffset += this.lateralVelocity * dt;

    // Track boundary guardrail collision
    const halfWidth = this.track.trackWidth / 2 - 1.2;
    if (Math.abs(this.lateralOffset) > halfWidth) {
      this.lateralOffset = Math.sign(this.lateralOffset) * halfWidth;
      this.lateralVelocity = -this.lateralVelocity * 0.45;
      this.speed = Math.max(this.speed - 120 * dt, 0);
      this.takeDamage(18 * dt, false);
      this.combat.spawnSparks(this.group.position, 12, 0x00f0ff);
      if (!this.config.isAI) {
        this.audio.playImpact();
      }
    }
    if (this.isDestroyed) return;

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
    for (const [index, pad] of this.track.boostPads.entries()) {
      const tDiff = Math.abs(this.progressT - pad.t);
      const overlapping = Math.min(tDiff, 1 - tDiff) * trackLen <= pad.length / 2;
      const crossed = ((pad.t - prevT + 1) % 1) <= deltaT;
      if (!this.activePads.has(index) && (overlapping || crossed)) {
        const offsetDiff = Math.abs(this.lateralOffset - pad.offset);
        if (offsetDiff < pad.width / 2 + 1.2) {
          this.speed = Math.min(this.speed + 95, this.effectiveMaxSpeed * this.config.boostMultiplier);
          this.combat.spawnSparks(this.group.position, 18, 0xffaa00);
          if (!this.config.isAI) {
            this.audio.playDashPlate();
          }
        }
      }
      if (overlapping && Math.abs(this.lateralOffset - pad.offset) < pad.width / 2 + 1.2) this.activePads.add(index);
      else this.activePads.delete(index);
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
    this.updateTransform(dt, steerDir, tiltDir, isDrifting);

    // Audio Engine pitch for player
    if (!this.config.isAI) {
      const speedKmH = this.getSpeedKmH();
      this.audio.updateEnginePitch(speedKmH, this.isBoosting);
      if (this.shield < 22 && Math.random() < 0.05) {
        this.audio.playLowEnergyAlarm();
      }
    }
  }

  public updateTransform(dt: number, steerDir: number, tiltDir = 0, isDrifting = false): void {
    const info = this.track.getTrackInfoAt(this.progressT);

    const hoverHeight = 1.35;
    const pos = info.position.clone()
      // Local +X in a +Z-forward model is screen-left from the chase camera.
      .add(info.binormal.clone().multiplyScalar(-this.lateralOffset))
      .add(info.normal.clone().multiplyScalar(hoverHeight));

    this.group.position.copy(pos);

    // Roll banking based on turning (Arrows) and tilting (Z/C) or side attack
    let targetRoll = steerDir * 0.42 + tiltDir * 0.52;
    if (this.isSideAttacking) {
      targetRoll = this.sideAttackDir * 0.65;
    }
    this.currentRoll = THREE.MathUtils.lerp(this.currentRoll, targetRoll, Math.min(dt * 12, 1));

    // Align ship with track surface Frenet frame
    const rotMatrix = new THREE.Matrix4().makeBasis(info.binormal, info.normal, info.tangent);
    this.group.quaternion.setFromRotationMatrix(rotMatrix);

    // Apply banking roll to mesh + spin attack / drift yaw
    this.craftMesh.rotation.z = this.currentRoll;
    if (this.isSpinAttacking) {
      this.craftMesh.rotation.y = this.spinAttackRotation;
    } else if (isDrifting) {
      // Deeper drift yaw slip angle
      this.craftMesh.rotation.y = -steerDir * 0.38;
    } else {
      this.craftMesh.rotation.y = -steerDir * 0.16 - tiltDir * 0.08;
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
    this.takeDamage(10, false); // Body reduction is applied once by takeDamage.
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
    if (this.isDestroyed || this.isSideAttacking || this.isSpinAttacking) return;
    this.attackSerial++;
    this.isSideAttacking = true;
    this.sideAttackDir = dir;
    this.sideAttackTimer = 0.35;
    this.combat.spawnSparks(this.group.position, 22, 0xff0055);
    if (!this.config.isAI) {
      this.audio.playImpact();
    }
  }

  public triggerSpinAttack(): void {
    if (this.isDestroyed || this.isSideAttacking || this.isSpinAttacking) return;
    this.attackSerial++;
    this.isSpinAttacking = true;
    this.spinAttackTimer = 0.48;
    this.spinAttackRotation = 0;
    this.combat.spawnSparks(this.group.position, 36, 0x00f0ff);
    if (!this.config.isAI) {
      this.audio.playSpinAttack();
    }
  }

  public takeDamage(amount: number, flash = true): void {
    if (this.isDestroyed) return;
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
    if (this.isDestroyed) return;
    this.isDestroyed = true;
    this.isBoosting = this.isSideAttacking = this.isSpinAttacking = false;
    this.boostDurationRemaining = this.sideAttackTimer = this.spinAttackTimer = 0;
    this.spinAttackRotation = this.currentRoll = 0;
    this.activePads.clear();
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
    this.updateTransform(0, 0);
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
    if (this.canBoost() && this.shield > 60 && Math.random() < 1 - Math.pow(1 - 0.012, _dt * 60)) {
      inputState.boost = true;
    }

    // AI combat maneuvers only on Lap 2+ in rare tactical moments
    inputState.sideAttack = 0;
    inputState.spinAttack = false;
  }

  public getSpeedKmH(): number {
    return Math.round(this.speed * 6.8);
  }
}
