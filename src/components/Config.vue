



<template>
  

    <div class="ontop">

        <h1> MiBand5 Coach </h1>

        <div>
            AuthKey <input type="text" v-model="config.auth_key" >
        </div>
        <div>
            Minutes <input type="number" v-model.number="config.minutes" >
        </div>
        <div>
            AVG Rate <input type="number" v-model.number="config.target_rate" >
        </div>
        <div>
            <button @click="start">Start</button>
        </div>

    </div>

</template>


<script lang="ts">


import { Component, Vue } from 'vue-property-decorator';
import { ConfigT } from '@/ts/types';


@Component
export default class ConfigVue extends Vue {

    config: ConfigT = {
        minutes: 60,
        target_rate: 130,
        auth_key: '405d64f03666539980628dc4f4fa22b9',
    }

    start(): void{

        const config = {...this.config};
        this.$emit('start', config);
    }

}

</script>




<style scoped lang="scss">







</style>
