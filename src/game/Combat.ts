import * as THREE from 'three';

export interface Laser {
  mesh: THREE.Mesh;
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  ownerId: string;
  damage: number;
  life: number;
  maxLife: number;
}

export interface SparkParticle {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  life: number;
  maxLife: number;
  color: THREE.Color;
}

export class CombatSystem {
  private scene: THREE.Scene;
  public lasers: Laser[] = [];
  private laserGeo: THREE.BufferGeometry;
  private laserMatPlayer: THREE.MeshBasicMaterial;
  private laserMatRival: THREE.MeshBasicMaterial;

  // Particle System
  private particleCount = 200;
  private particleGeo: THREE.BufferGeometry;
  private particleMat: THREE.PointsMaterial;
  private particlePositions: Float32Array;
  private particleColors: Float32Array;
  private particlePoints: THREE.Points;
  private activeSparks: SparkParticle[] = [];

  constructor(scene: THREE.Scene) {
    this.scene = scene;

    // Laser visuals
    this.laserGeo = new THREE.CylinderGeometry(0.18, 0.18, 3.5, 6);
    this.laserGeo.rotateX(Math.PI / 2);
    this.laserMatPlayer = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
    this.laserMatRival = new THREE.MeshBasicMaterial({ color: 0xff0055 });

    // Sparks / Explosions
    this.particleGeo = new THREE.BufferGeometry();
    this.particlePositions = new Float32Array(this.particleCount * 3);
    this.particleColors = new Float32Array(this.particleCount * 3);

    this.particleGeo.setAttribute('position', new THREE.BufferAttribute(this.particlePositions, 3));
    this.particleGeo.setAttribute('color', new THREE.BufferAttribute(this.particleColors, 3));

    this.particleMat = new THREE.PointsMaterial({
      size: 1.2,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.particlePoints = new THREE.Points(this.particleGeo, this.particleMat);
    this.scene.add(this.particlePoints);
  }

  public fireLaser(
    origin: THREE.Vector3,
    direction: THREE.Vector3,
    baseVelocity: THREE.Vector3,
    ownerId: string
  ): void {
    const isPlayer = ownerId === 'player';
    const mesh = new THREE.Mesh(this.laserGeo, isPlayer ? this.laserMatPlayer : this.laserMatRival);
    mesh.position.copy(origin);
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), direction);

    const laserSpeed = 380; // Fast plasma bolt
    const vel = direction.clone().multiplyScalar(laserSpeed).add(baseVelocity.clone().multiplyScalar(0.3));

    this.scene.add(mesh);

    this.lasers.push({
      mesh,
      position: origin.clone(),
      velocity: vel,
      ownerId,
      damage: 18,
      life: 0,
      maxLife: 1.2
    });
  }

  public spawnSparks(origin: THREE.Vector3, count: number, colorHex: number = 0x00f0ff): void {
    const baseColor = new THREE.Color(colorHex);
    for (let i = 0; i < count; i++) {
      if (this.activeSparks.length >= this.particleCount) {
        this.activeSparks.shift();
      }

      const vel = new THREE.Vector3(
        (Math.random() - 0.5) * 45,
        (Math.random() - 0.5) * 45,
        (Math.random() - 0.5) * 45
      );

      this.activeSparks.push({
        position: origin.clone(),
        velocity: vel,
        life: 0,
        maxLife: 0.3 + Math.random() * 0.4,
        color: baseColor
      });
    }
  }

  public spawnExplosion(origin: THREE.Vector3): void {
    // Large cyber burst
    this.spawnSparks(origin, 60, 0xff0055);
    this.spawnSparks(origin, 40, 0xffaa00);
    this.spawnSparks(origin, 20, 0x00f0ff);
  }

  public update(dt: number): void {
    // Update Lasers
    for (let i = this.lasers.length - 1; i >= 0; i--) {
      const laser = this.lasers[i];
      laser.life += dt;

      if (laser.life >= laser.maxLife) {
        this.scene.remove(laser.mesh);
        this.lasers.splice(i, 1);
        continue;
      }

      laser.position.addScaledVector(laser.velocity, dt);
      laser.mesh.position.copy(laser.position);
    }

    // Update Particles
    for (let i = this.activeSparks.length - 1; i >= 0; i--) {
      const p = this.activeSparks[i];
      p.life += dt;

      if (p.life >= p.maxLife) {
        this.activeSparks.splice(i, 1);
        continue;
      }

      p.position.addScaledVector(p.velocity, dt);
    }

    // Write back to Points buffer
    for (let i = 0; i < this.particleCount; i++) {
      if (i < this.activeSparks.length) {
        const p = this.activeSparks[i];
        const alpha = 1 - p.life / p.maxLife;

        this.particlePositions[i * 3] = p.position.x;
        this.particlePositions[i * 3 + 1] = p.position.y;
        this.particlePositions[i * 3 + 2] = p.position.z;

        this.particleColors[i * 3] = p.color.r * alpha;
        this.particleColors[i * 3 + 1] = p.color.g * alpha;
        this.particleColors[i * 3 + 2] = p.color.b * alpha;
      } else {
        this.particlePositions[i * 3] = 0;
        this.particlePositions[i * 3 + 1] = -9999;
        this.particlePositions[i * 3 + 2] = 0;
      }
    }

    this.particleGeo.attributes.position.needsUpdate = true;
    this.particleGeo.attributes.color.needsUpdate = true;
  }

  public removeLaser(index: number): void {
    if (this.lasers[index]) {
      this.scene.remove(this.lasers[index].mesh);
      this.lasers.splice(index, 1);
    }
  }
}
