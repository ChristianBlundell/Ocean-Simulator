import { RIGIDBODY_TYPE_DYNAMIC, Vec2, Vec3 } from "playcanvas"
import { mergeTags } from "../../utils"
import { PackagedEntityFactory, Repetition, EntityProps, EntityConfigProps, EntityRuntimeProps, Box } from "../basic"
import { LinkedJointed, LinkedJointedRepetitionLayoutStrategyConfigProps } from "../basic/layout-strategies"

export const TAG_FINGER = "finger"
export const TAG_FINGER_SEGMENT = "finger-segment"
export const TAG_FINGER_SEGMENT_PREFIX = "finger-segment/"

export interface FingerConfigProps extends EntityConfigProps {
    segmentLengths: number[]
    tip?: PackagedEntityFactory
    size: Vec2
}

export interface FingerRuntimeProps extends EntityRuntimeProps {
}

export type FingerProps = EntityProps<FingerConfigProps, FingerRuntimeProps>

export const Finger = (props: FingerProps) =>
    Repetition({
        parent: props.parent,
        transform: props.transform,
        tags: mergeTags(['finger'], props.tags),
        
        items: props.segmentLengths,
        itemPkg: {
            factory: ({ item, index, tags, parent }) => Box({
                parent,
                tags: mergeTags([TAG_FINGER, TAG_FINGER_SEGMENT, TAG_FINGER_SEGMENT_PREFIX + index.toString()], tags),
                material: props.material,
                size: new Vec3(item, props.size.x, props.size.y),
                rigid: {
                    type: RIGIDBODY_TYPE_DYNAMIC,
                    mass: 0.05
                }
            }),
        },
        layoutStrategy: {
            factory: LinkedJointed,
            config: {
                joint: 'hinge',
                hinge: {
                    axis: Vec3.UP,
                    disableCollisionBetweenLinkedBodies: false,
                    // limits: new Vec2(-10, 10)
                },
                length: props.segmentLengths,
                linkTransform: {
                    position: new Vec3(0.025, 0, 0),
                }
            } as LinkedJointedRepetitionLayoutStrategyConfigProps,
        }

        //TODO: add finger nail at tip
    })