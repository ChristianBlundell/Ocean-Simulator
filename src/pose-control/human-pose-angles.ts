import { Vec3 } from "playcanvas"
import { TAG_MIRRORED_AXIS_Y_MIRROR, TAG_MIRRORED_AXIS_Y_REGULAR } from "../entities"
import { TAG_LIMB_END, TAG_LIMB_END_PALM, TAG_LIMB_SEGMENT_LOWER, TAG_LIMB_SEGMENT_UPPER } from "../entities/organic"
import { EulerAngle } from "../math"

export interface LimbEndPoseAngles {
    [TAG_LIMB_END_PALM]: EulerAngle
    //TODO: add fingers
}

export interface LimbPoseAngles {
    [TAG_LIMB_SEGMENT_UPPER]: EulerAngle
    [TAG_LIMB_SEGMENT_LOWER]: EulerAngle
    [TAG_LIMB_END]: LimbEndPoseAngles
}

export interface BilateralMirrored<T = any> {
    [TAG_MIRRORED_AXIS_Y_REGULAR]: T
    [TAG_MIRRORED_AXIS_Y_MIRROR]: T
}

export interface HumanPoseAngles {
    head: EulerAngle
    arms: BilateralMirrored<LimbPoseAngles>
    legs: BilateralMirrored<LimbPoseAngles>
}

export const newHumanPoseAngles = (): HumanPoseAngles => ({
    head: new Vec3(),
    arms: {
        left: {
            [TAG_LIMB_SEGMENT_UPPER]: new Vec3(),
            [TAG_LIMB_SEGMENT_LOWER]: new Vec3(),
            [TAG_LIMB_END]: {
                [TAG_LIMB_END_PALM]: new Vec3(),
            },
        },
        right: {
            [TAG_LIMB_SEGMENT_UPPER]: new Vec3(),
            [TAG_LIMB_SEGMENT_LOWER]: new Vec3(),
            [TAG_LIMB_END]: {
                [TAG_LIMB_END_PALM]: new Vec3(),
            },
        }
    },
    legs: {
        left: {
            [TAG_LIMB_SEGMENT_UPPER]: new Vec3(),
            [TAG_LIMB_SEGMENT_LOWER]: new Vec3(),
            [TAG_LIMB_END]: {
                [TAG_LIMB_END_PALM]: new Vec3(),
            },
        },
        right: {
            [TAG_LIMB_SEGMENT_UPPER]: new Vec3(),
            [TAG_LIMB_SEGMENT_LOWER]: new Vec3(),
            [TAG_LIMB_END]: {
                [TAG_LIMB_END_PALM]: new Vec3(),
            },
        }
    }
})