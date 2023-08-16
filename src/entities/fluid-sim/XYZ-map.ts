export type XYZMap<T> = {
    [x: number]: {
        [y: number]: {
            [z: number]: T
        }
    }
}

export type XYZCoords = [x: number, y: number, z: number]

export function xyz_has<T>(xyz: XYZMap<T>, [x, y, z]: XYZCoords) {
    return xyz[x] ? xyz[x][y] ? Object.hasOwn(xyz[x][y], z) : false : false
}

export function xyz_get<T>(xyz: XYZMap<T>, [x, y, z]: XYZCoords) {
    return xyz[x] ? xyz[x][y] ? xyz[x][y][z] : undefined : undefined
}

export function xyz_get_adjacent<T>(xyz: XYZMap<T>, [x, y, z]: XYZCoords): {
    relative_diff: XYZCoords,
    xyz_coords: XYZCoords,
    cell: T
}[] {
    return [
        [-1, 0, 0],
        [1, 0, 0],
        [0, -1, 0],
        [0, 1, 0],
        [0, 0, -1],
        [0, 0, 1],
    ].map(([a, b, c]) => ({
            relative_diff: [a, b, c] as XYZCoords,
            xyz_coords: [x + a, y + b, z + c] as XYZCoords,
            cell: xyz_get(xyz, [x + a, y + b, z + c])
        }))
        .filter(({ xyz_coords }) => xyz_has(xyz, xyz_coords))
}

export function xyz_get_adjacent_half<T>(xyz: XYZMap<T>, [x, y, z]: XYZCoords): {
    relative_diff: XYZCoords,
    xyz_coords: XYZCoords,
    cell: T
}[] {
    return [
        [1, 0, 0],
        [0, 1, 0],
        [0, 0, 1],
    ].map(([a, b, c]) => ({
            relative_diff: [a, b, c] as XYZCoords,
            xyz_coords: [x + a, y + b, z + c] as XYZCoords,
            cell: xyz_get(xyz, [x + a, y + b, z + c])
        }))
        .filter(({ xyz_coords }) => xyz_has(xyz, xyz_coords))
}

export function* xyz_get_all<T>(xyz: XYZMap<T>): Generator<[XYZCoords, T]> {
    for (const x of Object.keys(xyz))
        for (const y of Object.keys(xyz[+x]))
            for (const z of Object.keys(xyz[+x][+y]))
                yield [[+x, +y, +z], xyz[+x][+y][+z]]
}

export function xyz_set<T>(xyz: XYZMap<T>, [x, y, z]: XYZCoords, v: T) {
    if (!xyz[x]) xyz[x] = {}
    if (!xyz[x][y]) xyz[x][y] = {}
    xyz[x][y][z] = v
}

export function xyz_delete<T>(xyz: XYZMap<T>, [x, y, z]: XYZCoords) {
    delete xyz[x][y][z]
    if(Object.keys(xyz[x][y]).length === 0) delete xyz[x][y]
    if(Object.keys(xyz[x]).length === 0) delete xyz[x]
}