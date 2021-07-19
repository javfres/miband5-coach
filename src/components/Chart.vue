
<template>
    <div class="fullscreen">

        <div class="chart">

            <div ref="chart"></div>

        </div>

    </div>
</template>

<script lang="ts">

import { Component, Prop, Vue } from 'vue-property-decorator';
import * as d3 from "d3";

import Levels from '@/ts/Levels';
import Monitor, {Point} from '@/ts/Monitor';
import { ConfigT } from '@/ts/types';


@Component
export default class TimerVue extends Vue {

    @Prop()
    levels!: Levels;

    @Prop()
    monitor!: Monitor;
    
    @Prop()
    config!: ConfigT;

    // D3 elements
    svg!: d3.Selection<SVGSVGElement, unknown, null, undefined>;
    line!: d3.Line<Point>;
    area!: d3.Area<Point>;
    x!: d3.ScaleLinear<number, number>;
    y!: d3.ScaleLinear<number, number>;

    xfn(p: Point): number { 
        return this.x(p.time);
    } 

    yfn(p: Point): number {
        return this.y(p.bpm);
    }

    mounted(): void{

        this.buildSVG();

        // Update the plot 
        setInterval(() => {
            this.update();
        }, 4000);

    }

    buildSVG(): void {

        const width = 512;
        const height = 125;

        const elem = this.$refs['chart'] as Element;

        // The main SVG Element
        this.svg = d3
            .select(elem)
            .append("svg")
            .attr("viewBox", `0 0 ${width} ${height}`)
            .attr("width", '80%')

        const seconds = this.config.minutes * 60;

        // Scales for X and Y
        this.x = d3.scaleLinear()
            .domain([0, seconds])
            .range([0, width]);

        this.y = d3.scaleLinear()
            .range([height, 0])
            .domain([40, 200]);

        // The gradient for the area
        this.svg.append("linearGradient")
            .attr("id", "my-gradient")
            .attr("gradientUnits", "userSpaceOnUse")
            .attr("x1", 0).attr("y1", height)
            .attr("x2", 0).attr("y2", this.y(this.levels.target))
            .selectAll("stop")
            .data([
                {offset: "0%", color: "white", opacity:0},
                {offset: "100%", color: "white", opacity:1}
            ])
            .enter()
            .append("stop")
            .attr("offset", d => d.offset)
            .attr("stop-color", d => d.color)
            .attr("stop-opacity", d => d.opacity);

        // define the area
        this.area = d3.area<Point>()
            .curve(d3.curveBasis)
            .y0(height)
            .x(this.xfn)
            .y1(this.yfn)

        // add the area
        this.svg.append("path")
            .datum(this.monitor.history)
            .attr("class", "area")
            .attr("d", this.area);

        // Add two lines for the targets
        this.svg.append('line')
            .attr("class", "linetarget2")
            .attr("x1", 0)
            .attr("y1", this.y(this.levels.target-10))
            .attr("x2", width)
            .attr("y2", this.y(this.levels.target-10)); 

        this.svg.append('line')
            .attr("class", "linetarget2")
            .attr("x1", 0)
            .attr("y1", this.y(this.levels.target+10))
            .attr("x2", width)
            .attr("y2", this.y(this.levels.target+10)); 

        
        // Add the avg line
        this.svg.append('line')
            .attr("class", "lineavg")
            .attr("x1", 0)
            .attr("y1", this.y(this.monitor.avg_bpm))
            .attr("x2", width)
            .attr("y2", this.y(this.monitor.avg_bpm)); 

        // define the line
        this.line = d3.line<Point>()
            .curve(d3.curveBasis)
            .x(this.xfn)
            .y(this.yfn)

        this.svg.append("path")
            .attr("class", "line")
            .datum(this.monitor.history)
            .attr("d",  this.line);

    }


    update(): void{

        this.svg.select(".area")
            .datum(this.monitor.history)
            .attr("d", this.area);

        this.svg.select(".line")
            .datum(this.monitor.history)
            .attr("d", this.line);

        this.svg.select('.lineavg')
            .attr("x1", this.x(this.monitor.elast))
            .attr("y1", this.y(this.monitor.avg_bpm))
            .attr("y2", this.y(this.monitor.avg_bpm)); 

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
                fill: url(#my-gradient);
            }

        }
    }

</style>
