import { Entity, GraphNode } from "playcanvas";

export const findByTagsAll =
    (e: Entity, ...tags: string[]) =>
        e.findByTag([...tags])[0] as Entity
    
export const findByTagsAny =
    (e: Entity, ...tags: string[]) =>
        e.findByTag.apply(e, tags as any)[0] as Entity

export const mergeTags = (...tags: (string[] | undefined)[] | string[][]) =>
    tags.filter(_ => _).flat() as string[]

export const getAttributeFromTags = (e: Entity, attribute_tag_prefix: string): number | undefined => {
    const matchingTag =
        e.tags
            .list()
            .find(tag => tag.startsWith(attribute_tag_prefix))
    
    return matchingTag ? parseFloat(matchingTag.substring(attribute_tag_prefix.length)) : undefined
}

export const recursiveChildrenWithTag = (e: GraphNode, tag: string): GraphNode[] => [
    ...(e.tags.has(tag) ? [e] : []),
    ...(e.children.flatMap(child => recursiveChildrenWithTag(child, tag)))
]