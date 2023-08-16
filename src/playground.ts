import { Color, Entity, GraphNode, Keyboard, KeyboardEvent, KEY_DOWN, KEY_LEFT, KEY_RIGHT, KEY_UP, RIGIDBODY_TYPE_DYNAMIC, RIGIDBODY_TYPE_KINEMATIC, RIGIDBODY_TYPE_STATIC, StandardMaterial, Vec2, Vec3 } from "playcanvas"
import _ from "underscore"
import { Creature, human } from "./creatures"
import { DiverA } from "./creatures/bilateral/chordata/human"
import { animals, Arrow, BilateralMirrored, Box, BoxConfigProps, Box_0_1, Capsule, E, entity, EntityConfigProps, EntityFactory, EntityRuntimeProps, Grid, Mirrored, MirroredProps, PackagedEntity, PackagedEntityFactory, Repetition, Script, Sphere, SphereProps, XYZArrows, XYZArrowsWrapped } from "./entities"
import { LinkedJointed, LinkedJointedRepetitionLayoutStrategyConfigProps } from "./entities/basic/layout-strategies"
import { TAG_FLUID_COLLIDABLE } from "./entities/fluid-sim"
import { Finger, Limb, LimbConfigProps, LimbEnd, LimbRuntimeProps } from "./entities/organic"
import { random, reparentToRootSaveTransform, transform, transform2matrix, transform4nodeWorld, transformTransform } from "./math"
import { Rig } from "./pose-control/rig"
import { ConeTwist, Hinge, Hinged, material, RotateScript } from "./utils"

export function moveableBox(root: GraphNode, position: Vec3 = new Vec3(-1, -1, 2.5)) {
    const box = Box({
        parent: root,
        material: material({ diffuse: new Color(0.1, 0.2, 0.7) }),
        transform: {
            position,
            scale: new Vec3(1, 1, 1)
        },
        tags: [TAG_FLUID_COLLIDABLE],
        rigid: true
    })

    new Keyboard(window).on('keydown', (e: KeyboardEvent) => {
        switch (e.key) {
            case KEY_LEFT:
                box.rigidbody.applyTorque(0, 0, 10)
                break
            case KEY_RIGHT:
                box.rigidbody.applyTorque(0, 0, -10)
                break
            case KEY_UP:
                box.rigidbody.applyForce(box.up.clone().mulScalar(10))
                break
            case KEY_DOWN:
                box.rigidbody.applyForce(box.up.clone().mulScalar(-10))
                break
        }
    })

    return box
}

export function gridXY(root: GraphNode, position: Vec3 = new Vec3(0, 0, 0)) {
    Grid({
        parent: root,
        material: material({ diffuse: Color.GRAY }),
        transform: {
            position
        }
    })
}

export function gridYZ(root: GraphNode, position: Vec3 = new Vec3(0, 0, 0)) {
    Grid({
        parent: root,
        material: material({ diffuse: Color.GRAY }),
        transform: {
            position,
            rotation: new Vec3(0, 90, 0)
        }
    })
}

export function sphere(root: GraphNode, position: Vec3 = new Vec3(3, 0, 0)) {
    return Sphere({
        parent: root,
        radius: 0.5,
        material: material({ diffuse: new Color(0.4, 0.6, 0.45) }),
        transform: {
            position,
            rotation: new Vec3(0, 0, 30)
            // Ammo/Bullet treats the sphere as if it were perfectly spherical
            // I don't know if it even considers the scale transform at all
            //scale: new Vec3(0.8, 0.618, 0.9),
        },
        rigid: {
            type: RIGIDBODY_TYPE_DYNAMIC,
            mass: 3,
            restitution: 0.3,
        },
        tags: [TAG_FLUID_COLLIDABLE]
    })
}

export function rotatedArrows(root: GraphNode, position: Vec3 = new Vec3(0, 0.5, 0)) {
    XYZArrows({
        parent: entity({
            parent: root,
            transform: {
                position,
                scale: new Vec3(1, 1, 1)
            }
        }),
        transform: {
            position: new Vec3(0, 1, 0),
            rotation: new Vec3(0, 0, 30)
        }
    })

    XYZArrows({
        parent: entity({
            parent: root,
            transform: {
                position,
                scale: new Vec3(1, -1, 1)
            }
        }),
        transform: {
            position: new Vec3(0, 1, 0),
            rotation: new Vec3(0, 0, 30)
        }
    })
}

export function capsule(root: GraphNode, position: Vec3 = new Vec3(0, 3, 2)) {
    return Capsule({
        parent: root,
        height: 1,
        radius: 0.5,
        radius2: 0.6,
        axis: 2,
        material: material({ diffuse: new Color(0.4, 0.6, 0.45) }),
        transform: {
            position
        },
        rigid: {
            type: RIGIDBODY_TYPE_DYNAMIC,
            mass: 3,
            restitution: 0.3,
        },
        tags: [TAG_FLUID_COLLIDABLE]
    })
}

export function teleportedRigidBody(root: GraphNode) {
    const b = Box_0_1({
        parent: root,
        rigid: true,
        transform: {
            scale: new Vec3(1, 1.5, 0.5)
        }
    })

    // setTransform(b, {
    //     position: new Vec3(0, 0, 5)
    // })

    setInterval(() => transform(b, {
        position: random.uniform.vec3().add(new Vec3(-0.5, -0.5, 0)).mulScalar(3)
    }), 1000)
}

