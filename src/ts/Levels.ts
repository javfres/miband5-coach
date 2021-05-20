

import * as colors from '@/ts/colors';


export class Level {
    color: string;
    a: number;
    b: number;
    perc: number;

    constructor(color: string, a: number, b: number, range: number){
        this.color = color;
        this.a = a;
        this.b = b;

        this.perc = ((b-a)*100) / (range);
    }

    get key(): string { 
        return this.a + '-' + this.b;
    }

}



export default class Levels {

    min: number;
    max: number;
    target: number;
    size: number;
    levels: Level[] = [];


    constructor(min: number, max: number, target: number, size = 10){


        this.min = min;
        this.max = max;
        this.target = target;
        this.size = size;

        const range = max-min;
        const half = size/2;


        this.levels.push(new Level(
            colors.RED,
            target+5*half,
            max,
            range
        ));

        this.levels.push(new Level(
            colors.YELLOW,
            target+3*half,
            target+5*half,
            range,
        ));


        // Go Up
        this.levels.push(new Level(
            colors.GREEN3,
            target+1*half,
            target+3*half,
            range,
        ));


        // The main
        this.levels.push(new Level(
            colors.GREEN2,
            target-half,
            target+half,
            range,
        ));

        // Go down
        this.levels.push(new Level(
            colors.GREEN1,
            target-3*half,
            target-1*half,
            range,
        ));

        /*
        this.levels.push(new Level(
            colors.BLUE3,
            target-5*half,
            target-3*half,
            range,
        ));
        */

        this.levels.push(new Level(
            colors.BLUE2,
            target-5*half,
            target-3*half,
            range,
        ));


        this.levels.push(new Level(
            colors.BLUE1,
            min,
            target-5*half,
            range,
        ));

    }



    in(value: number): Level {
        
        if(value > this.max) return this.levels[0];
        if(value < this.min) return this.levels[this.levels.length-1];

        for(const l of this.levels){
            if(l.a <= value && l.b >= value) return l;
        }

        throw `Not found level for '${value}'`;

    }




}