// module definition for https://github.com/Zunawe/bezier-spline

declare module "bezier-spline" {
    export type Point = number[]
    export type Points = Point[]

    export type weightsCallback = (i: number, knots: Points) => number

    export class BezierSpline {
        knots: Points
        weights: weightsCallback | number[]
        curves: BezierCurve[]

        /**
         * Creates a new spline.
         * @param {number[][]} knots A list of points of equal dimension that the spline will pass through.
         * @param {weightsCallback|number[]} weights A callback that calculates weights for a given segment or precalculated weights in an array. The first element of the array will be ignored.
         */
        constructor(knots: Points, weights?: weightsCallback | number[])
        
        /**
         * Recalculates the control points of the spline. Runs on the order of O(n)
         * operations where n is the number of knots.
         */
        recalculate(): void
        
        /**
         * The easiest way to change the spline's knots. Knots are kept as special
         * vector types, so setting an entire knot may break the program. Alternately,
         * you can read the documentation for vecn and manipulate the knots yourself.
         * @param {number[][]} newKnots A list of points of equal dimension that the spline will pass through.
         */
        setKnots(newKnots: Points): void
        
        /**
         * Gets all the points on the spline that match the query.
         * @example
         * spline.getPoints(0, 10)   // Returns all points on the spline where x = 10
         * @example
         * spline.getPoints(2, -2)   // Returns all points on the spline where z = -2
         * @param {number} axis The index of the axis along which to solve (i.e. if your vectors are [x, y, z], 0 means solve for when x = value).
         * @param {number} value The value to solve for (i.e. a Bezier cubic is on the left of an equation and this value is on the right).
         *
         * @returns {number[][]} A list of all points on the spline where the specified axis is equal to the specified value.
         */
        getPoints (axis: number, value: number): Points
    }

    export default BezierSpline

    export class BezierCurve {
        /**
         * Creates a curve from control points.
         * @param {number[][]} controlPoints The control points that define a Bezier curve
         */
        constructor(controlPoints: Points[])
      
        /**
         * Evaluates the bezier curve at the given value of t.
         * @param {number} t The parameter to plug in. (Clamped to the interval [0, 1])
         *
         * @returns {number[]} The point at which t equals the provided value.
         */
        at(t: number): Point
      
        /**
         * Finds all values of t for which a particular dimension is equal to a particular value.
         * @param {number} [axis=0] The index of the axis along which to solve (i.e. if your vectors are [x, y, z], 0 means solve for when x = value).
         * @param {number} [value=0] The value to solve for (i.e. the Bezier cubic is on the left of an equation and this value is on the right).
         *
         * @returns {number[]} All real roots of the described equation on the interval [0, 1].
         */
        solve(axis?: number, value?: number): Points
    }
}