export function hinges(root: GraphNode, position: Vec3 = new Vec3(0, 0, -0.8)) {
    const lengths = [1, 0.2, 0.5]

    const start = Box({
        parent: root,
        size: new Vec3(1, 1, 0.2),
        transform: {
            position,
            rotation: new Vec3(0, 0, 180),
        },
        rigid: {
            type: RIGIDBODY_TYPE_STATIC,
            mass: 10
        }
    })

    Repetition({
        parent: start,
        itemPkg: {
            factory: ({ item, index, tags }) => Box({
                parent: root,
                tags,
                material: material({ diffuse: new Color(0.1 * index, 1 - 0.1 * index, 0) }),
                size: new Vec3(item, 0.5, 0.2),
                rigid: true
            }),
        },
        items: lengths,
        layoutStrategy: {
            factory: LinkedJointed,
            config: {
                joint: 'hinge',
                hinge: {
                    axis: new Vec3(0, 1, 0),
                    disableCollisionBetweenLinkedBodies: false,
                },
                length: lengths,
                linkTransform: {
                    position: new Vec3(0.01, 0, 0),
                },
            } as LinkedJointedRepetitionLayoutStrategyConfigProps
        },
        tip: {
            factory: XYZArrows,
        },
        transform: {
            position: new Vec3(0.51, 0, 0),
            rotation: new Vec3(0, 0, 0)
        }
    })
}

export function hinges2(root: GraphNode, position: Vec3 = new Vec3(0, 0, 5)) {
    const a1 = Box({
        parent: root,
        rigid: {
            type: RIGIDBODY_TYPE_STATIC
        },
        transform: {
            position,
            scale: new Vec3(1, 2, 1)
        }
    })
    const a2 = Box({
        parent: root,
        rigid: {
            type: RIGIDBODY_TYPE_DYNAMIC,
            mass: 0.5
        },
        transform: {
            position: new Vec3(0, 2.2, 0).add(position),
            scale: new Vec3(1, 2, 0.2)
        }
    })
    const a3 = Box({
        parent: root,
        rigid: {
            type: RIGIDBODY_TYPE_DYNAMIC,
            mass: 0.5
        },
        transform: {
            position: new Vec3(0, 2.2 * 2, 0).add(position),
            scale: new Vec3(1, 2, 0.2)
        }
    })

    Hinge({
        entityA: a1,
        entityB: a2,
        axisA: new Vec3(1, 0, 0),
        axisB: new Vec3(1, 0, 0),
        pivotA: new Vec3(0, 1.1, 0),
        pivotB: new Vec3(0, -1.1, 0),
        disableCollisionBetweenLinkedBodies: false,
    })
    Hinge({
        entityA: a2,
        entityB: a3,
        axisA: new Vec3(1, 0, 0),
        axisB: new Vec3(1, 0, 0),
        pivotA: new Vec3(0, 1.1, 0),
        pivotB: new Vec3(0, -1.1, 0),
        disableCollisionBetweenLinkedBodies: false,
    })
}

export function hinges3(root: GraphNode, position: Vec3 = new Vec3(0, 0, 1)) {
    const a1 = Box({
        parent: root,
        rigid: {
            type: RIGIDBODY_TYPE_STATIC
        },
        size: new Vec3(1, 0.6, 1),
        transform: {
            position,
            scale: new Vec3(1, -1, 1)
        }
    })

    XYZArrows({ parent: a1 })

    const hingeChild = {
        factory: Box,
        config: {
            size: new Vec3(0.4, 0.5, 0.2),
            transform: {
                position: new Vec3(0, 0.6, 0)
            },
            rigid: {
                type: RIGIDBODY_TYPE_DYNAMIC
            }
        },
    } as PackagedEntityFactory<EntityConfigProps, EntityRuntimeProps<Entity>, typeof Box>

    const a2 = Hinged({
        parent: a1,
        child: hingeChild,
        axis: new Vec3(1, 0, 0),
        pivot: new Vec3(0, -0.3, 0),
        disableCollisionBetweenLinkedBodies: false,
        relaxationFactor: 0.01
    })
    const a3 = Hinged({
        parent: a2,
        child: hingeChild,
        axis: new Vec3(1, 0, 0),
        pivot: new Vec3(0, -0.3, 0),
        disableCollisionBetweenLinkedBodies: false,
        relaxationFactor: 0.01
    })
    const a4 = Hinged({
        parent: a3,
        child: hingeChild,
        axis: new Vec3(1, 0, 0),
        pivot: new Vec3(0, -0.3, 0),
        disableCollisionBetweenLinkedBodies: false,
        relaxationFactor: 0.01
    })

    return a1
}

