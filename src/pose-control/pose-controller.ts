import { Rig } from "./rig";

export interface PoseController<PoseAngles extends object = object> {
    initialize(): Promise<void>
    update(rig: Rig<PoseAngles>, dt: number): void
}