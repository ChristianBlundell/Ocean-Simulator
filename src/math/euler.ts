import { Mat4, Vec3 } from "playcanvas";
import { prettyPrint } from "../utils";
import { Basis } from "./basis";
import { xy } from "./swizzling";

// Currently the xyz coordinates are used to mean (roll, pitch, yaw)
export type EulerAngle = Vec3

/**
 * Rotates a vector by given euler angles.
 * @param v the vector to rotate
 * @param eulerAngle the euler angles to rotate by
 * @returns that vector, rotated by the given euler angles
 */
export function rotate(v: Vec3, eulerAngle: EulerAngle): Vec3 {
    return new Mat4().setFromEulerAngles(eulerAngle.x, eulerAngle.y, eulerAngle.z).transformVector(v)
}

/**
 * Rotates a basis by given euler angles around its own axes.
 * @param basis the basis to rotate. The components for this basis also serve
 * as the axes of rotation.
 * @param rotation the rotation to rotate to this basis by. The rotations for
 * these angles are done around the basis component vectors themselves.
 * @returns a new basis computed from the original basis but rotated around its
 * own axes.
 */
export function rotateBasis({ x, y, z }: Basis, rotation: EulerAngle): Basis {
    const mx = new Mat4().setFromAxisAngle(x, rotation.x)
    const my = new Mat4().setFromAxisAngle(y, rotation.y)
    const mz = new Mat4().setFromAxisAngle(z, rotation.z)
    const m = new Mat4().setIdentity()
    m.mulAffine2(mx, m)
    m.mulAffine2(my, m)
    m.mulAffine2(mz, m)
    
    return {
        x: m.transformVector(x),
        y: m.transformVector(y),
        z: m.transformVector(z),
    }
}

/**
 * Computes the euler XYZ angles needed to rotate [1, 0, 0] to get to {@link v}
 * optionally pointing with a local Z+ vector of {@link up}.
 * @param v a vector to find the euler XYZ angles to get to from [1, 0, 0]
 * @param up the final local Z+ vector this rotation should orient to
 * (defaults to [0, 0, 1]). This vector should be perpendicular to {@link v}.
 */
export function decomposeEuler(v: Vec3, up?: Vec3): EulerAngle {
    /**
     * First we find the pitch and yaw needed to get [1, 0, 0] to point to `v`,
     * then we compute the roll component that would align with `up`.
     * 
     * To compute the pitch, we imagine a triangle with its adjacent leg on the
     * xy plane and its opposite leg extending upward, only in the z-dimension.
     * The pitch is the angle opposite the opposite leg of this triangle.
     * 
     * The yaw is just the angle of rotation on the xy plane:
     * atan(y/x) adjusted for a complete 360 degrees.
     * 
     * The roll can only be computed if an up vector was given. Using the pitch
     * and yaw, an ideal up vector is computed as if there was a roll of zero,
     * and then the roll component can be computed using
     * acos(dot(real up, ideal up)). To discern if the roll is positive or
     * negative, this angle is also computed between the up and ideal right
     * vectors (found by crossing the given vector and its ideal up).
     * Whether or not that angle (between real up and ideal right) is more than
     * 90 degrees determines whether or not the roll is positive or negative.
     */

    v = v.clone().normalize()
    if (up) {
        up = up.clone().normalize()
        if (up.dot(v) !== 0) {
            up.cross(v, up) // = right
            up.cross(up, v) // = orthogonal up
            up.normalize()
        }
    }

    const xy_plane = xy(v)

    const pitch = Math.atan2(-v.z, xy_plane.length()) * 180 / Math.PI
    const yaw = Math.atan2(xy_plane.y, xy_plane.x) * 180 / Math.PI

    let roll: number

    if (up) {
        const ideal_up = rotate(Vec3.BACK, new Vec3(0, pitch, yaw))
        const ideal_right = new Vec3().cross(v, ideal_up)
        const roll_up = Math.acos(ideal_up.dot(up)) * 180 / Math.PI
        const roll_right = Math.acos(ideal_right.dot(up))
        
        roll = roll_up * ((roll_right > (Math.PI / 2)) ? -1 : 1)
        if(isNaN(roll)) roll = 0
    }
    else {
        roll = 0
    }

    return new Vec3(roll, pitch, yaw)
}