export function hinges4(root: GraphNode, position: Vec3 = new Vec3(0, 0, 2)) {
    const a1 = Box_0_1({
        parent: root,
        rigid: {
            type: RIGIDBODY_TYPE_STATIC
        },
        transform: {
            position,
            scale: new Vec3(1, 1, 1)
        }
    })
    const a2 = Box_0_1({
        parent: root,
        rigid: {
            type: RIGIDBODY_TYPE_DYNAMIC,
            mass: 0.5
        },
        transform: {
            position: new Vec3(1.2, 0, 0),
            scale: new Vec3(2, 1, 0.1)
        }
    })
    const a3 = Box_0_1({
        parent: root,
        rigid: {
            type: RIGIDBODY_TYPE_DYNAMIC,
            mass: 0.5
        },
        transform: {
            position: new Vec3(2.2 * 2 - 1, 0, 0),
            scale: new Vec3(2, 1, 0.1)
        }
    })

    transform(a2, { position })
    transform(a3, { position })

    Hinge({
        entityA: a1,
        entityB: a2,
        axisA: new Vec3(0, 1, 0),
        axisB: new Vec3(0, 1, 0),
        pivotA: new Vec3(1.1, 0, 0),
        pivotB: new Vec3(-0.1, 0, 0),
        disableCollisionBetweenLinkedBodies: false,
    })
    Hinge({
        entityA: a2,
        entityB: a3,
        axisA: new Vec3(0, 1, 0),
        axisB: new Vec3(0, 1, 0),
        pivotA: new Vec3(2.1, 0, 0),
        pivotB: new Vec3(-0.1, 0, 0),
        disableCollisionBetweenLinkedBodies: false,
    })
}

export function hinges5(root: GraphNode, position: Vec3 = new Vec3(0, 0, 0)) {
    const lengths = [0.5, 1.3, 2, 1.3, 0.8, 1]
    // const lengths = [2, 2]

    const r1 = E({
        parent: root,
        transform: {
            // scale: new Vec3(-1, 1, 1)
        }
    })

    const start = Box({
        parent: r1,
        transform: {
            position,
            rotation: new Vec3(0, 0, -60)
        },
        rigid: {
            type: RIGIDBODY_TYPE_STATIC
        }
    })

    Repetition({
        parent: start,
        itemPkg: {
            factory: ({ parent, item, index, tags }) => Box({
                parent,
                tags,
                material: material({ diffuse: new Color(0.1 * index, 1 - 0.1 * index, 0) }),
                transform: {
                    scale: new Vec3(item, 0.35, 0.15)
                },
                rigid: true
            }),
        },
        items: lengths,
        layoutStrategy: {
            factory: LinkedJointed,
            config: {
                joint: 'hinge',
                hinge: {
                    axis: new Vec3(0, 1, 0),
                    disableCollisionBetweenLinkedBodies: false,
                },
                length: lengths,
                linkTransform: {
                    position: new Vec3(0.2, 0, 0),
                },
                // root_hinge_calculations: 'special'
            } as LinkedJointedRepetitionLayoutStrategyConfigProps
        },
        tip: {
            factory: XYZArrows
        },
        transform: {
            position: new Vec3(1, 0, 0),
            // rotation: new Vec3(0, 0, -60)
        }
    })
}

export function hinges6(root: GraphNode, position: Vec3 = new Vec3(0, 0, 8)) {
    const lengths = [0.3, 0.5, 1.3, 2, 1.3, 0.8, 1]

    const start = Box({
        parent: root,
        transform: {
            position,
            rotation: new Vec3(0, 0, 180),
            // scale: new Vec3(-1, 1, 1),
        },
        rigid: {
            type: RIGIDBODY_TYPE_STATIC
        }
    })

    Repetition({
        parent: start,
        itemPkg: {
            factory: ({ item, index, tags }) => Box({
                parent: root,
                tags,
                material: material({ diffuse: new Color(0.1 * index, 1 - 0.1 * index, 0) }),
                size: new Vec3(item, 0.35, 0.15),
                rigid: true
            }),
        },
        items: lengths,
        layoutStrategy: {
            factory: LinkedJointed,
            config: {
                joint: 'hinge',
                hinge: {
                    axis: new Vec3(0, 1, 0),
                    disableCollisionBetweenLinkedBodies: false,
                },
                length: lengths,
                linkTransform: {
                    position: new Vec3(0.2, 0, 0),
                },
            } as LinkedJointedRepetitionLayoutStrategyConfigProps
        },
        tip: {
            factory: XYZArrows,
        },
        transform: {
            position: new Vec3(0.7, 0, 0),
            rotation: new Vec3(0, 0, 40)
        }
    })
}

export function hinges7(root: GraphNode, position: Vec3 = new Vec3(0, 0, 5)) {
    const a1 = Box({
        parent: root,
        rigid: {
            type: RIGIDBODY_TYPE_STATIC
        },
        size: new Vec3(1, 2, 1),
        transform: {
            position
        }
    })
    const a2 = Box({
        parent: root,
        rigid: {
            type: RIGIDBODY_TYPE_DYNAMIC,
            mass: 0.5
        },
        size: new Vec3(1, 2, 0.2),
        transform: {
            position: new Vec3(0, 2.2, 0).add(position)
        }
    })

    Hinge({
        entityA: entity({
            parent: a1,
            transform: {
                position: new Vec3(0, 1.1, 0)
            }
        }),
        entityB: entity({
            parent: a2,
            transform: {
                position: new Vec3(0, -1.1, 0)
            }
        }),
        axisA: new Vec3(1, 0, 0),
        axisB: new Vec3(1, 0, 0),
        disableCollisionBetweenLinkedBodies: false,
    })
}

