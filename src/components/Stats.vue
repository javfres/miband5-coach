



<template>
    <div class="fullscreen">


        <div class="stats">

            <div class="stat">
                <h1>AVG BPM</h1>
                <div> {{ avg }} </div>
            </div>

            <div class="stat">
                <h1>Total beats</h1>
                <div> {{ beats }} </div>
            </div>

        </div>

        

    </div>
</template>




<script lang="ts">


import Levels from '@/ts/Levels';
import Monitor from '@/ts/Monitor';

import { Component, Prop, Vue } from 'vue-property-decorator';


@Component({
    components: {
    }
})
export default class StatsVue extends Vue {

    @Prop()
    levels!: Levels;

    @Prop()
    monitor!: Monitor;


    get avg(): number{
        return this.monitor.avg_bpm;
    }


    get beats(): number{
        return Math.floor(this.monitor.totalBeats);
    }



}

</script>




<style scoped lang="scss">


    .fullscreen {

        align-items: flex-end;

        .stats {

            background: rgba(255, 255, 255, 0.582);
            box-shadow: 0 0 20px rgba(255, 255, 255, 0.445);
            margin-right: 20px;
            padding: 10px;


            .stat {

                &:not(:last-child){
                    margin-bottom: 15px;
                }

                h1 {
                    font-size: 14pt;
                }

                div {
                    font-size: 20pt;
                    text-align: center;
                    width: 100%;
                }

            }


        }




    }




</style>
