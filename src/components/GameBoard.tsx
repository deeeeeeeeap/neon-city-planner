import { useMemo, useState } from 'react';
import { OrbitControls } from '@react-three/drei';
import { Canvas, type ThreeEvent } from '@react-three/fiber';
import { canPlace } from '../game/builder';
import { useGameStore } from '../store/useGameStore';
import type { Cell, CellType } from '../types';
import { BuildingModel } from './models/buildings';
import type { RoadConnections, BuildingContext } from './models/buildings';

interface GameBoardProps {
  store: ReturnType<typeof useGameStore>;
}

interface HoveredCell {
  x: number;
  y: number;
}

interface TileProps {
  cell: Cell;
  selectedTool: CellType;
  buildCheck: { valid: boolean; reason?: string };
  isHovered: boolean;
  width: number;
  height: number;
  roadConnections?: RoadConnections;
  buildingContext?: BuildingContext;
  onHover: (hovered: HoveredCell | null) => void;
  onSelect: (x: number, y: number) => void;
}

const TILE_SIZE = 1.24;
const TILE_HEIGHT = 0.18;
const HALF_TILE = TILE_SIZE / 2;

const LABELS: Record<CellType, string> = {
  EMPTY: '空地',
  RESIDENTIAL: '住宅',
  COMMERCIAL: '商业',
  INDUSTRIAL: '工业',
  PARK: '公园',
  ROAD: '道路',
  OCEAN: '海洋',
  DEMOLISH: '拆除',
};

function formatRoadDistance(value: number | undefined) {
  if (value === undefined) {
    return '未计算';
  }

  if (!Number.isFinite(value)) {
    return '未连通';
  }

  return `${value} 格`;
}

function getTilePalette(type: CellType, isHovered: boolean, canBuild: boolean) {
  if (type === 'OCEAN') {
    return {
      top: isHovered ? '#9ad7e6' : '#89c9db',
      side: '#6fb2c8',
      line: '#b7ebf3',
    };
  }

  if (isHovered) {
    return {
      top: canBuild ? '#f3dfbf' : '#f2c5bf',
      side: canBuild ? '#d8bb90' : '#d5a59c',
      line: canBuild ? '#fbf3e7' : '#fdebe7',
    };
  }

  switch (type) {
    case 'RESIDENTIAL':
      return { top: '#f8dfc8', side: '#ddb696', line: '#fff5e8' };
    case 'COMMERCIAL':
      return { top: '#bfd9e3', side: '#8fb5c1', line: '#e9f7fc' };
    case 'INDUSTRIAL':
      return { top: '#dbc7b2', side: '#b59677', line: '#f1e3d6' };
    case 'PARK':
      return { top: '#d3e5b7', side: '#b0c98b', line: '#f4f9e7' };
    case 'ROAD':
      return { top: '#e3ddd5', side: '#c8beb2', line: '#f8f5ef' };
    default:
      return { top: '#f5efe5', side: '#ddcfbe', line: '#fdfaf5' };
  }
}

function getCellPosition(x: number, y: number, width: number, height: number) {
  return [
    (x - width / 2) * TILE_SIZE + HALF_TILE,
    0,
    (y - height / 2) * TILE_SIZE + HALF_TILE,
  ] as const;
}

function BoardBackdrop({ width, height }: { width: number; height: number }) {
  return (
    <group>
      <mesh receiveShadow position={[0, -0.26, 0]}>
        <boxGeometry args={[width * TILE_SIZE + 2.6, 0.4, height * TILE_SIZE + 2.6]} />
        <meshStandardMaterial color="#efe2ce" roughness={0.98} />
      </mesh>
      <mesh receiveShadow position={[0, -0.45, 0]}>
        <cylinderGeometry args={[width * 0.82, width * 0.9, 0.08, 32]} />
        <meshStandardMaterial color="#decab4" roughness={1} />
      </mesh>
    </group>
  );
}

