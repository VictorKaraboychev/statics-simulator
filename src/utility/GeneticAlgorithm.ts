export type PopulationType<T> = {
	item: T,
	fitness: number
}

export default class GeneticAlgorithm<T> {
	public population_: PopulationType<T>[] = []
	public size_: number
	public mutationRate: number
	public passThroughRate: number

	private generation_: number

	private fitness_: (item: T) => number
	private mutate_: (item: T, generation: number) => T
	private crossover_: (a: T, b: T) => T
	
	constructor(config: {
		mutate: (item: T, generation: number) => T
		crossover: (a: T, b: T) => T
		fitness: (item: T) => number
		initialPopulation: T[]
		size?: number
		mutationRate?: number
		passThroughRate?: number
	}) {
		this.size_ = config.size ?? 100
		this.population_ = config.initialPopulation.map(item => ({ item, fitness: config.fitness(item) }))
		this.mutationRate = config.mutationRate ?? 0.1
		this.passThroughRate = config.passThroughRate ?? 0.2

		this.generation_ = 0

		this.fitness_ = config.fitness
		this.mutate_ = config.mutate
		this.crossover_ = config.crossover
	}

	evolve(): GeneticAlgorithm<T> {
		// this.population_ = this.population_.slice(0, this.size_ * this.passThroughRate) // pass through the best

		while (this.population_.length > this.size_ * this.passThroughRate) {
			const i = Math.floor(this.population_.length - (Math.random() * Math.sqrt(this.population_.length))**2)
			this.population_.splice(i, 1)
		}

		while (this.population_.length < this.size_) { // add new items until we have the target size
			const a = this.population_[Math.floor(Math.random() * this.population_.length)]
			const b = this.population_[Math.floor(Math.random() * this.population_.length)]

			let child = this.crossover_(a.item, b.item)
			if (Math.random() < this.mutationRate) {
				child = this.mutate_(child, this.generation_)
			}

			this.population_.push({ item: child, fitness: this.fitness_(child) })
		}

		this.population_ = this.population_.sort((a, b) => b.fitness - a.fitness) // sort by fitness

		this.generation_++
		return this
	}

	get best(): { item: T, fitness: number } {
		return this.population_[0]
	}

	get worst(): { item: T, fitness: number } {
		return this.population_[this.population_.length - 1]
	}

	get avgFitness(): number {
		const count = Math.floor(this.size_ * this.passThroughRate)

		let fitness = 0
		for (let i = 0; i < count; i++) {
			fitness += this.population_[i].fitness
		}

		return fitness / count
	}

	get generation(): number {
		return this.generation_
	}
}