import { BasicMaterial, BLEND_NORMAL, Color, CULLFACE_NONE, Entity, ScriptType, Vec3 } from "playcanvas";
import { ATTRIBUTES_DEFINITIONS } from "../../utils";
import { entity, EntityConfigProps, EntityProps, EntityRuntimeProps, Script } from "../basic";
import { XYZCoords, XYZMap, xyz_delete, xyz_get, xyz_get_adjacent, xyz_get_adjacent_half, xyz_get_all, xyz_has, xyz_set } from "./XYZ-map";

export const TAG_FLUID_COLLIDABLE = "fluid_collidable"

export interface DetectorConfigProps extends EntityConfigProps {
    size?: number
    margin?: number
    resolutionPower?: number
}

export interface DetectorRuntimeProps extends EntityRuntimeProps<Entity> {
}

export type DetectorProps = EntityProps<DetectorConfigProps, DetectorRuntimeProps>

export const Detector = ({
        parent, tags,
        size,
        margin,
        resolutionPower
    }: DetectorProps) =>
        Script({
            parent,
            script: DetectorScript,
            attributes: {
                ...(size ? { size } : {}),
                ...(margin ? { margin } : {}),
                ...(resolutionPower ? { resolutionPower } : {})
            },
            tags,
        })
        
interface FluidVoxel {
    fluid: number
    entity: Entity
    collidingEntities: Entity[]
}

interface FluidVoxelBlock {
    inactiveTime: number
}

export class DetectorScript extends ScriptType {
    size!: number
    resolutionPower!: number
    flow_rate!: number
    fluid_density!: number
    TTL_inactive_blocks!: number

    private resolution!: number
    private detectorSize!: Vec3
    private detectorSizeHalf!: Vec3
    private detectorVolume!: number
    private detectorsRoot!: Entity

    private voxels!: XYZMap<FluidVoxel>
    private blocks!: XYZMap<FluidVoxelBlock>
    private entities_created_blocks_for!: Entity[]

    override initialize(): void {
        this.detectorsRoot = entity({
            parent: this.entity,
            tags: ['detectors']
        })

        this.resolution = 2 ** this.resolutionPower
        this.detectorSize = new Vec3().addScalar(1 / (this.resolution * 1.1))
        this.detectorSizeHalf = this.detectorSize.clone().divScalar(2)
        this.detectorVolume = this.detectorSize.x * this.detectorSize.y * this.detectorSize.z

        this.voxels = {}
        this.blocks = {}
        this.entities_created_blocks_for = []
    }

    override update(dt: number): void {
        this.update_fluids(dt)
        this.update_blocks(dt)
    }

    private update_fluids(dt: number) {
        const flow_rate_dt = this.flow_rate * dt

        for (const [coords, voxel_A] of xyz_get_all(this.voxels)) {
            const mat = voxel_A.entity.render.material as BasicMaterial
            if (isNaN(voxel_A.fluid))
                mat.color.set(1, 0, 0, mat.color.a)
            else
                mat.color.set(0, 1, 0.2 * voxel_A.fluid / this.detectorVolume, mat.color.a)
            mat.update()

            if (!isNaN(voxel_A.fluid)) {
                for (const { cell: voxel_B } of xyz_get_adjacent_half(this.voxels, coords)) {
                    if (!isNaN(voxel_B.fluid)) {
                        const fluid_diff = voxel_B.fluid - voxel_A.fluid
                        const fluid_flow = Math.sign(fluid_diff) * Math.min(flow_rate_dt * Math.abs(fluid_diff), voxel_A.fluid, voxel_B.fluid)

                        voxel_A.fluid += fluid_flow
                        voxel_B.fluid -= fluid_flow
                    }
                }
            }
        }
    }

    private update_blocks(dt: number) {
        // Open new blocks for unhandled new entities
        const tagged_entities = this.entity
            .findByTag(TAG_FLUID_COLLIDABLE)
            .filter(entity => entity instanceof Entity)
            .filter(entity => !this.entities_created_blocks_for.includes(entity as Entity)) as Entity[]
        this.entities_created_blocks_for.push(...tagged_entities)
        
        for (const unhandled of tagged_entities) {
            const start = unhandled.getPosition().clone().floor()
            this.openBlock([start.x, start.y, start.z])
        }

        // Close existing blocks that have no activity
        for (const [xyz, block] of xyz_get_all(this.blocks)) {
            const offset = [
                xyz[0] * this.resolution,
                xyz[1] * this.resolution,
                xyz[2] * this.resolution,
            ]

            let isActive = false

            for (let x = 0; x < this.resolution && !isActive; x++)
                for (let y = 0; y < this.resolution && !isActive; y++)
                    for (let z = 0; z < this.resolution && !isActive; z++)
                        isActive ||= xyz_get(this.voxels, [x + offset[0], y + offset[1], z + offset[2]]).collidingEntities.length !== 0
            
            if (isActive)
                block.inactiveTime = NaN
            else {
                if (isNaN(block.inactiveTime))
                    block.inactiveTime = 0
                
                block.inactiveTime += dt

                // If this block is inactive, and all its adjacent blocks are inactive, then it can be closed.
                if (block.inactiveTime > this.TTL_inactive_blocks &&
                    xyz_get_adjacent(this.blocks, xyz).every(adjacentBlock => !isNaN(adjacentBlock.cell.inactiveTime)))
                        this.closeBlock(xyz)
            }
        }
    }

