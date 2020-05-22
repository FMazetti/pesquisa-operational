<template>
    <div id="app" class="container-fluid">

        <div class="container">
            <h2>SIMPLEX PO20</h2>
            <div class="card w-50 m-auto">
                <div class="card-body" v-show="step === 1">
                    <div class="mb-4 small">Sistema simples desenvolvido na disciplina de Pesquisa Operacional 2020
                    </div>

                    <div class="w-50 m-auto">
                        <label class="w-100 text-left small">
                            Número de Variáveis de Decisão
                            <input class="form-control" v-model="numberDecisions" type="number" min="1" max="10">
                        </label>
                        <label class="w-100 text-left small">
                            Número de Variáveis de Restrições
                            <input class="form-control" v-model="numberRestrictions" type="number">
                        </label>
                        <label class="w-100 text-left small">
                            Número de Iterações
                            <input class="form-control" v-model="numberIteractions" type="number">
                        </label>

                        <div class=" mt-4 w-100">
                            <button class="btn btn-primary text-uppercase" @click="step++">Maximizar</button>
                            <button class="btn btn-primary ml-2 text-uppercase" style="opacity: 0.9" @click="minimize">
                                minimizar
                            </button>
                        </div>
                    </div>
                </div>
                <div class="card-body" v-show="step === 2">
                    <div class="text-center small">Função objetivo</div>
                    <div class="place-f-o d-flex">
                        <span class="mt-4" v-show="!isNegative">Maximizar</span>
                        <span class="mt-4" v-show="isNegative">Minimizar</span>
                        <div class="w-auto d-flex" v-for="(n, index)  in ~~numberDecisions" :key="index">
                            <label class="text-left small">
                                {{'X'+n}}
                                <input type="number" class="decisions form-control">
                            </label>
                            <span v-show="n != numberDecisions" class="mt-4">+</span>
                        </div>
                    </div>

                    <div class="mt-4 small text-center">Restrições</div>
                    <div v-for="(nR, indexR)  in ~~numberRestrictions" :key="indexR" class="panel-restrictions"
                         :id="nR">
                        <div class="place-f-o d-flex w-75 m-auto">
                            <div class="w-auto d-flex" v-for="(n, index)  in ~~numberDecisions" :key="index">
                                <label class="text-left small">
                                    {{'X'+n}}
                                    <input type="number" class="restrictions form-control">
                                </label>
                                <span v-show="n != numberDecisions" class="mt-4">+</span>
                            </div>
                            <span class="mt-4" v-show="!isNegative">&lt;=</span>
                            <span class="mt-4" v-show="isNegative">=&gt;</span>
                            <label class="text-left small">
                                B
                                <input type="number" class="restriction-result form-control">
                            </label>
                        </div>
                    </div>


                    <div class="w-75 m-auto">
                        <div class=" mt-4 w-100">
                            <button class="btn btn-primary text-uppercase" @click="getInfo()">Solução direta</button>
                            <button class="btn btn-primary ml-2 text-uppercase" style="opacity: 0.9"
                                    @click="iterationBy()">
                                Passo a Passo
                            </button>
                        </div>
                    </div>
                </div>
                <div class="card-body" v-show="step === 3">
                    <div class="mb-4" v-if="!iterationByIteration">Resultado Final</div>
                    <div class="w-100 m-auto">
                        <h2>Iteração {{iterationsCount}}</h2>
                        <table class="table table-bordered">
                            <tr v-for="(line, indexL) in this.iterations" :key="indexL">
                                <td v-for="(cell, indexC) in line" :key="indexC">
                                    {{elementShow(cell)}}
                                </td>
                            </tr>
                        </table>
                    </div>
                    <div class="w-75 m-auto" v-if="iterationByIteration">
                        <div class=" mt-4 w-100">
                            <button class="btn btn-primary ml-2 text-uppercase" style="opacity: 0.9"
                                    @click="iteration()">
                                Próximo Passo
                            </button>
                        </div>
                    </div>
                    <div class="w-75 m-auto" v-else>
                        <div class=" mt-4 w-100" v-show="!isExecutedAnalisys">
                            <button class="btn btn-primary ml-2 text-uppercase" style="opacity: 0.9"
                                    @click="analisys()">
                                Analise de Sensibilidade
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <div class="mb-4"></div>
            <div class="card w-100 m-auto" v-show="isExecutedAnalisys">
                <div class="w-100 m-auto">
                    <h2 class="mb-2 mt-2">Analise de Sensibilidade</h2>
                    <table class="table table-bordered">
                        <tr v-for="(line, indexL) in this.sensibilityArray" :key="indexL">
                            <td v-for="(cell, indexC) in line" :key="indexC">
                                {{elementShow(cell)}}
                            </td>
                        </tr>
                    </table>
                </div>
            </div>
        </div>
        <a href="https://github.com/FMazetti/pesquisa-operational" target="_blank">link of project</a>
    </div>
