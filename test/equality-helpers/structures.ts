import { Vec3 } from "playcanvas";
import { vectorsEq } from "./vectors";

export function structuresEq(expected: any, actual: any): boolean {
    if (expected instanceof Vec3)
        return vectorsEq(expected as Vec3, actual as Vec3)
    
    const keys = Object.keys(expected).filter(key => expected[key])
    
    return keys.every(key =>
            Object.hasOwn(actual, key) &&
            structuresEq(expected[key], actual[key])
        )
}