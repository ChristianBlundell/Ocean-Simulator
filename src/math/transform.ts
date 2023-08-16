import { Entity, GraphNode, Mat4, Quat, RIGIDBODY_TYPE_DYNAMIC, RIGIDBODY_TYPE_STATIC, Vec3 } from "playcanvas"
import { prettyPrint } from "../utils"
import { Basis, basis2matrix } from "./basis"
import { decomposeEuler, rotate, rotateBasis } from "./euler"
import { random } from "./random"

/**
 * A {@link BasicTransform} is designed with the composition order of
 * {@link position}, then {@link rotation}, then {@link scale}.
 */
export interface BasicTransform {
    position?: pc.Vec3
    rotation?: pc.Vec3
    scale?: pc.Vec3
}

export interface Transform extends BasicTransform {
    random?: BasicTransform
}

export function transformInverse(t?: BasicTransform): BasicTransform {
    return {
        ...(t?.position ? { position: t.position.clone().mulScalar(-1) } : {}),
        ...(t?.rotation ? { rotation: t.rotation.clone().mulScalar(-1) } : {}),
        ...(t?.scale ? { scale: new Vec3().div2(Vec3.ONE, t.scale) } : {})
    }
}

export function cloneBasicTransform(t?: BasicTransform): BasicTransform {
    return {
        ...(t?.position ? { position: t.position.clone() } : {}),
        ...(t?.rotation ? { rotation: t.rotation.clone() } : {}),
        ...(t?.scale ? { scale: t.scale.clone() } : {}),
    }
}

export function basis4transform(t?: BasicTransform): Basis {
    const m = transform2matrix(t) // needs scale included

    return {
        x: m.transformVector(new Vec3(1, 0, 0)),
        y: m.transformVector(new Vec3(0, 1, 0)),
        z: m.transformVector(new Vec3(0, 0, 1)),
    }
}

export function transformBasis(basis: Basis, t?: BasicTransform) {
    if (t.scale) {
        const m = new Mat4().setScale(t.scale.x, t.scale.y, t.scale.z)
        basis.x = m.transformVector(basis.x)
        basis.y = m.transformVector(basis.y)
        basis.z = m.transformVector(basis.z)
    }
    if (t.rotation) rotateBasis(basis, t.rotation)
}

export function transformVector(t: BasicTransform, v: Vec3) {
    const mat = transform2matrix(t) // needs scale included
    return mat.transformVector(v)
}

export function transformVectorInverse(t: BasicTransform, v: Vec3) {
    return transformVector(transformInverse(t), v)
}

export function transformPoint(t: BasicTransform, v: Vec3) {
    const mat = transform2matrix(t)
    return mat.transformPoint(v)
}

export function transformPointInverse(t: BasicTransform, v: Vec3) {
    return transformPoint(transformInverse(t), v)
}

export function transformTransform(world: BasicTransform, local?: BasicTransform) {
    if (!world || !local) return world ?? local

    world = cloneBasicTransform(world)
    
    if (local.position) {
        // If there was a world transform with just a -1 scale for an axis, like a mirror,
        // would the world transform move accordingly?

        // const matrix = transform2matrix(world)
        const matrix = transform2matrix({
            position: world.position,
            rotation: world.rotation?.clone().mul(rotationMetascale(world.scale)),
            scale: world.scale
        })
        matrix.transformPoint(
            local.position,
            world.position ??= new Vec3()
        )
    }

    if (local.rotation) {
        world.rotation ??= new Vec3()

        const basis = basis4transform({ rotation: world.rotation })

        const localRot = local.rotation.clone()
        localRot.mul(rotationMetascale(world.scale))

        // console.log(`Before rotate:\nx: ${prettyPrint(basis.x)}\nye:${prettyPrint(basis.y)}\nz:${prettyPrint(basis.z)}`)
        // console.log(`Rotation: ${prettyPrint(local.rotation)}`)
        const basis_rotated = rotateBasis(basis, localRot)
        // console.log(`After rotate:\nx: ${prettyPrint(basis_rotated.x)}\ny:${prettyPrint(basis_rotated.y)}\nz:${prettyPrint(basis_rotated.z)}`)
        world.rotation = decomposeEuler(basis_rotated.x, basis_rotated.z)
        // world.rotation.mul(metascale)
    }

    if (local.scale) {
        world.scale ??= new Vec3(1, 1, 1)
        world.scale.mul(local.scale)
    }

    return world
}

