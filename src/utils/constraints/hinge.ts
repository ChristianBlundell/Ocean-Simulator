import { Entity, ScriptType, Vec2, Vec3 } from "playcanvas";
import { ATTRIBUTES_DEFINITIONS } from "../use-script";
import type Ammo from 'ammojs-typed'
import { PlayCanvas2Ammo } from "../playcanvas2ammo";
import { EntityConfigProps, EntityFactory, EntityProps, EntityRuntimeProps, PackagedEntity, PackagedEntityFactory, Script } from "../../entities";
import _ from "underscore";
import { closestRigidBodyEntity } from "./rigidbody-ancestor";
import { reparentToRootSaveTransform } from "../../math";

/**
 * The example of physics constraints at
 * https://playcanvas.com/editor/code/618829?tabs=19981369
 * greatly helped here.
 */

export interface HingeOrHingedConfig {
    softness?: number
    biasFactor?: number
    relaxationFactor?: number
    limits?: Vec2
    motorEnabled?: boolean
    motorAngularVelocity?: number
    motorMaxImpulse?: number
    disableCollisionBetweenLinkedBodies?: boolean
}

export interface HingeConfig extends HingeOrHingedConfig {
    entityA: Entity
    entityB: Entity
    pivotA?: Vec3
    pivotB?: Vec3
    axisA: Vec3
    axisB: Vec3
}

export interface HingedConfig extends HingeOrHingedConfig {
    /**
     * @default Vec3.ZERO
     */
    pivot?: Vec3
    axis: Vec3
}

export const Hinge = (props: HingeConfig) =>
    Script({
        parent: props.entityA,
        attributes: Object.fromEntries(Object.entries(props).filter(([key,_]) => key !== 'entityA')),
        script: HingeConstraint
    }) as HingeConstraint

export interface HingedConfigProps<
        ChildConfigProps extends EntityConfigProps = EntityConfigProps,
        ChildRuntimeProps extends EntityRuntimeProps<Entity> = EntityRuntimeProps<Entity>,
        ChildFactory extends EntityFactory = EntityFactory
    > extends EntityConfigProps, HingedConfig {
    child: PackagedEntityFactory<ChildConfigProps, ChildRuntimeProps, ChildFactory>
}

export type HingedRuntimeProps<ChildRuntimeProps extends EntityRuntimeProps<Entity> = EntityRuntimeProps<Entity>> = ChildRuntimeProps

export type HingedProps<
        ChildConfigProps extends EntityConfigProps = EntityConfigProps,
        ChildRuntimeProps extends EntityRuntimeProps<Entity> = EntityRuntimeProps<Entity>,
        ChildFactory extends EntityFactory = EntityFactory
    > = EntityProps<
        HingedConfigProps<
            ChildConfigProps,
            ChildRuntimeProps,
            ChildFactory
        >,
        HingedRuntimeProps<
            ChildRuntimeProps
        >
    >

export const Hinged = <
        ChildConfigProps extends EntityConfigProps = EntityConfigProps,
        ChildRuntimeProps extends EntityRuntimeProps<Entity> = EntityRuntimeProps<Entity>,
        ChildFactory extends EntityFactory = EntityFactory
    >(props: HingedProps<ChildConfigProps, ChildRuntimeProps, ChildFactory>) => {
    const child = PackagedEntity(props.child, props)

    Hinge({
        entityA: child,
        entityB: props.parent,
        axisA: props.axis,
        axisB: props.axis,
        pivotA: props.pivot ?? Vec3.ZERO,
        pivotB: new Vec3().add2(
                props.child.config?.transform?.position ?? Vec3.ZERO,
                props.pivot ?? Vec3.ZERO
            ),
        ...props
    })

    return child
}

export class HingeConstraint extends ScriptType {
    entityB!: Entity
    pivotA!: Vec3
    pivotB!: Vec3
    axisA!: Vec3
    axisB!: Vec3
    softness!: number
    biasFactor!: number
    relaxationFactor!: number
    limits!: Vec2
    motorEnabled!: boolean
    motorAngularVelocity!: number
    motorMaxImpulse!: number
    breakingImpulseThreshold!: number

    disableCollisionBetweenLinkedBodies!: boolean
    
    private constraint!: Ammo.btHingeConstraint

    setAngle(value: number) {
        this.limits = new Vec2(value, value)
    }

