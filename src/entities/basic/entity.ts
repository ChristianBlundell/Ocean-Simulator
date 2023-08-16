import { Entity, GraphNode, RIGIDBODY_TYPE_STATIC, RIGIDBODY_TYPE_DYNAMIC, RIGIDBODY_TYPE_KINEMATIC, RigidBodyComponent, Vec3, Material } from "playcanvas";
import { BasicTransform, reparentToRootSaveTransform, setTransform, Transform, transform, transform4nodeWorld } from "../../math";
import { TAG_MIRRORED_AXIS_Y_MIRROR, TAG_MIRRORED_AXIS_Y_REGULAR } from "./mirrored";

export interface EntityConfigProps {
    transform?: Transform
    tags?: string[]
}

export interface EntityRuntimeProps<Parent extends GraphNode = GraphNode> {
    name?: string
    parent?: Parent
    transform?: Transform
    tags?: string[]
    material?: Material
    rigid?: boolean | {
        type: typeof RIGIDBODY_TYPE_STATIC | typeof RIGIDBODY_TYPE_DYNAMIC | typeof RIGIDBODY_TYPE_KINEMATIC
        mass?: number
        restitution?: number

        friction?: number
        rollingFriction?: number

        linearDamping?: Vec3
        linearFactor?: Vec3
        
        angularDamping?: Vec3
        angularFactor?: Vec3

        group?: number
        mask?: number
    }
}

export type EntityProps<
        Config extends EntityConfigProps = EntityConfigProps,
        Runtime extends EntityRuntimeProps = EntityRuntimeProps
    > = Config & Runtime

export const entity = (props?: EntityProps) => {
    const entity = new Entity(props.name)
    props?.parent?.addChild(entity)
    
    if (props?.tags)
        entity.tags.add(...props.tags)

    transform(entity, props.transform)

    if (props.rigid) {
        reparentToRootSaveTransform(entity)

        entity.addComponent('rigidbody',
            props.rigid === true ?
                { type: RIGIDBODY_TYPE_DYNAMIC } :
                props.rigid
        )
    }

    return entity
}

export const E = entity