



import Band5 from '@/ts/miband5/MiBand5';

import sleep from '@/utils/sleep';

export default class Monitor {


    bpm = 0;
    active = false;


    update(bpm: number): void{
        console.log(bpm);
        this.active = true;
        this.bpm = bpm;
    }


    band5!: Band5; 

    async start(token: string): Promise<void> {


        this.band5 = new Band5(token);
        this.band5.onHeartRate((n:number) => this.update(n));
        await this.band5.init();

        await this.band5.getBatteryInfo();

        this.band5.sendNotification('Hola? Jó');

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