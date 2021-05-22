



<template>
    <div class="fullscreen">

        <div class="timer">

            {{ time.hours | pad00 }}:{{ time.minutes | pad00 }}:{{ time.seconds | pad00 }}

        </div>

    </div>
</template>




<script lang="ts">


import Levels from '@/ts/Levels';
import Monitor from '@/ts/Monitor';

import { Component, Prop, Vue } from 'vue-property-decorator';

import { diffS } from '@/utils/time';


@Component({
    components: {
    },
    filters: {
        pad00: (x:number) => ('00'+x).slice(-2) 
    }
})
export default class TimerVue extends Vue {

    @Prop()
    levels!: Levels;

    @Prop()
    monitor!: Monitor;

    time = {
        hours: 0,
        minutes: 0,
        seconds: 0,
    };

    tstart = (new Date).getTime();

    mounted(): void {

        setInterval(() => {
            this.update();
        }, 1000);

    }


    update(): void {

        let elapsed = 0;

        if(this.monitor.timeStart){
            elapsed = diffS(this.monitor.timeStart);
        }

        this.time.hours = Math.floor(elapsed / 3600);
        this.time.minutes = Math.floor(elapsed % 3600 / 60);
        this.time.seconds = Math.floor(elapsed % 3600 % 60);

    }


}

</script>




<style scoped lang="scss">


    .fullscreen {
        justify-content: start;
    }


    .timer {

        margin-top: 20px;
        font-size: min(10vw, 10vh);
        position: relative;


        text-shadow: 0 0 4px rgba(255, 255, 255, 0.445);


    }






</style>