export function hinges8(root: GraphNode, position: Vec3 = new Vec3(0, -2, 0)) {
    const a0_0 = E({
        parent: root,
        transform: {
            position,
            scale: new Vec3(-1, 1, 1),
        }
    })

    XYZArrows({ parent: a0_0 })

    const a0_1 = E({
        parent: a0_0,
        transform: {
            rotation: new Vec3(0, 0, 30),
        }
    })

    XYZArrows({ parent: a0_1 })

    const a1 = Box({
        parent: a0_1,
        rigid: {
            type: RIGIDBODY_TYPE_DYNAMIC
        },
        size: new Vec3(1, 1, 1),
        transform: {
            position: new Vec3(0, 0, 0)
        }
    })
    
    XYZArrows({ parent: a1 })
    
    // const a1_t = reparentToRootSaveTransform(a1)
    // console.log('a1_t')
    // console.log(a1_t)

    // const b = Box({
    //     parent: root,
    //     transform: {
    //         position,
    //         scale: new Vec3(-1, 1, 1),
    //         // rotation: new Vec3(0, 0, 30),
    //     },
    //     rigid: true
    // })

    // XYZArrows({ parent: b })

    // transform(b, {
    //     rotation: new Vec3(0, 0, 30)
    // })

    const a2 = Box({
        parent: a1,
        rigid: {
            type: RIGIDBODY_TYPE_DYNAMIC,
            // type: RIGIDBODY_TYPE_KINEMATIC,
            mass: 0.5
        },
        size: new Vec3(1, 1, 0.01),
        transform: {
            position: new Vec3(0, 1.1, 0)
        }
    })

    XYZArrows({ parent: a2 })

    const a2_t = transform4nodeWorld(a2)
    console.log('a2_t')
    console.log(a2_t)

    Hinge({
        entityA: entity({
            parent: a1,
            transform: {
                position: new Vec3(0, 0.5 + 0.05, 0)
            }
        }),
        entityB: entity({
            parent: a2,
            transform: {
                position: new Vec3(0, -0.5 - 0.05, 0)
            }
        }),
        axisA: new Vec3(1, 0, 0),
        axisB: new Vec3(1, 0, 0),
        disableCollisionBetweenLinkedBodies: false,
    })

    /**
     * This shows that local rotation happens after local scale, but the parent's scale
     * would invert the direction of rotation.
     */

    // const e1 = Box({ parent: root })    
    // e1.translateLocal(1, 0, 0)
    // e1.rotateLocal(0, 0, 20)
    // e1.setLocalScale(-1, 1, 1)
    // XYZArrows({ parent: e1 })

    // const e2 = E({ parent: root })
    // e2.translateLocal(1, 0, 0)
    // e2.setLocalScale(-1, 1, 1)
    // const e3 = Box({ parent: e2 })
    // e3.rotateLocal(0, 0, 20)
    // XYZArrows({ parent: e3 })
}

export function hinges10(root: GraphNode, position: Vec3 = new Vec3(0, 0, 0)) {
    function ab(yscale: 1 | -1) {
        const e = E({
            parent: root,
            transform: {
                position,
                scale: new Vec3(1, yscale, 1)
            }
        })
        
        const a = Box({
            parent: e,
            rigid: true,
            size: new Vec3(1, 0.5, 1),
            transform: {
                position: new Vec3(0, 0.5, 0),
                rotation: new Vec3(0, 0, 30),
            }
        })
    
        const b = Box({
            parent: a,
            rigid: true,
            size: new Vec3(1, 0.2, 0.05),
            transform: {
                position: new Vec3(1.3, 0, 0),
                rotation: new Vec3(0, 0, 0)
            }
        })

        XYZArrows({parent:a})
        XYZArrows({parent:b})

        Hinge({
            entityA: a,
            entityB: b,
            axisA: Vec3.UP,
            axisB: Vec3.UP,
            pivotA: new Vec3(0.6, 0, 0),
            pivotB: new Vec3(-0.6, 0, 0),
            disableCollisionBetweenLinkedBodies: false,
        })
    }

    ab(1)
    ab(-1)
}

export function hinges11(root: GraphNode, position: Vec3 = new Vec3(-3, 0, 0)) {
    function ab(yscale: 1 | -1) {
        const e = E({
            parent: root,
            transform: {
                position,
                scale: new Vec3(1, yscale, 1)
            }
        })
        
        const a = Box({
            parent: e,
            rigid: true,
            size: new Vec3(1, 0.5, 1),
            transform: {
                position: new Vec3(0, 1.25, 0),
                rotation: new Vec3(0, 0, 30),
            }
        })
        
        Repetition({
            parent: a,
            itemPkg: {
                factory: Box,
                config: {
                    size: new Vec3(1, 0.25, 0.1)
                } as BoxConfigProps as unknown,
                runtime: {
                    rigid: true
                }
            },
            items: ["a", "b", "c"],
            layoutStrategy: {
                factory: LinkedJointed,
                config: {
                    hinge: {
                        axis: Vec3.UP,
                    },
                    joint: 'hinge',
                    length: 1,
                    linkTransform: {
                        position: new Vec3(0.1, 0, 0)
                    },
                } as LinkedJointedRepetitionLayoutStrategyConfigProps
            },
            transform: {
                position: new Vec3(0.6, 0, 0),
                rotation: new Vec3(0, 0, 30)
            }
        })
    }

    ab(1)
    ab(-1)
}

