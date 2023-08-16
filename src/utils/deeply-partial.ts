import { Vec2, Vec3, Vec4, Mat3, Mat4 } from "playcanvas"

export type DeeplyPartial<T> =
    T extends object ?
        T extends (Vec2 | Vec3 | Vec4 | Mat3 | Mat4) ? T | undefined :
        { [K in keyof T]?: DeeplyPartial<T[K]> } :
    T

const literalObjectsTypes = [Vec2, Vec3, Vec4, Mat3, Mat4]
const copyableObjectTypes = [Vec2, Vec3, Vec4, Mat3, Mat4]

export function updateWithDeeplyPartial<T>(ref: T, updates: DeeplyPartial<T>) {
    const ref_any = ref as any

    if (updates) {
        for (const [key, value] of Object.entries(updates)) {
            if (typeof value === 'object' &&
                !literalObjectsTypes.some(type => value instanceof type))
                updateWithDeeplyPartial(ref_any[key], value)
            else {
                if (copyableObjectTypes.some(type => ref_any[key] instanceof type && value instanceof type))
                    ref_any[key].copy(value)
                else ref_any[key] = value
            }
        }
    }
}