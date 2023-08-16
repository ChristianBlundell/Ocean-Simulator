import { Entity, Quat, ScriptType, Vec2, Vec3 } from "playcanvas";
import { ATTRIBUTES_DEFINITIONS, ScriptAttributeDefinition, ScriptAttributesDefinition } from "../use-script";
import type Ammo from 'ammojs-typed'
import { PlayCanvas2Ammo } from "../playcanvas2ammo";
import { EntityConfigProps, EntityFactory, EntityProps, EntityRuntimeProps, PackagedEntity, PackagedEntityFactory, Script, XYZArrows } from "../../entities";
import _ from "underscore";
import { closestRigidBodyEntity } from "./rigidbody-ancestor";
import { decomposeEuler, EulerAngle, reparentToRootSaveTransform, rotationMetascale, transform4nodeWorld, transformTransform } from "../../math";
import { Frame } from "../../math/frame";

/**
 * The example of physics constraints at
 * https://playcanvas.com/editor/code/618829?tabs=19981369
 * greatly helped here.
 */

export interface ConeTwistOrConeTwistedConfig {
    softness?: number
    biasFactor?: number
    relaxationFactor?: number
    limits?: Vec2
    motorEnabled?: boolean
    motorAngularVelocity?: number
    motorMaxImpulse?: number
    disableCollisionBetweenLinkedBodies?: boolean
}

export interface ConeTwistConfig extends ConeTwistOrConeTwistedConfig {
    entityA: Entity
    entityB: Entity
    frameA: Frame
    frameB: Frame
}

export interface ConeTwistedConfig extends ConeTwistOrConeTwistedConfig {
    frame: {
        position: Vec3
        rotation: EulerAngle
    }
}

export const ConeTwist = (props: ConeTwistConfig) =>
    Script({
        parent: props.entityA,
        attributes: Object.fromEntries(Object.entries(props).filter(([key,_]) => key !== 'entityA')),
        script: ConeTwistConstraint
    }) as ConeTwistConstraint

export interface ConeTwistedConfigProps<
        ChildConfigProps extends EntityConfigProps = EntityConfigProps,
        ChildRuntimeProps extends EntityRuntimeProps<Entity> = EntityRuntimeProps<Entity>,
        ChildFactory extends EntityFactory = EntityFactory
    > extends EntityConfigProps, ConeTwistedConfig {
    child: PackagedEntityFactory<ChildConfigProps, ChildRuntimeProps, ChildFactory>
}

export type ConeTwistedRuntimeProps<ChildRuntimeProps extends EntityRuntimeProps<Entity> = EntityRuntimeProps<Entity>> = ChildRuntimeProps

export type ConeTwistedProps<
        ChildConfigProps extends EntityConfigProps = EntityConfigProps,
        ChildRuntimeProps extends EntityRuntimeProps<Entity> = EntityRuntimeProps<Entity>,
        ChildFactory extends EntityFactory = EntityFactory
    > = EntityProps<
        ConeTwistedConfigProps<
            ChildConfigProps,
            ChildRuntimeProps,
            ChildFactory
        >,
        ConeTwistedRuntimeProps<
            ChildRuntimeProps
        >
    >

// export const ConeTwisted = <
//         ChildConfigProps extends EntityConfigProps = EntityConfigProps,
//         ChildRuntimeProps extends EntityRuntimeProps<Entity> = EntityRuntimeProps<Entity>,
//         ChildFactory extends EntityFactory = EntityFactory
//     >(props: ConeTwistedProps<ChildConfigProps, ChildRuntimeProps, ChildFactory>) => {
//     const child = PackagedEntity(props.child, props)

//     ConeTwist({
//         entityA: child,
//         entityB: props.parent,
//         frameA: props.pivot ?? Vec3.ZERO,
//         pivotB: new Vec3().add2(
//                 props.child.config?.transform?.position ?? Vec3.ZERO,
//                 props.pivot ?? Vec3.ZERO
//             ),
//         ...props
//     })

//     return child
// }

export class ConeTwistConstraint extends ScriptType {
    entityB!: Entity
    frameA!: Frame
    frameB!: Frame
    damping!: number
    limits!: Vec3
    motorEnabled!: boolean
    motorMaxImpulse!: number
    motorTarget!: Vec3

    breakingImpulseThreshold!: number
    disableCollisionBetweenLinkedBodies!: boolean
    
    private constraint!: Ammo.btConeTwistConstraint

    private entityClosestRigidBody_A!: ReturnType<typeof closestRigidBodyEntity>
    private entityClosestRigidBody_B!: ReturnType<typeof closestRigidBodyEntity>

