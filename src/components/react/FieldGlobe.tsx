import { Globe3D, type GlobeMarker } from "./Globe3D"

interface FieldGlobeProps {
  markers: GlobeMarker[]
}

export default function FieldGlobe({ markers }: FieldGlobeProps) {
  return (
    <Globe3D
      markers={markers}
      config={{
        atmosphereColor: "#7fb069",
        atmosphereIntensity: 0.5,
        atmosphereBlur: 3,
        bumpScale: 4,
        autoRotateSpeed: 0.3,
        showAtmosphere: true,
        showWireframe: true,
        wireframeColor: "#7fb069",
        ambientIntensity: 0.4,
        pointLightIntensity: 1.2,
      }}
      onMarkerClick={(marker) => {
        window.location.href = `/field/${marker.id}`
      }}
    />
  )
}
