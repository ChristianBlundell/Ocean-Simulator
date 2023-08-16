import { Entity, RIGIDBODY_TYPE_DYNAMIC, Vec2, Vec3 } from "playcanvas";
import { Hinged, HingedConfigProps, mergeTags } from "../../utils";
import { EntityProps, EntityConfigProps, EntityRuntimeProps, Repetition, Box, BoxProps } from "../basic";
import { LinkedJointed, LinkedJointedRepetitionLayoutStrategyConfigProps } from "../basic/layout-strategies";
import { LimbEnd, LimbEndConfigProps, LimbEndRuntimeProps } from "./limb-end";

export const TAG_LIMB = "limb"
export const TAG_LIMB_SEGMENT = "limb-segment"
export const TAG_LIMB_SEGMENT_UPPER = "limb-segment/upper"
export const TAG_LIMB_SEGMENT_LOWER = "limb-segment/lower"

export interface LimbConfigProps extends EntityConfigProps {
    segmentLengths: [upper: number, lower: number]
    limbEnd: LimbEndConfigProps
    size: Vec2
}

export interface LimbRuntimeProps extends EntityRuntimeProps<Entity> {
}

export type LimbProps = EntityProps<LimbConfigProps, LimbRuntimeProps>

export const Limb = (props: LimbProps) =>
    Repetition({
        parent: props.parent,
        transform: props.transform,
        tags: mergeTags([TAG_LIMB], props.tags),

        items: props.segmentLengths,
        itemPkg: {
            factory: ({ item, index, tags, parent }) => Box({
                parent,
                material: props.material,
                tags: mergeTags([TAG_LIMB_SEGMENT, [TAG_LIMB_SEGMENT_UPPER, TAG_LIMB_SEGMENT_LOWER][index]], tags),
                size: new Vec3(item, props.size.x, props.size.y),
                rigid: {
                    type: RIGIDBODY_TYPE_DYNAMIC,
                    // type: RIGIDBODY_TYPE_KINEMATIC,
                    mass: 0.4
                }
            } as BoxProps),
        },
        layoutStrategy: {
            factory: LinkedJointed,
            config: {
                joint: 'hinge',
                hinge: {
                    axis: Vec3.UP,
                    // TODO: have limb segments be defined by a rigid body with
                    // collision domain so that it can only rotate so far at the joint
                    // without colliding with its neighbor
                    disableCollisionBetweenLinkedBodies: true,
                    limits: new Vec2(0, 180),
                    // relaxationFactor: 0.9,
                    // biasFactor: 1.2,
                },
                length: props.segmentLengths,
                linkTransform: {
                    position: new Vec3(0.15, 0, 0),
                },
                root_hinge_calculations: 'regular'
            } as LinkedJointedRepetitionLayoutStrategyConfigProps,
        },
        tip: {
            factory: Hinged,
            config: {
                axis: Vec3.UP,
                child: {
                    factory: LimbEnd,
                    config: props.limbEnd,
                    runtime: {
                        material: props.material
                    } as LimbEndRuntimeProps as unknown
                }
            } as HingedConfigProps as unknown
        }
    })