import { Entity } from "playcanvas";
import { Transform, transform4nodeWorld } from "../../math";
import { XYZArrows } from "./arrow";
import { entity, EntityConfigProps, EntityProps, EntityRuntimeProps } from "./entity";
import { EntityFactory, PackagedEntity, PackagedEntityFactory } from "./factory";
import { LayoutStrategy, LayoutStrategyConfigProps, LayoutStrategyPackage } from "./layout-strategies";

export interface RepeatedItemRuntimeProps<T>
    extends EntityRuntimeProps {
    index: number
    item: T
}

export interface RepetitionConfigProps<
        T = any,
        ItemPkgConfig extends EntityConfigProps = EntityConfigProps,
        LayoutStrategyConfigT extends LayoutStrategyConfigProps = LayoutStrategyConfigProps,
        LayoutStrategyFactoryT extends LayoutStrategy<LayoutStrategyConfigT> = LayoutStrategy<LayoutStrategyConfigT>,
        TipConfig extends EntityConfigProps = EntityConfigProps,
        TipRuntime extends EntityRuntimeProps = EntityRuntimeProps,
        TipFactory extends EntityFactory<TipConfig, TipRuntime> = EntityFactory<TipConfig, TipRuntime>,
    >
    extends EntityConfigProps {
    items: T[]

    itemPkg: PackagedEntityFactory<ItemPkgConfig, RepeatedItemRuntimeProps<T>>
    
    layoutStrategy?: LayoutStrategyPackage<LayoutStrategyConfigT, LayoutStrategyFactoryT>

    tip?: PackagedEntityFactory<TipConfig, TipRuntime, TipFactory>
}

export interface RepetitionRuntimeProps extends EntityRuntimeProps {
}

export type RepetitionProps<
        T = any,
        ItemPkgConfig extends EntityConfigProps = EntityConfigProps,
        LayoutStrategyConfigT extends LayoutStrategyConfigProps = LayoutStrategyConfigProps,
        LayoutStrategyFactoryT extends LayoutStrategy<LayoutStrategyConfigT> = LayoutStrategy<LayoutStrategyConfigT>,
        TipConfig extends EntityConfigProps = EntityConfigProps,
        TipRuntime extends EntityRuntimeProps = EntityRuntimeProps,
        TipFactory extends EntityFactory<TipConfig, TipRuntime> = EntityFactory<TipConfig, TipRuntime>,
    > =
    EntityProps<
            RepetitionConfigProps<
                    T,
                    ItemPkgConfig,
                    LayoutStrategyConfigT,
                    LayoutStrategyFactoryT,
                    TipConfig,
                    TipRuntime,
                    TipFactory
                >,
            RepetitionRuntimeProps
        >

export const Repetition = <
        T = any,
        ItemPkgConfig extends EntityConfigProps = EntityConfigProps,
        LayoutStrategyConfigT extends LayoutStrategyConfigProps = LayoutStrategyConfigProps,
        LayoutStrategyFactoryT extends LayoutStrategy<LayoutStrategyConfigT> = LayoutStrategy<LayoutStrategyConfigT>,
        TipConfig extends EntityConfigProps = EntityConfigProps,
        TipRuntime extends EntityRuntimeProps = EntityRuntimeProps,
        TipFactory extends EntityFactory<TipConfig, TipRuntime> = EntityFactory<TipConfig, TipRuntime>,
    >(props: RepetitionProps<
            T,
            ItemPkgConfig,
            LayoutStrategyConfigT,
            LayoutStrategyFactoryT,
            TipConfig,
            TipRuntime,
            TipFactory
        >) => {
    const items = props.items.map((item, index) => PackagedEntity(props.itemPkg, {
            parent: props.parent,
            index,
            item,
            tags: props.tags
        })!)
    
    const tip = PackagedEntity(
        props.layoutStrategy,
        {
            parent: props.parent,
            transform: props.transform,
            tags: props.tags,
            items
        }
    )

    // if (tip) {
    //     XYZArrows({
    //         parent: props.parent.root,
    //         transform: transform4nodeWorld(tip)
    //     })
    // }

    PackagedEntity(
            props.tip,
            {
                parent: tip,
                tags: props.tags
            } as EntityRuntimeProps as Partial<TipRuntime>
        )
    
    //TODO: this doesn't necessarily work for arrayed items
    return items[0]
}