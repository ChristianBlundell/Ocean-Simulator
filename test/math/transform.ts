import { params, test, suite } from '@testdeck/mocha'
import { assert } from 'chai';
import { Vec3 } from 'playcanvas';
import { BasicTransform, cloneBasicTransform, transformTransform } from '../../src/math';
import { transformsEq } from '../equality-helpers';

@suite class TransformTests {
    @params({
        world: {
        } as BasicTransform,
        local: {
        } as BasicTransform,
        expected: {
        } as BasicTransform
    })
    @params({
        world: {
            position: new Vec3(10, 5, 3),
            rotation: new Vec3(0, 0, 30),
        } as BasicTransform,
        local: {
            position: new Vec3(1, 0, 0),
        } as BasicTransform,
        expected: {
            position: new Vec3(10, 5, 3).add(new Vec3(Math.sqrt(3) / 2, 1 / 2, 0)),
            rotation: new Vec3(0, 0, 30),
        } as BasicTransform
    })
    @params({
        world: {
            position: new Vec3(10, 5, 3),
            rotation: new Vec3(30, 0, 0),
        } as BasicTransform,
        local: {
            position: new Vec3(1, 0, 0),
        } as BasicTransform,
        expected: {
            position: new Vec3(10, 5, 3).add(new Vec3(1, 0, 0)),
            rotation: new Vec3(30, 0, 0),
        } as BasicTransform
    })
    @params({
        world: {
            position: new Vec3(10, 5, 3),
            rotation: new Vec3(0, 30, 0),
        } as BasicTransform,
        local: {
            position: new Vec3(1, 0, 0),
        } as BasicTransform,
        expected: {
            position: new Vec3(10, 5, 3).add(new Vec3(Math.sqrt(3) / 2, 0, -1 / 2)),
            rotation: new Vec3(0, 30, 0),
        } as BasicTransform
    })
    @params({
        world: {
            rotation: new Vec3(0, 30, 0),
        } as BasicTransform,
        local: {
            rotation: new Vec3()
        } as BasicTransform,
        expected: {
            rotation: new Vec3(0, 30, 0),
        } as BasicTransform
    })
    @params({
        world: {
            rotation: new Vec3(0, 30, 0),
        } as BasicTransform,
        local: {
            rotation: new Vec3(0, -50, 0),
        } as BasicTransform,
        expected: {
            rotation: new Vec3(0, -20, 0),
        } as BasicTransform
    })
    @params({
        world: {
            rotation: new Vec3(0, 30, 0),
            scale: new Vec3(-1, 1, 1),
        } as BasicTransform,
        local: {
            rotation: new Vec3(0, -50, 0),
        } as BasicTransform,
        expected: {
            rotation: new Vec3(0, 20, 0),
            scale: new Vec3(-1, 1, 1),
        } as BasicTransform
    })
    @params({
        world: {
            rotation: new Vec3(0, 30, 0),
        } as BasicTransform,
        local: {
            rotation: new Vec3(0, 0, 45),
        } as BasicTransform,
        expected: {
            rotation: new Vec3(0, 20, 45),
        } as BasicTransform
    })
    @test "transformTransform()"(
        { world, local, expected }: {
            world: BasicTransform,
            local: BasicTransform,
            expected: BasicTransform
        }) {
        // world = cloneBasicTransform(world)
        world = transformTransform(world, local)
        console.log(world)
        console.log(expected)
        assert(transformsEq(world, expected))
    }
}