"use client"
import React, { useRef, useMemo, useState, useCallback, Suspense } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { OrbitControls, Html, useTexture } from "@react-three/drei"
import * as THREE from "three"

// ============================================================================
// Types
// ============================================================================

export interface GlobeMarker {
  id: string
  lat: number
  lng: number
  src: string
  label: string
  location: string
}

interface Globe3DConfig {
  radius?: number
  textureUrl?: string
  bumpMapUrl?: string
  showAtmosphere?: boolean
  atmosphereColor?: string
  atmosphereIntensity?: number
  atmosphereBlur?: number
  bumpScale?: number
  autoRotateSpeed?: number
  enableZoom?: boolean
  enablePan?: boolean
  minDistance?: number
  maxDistance?: number
  markerSize?: number
  showWireframe?: boolean
  wireframeColor?: string
  ambientIntensity?: number
  pointLightIntensity?: number
  backgroundColor?: string | null
}

interface Globe3DProps {
  markers?: GlobeMarker[]
  config?: Globe3DConfig
  className?: string
  onMarkerClick?: (marker: GlobeMarker) => void
  onMarkerHover?: (marker: GlobeMarker | null) => void
}

// ============================================================================
// Textures
// ============================================================================

const DEFAULT_EARTH_TEXTURE =
  "https://unpkg.com/three-globe@2.31.0/example/img/earth-blue-marble.jpg"
const DEFAULT_BUMP_TEXTURE =
  "https://unpkg.com/three-globe@2.31.0/example/img/earth-topology.png"

// ============================================================================
// Utilities
// ============================================================================

function latLngToVector3(lat: number, lng: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180)
  const theta = (lng + 180) * (Math.PI / 180)
  return new THREE.Vector3(
    -(radius * Math.sin(phi) * Math.cos(theta)),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  )
}

// ============================================================================
// Marker
// ============================================================================

interface MarkerProps {
  marker: GlobeMarker
  radius: number
  defaultSize: number
  onClick?: (marker: GlobeMarker) => void
  onHover?: (marker: GlobeMarker | null) => void
}

function Marker({ marker, radius, defaultSize, onClick, onHover }: MarkerProps) {
  const [hovered, setHovered] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const groupRef = useRef<THREE.Group>(null)
  const imageGroupRef = useRef<THREE.Group>(null)
  const { camera } = useThree()

  const surfacePosition = useMemo(
    () => latLngToVector3(marker.lat, marker.lng, radius * 1.001),
    [marker.lat, marker.lng, radius],
  )

  const topPosition = useMemo(
    () => latLngToVector3(marker.lat, marker.lng, radius * 1.18),
    [marker.lat, marker.lng, radius],
  )

  const lineHeight = topPosition.distanceTo(surfacePosition)

  useFrame(() => {
    if (!imageGroupRef.current) return
    const worldPos = new THREE.Vector3()
    imageGroupRef.current.getWorldPosition(worldPos)
    const markerDirection = worldPos.clone().normalize()
    const cameraDirection = camera.position.clone().normalize()
    setIsVisible(markerDirection.dot(cameraDirection) > 0.1)
  })

  const handlePointerEnter = useCallback(() => {
    setHovered(true)
    onHover?.(marker)
  }, [marker, onHover])

  const handlePointerLeave = useCallback(() => {
    setHovered(false)
    onHover?.(null)
  }, [onHover])

  const handleClick = useCallback(() => {
    onClick?.(marker)
  }, [marker, onClick])

  const { lineCenter, lineQuaternion } = useMemo(() => {
    const center = surfacePosition.clone().lerp(topPosition, 0.5)
    const direction = topPosition.clone().sub(surfacePosition).normalize()
    const quaternion = new THREE.Quaternion()
    quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction)
    return { lineCenter: center, lineQuaternion: quaternion }
  }, [surfacePosition, topPosition])

  return (
    <group ref={groupRef} visible={isVisible}>
      {/* Pin line */}
      <mesh position={lineCenter} quaternion={lineQuaternion}>
        <cylinderGeometry args={[0.003, 0.003, lineHeight, 8]} />
        <meshBasicMaterial
          color={hovered ? "#e8e0d4" : "#5a6e62"}
          transparent
          opacity={hovered ? 0.9 : 0.5}
        />
      </mesh>

      {/* Pin point at surface */}
      <mesh position={surfacePosition} quaternion={lineQuaternion}>
        <coneGeometry args={[0.015, 0.04, 8]} />
        <meshBasicMaterial color={hovered ? "#a0d88a" : "#7fb069"} />
      </mesh>

      {/* Image + label at top */}
      <group ref={imageGroupRef} position={topPosition}>
        <Html
          transform
          center
          sprite
          distanceFactor={10}
          style={{
            pointerEvents: isVisible ? "auto" : "none",
            opacity: isVisible ? 1 : 0,
            transition: "opacity 0.15s ease-out",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "4px",
              cursor: "pointer",
            }}
            onMouseEnter={handlePointerEnter}
            onMouseLeave={handlePointerLeave}
            onClick={handleClick}
          >
            <div
              style={{
                width: hovered ? "12px" : "8px",
                height: hovered ? "12px" : "8px",
                borderRadius: "50%",
                overflow: "hidden",
                border: hovered ? "1.5px solid rgba(127,176,105,0.6)" : "1px solid rgba(127,176,105,0.3)",
                boxShadow: hovered ? "0 0 12px rgba(127,176,105,0.4)" : "0 0 6px rgba(127,176,105,0.2)",
                transition: "all 0.2s ease",
                background: "#162019",
              }}
            >
              <img
                src={marker.src}
                alt={marker.label}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                draggable={false}
              />
            </div>
            {hovered && (
              <div
                style={{
                  background: "rgba(22,32,25,0.95)",
                  backdropFilter: "blur(8px)",
                  border: "1px solid rgba(127,176,105,0.15)",
                  borderRadius: "8px",
                  padding: "6px 10px",
                  whiteSpace: "nowrap",
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: "11px", color: "#e8e0d4", fontWeight: 500 }}>
                  {marker.label}
                </div>
                <div style={{ fontSize: "9px", color: "#5a6e62", marginTop: "2px" }}>
                  {marker.location}
                </div>
              </div>
            )}
          </div>
        </Html>
      </group>
    </group>
  )
}

