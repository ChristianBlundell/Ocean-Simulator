import { Vec3 } from "playcanvas"
import { TAG_LIMB_END, TAG_LIMB_END_PALM, TAG_LIMB_SEGMENT_LOWER, TAG_LIMB_SEGMENT_UPPER } from "../../entities/organic"
import { projectToBasis, decomposeEuler, rotateBasis, rotate } from "../../math"
import { prettyPrint, DeeplyPartial } from "../../utils"
import { HumanPoseAngles, LimbPoseAngles, LimbEndPoseAngles } from "../human-pose-angles"
import { Keypoints3D, KeypointMap, BlazePoseKeypointIDs } from "./keypoints"

/**
 * Computes the angles needed to describe an arm's rotation.
 * @param angles where to store the resulting angles in
 * @param invert_local_y whether or not the local y axis should be inverted;
 * `true` if on the left side, `false` on the right.
 * @param keypoints the keypoints to work with
 */
function calcPoseAngles_arm(
    angles: Partial<LimbPoseAngles>,
    invert_local_y: boolean,
    keypoints: {
        shoulder?: Vec3
        shoulder_other?: Vec3
        hip?: Vec3
        elbow?: Vec3
        wrist?: Vec3
        thumb?: Vec3
        index?: Vec3
        pinky?: Vec3
    }
) {
    /**
     * Pose angles for an arm are computed by progressing through arm segments,
     * starting with a basis, then decomposing the rotation for that segment,
     * then computing the next basis and repeating.
     * 
     * For the starting (upper arm) basis:
     * x+ = direction upper limb segment is pointing,
     *      (focal shoulder)<-(other shoulder)
     * y+ = forward, straight ahead of player (if they were looking forward),
     *      found by crossing z and x.
     * z+ = up, hip->shoulder
     * 
     * The elbow only rotates along the y-axis (pitch), so that means the upper
     * arm has to roll. To compute this roll, the z_elbow vector is computed by
     * double-crossing the elbow->wrist vector with the shoulder->elbow vector.
     * The z_elbow vector is then used along with the shoulder->elbow vector to
     * compute the upper arm rotation.
     * 
     * Then, within the lower arm basis, the elbow->wrist vector will only need
     * a pitch component to describe it. The wrist basis can then be computed.
     * 
     * The wrist can pitch, yaw, and roll. The hand is assumed to have the palm
     * facing up (Z+) by default, and this up vector is computed by crossing
     * the wrist->thumb and wrist->pinky vectors. The forward vector for the
     * wrist, the vector to compute the rotation for, is the wrist->index
     * vector.
     * 
     * That's all that's computed for now. Later, the finger rotations may be
     * computed here also.
     */

    if (!keypoints.shoulder ||
        !keypoints.shoulder_other ||
        !keypoints.hip ||
        !keypoints.elbow)
        return

    const x = new Vec3().sub2(keypoints.shoulder, keypoints.shoulder_other).normalize()
    const z = new Vec3().sub2(keypoints.shoulder, keypoints.hip).normalize()
    const y = new Vec3().cross(z, x)

    if (invert_local_y)
        y.mulScalar(-1)

    const basis_upper = { x, y, z }
    console.log(`basis_upper:\nx: ${prettyPrint(basis_upper.x)}\ny: ${prettyPrint(basis_upper.y)}\nz: ${prettyPrint(basis_upper.z)}`)

    const x_shoulder_elbow = projectToBasis(new Vec3().sub2(keypoints.elbow, keypoints.shoulder), basis_upper).normalize()
    let x_elbow_wrist = keypoints.wrist ? projectToBasis(new Vec3().sub2(keypoints.wrist, keypoints.elbow), basis_upper).normalize() : undefined

    console.log(`x_shoulder_elbow: ${prettyPrint(x_shoulder_elbow)}`)
    console.log(`x_elbow_wrist: ${prettyPrint(x_elbow_wrist)}`)

    let z_elbow = x_elbow_wrist ? new Vec3().sub2(x_elbow_wrist, x_shoulder_elbow) : undefined
    if (z_elbow && z_elbow.length() < 0.1) z_elbow = undefined
    z_elbow?.normalize()
    if (z_elbow) z_elbow = new Vec3().cross(new Vec3().cross(x_shoulder_elbow, z_elbow), x_shoulder_elbow).normalize()
    console.log(`z_elbow: ${prettyPrint(z_elbow)}`)
    console.log(`z_elbow dot x_shoulder_elbow: ${z_elbow?.dot(x_shoulder_elbow)} (should = 0 | undefined)`)
    angles[TAG_LIMB_SEGMENT_UPPER] = decomposeEuler(x_shoulder_elbow, z_elbow)
    const angles_upper_inverse = angles[TAG_LIMB_SEGMENT_UPPER].clone().mulScalar(-1)

    if (!keypoints.elbow ||
        !keypoints.wrist)
        return

    console.log(`angles.upper: ${prettyPrint(angles[TAG_LIMB_SEGMENT_UPPER], 0)}`)
    console.log(`angles_upper_inverse: ${prettyPrint(angles_upper_inverse, 0)}`)
    const basis_lower = rotateBasis(basis_upper, angles_upper_inverse)
    console.log(`basis_lower:\nx: ${prettyPrint(basis_lower.x)}\ny: ${prettyPrint(basis_lower.y)}\nz: ${prettyPrint(basis_lower.z)}`)

    x_elbow_wrist = rotate(x_elbow_wrist, angles_upper_inverse)

    console.log(`x_elbow_wrist: ${prettyPrint(x_elbow_wrist)}`)
    angles[TAG_LIMB_SEGMENT_LOWER] = decomposeEuler(x_elbow_wrist)
    console.log(`angles.lower: ${prettyPrint(angles[TAG_LIMB_SEGMENT_LOWER], 0)}`)
    const angles_lower_inverse = angles[TAG_LIMB_SEGMENT_LOWER].clone().mulScalar(-1)

    if (!keypoints.thumb ||
        !keypoints.pinky)
        return

    const basis_wrist = rotateBasis(basis_lower, angles_lower_inverse)
    console.log(`basis_end:\nx: ${prettyPrint(basis_wrist.x)}\ny: ${prettyPrint(basis_wrist.y)}\nz: ${prettyPrint(basis_wrist.z)}`)

    const x_wrist_thumb = projectToBasis(new Vec3().sub2(keypoints.thumb, keypoints.wrist), basis_wrist)
    const x_wrist_index = projectToBasis(new Vec3().sub2(keypoints.index, keypoints.wrist), basis_wrist)
    const x_wrist_pinky = projectToBasis(new Vec3().sub2(keypoints.pinky, keypoints.wrist), basis_wrist)
    const z_hand = new Vec3().cross(x_wrist_thumb, x_wrist_pinky).normalize()
    console.log(`x_wrist_thumb: ${prettyPrint(x_wrist_thumb)}`)
    console.log(`x_wrist_pinky: ${prettyPrint(x_wrist_pinky)}`)
    console.log(`z_hand: ${prettyPrint(z_hand)}`)

    angles[TAG_LIMB_END][TAG_LIMB_END_PALM] = decomposeEuler(x_wrist_index, z_hand)
    console.log(`angles.end: ${prettyPrint(angles[TAG_LIMB_END][TAG_LIMB_END_PALM], 0)}`)
}

