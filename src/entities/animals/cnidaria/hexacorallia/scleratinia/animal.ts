// import { Vec3 } from "playcanvas";
// import { Box, entity, fractal, FractalConfigProps, PackagedEntityFactory, script, ScriptConfigProps, SolidCurve, SolidCurveConfigProps, SplineGrowthScript, WithChildren, WithChildrenConfigProps } from "../../../../basic";

// export const Scleratinia = {
//     pkg: {
//         factory: WithChildren,
//         config: {
//             parent: {
//                 factory: entity,
//             },
//             children: [
//                 {
//                     factory: Box,
//                     config: {
//                         transform: {
//                             scale: new Vec3(1, 1.618, 0.2),
//                             rotation: new Vec3(90, 0, 0),
//                         }
//                     }
//                 },
//                 {
//                     factory: fractal,
//                     config: {
//                         cloneTemplatePkg: {
//                             factory: WithChildren,
//                             config: {
//                                 parent: {
//                                     factory: SolidCurve,
//                                     config: {
//                                     } as SolidCurveConfigProps
//                                 },
//                                 children: [
//                                     {
//                                         factory: entity,
//                                         config: {
//                                             transform: {
//                                                 position: new Vec3(0, 0, 0)
//                                             }
//                                         }
//                                     },
//                                     {
//                                         factory: entity,
//                                         config: {
//                                             transform: {
//                                                 position: new Vec3(0, 0, 1)
//                                             }
//                                         }
//                                     },
//                                     {
//                                         factory: entity,
//                                         config: {
//                                             transform: {
//                                                 position: new Vec3(0, 0, 1.618)
//                                             }
//                                         }
//                                     },
//                                     {
//                                         factory: script,
//                                         config: {
//                                             script: SplineGrowthScript,
//                                         } as Partial<ScriptConfigProps>
//                                     },
//                                     {
//                                         factory: fractal,
//                                         config: {
//                                             growthRate: 2.1
//                                         } as FractalConfigProps
//                                     }
//                                 ]
//                             } as WithChildrenConfigProps
//                         },
//                         growthRate: 5
//                     } as FractalConfigProps
//                 }
//             ]
//         } as WithChildrenConfigProps,
//     } as PackagedEntityFactory
// }

export { }