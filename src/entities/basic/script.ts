import { Entity } from "playcanvas";
import { ScriptAttributesValues, ScriptClass, ScriptInstanceType, useScript } from "../../utils";
import { EntityConfigProps, EntityProps, EntityRuntimeProps } from "./entity";
import { makePackagedEntity } from "./factory";

export interface ScriptConfigProps<ScriptClassT extends ScriptClass = ScriptClass> extends EntityConfigProps {
    script: ScriptClassT
}

export interface ScriptRuntimeProps<ScriptClassT extends ScriptClass = ScriptClass> extends EntityRuntimeProps<Entity> {
    attributes: ScriptAttributesValues<ScriptClassT>
}

export type ScriptProps<ScriptClassT extends ScriptClass> =
    EntityProps<ScriptConfigProps<ScriptClassT>, ScriptRuntimeProps<ScriptClassT>>

export const Script = <ScriptClassT extends ScriptClass = ScriptClass>
    ({ parent, script, attributes }: ScriptProps<ScriptClassT>) => {
    
    parent.addComponent('script')
    return parent.script!.create(useScript(script), { attributes }) as ScriptInstanceType<ScriptClassT>
}

export interface MakePackagedScriptArgs<ScriptClassT extends ScriptClass> {
    script: ScriptClassT,
    attributes: ScriptAttributesValues<ScriptClassT>
}