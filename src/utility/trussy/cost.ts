import Truss from '../Truss'

/**
 * @returns {number}
 * Returns how much the bridge costs
 */
export const cost = (truss: Truss): number => {
    const joints = truss.joints
    let cost = 0
    for (let i = 0; i < truss.size; i++) {
        const a = joints[i]
        for (let j = i; j < truss.size; j++) {
            const b = joints[j]
            if (b.id in a.connections) {
                cost += a.distanceTo(b) * 15
            }
        }
    }

    cost += truss.size * 5
    return cost
}
