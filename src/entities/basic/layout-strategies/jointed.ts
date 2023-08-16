import { HingedConfig } from "../../../utils"
import { LayoutStrategyConfigProps } from "./interface"

export interface JointedRepetitionLayoutStrategyConfigProps extends LayoutStrategyConfigProps {
    joint: 'hinge'
    hinge: Omit<HingedConfig, "pivot">
}