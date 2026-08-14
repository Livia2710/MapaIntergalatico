import React, { useRef, useState, useMemo, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Stars, Trail } from "@react-three/drei";

const FONT_IMPORT = `@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&family=Inter:wght@400;500&display=swap');`;

const PLANETS = [
  {
    id: "mercurio",
    name: "Mercúrio",
    color: "#9a938c",
    size: 0.28,
    orbit: 3.2,
    speed: 0.9,
    tilt: 0.02,
    fact: "O menor e mais rápido, varre sua órbita em pouco menos de 88 dias.",
  },
  {
    id: "venus",
    name: "Vênus",
    color: "#e8c99b",
    size: 0.42,
    orbit: 4.4,
    speed: 0.62,
    tilt: 0.01,
    fact: "Gira ao contrário dos outros planetas — o dia venusiano é mais longo que seu ano.",
  },
  {
    id: "terra",
    name: "Terra",
    color: "#3f7fbf",
    size: 0.45,
    orbit: 5.8,
    speed: 0.42,
    tilt: 0.41,
    fact: "O único mundo do sistema com oceanos líquidos na superfície — e um bom lugar pra começar um mapa.",
    hasMoon: true,
  },
  {
    id: "marte",
    name: "Marte",
    color: "#b5563c",
    size: 0.34,
    orbit: 7.2,
    speed: 0.32,
    tilt: 0.44,
    fact: "Poeira de óxido de ferro dá o tom avermelhado — abriga o maior vulcão conhecido, o Olympus Mons.",
  },
  {
    id: "jupiter",
    name: "Júpiter",
    color: "#c9a06b",
    size: 0.95,
    orbit: 9.6,
    speed: 0.17,
    tilt: 0.05,
    fact: "Maior planeta do sistema; a Grande Mancha Vermelha é uma tempestade ativa há séculos.",
  },
  {
    id: "saturno",
    name: "Saturno",
    color: "#d8c290",
    size: 0.85,
    orbit: 12.2,
    speed: 0.13,
    tilt: 0.47,
    fact: "Seus anéis são feitos de gelo e rocha — finos o bastante pra desaparecer de vista quando de perfil.",
    hasRings: true,
  },
  {
    id: "urano",
    name: "Urano",
    color: "#9bd6d6",
    size: 0.62,
    orbit: 14.6,
    speed: 0.09,
    tilt: 1.71,
    fact: "Gira quase deitado de lado — provavelmente resultado de uma colisão antiga.",
  },
  {
    id: "netuno",
    name: "Netuno",
    color: "#5069c9",
    size: 0.6,
    orbit: 16.8,
    speed: 0.07,
    tilt: 0.49,
    fact: "Os ventos mais fortes já registrados no sistema — passam de 2000 km/h.",
  },
];

function OrbitRing({ radius, active }) {
  const points = useMemo(() => {
    const pts = [];
    for (let i = 0; i <= 128; i++) {
      const a = (i / 128) * Math.PI * 2;
      pts.push(radius * Math.cos(a), 0, radius * Math.sin(a));
    }
    return new Float32Array(pts);
  }, [radius]);

  return (
    <line>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={points.length / 3}
          array={points}
          itemSize={3}
        />
      </bufferGeometry>
      <lineBasicMaterial
        color={active ? "#e8b34d" : "#3a4560"}
        transparent
        opacity={active ? 0.9 : 0.35}
      />
    </line>
  );
}

function Planet({ data, selected, onSelect, speedMul }) {
  const group = useRef();
  const mesh = useRef();
  const angleRef = useRef(Math.random() * Math.PI * 2);
  const [hovered, setHovered] = useState(false);
  const isActive = selected === data.id;

  useFrame((_, delta) => {
    angleRef.current += delta * data.speed * 0.15 * speedMul;
    const a = angleRef.current;
    if (group.current) {
      group.current.position.set(
        data.orbit * Math.cos(a),
        0,
        data.orbit * Math.sin(a)
      );
    }
    if (mesh.current) {
      mesh.current.rotation.y += delta * 0.3;
    }
  });

  const scale = hovered || isActive ? 1.35 : 1;

  return (
    <group ref={group}>
      <mesh
        ref={mesh}
        scale={scale}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(data.id);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = "auto";
        }}
        rotation={[data.tilt, 0, 0]}
      >
        <sphereGeometry args={[data.size, 32, 32]} />
        <meshStandardMaterial
          color={data.color}
          roughness={0.75}
          metalness={0.05}
          emissive={isActive ? data.color : "#000000"}
          emissiveIntensity={isActive ? 0.35 : 0}
        />
        {data.hasRings && (
          <mesh rotation={[Math.PI / 2.3, 0, 0]}>
            <ringGeometry args={[data.size * 1.5, data.size * 2.4, 64]} />
            <meshBasicMaterial
              color="#d8c290"
              side={2}
              transparent
              opacity={0.55}
            />
          </mesh>
        )}
        {data.hasMoon && (
          <mesh position={[data.size * 2.2, 0, 0]}>
            <sphereGeometry args={[data.size * 0.27, 16, 16]} />
            <meshStandardMaterial color="#c9c9c9" roughness={0.9} />
          </mesh>
        )}
      </mesh>
      {(hovered || isActive) && (
        <sprite position={[0, data.size + 0.45, 0]} scale={[1.6, 0.4, 1]}>
          <spriteMaterial transparent opacity={0} />
        </sprite>
      )}
    </group>
  );
}

