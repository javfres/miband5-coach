



<template>
    <div class="fullscreen">

        <div class="chart">

            <div ref="chart"></div>

        </div>

    </div>
</template>




<script lang="ts">


import Levels from '@/ts/Levels';
import Monitor, {Point} from '@/ts/Monitor';

import { Component, Prop, Vue } from 'vue-property-decorator';

import * as d3 from "d3";
import { ConfigT } from '@/ts/types';


let x: any;
let y: any;
const xfn = (p: Point) => x(p.time);
const yfn = (p: Point) => y(p.bpm);


@Component
export default class TimerVue extends Vue {

    @Prop()
    levels!: Levels;

    @Prop()
    monitor!: Monitor;
    
    @Prop()
    config!: ConfigT;


    svg!: any;
    line!: any;
    area!: any;

    mounted(){

        const width = 512;
        const height = 125;

        const elem = this.$refs['chart'] as Element;

        this.svg = d3
            .select(elem)
            .append("svg")
            .attr("viewBox", `0 0 ${width} ${height}`)
            .attr("width", '80%')
            //.attr("height", height);

        const seconds = this.config.minutes * 60;


        x = d3.scaleLinear()
            .domain([0, seconds])
            .range([0, width]);


        //svg.append("g")
        //    .attr("transform", "translate(0," + height + ")")
        //    .call(d3.axisBottom(x));

        y = d3.scaleLinear()
            .range([height, 0])
            .domain([40, 200]);


        this.svg.append("linearGradient")
            .attr("id", "my-gradient")
            .attr("gradientUnits", "userSpaceOnUse")
            .attr("x1", 0).attr("y1", y(0))
            .attr("x2", 0).attr("y2", y(this.config.target_rate))
            .selectAll("stop")
            .data([
                {offset: "0%", color: "white", opacity:0},
                {offset: "100%", color: "white", opacity:1}
            ])
            .enter()
            .append("stop")
            .attr("offset", (d:any) => d.offset)
            .attr("stop-color", (d:any) => d.color)
            .attr("stop-opacity", (d:any) => d.opacity);



        // define the area
        this.area = d3.area()
            .curve(d3.curveBasis)
            .y0(height)
            .x(xfn)
            .y1(yfn)

        // add the area
        this.svg.append("path")
            .datum(this.monitor.history)
            .attr("class", "area")
            .attr("d", this.area);



        this.svg.append('line')
            .attr("class", "linetarget2")
            .attr("x1", 0)
            .attr("y1", y(this.config.target_rate-10))
            .attr("x2", width)
            .attr("y2", y(this.config.target_rate-10)); 

        this.svg.append('line')
            .attr("class", "linetarget2")
            .attr("x1", 0)
            .attr("y1", y(this.config.target_rate+10))
            .attr("x2", width)
            .attr("y2", y(this.config.target_rate+10)); 

        
        this.svg.append('line')
            .attr("class", "lineavg")
            .attr("x1", 0)
            .attr("y1", y(this.monitor.avg_bpm))
            .attr("x2", width)
            .attr("y2", y(this.monitor.avg_bpm)); 



        // define the line
        this.line = d3.line()
            .curve(d3.curveBasis)
            .x(xfn)
            .y(yfn)

        this.svg.append("path")
            .attr("class", "line")
            .datum(this.monitor.history)
            .attr("d",  this.line);



        /*
        this.svg.append('line')
            .attr("class", "linetarget")
            .attr("x1", 0)
            .attr("y1", y(this.config.target_rate))
            .attr("x2", width)
            .attr("y2", y(this.config.target_rate)); 
        */





        setInterval(() => {
            this.update();
        },4000);

    }


    update(){

        this.svg.select(".area")
            .datum(this.monitor.history)
            .attr("d", this.area);


        this.svg.select(".line")
            .datum(this.monitor.history)
            .attr("d", this.line);


        this.svg.select('.lineavg')
            .attr("x1", x(this.monitor.elast))
            .attr("y1", y(this.monitor.avg_bpm))
            .attr("y2", y(this.monitor.avg_bpm)); 


    }



}

</script>




<style scoped lang="scss">


    .fullscreen {
        justify-content: flex-end;
    }


    .chart {

        margin-bottom: 20px;
        position: relative;
        width: 100%;

        &::v-deep svg {

            display: block;
            margin: auto;

            .line {
                fill: none;
                stroke: rgba(255, 255, 255, 0.5);
                stroke-width: 2px;
            }

            .lineavg {
                fill: none;
                stroke: rgba(255, 255, 255, 0.5);
                stroke-width: 2px;
            }

            .linetarget {
                fill: none;
                stroke: rgba(255, 255, 255, 0.5);
                stroke-width: 2px;
                stroke-dasharray: 4, 10;
            }

            .linetarget2 {
                fill: none;
                stroke: rgba(255, 255, 255, 0.5);
                stroke-width: 1px;
                stroke-dasharray: 4, 10;
            }


            .area {
                //fill: rgba(255, 255, 255, 0.233);
                fill: url(#my-gradient);
            }


        }




    }





</style>
