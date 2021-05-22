


import Band5 from '@/ts/miband5/MiBand5';
import {randomFloat} from '@/utils/random';
import { diffS, getS } from '@/utils/time';



export type Point = {
    time: number;
    bpm: number;
}




export default class Monitor {


    bpm = 0;
    avg_bpm = 0;
    active = false;

    timeStart = 0;

    history: Point[] = [];

    // Last elapsed
    elast = 0;

    totalBeats = 0;


    elapsed(): number {
        return diffS(this.timeStart);
    }


    update(bpm: number): void {

        // bpm = Math.floor(bpm * randomFloat(1.95, 2.05));

        if(!this.timeStart){
            this.timeStart = getS();
            this.history = [];
        }

        this.active = true;
        this.bpm = bpm;

        const elapsed = this.elapsed();
        this.history.push({
            time: elapsed,
            bpm,
        });

        if(elapsed > 0){

            const range = elapsed - this.elast;
            const beats = (bpm/60) * range;

            this.totalBeats += beats;

            this.avg_bpm = Math.floor((this.totalBeats/elapsed) * 60);

        }


        this.elast = elapsed;

    }


    band5!: Band5; 

    async start(token: string): Promise<void> {


        this.timeStart = 0;
        this.totalBeats = 0;
        this.elast = 0;

        this.band5 = new Band5(token);
        this.band5.onHeartRate((n:number) => this.update(n));
        await this.band5.init();

        await this.band5.getBatteryInfo();

        //this.band5.sendNotification('Hola? Jó');

        // this.notifyGoFaster();

    }


    /*
    async notifyGoFaster(): Promise<void> {


        for(;;){

            await sleep(10000);
            if(this.bpm < 105){
                this.band5.sendNotification('Más rápido');
            }

        }

    }

    */





}