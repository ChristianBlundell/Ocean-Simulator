declare module "linear-solve" {
    export function solve(A: number[][], b: number[]): number[]

    export function invert(A: number[][]): number[][]
}