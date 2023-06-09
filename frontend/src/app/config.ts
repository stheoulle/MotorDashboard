export interface Config {
    /*config in the list*/
    name : string;
    id : number;
    speed: string;
    mode : string;
    acceleration : string;
    step : string;
    offset : string;
    /*movingmode : string;*/
}

export interface ConfigInput {
    /*config displayed in the default config component*/
    name : string;
    speed: string;
    mode : string;
    acceleration : string;
    step : string;
    offset : string;
    /*movingmode : string;*/
}