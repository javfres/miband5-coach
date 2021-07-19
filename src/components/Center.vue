



<template>
    <div class="fullscreen">

        <div v-if="!monitor.bpm">
            <LoaderVue v-if="!monitor.bpm" />
            <p class="connecting"> Connecting... </p>
        </div>

        <div v-else class="heart" :class="{active: monitor.active}">
           {{ monitor.bpm }}
        </div>

    </div>
</template>




<script lang="ts">


import Levels from '@/ts/Levels';
import Monitor from '@/ts/Monitor';

import { Component, Prop, Vue } from 'vue-property-decorator';
import LoaderVue from './Loader.vue';



@Component({
    components: {
        LoaderVue
    }
})
export default class CenterVue extends Vue {

    @Prop()
    levels!: Levels;

    @Prop()
    monitor!: Monitor;

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

    font-size: min(40vw, 40vh);
    position: relative;

    &.active {
        animation: heartbeat 1s infinite;
    }


    text-shadow: 0 0 4px rgba(255, 255, 255, 0.445);


}

.connecting {
    color: rgba(255, 255, 255, 0.445);
}


</style>
