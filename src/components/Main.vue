



<template>
    <div class="fullscreen">

        <BackgroundVue
            :levels="levels"
            :monitor="monitor"
        />

        <ConfigVue
            v-if="!started"
            @start="start"
        />

        <template v-if="started">

            <CenterVue
                :levels="levels"
                :monitor="monitor"
            />

            <HeartLevelVue
                :levels="levels"
                :current="monitor.bpm"
            />

            <TimerVue
                :levels="levels"
                :monitor="monitor"
            />

            <ChartVue
                :levels="levels"
                :monitor="monitor"
                :config="config"
            />

            <StatsVue
                :levels="levels"
                :monitor="monitor"
            />

        </template>


    
    </div>
</template>




<script lang="ts">


import Levels from '@/ts/Levels';
import Monitor from '@/ts/Monitor';
import { Component, Vue } from 'vue-property-decorator';


import { ConfigT } from '@/ts/types';


import HeartLevelVue from './HeartLevel.vue'
import ConfigVue from './Config.vue'
import CenterVue from './Center.vue'
import TimerVue from './Timer.vue'
import BackgroundVue from './Background.vue'
import ChartVue from './Chart.vue'
import StatsVue from './Stats.vue'

@Component({
    components: {
        HeartLevelVue,
        ConfigVue,
        CenterVue,
        TimerVue,
        BackgroundVue,
        ChartVue,
        StatsVue,
    }
})
export default class MainVue extends Vue {


    started = false;


    monitor: Monitor = new Monitor();
    levels: Levels|null = null; 


    config!: ConfigT;


    start(config: ConfigT): void {

        console.log("Start", config);

        this.config = config;
        this.monitor.start(config.auth_key);
        this.levels = new Levels(50, 200, config.target_rate);

        this.started = true;

    }


}

</script>




<style scoped lang="scss">



</style>
