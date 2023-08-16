import { Pose } from "@tensorflow-models/pose-detection"
import { Vec2 } from "playcanvas"
import { KeypointPoseMap, Keypoints3D } from "../keypoints"

export interface KeypointsUnprojector {
    isCalibrating?: boolean

    unproject(pose: Pose): Partial<KeypointPoseMap>
}