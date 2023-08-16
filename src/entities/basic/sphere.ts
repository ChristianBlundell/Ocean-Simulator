import * as pc from 'playcanvas'
import { calculateNormals, Mesh, PRIMITIVE_TRIANGLES, Vec3 } from 'playcanvas'
import { reparentToRootSaveTransform } from '../../math'
import { E, entity, EntityConfigProps, EntityProps, EntityRuntimeProps } from './entity'

export interface SphereConfigProps extends EntityConfigProps {
    radius?: number
}

export interface SphereRuntimeProps extends EntityRuntimeProps {
}

export type SphereProps = EntityProps<SphereConfigProps, SphereRuntimeProps>


function make_mesh(radius: number) {
    const resolution = { u: 16, v: 16 } // v (vertical resolution) must be even
    const verts = new Float32Array(3 * (2 + (resolution.u * (resolution.v - 1))))
    const indices = new Uint16Array(3 * 2 * resolution.u * (resolution.v - 1))

    for (let polar = 0; polar < resolution.v; polar++) {
        const polar_i = (polar - 1) * resolution.u + 1 // skip 1st angle
        const polar_isFirstOrLast = (polar === 0) || ((polar + 1) === resolution.v)
        const polar_is2ndFromFirstOrLast = (polar === 1) || ((polar + 2) === resolution.v)
        const polar_angle = polar * 2 * Math.PI / resolution.v
        const cos_polar = Math.cos(polar_angle)
        const sin_polar = Math.sin(polar_angle)

        // add last vert
        if (polar_isFirstOrLast) {
            verts[(polar === 0 ? 0 : verts.length - 3) + 0] = radius * cos_polar
            verts[(polar === 0 ? 0 : verts.length - 3) + 1] = 0
            verts[(polar === 0 ? 0 : verts.length - 3) + 2] = 0
        }
        else {
            // add other verts
            for (let theta = 0; theta < resolution.u; theta++) {
                const theta_i = polar_i + theta
                const theta_i_next = polar_i + ((theta + 1) % resolution.u)
                const theta_angle = theta * (2 * Math.PI) / resolution.u
                const cos_theta = Math.cos(theta_angle)
                const sin_theta = Math.sin(theta_angle)

                const indices_offset = (!polar_is2ndFromFirstOrLast ?
                        (3 * 2 * theta_i) :
                        ((3 * 2 * polar_i) + (3 * theta)))

                verts[(3 * theta_i) + 0] = cos_polar * radius
                verts[(3 * theta_i) + 1] = sin_polar * cos_theta * radius
                verts[(3 * theta_i) + 2] = sin_polar * sin_theta * radius

                const vert_0 = theta_i
                const vert_1 = theta_i_next
                const vert_2 = Math.min(theta_i + resolution.u, verts.length - 1)
                const vert_3 = Math.max(theta_i_next - resolution.u, 0)

                indices[indices_offset + 0] = vert_0
                indices[indices_offset + 1] = vert_1
                indices[indices_offset + 2] = vert_2
                indices[indices_offset + 3] = vert_1
                indices[indices_offset + 4] = vert_0
                indices[indices_offset + 5] = vert_3
            }
        }
    }

    const mesh = new Mesh()
    mesh.setPositions(verts)
    mesh.setIndices(indices)
    mesh.setNormals(calculateNormals(verts as unknown as number[], indices as unknown as number[]))
    mesh.update(PRIMITIVE_TRIANGLES)

    return mesh
}

export const Sphere = (props: SphereProps) => {
    const entity = E(props)
    const radius = props.radius ?? 1

    entity.addComponent('render', {
        meshInstances: [new pc.MeshInstance(make_mesh(radius), props.material!)]
    })

    if (props.rigid) {
        entity.addComponent('collision', {
            type: 'sphere',
            radius
        })
        
        reparentToRootSaveTransform(entity)
    }

    return entity
}