/**
 * 计算建筑入口朝向（找最近道路并返回朝向角度）
 * 遍历整个 grid 找曼哈顿距离最近的道路，用 atan2 算精确方向
 * 返回弧度值：0=南(+Z), π/2=西, π=北, -π/2=东
 */
function computeFacingAngle(grid: Cell[][], cx: number, cy: number): number {
  const rows = grid.length;
  const cols = grid[0]?.length ?? 0;
  let bestDist = Infinity;
  let bestDx = 0;
  let bestDy = 1; // 默认朝南
  // 遍历找所有道路，取曼哈顿距离最近的
  for (let gy = 0; gy < rows; gy++) {
    for (let gx = 0; gx < cols; gx++) {
      if (grid[gy]?.[gx]?.type !== 'ROAD') continue;
      const dist = Math.abs(gx - cx) + Math.abs(gy - cy);
      if (dist < bestDist) {
        bestDist = dist;
        bestDx = gx - cx; // 正=东, 负=西
        bestDy = gy - cy; // 正=南(行号增大), 负=北
      }
    }
  }
  if (bestDist === Infinity) return 0;
  // 将 grid 差值映射到四个主方向（卡主方位）
  // 模型正面在 +Z，旋转让正面指向道路方向
  // grid dy>0 = 3D +Z = 南, dx>0 = 3D +X = 东
  const absDx = Math.abs(bestDx);
  const absDy = Math.abs(bestDy);
  if (absDy >= absDx) {
    // 主要在南北方向
    return bestDy >= 0 ? 0 : Math.PI; // 南=0, 北=π
  }
  // 主要在东西方向
  return bestDx > 0 ? -Math.PI / 2 : Math.PI / 2; // 东=-π/2, 西=π/2
}


function BoardTile({
  cell,
  selectedTool,
  buildCheck,
  isHovered,
  width,
  height,
  roadConnections,
  buildingContext,
  onHover,
  onSelect,
}: TileProps) {
  const [x, y, z] = getCellPosition(cell.x, cell.y, width, height);
  const palette = getTilePalette(cell.type, isHovered, buildCheck.valid);
  const previewVisible =
    isHovered &&
    selectedTool !== 'DEMOLISH' &&
    cell.type === 'EMPTY' &&
    buildCheck.valid;

  const handleHover = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    onHover({ x: cell.x, y: cell.y });
  };

  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    onSelect(cell.x, cell.y);
  };

  return (
    <group position={[x, y, z]}>
      <mesh
        castShadow
        receiveShadow
        onPointerOver={handleHover}
        onPointerMove={handleHover}
        onPointerOut={() => onHover(null)}
        onClick={handleClick}
      >
        <boxGeometry args={[TILE_SIZE - 0.06, TILE_HEIGHT, TILE_SIZE - 0.06]} />
        <meshStandardMaterial color={palette.top} roughness={0.94} />
      </mesh>
      <mesh position={[0, TILE_HEIGHT / 2 + 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[TILE_SIZE - 0.24, TILE_SIZE - 0.24]} />
        <meshBasicMaterial color={palette.line} transparent opacity={0.48} />
      </mesh>
      <mesh position={[0, -0.04, 0]}>
        <boxGeometry args={[TILE_SIZE - 0.08, 0.1, TILE_SIZE - 0.08]} />
        <meshStandardMaterial color={palette.side} roughness={1} />
      </mesh>
      {cell.type !== 'EMPTY' && cell.type !== 'OCEAN' && (
        <BuildingModel type={cell.type} roadConnections={roadConnections} buildingContext={buildingContext} />
      )}
      {previewVisible && <BuildingModel type={selectedTool} />}
      {cell.type === 'OCEAN' && (
        <mesh receiveShadow position={[0, 0.12, 0]}>
          <boxGeometry args={[TILE_SIZE - 0.1, 0.12, TILE_SIZE - 0.1]} />
          <meshStandardMaterial color="#72bfd3" transparent opacity={0.78} roughness={0.35} />
        </mesh>
      )}
      {isHovered && (
        <mesh position={[0, 0.22, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.28, 0.48, 24]} />
          <meshBasicMaterial
            color={buildCheck.valid ? '#d27747' : '#b85f5f'}
            transparent
            opacity={0.9}
            depthTest={false}
          />
        </mesh>
      )}
    </group>
  );
}