// ============================================================================
// Rotating Globe
// ============================================================================

interface RotatingGlobeProps {
  config: Required<Globe3DConfig>
  markers: GlobeMarker[]
  onMarkerClick?: (marker: GlobeMarker) => void
  onMarkerHover?: (marker: GlobeMarker | null) => void
}

function RotatingGlobe({ config, markers, onMarkerClick, onMarkerHover }: RotatingGlobeProps) {
  const groupRef = useRef<THREE.Group>(null)

  const [earthTexture, bumpTexture] = useTexture([config.textureUrl, config.bumpMapUrl])

  useMemo(() => {
    if (earthTexture) {
      earthTexture.colorSpace = THREE.SRGBColorSpace
      earthTexture.anisotropy = 16
    }
    if (bumpTexture) {
      bumpTexture.anisotropy = 8
    }
  }, [earthTexture, bumpTexture])

  const geometry = useMemo(() => new THREE.SphereGeometry(config.radius, 64, 64), [config.radius])
  const wireframeGeometry = useMemo(
    () => new THREE.SphereGeometry(config.radius * 1.002, 32, 16),
    [config.radius],
  )

  return (
    <group ref={groupRef}>
      <mesh geometry={geometry}>
        <meshStandardMaterial
          map={earthTexture}
          bumpMap={bumpTexture}
          bumpScale={config.bumpScale * 0.05}
          roughness={0.8}
          metalness={0.0}
        />
      </mesh>

      {config.showWireframe && (
        <mesh geometry={wireframeGeometry}>
          <meshBasicMaterial color={config.wireframeColor} wireframe transparent opacity={0.06} />
        </mesh>
      )}

      {markers.map((marker, index) => (
        <Marker
          key={`marker-${index}-${marker.lat}-${marker.lng}`}
          marker={marker}
          radius={config.radius}
          defaultSize={config.markerSize}
          onClick={onMarkerClick}
          onHover={onMarkerHover}
        />
      ))}
    </group>
  )
}

// ============================================================================
// Atmosphere
// ============================================================================

function Atmosphere({
  radius,
  color,
  intensity,
  blur,
}: {
  radius: number
  color: string
  intensity: number
  blur: number
}) {
  const fresnelPower = Math.max(0.5, 5 - blur)

  const atmosphereMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          atmosphereColor: { value: new THREE.Color(color) },
          intensity: { value: intensity },
          fresnelPower: { value: fresnelPower },
        },
        vertexShader: `
          varying vec3 vNormal;
          varying vec3 vPosition;
          void main() {
            vNormal = normalize(normalMatrix * normal);
            vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform vec3 atmosphereColor;
          uniform float intensity;
          uniform float fresnelPower;
          varying vec3 vNormal;
          varying vec3 vPosition;
          void main() {
            float fresnel = pow(1.0 - abs(dot(vNormal, normalize(-vPosition))), fresnelPower);
            gl_FragColor = vec4(atmosphereColor, fresnel * intensity);
          }
        `,
        side: THREE.BackSide,
        transparent: true,
        depthWrite: false,
      }),
    [color, intensity, fresnelPower],
  )

  return (
    <mesh scale={[1.12, 1.12, 1.12]}>
      <sphereGeometry args={[radius, 64, 32]} />
      <primitive object={atmosphereMaterial} attach="material" />
    </mesh>
  )
}

