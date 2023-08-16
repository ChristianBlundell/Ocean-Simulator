import { assert } from "chai"
import { Vec3 } from "playcanvas"
import { prettyPrint } from "../../src/utils"

export function vectorsEq(a?: Vec3, b?: Vec3) {
    if (!a && !b) return true
    if (!a || !b) return false

    console.log(`Comparing if equal: ${prettyPrint(a)} = ${prettyPrint(b)}`)

    const dist = a.distance(b)
    return dist < 0.05
}