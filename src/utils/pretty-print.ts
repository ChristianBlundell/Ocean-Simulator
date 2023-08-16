import { Vec2, Vec3 } from "playcanvas"

export type PrettyPrintable = number | Vec2 | Vec3 | undefined | null | { [k: PropertyKey]: PrettyPrintable }

export function prettyPrint(v: PrettyPrintable, precision: number = 3): string {
    if (v === undefined) {
        return 'undefined'
    }
    else if (v === null) {
        return 'null'
    }
    else if (typeof v === 'number') {
        return v.toFixed(precision)
    }
    else if (v instanceof Vec2) {
        return `[${prettyPrint(v.x)}, ${prettyPrint(v.y)}]`
    }
    else if (v instanceof Vec3) {
        return `[${prettyPrint(v.x)}, ${prettyPrint(v.y)}, ${prettyPrint(v.z)}]`
    }
    else {
        return `{\n${Object.keys(v).map(key => `\t${key}: ${prettyPrint(v[key], precision)}`).join('\n')}\n}`
    }
}