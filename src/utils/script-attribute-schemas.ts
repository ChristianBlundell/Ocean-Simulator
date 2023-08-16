export namespace scriptAttributeSchemas {
    export const transform_basic = [
        {
            name: 'position',
            type: 'vec3',
            default: [NaN, NaN, NaN]
        },
        {
            name: 'rotation',
            type: 'vec3',
            default: [NaN, NaN, NaN]
        },
        {
            name: 'scale',
            type: 'vec3',
            default: [NaN, NaN, NaN]
        }
    ]

    export const transform = [
        ...transform_basic,
        {
            name: 'random',
            type: 'json',
            default: undefined as any,
            schema: transform_basic
        }
    ]
}