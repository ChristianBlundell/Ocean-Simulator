import { calculateNormals, Mesh, PRIMITIVE_TRIANGLES, RESOLUTION_AUTO, Vec3 } from 'playcanvas'
import { reparentToRootSaveTransform } from '../../math'
import { entity, EntityConfigProps, EntityProps, EntityRuntimeProps } from './entity'
import { mesh } from './mesh'

export interface CapsuleConfigProps extends EntityConfigProps {
    radius?: number
    radius1?: number
    radius2?: number
    height?: number
    axis?: 0 | 1 | 2
}

export interface CapsuleRuntimeProps extends EntityRuntimeProps {
}

export type CapsuleProps = EntityProps<CapsuleConfigProps, CapsuleRuntimeProps>

function make_mesh(
        height: number,
        radius1: number,
        radius2: number,
        axis: CapsuleProps['axis'] = 0
    ) {
    const resolution = { u: 32, v: 16 } // v (vertical resolution) must be even
    const verts = new Float32Array(3 * 2 * (1 + (resolution.u * (resolution.v / 2))))
    const indices = new Uint16Array(3 * 2 * resolution.u * resolution.v)
    
    const axisA = (axis + 0) % 3
    const axisB = (axis + 1) % 3
    const axisC = (axis + 2) % 3

    function makeHemisphere(
            initial_offsets: { indices: number, verts: number },
            radius: number,
            center: Vec3,
            invertA: boolean
        ) {
        const initial_index = {
            indices: initial_offsets.indices / 3,
            verts: initial_offsets.verts / 3,
        }

        for (let polar = 0; polar < resolution.v / 2; polar++) {
            const polar_i = polar * resolution.u
            const polar_is2ndToLast = (polar + 1) >= (resolution.v / 2)
            const polar_angle = polar * Math.PI / resolution.v
            const cos_polar = Math.cos(polar_angle)
            const sin_polar = Math.sin(polar_angle)

            // add last vert
            if (polar_is2ndToLast) {
                verts[3 * (polar_i + resolution.u) + initial_offsets.verts + axisA] = center.x + radius * (invertA ? -1 : 1)
                verts[3 * (polar_i + resolution.u) + initial_offsets.verts + axisB] = center.y
                verts[3 * (polar_i + resolution.u) + initial_offsets.verts + axisC] = center.z
            }

            // add other verts
            for (let theta = 0; theta < resolution.u; theta++) {
                const theta_i = polar_i + theta
                const theta_i_next = polar_i + ((theta + 1) % resolution.u)
                const theta_angle = theta * (2 * Math.PI) / resolution.u
                const cos_theta = Math.cos(theta_angle)
                const sin_theta = Math.sin(theta_angle)

                const verts_offset = initial_offsets.verts + (3 * theta_i)
                const indices_offset = initial_offsets.indices +
                    (!polar_is2ndToLast ?
                        (3 * 2 * theta_i) :
                        ((3 * 2 * polar_i) + (3 * theta)))

                verts[verts_offset + axisA] = center.x + sin_polar * radius * (invertA ? -1 : 1)
                verts[verts_offset + axisB] = center.y + cos_polar * cos_theta * radius
                verts[verts_offset + axisC] = center.z + cos_polar * sin_theta * radius

                const vert_0 = initial_index.verts + theta_i
                const vert_1 = initial_index.verts + theta_i_next
                const vert_2 = initial_index.verts + (polar_is2ndToLast ? polar_i : theta_i) + resolution.u
                const vert_3 = initial_index.verts + theta_i_next + resolution.u

                indices[indices_offset + 0] = invertA ? vert_1 : vert_0
                indices[indices_offset + 1] = invertA ? vert_0 : vert_1
                indices[indices_offset + 2] = invertA ? vert_2 : vert_2
                if (!polar_is2ndToLast) {
                    indices[indices_offset + 3] = invertA ? vert_3 : vert_1
                    indices[indices_offset + 4] = invertA ? vert_1 : vert_3
                    indices[indices_offset + 5] = invertA ? vert_2 : vert_2
                }
            }
        }
    }

    makeHemisphere(
        {
            indices: 0,
            verts: 0
        },
        radius1,
        new Vec3(height, 0, 0),
        false
    )

    makeHemisphere(
        {
            indices: 3 * resolution.u * (1 + (2 * ((resolution.v / 2) - 1))),
            verts: 3 * (1 + (resolution.u * (resolution.v / 2)))
        },
        radius2,
        new Vec3(0, 0, 0),
        true
    )

    function makeBridge() {
        const vert_index_hemisphere_2 = (1 + (resolution.u * (resolution.v / 2)))
        
        const bridge_offset_indices = 3 * 2 * resolution.u * (resolution.v - 1)
        
        for (let i = 0; i < resolution.u; i++) {
            const vert_0 = i
            const vert_1 = (i + 1) % resolution.u
            const vert_2 = vert_0 + vert_index_hemisphere_2
            const vert_3 = vert_1 + vert_index_hemisphere_2

            indices[bridge_offset_indices + (2 * 3 * i) + 0] = vert_0
            indices[bridge_offset_indices + (2 * 3 * i) + 1] = vert_3
            indices[bridge_offset_indices + (2 * 3 * i) + 2] = vert_1
            indices[bridge_offset_indices + (2 * 3 * i) + 3] = vert_0
            indices[bridge_offset_indices + (2 * 3 * i) + 4] = vert_2
            indices[bridge_offset_indices + (2 * 3 * i) + 5] = vert_3
        }
    }

    makeBridge()

    const mesh = new Mesh()
    mesh.setPositions(verts)
    mesh.setIndices(indices)
    mesh.setNormals(calculateNormals(verts as unknown as number[], indices as unknown as number[]))
    mesh.update(PRIMITIVE_TRIANGLES)

    return mesh
}

export const Capsule = (props: CapsuleProps) => {
    const height = props.height ?? 1
    const radius = props.radius ?? 1
    const radius1 = props.radius1 ?? radius
    const radius2 = props.radius2 ?? radius
    const axis = props.axis ?? 0

    const e = mesh({
        ...props,
        mesh: make_mesh(
            height,
            radius1,
            radius2,
            axis
        )
    })

    if (props.rigid) {
        e.collision.type = 'compound'

        if ((props.radius1 ?? props.radius) === (props.radius2 ?? props.radius)) {
            const realCollider = entity({ parent: e })
            realCollider.translateLocal(
                    axis === 0 ? radius : 0,
                    axis === 1 ? radius : 0,
                    axis === 2 ? radius : 0
                )
            realCollider.addComponent('collision', {
                type: 'capsule',
                height: height + (2 * radius),
                radius,
                axis
            })
        }
        else {
            const resolution_h = 4
            for (let i = 0; i < resolution_h * height; i++) {
                const a = i / resolution_h
                const r = (a / height) * (radius1 - radius2) + radius2

                const collider = entity({ parent: e })
                collider.translateLocal(
                        axis === 0 ? a : 0,
                        axis === 1 ? a : 0,
                        axis === 2 ? a : 0
                    )
                collider.addComponent('collision', {
                    type: 'sphere',
                    radius: r
                })
            }
        }
        
        reparentToRootSaveTransform(e)
    }

    return e
}