    initialize(): void {
        // We ascend the hierarchy to get the closest rigid body ancestor
        // and its pivot transform in case the entities were not immediately
        // rigid bodies
        this.entityClosestRigidBody_A = closestRigidBodyEntity(this.entity)
        this.entityClosestRigidBody_B = closestRigidBodyEntity(this.entityB)

        if (this.entityClosestRigidBody_A.entity &&
            this.entityClosestRigidBody_A.entity.parent !== this.app.root)
            reparentToRootSaveTransform(this.entityClosestRigidBody_A.entity)
        
        if (this.entityClosestRigidBody_B.entity &&
            this.entityClosestRigidBody_B.entity.parent !== this.app.root)
            reparentToRootSaveTransform(this.entityClosestRigidBody_B.entity)

        const scaleSigns_A = new Vec3(
            Math.sign(this.entityClosestRigidBody_A.entity.getLocalScale().x),
            Math.sign(this.entityClosestRigidBody_A.entity.getLocalScale().y),
            Math.sign(this.entityClosestRigidBody_A.entity.getLocalScale().z)
        )
        
        const scaleSigns_B = new Vec3(
            Math.sign(this.entityClosestRigidBody_B.entity.getLocalScale().x),
            Math.sign(this.entityClosestRigidBody_B.entity.getLocalScale().y),
            Math.sign(this.entityClosestRigidBody_B.entity.getLocalScale().z)
        )
        
        const frame_A = transformTransform(this.entityClosestRigidBody_A.transform, this.frameA)
        const frame_B = transformTransform(this.entityClosestRigidBody_B.transform, this.frameB)

        ///@ts-ignore
        this.constraint = new Ammo.btConeTwistConstraint(
                this.entityClosestRigidBody_A.entity!.rigidbody.body as Ammo.btRigidBody,
                this.entityClosestRigidBody_B.entity!.rigidbody.body as Ammo.btRigidBody,
                ///@ts-ignore
                new Ammo.btTransform(
                    PlayCanvas2Ammo.quat(new Quat().setFromEulerAngles(rotationMetascale(this.entity.getLocalScale()).mul(frame_A.rotation!))),
                    PlayCanvas2Ammo.vec3(frame_A.position!.mul(scaleSigns_A))
                ),
                ///@ts-ignore
                new Ammo.btTransform(
                    PlayCanvas2Ammo.quat(new Quat().setFromEulerAngles(rotationMetascale(this.entityB.getLocalScale()).mul(frame_B.rotation!))),
                    PlayCanvas2Ammo.vec3(frame_B.position!.mul(scaleSigns_B))
                )
            )
        
        const updateBreakingImpulseThreshold = () =>
            this.constraint.setBreakingImpulseThreshold(this.breakingImpulseThreshold)
        
        const updateDamping = () =>
            this.constraint.setDamping(this.damping)
        
        const updateLimits = () => {
            this.constraint.setLimit(3, isNaN(this.limits.x) ? Number.POSITIVE_INFINITY : this.limits.x * Math.PI / 180)
            this.constraint.setLimit(5, isNaN(this.limits.y) ? Number.POSITIVE_INFINITY : this.limits.y * Math.PI / 180)
            this.constraint.setLimit(4, isNaN(this.limits.z) ? Number.POSITIVE_INFINITY : this.limits.z * Math.PI / 180)
            this.entityClosestRigidBody_A.entity.rigidbody.activate()
            this.entityClosestRigidBody_B.entity.rigidbody.activate()
        }
        
        const updateMotorParams = () => {
            this.constraint.enableMotor(this.motorEnabled)
            this.constraint.setMaxMotorImpulse(this.motorMaxImpulse)
        }

        const updateMotorTarget = () => {
            const angle = rotationMetascale(this.entityB.getLocalScale()).mul(this.motorTarget).mulScalar(-1)
            this.constraint.setMotorTargetInConstraintSpace(PlayCanvas2Ammo.quat(new Quat().setFromEulerAngles(angle)))
        }

        const world = this.app.systems.rigidbody.dynamicsWorld as Ammo.btDiscreteDynamicsWorld
        world.addConstraint(this.constraint, this.disableCollisionBetweenLinkedBodies)

        this.on('destroy', () => {
            world.removeConstraint(this.constraint)
            ///@ts-ignore
            Ammo.destroy(this.constraint)
        })
        this.on('disable', () => world.removeConstraint(this.constraint))
        this.on('enable', () => world.addConstraint(this.constraint))
        this.on('attr:damping', () => updateDamping())
        this.on('attr:limits', () => updateLimits())
        this.on('attr:motorEnabled', () => updateMotorParams())
        this.on('attr:motorMaxImpulse', () => updateMotorParams())
        this.on('attr:motorTarget', () => updateMotorTarget())
        this.on('attr:breakingImpulseThreshold', () => updateBreakingImpulseThreshold())
        
        updateMotorParams()
        updateMotorTarget()
        updateLimits()
        updateBreakingImpulseThreshold()
    }

    static [ATTRIBUTES_DEFINITIONS] = {
        entityB: {
            type: 'entity'
        },
        frameA: {
            type: 'json',
            schema: [
                {
                    name: 'position',
                    type: 'vec3',
                    default: [0, 0, 0]
                },
                {
                    name: 'rotation',
                    type: 'vec3',
                    default: [0, 0, 0]
                }
            ],
            default: {
                position: [0, 0, 0],
                rotation: [0, 0, 0]
            }
        },
        frameB: {
            type: 'json',
            schema: [
                {
                    name: 'position',
                    type: 'vec3',
                    default: [0, 0, 0]
                },
                {
                    name: 'rotation',
                    type: 'vec3',
                    default: [0, 0, 0]
                }
            ],
            default: {
                position: [0, 0, 0],
                rotation: [0, 0, 0]
            }
        },
        damping: {
            type: 'number',
            min: 0,
            max: 1000,
            default: 0
        },
        limits: {
            type: 'vec3',
            default: [NaN, NaN, NaN]
        },

        // default values from bullet api reference
        // https://pybullet.org/Bullet/BulletFull/classbtHingeConstraint.html#a99cfd186cc4f41246d1cac1ce840eb0d
        softness: {
            type: 'number',
            default: 0.9,
        },
        biasFactor: {
            type: 'number',
            default: 0.3,
        },
        relaxationFactor: {
            type: 'number',
            default: 1.0,
        },
        disableCollisionBetweenLinkedBodies: {
            type: 'boolean',
            default: false
        },
        motorEnabled: {
            type: 'boolean',
            default: false
        },
        motorMaxImpulse: {
            type: 'number',
            default: 1
        },
        motorTarget: {
            type: 'vec3',
            default: [NaN, NaN, NaN]
        },
        breakingImpulseThreshold: {
            type: 'number',
            default: Infinity,
            min: 0
        }
    }
}