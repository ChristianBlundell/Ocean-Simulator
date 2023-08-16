import { RIGIDBODY_TYPE_DYNAMIC, Vec3, Vec2, Entity } from "playcanvas"
import _, { uniqueId } from "underscore"
import { Hinge } from "../utils"
import { EntityConfigProps, BoxConfigProps, SphereConfigProps, entity, Box, Sphere, Mirrored, MirroredProps, EntityProps, EntityRuntimeProps, EntityFactory } from "../entities/basic"
import { TAG_FLUID_COLLIDABLE } from "../entities/fluid-sim"
import { LimbConfigProps, Limb, LimbRuntimeProps } from "../entities/organic/limb"
import { motionControl } from "../pose-control"
import { DNA } from "./DNA"

export interface CreatureKind<
        Kind extends string = string,
        DNA_T extends DNA = DNA,
        PoseAngles extends object = object
    > {
    name: Kind
    seedGenePool: DNA_T[]
    defaultController: motionControl.MotionControlType<PoseAngles>
    factory: EntityFactory<CreatureConfigProps<Kind, DNA_T>>
}

export interface CreatureConfigProps<
        Kind extends string = string,
        DNA_T extends DNA = DNA,
    > extends EntityConfigProps {
    /**
     * The {@link CreatureKind} to instantiate.
     */
    kind: CreatureKind<Kind, DNA_T>
    
    /**
     * If no DNA is given, then DNA will be randomly selected from the gene pool.
     */
    dna?: DNA_T
}

export type CreatureProps<
        Kind extends string = string,
        DNA_T extends DNA = DNA,
    > = EntityProps<CreatureConfigProps<Kind, DNA_T>, EntityRuntimeProps>

export const Creature = <
        Kind extends string = string,
        DNA_T extends DNA = DNA,
    >(props: CreatureProps<Kind, DNA_T>) => {
    const id = uniqueId(`${props.kind}_`)

    const root = entity({
        ...props,
        name: id,
        tags: [TAG_FLUID_COLLIDABLE, id, ...(props.tags ?? [])]
    })

    props.kind.factory({
        name: id,
        parent: root,
        tags: props.tags ?? [],
        kind: props.kind,
        dna: props.dna ?? props.kind.seedGenePool[_.random(props.kind.seedGenePool.length - 1)],
    })

    return root
}