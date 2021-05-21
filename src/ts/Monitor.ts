



import Band5 from '@/ts/miband5/MiBand5';

import sleep from '@/utils/sleep';


export type Point = {
    time: number;
    bpm: number;
}


function getMS(){
    return (new Date).getTime();
}

function diffMS(start: number){
    return getMS() - start;
}


export default class Monitor {


    bpm = 0;
    active = false;
    tstart = 0;

    history: Point[] = [];


    elapsed(){
        return diffMS(this.tstart);
    }


    update(bpm: number): void {

        if(!this.tstart){
            this.tstart = getMS();
            this.history = [];
        }

        this.active = true;
        this.bpm = bpm;

        const elapsed = this.elapsed();
        this.history.push({
            time: elapsed,
            bpm,
        });

    }


    band5!: Band5; 

    async start(token: string): Promise<void> {


        this.tstart = 0;
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