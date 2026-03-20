import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { CellType } from '../../types';

// 道路邻接信息：上下左右是否有相邻道路
export interface RoadConnections {
  north: boolean; // -Z 方向
  south: boolean; // +Z 方向
  east: boolean;  // +X 方向
  west: boolean;  // -X 方向
}

// 建筑群组上下文：同类邻接 + 朝向
export interface BuildingContext {
  // 同类型建筑邻接（用于合并渲染）
  sameType: { north: boolean; south: boolean; east: boolean; west: boolean };
  // 入口朝向角度（弧度，0=南/+Z，π/2=西，π=北，-π/2=东）
  facingAngle: number;
}

type BuildingModelProps = {
  type: CellType;
  roadConnections?: RoadConnections;
  buildingContext?: BuildingContext;
};

const S = {
  castShadow: true,
  receiveShadow: true,
} as const;

// ─── 道路常量 ───
const MARK_COLOR = '#f0ebe3';
const CURB_COLOR = '#9e9688';
const ROAD_COLOR = '#b0a89e';
const MARK_Y = 0.066;

// ─── 烟雾粒子组件 ───
function SmokeParticles({ position }: { position: [number, number, number] }) {
  const COUNT = 6;
  const ref = useRef<THREE.Group>(null);
  // 为每个粒子生成随机偏移和速度种子
  const seeds = useMemo(
    () =>
      Array.from({ length: COUNT }, (_, i) => ({
        offsetX: (Math.random() - 0.5) * 0.06,
        offsetZ: (Math.random() - 0.5) * 0.06,
        speed: 0.12 + Math.random() * 0.08,
        phase: (i / COUNT) * Math.PI * 2, // 均匀分布相位
        scale: 0.03 + Math.random() * 0.025,
      })),
    [],
  );

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    ref.current.children.forEach((child, i) => {
      const seed = seeds[i];
      // 循环上升动画
      const progress = ((t * seed.speed + seed.phase) % 1);
      child.position.set(
        seed.offsetX + Math.sin(t * 0.5 + seed.phase) * 0.02,
        progress * 0.4,
        seed.offsetZ + Math.cos(t * 0.3 + seed.phase) * 0.02,
      );
      // 上升时逐渐变大变淡
      const s = seed.scale * (1 + progress * 2);
      child.scale.set(s, s, s);
      const mat = (child as THREE.Mesh).material as THREE.MeshBasicMaterial;
      mat.opacity = 0.4 * (1 - progress);
    });
  });

  return (
    <group ref={ref} position={position}>
      {seeds.map((_seed, i) => (
        <mesh key={i}>
          <sphereGeometry args={[1, 6, 6]} />
          <meshBasicMaterial
            color="#c8c0b8"
            transparent
            opacity={0.3}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
}

// ─── 智能道路模型 ───
function RoadModel({ connections }: { connections: RoadConnections }) {
  const { north, south, east, west } = connections;
  const connected = [north, south, east, west].filter(Boolean).length;

  return (
    <group position={[0, 0.06, 0]}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[1.04, 0.12, 1.04]} />
        <meshStandardMaterial color={ROAD_COLOR} roughness={0.92} />
      </mesh>
      {north && (
        <mesh position={[0, MARK_Y, -0.26]}>
          <boxGeometry args={[0.07, 0.008, 0.28]} />
          <meshStandardMaterial color={MARK_COLOR} roughness={0.5} />
        </mesh>
      )}
      {south && (
        <mesh position={[0, MARK_Y, 0.26]}>
          <boxGeometry args={[0.07, 0.008, 0.28]} />
          <meshStandardMaterial color={MARK_COLOR} roughness={0.5} />
        </mesh>
      )}
      {west && (
        <mesh position={[-0.26, MARK_Y, 0]}>
          <boxGeometry args={[0.28, 0.008, 0.07]} />
          <meshStandardMaterial color={MARK_COLOR} roughness={0.5} />
        </mesh>
      )}
      {east && (
        <mesh position={[0.26, MARK_Y, 0]}>
          <boxGeometry args={[0.28, 0.008, 0.07]} />
          <meshStandardMaterial color={MARK_COLOR} roughness={0.5} />
        </mesh>
      )}
      {connected >= 2 && (
        <mesh position={[0, MARK_Y, 0]}>
          <boxGeometry args={[0.12, 0.008, 0.12]} />
          <meshStandardMaterial color={MARK_COLOR} roughness={0.5} />
        </mesh>
      )}
      {connected === 0 && (
        <mesh position={[0, MARK_Y, 0]}>
          <cylinderGeometry args={[0.08, 0.08, 0.008, 8]} />
          <meshStandardMaterial color={MARK_COLOR} roughness={0.5} />
        </mesh>
      )}
      {connected === 1 && (
        <mesh position={[0, MARK_Y, 0]}>
          <boxGeometry args={[0.09, 0.008, 0.09]} />
          <meshStandardMaterial color={MARK_COLOR} roughness={0.5} />
        </mesh>
      )}
      {!north && (
        <mesh position={[0, 0.065, -0.48]}>
          <boxGeometry args={[1.04, 0.05, 0.06]} />
          <meshStandardMaterial color={CURB_COLOR} roughness={0.95} />
        </mesh>
      )}
      {!south && (
        <mesh position={[0, 0.065, 0.48]}>
          <boxGeometry args={[1.04, 0.05, 0.06]} />
          <meshStandardMaterial color={CURB_COLOR} roughness={0.95} />
        </mesh>
      )}
      {!east && (
        <mesh position={[0.48, 0.065, 0]}>
          <boxGeometry args={[0.06, 0.05, 1.04]} />
          <meshStandardMaterial color={CURB_COLOR} roughness={0.95} />
        </mesh>
      )}
      {!west && (
        <mesh position={[-0.48, 0.065, 0]}>
          <boxGeometry args={[0.06, 0.05, 1.04]} />
          <meshStandardMaterial color={CURB_COLOR} roughness={0.95} />
        </mesh>
      )}
    </group>
  );
}

// ─── 住宅模型 ───
function ResidentialModel({ ctx }: { ctx: BuildingContext }) {
  const { sameType, facingAngle } = ctx;
  const connected = [sameType.north, sameType.south, sameType.east, sameType.west].filter(Boolean).length;
  const wallW = connected > 0 ? 0.74 : 0.64;
  const wallD = connected > 0 ? 0.68 : 0.6;
  const frontZ = wallD / 2 + 0.01; // 正面元素贴在墙表面外侧

  return (
    <group position={[0, 0.12, 0]} rotation={[0, facingAngle, 0]}>
      {/* 台基 */}
      <mesh {...S} position={[0, 0.06, 0]}>
        <boxGeometry args={[0.78, 0.08, 0.72]} />
        <meshStandardMaterial color="#e8ddd0" roughness={0.98} />
      </mesh>
      {/* 墙体 */}
      <mesh {...S} position={[0, 0.42, 0]}>
        <boxGeometry args={[wallW, 0.62, wallD]} />
        <meshStandardMaterial color="#f6dcc1" roughness={0.95} />
      </mesh>
      {/* 屋顶 */}
      <mesh {...S} position={[0, 0.82, 0]} rotation={[0, Math.PI / 4, 0]}>
        <coneGeometry args={[connected > 0 ? 0.56 : 0.52, connected > 0 ? 0.3 : 0.34, 4]} />
        <meshStandardMaterial color="#cf8f69" roughness={0.88} />
      </mesh>
      {/* 屋檐 */}
      <mesh {...S} position={[0, 0.72, 0]}>
        <boxGeometry args={[connected > 0 ? 0.82 : 0.74, 0.04, connected > 0 ? 0.76 : 0.7]} />
        <meshStandardMaterial color="#d4a07a" roughness={0.9} />
      </mesh>
      {/* 正面窗户 */}
      <mesh position={[-0.15, 0.48, frontZ]}>
        <boxGeometry args={[0.12, 0.16, 0.02]} />
        <meshStandardMaterial color="#d4eaf5" roughness={0.4} metalness={0.1} />
      </mesh>
      <mesh position={[0.15, 0.48, frontZ]}>
        <boxGeometry args={[0.12, 0.16, 0.02]} />
        <meshStandardMaterial color="#d4eaf5" roughness={0.4} metalness={0.1} />
      </mesh>
      {/* 前门 */}
      <mesh position={[0, 0.28, frontZ]}>
        <boxGeometry args={[0.13, 0.26, 0.02]} />
        <meshStandardMaterial color="#a37652" roughness={0.92} />
      </mesh>
      {/* 门把手 */}
      <mesh position={[0.04, 0.28, frontZ + 0.02]}>
        <sphereGeometry args={[0.015, 6, 6]} />
        <meshStandardMaterial color="#d4b896" roughness={0.6} metalness={0.3} />
      </mesh>
      {/* 后窗 */}
      <mesh position={[0, 0.48, -frontZ]}>
        <boxGeometry args={[0.18, 0.14, 0.02]} />
        <meshStandardMaterial color="#c8dfe9" roughness={0.45} metalness={0.08} />
      </mesh>
      {/* 烟囱 */}
      <mesh {...S} position={[0.18, 0.88, -0.12]}>
        <boxGeometry args={[0.1, 0.22, 0.1]} />
        <meshStandardMaterial color="#c4a88e" roughness={0.96} />
      </mesh>
      <mesh position={[0.18, 1.0, -0.12]}>
        <boxGeometry args={[0.14, 0.03, 0.14]} />
        <meshStandardMaterial color="#b09478" roughness={0.9} />
      </mesh>
      {/* 门前台阶 */}
      <mesh receiveShadow position={[0, 0.12, frontZ + 0.06]}>
        <boxGeometry args={[0.2, 0.04, 0.1]} />
        <meshStandardMaterial color="#ddd2c4" roughness={0.98} />
      </mesh>
      {/* 侧窗 */}
      <mesh position={[wallW / 2 + 0.01, 0.48, 0.05]}>
        <boxGeometry args={[0.02, 0.14, 0.12]} />
        <meshStandardMaterial color="#d4eaf5" roughness={0.4} metalness={0.1} />
      </mesh>
      <mesh position={[-(wallW / 2 + 0.01), 0.48, -0.05]}>
        <boxGeometry args={[0.02, 0.14, 0.12]} />
        <meshStandardMaterial color="#d4eaf5" roughness={0.4} metalness={0.1} />
      </mesh>
    </group>
  );
}

// ─── 商业模型 ───
function CommercialModel({ ctx }: { ctx: BuildingContext }) {
  const { facingAngle } = ctx;
  const w = 0.74;
  const d = 0.68;
  const h = 0.72;
  const frontZ = d / 2 + 0.01;

  return (
    <group position={[0, 0.08, 0]} rotation={[0, facingAngle, 0]}>
      {/* 底座裙楼 */}
      <mesh {...S} position={[0, 0.16, 0]}>
        <boxGeometry args={[w + 0.1, 0.24, d + 0.08]} />
        <meshStandardMaterial color="#c8dce6" roughness={0.85} />
      </mesh>
      {/* 主楼体 */}
      <mesh {...S} position={[0, 0.62, 0]}>
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial color="#9fc8dc" roughness={0.78} metalness={0.06} />
      </mesh>
      {/* 屋顶平台 */}
      <mesh {...S} position={[0, 1.0, 0]}>
        <boxGeometry args={[w + 0.06, 0.04, d + 0.06]} />
        <meshStandardMaterial color="#e8f0f4" roughness={0.88} />
      </mesh>
      {/* 屋顶机房 */}
      <mesh {...S} position={[0.15, 1.1, -0.1]}>
        <boxGeometry args={[0.22, 0.14, 0.2]} />
        <meshStandardMaterial color="#b8cdd6" roughness={0.9} />
      </mesh>
      {/* 天线 */}
      <mesh position={[0.15, 1.26, -0.1]}>
        <cylinderGeometry args={[0.01, 0.01, 0.2, 6]} />
        <meshStandardMaterial color="#8a9da6" roughness={0.7} />
      </mesh>
      {/* 正面玻璃窗 三层 */}
      {[0.38, 0.58, 0.78].map((yPos) => (
        <group key={yPos}>
          <mesh position={[-w * 0.24, yPos, frontZ]}>
            <boxGeometry args={[w * 0.42, 0.12, 0.02]} />
            <meshStandardMaterial color="#daeef8" roughness={0.3} metalness={0.15} />
          </mesh>
          <mesh position={[w * 0.24, yPos, frontZ]}>
            <boxGeometry args={[w * 0.42, 0.12, 0.02]} />
            <meshStandardMaterial color="#daeef8" roughness={0.3} metalness={0.15} />
          </mesh>
        </group>
      ))}
      {/* 背面窗 两层 */}
      {[0.48, 0.72].map((yPos) => (
        <mesh key={`back-${yPos}`} position={[0, yPos, -(frontZ)]}>
          <boxGeometry args={[w * 0.6, 0.1, 0.02]} />
          <meshStandardMaterial color="#c8dde8" roughness={0.4} metalness={0.1} />
        </mesh>
      ))}
      {/* 入口雨篷 */}
      <mesh {...S} position={[0, 0.3, frontZ + 0.06]}>
        <boxGeometry args={[0.32, 0.03, 0.14]} />
        <meshStandardMaterial color="#e2eef4" roughness={0.8} />
      </mesh>
      {/* 入口 */}
      <mesh position={[0, 0.14, frontZ]}>
        <boxGeometry args={[0.2, 0.2, 0.02]} />
        <meshStandardMaterial color="#b8dae8" roughness={0.4} metalness={0.12} />
      </mesh>
      {/* 招牌 */}
      <mesh position={[0, 0.92, frontZ]}>
        <boxGeometry args={[0.36, 0.08, 0.02]} />
        <meshStandardMaterial color="#f0e6d4" roughness={0.85} />
      </mesh>
      {/* 两侧窗 */}
      <mesh position={[w / 2 + 0.01, 0.48, -0.1]}>
        <boxGeometry args={[0.02, 0.5, 0.28]} />
        <meshStandardMaterial color="#d8edf5" roughness={0.35} metalness={0.12} />
      </mesh>
      <mesh position={[-(w / 2 + 0.01), 0.58, 0.08]}>
        <boxGeometry args={[0.02, 0.4, 0.24]} />
        <meshStandardMaterial color="#d8edf5" roughness={0.35} metalness={0.12} />
      </mesh>
    </group>
  );
}

// ─── 工业模型 ───
function IndustrialModel({ ctx }: { ctx: BuildingContext }) {
  const { facingAngle } = ctx;
  const w = 0.86;
  const d = 0.68;
  const frontZ = d / 2 + 0.04;

  return (
    <group position={[0, 0.08, 0]} rotation={[0, facingAngle, 0]}>
      {/* 混凝土底座 */}
      <mesh {...S} position={[0, 0.08, 0]}>
        <boxGeometry args={[w + 0.1, 0.1, d + 0.14]} />
        <meshStandardMaterial color="#c4b8a8" roughness={0.98} />
      </mesh>
      {/* 主厂房 */}
      <mesh {...S} position={[0.04, 0.38, 0.04]}>
        <boxGeometry args={[w, 0.5, d]} />
        <meshStandardMaterial color="#cdb49b" roughness={0.96} />
      </mesh>
      {/* 厂房顶部 */}
      <mesh {...S} position={[0.04, 0.65, 0.04]}>
        <boxGeometry args={[w + 0.04, 0.04, d + 0.04]} />
        <meshStandardMaterial color="#b8a58e" roughness={0.94} />
      </mesh>
      {/* 二层办公区 */}
      <mesh {...S} position={[-0.2, 0.56, -0.08]}>
        <boxGeometry args={[0.38, 0.18, 0.32]} />
        <meshStandardMaterial color="#e0d3c2" roughness={0.92} />
      </mesh>
      <mesh position={[-0.2, 0.56, 0.085]}>
        <boxGeometry args={[0.22, 0.1, 0.02]} />
        <meshStandardMaterial color="#d4cbbe" roughness={0.5} metalness={0.05} />
      </mesh>
      {/* 主烟囱 */}
      <mesh {...S} position={[0.3, 0.78, -0.18]}>
        <cylinderGeometry args={[0.08, 0.1, 0.86, 12]} />
        <meshStandardMaterial color="#8a7b6b" roughness={0.9} />
      </mesh>
      <mesh position={[0.3, 1.22, -0.18]}>
        <cylinderGeometry args={[0.1, 0.09, 0.04, 12]} />
        <meshStandardMaterial color="#766758" roughness={0.88} />
      </mesh>
      {/* 主烟囱冒烟 */}
      <SmokeParticles position={[0.3, 1.25, -0.18]} />
      {/* 副烟囱 */}
      <mesh {...S} position={[0.14, 0.62, -0.22]}>
        <cylinderGeometry args={[0.05, 0.06, 0.52, 10]} />
        <meshStandardMaterial color="#9a8c7c" roughness={0.92} />
      </mesh>
      {/* 副烟囱冒烟（较小） */}
      <SmokeParticles position={[0.14, 0.9, -0.22]} />
      {/* 通风管道 */}
      <mesh {...S} position={[-w / 2, 0.7, 0.18]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.05, 0.05, 0.16, 8]} />
        <meshStandardMaterial color="#a8a098" roughness={0.85} metalness={0.1} />
      </mesh>
      {/* 正面窗 */}
      <mesh position={[-0.16, 0.38, frontZ]}>
        <boxGeometry args={[0.16, 0.22, 0.02]} />
        <meshStandardMaterial color="#d8cfc2" roughness={0.55} metalness={0.05} />
      </mesh>
      {/* 正面货门 */}
      <mesh position={[0.2, 0.3, frontZ]}>
        <boxGeometry args={[0.22, 0.32, 0.02]} />
        <meshStandardMaterial color="#b0a28e" roughness={0.9} />
      </mesh>
      {/* 卸货区 */}
      <mesh receiveShadow position={[0.34, 0.14, frontZ - 0.04]}>
        <boxGeometry args={[0.24, 0.02, 0.16]} />
        <meshStandardMaterial color="#b8ac9c" roughness={0.98} />
      </mesh>
      {/* 背面窗 */}
      <mesh position={[0, 0.42, -(frontZ)]}>
        <boxGeometry args={[0.3, 0.16, 0.02]} />
        <meshStandardMaterial color="#d0c5b5" roughness={0.6} metalness={0.05} />
      </mesh>
    </group>
  );
}

// ─── 公园模型 ───
function ParkModel({ ctx }: { ctx: BuildingContext }) {
  const { sameType } = ctx;
  const connected = [sameType.north, sameType.south, sameType.east, sameType.west].filter(Boolean).length;
  const r = connected > 0 ? 0.56 : 0.5;

  return (
    <group position={[0, 0.04, 0]}>
      {/* 草坪 */}
      <mesh receiveShadow position={[0, 0.04, 0]}>
        <cylinderGeometry args={[r, r + 0.04, 0.08, 8]} />
        <meshStandardMaterial color="#bfdc99" roughness={0.98} />
      </mesh>
      {/* 石径 */}
      <mesh position={[0.08, 0.085, 0.08]} rotation={[-Math.PI / 2, 0, 0.4]}>
        <planeGeometry args={[0.08, connected > 0 ? 0.7 : 0.5]} />
        <meshStandardMaterial color="#d8cbb8" roughness={0.95} />
      </mesh>
      {/* 主树 */}
      <mesh {...S} position={[-0.18, 0.3, 0.1]}>
        <cylinderGeometry args={[0.04, 0.06, 0.36, 8]} />
        <meshStandardMaterial color="#8a6648" roughness={0.98} />
      </mesh>
      <mesh {...S} position={[-0.18, 0.56, 0.1]}>
        <sphereGeometry args={[connected > 0 ? 0.26 : 0.22, 12, 12]} />
        <meshStandardMaterial color="#6ba34e" roughness={0.94} />
      </mesh>
      <mesh {...S} position={[-0.1, 0.66, 0.06]}>
        <sphereGeometry args={[0.14, 10, 10]} />
        <meshStandardMaterial color="#7db85e" roughness={0.94} />
      </mesh>
      {/* 副树 */}
      <mesh {...S} position={[0.22, 0.2, -0.14]}>
        <cylinderGeometry args={[0.03, 0.04, 0.22, 7]} />
        <meshStandardMaterial color="#7a5838" roughness={0.98} />
      </mesh>
      <mesh {...S} position={[0.22, 0.38, -0.14]}>
        <sphereGeometry args={[0.16, 10, 10]} />
        <meshStandardMaterial color="#9aca7d" roughness={0.95} />
      </mesh>
      {/* 花坛 */}
      <mesh receiveShadow position={[0.24, 0.1, 0.2]}>
        <cylinderGeometry args={[0.1, 0.11, 0.06, 6]} />
        <meshStandardMaterial color="#c4b098" roughness={0.92} />
      </mesh>
      <mesh position={[0.22, 0.15, 0.18]}>
        <sphereGeometry args={[0.04, 6, 6]} />
        <meshStandardMaterial color="#e8a0a0" roughness={0.9} />
      </mesh>
      <mesh position={[0.27, 0.14, 0.22]}>
        <sphereGeometry args={[0.035, 6, 6]} />
        <meshStandardMaterial color="#f0d080" roughness={0.9} />
      </mesh>
      {/* 长椅 */}
      <mesh receiveShadow position={[-0.06, 0.12, -0.28]}>
        <boxGeometry args={[0.2, 0.03, 0.08]} />
        <meshStandardMaterial color="#a08060" roughness={0.94} />
      </mesh>
      <mesh position={[-0.13, 0.1, -0.28]}>
        <boxGeometry args={[0.03, 0.06, 0.06]} />
        <meshStandardMaterial color="#8a6a4a" roughness={0.95} />
      </mesh>
      <mesh position={[0.01, 0.1, -0.28]}>
        <boxGeometry args={[0.03, 0.06, 0.06]} />
        <meshStandardMaterial color="#8a6a4a" roughness={0.95} />
      </mesh>
      {/* 群组水池 */}
      {connected >= 2 && (
        <group>
          <mesh receiveShadow position={[0.02, 0.09, -0.02]}>
            <cylinderGeometry args={[0.14, 0.16, 0.04, 8]} />
            <meshStandardMaterial color="#a8c8d8" roughness={0.4} metalness={0.08} />
          </mesh>
          <mesh position={[0.02, 0.075, -0.02]}>
            <cylinderGeometry args={[0.12, 0.12, 0.01, 8]} />
            <meshStandardMaterial color="#7ec0cf" roughness={0.3} transparent opacity={0.7} />
          </mesh>
        </group>
      )}
    </group>
  );
}

// ─── 默认上下文 ───
const DEFAULT_CTX: BuildingContext = {
  sameType: { north: false, south: false, east: false, west: false },
  facingAngle: 0,
};

// ─── 入口函数 ───
export function BuildingModel({ type, roadConnections, buildingContext }: BuildingModelProps) {
  const ctx = buildingContext ?? DEFAULT_CTX;

  switch (type) {
    case 'RESIDENTIAL':
      return <ResidentialModel ctx={ctx} />;
    case 'COMMERCIAL':
      return <CommercialModel ctx={ctx} />;
    case 'INDUSTRIAL':
      return <IndustrialModel ctx={ctx} />;
    case 'PARK':
      return <ParkModel ctx={ctx} />;
    case 'ROAD':
      return <RoadModel connections={roadConnections ?? { north: false, south: false, east: false, west: false }} />;
    default:
      return null;
  }
}
