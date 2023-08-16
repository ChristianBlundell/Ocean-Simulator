import { Keypoint, Pose } from "@tensorflow-models/pose-detection";
import { Vec2, Vec3 } from "playcanvas";
import { Keypoints3D, BlazePoseKeypointIDs, KeypointPoseMap, makePoseMap } from "../keypoints";
import { KeypointsUnprojector } from "./keypoints-unprojector";

/**
 * This keypoints unprojector assumes that the person is about directly facing
 * the camera. It takes 2D points and, given expected limb lengths, unprojects
 * the elbow and wrist into 3D space, assuming that they are in the Z-order of
 * shoulder, elbow, then wrist.
 */
export class StaticLimbLength3DKeypointsUnprojector implements KeypointsUnprojector {
    get isCalibrating(): boolean {
        return false
    }

    limbLengths_sq: {
        arms: {
            upper: number
            lower: number
        }
    } = {
        arms: {
            upper: 0.08,
            lower: 0.10
        }
    }

    private unproject_z(from: Keypoint, to: Keypoint, expected_lengthSquared: number) {
        const measured_LengthSq = new Vec2().sub2(
                new Vec2(from.x, from.y),
                new Vec2(to.x, to.y)
            ).lengthSq()

        const z_offset = (measured_LengthSq > expected_lengthSquared) ?
            0 : Math.sqrt(expected_lengthSquared - measured_LengthSq)
        
        to.z = from.z - z_offset
    }

    private unproject_arm(keypoints: {
            shoulder?: Keypoint
            elbow?: Keypoint
            wrist?: Keypoint
            thumb?: Keypoint
            index?: Keypoint
            pinky?: Keypoint
        }) {
        if (keypoints.elbow?.score > 0.3) {
            this.unproject_z(keypoints.shoulder, keypoints.elbow, this.limbLengths_sq.arms.upper)

            if (keypoints.wrist && keypoints.wrist.score > 0.3) {
                this.unproject_z(keypoints.elbow, keypoints.wrist, this.limbLengths_sq.arms.lower)
                
                if (keypoints.thumb)
                    keypoints.thumb.z = keypoints.wrist.z
                if (keypoints.index)
                    keypoints.index.z = keypoints.wrist.z
                if (keypoints.pinky)
                    keypoints.pinky.z = keypoints.wrist.z
            }
        }
    }


    private calib_i = 0

    unproject(pose: Pose): Partial<KeypointPoseMap> {
        const map: Partial<KeypointPoseMap> = makePoseMap(pose.keypoints)
        const map_blazePose: Partial<KeypointPoseMap<BlazePoseKeypointIDs>> = map

        if (!map.left_shoulder || !map.right_shoulder)
            return {}

        if ((this.calib_i++ % 100) === 0) {
            console.log(`shoulder-elbow sq-dist max expected: ${this.limbLengths_sq.arms.upper.toFixed(4)}`)
            console.log(`elbow-wrist sq-dist max expected: ${this.limbLengths_sq.arms.lower.toFixed(4)}`)
        }
        
        const referenceCenter = 
            new Vec2().add2(
                    new Vec2(map.left_shoulder.x, map.left_shoulder.y),
                    new Vec2(map.right_shoulder.x, map.right_shoulder.y)
                ).divScalar(2)
        
        const referenceLength =
            8 * new Vec2().sub2(
                    new Vec2(map.left_shoulder.x, map.left_shoulder.y),
                    new Vec2(map.right_shoulder.x, map.right_shoulder.y)
                ).length()

        for (const keypoint of Object.values(map)) {
            keypoint.x = 2 * ((keypoint.x - referenceCenter.x) / referenceLength)
            keypoint.y = 2 * ((keypoint.y - referenceCenter.y) / referenceLength) - 0.2
            keypoint.z = 0
        }

        this.unproject_arm({
            shoulder: map.left_shoulder,
            elbow: map.left_elbow,
            wrist: map.left_wrist,
            thumb: map_blazePose.left_thumb,
            index: map_blazePose.left_index,
            pinky: map_blazePose.left_pinky,
        })

        this.unproject_arm({
            shoulder: map.right_shoulder,
            elbow: map.right_elbow,
            wrist: map.right_wrist,
            thumb: map_blazePose.right_thumb,
            index: map_blazePose.right_index,
            pinky: map_blazePose.right_pinky,
        })

        // if (map.right_elbow) {
        //     map.right_elbow.z += Math.sqrt((this.limbLengths.arms.upper ** 2) - new Vec3().sub2(map.right_elbow, map.right_shoulder).lengthSq())

        //     if (map.right_wrist) {
        //         map.right_wrist.z += map.right_elbow.z + Math.sqrt((this.limbLengths.arms.lower ** 2) - new Vec3().sub2(map.right_wrist, map.right_elbow).lengthSq())

        //         if (map_blazePose.right_thumb)
        //             map_blazePose.right_thumb.z = map.right_wrist.z
        //         if (map_blazePose.right_index)
        //             map_blazePose.right_index.z = map.right_wrist.z
        //         if (map_blazePose.right_pinky)
        //             map_blazePose.right_pinky.z = map.right_wrist.z
        //     }
        // }
        
        return map
    }
}