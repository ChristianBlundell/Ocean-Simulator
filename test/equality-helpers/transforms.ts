import { BasicTransform } from "../../src/math";
import { vectorsEq } from "./vectors";

export function transformsEq(a: BasicTransform, b: BasicTransform) {
    return (
        vectorsEq(a.position, b.position) &&
        vectorsEq(a.rotation, b.rotation) &&
        vectorsEq(a.scale, b.scale)
    )
}