<template>
    <div>
        <div class="modal fade" :id="'modal'+idModal" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel"
             aria-hidden="true">
            <div class="modal-dialog" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Nova variável</h5>
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div class="modal-body">
                        <input v-model="newVariable" class="form-control">
                        <small v-html="helper"></small>

                        <label class="w-100 form-check-inline" v-show="canCheck">
                            <input v-model="minimize" class="custom-checkbox" type="checkbox">
                            É função com objetivo de minimizar?
                        </label>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
                        <button type="button" class="btn btn-primary" @click="addValue">Salvar Valor</button>
                    </div>
                </div>
            </div>
        </div>

        <div class="card-body">

            <h4 class="text-left p-2">{{title}}
                <button class="btn btn-primary float-right" @click="addValueModal"
                        v-show="showButton"
                        v-if="(!canMoreThanOne && this.variableValues.length===0) || canMoreThanOne">Adicionar nova
                    variável
                </button>
            </h4>

            <table class="table table-bordered" v-show="this.variableValues.length > 0">
                <thead>
                <tr>
                    <th>Variável</th>
                    <th>Ações</th>
                </tr>
                </thead>
                <tr v-for="(variable, index) in this.variableValues" :key="index">
                    <td>
                        {{variable}}
                    </td>
                    <td>
                        <button class=" btn btn-danger float-right" @click="removeRestric(index)">
                            <font-awesome-icon
                                    :icon="['far', 'trash-alt']"
                                    class="font-awesome-icon"/>
                        </button>
                    </td>
                </tr>
            </table>
        </div>
    </div>
</template>

<script>
	export default {
		name: 'Variable',
		props: ['title', 'helper', 'idModal', 'canMoreThanOne', 'canCheck', 'showButton', 'checkString'],
		data() {
			return {
				newVariable: '',
				minimize: false,
				variableValues: [],
			}
		},
		methods: {

			addValueModal() {
				this.newVariable = '';
				$('#modal' + this.idModal).modal('show')
			},

			addValue() {
				$('#modal' + this.idModal).modal('hide')
				let valueToVariable = this.newVariable.replace(/\s/g, '')
					.replace(/\./gi, '')
					.replace(/,/gi, '.')
					.toUpperCase();

				if (!valueToVariable.includes('<=') && !valueToVariable.includes('>=') && this.checkString) {
					alert('variável errada');
				} else {
					this.variableValues.push(valueToVariable);
				}


			},
			removeRestric(index) {
				this.variableValues.splice(index, 1);
			},
		}
	}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">

</style>
