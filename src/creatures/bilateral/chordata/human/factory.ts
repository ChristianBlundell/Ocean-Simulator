import { RIGIDBODY_TYPE_DYNAMIC, Vec3, Vec2 } from "playcanvas"
import _ from "underscore"
import { Box, Sphere, Mirrored, MirroredProps } from "../../../../entities"
import { Limb, LimbConfigProps, LimbRuntimeProps } from "../../../../entities/organic"
import { Hinge, material } from "../../../../utils"
import { CreatureProps } from "../../../creature"
import { Kind, TAG_PART_ARM, TAG_PART_BODY, TAG_PART_HEAD, TAG_PART_LEG, TAG_PART_NECK } from "./constants"
import { DNA } from "./DNA"

export const Factory = (props: CreatureProps<typeof Kind, DNA>) => {
    const DNA = props.dna!
    const materials = _.mapObject(DNA.materials, material)
    
    const body = Box({
        ...DNA.body,
        parent: props.parent,
        tags: [TAG_PART_BODY, ...props.tags],
        material: materials.wetsuit,
        rigid: {
            type: RIGIDBODY_TYPE_DYNAMIC,
            mass: 2,
        }
    })

    const neck = Box({
        ...DNA.neck,
        parent: body,
        tags: [TAG_PART_NECK, ...props.tags],
        material: materials.skin,
        rigid: {
            type: RIGIDBODY_TYPE_DYNAMIC,
            mass: 0.25
        }
    })

    const head = Sphere({
        parent: neck,
        ...DNA.head,
        tags: [TAG_PART_HEAD, ...props.tags],
        material: materials.skin,
        rigid: {
            type: RIGIDBODY_TYPE_DYNAMIC,
            mass: 1.2
        }
    })

    const arms = Mirrored({
        parent: body,
        tags: [TAG_PART_ARM, ...props.tags],
        mirror: { y: true },
        pkg: {
            factory: Limb,
            config: DNA.arms,
            runtime: {
                material: materials.skin,
            }
        },
    } as MirroredProps<LimbConfigProps, LimbRuntimeProps>)

    const legs = Mirrored({
        parent: body,
        tags: [TAG_PART_LEG, ...props.tags],
        mirror: { y: true },
        pkg: {
            factory: Limb,
            config: DNA.legs,
            runtime: {
                material: materials.wetsuit,
            }
        },
    } as MirroredProps<LimbConfigProps, LimbRuntimeProps>)

    Hinge({
        entityA: neck,
        entityB: body,
        axisA: Vec3.UP,
        axisB: Vec3.UP,
        pivotA: new Vec3(0, 0, -DNA.neck.size.z / 2),
        pivotB: new Vec3(0, 0, DNA.body.size.z / 2),
        disableCollisionBetweenLinkedBodies: true,
        limits: new Vec2(-10, 10),
    })

    Hinge({
        entityA: head,
        entityB: neck,
        axisA: Vec3.UP,
        axisB: Vec3.UP,
        pivotA: new Vec3(0, 0, -DNA.head.radius),
        // pivotB: new Vec3(0, 0, props.neck.size.z / 2),
        disableCollisionBetweenLinkedBodies: true,
    })

    return body
}