import { ScriptType } from "playcanvas";

export class AIScript extends ScriptType {
    initialize(): void {
        console.log('inited AI')
    }

    update(dt: number): void {
        if (Math.random() > Math.pow(0.9, dt)) {
            this.entity.rigidbody!.applyForce(0, 0, 0.4)
            console.log('jolted forward')
        }

        if (Math.random() > Math.pow(0.5, dt)) {
            const angle = (2 * Math.random() - 1) * 50
            this.entity.rigidbody!.applyTorque(0, 0, angle)
            console.log(`turned ${Math.round(angle)} degrees`)
        }
    }
}