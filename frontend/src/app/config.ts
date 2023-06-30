export interface Config {
    /*config in the list*/
    name : string;
    axis : string;
    id : number;
    speed: string;
    mode : string;
    acceleration : (number|null);
    step : (number|null);
    offset : (number|null);
    maxlength : number;
}