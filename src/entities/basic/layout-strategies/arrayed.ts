import { entity } from "../entity";
import { LayoutStrategyConfigProps, LayoutStrategyProps } from "./interface";

export interface ArrayedRepetitionLayoutStrategyConfigProps extends LayoutStrategyConfigProps {
}

export const Arrayed = (props: LayoutStrategyProps<ArrayedRepetitionLayoutStrategyConfigProps>) => {
    const root = entity(props)

    for (let index = 0; index < props.items.length; index++) {
        const item = props.items[index]
        const itemRoot = entity({ parent: root })
        itemRoot.addChild(item)
    }

    return root
}