</template>

<script>

	// - keypress validation fields

	export default {
		name: 'App',
		components: {},
		data() {
			return {
				isExecutedAnalisys: false,
				iterationByIteration: false,
				ended: false,
				step: 1,
				numberDecisions: 0,
				numberRestrictions: 0,
				numberIteractions: 0,
				isNegative: false,
				decisions: [],
				slack: [],
				lineHead: [],
				restrictions: [],
				restrictionsB: [],
				objective: [],
				iterations: [],
				sensibilityArray: [],
				showPanels: false,
				iterationsCount: 0,
			}
		},
		methods: {
			iterationBy() {
				this.iterationByIteration = true;
				this.getInfo();
			},
			isInt(n) {
				return n % 1 === 0;
			},
			isFloat(n) {
				return Number(n) === n && n % 1 !== 0;
			},
			elementShow(value) {
				try {
					if (isNaN(value) || this.isInt(value) || value == 'Infinity' || this.isFloat(value)) {
						if (this.isFloat(value)) {
							return value.toFixed(2);
						}
						return value
					} else {
						return value.toFixed(2);
					}
				} catch (e) {
					console.log('caiu aqui', Number(value).toFixed(2));
					return value;
				}
			},
			minimize() {
				this.step++
				this.isNegative = true;
			},
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

			getInfo() {
				let vm = this;
				let nodeList = document.getElementsByClassName('decisions');
				for (let i in nodeList) {
					if (typeof nodeList[i].value != 'undefined') {
						let value = parseFloat(nodeList[i].value);
						if (this.isNegative) {
							value = value * -1;
						}
						this.objective.push(value);
						this.decisions.push('X' + (~~i + 1));
					}
				}

				let restrs = [];
				let restrsB = [];

				document.getElementsByClassName('panel-restrictions').forEach((el) => {
					vm.slack.push('F' + el.id);
					restrs[el.id] = [];
					el.getElementsByClassName('restrictions').forEach((elR) => {
						if (typeof elR.value != 'undefined')
							restrs[el.id].push(parseFloat(elR.value));
					});

					restrsB[el.id - 1] = parseFloat(el.getElementsByClassName('restriction-result')[0].value);
				});

				this.restrictionsB = restrsB;

				for (let j in restrs) {
					if (Array.isArray(restrs[j])) {
						this.restrictions.push(restrs[j])
					}
				}


				// this.objective = [10, 6, 4];
                //
				// this.restrictions[0] = [1,1,1];
				// this.restrictions[1] = [10,4,5];
				// this.restrictions[2] = [2,2,6];
                //
				// this.slack = ['F1', 'F2', 'F3'];
				// this.decisions = ['X1', 'X2', 'X3'];
                //
				// this.restrictionsB[0] = 100;
				// this.restrictionsB[1] = 600;
				// this.restrictionsB[2] = 300;

				this.buildSimplex();
			},
			buildSimplex() {

				this.iterations = [];

				let lineHead = ['Base'];
				lineHead = lineHead.concat(this.decisions, this.slack);
				lineHead.push('b');

				this.lineHead = lineHead;

				this.iterations[0] = lineHead;

				let lineBottom = [(this.isNegative ? '-' : '') + 'Z'];

				let objectives = this.objective;
				for (let j in objectives) {
					lineBottom.push(parseFloat(objectives[j]) * -1);
				}

				lineBottom.push(0);

				for (let i in this.slack) {
					lineBottom.push(0);
					this.iterations[~~i + 1] = {};
					for (let j in lineHead) {
						if (lineHead[j] === 'Base') {
							this.iterations[~~i + 1][j] = this.slack[i];
						} else {
							if (lineHead[j] === 'b') {
								this.iterations[~~i + 1][j] = this.restrictionsB[i];
							} else {

								if (this.slack[i] === lineHead[j]) {
									this.iterations[~~i + 1][j] = 1;
								} else {
									if (this.restrictions[i][j - 1]) {
										this.iterations[~~i + 1][j] = this.restrictions[i][j - 1];
									} else {
										this.iterations[~~i + 1][j] = 0;
									}
								}

							}
						}
					}
				}

				this.iterations.push(lineBottom);
				this.step++;
				if (!this.iterationByIteration)
					this.iteration();
			},
			goIn() {

				let lastLineOfLastIteration = this.iterations[this.iterations.length - 1];

				let value = false;
				let indexGoIn = 0;
				for (let i in lastLineOfLastIteration) {
					if (value === false && !isNaN(lastLineOfLastIteration[i])){
						value = lastLineOfLastIteration[i];
						indexGoIn = i;
                    }

					if (lastLineOfLastIteration[i] < value) {
						value = lastLineOfLastIteration[i];
						indexGoIn = i;
					}
				}

				let indexGoOut = ~~this.goOut(indexGoIn - 1);

				let inEl = this.decisions[indexGoIn - 1];
				let outRow = this.iterations[indexGoOut + 1];
				let pivot = parseFloat(this.iterations[indexGoOut + 1][indexGoIn]);

				if (pivot === 1) {
					for (let i in outRow) {
						if (isNaN(outRow[i])) {
							outRow[i] = inEl;
							break;
						}
					}
				} else {
					for (let i in outRow) {
						if (isNaN(outRow[i])) {
							outRow[i] = inEl;
						} else {
							outRow[i] = parseFloat(outRow[i]) / pivot;
						}
					}
				}

				for (let omg in this.iterations) {
					if (~~omg !== indexGoOut + 1) {
						let pivotHere = this.iterations[omg][indexGoIn];
						for (let j in this.iterations[omg]) {
							if (!isNaN(this.iterations[omg][j])) {
								this.iterations[omg][j] = parseFloat(parseFloat(outRow[j]) * parseFloat(pivotHere * -1) + parseFloat(this.iterations[omg][j]));
							}
						}
					}
				}

				this.checkIfCanGoMore();

			},
			goOut(index) {

				let iterationActual = this.iterations
				let minorValue = false;
				let indexGoOut = 0;

				for (let j in this.restrictionsB) {
					let valueBIteration = this.iterations[j][Object.keys(this.iterations[j]).length - 1];

					if (iterationActual[~~j + 1][~~index + 1] !== 0 && !isNaN(valueBIteration)) {

						let actualValue = parseFloat(valueBIteration) / parseFloat(iterationActual[~~j + 1][~~index + 1]);
						if (minorValue === false && !isNaN(actualValue)){
							minorValue = actualValue;
							indexGoOut = j;
                        }

						if (actualValue < minorValue && actualValue > 0) {
							minorValue = actualValue;
							indexGoOut = j;
						}
					}
				}

				if (!minorValue) {
					alert('impossible calculation');
					location.reload();
				} else {
					return indexGoOut;
				}
			},
			checkIfCanGoMore() {

				let canGoMore = false;
				let lastLine = this.iterations[this.iterations.length - 1];
				let value = 0;

				for (let opa in lastLine) {
					if (!isNaN(lastLine[opa])) {
						if (value > lastLine[opa]) {
							canGoMore = true;
						}
					}
				}

				if (this.numberIteractions <= this.iterationsCount) {
					alert('maximum of iterations reached');
					this.iterationByIteration = false;
				} else {

					if (canGoMore) {
						if (!this.iterationByIteration)
							this.iteration();
					} else {
						this.iterationByIteration = false;
					}
				}
			},
			iteration() {
				//goIn
				this.iterationsCount++;
				this.goIn();
			},
			analisys() {
				console.log('analise de sensibilidade');

				let objMultiSensebilities = [];

				objMultiSensebilities.push(['Váriavel', 'Valor Inicial', 'Valor Final', 'Uso', 'Sobra', 'Preço Sombra', 'Custo Reduzido', 'Aumentar', 'Reduzir', 'Máximo', 'Mínimo'])


				let lineBotton = [(this.isNegative ? '-' : '') + 'Z'];
				lineBotton.push(0);
				let preventPop = JSON.parse(JSON.stringify(this.iterations));
				lineBotton.push(preventPop[Object.keys(preventPop).length - 1].pop());

				for (let i in objMultiSensebilities[0]) {
					if (i > 2) {
						lineBotton.push('-');
					}
				}

				for (let i in this.decisions) {
					let arrayRow = [];

					arrayRow.push(this.decisions[i]);
					arrayRow.push(0);

					let variable = this.decisions[i];

					let exist = false;
					for (let j in this.iterations) {
						if (this.iterations[j][0] === variable) {
							arrayRow.push(this.iterations[j][Object.keys(this.iterations[j]).length - 1]);
							exist = true;
						}
					}
					if (!exist) {
						arrayRow.push(0);
					}
					arrayRow.push('-');
					arrayRow.push('-');
					arrayRow.push('-');

					for (let j in this.iterations) {
						for (let i in this.iterations[j]) {
							if (variable === this.iterations[j][i]) {
								let value = this.iterations[Object.keys(this.iterations).length - 1][i];
								if (value !== 'Z')
									arrayRow.push(value);
							}
						}
					}

					arrayRow.push('-');
					arrayRow.push('-');
					arrayRow.push('-');
					arrayRow.push('-');

					objMultiSensebilities.push(arrayRow);
				}

				let arrayB = [];
				for (let i in this.iterations) {
					arrayB[i] = this.iterations[i][Object.keys(this.iterations[i]).length - 1];
				}
				arrayB = arrayB.splice(1, arrayB.length - 2);

				let arraySlack = [];

				for (let i in this.slack) {
					let arrayRow = [];

					arrayRow.push(this.slack[i]);
					arrayRow.push(this.restrictionsB[i]);

					let variable = this.slack[i];
					let exist = false;
					for (let j in this.iterations) {
						if (this.iterations[j][0] === variable) {
							arrayRow.push(this.iterations[j][Object.keys(this.iterations[j]).length - 1]);
							exist = true;
						}
					}
					if (!exist) {
						arrayRow.push(0);
					}

					arrayRow.push(this.restrictionsB[i] - arrayRow[2]);
					arrayRow.push(this.restrictionsB[i] - arrayRow[3]);

					for (let j in this.iterations) {
						for (let i in this.iterations[j]) {
							if (variable === this.iterations[j][i]) {
								let value = this.iterations[Object.keys(this.iterations).length - 1][i];
								if (value !== 'Z')
									arrayRow.push(value);
								break;
							}
						}
					}

					arrayRow.push('-');

					arraySlack[i] = [];

					let positionVar = false;

					for (let i in this.iterations[0]) {
						if (variable === this.iterations[0][i]) {
							positionVar = i;
							break;
						}
					}
					if (positionVar)
						for (let j in this.iterations) {
							arraySlack[i].push(this.iterations[j][positionVar])
						}

					arraySlack[i] = arraySlack[i].splice(1, arraySlack[i].length - 2);

					let properiesVariation = [];
					for (let s in arraySlack[i]) {
						properiesVariation.push(arrayB[s] / arraySlack[i][s] * -1);
					}

					let minimum = this.getMin(properiesVariation);
					let maximum = this.getMax(properiesVariation);


					arrayRow.push(maximum);
					arrayRow.push(minimum * -1);

					if (maximum === Infinity || maximum === 'Infinity')
						arrayRow.push('Infinity');
					else
						arrayRow.push(parseFloat(this.restrictionsB[i]) + parseFloat(maximum));

					if (minimum === Infinity || minimum === 'Infinity')
						arrayRow.push('Infinity');
					else
						arrayRow.push(parseFloat(this.restrictionsB[i]) - parseFloat(minimum) * -1);

					objMultiSensebilities.push(arrayRow);
				}

				objMultiSensebilities.push(lineBotton);

				this.sensibilityArray = objMultiSensebilities;
				this.isExecutedAnalisys = true;

			},
			getMin(array) {
				let control = 99999999;

				for (let i in array) {
					if (!isNaN(array[i]) && array[i] !== -Infinity)
						if (array[i] < control) {
							control = array[i];
						}
				}
				if (control === 0 || control === 99999999) {
					control = 'Infinity';
				}

				return control;
			},
			getMax(array) {
				let control = 0;

				for (let i in array) {
					if (!isNaN(array[i]) && array[i] !== -Infinity)
						if (array[i] > control) {
							control = array[i];
						}
				}

				if (control === 0) {
					control = 'Infinity';
				}

				return control;


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