function Scene({
  grid,
  hoveredCell,
  selectedTool,
  resources,
  phase,
  onHover,
  onSelect,
}: {
  grid: Cell[][];
  hoveredCell: HoveredCell | null;
  selectedTool: CellType;
  resources: GameBoardProps['store']['state']['resources'];
  phase: GameBoardProps['store']['state']['phase'];
  onHover: (hovered: HoveredCell | null) => void;
  onSelect: (x: number, y: number) => void;
}) {
  const rows = grid.length;
  const cols = grid[0]?.length ?? 0;

  return (
    <>
      <color attach="background" args={['#f4e9d9']} />
      <fog attach="fog" args={['#f4e9d9', 18, 45]} />
      <ambientLight intensity={1.55} color="#fff0da" />
      <directionalLight
        castShadow
        intensity={1.75}
        color="#fff6eb"
        position={[10, 18, 8]}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={1}
        shadow-camera-far={40}
        shadow-camera-left={-16}
        shadow-camera-right={16}
        shadow-camera-top={16}
        shadow-camera-bottom={-16}
      />
      <BoardBackdrop width={cols} height={rows} />
      {grid.flatMap((row) =>
        row.map((cell) => {
          const buildCheck = canPlace(grid, cell.x, cell.y, selectedTool, resources, phase);

          // 计算道路邻接关系
          let roadConn: RoadConnections | undefined;
          if (cell.type === 'ROAD') {
            roadConn = {
              north: cell.y > 0 && grid[cell.y - 1]?.[cell.x]?.type === 'ROAD',
              south: cell.y < rows - 1 && grid[cell.y + 1]?.[cell.x]?.type === 'ROAD',
              west:  cell.x > 0 && grid[cell.y]?.[cell.x - 1]?.type === 'ROAD',
              east:  cell.x < cols - 1 && grid[cell.y]?.[cell.x + 1]?.type === 'ROAD',
            };
          }

          // 计算建筑群组上下文
          let bCtx: BuildingContext | undefined;
          const isBldg = cell.type !== 'EMPTY' && cell.type !== 'OCEAN' && cell.type !== 'ROAD';
          if (isBldg) {
            const t = cell.type;
            bCtx = {
              sameType: {
                north: cell.y > 0 && grid[cell.y - 1]?.[cell.x]?.type === t,
                south: cell.y < rows - 1 && grid[cell.y + 1]?.[cell.x]?.type === t,
                west:  cell.x > 0 && grid[cell.y]?.[cell.x - 1]?.type === t,
                east:  cell.x < cols - 1 && grid[cell.y]?.[cell.x + 1]?.type === t,
              },
              facingAngle: computeFacingAngle(grid, cell.x, cell.y),
            };
          }

          return (
            <BoardTile
              key={`${cell.x}-${cell.y}`}
              cell={cell}
              selectedTool={selectedTool}
              buildCheck={buildCheck}
              isHovered={hoveredCell?.x === cell.x && hoveredCell?.y === cell.y}
              width={cols}
              height={rows}
              roadConnections={roadConn}
              buildingContext={bCtx}
              onHover={onHover}
              onSelect={onSelect}
            />
          );
        }),
      )}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
        <planeGeometry args={[32, 32]} />
        <shadowMaterial transparent opacity={0.18} />
      </mesh>
      <OrbitControls
        enablePan={true}
        screenSpacePanning={true}
        panSpeed={0.8}
        enableDamping
        dampingFactor={0.08}
        minDistance={6}
        maxDistance={32}
        target={[0, 0.8, 0]}
      />
    </>
  );
}

