import { Entity } from "playcanvas"
import { Transform } from "../../../math"
import { EntityConfigProps, EntityProps, EntityRuntimeProps } from "../entity"
import { EntityFactory, PackagedEntityFactory } from "../factory"

export interface LayoutStrategyConfigProps extends EntityConfigProps {
}

export interface LayoutStrategyRuntimeProps extends EntityRuntimeProps {
    items: Entity[]
    transform: Transform
}

export type LayoutStrategyProps
    <Config extends LayoutStrategyConfigProps = LayoutStrategyConfigProps> =
    EntityProps<Config, LayoutStrategyRuntimeProps>

/**
 * @returns the tip entity
 */
export type LayoutStrategy<
        Config extends LayoutStrategyConfigProps = LayoutStrategyConfigProps
    > = EntityFactory<Config, LayoutStrategyRuntimeProps>

export type LayoutStrategyPackage<
        Config extends LayoutStrategyConfigProps = LayoutStrategyConfigProps,
        LayoutStrategyT extends LayoutStrategy<Config> = LayoutStrategy<Config>
    > = PackagedEntityFactory<Config, LayoutStrategyRuntimeProps, LayoutStrategyT>