import * as THREE from 'three';

export interface TrackPointInfo {
  position: THREE.Vector3;
  tangent: THREE.Vector3;
  normal: THREE.Vector3;
  binormal: THREE.Vector3;
}

export interface BoostPad {
  t: number; // Position along curve [0, 1]
  offset: number; // Lateral offset [-trackWidth/2, trackWidth/2]
  width: number;
  length: number;
  mesh: THREE.Mesh;
}

export interface PitZone {
  tStart: number;
  tEnd: number;
  offsetMin: number;
  offsetMax: number;
}

export class Track {
  public curve: THREE.CatmullRomCurve3;
  public trackWidth = 26;
  public trackMesh: THREE.Mesh;
  public railsGroup: THREE.Group;
  public sceneryGroup: THREE.Group;
  public boostPads: BoostPad[] = [];
  public pitZones: PitZone[] = [];

  private sampledPoints = 300;
  private trackLength = 0;

  constructor(scene: THREE.Scene) {
    // Define a thrilling sci-fi circuit with smooth continuous flow
    const controlPoints = [
      new THREE.Vector3(0, 5, 0),         // 0: Start / Finish Line
      new THREE.Vector3(0, 5, 300),       // 1: Main straightaway
      new THREE.Vector3(0, 5, 600),       // 2: Straightaway extension
      new THREE.Vector3(120, 25, 800),    // 3: Rising bank right
      new THREE.Vector3(350, 45, 850),    // 4: High elevation apex turn
      new THREE.Vector3(550, 35, 700),    // 5: Downhill sweeping right
      new THREE.Vector3(600, 20, 350),    // 6: Wide right sweep
      new THREE.Vector3(580, 15, 0),      // 7: High-speed section
      new THREE.Vector3(480, 25, -300),   // 8: Back straight right
      new THREE.Vector3(300, 40, -550),   // 9: Crest turn
      new THREE.Vector3(100, 30, -700),   // 10: Deep banked turn
      new THREE.Vector3(-150, 20, -700),  // 11: Bottom curve apex
      new THREE.Vector3(-350, 15, -550),  // 12: Left sweep ascent
      new THREE.Vector3(-480, 20, -300),  // 13: Left side straight
      new THREE.Vector3(-500, 25, 0),     // 14: S-curve entrance
      new THREE.Vector3(-420, 20, 300),   // 15: Crest chicane
      new THREE.Vector3(-250, 15, 100),   // 16: Chicane mid
      new THREE.Vector3(-180, 10, -200),  // 17: Entry to final turn
      new THREE.Vector3(-100, 5, -450),   // 18: Turn into final straight
      new THREE.Vector3(0, 5, -450),      // 19: Aligned at bottom
      new THREE.Vector3(0, 5, -250),      // 20: Pre-finish straight
    ];

    this.curve = new THREE.CatmullRomCurve3(controlPoints, true, 'centripetal', 0.5);
    this.trackLength = this.curve.getLength();

    this.railsGroup = new THREE.Group();
    this.sceneryGroup = new THREE.Group();

    this.trackMesh = this.generateTrackGeometry();
    scene.add(this.trackMesh);
    scene.add(this.railsGroup);
    scene.add(this.sceneryGroup);

    this.setupBoostPads(scene);
    this.setupPitZone(scene);
    this.generateScenery(scene);
  }

