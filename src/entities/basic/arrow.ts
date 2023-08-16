import { BasicMaterial, Color, CULLFACE_NONE, Mesh, MeshInstance, PRIMITIVE_LINES, PRIMITIVE_TRIANGLES, Vec3 } from "playcanvas";
import { E, EntityConfigProps, EntityProps, EntityRuntimeProps } from "./entity";
import { EntityFactory } from "./factory";

export interface ArrowConfigProps extends EntityConfigProps {
    color?: Color
}

export interface ArrowRuntimeProps extends EntityRuntimeProps {
}

export type ArrowProps = EntityProps<ArrowConfigProps, ArrowRuntimeProps>

export const Arrow = (props: ArrowProps) => {
    const entity = E(props)

    const vertecies = [
        0, 0, 0,
        0, 0, 0.1,
        0.75, 0, 0.1,
        0.75, 0, 0.25,
        1, 0, 0,

        // 0, 0, 0,
        // 0, 0.1, 0,
        // 0, 0.1, 0.75,
        // 0, 0.25, 0.75,
        // 0, 0, 1,
    ]

    const indices = [
        0, 1, 2,
        0, 2, 4,
        2, 3, 4,

        // 5, 6, 7,
        // 5, 7, 9,
        // 7, 8, 9,
    ]

    const mesh = new Mesh()
    mesh.setPositions(vertecies)
    mesh.setIndices(indices)
    mesh.update(PRIMITIVE_TRIANGLES)

    const material = new BasicMaterial() //this.material.data as Material
    material.color = props.color ?? Color.BLACK
    material.cull = CULLFACE_NONE
    const meshInstance = new MeshInstance(mesh, material)
    entity.removeComponent('model')
    entity.addComponent('render', {
        meshInstances: [meshInstance]
    })

    return entity
}

export const XYZArrows = (props: EntityProps) => {
    const entity = E(props)

    Arrow({
        parent: entity,
        color: Color.RED,
        transform: {
            rotation: new Vec3(0, 0, 0)
        },
    })

    Arrow({
        parent: entity,
        color: Color.GREEN,
        transform: {
            rotation: new Vec3(0, 0, 90)
        },
    })

    Arrow({
        parent: entity,
        color: Color.BLUE,
        transform: {
            rotation: new Vec3(0, -90, 180)
        }
    })

    return entity
}

export const XYZArrowsWrapped = (realFactory: EntityFactory) =>
    (props: EntityProps) => {
        const entity = realFactory(props)
        XYZArrows({ parent: entity })
        return entity
    }