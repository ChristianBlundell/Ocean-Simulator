import * as linear from 'linear-solve'
import { Mat4, Vec3 } from 'playcanvas'

export interface Basis {
    x: Vec3
    y: Vec3
    z: Vec3
}

/**
 * Projects a vector from world space into this basis.
 * @param v a vector in world-space
 * @param basis the basis to project to
 * @returns the same vector now in the space of this basis;
 * factors for a linear combination of this basis' components
 */
export function projectToBasis(v: Vec3, basis: Basis): Vec3 {
    /**
     * Projecting a vector from world space to basis space is just solving a
     * system of linear equations, solving for x: Ax = v.
     */

    const matrix = [
        [basis.x.x, basis.y.x, basis.z.x],
        [basis.x.y, basis.y.y, basis.z.y],
        [basis.x.z, basis.y.z, basis.z.z],
    ]

    try {
        const [x, y, z] = linear.solve(
            matrix,
            [v.x, v.y, v.z]
        )

        // this is added so a breakpoint can be inserted in debugger tools
        if (isNaN(x) || isNaN(y) || isNaN(z))
            console.warn('NaN')

        return new Vec3(x, y, z)
    }
    catch (x) {
        // this is added so a breakpoint can be inserted in debugger tools
        console.error(x)
    }
}

export function basis2matrix(basis: Basis): Mat4 {
    return new Mat4().set([
        basis.x.x, basis.x.y, basis.x.z, 0,
        basis.y.x, basis.y.y, basis.y.z, 0,
        basis.z.x, basis.z.y, basis.z.z, 0,
        0, 0, 0, 1
    ])
}