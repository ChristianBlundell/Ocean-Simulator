import _ from "underscore";
import { PoseAnglesMappedNumbers } from "../pose-angles-mapped";
import { PoseController } from "../pose-controller";
import { Rig } from "../rig";

/**
 * TODO: consider:
 * 
 * Should the pose detectors have knowledge about the creatures they're
 * controlling poses for? the individual joints' ROM's, and which joints
 * are there or not?
 * 
 * Also, can joints be fuzzily updated, with a degree of uncertainty,
 * and this recent cumulative uncertainty can influence the weight of the
 * rhythmic sine behavoir?
 * 
 * Or would the user want to say ahead of time "I'm just using upper body"
 * or "swim with arms & legs" or "go into mouth mode". I am thinking that
 * mouth mode might not be the most beneficial feature for this game.
 */

export interface JointConfig {
    mean: number
    amplitude: number
    phaseOffset: number
}

export class RhythmicSinePoseController<PoseAngles extends object = object> implements PoseController<PoseAngles> {
    constructor(public readonly joints: PoseAnglesMappedNumbers<PoseAngles, JointConfig>) {
    }

    async initialize(): Promise<void> {
    }

    update(rig: Rig, dt: number): void {
        // should all joints get larger when swimming faster?
        // or should just the frequency increase?
        const amplitude_factor = 1
        const frequency = 0.5
        const phase_progress = frequency * dt

        const update = (...hierarchy: string[]) => {
            const currentPose = _.get(rig.currentPose, hierarchy)
            if (typeof currentPose === 'number') {
                const jointConfig = _.get(this.joints, hierarchy) as JointConfig

                const currentPhase = Math.asin(
                        (currentPose - jointConfig.mean) /
                        (jointConfig.amplitude * amplitude_factor)
                    ) / Math.PI

                const newPhase = currentPhase + phase_progress
                const newPose = Math.sin(newPhase * Math.PI)
                    * (jointConfig.amplitude * amplitude_factor)
                    + jointConfig.mean
                
                const assignmentObj = _.get(rig.currentPose, _.take(hierarchy, hierarchy.length - 1)) as any
                assignmentObj[_.last(hierarchy)] = newPose
            }
        }
        
        update()
    }
}