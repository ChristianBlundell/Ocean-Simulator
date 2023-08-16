// import { Entity, Mat4, Vec3 } from "playcanvas";
// import { matrix2transform, setTransform, Transform, transform, transform2matrix, transform4nodeWorld } from "../../../math";
// import { Hinge, HingedConfig } from "../../../utils";
// import { entity } from "../entity";
// import { LayoutStrategyProps } from "./interface";
// import { JointedRepetitionLayoutStrategyConfigProps } from "./jointed";
// import { ArrayedRepetitionLayoutStrategyConfigProps } from "./arrayed";

// export interface ArrayedJointedRepetitionLayoutStrategyConfigProps
//     extends ArrayedRepetitionLayoutStrategyConfigProps {
//     /**
//      * The parent's local up vector. This vector is crossed with each child's
//      * relative position to get the hinge axis, for each child.
//      * @default Vec3.UP
//      */
//     up?: Vec3
// }

// export const ArrayedJointed = (props: LayoutStrategyProps<ArrayedJointedRepetitionLayoutStrategyConfigProps>) => {
//     const parentTransform = transform4nodeWorld(props.parent)
//     const parentTransformMat = transform2matrix(parentTransform)
//     const currentTransformMat = transform2matrix(props.transform)

//     const currentTransformMatWorld0 = new Mat4().mul2(parentTransformMat, currentTransformMat)
//     const offset0 = new Vec3(lengths[0] / 2, 0, 0)

//     setTransform(props.items[0], matrix2transform(currentTransformMatWorld0))
//     props.items[0].tags.add(...props.tags)
//     transform(props.items[0], { position: currentTransformMatWorld0.transformVector(offset0.clone()) })

//     if (props.parent !== props.items[0].root) {
//         Hinge({
//             entityA: props.items[0],
//             entityB: props.parent! as Entity,
//             axisA: props.hinge!.axis!,
//             axisB: props.hinge!.axis!,
//             pivotA: offset0.mulScalar(-1),
//             pivotB: props.transform?.position ?? Vec3.ZERO,
//             ...props.hinge
//         })
//     }

//     for (let i = 1; i < props.items.length; i++) {
//         const length_prev = lengths[(i - 1) % lengths.length]
//         const length_now = lengths[i % lengths.length]
//         const offset_prev = new Vec3(length_prev / 2, 0, 0)
//         const offset_now = new Vec3(length_now / 2, 0, 0)

//         currentTransformMat.mul(transform2matrix({ position: offset_prev }))
//         currentTransformMat.mul(linkTransformMat)
//         currentTransformMat.mul(transform2matrix({ position: offset_now }))
        
//         const currentTransformMatWorld = new Mat4().mul2(parentTransformMat, currentTransformMat)

//         transform(props.items[i], matrix2transform(currentTransformMatWorld))

//         Hinge({
//             entityA: props.items[i],
//             entityB: props.items[i - 1],
//             axisA: props.hinge!.axis!,
//             axisB: props.hinge!.axis!,
//             pivotA: offset_now.mulScalar(-1).sub(halfLinkTransformPosition),
//             pivotB: offset_prev.add(halfLinkTransformPosition),
//             ...props.hinge
//         })
//     }

//     return entity({
//         parent: props.items[props.items.length - 1],
//         transform: { position: new Vec3(lengths[lengths.length - 1], 0, 0) }
//     })
// }

export { }