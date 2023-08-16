import { ScriptType, Vec3 } from "playcanvas";
import { transform } from "../math";
import { ATTRIBUTES_DEFINITIONS, ScriptAttributeDefinition, ScriptAttributesDefinition } from "./use-script";

export class RotateScript extends ScriptType {
    speed!: number

    override update(dt: number): void {
        transform(this.entity, {
            rotation: new Vec3(0, 0, this.speed * dt)
        })
    }

    static [ATTRIBUTES_DEFINITIONS]: ScriptAttributesDefinition<typeof RotateScript> = {
        speed: {
            type: "number",
            default: 15
        } as ScriptAttributeDefinition
    }
}