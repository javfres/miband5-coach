



<template>
    <div
        class="fullscreen background"
        :style="`background-color:${color}`"
    >
    </div>
</template>



<script lang="ts">


import Levels from '@/ts/Levels';
import Monitor from '@/ts/Monitor';

import { Component, Prop, Vue } from 'vue-property-decorator';


@Component
export default class BackgroundVue extends Vue {

    @Prop()
    levels!: Levels;

    @Prop()
    monitor!: Monitor;

   
    get color(): string {

        if(!this.levels) return 'white';
        const level = this.levels.in(this.monitor.bpm);

        return level.color;

    }


}

</script>



<style scoped lang="scss">

    .background {
        z-index: -100;
    }


</style>