  private generateTrackGeometry(): THREE.Mesh {
    const segments = this.sampledPoints;
    const geometry = new THREE.BufferGeometry();
    const vertices: number[] = [];
    const uvs: number[] = [];
    const colors: number[] = [];
    const indices: number[] = [];

    const halfWidth = this.trackWidth / 2;

    const leftRailPoints: THREE.Vector3[] = [];
    const rightRailPoints: THREE.Vector3[] = [];

    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const pt = this.curve.getPointAt(t);
      const tangent = this.curve.getTangentAt(t).normalize();
      
      // Pure right-handed orthonormal SO(3) basis:
      const up = new THREE.Vector3(0, 1, 0);
      const dot = up.dot(tangent);
      const normal = up.clone().sub(tangent.clone().multiplyScalar(dot)).normalize();
      const binormal = new THREE.Vector3().crossVectors(normal, tangent).normalize();

      // Left edge & Right edge
      const leftPt = pt.clone().add(binormal.clone().multiplyScalar(-halfWidth));
      const rightPt = pt.clone().add(binormal.clone().multiplyScalar(halfWidth));

      vertices.push(leftPt.x, leftPt.y, leftPt.z);
      vertices.push(rightPt.x, rightPt.y, rightPt.z);

      uvs.push(0, t * 40);
      uvs.push(1, t * 40);

      // Track surface dark metallic grid tone
      colors.push(0.05, 0.08, 0.14);
      colors.push(0.05, 0.08, 0.14);

      leftRailPoints.push(leftPt.clone().add(normal.clone().multiplyScalar(0.7)));
      rightRailPoints.push(rightPt.clone().add(normal.clone().multiplyScalar(0.7)));

      if (i < segments) {
        const row1 = i * 2;
        const row2 = (i + 1) * 2;
        // Two triangles for the quad
        indices.push(row1, row1 + 1, row2);
        indices.push(row1 + 1, row2 + 1, row2);
      }
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();

    // Sci-fi track shader texture / grid effect
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#0a0e1c';
    ctx.fillRect(0, 0, 256, 256);
    // Center neon racing dashed line
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 8;
    ctx.setLineDash([40, 40]);
    ctx.beginPath();
    ctx.moveTo(128, 0);
    ctx.lineTo(128, 256);
    ctx.stroke();

    // Side grid lines
    ctx.strokeStyle = '#182440';
    ctx.lineWidth = 2;
    ctx.setLineDash([]);
    for (let x = 32; x < 256; x += 32) {
      if (x === 128) continue;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 256);
      ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(1, 40);

    const material = new THREE.MeshStandardMaterial({
      map: texture,
      roughness: 0.35,
      metalness: 0.8,
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.receiveShadow = true;

    // Build glowing neon edge guardrails
    this.createGuardrails(leftRailPoints, rightRailPoints);

    return mesh;
  }

  private createGuardrails(leftPts: THREE.Vector3[], rightPts: THREE.Vector3[]): void {
    const railMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      wireframe: false,
    });

    const leftCurve = new THREE.CatmullRomCurve3(leftPts, true);
    const rightCurve = new THREE.CatmullRomCurve3(rightPts, true);

    const railGeoLeft = new THREE.TubeGeometry(leftCurve, 200, 0.45, 6, true);
    const railGeoRight = new THREE.TubeGeometry(rightCurve, 200, 0.45, 6, true);

    const leftMesh = new THREE.Mesh(railGeoLeft, railMat);
    const rightMesh = new THREE.Mesh(railGeoRight, railMat);

    this.railsGroup.add(leftMesh);
    this.railsGroup.add(rightMesh);
  }

  private setupBoostPads(scene: THREE.Scene): void {
    // Specific locations along the circuit
    const padLocations = [
      { t: 0.08, offset: 0 },
      { t: 0.28, offset: -4 },
      { t: 0.52, offset: 3 },
      { t: 0.72, offset: 0 },
      { t: 0.88, offset: -3 }
    ];

    const padMat = new THREE.MeshBasicMaterial({
      color: 0xffaa00,
      side: THREE.DoubleSide
    });

    for (const loc of padLocations) {
      const geo = new THREE.PlaneGeometry(6, 12);
      geo.rotateX(-Math.PI / 2);
      const mesh = new THREE.Mesh(geo, padMat);

      const info = this.getTrackInfoAt(loc.t);
      const pos = info.position.clone()
        .add(info.binormal.clone().multiplyScalar(loc.offset))
        .add(info.normal.clone().multiplyScalar(0.1));

      mesh.position.copy(pos);
      mesh.quaternion.setFromRotationMatrix(
        new THREE.Matrix4().makeBasis(info.binormal, info.normal, info.tangent)
      );

      scene.add(mesh);

      this.boostPads.push({
        t: loc.t,
        offset: loc.offset,
        width: 6,
        length: 12,
        mesh
      });
    }
  }

