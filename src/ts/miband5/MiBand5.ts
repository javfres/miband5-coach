
// https://github.com/vshymanskyy/miband-js/blob/master/src/miband.js


import {
    ADVERTISEMENT_SERVICE,
    CHAR_UUIDS,
    UUIDS,
    NOTIFICATION_TYPES,
} from "./constants";


import aesjs from 'aes-js';


function buf2hex(buffer: ArrayBuffer): string {

    let output = '';

    (new Uint8Array(buffer))
        .forEach(x => output += ("00" + x.toString(16)).slice(-2) );

    return output;

}


  function str2buf(str: string) {
    const buf = new ArrayBuffer(str.length);
    const bufView = new Uint8Array(buf);
    for (let i=0, strLen=str.length; i < strLen; i++) {
      bufView[i] = str.charCodeAt(i);
    }
    return buf;
  }
  


const x = str2buf(NOTIFICATION_TYPES.msg + 'ñ' + '\xa1');

console.log(x);
console.log(buf2hex(x));



const concatBuffers = (buffer1: ArrayBuffer, buffer2: ArrayBuffer) => {
  const out = new Uint8Array(buffer1.byteLength + buffer2.byteLength);
  out.set(new Uint8Array(buffer1), 0);
  out.set(new Uint8Array(buffer2), buffer1.byteLength);
  return out.buffer;
};



type servicesT = {[id: string]: BluetoothRemoteGATTService};
type charsT = {[id: string]:BluetoothRemoteGATTCharacteristic};
type onHeartRateCallbackT = (n: number) => void;



type batteryT = {
    charging: boolean;
    level: number;
}



export default class MiBand5 {


    authKey: string;

    device: BluetoothDevice|null = null;

    // Bluetooth services
    services!: servicesT;

    // Bluetooth characteristics
    chars!: charsT;

    constructor(authKey: string){

        if (!authKey.match(/^[a-zA-Z0-9]{32}$/)) {
            throw new Error("Invalid auth key, must be 32 hex characters");
        }

        this.authKey = authKey;

    }


    async init(): Promise<void>{


        //
        // Call the bluetooth api
        //
        this.device = await navigator.bluetooth.requestDevice({
            filters: [
              {
                services: [ADVERTISEMENT_SERVICE],
              },
            ],
            optionalServices: [
                UUIDS.miband2,
                UUIDS.heartrate,
                UUIDS.miband1,
                UUIDS.notifications
            ],
        });

        if(!this.device){
            throw "Unable to get device";
        }
      
        // Bluetooth Low Energy
        if(!this.device.gatt){
            throw "Device does not support GATT";
        }
        this.device.gatt.disconnect();
        const gatt = await this.device.gatt.connect();


        // Init services
        await this.initServices(gatt);

        // Init characteristics
        await this.initCharacteristics();

        // Authenticate
        await this.authenticate();

    }


    private async initServices(gatt: BluetoothRemoteGATTServer){

        const miband1 = await gatt.getPrimaryService(UUIDS.miband1);
        const miband2 = await gatt.getPrimaryService(UUIDS.miband2);
        const heartrate = await gatt.getPrimaryService(UUIDS.heartrate);
        const notifications = await gatt.getPrimaryService(UUIDS.notifications);
    
        this.services = {
            miband1, miband2, heartrate, notifications
        };

    }


    private async initCharacteristics(){
      
        const auth = await this.services.miband2.getCharacteristic(
            CHAR_UUIDS.auth
        );
        const hrControl = await this.services.heartrate.getCharacteristic(
            CHAR_UUIDS.heartrate_control
        );
        const hrMeasure = await this.services.heartrate.getCharacteristic(
            CHAR_UUIDS.heartrate_measure
        );
        const sensor = await this.services.miband1.getCharacteristic(
            CHAR_UUIDS.sensor
        );
        const notifications = await this.services.notifications.getCharacteristic(
            CHAR_UUIDS.notifications
        );
        const battery = await this.services.miband1.getCharacteristic(
            CHAR_UUIDS.battery
        );


        this.chars = {
            auth, hrControl, hrMeasure, sensor, notifications, battery
        };

        
    }


    
    async disconnect(): Promise<void> {

        if(!this.device) return;

        if(!this.device.gatt){
            throw "Device does not support GATT";
        }
        this.device.gatt.disconnect();

    }
    


