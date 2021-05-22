

export function getS(): number{
    return (new Date).getTime()/1000;
}

export function diffS(start: number): number{
    return getS() - start;
}
