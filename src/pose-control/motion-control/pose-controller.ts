import { PoseController } from "../pose-controller";
import { Rig } from "../rig";
import { HumanPoseDetector } from "./human-pose-detector";
import { MotionControlType } from "./control-type";

export class MotionPoseController<PoseAngles extends object = object> implements PoseController<PoseAngles> {
    detector: HumanPoseDetector
    
    constructor(public readonly controlType: MotionControlType<PoseAngles>) {
    }

    async initialize(): Promise<void> {
        this.detector = await HumanPoseDetector.getInstance()
    }
    
    update(rig: Rig, dt: number): void {
        rig.apply(this.controlType.project(this.detector.humanPoseAngles))
    }
}