export function rotationMetascale(scale?: Vec3) {
    return scale ? new Vec3(
            Math.sign(scale.y) * Math.sign(scale.z),
            Math.sign(scale.x) * Math.sign(scale.z),
            Math.sign(scale.x) * Math.sign(scale.y)
        ) : Vec3.ONE
}

export function transform4nodeLocal(node: GraphNode): Transform {
    return {
        position: node.getLocalPosition(),
        scale: node.getLocalScale(),
        rotation: node.getLocalEulerAngles(),
    }
}

export function transform4nodeWorld(node: GraphNode): Transform {
    if(node === node.root) return {}
    
    return transformTransform(
        transform4nodeWorld(node.parent),
        transform4nodeLocal(node)
    )
}

export function reparentToRootSaveTransform(node: GraphNode) {
    const worldTx = transform4nodeWorld(node)
    node.root.addChild(node)
    setTransform(node as Entity, worldTx)
    return worldTx
}

export function reparentToRootAndSetTransform(node: GraphNode, world: BasicTransform) {
    node.root.addChild(node)
    setTransform(node as Entity, world)
}

export function transform2matrix(t?: Transform): Mat4 {
    let m = new Mat4().setIdentity()
    if (t?.position) m.mul(new Mat4().setTranslate(t.position.x, t.position.y, t.position.z))
    if (t?.rotation) {
        const r = t.rotation.clone().mul(rotationMetascale(t.scale))
        m.mul(new Mat4().setFromEulerAngles(r.x, r.y, r.z))
    }
    if (t?.scale) m.mul(new Mat4().setScale(t.scale.x, t.scale.y, t.scale.z))
    
    return m
}

export function matrix2transform(m: Mat4): Transform {
    const position = new Vec3()
    const rotation = new Vec3()
    const scale = new Vec3()

    m.getTranslation(position)
    m.getEulerAngles(rotation)
    m.getScale(scale)

    return {
        ...(position.lengthSq() >= 0.001 ? { position } : {}),
        ...(rotation.lengthSq() >= 0.001 ? { rotation } : {}),
        ...(new Vec3().sub2(scale, Vec3.ONE).lengthSq() >= 0.001 ? { scale } : {}),
    }
}

export function transform2basic(t?: Transform, alpha: number = 1): BasicTransform {
    if (!t) return {}

    const valid_base_position = t.position && !isNaN(t.position?.x) // && !t.position.equals(Vec3.ZERO)
    const valid_base_rotation = t.rotation && !isNaN(t.rotation?.x) // && !t.rotation.equals(Vec3.ZERO)
    const valid_base_scale = t.scale && !isNaN(t.scale?.x) // && !t.scale.equals(Vec3.ONE)

    const valid_random_position = t.random?.position && !isNaN(t.random.position?.x) && !t.random.position.equals(Vec3.ZERO)
    const valid_random_rotation = t.random?.rotation && !isNaN(t.random.rotation?.x) && !t.random.rotation.equals(Vec3.ZERO)
    const valid_random_scale = t.random?.scale && !isNaN(t.random.scale?.x) && !t.random.scale.equals(Vec3.ZERO)

    const base_position = valid_base_position ? t.position : undefined
    const base_rotation = valid_base_rotation ? t.rotation : undefined
    const base_scale = valid_base_scale ? t.scale : undefined

    const random_position = valid_random_position ? random.uniform.vec3().mul(t.random.position) : undefined
    const random_rotation = valid_random_rotation ? random.uniform.vec3().mul(t.random.rotation) : undefined
    const random_scale = valid_random_scale ? random.logNormal.vec3().mul(t.random.scale) : undefined

    const combined_position = (valid_base_position && valid_random_position) ? new Vec3().add2(base_position, random_position) : base_position ?? random_position
    const combined_rotation = (valid_base_rotation && valid_random_rotation) ? new Vec3().add2(base_rotation, random_rotation) : base_rotation ?? random_rotation
    const combined_scale = (valid_base_scale && valid_random_scale) ? new Vec3().mul2(base_scale, random_scale) : base_scale ?? random_scale

    const basic_position = alpha === 1 ? combined_position : combined_position?.clone()?.mulScalar(alpha)
    const basic_rotation = alpha === 1 ? combined_rotation : combined_rotation?.clone()?.mulScalar(alpha)
    const basic_scale = alpha === 1 ? combined_scale :
        combined_scale !== undefined ? new Vec3(
            Math.pow(combined_scale.x, alpha),
            Math.pow(combined_scale.y, alpha),
            Math.pow(combined_scale.z, alpha)
        ) : undefined

    return {
        ...(basic_position ? { position: basic_position } : undefined),
        ...(basic_rotation ? { rotation: basic_rotation } : undefined),
        ...(basic_scale ? { scale: basic_scale } : undefined),
    }
}

