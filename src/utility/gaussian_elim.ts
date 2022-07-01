import { Vector2, Vector3 } from "three"

export function gaussianElimination(matrix: number[][], vector: number[]): number[] {
    // make sure the matrix is square
    if (matrix.length !== matrix[0].length) {
        throw new Error("Matrix is not square")
    }
    
    // make sure the matrix and vector are the same size
    if (matrix.length !== vector.length) {
        throw new Error("Matrix and vector are not the same size")
    }
    
    // make sure the matrix is not singular
    if (matrix.length === 2) {
        if (matrix[0][0] === 0) {
        throw new Error("Matrix is singular")
        }
    } else {
        if (matrix[0][0] === 0 || matrix[1][0] === 0) {
        throw new Error("Matrix is singular")
        }
    }
    
    // make a copy of the matrix
    let matrixCopy = matrix.map((row) => row.slice())
    
    // make a copy of the vector
    let vectorCopy = vector.slice()
    
    // loop through every row
    for (let i = 0; i < matrixCopy.length; i++) {
        // loop through every column
        for (let j = i + 1; j < matrixCopy.length; j++) {
            // if the current row is not 0
            if (matrixCopy[i][i] !== 0) {
                // calculate the ratio of the current row
                const ratio = matrixCopy[j][i] / matrixCopy[i][i]
                
                // multiply the current row by the ratio
                matrixCopy[j] = matrixCopy[j].map((n, k) => n - ratio * matrixCopy[i][k])
                
                // multiply the current vector by the ratio
                vectorCopy[j] = vectorCopy[j] - ratio * vectorCopy[i]
            }
        }
    }
    
    // loop through every row
    for (let i = matrixCopy.length - 1; i >= 0; i--) {
        // loop through every column
        for (let j = i - 1; j >= 0; j--) {
            // if the current row is not 0
            if (matrixCopy[i][i] !== 0) {
                // calculate the ratio of the current row
                const ratio = matrixCopy[j][i] / matrixCopy[i][i]
                
                // multiply the current row by the ratio
                matrixCopy[j] = matrixCopy[j].map((n, k) => n - ratio * matrixCopy[i][k])
                
                // multiply the current vector by the ratio
                vectorCopy[j] = vectorCopy[j] - ratio * vectorCopy[i]
            }
        }
    }
    
    // loop through every row
    for (let i = 0; i < matrixCopy.length; i++) {
        // multiply the current row by the ratio
        vectorCopy[i] = vectorCopy[i] / matrixCopy[i][i]
    }
    
    return vectorCopy
}