export function coneTwist1(root: GraphNode, position: Vec3 = new Vec3(0, 0, 0)) {
    const a = Box({
        parent: root,
        rigid: {
            type: RIGIDBODY_TYPE_DYNAMIC,
            mass: 20
        },
        transform: {
            position
        }
    })

    const b = Box({
        parent: a,
        rigid: true,
        size: new Vec3(1, 0.2, 0.2),
        transform: {
            position: new Vec3(1.2, 0, 0)
        }
    })

    XYZArrows({ parent: b })

    const joint = ConeTwist({
        entityA: a,
        entityB: b,
        frameA: {
            position: new Vec3(0.6, 0, 0),
        },
        frameB: {
            position: new Vec3(-0.6, 0, 0),
        }
    })

    b.rigidbody.applyImpulse(0, 1, 0)

    b.rigidbody.angularDamping = 0.999999
    
    joint.motorEnabled = true
    joint.motorMaxImpulse = 10
    joint.motorTarget = new Vec3(0, 30, 30)
}

export function coneTwist2(root: GraphNode, position: Vec3 = new Vec3(0, 0, 0)) {
    const a = Box({
        parent: root,
        rigid: {
            type: RIGIDBODY_TYPE_DYNAMIC,
            mass: 20
        },
        transform: {
            position
        }
    })

    const b = Box({
        parent: a,
        rigid: true,
        size: new Vec3(1, 0.2, 0.2),
        transform: {
            position: new Vec3(0.6 + (0.6 / Math.sqrt(3)), 0.6 + (0.6 / Math.sqrt(3)), 0.6 / Math.sqrt(3)),
            rotation: new Vec3(0, -45, 45)
        }
    })

    XYZArrows({parent: b})

    const joint = ConeTwist({
        entityA: a,
        entityB: b,
        frameA: {
            position: new Vec3(0.6, 0.6),
            rotation: new Vec3(0, 0, 45)
        },
        frameB: {
            position: new Vec3(-0.6, 0, 0),
            rotation: new Vec3(0, 45, 0)
        }
    })

    // b.rigidbody.applyImpulse(0, 1, 0)

    // b.rigidbody.angularFactor = new Vec3(0, 1, 1)

    joint.motorTarget = new Vec3(0, 30, 0)
    joint.motorEnabled = true
}

export function coneTwist3(root: GraphNode, position: Vec3 = new Vec3(0, 0, 0)) {
    const a = Box({
        parent: root,
        rigid: {
            type: RIGIDBODY_TYPE_DYNAMIC,
            mass: 20
        },
        transform: {
            position,
            scale: new Vec3(1, -1, 1)
        }
    })

    const b = Box({
        parent: a,
        rigid: true,
        size: new Vec3(1, 0.2, 0.2),
        transform: {
            position: new Vec3(1.2, 0, 0)
        }
    })

    XYZArrows({ parent: b })

    const joint = ConeTwist({
        entityA: a,
        entityB: b,
        frameA: {
            position: new Vec3(0.6, 0, 0),
        },
        frameB: {
            position: new Vec3(-0.6, 0, 0),
        }
    })

    b.rigidbody.applyImpulse(0, 1, 0)

    b.rigidbody.angularDamping = 100
    
    joint.damping = 10
    joint.motorEnabled = true
    joint.motorMaxImpulse = 10
    joint.motorTarget = new Vec3(0, 30, 30)
}

export function coneTwist4(root: GraphNode, position: Vec3 = new Vec3(0, 0, 0)) {
    const a = Box({
        parent: root,
        rigid: {
            type: RIGIDBODY_TYPE_DYNAMIC,
            mass: 20
        },
        transform: {
            position,
            scale: new Vec3(1, -1, 1)
        }
    })

    const b = Box({
        parent: a,
        rigid: true,
        size: new Vec3(1, 0.2, 0.2),
        transform: {
            position: new Vec3(0.6 + (0.6 / Math.sqrt(3)), 0.6 + (0.6 / Math.sqrt(3)), 0.6 / Math.sqrt(3)),
            rotation: new Vec3(0, -45, 45)
        }
    })

    XYZArrows({parent: b})

    const joint = ConeTwist({
        entityA: a,
        entityB: b,
        frameA: {
            position: new Vec3(0.6, 0.6),
            rotation: new Vec3(0, 0, 45)
        },
        frameB: {
            position: new Vec3(-0.6, 0, 0),
            rotation: new Vec3(0, 45, 0)
        }
    })

    joint.motorTarget = new Vec3(0, 30, 0)
    joint.motorEnabled = true

    // b.rigidbody.applyImpulse(0, 1, 0)
    // b.rigidbody.angularFactor = new Vec3(0, 1, 1)
}

export function coneTwist5(root: GraphNode, position: Vec3 = new Vec3(0, 0, 0)) {
    const a = Box({
        parent: root,
        rigid: {
            type: RIGIDBODY_TYPE_DYNAMIC,
            mass: 20
        },
        transform: {
            position,
            scale: new Vec3(1, -1, 1)
        }
    })

    const b = Box({
        parent: a,
        rigid: true,
        size: new Vec3(1, 0.2, 0.2),
        transform: {
            position: new Vec3(2 + (0.6 / Math.SQRT2), 2 + (0.6 / Math.SQRT2), 0),
            rotation: new Vec3(0, 0, 45)
        }
    })

    XYZArrows({ parent: b })

    const joint = ConeTwist({
        entityA: a,
        entityB: b,
        frameA: {
            position: new Vec3(2, 2),
            rotation: new Vec3(0, 0, 45)
        },
        frameB: {
            position: new Vec3(-0.6, 0, 0),
            rotation: new Vec3(0, 0, 0)
        }
    })

    joint.motorTarget = new Vec3(0, 0, 0)
    joint.motorEnabled = true

    // b.rigidbody.applyImpulse(0, 1, 0)
    // b.rigidbody.angularFactor = new Vec3(0, 1, 1)
}

