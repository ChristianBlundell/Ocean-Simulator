import { Material, ScriptType, Mesh, Vec3, PRIMITIVE_TRIANGLES, MeshInstance, calculateNormals, Entity, Asset } from "playcanvas"
import { uniqueId } from "underscore"
import { beizerSpline, bezierSplineKeypointRotationBases } from "../../../math"
import { ATTRIBUTES_DEFINITIONS, ScriptAttributesDefinition } from "../../../utils"
import { EntityConfigProps, EntityRuntimeProps, EntityProps } from "../entity"
import { Script } from "../script"
import { SplineResolution, LayoutScript } from "./layout"

export interface SolidifyResolution extends SplineResolution {
    theta: number
}

export interface SolidifyConfigProps extends EntityConfigProps {
    radius: number | string

    resolution?: SolidifyResolution
}

export interface SolidifyRuntimeProps extends EntityRuntimeProps<Entity> {
    material: Material
}

export type SolidifyProps = EntityProps<SolidifyConfigProps, SolidifyRuntimeProps>

export const Solidify = (props: SolidifyProps) =>
    Script({
        ...props,
        script: SolidifyScript,
        attributes: {
            resolution: props.resolution,
            material: new Asset(uniqueId(), 'material', undefined, props.material)
        }
    })


export class SolidifyScript extends ScriptType {
    resolution!: SolidifyResolution
    material: Asset

    private mesh!: Mesh
    private last_update!: {
        positions: Vec3[]
    }

    override initialize(): void {
        this.last_update = {
            positions: [],
        }

        this.mesh = new Mesh(this.app.graphicsDevice)
        this.mesh.setPositions([])
        this.mesh.setIndices([])
        this.mesh.update(PRIMITIVE_TRIANGLES)

        const material = this.material.data as Material
        const meshInstance = new MeshInstance(this.mesh, material)
        this.entity.removeComponent('model')
        this.entity.addComponent('render', {
            meshInstances: [meshInstance]
        })
    }

    override update(dt: number): void {
        const children_t = LayoutScript.getSplineChildrenT(this.entity)
        const keypointsInfo = LayoutScript.keypointsInfo(children_t, this.last_update)

        if (keypointsInfo.changed) {
            this.remesh(keypointsInfo.keypoints)
        }
    }

    private remesh(keypoints: Vec3[]): Vec3[] {
        const resolution_length = (keypoints.length - 1) * this.resolution.t
        const resolution_total_vertecies = (resolution_length + 1) * this.resolution.theta
        const resolution_total_triangles = resolution_length * 2 * this.resolution.theta

        const mesh_positions = new Float32Array(resolution_total_vertecies * 3)
        const mesh_indices = new Uint16Array(resolution_total_triangles * 3)

        const splinePoints = beizerSpline(keypoints, this.resolution.t)

        const { keypoints_rotations, bases_spline_x, bases_spline_y } =
            bezierSplineKeypointRotationBases(keypoints, splinePoints, this.resolution.t)

        for (let keypoint_i = 0; keypoint_i < keypoints.length; keypoint_i++) {
            const isLast = (keypoint_i + 1) === keypoints.length
            for (let t_i = 0; t_i < (isLast ? 1 : this.resolution.t); t_i++) {
                const splinePoints_i = (keypoint_i * this.resolution.t) + t_i
                const splinePoint = splinePoints[splinePoints_i]
                const mesh_positions_offset_t = this.resolution.theta * splinePoints_i * 3
                const mesh_indices_offset_t = this.resolution.theta * splinePoints_i * 6

                for (let theta_i = 0; theta_i < this.resolution.theta; theta_i++) {
                    const mesh_positions_offset_t_theta = mesh_positions_offset_t + theta_i * 3
                    const theta = theta_i * 2 * Math.PI / this.resolution.theta
                    const radius = 0.025

                    const r_cos = radius * Math.cos(theta)
                    const r_sin = radius * Math.sin(theta)

                    const basis_x = bases_spline_x[splinePoints_i]
                    const basis_y = bases_spline_y[splinePoints_i]

                    mesh_positions[mesh_positions_offset_t_theta + 0] = splinePoint.x + (basis_x.x * r_cos) + (basis_y.x * r_sin)
                    mesh_positions[mesh_positions_offset_t_theta + 1] = splinePoint.y + (basis_x.y * r_cos) + (basis_y.y * r_sin)
                    mesh_positions[mesh_positions_offset_t_theta + 2] = splinePoint.z + (basis_x.z * r_cos) + (basis_y.z * r_sin)
                }

                if (!isLast) {
                    for (let theta_i = 0; theta_i < this.resolution.theta; theta_i++) {
                        const mesh_indices_offset_t_theta = mesh_indices_offset_t + theta_i * 6

                        const vert_index_00 = (splinePoints_i * this.resolution.theta) + (theta_i)
                        const vert_index_01 = (splinePoints_i * this.resolution.theta) + ((theta_i + 1) % this.resolution.theta)
                        const vert_index_10 = vert_index_00 + this.resolution.theta
                        const vert_index_11 = vert_index_01 + this.resolution.theta

                        mesh_indices[mesh_indices_offset_t_theta + 0] = vert_index_00
                        mesh_indices[mesh_indices_offset_t_theta + 1] = vert_index_01
                        mesh_indices[mesh_indices_offset_t_theta + 2] = vert_index_11
                        mesh_indices[mesh_indices_offset_t_theta + 3] = vert_index_00
                        mesh_indices[mesh_indices_offset_t_theta + 4] = vert_index_11
                        mesh_indices[mesh_indices_offset_t_theta + 5] = vert_index_10
                    }
                }
            }
        }

        this.mesh.setPositions(mesh_positions)
        this.mesh.setIndices(mesh_indices)
        this.mesh.setNormals(calculateNormals(mesh_positions as unknown as number[], mesh_indices as unknown as number[]))
        this.mesh.update(PRIMITIVE_TRIANGLES)

        return keypoints_rotations
    }

    static readonly [ATTRIBUTES_DEFINITIONS]: ScriptAttributesDefinition<typeof SolidifyScript> = {
        resolution: {
            type: 'json',
            schema: [
                {
                    name: 't',
                    type: 'number',
                    min: 1,
                    default: 20
                },
                {
                    name: 'theta',
                    type: 'number',
                    min: 3,
                    default: 8
                }
            ]
        },

        material: {
            type: "asset",
            assetType: 'material',
        },
    }
}