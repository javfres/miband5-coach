



<template>
    <div class="fullscreen">

       
       <div class="wrapper">

            <div class="widget">

                <div class="levels">
                    <div
                        class="level"
                        v-for="l in levels.levels"
                        :key="l.key"
                        :title="l.key"
                        :style="`background-color:${l.color};height:${l.perc}%`"
                    ></div>
                </div>

                <div
                    class="marker"
                    :style="`top:${marker_top}%`"
                >
                    <div>
                        <img src="@/assets/arrow.svg">
                        {{ current }}
                    </div>
                </div>

            </div>


       </div>
        


    </div>
</template>




<script lang="ts">


import { Component, Prop, Vue } from 'vue-property-decorator';
import Levels from '@/ts/Levels';


@Component
export default class HeartLevelVue extends Vue {

    @Prop()
    levels!: Levels;

    @Prop({default: 110})
    current!: number;




    get marker_top(): number {

        if(this.current < this.levels.min) return 100;
        if(this.current > this.levels.max) return 0;


        const range = this.levels.max-this.levels.min;
        return ((this.levels.max-this.current)*100) / range;

    }





}

</script>




<style scoped lang="scss">

    $level_width: 20px;

    .fullscreen {

        align-items: start;

        .wrapper {
            margin-left: 50px;
            background-color: rgba(255, 255, 255, 0.342);
            border-radius: $level_width/2;
        }

        .widget{

            margin: 2px;
            height: 60vh;
            width: $level_width;
            position: relative;

            .levels {

                height: 100%;

                .level:first-child {
                    border-radius: $level_width/2 $level_width/2 0 0;
                }

                .level:last-child {
                    border-radius:  0 0 $level_width/2 $level_width/2;
                }

                filter: drop-shadow( 0 0 10px rgba(255, 255, 255, 0.192));


            }

            .marker {
                position: absolute;
                left: 40px;
                height: 1px;

                div {
                    position: absolute;
                    transform: translateY(-50%);
                    display: flex;
                    flex-direction: row;
                    align-content: space-between;

                    font-size: 20px;
                    text-shadow: 0 0 4px rgba(255, 255, 255, 0.445);

                    img {
                        width: 30px;
                        margin-right: 10px;
                        filter: drop-shadow( 0 0 4px rgba(255, 255, 255, 0.192));
                    }
                }


            }

        }


    }



</style>