    private openBlock([a, b, c]: XYZCoords) {
        if (xyz_has(this.blocks, [a, b, c]))
            return
        
        xyz_set(this.blocks, [a, b, c], {
            inactiveTime: 0
        })

        for (let x = 0; x < this.resolution; x++)
            for (let y = 0; y < this.resolution; y++)
                for (let z = 0; z < this.resolution; z++)
                    this.openDetector([(a * this.resolution) + x, (b * this.resolution) + y, (c * this.resolution) + z])
    }

    private closeBlock([a, b, c]: XYZCoords) {
        if (!xyz_has(this.blocks, [a, b, c]))
            return
        
        xyz_delete(this.blocks, [a, b, c])

        for (let x = 0; x < this.resolution; x++)
            for (let y = 0; y < this.resolution; y++)
                for (let z = 0; z < this.resolution; z++)
                    this.closeDetector([(a * this.resolution) + x, (b * this.resolution) + y, (c * this.resolution) + z])
    }

    private openDetector(coords: XYZCoords) {
        const position = new Vec3(coords).divScalar(this.resolution)

        const cubeDetector = entity({
            parent: this.detectorsRoot,
            transform: {
                position,
                scale: this.detectorSize
            }
        })

        cubeDetector.addComponent('collision', {
            type: 'box',
            halfExtents: this.detectorSizeHalf
        })
        
        const material = new BasicMaterial()
        material.blendType = BLEND_NORMAL
        material.depthWrite = false
        material.cull = CULLFACE_NONE
        material.color = new Color(0, 0, 0, 0.1 / this.resolution)
        
        material.update()

        cubeDetector.addComponent('render', {
            type: 'box',
            material
        })

        const voxel: FluidVoxel = {
            fluid: this.detectorVolume,
            entity: cubeDetector,
            collidingEntities: []
        }

        cubeDetector.collision.on('triggerenter', (other: Entity) => {
            if (!other.rigidbody)
                return
            
            // Is this voxel on an edge block? If so, make new margin blocks
            // so this voxel is no longer in a margin block
            const coords_vec = new Vec3(coords)
            const other_blocks_coords = [
                    [-1, -1, -1],
                    [ 0, -1, -1],
                    [+1, -1, -1],
                    [-1,  0, -1],
                    [ 0,  0, -1],
                    [+1,  0, -1],
                    [-1, +1, -1],
                    [ 0, +1, -1],
                    [+1, +1, -1],

                    [-1, -1,  0],
                    [ 0, -1,  0],
                    [+1, -1,  0],
                    [-1,  0,  0],
                    [+1,  0,  0],
                    [-1, +1,  0],
                    [ 0, +1,  0],
                    [+1, +1,  0],

                    [-1, -1, +1],
                    [ 0, -1, +1],
                    [+1, -1, +1],
                    [-1,  0, +1],
                    [ 0,  0, +1],
                    [+1,  0, +1],
                    [-1, +1, +1],
                    [ 0, +1, +1],
                    [+1, +1, +1],
                ].map(offsets => new Vec3(offsets)
                    .mulScalar(this.resolution)
                    .add(coords_vec)
                    .divScalar(this.resolution)
                    .floor())
            other_blocks_coords.forEach(vec => this.openBlock([vec.x, vec.y, vec.z]))
            
            // The fluid currently in this voxel will outflow into adjacent cells
            // and from this outflow we find the impulse to exert on the colliding
            // entity (because every action has an equal and opposition reaction).
            
            const adjacent = xyz_get_adjacent(this.voxels, coords).filter(({ cell }) => cell.fluid)
            const fluid_division = voxel.fluid / adjacent.length

            
            const outflowed_direction = new Vec3()

            adjacent.forEach(({ relative_diff, cell: voxel_adjacent }) => {
                voxel_adjacent.fluid += fluid_division
                outflowed_direction.add(new Vec3(relative_diff))
            })

            outflowed_direction.mulScalar(-this.fluid_density * voxel.fluid)
            
            if (!isNaN(outflowed_direction.x) &&
                !isNaN(outflowed_direction.y) &&
                !isNaN(outflowed_direction.z)) {
                const voxel_relative_position = position.clone().sub(other.getPosition())
                other.rigidbody.applyImpulse(outflowed_direction, voxel_relative_position)
            }

            voxel.fluid = NaN
            voxel.collidingEntities.push(other)
        }, this)

        cubeDetector.collision.on('triggerleave', (other: Entity) => {
            voxel.fluid = 0
            voxel.collidingEntities.splice(voxel.collidingEntities.indexOf(other), 1)
        }, this)

        xyz_set(this.voxels, coords, voxel)
    }

    private closeDetector(coords: XYZCoords) {
        const voxel = xyz_get(this.voxels, coords)
        
        voxel.entity.destroy()

        xyz_delete(this.voxels, coords)
    }

    static [ATTRIBUTES_DEFINITIONS] = {
        size: {
            type: 'number',
            min: 0.5,
            default: 3
        },

        resolutionPower: {
            type: 'number',
            min: 0,
            default: 1
        },

        flow_rate: {
            type: 'number',
            min: 0,
            default: 0.8
        },

        fluid_density: {
            type: 'number',
            min: 0.001,
            default: 0.2
        },

        TTL_inactive_blocks: {
            type: 'number',
            min: 1,
            default: 2.5
        }
    }
}