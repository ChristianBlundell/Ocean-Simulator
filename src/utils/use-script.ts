import { Application, createScript, Entity, ScriptAttributes, ScriptType, string } from 'playcanvas';

export type ScriptClass = {
    new(args: ConstructorParameters<typeof ScriptType>[0]): ScriptType
    [ATTRIBUTES_DEFINITIONS]: any
}

export const ATTRIBUTES_DEFINITIONS = "attr_defs"

export type ScriptInstanceType<ScriptClassT extends ScriptClass> =
    InstanceType<ScriptClassT>
    // ScriptClassT extends { constructor(...args: any[]): infer R } ? R : never

export type ScriptAttributeDefinition = Parameters<typeof ScriptAttributes.prototype.add>[1]

export type ScriptAttributesDefinition<ScriptClassT extends ScriptClass> =
    { [property in keyof Exclude<ScriptInstanceType<ScriptClassT>, ScriptType>]?: ScriptAttributeDefinition }

export type ScriptAttributesValues<ScriptClassT extends ScriptClass = ScriptClass> =
    { [P in keyof ScriptClassT[typeof ATTRIBUTES_DEFINITIONS]]?: any }

export function useScript<ScriptClassT extends ScriptClass>(scriptClass: ScriptClassT): typeof ScriptType {
    const name = `${scriptClass.name}_generated`
    const proto = scriptClass.prototype
    
    if (!Application.getApplication()!.scripts.has(name)) {
        const script = createScript(name)
        
        const scriptClassObj = scriptClass as any
        const attributeDefinitions: ScriptAttributesDefinition<ScriptClassT> =
            scriptClassObj[ATTRIBUTES_DEFINITIONS]

        if (attributeDefinitions) {
            for (const [name, definition]
                of (Object.entries(attributeDefinitions) as
                    [name: string, definition: ScriptAttributeDefinition][])) {
                script.attributes.add(name, definition)
                //scriptClassObj.attributes.add(name, definition)
            }
        }

        script.extend(
            Object.fromEntries(
                [...Object.getOwnPropertyNames(proto),
                ...Object.getOwnPropertySymbols(proto)]
                    .filter(key => key !== 'constructor')
                    .map(key => [key, proto[key]])
            )
        )
    }

    //return scriptClass as unknown as typeof ScriptType
    return Application.getApplication().scripts.get(name)
}

export function getScript<ScriptClassT extends ScriptClass>(
        entity: Entity,
        scriptClass: ScriptClassT
    ): ScriptInstanceType<ScriptClassT> {
    const scriptGeneratedClass = useScript(scriptClass)
    return entity.script.scripts.find(script => script instanceof scriptGeneratedClass) as ScriptInstanceType<ScriptClassT>
}