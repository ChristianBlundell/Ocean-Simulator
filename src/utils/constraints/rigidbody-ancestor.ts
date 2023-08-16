import { Entity, GraphNode, Mat4, Vec3 } from "playcanvas";
import { BasicTransform, transform2matrix, transform4nodeLocal, transformTransform } from "../../math";

export function closestRigidBodyEntity(e: GraphNode): {
        entity?: Entity,
        transform: BasicTransform,
        transformMat: Mat4
    } {
    if (e instanceof Entity && e?.rigidbody?.enabled)
        return { entity: e, transform: {}, transformMat: new Mat4().setIdentity() }
    else if (e === e.root)
        return { transform: {}, transformMat: new Mat4().setIdentity() }
    
    const ancestor = closestRigidBodyEntity(e.parent)
    const newTransform = transformTransform(ancestor.transform, transform4nodeLocal(e))
    const newTransformMat = transform2matrix(newTransform)

    return {
        entity: ancestor.entity,
        transform: newTransform,
        transformMat: newTransformMat
    }
}