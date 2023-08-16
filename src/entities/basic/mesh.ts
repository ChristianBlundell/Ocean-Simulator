import { Asset, CULLFACE_NONE, Material, Mesh, MeshInstance, Model, RENDERSTYLE_WIREFRAME } from "playcanvas"
import { entity, EntityConfigProps, EntityProps, EntityRuntimeProps } from "./entity"

export interface MeshConfigProps extends EntityConfigProps {
    mesh: Mesh
}

export interface MeshRuntimeProps extends EntityRuntimeProps {
}

export type MeshProps = EntityProps<MeshConfigProps, MeshRuntimeProps>

export const mesh = (props: MeshProps) => {
    const e = entity(props)
    
    const model = new Model()
    model.meshInstances = [new MeshInstance(props.mesh, props.material)]
    
    e.addComponent('render', {
        meshInstances: model.meshInstances,
        material: props.material
    })

    if (props.rigid) {
        e.addComponent('collision', {
            type: 'mesh',
            model
        })
    }

    return e
}