function Sun() {
  const mesh = useRef();
  useFrame((_, delta) => {
    if (mesh.current) mesh.current.rotation.y += delta * 0.05;
  });
  return (
    <group>
      <mesh ref={mesh}>
        <sphereGeometry args={[1.6, 48, 48]} />
        <meshStandardMaterial
          color="#e8b34d"
          emissive="#e8842d"
          emissiveIntensity={1.4}
          roughness={1}
        />
      </mesh>
      <pointLight color="#ffdca8" intensity={220} distance={80} decay={2} />
    </group>
  );
}

function Scene({ selected, onSelect, speedMul }) {
  return (
    <>
      <ambientLight intensity={0.12} />
      <Sun />
      {PLANETS.map((p) => (
        <React.Fragment key={p.id}>
          <OrbitRing radius={p.orbit} active={selected === p.id} />
          <Planet
            data={p}
            selected={selected}
            onSelect={onSelect}
            speedMul={speedMul}
          />
        </React.Fragment>
      ))}
      <Stars radius={90} depth={50} count={3500} factor={2} fade speed={0.4} />
    </>
  );
}

export default function SolarSystemMap() {
  const [selected, setSelected] = useState(null);
  const [running, setRunning] = useState(true);
  const selectedData = PLANETS.find((p) => p.id === selected);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        background: "radial-gradient(circle at 50% 40%, #0c1220 0%, #05070d 70%)",
      }}
    >
      <style>{FONT_IMPORT}</style>

      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 10,
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          padding: "1.5rem",
          pointerEvents: "none",
          fontFamily: "'Inter', sans-serif",
        }}
      >
        <div>
          <h1
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              color: "#f2f0ea",
              letterSpacing: "0.02em",
              fontSize: "1.5rem",
              margin: 0,
            }}
          >
            Sistema Solar
          </h1>
          <p style={{ color: "#8b93ab", maxWidth: 320, fontSize: "0.875rem", marginTop: "0.25rem" }}>
            Ponto de partida do seu atlas intergaláctico. Arraste pra girar,
            role pra zoom, clique num planeta.
          </p>
        </div>
        <button
          onClick={() => setRunning((r) => !r)}
          style={{
            pointerEvents: "auto",
            padding: "0.5rem 1rem",
            fontSize: "0.875rem",
            borderRadius: "9999px",
            border: "1px solid #3a4560",
            color: "#f2f0ea",
            background: "rgba(12,18,32,0.6)",
            fontFamily: "'Inter', sans-serif",
            cursor: "pointer",
          }}
        >
          {running ? "Pausar órbitas" : "Retomar órbitas"}
        </button>
      </div>

      <Canvas
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
        camera={{ position: [0, 9, 22], fov: 48 }}
      >
        <Suspense fallback={null}>
          <Scene
            selected={selected}
            onSelect={(id) => setSelected((cur) => (cur === id ? null : id))}
            speedMul={running ? 1 : 0}
          />
        </Suspense>
        <OrbitControls
          enablePan={false}
          minDistance={6}
          maxDistance={45}
          autoRotate={!selected}
          autoRotateSpeed={0.25}
        />
      </Canvas>

      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 10,
          display: "flex",
          justifyContent: "center",
          gap: "0.5rem",
          padding: "1rem",
          pointerEvents: "none",
          flexWrap: "wrap",
        }}
      >
        {PLANETS.map((p) => (
          <button
            key={p.id}
            onClick={() => setSelected((cur) => (cur === p.id ? null : p.id))}
            style={{
              pointerEvents: "auto",
              padding: "0.375rem 0.75rem",
              borderRadius: "9999px",
              fontSize: "0.75rem",
              cursor: "pointer",
              fontFamily: "'Inter', sans-serif",
              background:
                selected === p.id ? "rgba(232,179,77,0.18)" : "rgba(12,18,32,0.55)",
              border: `1px solid ${selected === p.id ? "#e8b34d" : "#2a3245"}`,
              color: selected === p.id ? "#e8b34d" : "#aab1c4",
            }}
          >
            {p.name}
          </button>
        ))}
      </div>

      {selectedData && (
        <div
          style={{
            position: "absolute",
            top: "6rem",
            right: "1.5rem",
            zIndex: 10,
            width: 288,
            padding: "1.25rem",
            borderRadius: "1rem",
            fontFamily: "'Inter', sans-serif",
            background: "rgba(10,14,24,0.82)",
            border: "1px solid #2a3245",
            backdropFilter: "blur(6px)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
            <h2
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                color: "#e8b34d",
                fontSize: "1.1rem",
                margin: 0,
              }}
            >
              {selectedData.name}
            </h2>
            <button
              onClick={() => setSelected(null)}
              style={{ color: "#8b93ab", fontSize: "0.875rem", background: "none", border: "none", cursor: "pointer" }}
              aria-label="Fechar"
            >
              ✕
            </button>
          </div>
          <p style={{ color: "#c7cbdb", fontSize: "0.875rem", lineHeight: 1.5, margin: 0 }}>
            {selectedData.fact}
          </p>
        </div>
      )}
    </div>
  );
}