
// https://github.com/tensorflow/tfjs-models/blob/master/pose-detection/README.md

import { Keypoint } from "@tensorflow-models/pose-detection"
import { Vec3 } from "playcanvas"

export type KeypointID = number

export interface KeypointIDs {
    nose: KeypointID
    left_eye: KeypointID
    right_eye: KeypointID
    left_ear: KeypointID
    right_ear: KeypointID
    left_shoulder: KeypointID
    right_shoulder: KeypointID
    left_elbow: KeypointID
    right_elbow: KeypointID
    left_wrist: KeypointID
    right_wrist: KeypointID
    left_hip: KeypointID
    right_hip: KeypointID
    left_knee: KeypointID
    right_knee: KeypointID
    left_ankle: KeypointID
    right_ankle: KeypointID
}

export type KeypointName = keyof KeypointIDs

export const modelKeypoints = {
    COCO: {
        nose: 0,
        left_eye: 1,
        right_eye: 2,
        left_ear: 3,
        right_ear: 4,
        left_shoulder: 5,
        right_shoulder: 6,
        left_elbow: 7,
        right_elbow: 8,
        left_wrist: 9,
        right_wrist: 10,
        left_hip: 11,
        right_hip: 12,
        left_knee: 13,
        right_knee: 14,
        left_ankle: 15,
        right_ankle: 16
    },

    BlazePose: {
        nose: 0,
        left_eye_inner: 1,
        left_eye: 2,
        left_eye_outer: 3,
        right_eye_inner: 4,
        right_eye: 5,
        right_eye_outer: 6,
        left_ear: 7,
        right_ear: 8,
        mouth_left: 9,
        mouth_right: 10,
        left_shoulder: 11,
        right_shoulder: 12,
        left_elbow: 13,
        right_elbow: 14,
        left_wrist: 15,
        right_wrist: 16,
        left_pinky: 17,
        right_pinky: 18,
        left_index: 19,
        right_index: 20,
        left_thumb: 21,
        right_thumb: 22,
        left_hip: 23,
        right_hip: 24,
        left_knee: 25,
        right_knee: 26,
        left_ankle: 27,
        right_ankle: 28,
        left_heel: 29,
        right_heel: 30,
        left_foot_index: 31,
        right_foot_index: 32,
        bodyCenter: 33,
        forehead: 34,
        leftThumb: 35,
        leftHand: 36,
        rightThumb: 37,
        rightHand: 38
    }
}

export type COCOKeypointIDs = typeof modelKeypoints.COCO
export type BlazePoseKeypointIDs = typeof modelKeypoints.BlazePose

export type KeypointMap<T, IDs extends KeypointIDs = KeypointIDs> = { [K in keyof IDs]: T }
export type KeypointPoseMap<IDs extends KeypointIDs = KeypointIDs> = KeypointMap<Keypoint, IDs>
export type Keypoints3D<IDs extends KeypointIDs = KeypointIDs> = KeypointMap<Vec3, IDs>

export function makePoseMap(keypoints: Keypoint[]): Partial<KeypointPoseMap> {
    let map: Partial<KeypointPoseMap> = {}

    for (const keypoint of keypoints)
        (map as any)[keypoint.name!] = keypoint

    return map
}

export function updateKeypoints3D(
        source: Partial<KeypointPoseMap>,
        keypoints3D: Partial<Keypoints3D>
    ) {
    const dst = keypoints3D as any
    for (const keypoint of Object.keys(source)) {
        const current3D = dst[keypoint] as Vec3
        const sourceKeypoint = (source as any)[keypoint] as Keypoint
        const sourceKeypoint3D = new Vec3(sourceKeypoint.x, sourceKeypoint.y, sourceKeypoint.z)

        //dst[keypoint] = sourceKeypoint3D
        if (current3D) {
            const diff = new Vec3().sub2(sourceKeypoint3D, current3D)
            const diff_dist = diff.length()
            
            if (diff_dist > 0) {
                diff.divScalar(diff_dist)

                const influence = sourceKeypoint.score / 2
                diff.mulScalar(Math.min(influence, diff_dist))

                current3D.add(diff)
            }
        }
        else {
            if (!(sourceKeypoint.score < 0.3))
                dst[keypoint] = sourceKeypoint3D
        }
    }

    //TODO: remove keypoints that haven't been updated in a while
}