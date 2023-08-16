import { params, suite, test } from "@testdeck/mocha";
import { assert } from "chai";
import { Vec3 } from "playcanvas";
import { TAG_LIMB_END, TAG_LIMB_END_PALM, TAG_LIMB_SEGMENT_LOWER, TAG_LIMB_SEGMENT_UPPER } from "../../src/entities/organic";
import { HumanPoseAngles } from "../../src/pose-control";
import { decomposeHumanPoseAngles } from "../../src/pose-control/motion-control";
import { BlazePoseKeypointIDs, Keypoints3D } from "../../src/pose-control/motion-control";
import { DeeplyPartial, prettyPrint } from "../../src/utils";
import { structuresEq } from "../equality-helpers";

@suite class PoseAngleTests {
    @params({
        pose: {
            left_hip: new Vec3(-0.25, 0, 0),
            right_hip: new Vec3(0.25, 0, 0),
            left_shoulder: new Vec3(-0.25, 0.5, 0),
            right_shoulder: new Vec3(0.25, 0.5, 0),
            left_elbow: new Vec3(-0.5, 0.5, 0),
            left_wrist: new Vec3(-.75, 0.5, 0),
        } as Partial<Keypoints3D>,
        expected_angles: {
            arms: {
                left: {
                    [TAG_LIMB_SEGMENT_UPPER]: new Vec3(0, 0, 0),
                    [TAG_LIMB_SEGMENT_LOWER]: new Vec3(0, 0, 0),
                }
            }
        } as DeeplyPartial<HumanPoseAngles>
    })
    @params({
        pose: {
            left_hip: new Vec3(-0.25, 0, 0),
            right_hip: new Vec3(0.25, 0, 0),
            left_shoulder: new Vec3(-0.25, 0.5, 0),
            right_shoulder: new Vec3(0.25, 0.5, 0),
            left_elbow: new Vec3(-0.6, 0.4, 0),
            left_wrist: new Vec3(-0.95, 0.45, 0),
        } as Partial<Keypoints3D>,
        expected_angles: {
            arms: {
                left: {
                    [TAG_LIMB_SEGMENT_UPPER]: new Vec3(0, 15.945, 0),
                    [TAG_LIMB_SEGMENT_LOWER]: new Vec3(0, -24.075, 0),
                }
            }
        } as DeeplyPartial<HumanPoseAngles>
    })
    @params({
        pose: {
            left_hip: new Vec3(-0.25, 0, 0),
            right_hip: new Vec3(0.25, 0, 0),
            left_shoulder: new Vec3(-0.25, 0.5, 0),
            right_shoulder: new Vec3(0.25, 0.5, 0),
            left_elbow: new Vec3(-0.6, 0.4, 0),
            left_wrist: new Vec3(-0.95, 0.45, 0),
            left_thumb: new Vec3(-1, 0.5, 0),
            left_index: new Vec3(-1.1, 0.45, 0),
            left_pinky: new Vec3(-1.1, 0.4, 0),
        } as Partial<Keypoints3D<BlazePoseKeypointIDs>>,
        expected_angles: {
            arms: {
                left: {
                    [TAG_LIMB_SEGMENT_UPPER]: new Vec3(0, 15.945, 0),
                    [TAG_LIMB_SEGMENT_LOWER]: new Vec3(0, -24.075, 0),
                    [TAG_LIMB_END]: {
                        [TAG_LIMB_END_PALM]: new Vec3(-90, 8.13, 0)
                    },
                }
            }
        } as DeeplyPartial<HumanPoseAngles>
    })
    @test "calculate pose angles"({ pose, expected_angles }:
        { pose: Partial<Keypoints3D>, expected_angles: DeeplyPartial<HumanPoseAngles> }) {
        
        /**
         * This test simply takes a test case of pose keypoints,
         * computes the pose angles for those keypoints,
         * then compares that with the expected pose angles.
         */
        
        const calculated_angles = decomposeHumanPoseAngles(pose)
        console.log(`pose angles:`)
        console.log(`arms.left.upper: ${prettyPrint(calculated_angles.arms?.left?.[TAG_LIMB_SEGMENT_UPPER])}`)
        console.log(`arms.left.lower: ${prettyPrint(calculated_angles.arms?.left?.[TAG_LIMB_SEGMENT_LOWER])}`)
        console.log(`arms.left.end: ${prettyPrint(calculated_angles.arms?.left?.[TAG_LIMB_END]?.[TAG_LIMB_END_PALM])}`)
        console.log(`arms.right.upper: ${prettyPrint(calculated_angles.arms?.right?.[TAG_LIMB_SEGMENT_UPPER])}`)
        console.log(`arms.right.lower: ${prettyPrint(calculated_angles.arms?.right?.[TAG_LIMB_SEGMENT_LOWER])}`)
        console.log(`arms.right.end: ${prettyPrint(calculated_angles.arms?.right?.[TAG_LIMB_END]?.[TAG_LIMB_END_PALM])}`)

        assert(structuresEq(expected_angles, calculated_angles))
    }
}