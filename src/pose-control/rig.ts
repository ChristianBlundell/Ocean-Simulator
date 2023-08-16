import { Entity, ScriptType, Vec2, Vec3 } from "playcanvas";
import _ from "underscore";
import { Script } from "../entities";
import { EulerAngle } from "../math";
import { ATTRIBUTES_DEFINITIONS, ConeTwistConstraint, DeeplyPartial, findByTagsAll, getScript, HingeConstraint, updateWithDeeplyPartial } from "../utils";
import { PoesAnglesMapped } from "./pose-angles-mapped";
import { PoseController } from "./pose-controller";

export class Rig<PoseAngles extends object = object> {
    controllers: PoseController[] = []
    
    constructor(
            public currentPose: PoseAngles
        ) {
    }

    async initialize() {
        await Promise.all(this.controllers.map(controller => controller.initialize()))
    }

    update(dt: number) {
        this.controllers.forEach(controller => controller.update(this, dt))
    }

    apply(pose: DeeplyPartial<PoseAngles>) {
        updateWithDeeplyPartial(this.currentPose, pose)
    }

    control(entity: Entity) {
        const script = Script({
            parent: entity,
            script: RigControlScript,
            attributes: {}
        }) as RigControlScript<PoseAngles>
        
        script.rig = this
    }
}

type PoseAnglesJoints<T> = PoesAnglesMapped<T, HingeConstraint, ConeTwistConstraint>

class RigControlScript<PoseAngles extends object = object> extends ScriptType {
    rig!: Rig<PoseAngles>
    private joints!: PoseAnglesJoints<PoseAngles>
    private rig_status?: 'initializing' | 'initialized'

    private async init_rig() {
        this.rig_status = 'initializing'
        await this.rig.initialize()

        const name = this.entity.name
        const getJoints = (...hierarchy: string[]): PoseAnglesJoints<unknown> => {
            const angles = _.get(this.rig.currentPose, hierarchy)
            const part = findByTagsAll(this.entity, name, ...hierarchy)

            if(typeof angles === 'number')
                return getScript(part, HingeConstraint)
            else if (angles instanceof Vec3)
                return getScript(part, ConeTwistConstraint)
            else if (typeof angles === 'object')
                return _.mapObject(angles, key => getJoints(...hierarchy, key))
            else throw new Error('joint angle not supported')
        }

        this.joints = getJoints() as PoseAnglesJoints<PoseAngles>

        this.rig_status = 'initialized'
    }

    override update(dt: number): void {
        if (!this.rig_status) {
            this.init_rig()
        }
        
        if (this.rig_status !== 'initialized')
            return
        
        this.rig.update(dt)

        //TODO: find corresponding joints and apply this.rig.currentPose to update it to match
        // Also, consider that not everything can be kinematic -
        // what if this.rig is the expected rig and this code here applies increasing torque to match
        // the given pose? This would go along with the thought of individual joints' poses
        // having a weight to them, and that's where the torque would be calculated from.

        this.update_joint()
    }

    private update_joint(...hierarchy: string[]) {
        const joint = _.get(this.joints, hierarchy)
        const pose = _.get(this.rig.currentPose, hierarchy)

        if (joint instanceof HingeConstraint)
            joint.setAngle(pose as number)
        else if (joint instanceof ConeTwistConstraint)
            joint.setAngle(pose as Vec3)
        else Object.keys(joint).forEach(key => this.update_joint(...hierarchy, key))
    }

    static [ATTRIBUTES_DEFINITIONS]: {
    }
}