export function rotationAxes(root: GraphNode, position: Vec3 = new Vec3(0, 1, 1)) {
    const center = XYZArrows({
        parent: root,
        transform: {
            position
        }
    })

    const arrows = 18
    const spacing = 20
    const radius = 1.5

    // X
    for (let i = 0; i < arrows; i++) {
        Arrow({
            parent: E({
                parent: center,
                transform: {
                    rotation: new Vec3(i * spacing, 0, 0)
                }
            }),
            color: Color.RED,
            transform: {
                position: new Vec3(0, 0, radius),
                rotation: new Vec3(0, 0, -90)
            }
        })
    }

    // Y
    for (let i = 0; i < arrows; i++) {
        Arrow({
            parent: E({
                parent: center,
                transform: {
                    rotation: new Vec3(0, i * spacing, 0)
                }
            }),
            color: Color.GREEN,
            transform: {
                position: new Vec3(0, 0, radius),
                rotation: new Vec3(0, 0, 0)
            }
        })
    }

    // Z
    for (let i = 0; i < arrows; i++) {
        Arrow({
            parent: E({
                parent: center,
                transform: {
                    rotation: new Vec3(0, 0, i * spacing)
                }
            }),
            color: Color.BLUE,
            transform: {
                position: new Vec3(radius, 0, 0),
                rotation: new Vec3(90, 0, 90)
            }
        })
    }
}

export function bird(root: GraphNode, position: Vec3 = new Vec3(0, 1, 0)) {
    return animals.Bird({
        parent: root,
        transform: {
            position,
            rotation: new Vec3(0, 0, 120)
        },
        tags: [TAG_FLUID_COLLIDABLE]
    })
}

export function ground(root: GraphNode, position: Vec3 = new Vec3(0, 0, -1)) {
    return Box({
        parent: root,
        size: new Vec3(20, 10, 0.2),
        transform: {
            position
        },
        material: material({ diffuse: new Color(0.8, 0.8, 0.8) }),
        rigid: {
            type: RIGIDBODY_TYPE_STATIC,
        }
    })
}

export function box1(root: GraphNode, position: Vec3 = new Vec3(-1, 1, 0)) {
    const e = E({
        parent: root,
        transform: {
            rotation: new Vec3(0, 0, 90)
        }
    })

    Box_0_1({
        parent: e,
        material: material({ diffuse: new Color(0, 0.5, 0) }),
        transform: {
            position,
            rotation: new Vec3(0, 0, 0),
            scale: new Vec3(1, 0.5, 0.1)
        }
    })

    Box_0_1({
        parent: e,
        material: material({ diffuse: new Color(0, 0.3, 0) }),
        transform: {
            position,
            rotation: new Vec3(0, 20, 0),
            scale: new Vec3(1, 0.5, 0.1)
        }
    })

    Box_0_1({
        parent: e,
        material: material({ diffuse: new Color(0, 0.4, 0) }),
        transform: {
            position,
            rotation: new Vec3(0, -20, 0),
            scale: new Vec3(1, 0.5, 0.1)
        }
    })
}

export function box2(root: GraphNode, position: Vec3 = new Vec3(0, 1, 0)) {
    const e1 = E({
        parent: root,
        transform: {
            // position,
            scale: new Vec3(1, -1, 1)
        }
    })

    const e2 = E({
        parent: e1,
        transform: {
            rotation: new Vec3(0, 0, 30),
        }
    })
    XYZArrows({ parent: e2 })

    console.log('e2')
    console.log(e2.getLocalEulerAngles())
    console.log(e2.getEulerAngles())
    console.log(e2.getLocalScale())
    console.log(e2.getScale())
    // const e2_t = reparentToRootSaveTransform(e2)
    // console.log('e2_t')
    // console.log(e2_t)

    const e3 = XYZArrows({
        parent: e2,
        transform: {
            position: new Vec3(2, 0, 0)
        },
        // rigid: true
    })

    const e3_t = transform4nodeWorld(e3)
    console.log('e3_t')
    console.log(e3_t)

    const e3_c = reparentToRootSaveTransform(e3)
    console.log('e3_c')
    console.log(e3_c)

    Sphere({
        parent: root,
        radius: 0.1,
        material: material({ diffuse: new Color(1, 1, 0) }),
        transform: {
            position: transform2matrix(e3_t).transformPoint(new Vec3(0.5, 0, 0))
        }
    })

    const e4_t = transformTransform(e3_t, { position: new Vec3(1, 0, 0) })
    console.log('e4_t')
    console.log(e4_t)

    XYZArrowsWrapped(Sphere)({
        parent: root,
        radius: 0.1,
        material: material({ diffuse: new Color(0, 1, 1) }),
        transform: e4_t
    } as SphereProps)

    // const arrows = XYZArrows({ parent: root })
    // setTransform(arrows, {
    //     position: new Vec3(1, -1, 0),
    //     rotation: new Vec3(0, 0, 20),
    //     // scale: new Vec3(1, -1, 1)
    // })
}

