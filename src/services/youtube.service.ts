import {VInjectable} from "vienna-ts";

@VInjectable()
export class YoutubeService {
    get youtubeId(): string {
        return this._youtubeId;
    }

    set youtubeId(value: string) {
        this._youtubeId = value;
    }

    private _youtubeId = '';
}