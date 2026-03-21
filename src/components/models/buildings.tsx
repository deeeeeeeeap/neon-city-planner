import type { CellType } from '../../types';

export interface RoadConnections {
  north: boolean;
  south: boolean;
  east: boolean;
  west: boolean;
}

export interface BuildingContext {
  sameType: {
    north: boolean;
    south: boolean;
    east: boolean;
    west: boolean;
  };
  facingAngle: number;
}

type BuildingModelProps = {
  type: CellType;
  roadConnections?: RoadConnections;
  buildingContext?: BuildingContext;
};

const shadowProps = {
  castShadow: true,
  receiveShadow: true,
};

export function BuildingModel({ type }: BuildingModelProps) {
  switch (type) {
    case 'RESIDENTIAL':
      return (
        <group position={[0, 0.12, 0]}>
          <mesh {...shadowProps} position={[0, 0.34, 0]}>
            <boxGeometry args={[0.66, 0.62, 0.66]} />
            <meshStandardMaterial color="#f6dcc1" roughness={0.95} />
          </mesh>
          <mesh {...shadowProps} position={[0, 0.74, 0]} rotation={[0, Math.PI / 4, 0]}>
            <coneGeometry args={[0.5, 0.36, 4]} />
            <meshStandardMaterial color="#cf8f69" roughness={0.88} />
          </mesh>
          <mesh {...shadowProps} position={[0.22, 0.18, 0.22]}>
            <boxGeometry args={[0.12, 0.18, 0.12]} />
            <meshStandardMaterial color="#fcf7ef" roughness={1} />
          </mesh>
        </group>
      );
    case 'COMMERCIAL':
      return (
        <group position={[0, 0.08, 0]}>
          <mesh {...shadowProps} position={[0, 0.58, 0]}>
            <boxGeometry args={[0.78, 1.08, 0.72]} />
            <meshStandardMaterial color="#9fc8dc" roughness={0.78} metalness={0.06} />
          </mesh>
          <mesh {...shadowProps} position={[0, 1.14, 0]}>
            <boxGeometry args={[0.58, 0.1, 0.52]} />
            <meshStandardMaterial color="#f4f2eb" roughness={0.92} />
          </mesh>
          <mesh {...shadowProps} position={[0.32, 0.38, 0]}>
            <boxGeometry args={[0.06, 0.56, 0.36]} />
            <meshStandardMaterial color="#e9f5fb" roughness={0.45} metalness={0.14} />
          </mesh>
        </group>
      );
    case 'INDUSTRIAL':
      return (
        <group position={[0, 0.08, 0]}>
          <mesh {...shadowProps} position={[0, 0.34, 0.04]}>
            <boxGeometry args={[0.92, 0.56, 0.7]} />
            <meshStandardMaterial color="#cdb49b" roughness={0.96} />
          </mesh>
          <mesh {...shadowProps} position={[-0.18, 0.62, -0.1]}>
            <boxGeometry args={[0.44, 0.22, 0.34]} />
            <meshStandardMaterial color="#e6d6c5" roughness={0.92} />
          </mesh>
          <mesh {...shadowProps} position={[0.28, 0.72, -0.16]}>
            <cylinderGeometry args={[0.09, 0.11, 0.94, 12]} />
            <meshStandardMaterial color="#8f7b6b" roughness={0.9} />
          </mesh>
        </group>
      );
    case 'PARK':
      return (
        <group position={[0, 0.04, 0]}>
          <mesh receiveShadow position={[0, 0.04, 0]}>
            <cylinderGeometry args={[0.44, 0.5, 0.08, 8]} />
            <meshStandardMaterial color="#bfdc99" roughness={0.98} />
          </mesh>
          <mesh {...shadowProps} position={[-0.16, 0.26, 0.08]}>
            <cylinderGeometry args={[0.06, 0.07, 0.3, 8]} />
            <meshStandardMaterial color="#8a6648" roughness={0.98} />
          </mesh>
          <mesh {...shadowProps} position={[-0.16, 0.52, 0.08]}>
            <sphereGeometry args={[0.24, 12, 12]} />
            <meshStandardMaterial color="#76ad5b" roughness={0.94} />
          </mesh>
          <mesh {...shadowProps} position={[0.2, 0.18, -0.12]}>
            <sphereGeometry args={[0.12, 10, 10]} />
            <meshStandardMaterial color="#9aca7d" roughness={0.95} />
          </mesh>
        </group>
      );
    case 'ROAD':
      return (
        <group position={[0, 0.02, 0]}>
          <mesh receiveShadow>
            <boxGeometry args={[0.94, 0.06, 0.94]} />
            <meshStandardMaterial color="#d7d1c8" roughness={1} />
          </mesh>
          <mesh position={[0, 0.04, 0]}>
            <boxGeometry args={[0.1, 0.01, 0.56]} />
            <meshStandardMaterial color="#f3eee8" roughness={0.78} />
          </mesh>
        </group>
      );
    default:
      return null;
  }
}