export const GameBoard = ({ store }: GameBoardProps) => {
  const { state, actions } = store;
  const { grid, selectedTool, resources, phase } = state;
  const [hoveredCell, setHoveredCell] = useState<HoveredCell | null>(null);

  const hoveredDetail = useMemo(() => {
    if (!hoveredCell || !grid[hoveredCell.y]?.[hoveredCell.x]) {
      return null;
    }

    const cell = grid[hoveredCell.y][hoveredCell.x];
    const check = canPlace(grid, hoveredCell.x, hoveredCell.y, selectedTool, resources, phase);
    return { cell, check };
  }, [grid, hoveredCell, phase, resources, selectedTool]);

  if (grid.length === 0) {
    return null;
  }

  return (
    <div className="board-wrapper board-wrapper-3d">
      <div className="board-stage paper-panel">
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 'auto -8% -18% auto',
            width: '44%',
            aspectRatio: '1',
            borderRadius: '50%',
            background:
              'radial-gradient(circle, rgba(136, 194, 210, 0.26) 0%, rgba(136, 194, 210, 0) 70%)',
            filter: 'blur(12px)',
            zIndex: 0,
          }}
        />
        <Canvas
          shadows
          dpr={[1, 2]}
          camera={{ position: [9.5, 12, 11], fov: 32 }}
          onPointerMissed={() => setHoveredCell(null)}
        >
          <Scene
            grid={grid}
            hoveredCell={hoveredCell}
            selectedTool={selectedTool}
            resources={resources}
            phase={phase}
            onHover={setHoveredCell}
            onSelect={(x, y) => actions.build(x, y, selectedTool)}
          />
        </Canvas>

        <div className="board-caption">
          <span>纸模规划沙盘</span>
          <strong>拖动旋转，滚轮缩放，点击地块进行建设或拆除。</strong>
        </div>

        {hoveredDetail && hoveredCell && (
          <div className="board-tooltip paper-panel">
            <div className="board-tooltip-eyebrow">
              <div>
                <span>
                  坐标 {hoveredCell.x}, {hoveredCell.y}
                </span>
                <strong>{LABELS[hoveredDetail.cell.type]}</strong>
              </div>
              <strong className={hoveredDetail.check.valid ? 'status-ok' : 'status-bad'}>
                {hoveredDetail.check.valid ? '可操作' : '受限'}
              </strong>
            </div>

            <div className="board-tooltip-grid">
              <div>
                <span>人口</span>
                <strong>{hoveredDetail.cell.population}</strong>
              </div>
              <div>
                <span>幸福</span>
                <strong>{hoveredDetail.cell.happiness}</strong>
              </div>
            </div>

            <div className="board-tooltip-footer">
              <div>
                <span>当前工具</span>
                <strong>{LABELS[selectedTool]}</strong>
              </div>
              <div>
                <span>道路距离</span>
                <strong>{formatRoadDistance(hoveredDetail.cell.roadDist)}</strong>
              </div>
            </div>

            {hoveredDetail.cell.localIncome !== undefined && (
              <div style={{ position: 'relative', zIndex: 1, marginTop: '14px' }}>
                <span style={{ color: 'var(--color-ink-light)', fontSize: '0.8rem' }}>单格收益</span>
                <strong style={{ display: 'block', marginTop: '6px' }}>
                  ${hoveredDetail.cell.localIncome}
                </strong>
              </div>
            )}

            <div
              style={{
                position: 'relative',
                zIndex: 1,
                marginTop: '14px',
                paddingTop: '12px',
                borderTop: '1px solid rgba(58, 58, 58, 0.08)',
                color: hoveredDetail.check.valid ? 'var(--color-success)' : 'var(--color-danger)',
                fontSize: '0.9rem',
                fontWeight: 700,
              }}
            >
              {hoveredDetail.check.valid
                ? selectedTool === 'DEMOLISH'
                  ? '点击后拆除此地块。'
                  : `点击后放置${LABELS[selectedTool]}。`
                : hoveredDetail.check.reason}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
