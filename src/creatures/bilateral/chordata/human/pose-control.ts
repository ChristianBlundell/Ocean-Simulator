import { DeeplyPartial } from "../../../../utils";
import { BilateralMirrored, HumanPoseAngles, LimbPoseAngles, motionControl } from "../../../../pose-control";
import { EulerAngle } from "../../../../math";
import { TAG_PART_HEAD, TAG_PART_ARM, TAG_PART_LEG } from "./constants";

export interface PoseAngles {
    [TAG_PART_HEAD]: EulerAngle
    [TAG_PART_ARM]: BilateralMirrored<LimbPoseAngles>
    [TAG_PART_LEG]: BilateralMirrored<LimbPoseAngles>
}

export class MotionControlType implements motionControl.MotionControlType<PoseAngles> {
    project(humanPose: DeeplyPartial<HumanPoseAngles>): DeeplyPartial<PoseAngles> {
        return {
            [TAG_PART_HEAD]: (humanPose as HumanPoseAngles).head,
            [TAG_PART_ARM]: (humanPose as HumanPoseAngles).arms,
            [TAG_PART_LEG]: (humanPose as HumanPoseAngles).legs,
        }
    }
}