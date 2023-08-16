import { DynamicChildren, DynamicChildrenConfigProps, DynamicChildrenRuntimeProps } from "./dynamic-children";
import { EntityProps } from "./entity";

export type FractalConfigProps = Omit<DynamicChildrenConfigProps, "cloneTemplatePkg"> & {
    maxDepth: number
}

export type FractalRuntimeProps = DynamicChildrenRuntimeProps

export type FractalProps = EntityProps<FractalConfigProps, FractalRuntimeProps>

export const Fractal = (props: FractalProps) =>
    DynamicChildren(props)