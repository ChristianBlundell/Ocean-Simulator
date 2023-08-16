import { Entity, RIGIDBODY_TYPE_KINEMATIC, Vec3 } from "playcanvas";
import { cloneBasicTransform, reparentToRootAndSetTransform, reparentToRootSaveTransform, rotationMetascale, transform, transform4nodeWorld, transformTransform, transformVector, transformVectorInverse } from "../../../math";
import { Hinge } from "../../../utils";
import { XYZArrows } from "../arrow";
import { entity } from "../entity";
import { LayoutStrategyProps } from "./interface";
import { JointedRepetitionLayoutStrategyConfigProps } from "./jointed";
import { LinkedRepetitionLayoutStrategyConfigProps } from "./linked";

export interface LinkedJointedRepetitionLayoutStrategyConfigProps extends
    LinkedRepetitionLayoutStrategyConfigProps,
    JointedRepetitionLayoutStrategyConfigProps {
    root_hinge_calculations?: 'regular' | 'special'
}

export const LinkedJointed = (props: LayoutStrategyProps<LinkedJointedRepetitionLayoutStrategyConfigProps>) => {
    const parentTransform = transform4nodeWorld(props.parent)
    const parent = props.parent! as Entity

    const lengths = props.length === undefined ?
        [1] :
        (props.length as number[]).length ?
            props.length as number[] :
            [props.length as number]
    
    const offset0 = new Vec3(lengths[0] / 2, 0, 0)
    let currentTransform = transformTransform(parentTransform, props.transform)
    // XYZArrows({parent:props.parent.root, transform: cloneBasicTransform(currentTransform)})
    // console.log('start transform')
    // console.log(cloneBasicTransform(currentTransform))

    currentTransform = transformTransform(currentTransform, { position: offset0 })

    // console.log('first joint')
    // console.log(cloneBasicTransform(currentTransform))
    reparentToRootAndSetTransform(props.items[0], {
        position: currentTransform.position,
        rotation: currentTransform.rotation
    })

    // transform(props.items[0], { scale: currentTransform.scale })
    props.items[0].tags.add(...props.tags)

    if (parent !== props.items[0].root) {
        // console.log('hinge0')

        // console.log(props.hinge!.axis!)
        // console.log(transformVectorInverse(props.transform, props.hinge!.axis!.clone()))
        // console.log(offset0.clone().mulScalar(-1))
        // console.log((props.transform?.position ?? Vec3.ZERO).clone())

        // The rotation of the root is not taken into account if the it's scaled by -1.
        // In that case, should the root be scaled to one? Or should the pivot point be
        // projected to world space? Or something else?

        const scale_parent = parent.getLocalScale()
        const scale_positive = (scale_parent.x > 0) && (scale_parent.y > 0) && (scale_parent.z > 0)

        const is_special = props.root_hinge_calculations === 'special'

        // XYZArrows({ parent: props.parent })
        // XYZArrows({ parent: props.items[0] })

        const axis_special = is_special && !scale_positive
        const pivot_special = is_special && !scale_positive

        // const is_scale_working_1 = (Math.sign(scale_parent.x) + Math.sign(scale_parent.y) + Math.sign(scale_parent.z) + 3) % 2 === 0

        // scale: x+, y+
        const parent_axis_regular = props.hinge!.axis! //transformVector({ rotation: currentTransform.rotation }, props.hinge!.axis!)
        const parent_pivot_regular = props.transform?.position ?? Vec3.ZERO

        // scale: one of x or y is -, other +
        const parent_axis_transformed = transformVectorInverse({ rotation: currentTransform.rotation }, parent_axis_regular.clone())
        const parent_pivot_transformed = transformVector({ rotation: rotationMetascale(parentTransform.scale ?? Vec3.ONE).mul(parentTransform.rotation) }, parent_pivot_regular)
        // const parent_pivot = transformVector({ rotation: parentTransform.rotation }, transformVector({ scale: parentTransform.scale }, props.transform?.position ?? Vec3.ZERO))
        // const parent_pivot = transformVector({ rotation: parentTransform.rotation }, transformVector({ scale: parentTransform.scale }, props.transform?.position ?? Vec3.ZERO))

        const parent_axis = axis_special ? parent_axis_transformed : transformVector({ rotation: props?.transform?.rotation }, parent_axis_regular)
        const parent_pivot = pivot_special ? transformVector({ scale: parentTransform.scale }, transformVector({ rotation: parentTransform.rotation }, parent_pivot_regular)) : parent_pivot_regular
        // const parent_axis = parent_axis_transformed
        // const parent_pivot = is_scale_working ? transformVector({ scale: parentTransform.scale }, parent_pivot_regular) : parent_pivot_transformed
        // const parent_pivot = parent_pivot_regular

        // const parent_axis = transformVector({ rotation: rotationMetascale(currentTransform.scale).mul(currentTransform.rotation) }, props.hinge!.axis!)

        // console.log('parent: axis, pivot')
        // console.log(parent_axis)
        // console.log(parent_pivot)

        Hinge({
            entityA: props.items[0],
            entityB: parent,
            axisA: props.hinge!.axis!,
            axisB: parent_axis,
            pivotA: offset0.clone().mulScalar(-1),
            pivotB: parent_pivot,
            ...props.hinge
        })
        // parent.setLocalScale(scale_parent.x, scale_parent.y, scale_parent.z)
    }

    // props.items.forEach(parent => XYZArrows({ parent }))

    for (let i = 1; i < props.items.length; i++) {
        const length_prev = lengths[(i - 1) % lengths.length]
        const length_now = lengths[i % lengths.length]
        const offset_prev = new Vec3(length_prev / 2, 0, 0)
        const offset_now = new Vec3(length_now / 2, 0, 0)

        currentTransform = transformTransform(currentTransform, { position: offset_prev })
        currentTransform = transformTransform(currentTransform, props.linkTransform)
        currentTransform = transformTransform(currentTransform, { position: offset_now })

        reparentToRootAndSetTransform(props.items[i], {
            position: currentTransform.position,
            rotation: currentTransform.rotation
        })
        // transform(props.items[i], { scale: currentTransform.scale })

        props.items[i].tags.add(...props.tags)

        Hinge({
            entityA: props.items[i],
            entityB: props.items[i - 1],
            axisA: props.hinge!.axis!,
            axisB: props.hinge!.axis!,
            pivotA: offset_now.mulScalar(-1),
            pivotB: offset_prev.add(props.linkTransform?.position ?? Vec3.ZERO),
            ...props.hinge
        })
    }

    return entity({
        parent: props.items[props.items.length - 1],
        transform: { position: new Vec3(lengths[lengths.length - 1] / 2, 0, 0) }
    })
}