



<template>
    <div class="fullscreen">

        <div class="chart">

            Chart

            <div ref="chart"></div>


        </div>

    </div>
</template>




<script lang="ts">


import Levels from '@/ts/Levels';
import Monitor, {Point} from '@/ts/Monitor';

import { Component, Prop, Vue } from 'vue-property-decorator';

import * as d3 from "d3";


const xfn = (p: Point) => p.time/1000;
const yfn = (p: Point) => p.bpm;


@Component
export default class TimerVue extends Vue {

    @Prop()
    levels!: Levels;

    @Prop()
    monitor!: Monitor;

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
            .attr("width", width)
            .attr("height", height);


        const x = d3.scaleLinear()
            .domain([0, 60*60])
            .range([0, width]);


        //svg.append("g")
        //    .attr("transform", "translate(0," + height + ")")
        //    .call(d3.axisBottom(x));

        const y = d3.scaleLinear()
            .range([height, 0])
            .domain([40, 200]);


        this.svg.append("linearGradient")
        .attr("id", "my-gradient")
        .attr("gradientUnits", "userSpaceOnUse")
        .attr("x1", 0).attr("y1", y(50))
        .attr("x2", 0).attr("y2", y(200))
        .selectAll("stop")
        .data([
            {offset: "0%", color: "white", opacity:0},
            {offset: "100%", color: "white", opacity:1}
        ])
        .enter().append("stop")
        .attr("offset", function(d:any) { return d.offset; })
        .attr("stop-color", function(d:any) { return d.color; })
        .attr("stop-opacity", function(d:any) { return d.opacity; });



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

        // define the line
        this.line = d3.line()
            .curve(d3.curveBasis)
            .x(xfn)
            .y(yfn)

        this.svg.append("path")
            .attr("class", "line")
            .datum(this.monitor.history)
            .attr("d",  this.line);



        setInterval(() => {
            this.update();
        },4000);

    }


    update(){

        console.log("Linee")


        // add the area
        this.svg.select(".area")
            .datum(this.monitor.history)
            .attr("d", this.area);


        this.svg.select(".line")
            .datum(this.monitor.history)
            .attr("d", this.line);


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


        &::v-deep .line {
            fill: none;
            stroke: rgba(255, 255, 255, 0.5);
            stroke-width: 2px;
        }

        &::v-deep .area {
            //fill: rgba(255, 255, 255, 0.233);
            fill: url(#my-gradient);
        }


    }





</style>
