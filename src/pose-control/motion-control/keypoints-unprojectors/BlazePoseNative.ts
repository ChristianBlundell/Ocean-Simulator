import { Pose } from "@tensorflow-models/pose-detection";
import { Vec2, Vec3 } from "playcanvas";
import { KeypointPoseMap, Keypoints3D, makePoseMap } from "../keypoints";
import { KeypointsUnprojector } from "./keypoints-unprojector";

export class BlazePoseNativeKeypointsUnprojector implements KeypointsUnprojector {
    get isCalibrating(): boolean {
        return false
    }

    unproject(pose: Pose): Partial<KeypointPoseMap> {
        return makePoseMap(pose.keypoints3D)
    }
}