function calcPoseAngles_head(angles: HumanPoseAngles["head"], pose: Partial<Keypoints3D>) {
    /**
     * Estimating rotation of neck:
     * 
     * Pitch: there are three 2D points are found that are mostly colinear:
     * - bottom point (in-between the lips for BlazePose or the ears for
     *   PoseNet/MoveNet)
     * - the nose
     * - top point (in-between the eyes)
     * The time of the nose between those keypoints indicates pitch:
     * - nose is almost at mouth when head is pitched forward/downward 90
     * - nose is around 40-60% when head is looking about straight forward
     * - nose is maybe 75% to between eyes when head pitched up about 45
     * - nose is about between eyes when head is pitched back/upward by 60(?)
     * - nose is about at time -50% when head is pitched up about 90
     * These could be represented by points (t, pitch):
     * (1, 90), (0.5, 0), (0.25, -45), (0, -60), (-0.5, -90)
     * pitch = asin(2t - 1) for t in [0.5, 1]
     *       = asin(t - 0.5) for t in [-0.5, 0.5]
     *       = -90 for t < -0.5
     *       = 90 for t > 1
     * 
     * Yaw: three keypoints to compare: left ear, nose, right ear.
     * The time of the nose in (or not) between the ears can determine yaw.
     * These are some sample points of (time nose between ears, yaw):
     * - (-1, -60)
     * - (0, -30)
     * - (0.5, 0)
     * - (1, 30)
     * - (2, 60)
     * These fit 60*p( (t-0.5)/1.5, 0.63 ) where p(x,y)=sign(x)e^(y ln |x|)
     * 
     * Roll can be estimated from the XY rotation for lips (BlazePose) or ears
     * (Pose/MoveNet). However, I'm not sure if this would overdescribe the
     * rotation - if the pitch and yaw aren't being taken out of account enough
     */

    const blazePose = pose as Partial<KeypointMap<Vec3, BlazePoseKeypointIDs>>

    const essentials = [
        blazePose.mouth_left,
        blazePose.mouth_right,
        pose.nose,
        pose.left_eye,
        pose.right_eye,
        pose.left_ear,
        pose.right_ear,
    ]

    if (!essentials.every(e => e))
        return

    const pitch_0 = new Vec3().add2(blazePose.mouth_left, blazePose.mouth_right).divScalar(2)
    const pitch_1 = pose.nose
    const pitch_2 = new Vec3().add2(pose.left_eye, pose.right_eye).divScalar(2)

    // make these keypoints relative to pitch_0
    pitch_1.sub(pitch_0)
    pitch_2.sub(pitch_0)

    // find the time from point 0 to 2
    const pitch_t = pitch_1.clone().project(pitch_2).length() / pitch_2.length()

    const pitch =
        (pitch_t >= 0.5) ?
            (pitch_t <= 1) ?
                Math.asin((2 * pitch_t) - 1) * 180 / Math.PI :
                90 :
            (pitch_t >= -0.5) ?
                Math.asin(pitch_t - 0.5) * 180 / Math.PI :
                -90

    const yaw_0 = pose.left_ear
    const yaw_1 = pose.nose
    const yaw_2 = pose.right_ear

    const yaw_line = new Vec3().sub2(yaw_2, yaw_0)
    const yaw_proj = yaw_1.clone().sub(yaw_0).project(yaw_line)
    const yaw_t = Math.sign(yaw_proj.dot(yaw_line)) * yaw_proj.length() / yaw_line.length()
    const p = (x: number, y: number) => Math.sign(x) * Math.exp(y * Math.log(Math.abs(x)))
    const yaw = 60 * p((yaw_t - 0.5) / 1.5, 0.63)

    angles.y = pitch
    angles.x = yaw //TODO: switch to using z rotation for this
}

