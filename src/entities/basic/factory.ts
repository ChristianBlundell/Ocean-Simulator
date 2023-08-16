import { Entity } from "playcanvas"
import { transformTransform } from "../../math"
import { mergeTags } from "../../utils"
import { EntityConfigProps, EntityProps, EntityRuntimeProps } from "./entity"

export type EntityFactory<
        Config extends EntityConfigProps = EntityConfigProps,
        Runtime extends EntityRuntimeProps = EntityRuntimeProps
    > = (props: EntityProps<Config, Runtime>) => Entity

export interface PackagedEntityFactory<
        Config extends EntityConfigProps = EntityConfigProps,
        Runtime extends EntityRuntimeProps = EntityRuntimeProps,
        Factory extends EntityFactory<Config, Runtime> = EntityFactory<Config, Runtime>
    > {
    factory: Factory
    config?: Config
    runtime?: Partial<Runtime>
}

export const PackagedEntity = <
        Config extends EntityConfigProps = EntityConfigProps,
        Runtime extends EntityRuntimeProps = EntityRuntimeProps
    >(
        pkg: PackagedEntityFactory<Config, Runtime> | undefined,
        runtimeProps: Partial<Runtime>
    ) =>
        pkg ?
            pkg.factory({
                    ...(pkg.config ? pkg.config : {}),
                    ...(pkg.runtime ? pkg.runtime : {}),
                    ...runtimeProps,
                    tags: mergeTags(runtimeProps.tags, pkg.runtime?.tags, pkg.config?.tags),
                    transform: transformTransform(runtimeProps.transform, transformTransform(pkg.config?.transform, pkg.runtime?.transform))
                    // transform: transformTransform(transformTransform(pkg.config?.transform, pkg.runtime?.transform), runtimeProps.transform)
                } as EntityProps<Config, Runtime>) :
            undefined
            
export const makePackagedEntity = <
        Config extends EntityConfigProps = EntityConfigProps,
        Runtime extends EntityRuntimeProps = EntityRuntimeProps,
        Factory extends EntityFactory<Config, Runtime> = EntityFactory<Config, Runtime>
    >(pkg: PackagedEntityFactory<Config, Runtime, Factory>) => pkg