export function box3(root: GraphNode, position: Vec3 = new Vec3(0, 1, 0)) {
    const c1 = XYZArrows({
        parent: root,
        transform: {
            scale: new Vec3(1, -1, 1),
            position
        }
    })

    const c2 = XYZArrows({
        parent: c1,
        transform: {
            rotation: new Vec3(0, 0, 30),
        }
    })

    const c3 = XYZArrows({
        parent: c2,
        transform: {
            // position: new Vec3(2, 0, 0)
            rotation: new Vec3(0, 0, -40)
        }
    })

    // reparentToRootSaveTransform(c2)
}

export function mirroredRB_1(root: GraphNode, position: Vec3 = new Vec3(2.3, -1.7, 0)) {
    const a = Box({
        parent: root,
        transform: {
            position,
            scale: new Vec3(1, 1, 1)
        },
        rigid: true
    })

    Box({
        parent: a,
        size: new Vec3(1, 0.2, 1.4),
        transform: {
            position: new Vec3(0, 1.2, 0)
        }
    })
}

export function mirroredRB_2(root: GraphNode, position: Vec3 = new Vec3(2.3, 2, 0)) {
    const a = Box({
        parent: root,
        transform: {
            position,
            scale: new Vec3(1, -1, 1)
        },
        // rigid: true
    })

    const factory = XYZArrowsWrapped(Box)

    factory({
        parent: a,
        size: new Vec3(1, 0.2, 1.4),
        transform: {
            position: new Vec3(0, 1.2, 0)
        },
        rigid: true
    } as any)
}

export function LR1(root: GraphNode, position: Vec3 = new Vec3(2.3, -1.7, 0)) {
    Mirrored({
        parent: root,
        mirror: { y: true },
        pkg: {
            factory: XYZArrowsWrapped(Box),
            config: {
                size: new Vec3(1, 0.3, 0.5),
                transform: {
                    position: new Vec3(0, 1, 0)
                },
                rigid: true
            } as BoxConfigProps,
            runtime: {
                material: material({ diffuse: new Color(0.2, 0.5, 0.1) })
            }
        },
        transform: {
            position
        }
    })
}

export function LR1a(root: GraphNode, position: Vec3 = new Vec3(-1, 1, 0)) {
    BilateralMirrored({
        parent: root,
        pkg: {
            factory: XYZArrows
        },
        transform: {
            position: new Vec3(0, 0.8, 0.2)
        }
    })
}

export function LR2(root: GraphNode, position: Vec3 = new Vec3(-2.3, -1.7, 0)) {
    BilateralMirrored({
        parent: root,
        pkg: {
            factory: Box,
            config: {
                size: new Vec3(1, 0.3, 0.5),
                transform: {
                    position: new Vec3(0, 1.5, 0)
                },
                rigid: true
            } as BoxConfigProps,
            runtime: {
                material: material({ diffuse: new Color(0.2, 0.5, 0.1) })
            }
        },
        transform: {
            position
        }
    })
}

export function LR2a(root: GraphNode, position: Vec3 = new Vec3(-2.3, -1.7, 0)) {
    const e1 = (XYZArrowsWrapped(entity))({
        parent: root,
        transform: {
            position
        }
    })

    const e2_L = entity({
        parent: e1,
        transform: {}
    })

    const e2_R = entity({
        parent: e1,
        transform: {
            rotation: new Vec3(0, 0, 180)
        }
    })

    const boxPkg = {
        factory: Box as EntityFactory,
        config: {
            size: new Vec3(1, 0.3, 0.5),
            transform: {
                position: new Vec3(0, 1.5, 0)
            },
            rigid: true
        } as BoxConfigProps,
        runtime: {
            material: material({ diffuse: new Color(0.2, 0.5, 0.1) })
        }
    }

    PackagedEntity(boxPkg, { parent: e2_L })
    PackagedEntity(boxPkg, { parent: e2_R })
}

export function finger(root: GraphNode, position: Vec3 = new Vec3(-1, 1, 0)) {
    Finger({
        parent: root,
        segmentLengths: [0.4, 0.5, 0.3],
        size: new Vec2(0.1, 0.075),
        material: material({ diffuse: new Color(0.3, 0.25, 0.1) }),
        transform: {
            position
        },
        rigid: true
    })
}

export function hand(root: GraphNode, position: Vec3 = new Vec3(0, 0, 1.5)) {
    const e0 = E({
        parent: root,
        transform: {
            position,
            scale: new Vec3(1, -1, 1),
        }
    })

    const e1 = E({
        parent: e0,
        transform: {
            rotation: new Vec3(0, 0, 90)
        }
    })

    const wrist = Box({
        parent: e1,
        size: new Vec3(1, 0.5, 0.2),
        rigid: {
            // type: RIGIDBODY_TYPE_KINEMATIC
            type: RIGIDBODY_TYPE_DYNAMIC
        }
    })

    XYZArrows({ parent: wrist })
    
    const hand = LimbEnd({
        ...DiverA.arms.limbEnd,
        parent: wrist,
        transform: {
            position: new Vec3(0.6, 0, 0),
        }
    })

    // Script({
    //     parent: wrist,
    //     script: RotateScript,
    //     attributes: {
    //         speed: 50
    //     }
    // })

    Hinge({
        entityA: wrist,
        entityB: hand,
        axisA: Vec3.UP,
        axisB: Vec3.UP,
        pivotA: new Vec3(0.6, 0, 0)
    })

    // Hinge({
    //     pivotA: new Vec3(0.6, 0, 0),
    //     // pivotB: new Vec3(-0.1, 0, 0),
    //     axisA: Vec3.UP,
    //     axisB: new Vec3(0, 1, 0),
    //     entityA: wrist,
    //     entityB: hand,
    //     // limits: new Vec2(30, 30),
    //     // softness: 0,
    //     // relaxationFactor: 0,
    //     // biasFactor: -0.01,
    // })
}