    private async authenticate() {

        const auth = this.chars.auth;

        await auth.startNotifications();

        await auth.addEventListener("characteristicvaluechanged", async (event: any) => {

            const value: ArrayBuffer = event.target.value.buffer;
            const cmd = buf2hex(value.slice(0, 3));

            if (cmd === "100101") {
                console.log("Set new key OK");
            } else if (cmd === "100201") {
                const number = value.slice(3);
                console.log("Received authentication challenge: ", buf2hex(value.slice(3)));
                const key = aesjs.utils.hex.toBytes(this.authKey);
                // new Uint8Array(16)
                const aesCbc = new aesjs.ModeOfOperation.cbc(key, undefined as any);
                const out = aesCbc.encrypt(new Uint8Array(number));
                const cmd = concatBuffers(new Uint8Array([3, 0]), out);
                console.log("Sending authentication response");
                await this.chars.auth.writeValue(cmd);
            } else if (cmd === "100301") {
                await this.onAuthenticated();
            } else if (cmd === "100308") {
                console.log("Received authentication failure");
            } else {
                throw new Error(`Unknown callback, cmd='${cmd}'`);
            }


        });

        await auth.writeValue(Uint8Array.from([2, 0]));

    }

    private async onAuthenticated(){
        
        console.log("Authenticated");

        await this.measureHr();



    }


    private async measureHr() {

        const hrControl = this.chars.hrControl;
        const hrMeasure = this.chars.hrMeasure;
    

        await hrControl.writeValue(Uint8Array.from([0x15, 0x02, 0x00]));
        await hrControl.writeValue(Uint8Array.from([0x15, 0x01, 0x00]));

        
        await hrMeasure.startNotifications();


        await hrMeasure.addEventListener("characteristicvaluechanged", async (event: any) => {

            const heartRate = event.target.value.getInt16();
            console.log("Received heart rate value: ", heartRate);

            if(this.heartRateCb){
                this.heartRateCb(heartRate);
            }

        });



        await hrControl.writeValue(Uint8Array.from([0x15, 0x01, 0x01]));


        // Pinging
        setInterval(() => {
            console.log("Pinging heart rate monitor");
            this.chars.hrControl.writeValue(Uint8Array.from([0x16]));
        }, 3000);

          
    }


    private heartRateCb: onHeartRateCallbackT|null = null;

    public onHeartRate(cb: onHeartRateCallbackT): void {
        this.heartRateCb = cb;
    }



    sendNotification(message: string, type = NOTIFICATION_TYPES.msg): void {

        //console.log('sendNotification', {message});

        //const buffer = str2buf(type + message);

        /*
        const msg = NOTIFICATION_TYPES.msg + 'aóz' + '\xb1';
        console.log(msg);
        const buffer= str2buf(msg);
        console.log(buffer);
        console.log(buf2hex(buffer));
        */


        this.chars.notifications.writeValue(buffer);
    }


    /*
    async hrmStart() {
        await this.char.hrm_ctrl.writeValue(AB([0x15, 0x02, 0x00]))
        await this.char.hrm_ctrl.writeValue(AB([0x15, 0x01, 0x00]))
        await this.char.hrm_ctrl.writeValue(AB([0x15, 0x01, 0x01]))
    
        // Start pinging HRM
        this.hrmTimer = this.hrmTimer || setInterval(() => {
          debug('Pinging HRM')
          this.char.hrm_ctrl.writeValue(AB([0x16]))
        },12000);
      }
      */

    //async hrmStop() {
    //    clearInterval(this.hrmTimer);
    //    this.hrmTimer = undefined;
    //    await this.char.hrm_ctrl.writeValue(AB([0x15, 0x01, 0x00]))
    //  }

    
    async getBatteryInfo(): Promise<batteryT> {


        const data1 = await this.chars.battery.readValue();
        const data = new Uint8Array(data1.buffer);

        if (data.length <= 2){
            return {
                charging: false,
                level: -1,
            }
        }

        return {
            level: data[1],
            charging: !!data[2],
        }

    }
    
    
}