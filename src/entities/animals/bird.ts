import { Vec3, RIGIDBODY_TYPE_DYNAMIC } from "playcanvas"
import { Hinge } from "../../utils"
import { Box, EntityProps } from "../basic"
import { TAG_FLUID_COLLIDABLE } from "../fluid-sim"

export const Bird = (props: EntityProps) => {
    const bird = Box({
        ...props,
        rigid: {
            type: RIGIDBODY_TYPE_DYNAMIC,
            mass: 1,
            restitution: 0.5
        }
    })
    
    const wing1a = Box({
        parent: bird,
        size: new Vec3(1, 0.4, 0.1),
        transform: {
            position: new Vec3(1.2, 0, 0),
        },
        tags: props.tags,
        rigid: {
            type: RIGIDBODY_TYPE_DYNAMIC,
            mass: 0.2,
        }
    })
    const wing1b = Box({
        parent: wing1a,
        size: new Vec3(1, 0.4, 0.1),
        transform: {
            position: new Vec3(1.2, 0, 0),
        },
        tags: props.tags,
        rigid: {
            type: RIGIDBODY_TYPE_DYNAMIC,
            mass: 0.2,
        }
    })

    const hinge1a = Hinge({
        entityA: wing1a,
        entityB: bird,
        pivotA: new Vec3(-0.6, 0, 0),
        pivotB: new Vec3(0.6, 0, 0),
        axisA: new Vec3(0, 1, 0),
        axisB: new Vec3(0, 1, 0),
        disableCollisionBetweenLinkedBodies: false,
    })
    const hinge1b = Hinge({
        entityA: wing1b,
        entityB: wing1a,
        pivotA: new Vec3(-0.6, 0, 0),
        pivotB: new Vec3(0.6, 0, 0),
        axisA: new Vec3(0, 1, 0),
        axisB: new Vec3(0, 1, 0),
        disableCollisionBetweenLinkedBodies: true,
    })

    const wing2a = Box({
        parent: bird,
        size: new Vec3(1, 0.4, 0.1),
        transform: {
            position: new Vec3(-1.2, 0, 0),
        },
        tags: [TAG_FLUID_COLLIDABLE],
        rigid: {
            type: RIGIDBODY_TYPE_DYNAMIC,
            mass: 0.2,
        }
    })
    const wing2b = Box({
        parent: wing2a,
        size: new Vec3(1, 0.4, 0.1),
        transform: {
            position: new Vec3(-1.2, 0, 0),
        },
        tags: [TAG_FLUID_COLLIDABLE],
        rigid: {
            type: RIGIDBODY_TYPE_DYNAMIC,
            mass: 0.2,
        }
    })

    const hinge2a = Hinge({
        entityA: wing2a,
        entityB: bird,
        pivotA: new Vec3(0.6, 0, 0),
        pivotB: new Vec3(-0.6, 0, 0),
        axisA: new Vec3(0, 1, 0),
        axisB: new Vec3(0, 1, 0),
        disableCollisionBetweenLinkedBodies: false,
    })
    const hinge2b = Hinge({
        entityA: wing2b,
        entityB: wing2a,
        pivotA: new Vec3(0.6, 0, 0),
        pivotB: new Vec3(-0.6, 0, 0),
        axisA: new Vec3(0, 1, 0),
        axisB: new Vec3(0, 1, 0),
        disableCollisionBetweenLinkedBodies: false,
    })

    let upstroke = true
    setInterval(() => {
        const motorTarget = upstroke ? 60 : -20
        hinge1a.setAngle(motorTarget)
        hinge2a.setAngle(-motorTarget)
        hinge1b.setAngle(motorTarget * 0.5)
        hinge2b.setAngle(-motorTarget * 0.5)
        
        upstroke = !upstroke
    }, 1000)

    return bird
}