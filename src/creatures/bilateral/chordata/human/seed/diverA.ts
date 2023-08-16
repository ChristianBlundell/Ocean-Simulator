import { Color, Vec2, Vec3 } from "playcanvas";
import { Box, BoxConfigProps } from "../../../../../entities";
import { DNA } from "../DNA";

export const DiverA: DNA = {
    head: {
        radius: 0.6,
        transform: {
            position: new Vec3(0, 0, 0.55)
        }
    },

    neck: {
        size: new Vec3(0.55, 0.7, 0.3),
        transform: {
            rotation: new Vec3(0, -90, 0),
            position: new Vec3(0, 0, 1.2),
        }
    },
    
    body: {
        size: new Vec3(0.75, 1, 2)
    },
    
    arms: {
        transform: {
            position: new Vec3(0, 0.75, 1),
            rotation: new Vec3(0, 0, 60),
        },

        segmentLengths: [1, 1],
        size: new Vec2(0.2, 0.2),
        limbEnd: {
            palm: {
                factory: Box,
                config: {
                    size: new Vec3(0.6, 0.45, 0.2),
                    transform: {
                        position: new Vec3(0.4, 0, 0)
                    }
                } as BoxConfigProps
            },
            fingers: [
                {
                    segmentLengths: [0.24, 0.18],
                    size: new Vec2(0.12, 0.15),
                    transform: {
                        position: new Vec3(0.15, 0.3, 0),
                        rotation: new Vec3(0, 0, 90),
                    }
                },

                {
                    segmentLengths: [0.3, 0.25, 0.2],
                    size: new Vec2(0.1, 0.15),
                    transform: {
                        position: new Vec3(0.41, -0.24, 0),
                        rotation: new Vec3(0, 0, -20),
                    }
                },

                {
                    segmentLengths: [0.33, 0.29, 0.21],
                    size: new Vec2(0.11, 0.16),
                    transform: {
                        position: new Vec3(0.43, -0.08, 0),
                        rotation: new Vec3(0, 0, -6),
                    }
                },

                {
                    segmentLengths: [0.3, 0.25, 0.2],
                    size: new Vec2(0.1, 0.14),
                    transform: {
                        position: new Vec3(0.43, +0.09, 0),
                        rotation: new Vec3(0, 0, +6),
                    }
                },

                {
                    segmentLengths: [0.23, 0.2, 0.18],
                    size: new Vec2(0.08, 0.11),
                    transform: {
                        position: new Vec3(0.41, +0.26, 0),
                        rotation: new Vec3(0, 0, +20),
                    }
                }
            ]
        }
    },

    legs: {
        transform: {
            position: new Vec3(0, 0.3, -1.1),
            rotation: new Vec3(0, 90, 0)
        },
        segmentLengths: [1.5, 1.5],
        size: new Vec2(0.4, 0.6),
        limbEnd: {
            transform: {
                rotation: new Vec3(0, -90, 0)
            },
            palm: {
                factory: Box,
                config: {
                    size: new Vec3(1.1, 0.6, 0.2),
                    transform: {
                        position: new Vec3(0.3, 0, -0.2)
                    }
                } as BoxConfigProps
            },
            fingers: []
        }
    },

    materials: {
        skin: {
            diffuse: new Color(0.8, 0.7, 0.3),
        },
        wetsuit: {
            diffuse: new Color(0.3, 0.3, 0.3),
            specular: new Color(0.09, 0.1, 0.07),
        },
    }
}