import { Mesh, PRIMITIVE_LINES } from "playcanvas";
import { EntityConfigProps, EntityProps, EntityRuntimeProps } from "./entity";
import { mesh } from "./mesh";

export interface GridRange {
    /**
     * @default -10
     */
    min: number

    /**
     * @default 10
     */
    max: number
}

export interface GridConfigProps extends EntityConfigProps {
    /**
     * @default 1
     */
    spacing?: number

    range?: {
        x?: GridRange
        y?: GridRange
    }
}

export interface GridRuntimeProps extends EntityRuntimeProps {
}

export type GridProps = EntityProps<GridConfigProps, GridRuntimeProps>

function make_mesh(config: GridConfigProps) {
    const spacing = config.spacing ?? 1

    const range_x_min = Math.floor(config.range?.x?.min ?? -10)
    const range_y_min = Math.floor(config.range?.y?.min ?? -10)
    const range_x_max = Math.ceil(config.range?.x?.max ?? 10)
    const range_y_max = Math.ceil(config.range?.y?.max ?? 10)

    const resolution = {
        x: range_x_max - range_x_min + 1,
        y: range_y_max - range_y_min + 1,
    }

    const verts = new Float32Array(3 * (resolution.x * resolution.y))
    const indices = new Uint16Array(2 * ((2 * (resolution.x * resolution.y)) - (resolution.x + resolution.y)))

    for (let x = 0; x < resolution.x; x++) {
        for (let y = 0; y < resolution.y; y++) {
            const vert_i = x + (y * resolution.x)
            const vert_next_x = vert_i + 1
            const vert_next_y = vert_i + resolution.x
            const vert_offset = 3 * vert_i
            
            const indices_i = (2 * x) + (y * ((2 * resolution.x) - 1))
            let indices_offset = 2 * indices_i

            verts[vert_offset + 0] = (x + range_x_min) * spacing
            verts[vert_offset + 1] = (y + range_y_min) * spacing

            if ((x + 1) !== resolution.x) {
                indices[indices_offset++] = vert_i
                indices[indices_offset++] = vert_next_x
            }
            if ((y + 1) !== resolution.y) {
                indices[indices_offset++] = vert_i
                indices[indices_offset++] = vert_next_y
            }
        }
    }

    const mesh = new Mesh()
    mesh.setPositions(verts)
    mesh.setIndices(indices)
    mesh.update(PRIMITIVE_LINES)
    return mesh
}

export const Grid = (props: GridProps) =>
    mesh({
        ...props,
        mesh: make_mesh(props)
    })