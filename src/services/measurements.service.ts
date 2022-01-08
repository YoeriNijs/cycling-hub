import {VInjectable} from "vienna-ts";

export interface HrData {
    time: number;
    hr: number;
}

export interface PowerData {
    time: number;
    power: number;
}

@VInjectable()
export class MeasurementsService {
    get hrData(): HrData[] {
        return this._hrData;
    }

    set hrData(value: HrData[]) {
        this._hrData = value;
    }

    get powerData(): PowerData[] {
        return this._powerData;
    }

    set powerData(value: PowerData[]) {
        this._powerData = value;
    }

    private _hrData: HrData[] = new Array(200).fill({ time: new Date().getTime(), hr: 0 });
    private _powerData: PowerData[] = new Array(200).fill({ time: new Date().getTime(), power: 0 });
}