export function setTransform(entity: Entity, t?: Transform) {
    const basic = transform2basic(t)

    if (entity.rigidbody && entity.rigidbody.type === RIGIDBODY_TYPE_DYNAMIC) {
        // console.assert(basic.scale === undefined, "Cannot scale a rigid body.")
        
        const position = entity.getLocalPosition()
        const rotation = entity.getLocalRotation()
        const scale = entity.getLocalScale().clone()
        
        entity.setLocalScale(Vec3.ONE)
        entity.rigidbody.teleport(basic.position ?? position, basic.rotation ?? rotation)
        entity.setLocalScale(t.scale ?? scale)
    }
    else {
        console.assert(entity.rigidbody?.type !== RIGIDBODY_TYPE_STATIC, "Static rigid bodies shouldn't move")

        if (basic.position)
            entity.setLocalPosition(basic.position!)
        if (basic.scale)
            entity.setLocalScale(basic.scale!)
        if (basic.rotation)
            entity.setLocalEulerAngles(basic.rotation!)
    }
}

export function transform(entity: Entity, t?: Transform, alpha: number = 1) {
    const basic = transform2basic(t, alpha)

    if (entity.rigidbody && entity.rigidbody.type === RIGIDBODY_TYPE_DYNAMIC) {
        // console.assert(basic.scale === undefined, "Cannot scale a rigid body.")

        // No need to transform the basic.position into parent space, since
        // dynamic rigid bodies are parented to the root node.

        const worldTransform: BasicTransform = {
            position: new Vec3().add2(entity.getLocalPosition(), basic.position ?? Vec3.ZERO),
            rotation: new Vec3().add2(entity.getLocalEulerAngles(), basic.rotation ?? Vec3.ZERO),
        }

        const scale = entity.getLocalScale().clone()
        entity.setLocalScale(Vec3.ONE)
        entity.rigidbody.teleport(worldTransform.position!, worldTransform.rotation!)
        entity.setLocalScale(scale.mul(t.scale ?? Vec3.ONE))
    }
    else {
        console.assert(entity.rigidbody?.type !== RIGIDBODY_TYPE_STATIC, "Static rigid bodies shouldn't move")

        if (basic.position)
            entity.translateLocal(basic.position!)
        if (basic.scale)
            entity.setLocalScale(new Vec3().mul2(entity.getLocalScale(), basic.scale!))
        if (basic.rotation)
            entity.rotateLocal(basic.rotation!)
    }
}

export const reifyTransform = (data: Transform) => ({
        ...reifyBasicTransform(data),
        random: data.random ? reifyBasicTransform(data.random) : undefined
    }) as Transform

export const reifyBasicTransform = (data: BasicTransform) => ({
        position: data.position ?
            new Vec3(
                    data.position.x,
                    data.position.y,
                    data.position.z,
        ) : undefined,
    
        rotation: data.rotation ?
            new Vec3(
                    data.rotation.x,
                    data.rotation.y,
                    data.rotation.z,
        ) : undefined,
        
        scale: data.scale ?
            new Vec3(
                    data.scale.x,
                    data.scale.y,
                    data.scale.z,
                ) : undefined
    }) as BasicTransform