export function arm(root: Entity, position: Vec3 = new Vec3(-4, -1, 0)) { 
    function arm1(offset: Vec3, scale: Vec3) {
        const shoulder_0 = E({
            parent: e,
            transform: {
                position: offset,
                scale
            }
        })

        const shoulder_1 = Box({
            parent: shoulder_0,
            transform: {
                rotation: new Vec3(0, 0, 30)
            },
            rigid: {
                type: RIGIDBODY_TYPE_KINEMATIC
            }
        })

        const shoulder_2 = XYZArrows({
            parent: shoulder_1,
            transform: {
                position: new Vec3(0.6, 0, 0)
            }
        })

        Limb({
            ...DiverA.arms,
            parent: shoulder_1,
            transform: {
                position: new Vec3(0.7, 0, 0)
            }
        })
    }

    const e = E({
        parent: root,
        transform: {
            position
        }
    })

    arm1(new Vec3(0, -1, 0), new Vec3(1, -1, 1))
    arm1(new Vec3(0, 1, 0), new Vec3(1, 1, 1))
}

export function armsLR(root: Entity, position: Vec3 = new Vec3(-2, -1, 0)) {
    // const shoulder = Box({
    //     parent: root,
    //     size: new Vec3(0.5, 0.1, 2),
    //     rigid: {
    //         type: RIGIDBODY_TYPE_STATIC
    //     },
    //     transform: {
    //         position,
    //         rotation: new Vec3(0, 0, 0),
    //         scale: new Vec3(1, -1, 1)
    //     }
    // })

    // const limb = PackagedEntity({
    //     factory: Limb,
    //     config: diverConfigs.personA.arms
    // }, {
    //     parent: shoulder
    // })

    Mirrored<LimbConfigProps, LimbRuntimeProps>({
        parent: Box({
            parent: root,
            size: new Vec3(0.5, 0.1, 2),
            rigid: {
                type: RIGIDBODY_TYPE_STATIC
            },
            transform: {
                position,
                rotation: new Vec3(0, 0, 0)
            }
        }),
        mirror: { y: true },
        pkg: {
            factory: Limb,
            config: DiverA.arms,
        }
    } as MirroredProps<LimbConfigProps, LimbRuntimeProps>)
}

export function diver(root: Entity, position: Vec3 = new Vec3(0, 0, 3.8)) {
    const diver = Creature({
        parent: root,
        kind: human.CreatureKind,
        transform: {
            position
        }
    })

    // const rig = new Rig()
    // rig.controllers.push(new ai.RhythmicSinePoseController({
    //     head: {
    //         amplitude: 20,
    //         mean: 0,
    //     },

    //     arms: {
    //         left: {
    //             upper: {
    //                 amplitude: 30,
    //                 mean: 30,
    //             },
    //             lower: {
    //                 amplitude: 35,
    //                 mean: 45
    //             },
    //             end: {
    //                 amplitude: 20,
    //                 mean: -5
    //             }
    //         },

    //         right: {
    //             upper: {
    //                 amplitude: 30,
    //                 mean: 30
    //             },
    //             lower: {
    //                 amplitude: 35,
    //                 mean: 45
    //             },
    //             end: {
    //                 amplitude: 20,
    //                 mean: -5
    //             }
    //         }
    //     },

    //     legs: {
    //         left: {
    //             upper: {
    //                 amplitude: 30,
    //                 mean: 30,
    //             },
    //             lower: {
    //                 amplitude: 35,
    //                 mean: 45
    //             },
    //             end: {
    //                 amplitude: 20,
    //                 mean: -5
    //             }
    //         },

    //         right: {
    //             upper: {
    //                 amplitude: 30,
    //                 mean: 30
    //             },
    //             lower: {
    //                 amplitude: 35,
    //                 mean: 45
    //             },
    //             end: {
    //                 amplitude: 20,
    //                 mean: -5
    //             }
    //         }
    //     }
    // }))

    // rig.control(diver)
}

export function reparent1(root: Entity, position: Vec3 = new Vec3(0, 2, 0)) {
    const a = entity({
        parent: root,
        transform: {
            position
        }
    })

    const b1 = Box({
        parent: a,
        size: new Vec3(0.5, 0.5, 0.5)
    })

    const b2 = Box({
        parent: a,
        size: new Vec3(0.5, 0.5, 0.5),
        transform: {
            position: new Vec3(0, 0.5, 0)
        }
    })

    root.addChildAndSaveTransform(b1)
    b1.reparent(root)

    Script({
        parent: a,
        script: RotateScript,
        attributes: {}
    })
}