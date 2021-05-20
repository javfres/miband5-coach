
/**
 * Async function to sleep
 * @param ms Time to wait in miliseconds
 */
export default function sleep(ms: number){

    // Create a new promise
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });

}