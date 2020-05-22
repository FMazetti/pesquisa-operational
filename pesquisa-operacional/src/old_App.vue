<template>
    <div id="app" class="container">
        <div class="row"  v-show="!showPanels">
            <variable
                    class="col-6 card"
                    ref="decisions"
                    title="Decisão"
                    idModal="decisions"
                    helper=""
                    :canCheck="false"
                    :showButton="!showPanels"
                    :canMoreThanOne="true"
                    :checkString="false"
            />
            <variable
                    class="col-6 card"
                    ref="objective"
                    idModal="objective"
                    title="Funcão Objetivo"
                    helper="Favor adicionar a função sem espaços, exemplo: <br/>10x1 + 9x2"
                    :canCheck="true"
                    :showButton="!showPanels"
                    :canMoreThanOne="false"
                    :checkString="false"
            />
            <variable
                    class="col-12 card"
                    ref="restrictions"
                    idModal="restrictions"
                    title="Restrição"
                    helper="Favor adicionar a restrição sem espaços e sem a variável de folga, exemplo: <br/>7/10X1+1X2&lt;=630"
                    :canCheck="false"
                    :showButton="!showPanels"
                    :canMoreThanOne="true"
                    :checkString="true"
            />
        </div>

        <button class="btn btn-success" @click="getInfo()" v-show="!showPanels">Calcular</button>

        <div v-show="showPanels">
            <div class="iterations" v-for="(iteration, index) in this.iterations" :key="index">
                <h2>Iteração {{index}}</h2>
                <table class="table table-bordered">
                    <tr v-for="(line, indexL) in iteration" :key="indexL">
                        <td v-for="(cell, indexC) in line" :key="indexC">
                            {{cell}}
                        </td>
                    </tr>
                </table>
            </div>

        </div>

    </div>
</template>

<script>
	import Variable from './components/Variable.vue'

	export default {
		name: 'App',
		components: {
			Variable
		},
		data() {
			return {
				isNegative: false,
				decisions: [],
				slack: [],
				restrictions: [],
				objective: '',
				iterations: [],
				showPanels: false
			}
		},
		methods: {

			changeSignal(value) {

				if (value.includes('-')) {
					return value.replace('-', '+');
				} else {
					if (value.includes('+')) {
						return value.replace('+', '-');
					}
				}
				return '-' + value;
			},

			simplifyNumber(value) {

				if (value === 0) {
					return 0;
				}
				console.log(value);

				let splited = value.split(/(?=[A-Z])/g)


				for (let i in splited) {
					try {
						if (!splited[i].match(/[A-Z]/i)) {
							value = parseFloat(eval(splited[i]).toFixed(5));
						}
					} catch (e) {
						console.log(e);
					}
				}

				if (typeof value === 'string') {
					let stringToNumber = value.split(/([A-Z])/g)
					if (stringToNumber[0] === '-') {
						return -1;
					} else {
						return 1;
					}
				} else {
					return value;
				}

			},

			getInfo() {
				this.decisions = this.$refs.decisions.$data.variableValues;

				// this.decisions = ['XA', 'XP', 'XS'];
				// <= folga positiva
				// >= folga negativa
				let restrictions = this.$refs.restrictions.$data.variableValues;
				// restrictions = ['100XP+200XS<=14000', '100000XP+200000XS<=12750000', 'XA+XP+XS<=100']
				// let restrictions = this.restrictions;
				for (let i in restrictions) {
					let splitRule = restrictions[i].split(/>=|<=+/);
					this.restrictions.push(splitRule[0] + (!restrictions[i].includes('<=') ? '-' : '+') + 'F' + (~~i + 1) + '=' + splitRule[1])
					this.slack.push('F' + (~~i + 1));
				}
				//
				//max objetivo continua igual
				//min objetivo *-1
				let objective = this.$refs.objective.$data.variableValues[0];
				// objective = '300XA+400XP+500XS'

				if (this.$refs.objective.$data.minimize) {
					let objectiveSplited = objective.split(/(?=\+|-)/g);
					this.isNegative = true;

					for (let i in objectiveSplited) {
						this.objective += this.changeSignal(objectiveSplited[i]);
					}

				} else {
					this.objective = objective;
				}

				if (this.decisions.length === 0 || this.restrictions.length === 0 || this.objective === '')
					alert('faltando variáveis');
				else
					this.buildSimplex();

			},
			buildSimplex() {

				this.iterations[0] = [];

				let lineHead = ['Base'];
				lineHead = lineHead.concat(this.decisions, this.slack);
				lineHead.push('b');

				this.iterations[0][0] = lineHead;


				let lineBottom = [(this.isNegative ? '-' : '') + 'Z'];

				let objectives = this.objective.split(/(?=\+|-)/g);
				for (let i in this.decisions) {
					for (let j in objectives) {
						if (objectives[j].includes(this.decisions[i])) {
							lineBottom.push(this.simplifyNumber(this.changeSignal(objectives[i])));
						}
					}
				}

				lineBottom.push(0);

				for (let i in this.slack) {
					lineBottom.push(0);
					this.iterations[0][~~i + 1] = {};
					for (let j in lineHead) {
						if (lineHead[j] === 'Base') {
							this.iterations[0][~~i + 1][j] = this.slack[i];
						} else {
							if (lineHead[j] === 'b') {
								this.iterations[0][~~i + 1][j] = parseFloat(this.restrictions[i].split('=')[1]);
							} else {
								if (this.slack[i] === lineHead[j]) {
									this.iterations[0][~~i + 1][j] = 1;
								} else {
									if (this.restrictions[i].includes(lineHead[j])) {
										let valueToInclude = this.restrictions[i].split(/(?=\+|-)/g).filter((el) => {
											if (el.includes(lineHead[j])) {
												return this.simplifyNumber(el[0]);
											} else {
												return 0
											}
										})
										this.iterations[0][~~i + 1][j] = this.simplifyNumber(valueToInclude[0]);
									} else {
										this.iterations[0][~~i + 1][j] = 0;
									}
								}
							}
						}
					}
				}

				this.iterations[0].push(lineBottom);

				this.showPanels = true;

				this.iteration();

			},
			goIn() {

				let lastLineOfLastIteration = this.iterations[this.iterations.length - 1][this.iterations[this.iterations.length - 1].length - 1];

				let value = 0;
				let index = 0;
				for (let i in lastLineOfLastIteration) {
					if (lastLineOfLastIteration[i] < value) {
						value = lastLineOfLastIteration[i];
						index = i;
					}
				}

				console.log(value, index);

			},
			goOut() {

			},
			iteration() {

				//goIn

				this.goIn();
				console.log(this.iterations[this.iterations.length - 1][this.iterations[this.iterations.length - 1].length - 1])


			}
		}
	}
</script>

<style>
    #app {
        font-family: Avenir, Helvetica, Arial, sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        text-align: center;
        color: #2c3e50;
        margin-top: 60px;

    }

    body,
    html {
        height: 100%;
        background-color: aliceblue !important;
    }

</style>
