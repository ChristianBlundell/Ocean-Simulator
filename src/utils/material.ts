import { Color, StandardMaterial } from "playcanvas";

export interface MaterialProps {
    diffuse: Color
    specular?: Color
}

export function material({ diffuse, specular }: MaterialProps) {
    const m = new StandardMaterial()
    
    m.emissive.copy(diffuse)
    m.emissiveIntensity = 0.1
    m.diffuse.copy(diffuse)
    
    if (specular)
        m.specular.copy(specular)
    
    m.update()

    return m
}