// https://github.com/vshymanskyy/miband-js/blob/master/src/miband.js
// https://github.com/VladKolerts/miband4/blob/master/index.js

import {ADVERTISEMENT_SERVICE, CHAR_UUIDS, UUIDS, NOTIFICATION_TYPES} from "./constants.js";
//import aesjs from './aes';
import aesjs from 'aes-js';

function buf2hex(buffer) {
  return Array.prototype.map
    .call(new Uint8Array(buffer), (x) => ("00" + x.toString(16)).slice(-2))
    .join("");
}

const concatBuffers = (buffer1, buffer2) => {
  const out = new Uint8Array(buffer1.byteLength + buffer2.byteLength);
  out.set(new Uint8Array(buffer1), 0);
  out.set(new Uint8Array(buffer2), buffer1.byteLength);
  return out.buffer;
};



export default class MiBand5 {
  /**
   * @param {String} authKey
   *   Hex representation of the auth key (https://github.com/Freeyourgadget/Gadgetbridge/wiki/Huami-Server-Pairing)
   *   Example: '94359d5b8b092e1286a43cfb62ee7923'
   */
  constructor(authKey) {
    if (!authKey.match(/^[a-zA-Z0-9]{32}$/)) {
      throw new Error(
        "Invalid auth key, must be 32 hex characters such as '94359d5b8b092e1286a43cfb62ee7923'"
      );
    }
    this.authKey = authKey;
    this.services = {};
    this.chars = {};
  }

  hr_callback = null;
  hr_callback_interval;

  onHeartRate(cb, interval = 10000){
    this.hr_callback = cb;
    this.hr_callback_interval = interval;
  }


  async init() {

    console.log("wait to connettt");

    const device = await navigator.bluetooth.requestDevice({
      filters: [
        {
          services: [ADVERTISEMENT_SERVICE],
        },
      ],
      optionalServices: [UUIDS.miband2, UUIDS.heartrate, UUIDS.miband1, UUIDS.notifications],
    });


    console.log("connected");

    window.dispatchEvent(new CustomEvent("connected"));
    await device.gatt.disconnect();
    console.log(" disss");
    const server = await device.gatt.connect();
    console.log("Connected through gatt");

    this.services.miband1 = await server.getPrimaryService(UUIDS.miband1);
    this.services.miband2 = await server.getPrimaryService(UUIDS.miband2);
    this.services.heartrate = await server.getPrimaryService(UUIDS.heartrate);


    this.services.notifications = await server.getPrimaryService(UUIDS.notifications);


    console.log("Services initialized");

    this.chars.auth = await this.services.miband2.getCharacteristic(
      CHAR_UUIDS.auth
    );
    this.chars.hrControl = await this.services.heartrate.getCharacteristic(
      CHAR_UUIDS.heartrate_control
    );
    this.chars.hrMeasure = await this.services.heartrate.getCharacteristic(
      CHAR_UUIDS.heartrate_measure
    );
    this.chars.sensor = await this.services.miband1.getCharacteristic(
      CHAR_UUIDS.sensor
    );

    this.chars.notifications = await this.services.notifications.getCharacteristic(CHAR_UUIDS.notifications);



    console.log("Characteristics initialized");
    await this.authenticate();
  }

  async authenticate() {
    await this.startNotifications(this.chars.auth, async (e) => {
      const value = e.target.value.buffer;
      const cmd = buf2hex(value.slice(0, 3));
      if (cmd === "100101") {
        console.log("Set new key OK");
      } else if (cmd === "100201") {
        const number = value.slice(3);
        console.log("Received authentication challenge: ", buf2hex(value.slice(3)));
        const key = aesjs.utils.hex.toBytes(this.authKey);
        const aesCbc = new aesjs.ModeOfOperation.cbc(key);
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
    await this.chars.auth.writeValue(Uint8Array.from([2, 0]));
  }

  async onAuthenticated() {
    console.log("Authentication successful");
    window.dispatchEvent(new CustomEvent("authenticated"));
    await this.measureHr();
  }

  async measureHr() {
    console.log("Starting heart rate measurement")
    await this.chars.hrControl.writeValue(Uint8Array.from([0x15, 0x02, 0x00]));
    await this.chars.hrControl.writeValue(Uint8Array.from([0x15, 0x01, 0x00]));
    await this.startNotifications(this.chars.hrMeasure, (e) => {


      console.log("Received heart rate value: ", e.target.value);
      const heartRate = e.target.value.getInt16();

      if(this.hr_callback){
        this.hr_callback(heartRate);
      }

      /*
      window.dispatchEvent(
        new CustomEvent("heartrate", {
          detail: heartRate,
        })
      );
        */

      
    });
    await this.chars.hrControl.writeValue(Uint8Array.from([0x15, 0x01, 0x01]));

    // Start pinging HRM
    /*
    this.hrmTimer =
      this.hrmTimer ||
      setInterval(() => {
        console.log("Pinging heart rate monitor");
        this.chars.hrControl.writeValue(Uint8Array.from([0x16]));
      }, 12000);
      */

      if(this.hr_callback){

        this.hrmTimer =
        this.hrmTimer ||
        setInterval(() => {
          console.log("Pinging heart rate monitor");
          this.chars.hrControl.writeValue(Uint8Array.from([0x16]));
        }, this.hr_callback_interval);

      }





  }

  async startNotifications(char, cb) {
    await char.startNotifications();
    char.addEventListener("characteristicvaluechanged", cb);
  }

  async sendNotification(message, type = NOTIFICATION_TYPES.msg) {
    console.log('sendNotification', {message});
    return this.chars.notifications.writeValue(Buffer.from(type + message));
  }

}
