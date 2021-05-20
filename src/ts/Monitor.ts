import mix from 'mix-color';




// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import Band5 from '@/jaapp_miband/miband';
import sleep from '@/utils/sleep';

export default class Monitor {


    bpm = 0;
    active = false;


    update(bpm: number): void{
        console.log(bpm);
        this.active = true;
        this.bpm = bpm;
    }



    /*
    async test_random(): Promise<void>{


        // eslint-disable-next-line no-constant-condition
        while(true){

            await sleep(random(100,500));

            this.update(random(80,100));

        }


    }
    */


    band5!: Band5; 

    async start(token: string){


        this.band5 = new Band5(token);
        this.band5.onHeartRate((n:number) => this.update(n));
        await this.band5.init();

        // this.band5.sendNotification('Hola');

        this.notifyGoFaster();

    }


    async notifyGoFaster(){


        for(;;){

            await sleep(10000);
            if(this.bpm < 105){
                this.band5.sendNotification('Más rápido');
            }

        }

    }






}