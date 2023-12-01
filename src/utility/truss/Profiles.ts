import { Vector2 } from "three"

export default abstract class Profile {
	abstract getAreaMomentOfInertia(area: number): Vector2
	abstract getWidth(area: number): number
	abstract getHeight(area: number): number
}


export class Rectangular extends Profile {
	aspectRatio: number

	constructor(width: number, height: number) {
		super()
		this.aspectRatio = width / height
	}

	getAreaMomentOfInertia(area: number): Vector2 {
		const width = this.getWidth(area)
		const height = this.getHeight(area)
		return new Vector2(width * height ** 3 / 12, height * width ** 3 / 12)
	}

	getWidth(area: number): number {
		return Math.sqrt(area * this.aspectRatio)
	}

	getHeight(area: number): number {
		return Math.sqrt(area / this.aspectRatio)
	}
}


export class Circular extends Profile {
	getAreaMomentOfInertia(area: number): Vector2 {
		const radius = this.getRadius(area)
		return new Vector2(Math.PI * radius ** 4 / 4, Math.PI * radius ** 4 / 4)
	}

	getWidth(area: number): number {
		return this.getRadius(area) * 2
	}

	getHeight(area: number): number {
		return this.getRadius(area) * 2
	}

	getRadius(area: number): number {
		return Math.sqrt(area / Math.PI)
	}
}


export class HollowRectangular extends Profile {
	aspectRatio: number
	thickness: number

	constructor(width: number, height: number, thickness: number) {
		super()
		this.aspectRatio = width / height
		this.thickness = thickness
	}

	getAreaMomentOfInertia(area: number): Vector2 {
		const width = this.getWidth(area)
		const height = this.getHeight(area)
		
		const innerWidth = width - this.thickness * 2
		const innerHeight = height - this.thickness * 2

		const outer = new Vector2(width * height ** 3 / 12, height * width ** 3 / 12)
		const inner = new Vector2(innerWidth * innerHeight ** 3 / 12, innerHeight * innerWidth ** 3 / 12)

		return outer.sub(inner)
	}

	getWidth(area: number): number {
		return (area / this.thickness + this.thickness) / (1 + 1 / this.aspectRatio)
	}

	getHeight(area: number): number {
		return (area / this.thickness + this.thickness) / (1 + this.aspectRatio)
	}
}


export class HollowCircular extends Profile {
	thickness: number

	constructor(thickness: number) {
		super()
		this.thickness = thickness
	}

	getAreaMomentOfInertia(area: number): Vector2 {
		const radius = this.getRadius(area)
		const innerRadius = radius - this.thickness

		const outer = new Vector2(Math.PI * radius ** 4 / 4, Math.PI * radius ** 4 / 4)
		const inner = new Vector2(Math.PI * innerRadius ** 4 / 4, Math.PI * innerRadius ** 4 / 4)

		return outer.sub(inner)
	}

	getWidth(area: number): number {
		return this.getRadius(area) * 2
	}

	getHeight(area: number): number {
		return this.getRadius(area) * 2
	}

	getRadius(area: number): number {
		return area / (2 * Math.PI * this.thickness * (1 - this.thickness))
	}
}


// export class IBeam extends Profile {
// 	aspectRatio: number
// 	flangeThickness: number
// 	webThickness: number

// 	constructor(width: number, height: number, flangeThickness: number, webThickness: number) {
// 		super()
// 		this.aspectRatio = width / height
// 		this.flangeThickness = flangeThickness
// 		this.webThickness = webThickness
// 	}

// 	getAreaMomentOfInertia(area: number): Vector2 {
// 		const width = this.getWidth(area)
// 		const height = this.getHeight(area)

// 		const flangeWidth = width - this.webThickness * 2
// 		const flangeHeight = height - this.flangeThickness * 2

// 		const outer = new Vector2(width * height ** 3 / 12, height * width ** 3 / 12)
// 		const flange = new Vector2(flangeWidth * flangeHeight ** 3 / 12, flangeHeight * flangeWidth ** 3 / 12)

// 		return outer.sub(flange)
// 	}

// 	getWidth(area: number): number {
// 		return (area / this.flangeThickness + this.flangeThickness) / (1 + 1 / this.aspectRatio)
// 	}

// 	getHeight(area: number): number {
// 		return (area / this.webThickness + this.webThickness) / (1 + this.aspectRatio)
// 	}
// }