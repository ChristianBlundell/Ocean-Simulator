import { Vec3 } from "playcanvas";
import { default as BezierSpline } from 'bezier-spline'
import { decomposeEuler } from "./euler";

export function beizerSpline(
        points: Vec3[],
        resolution_per_segment: number
    ): Vec3[] {
    const spline = new BezierSpline(points.map(point => [point.x, point.y, point.z]))
    const interpolated: Vec3[] = new Array((resolution_per_segment * (points.length - 1)) + 1)

    for (let i = 0; i < points.length - 1; i++) {
        const curve = spline.curves[i]
        const interpolated_offset = i * resolution_per_segment

        for (let j = 0; j < resolution_per_segment; j++) {
            const point = curve.at(j / resolution_per_segment)
            interpolated[interpolated_offset + j] = new Vec3(point[0], point[1], point[2])
        }
    }

    interpolated[interpolated.length - 1] = points[points.length - 1]

    return interpolated
}

export function beizerSplineAt(
        points: Vec3[],
        t: number
    ): Vec3 {
    if (t <= 0) return points[0]
    else if (t >= points.length - 1) return points[points.length - 1]
    
    const spline = new BezierSpline(points.map(point => [point.x, point.y, point.z]))
    const curve = spline.curves[Math.floor(t)]
    const point = curve.at(t % 1)
    
    return new Vec3(point[0], point[1], point[2])
}

export function bezierSplineInfoAt(
        points: Vec3[],
        t: number
    ) {
    const spline = new BezierSpline(points.map(point => [point.x, point.y, point.z]))
    const curve = spline.curves[(t === (points.length - 1)) ? points.length - 2 : Math.floor(t)]
    
    const OFFSET = 0.01
    
    const t_local = (t === (points.length - 1)) ? 1 : (t % 1)
    const isLast = t_local + (2.5 * OFFSET) > 1

    const r0 = isLast ? curve.at(t_local - (2 * OFFSET)) : curve.at(t_local + (0 * OFFSET))
    const r1 = isLast ? curve.at(t_local - (1 * OFFSET)) : curve.at(t_local + (1 * OFFSET))
    const r2 = isLast ? curve.at(t_local - (0 * OFFSET)) : curve.at(t_local + (2 * OFFSET))

    const p0 = new Vec3(r0[0], r0[1], r0[2])
    const p1 = new Vec3(r1[0], r1[1], r1[2])
    const p2 = new Vec3(r2[0], r2[1], r2[2])

    const tanget0 = new Vec3().sub2(p1, p0).normalize()
    const tanget1 = new Vec3().sub2(p2, p1).normalize()
    
    const position = p0
    const tanget = tanget0
    const normal = new Vec3().sub2(tanget1, tanget0).normalize()
    const binormal = new Vec3().cross(tanget, normal)
    const rotation = decomposeEuler(tanget)

    return {
        position,
        tanget,
        normal,
        binormal,
        rotation,
    }
}

export function bezierSplineKeypointRotationBases(
    keypoints: Vec3[],
    splinePoints: Vec3[],
    resolution_t: number
) {
    const keypoints_rotations: Vec3[] = []
    
    const tangets: Vec3[] = []
    const normals: Vec3[] = []
    const binormals: Vec3[] = []
    
    for (let keypoint_i = 0; keypoint_i < keypoints.length; keypoint_i++) {
        const splinePoints_i = keypoint_i * resolution_t
        const isLast = (keypoint_i + 1) === keypoints.length

        const p0 = isLast ? splinePoints[splinePoints.length - 3] : splinePoints[splinePoints_i + 0]
        const p1 = isLast ? splinePoints[splinePoints.length - 2] : splinePoints[splinePoints_i + 1]
        const p2 = isLast ? splinePoints[splinePoints.length - 1] : splinePoints[splinePoints_i + 2]

        const tanget0 = new Vec3().sub2(p1, p0).normalize()
        const tanget1 = new Vec3().sub2(p2, p1).normalize()
        
        const tanget = tanget0
        const normal = new Vec3().sub2(tanget1, tanget0).normalize()
        const binormal = new Vec3().cross(tanget, normal)

        //TODO: adjust so that x and y axes are aligned with normal and binormal
        const rotation = decomposeEuler(tanget)
        
        keypoints_rotations.push(rotation)
        tangets.push(tanget)
        normals.push(normal)
        binormals.push(binormal)
    }

    const bases_spline_x = beizerSpline(normals, resolution_t)
    const bases_spline_y = beizerSpline(binormals, resolution_t)

    //TODO: I don't think this will work if the keypoints are in a line

    return {
        keypoints_rotations,
        bases_spline_x,
        bases_spline_y,

        tangets,
        normals,
        binormals,
    }
}