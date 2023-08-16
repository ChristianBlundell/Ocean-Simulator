import { params, suite, test } from "@testdeck/mocha";
import { assert } from "chai";
import { Vec3 } from "playcanvas";
import { basis4transform, decomposeEuler, EulerAngle, rotate, rotateBasis } from "../../src/math";
import { prettyPrint } from "../../src/utils";
import { vectorsEq } from "../equality-helpers";

@suite class EulerTests {
    @params({a: new Vec3(1, 0, 0), b: new Vec3(1, 0, 0), eulerAngle: new Vec3(90, 0, 0)})
    @params({a: new Vec3(1, 0.1, 0), b: new Vec3(1, 0, 0.1), eulerAngle: new Vec3(90, 0, 0)})
    @params({a: new Vec3(1, 0, -0.1), b: new Vec3(1, 0.1, 0), eulerAngle: new Vec3(90, 0, 0)})
    @params({a: new Vec3(1, 0, -0.1), b: new Vec3(Math.sqrt(3) / 2, 0.1, -0.5), eulerAngle: new Vec3(90, 30, 0)})
    @test "rotate by euler angle"({ a, b, eulerAngle }:
        { a: Vec3, b: Vec3, eulerAngle: EulerAngle }) {
        
        /**
         * This test simply takes a given start vector (a), a rotation in euler
         * angles (eulerAngle), and an expected final vector (b).
         * It will rotate the start vector according to the given rotation and
         * check that the actual final vector is approximately equal to the
         * expected final vector.
         */
        
        const rotated = rotate(a, eulerAngle)
        assert(vectorsEq(rotated, b))
    }

    @params({ eulerAngle: new Vec3(0, 0, 0) })
    @params({ eulerAngle: new Vec3(90, 0, 0) })
    @params({ eulerAngle: new Vec3(-45, 0, 0) })
    @params({ eulerAngle: new Vec3(0, 0, 0), up: new Vec3(0, 0, 1).normalize() })
    @params({ eulerAngle: new Vec3(90, 0, 0), up: new Vec3(0, -1, 0).normalize() })
    @params({ eulerAngle: new Vec3(90, 0, 0), up: new Vec3(0, -1.2, 0).normalize() })
    @params({ eulerAngle: new Vec3(90, 0, 0), up: new Vec3(0.1, -1, 0).normalize() })
    @params({ eulerAngle: new Vec3(90, 0, 0), up: new Vec3(-0.3, -1.1, 0).normalize() })
    @params({ eulerAngle: new Vec3(-45, 0, 0), up: new Vec3(0, 1, 1).normalize() })
    @params({ eulerAngle: new Vec3(20, 0, 0) })
    @params({ eulerAngle: new Vec3(-10, 0, 0) })
    @params({ eulerAngle: new Vec3(-10, 0, 30) })
    @params({ eulerAngle: new Vec3(90, 0, 20) })
    @params({ eulerAngle: new Vec3(0, 10, 0) })
    @params({ eulerAngle: new Vec3(0, 10, 20) })
    @params({ eulerAngle: new Vec3(0, 10, 20) })
    @params({ eulerAngle: new Vec3(0, 20, -40) })
    @params({ eulerAngle: new Vec3(90, 10, 0) })
    @params({ eulerAngle: new Vec3(90, 10, 20) })
    @params({ eulerAngle: new Vec3(35, 10, 20) })
    @params({ eulerAngle: new Vec3(-5, 20, -40) })
    @test "decompose identity rotation"({ eulerAngle, vector, up }:
        { eulerAngle: EulerAngle, vector?: Vec3, up?: Vec3 }) {
        /**
         * This test takes a starting forward vector (vector), an up vector (up),
         * and a rotation in euler angles (eulerAngle).
         * 
         * It rotates the starting vectors by the given rotation.
         * 
         * Then it tries to decompose those vectors into the euler angle
         * rotation that could've been used to get to them, without using its
         * knowledge of the rotation that was actually used.
         * 
         * Then it tests that the decomposed rotation approximately equals the
         * actual rotation that was used.
         */

        const vector_rotated_byParameter = vector ?? rotate(Vec3.RIGHT, eulerAngle)
        const up_rotated_byParameter = up ?? rotate(Vec3.BACK, eulerAngle)

        const decomposed: EulerAngle = decomposeEuler(vector_rotated_byParameter, up_rotated_byParameter)
        //console.log(`rotation: given: ${prettyPrint(eulerAngle, 0)}\tdecomposed: ${prettyPrint(decomposed, 0)}`)

        assert(vectorsEq(eulerAngle, decomposed))
    }

    @params({ angle: new Vec3(0, 0, 0) })
    @params({ angle: new Vec3(30, 0, 0) })
    @params({ angle: new Vec3(0, 30, 0) })
    @params({ angle: new Vec3(0, 0, 30) })
    @params({ angle: new Vec3(30, 20, 0) })
    @params({ angle: new Vec3(30, 20, 10) })
    @test "rotate basis with rotateBasis() vs. individual vectors"({ angle }: { angle: Vec3 }) {
        const basis = basis4transform({})
        const basis_transformed = rotateBasis(basis, angle)

        assert(vectorsEq(rotate(basis.x, angle), basis_transformed.x))
        assert(vectorsEq(rotate(basis.y, angle), basis_transformed.y))
        assert(vectorsEq(rotate(basis.z, angle), basis_transformed.z))
    }
}