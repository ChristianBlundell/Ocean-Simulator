import { Pose } from "@tensorflow-models/pose-detection";
import { Vec2, Vec3 } from "playcanvas";
import { KeypointPoseMap } from "../../keypoints";
import { KeypointsUnprojector } from "../keypoints-unprojector";

export class MultiCamKeypointsUnprojector implements KeypointsUnprojector {
    isCalibrating?: boolean;

    unproject(pose: Pose): Partial<KeypointPoseMap> {
        throw new Error('not implemented')
    }
}