



<template>
    <div
        class="fullscreen"
        :style="`background-color:${color}`"
    >

        <HeartLevelVue v-if="levels" :levels="levels" :current="monitor.bpm" />

        <div>

            <h1> MiBand5 Coach </h1>

            <div>
                Minutes <input type="number" v-model="minutes" >
            </div>
            <div>
                AVG Rate <input type="number" v-model="avg_rate" >
            </div>
            <div>
                <button @click="start">Start</button>
            </div>

        </div>


        <div class="heart" :class="{active: monitor.active}">
           <div class="bpm">BPM</div> {{ monitor.bpm }}
        </div>


    </div>
</template>




<script lang="ts">


import Levels from '@/ts/Levels';
import Monitor from '@/ts/Monitor';
import { Component, Prop, Vue } from 'vue-property-decorator';

import HeartLevelVue from './HeartLevel.vue'


@Component({
    components: {
        HeartLevelVue
    }
})
export default class MainVue extends Vue {


    minutes = 60;
    avg_rate = 130;

    monitor: Monitor = new Monitor();

    levels: Levels|null = null; 


    start(): void {

        console.log("Start");
        //this.monitor.test_random();
        this.monitor.start('405d64f03666539980628dc4f4fa22b9');

        this.levels = new Levels(50, 200, this.avg_rate);


    }


    get color(): string {

        if(!this.levels) return 'white';
        const level = this.levels.in(this.monitor.bpm);

        return level.color;

    }


}

</script>




<style scoped lang="scss">



@keyframes heartbeat {
  0%  { transform: scale( .75 ); }
  20% { transform: scale( 1   ); }
  40% { transform: scale( .75 ); }
  60% { transform: scale( 1   ); }
  80% { transform: scale( .75 ); }
  100%{ transform: scale( .75 ); }
}


.heart {

    font-size: min(20vw, 20vh);
    position: relative;

    .bpm {
        font-size: min(2vw, 2vh);
        position: absolute;
        bottom: 0;
        width: 100%;
        text-align: center;
    }

    &.active {
        //background-color: red;
        width: 50px;
        height: 50px;
        animation: heartbeat 1s infinite;
    }


}






</style>