/**
* Calculates the angles needed to rotate a default human rig to match the given
* keypoint 3D positions.
* @param pose the pose keypoint 3D positions to calculate angles for
* @returns the angles needed to rotate a default rig to match the given
* keypoint 3D positions
*/
export function decomposeHumanPoseAngles(pose: Partial<Keypoints3D>): DeeplyPartial<HumanPoseAngles> {
    let angles: DeeplyPartial<HumanPoseAngles> = {
        head: new Vec3(),
        arms: {
            left: {},
            right: {}
        }
    }

    const blazePose = pose as Partial<KeypointMap<Vec3, BlazePoseKeypointIDs>>

    calcPoseAngles_head(angles.head, pose)

    calcPoseAngles_arm(angles.arms.left as Partial<LimbPoseAngles>, true, {
        shoulder: pose.left_shoulder,
        shoulder_other: pose.right_shoulder,
        hip: pose.left_hip,
        elbow: pose.left_elbow,
        wrist: pose.left_wrist,
        thumb: blazePose.left_thumb,
        index: blazePose.left_index,
        pinky: blazePose.left_pinky,
    })

    calcPoseAngles_arm(angles.arms.right as Partial<LimbPoseAngles>, false, {
        shoulder: pose.right_shoulder,
        shoulder_other: pose.left_shoulder,
        hip: pose.right_hip,
        elbow: pose.right_elbow,
        wrist: pose.right_wrist,
        thumb: blazePose.right_thumb,
        index: blazePose.right_index,
        pinky: blazePose.right_pinky,
    })

    return angles
}