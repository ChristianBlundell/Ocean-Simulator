import { DeeplyPartial } from "../../utils";
import { HumanPoseAngles } from "../human-pose-angles";

export interface MotionControlType<PoseAngles extends object = object> {
    project(humanPose: DeeplyPartial<HumanPoseAngles>): DeeplyPartial<PoseAngles>
}