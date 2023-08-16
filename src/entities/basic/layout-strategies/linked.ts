import { Vec3 } from "playcanvas";
import { transform, Transform } from "../../../math";
import { XYZArrows } from "../arrow";
import { entity } from "../entity";
import { LayoutStrategyConfigProps, LayoutStrategyProps } from "./interface";

export interface LinkedRepetitionLayoutStrategyConfigProps extends LayoutStrategyConfigProps {
    length: number | number[]
    linkTransform?: Transform
}

export const Linked = (props: LayoutStrategyProps<LinkedRepetitionLayoutStrategyConfigProps>) => {
    let current_root = entity(props)
    
    const lengths = props.length === undefined ?
        [1] :
        (props.length as number[]).length ?
            props.length as number[] :
            [props.length as number]

    for (let index = 0; index < props.items.length; index++) {
        const item = props.items[index]

        current_root.addChild(item)
        
        current_root.tags.add(...item.tags.list())
        item.tags.clear()

        current_root = entity({
            parent: current_root,
            transform: {
                position: new Vec3(lengths[index % lengths.length], 0, 0)
            }
        })

        transform(current_root, props.linkTransform)
    }

    return current_root
}