// ============================================================================
// Scene
// ============================================================================

function Scene({
  markers,
  config,
  onMarkerClick,
  onMarkerHover,
}: {
  markers: GlobeMarker[]
  config: Required<Globe3DConfig>
  onMarkerClick?: (marker: GlobeMarker) => void
  onMarkerHover?: (marker: GlobeMarker | null) => void
}) {
  const { camera } = useThree()

  React.useEffect(() => {
    camera.position.set(0, 0, config.radius * 3.5)
    camera.lookAt(0, 0, 0)
  }, [camera, config.radius])

  return (
    <>
      <ambientLight intensity={config.ambientIntensity} />
      <directionalLight
        position={[config.radius * 5, config.radius * 2, config.radius * 5]}
        intensity={config.pointLightIntensity}
        color="#ffffff"
      />
      <directionalLight
        position={[-config.radius * 3, config.radius, -config.radius * 2]}
        intensity={config.pointLightIntensity * 0.2}
        color="#7fb069"
      />

      <RotatingGlobe
        config={config}
        markers={markers}
        onMarkerClick={onMarkerClick}
        onMarkerHover={onMarkerHover}
      />

      {config.showAtmosphere && (
        <Atmosphere
          radius={config.radius}
          color={config.atmosphereColor}
          intensity={config.atmosphereIntensity}
          blur={config.atmosphereBlur}
        />
      )}

      <OrbitControls
        makeDefault
        enablePan={config.enablePan}
        enableZoom={config.enableZoom}
        minDistance={config.minDistance}
        maxDistance={config.maxDistance}
        rotateSpeed={0.4}
        autoRotate={config.autoRotateSpeed > 0}
        autoRotateSpeed={config.autoRotateSpeed}
        enableDamping
        dampingFactor={0.1}
      />
    </>
  )
}

// ============================================================================
// Loading
// ============================================================================

function LoadingFallback() {
  return (
    <Html center>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
        <div
          style={{
            width: "24px",
            height: "24px",
            border: "2px solid rgba(127,176,105,0.2)",
            borderTop: "2px solid #7fb069",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
          }}
        />
        <span style={{ fontSize: "12px", color: "#5a6e62" }}>Loading globe...</span>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </Html>
  )
}

// ============================================================================
// Default config — tuned for Fieldnotes dark palette
// ============================================================================

const defaultConfig: Required<Globe3DConfig> = {
  radius: 2,
  textureUrl: DEFAULT_EARTH_TEXTURE,
  bumpMapUrl: DEFAULT_BUMP_TEXTURE,
  showAtmosphere: true,
  atmosphereColor: "#7fb069",
  atmosphereIntensity: 0.5,
  atmosphereBlur: 3,
  bumpScale: 4,
  autoRotateSpeed: 0.3,
  enableZoom: false,
  enablePan: false,
  minDistance: 5,
  maxDistance: 15,
  markerSize: 0.06,
  showWireframe: true,
  wireframeColor: "#7fb069",
  ambientIntensity: 0.4,
  pointLightIntensity: 1.2,
  backgroundColor: null,
}

// ============================================================================
// Export
// ============================================================================

export function Globe3D({ markers = [], config = {}, className, onMarkerClick, onMarkerHover }: Globe3DProps) {
  const mergedConfig = useMemo(() => ({ ...defaultConfig, ...config }), [config])

  return (
    <div className={className} style={{ position: "relative", width: "100%", height: "500px" }}>
      <Canvas
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        dpr={[1, 2]}
        camera={{ fov: 45, near: 0.1, far: 1000, position: [0, 0, mergedConfig.radius * 3.5] }}
        style={{ background: "transparent" }}
      >
        <Suspense fallback={<LoadingFallback />}>
          <Scene
            markers={markers}
            config={mergedConfig}
            onMarkerClick={onMarkerClick}
            onMarkerHover={onMarkerHover}
          />
        </Suspense>
      </Canvas>

      {/* Radial glow behind globe */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: -1,
          opacity: 0.25,
          background: "radial-gradient(circle at 50% 50%, rgba(127,176,105,0.15) 0%, transparent 55%)",
          pointerEvents: "none",
        }}
      />
    </div>
  )
}

export default Globe3D