    initialize(): void {
        // We ascend the hierarchy to get the closest rigid body ancestor
        // and its pivot transform in case the entities were not immediately
        // rigid bodies
        const entityClosestRigidBody_A = closestRigidBodyEntity(this.entity)
        const entityClosestRigidBody_B = closestRigidBodyEntity(this.entityB)

        if (entityClosestRigidBody_A.entity &&
            entityClosestRigidBody_A.entity.parent !== this.app.root)
            reparentToRootSaveTransform(entityClosestRigidBody_A.entity)
        
        if (entityClosestRigidBody_B.entity &&
            entityClosestRigidBody_B.entity.parent !== this.app.root)
            reparentToRootSaveTransform(entityClosestRigidBody_B.entity)

        const scaleSigns_A = new Vec3(
            Math.sign(entityClosestRigidBody_A.entity.getLocalScale().x),
            Math.sign(entityClosestRigidBody_A.entity.getLocalScale().y),
            Math.sign(entityClosestRigidBody_A.entity.getLocalScale().z)
        )
    
        const scaleSigns_B = new Vec3(
            Math.sign(entityClosestRigidBody_B.entity.getLocalScale().x),
            Math.sign(entityClosestRigidBody_B.entity.getLocalScale().y),
            Math.sign(entityClosestRigidBody_B.entity.getLocalScale().z)
        )
        
        const pivot_A = entityClosestRigidBody_A.transformMat.transformPoint(this.pivotA).mul(scaleSigns_A)
        const pivot_B = entityClosestRigidBody_B.transformMat.transformPoint(this.pivotB).mul(scaleSigns_B)
        const axis_A = entityClosestRigidBody_A.transformMat.transformVector(this.axisA).mul(scaleSigns_A)
        const axis_B = entityClosestRigidBody_B.transformMat.transformVector(this.axisB).mul(scaleSigns_B)

        ///@ts-ignore
        // this.constraint = new Ammo.btPoint2PointConstraint(
        //     this.entity.rigidbody.body as Ammo.btRigidBody,
        //     this.otherEntity.rigidbody.body as Ammo.btRigidBody,
        //     PlayCanvas2Ammo.vec3(this.pivotPosition),
        //     PlayCanvas2Ammo.vec3(this.otherPivotPosition)
        // )

        ///@ts-ignore
        this.constraint = new Ammo.btHingeConstraint(
                entityClosestRigidBody_A.entity!.rigidbody.body as Ammo.btRigidBody,
                entityClosestRigidBody_B.entity!.rigidbody.body as Ammo.btRigidBody,
                PlayCanvas2Ammo.vec3(pivot_A),
                PlayCanvas2Ammo.vec3(pivot_B),
                PlayCanvas2Ammo.vec3(axis_A),
                PlayCanvas2Ammo.vec3(axis_B),
            )
        
        const updateBreakingImpulseThreshold = () =>
            this.constraint.setBreakingImpulseThreshold(this.breakingImpulseThreshold)
        
        const updateLimits = () => {
            this.constraint.setLimit(
                isNaN(this.limits.x) ? Number.POSITIVE_INFINITY : this.limits.x * Math.PI / 180,
                isNaN(this.limits.y) ? Number.NEGATIVE_INFINITY : this.limits.y * Math.PI / 180,
                this.softness,
                this.biasFactor,
                this.relaxationFactor
            )
            entityClosestRigidBody_A.entity.rigidbody.activate()
            entityClosestRigidBody_B.entity.rigidbody.activate()
        }
        
        const updateMotorEnabled = () => {
            this.constraint.enableAngularMotor(this.motorEnabled, this.motorAngularVelocity * Math.PI / 180, this.motorMaxImpulse)
            entityClosestRigidBody_A.entity.rigidbody.activate()
            entityClosestRigidBody_B.entity.rigidbody.activate()
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
        this.on('attr:limits', () => updateLimits())
        this.on('attr:softness', () => updateLimits())
        this.on('attr:biasFactor', () => updateLimits())
        this.on('attr:relaxationFactor', () => updateLimits())
        this.on('attr:motorEnabled', () => updateMotorEnabled())
        this.on('attr:motorAngularVelocity', () => updateMotorEnabled())
        this.on('attr:motorMaxImpulse', () => updateMotorEnabled())
        this.on('attr:breakingImpulseThreshold', () => updateBreakingImpulseThreshold())

        updateLimits()
        updateMotorEnabled()
        updateBreakingImpulseThreshold()
    }

    static [ATTRIBUTES_DEFINITIONS] = {
        entityB: {
            type: 'entity'
        },
        pivotA: {
            type: 'vec3',
            default: [0, 0, 0]
        },
        pivotB: {
            type: 'vec3',
            default: [0, 0, 0]
        },
        axisA: {
            type: 'vec3',
            default: [0, 1, 0]
        },
        axisB: {
            type: 'vec3',
            default: [0, 1, 0]
        },

        limits: {
            type: 'vec2',
            default: [NaN, NaN]
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
        motorAngularVelocity: {
            type: 'number',
            default: 0
        },
        motorMaxImpulse: {
            type: 'number',
            default: 1
        },
        breakingImpulseThreshold: {
            type: 'number',
            default: Infinity,
            min: 0
        }
    }
}