  private setupPitZone(scene: THREE.Scene): void {
    // Pit zone from t = 0.94 to t = 1.0 (right side of track before finish line)
    this.pitZones.push({
      tStart: 0.93,
      tEnd: 0.99,
      offsetMin: 4,
      offsetMax: 11
    });

    // Create glowing emerald green recharge lane visual
    const pitPts: THREE.Vector3[] = [];
    const steps = 30;
    for (let i = 0; i <= steps; i++) {
      const t = 0.93 + (i / steps) * (0.99 - 0.93);
      const info = this.getTrackInfoAt(t);
      const p = info.position.clone()
        .add(info.binormal.clone().multiplyScalar(7.5))
        .add(info.normal.clone().multiplyScalar(0.08));
      pitPts.push(p);
    }

    const pitCurve = new THREE.CatmullRomCurve3(pitPts);
    const pitGeo = new THREE.TubeGeometry(pitCurve, 30, 2.8, 4, false);
    const pitMat = new THREE.MeshBasicMaterial({
      color: 0x00ff88,
      transparent: true,
      opacity: 0.7
    });
    const pitMesh = new THREE.Mesh(pitGeo, pitMat);
    scene.add(pitMesh);
  }

  private generateScenery(scene: THREE.Scene): void {
    // Sci-Fi futuristic mega-structures, light rings, and neon monoliths
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xff0055, wireframe: true });
    for (let t = 0.15; t < 0.95; t += 0.18) {
      const info = this.getTrackInfoAt(t);
      const ringGeo = new THREE.TorusGeometry(20, 0.4, 8, 24);
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.position.copy(info.position);
      ringMesh.quaternion.setFromRotationMatrix(
        new THREE.Matrix4().makeBasis(info.binormal, info.normal, info.tangent)
      );
      this.sceneryGroup.add(ringMesh);
    }

    // Distant cyber towers in the background
    const towerMat = new THREE.MeshStandardMaterial({
      color: 0x0c1322,
      roughness: 0.5,
      metalness: 0.8
    });

    for (let i = 0; i < 40; i++) {
      const height = 150 + Math.random() * 350;
      const width = 20 + Math.random() * 30;
      const towerGeo = new THREE.BoxGeometry(width, height, width);
      const tower = new THREE.Mesh(towerGeo, towerMat);
      
      const angle = Math.random() * Math.PI * 2;
      const radius = 600 + Math.random() * 800;
      tower.position.set(
        Math.cos(angle) * radius,
        height / 2 - 50,
        Math.sin(angle) * radius
      );
      this.sceneryGroup.add(tower);
    }

    // Start / Finish Line Banner Arch
    const startInfo = this.getTrackInfoAt(0);
    const archMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const archGeo = new THREE.BoxGeometry(this.trackWidth + 6, 2, 2);
    const archMesh = new THREE.Mesh(archGeo, archMat);
    archMesh.position.copy(startInfo.position).add(startInfo.normal.clone().multiplyScalar(10));
    archMesh.quaternion.setFromRotationMatrix(
      new THREE.Matrix4().makeBasis(startInfo.binormal, startInfo.normal, startInfo.tangent)
    );
    this.sceneryGroup.add(archMesh);
  }

  public getTrackInfoAt(t: number): TrackPointInfo {
    // Ensure t is wrapped in [0, 1)
    let wrappedT = t % 1;
    if (wrappedT < 0) wrappedT += 1;

    const position = this.curve.getPointAt(wrappedT);
    const tangent = this.curve.getTangentAt(wrappedT).normalize();
    
    // Pure right-handed orthonormal SO(3) basis:
    // 1. Tangent = Forward (+Z)
    // 2. Normal = Projected UP orthogonal to Tangent (+Y)
    // 3. Binormal = Cross(Normal, Tangent) = Right (+X)
    // Determinant is identically +1.000000 across the whole track!
    const up = new THREE.Vector3(0, 1, 0);
    const dot = up.dot(tangent);
    const normal = up.clone().sub(tangent.clone().multiplyScalar(dot)).normalize();
    const binormal = new THREE.Vector3().crossVectors(normal, tangent).normalize();

    return { position, tangent, normal, binormal };
  }

  public getTrackLength(): number {
    return this.trackLength;
  }
}
