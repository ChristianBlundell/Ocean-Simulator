import { GraphNode, Vec3 } from 'playcanvas'
import { reparentToRootSaveTransform } from '../../math'
import { E, entity, EntityConfigProps, EntityProps, EntityRuntimeProps } from './entity'

export interface BoxConfigProps extends EntityConfigProps {
    /**
     * @default Vec3.ONE
     */
    size?: Vec3
}

export interface BoxRuntimeProps<Parent extends GraphNode = GraphNode>
    extends EntityRuntimeProps<Parent> {
}

export type BoxProps<Parent extends GraphNode = GraphNode> = EntityProps<BoxConfigProps, BoxRuntimeProps<Parent>>

export const Box = (props: BoxProps) => {
    const entity = E(props)

    if (props.size && !props.size.equals(Vec3.ONE)) {
        Box({
            parent: entity,
            material: props.material,
            transform: {
                scale: props.size
            }
        })
    }
    else {
        entity.addComponent('render', {
            type: 'box',
            ...(props.material ? { material: props.material } : {})
        })
    }

    if (props.rigid) {
        const halfExtents = (props.size ?? Vec3.ONE).clone()
        if (props.transform?.scale)
            halfExtents.mul(props.transform!.scale!)
        halfExtents.divScalar(2)
        halfExtents.x = Math.abs(halfExtents.x)
        halfExtents.y = Math.abs(halfExtents.y)
        halfExtents.z = Math.abs(halfExtents.z)

        entity.addComponent('collision', {
            type: 'box',
            halfExtents
        })

        reparentToRootSaveTransform(entity)
    }

    return entity
}

export const Box_0_1 = (props: BoxProps) => {
    const root = entity(props)
    const realBox = Box({
        parent: root,
        material: props.material,
        size: props.size,
        transform: {
            position: new Vec3((props.size?.x ?? 1) / 2, 0, 0),
        }
    })

    if (props.rigid) {
        root.addComponent('collision', { type: 'compound' })
        realBox.addComponent('collision', {
            type: 'box',
            halfExtents: (props.transform?.scale ?? Vec3.ONE).clone().divScalar(2)
        })
    }

    return root
}