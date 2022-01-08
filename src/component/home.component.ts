import {VComponent} from "vienna-ts";
import {MeasurementsService} from "../services/measurements.service";
import {CategoryScale, Chart, LinearScale, LineController, LineElement, PointElement} from "chart.js";
import {YoutubeService} from "../services/youtube.service";

interface Bluetooth {
    bluetooth: any;
}

type BluetoothNavigator = Navigator & Bluetooth;

@VComponent({
    selector: 'home-component',
    encapsulationMode: 'open',
    styles: [
        `
            :host {
                display: flex;
                flex-direction: column; 
            }
            
            .metrics {
                display: flex;
                flex-direction: row;
            }
            
            h2 {
                margin-right: 10px;
            }
            
            .charts {
                display: flex;
                flex-direction: row;
                justify-content: space-evenly;
                width: 100%;
            }
            
            .hr, .power {
                width: 100%;
            }
            
            .video-container {
                position:relative;
                padding-bottom:35%;
                padding-top:30px;
                height:0;
                overflow:hidden;
                margin-bottom: 10px;
            }
                
            .video-container iframe, .video-container object, .video-container embed {
                position:absolute;
                top:0;
                left:0;
                width:100%;
                height:100%;
            }
            
        `
    ],
    html: `        
        <div class="video-container">
            <iframe width="560" height="315" src="https://www.youtube.com/embed/{{ this._youtubeService.youtubeId }}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
        </div>
        
        <div class="find-device">
            <button @click="setYoutube">YouTube embed</button>
            <button @click="searchHrDevices">Connect HR</button>
            <button @click="searchPowerDevices">Connect Power</button>
        </div>

        <div class="charts">
            <div class="hr">
                <div class="metrics">
                    <h2>HR</h2>
                    <h2 class="hrCurrent"></h2>
                    <h2 class="hrDiff"></h2>
                </div>
        
                <div id="chartHr"></div>
            </div>
            
            <div class="power">
                <div class="metrics">
                    <h2>Power</h2>
                    <h2 class="powerCurrent"></h2>
                    <h2 class="powerDiff"></h2>
                </div>
        
                <div id="chartPower"></div>
            </div>
        </div>

    `
})
export class HomeComponent {

    private bluetoothNavigator: BluetoothNavigator = window.navigator as BluetoothNavigator;

    constructor(protected _measurementsService: MeasurementsService, protected _youtubeService: YoutubeService) {
        Chart.register(
            // Controllers
            LineController,

            // Scales
            CategoryScale, LinearScale,

            // Elements
            PointElement, LineElement
        );
    }

    setYoutube(): void {
        let link = prompt("Fill in YouTube link (e.g. https://www.youtube.com/watch?v=something)", '');
        if (link && link.indexOf('=') !== -1) {
            this._youtubeService.youtubeId = link.substring(link.indexOf('=') + 1, link.length);
        }
    }

    searchHrDevices(): void {
        this.connectHr({ onChange: (event: any) => this.printHeartRate(event) })
            .catch((err: any) => {
                console.error('Cannot connect heart rate!', err);
                alert('Cannot connect heart rate sensor!');
            });
    }

    searchPowerDevices(): void {
        this.connectPower({ onChange: (event: any) => this.printPowerRate(event) })
            .catch((err: any) => {
                console.error('Cannot connect power!', err);
                alert('Cannot connect power sensor')
            });
    }

    private printHeartRate(event: any): void {
        const heartRate = event.target.value.getInt8(1);
        const prev = this._measurementsService.hrData[this._measurementsService.hrData.length - 1].hr;
        this._measurementsService.hrData[this._measurementsService.hrData.length] = { time: new Date().getTime(), hr: heartRate };
        this._measurementsService.hrData = this._measurementsService.hrData.slice(-200);

        this.updateHr(heartRate, prev);
        this.updateHrChart();
    }

    private printPowerRate(event: any): void {
        const powerRate = event.target.value.getInt8(1);
        const prev = this._measurementsService.powerData[this._measurementsService.powerData.length - 1].power;
        this._measurementsService.powerData[this._measurementsService.powerData.length] = { time: new Date().getTime(), power: powerRate };
        this._measurementsService.powerData = this._measurementsService.powerData.slice(-200);

        this.updatePowerChart();
    }

    private async connectHr(props: any) {
        // 16-bit UUID Numbers Document, see https://www.bluetooth.com/specifications/assigned-numbers/
        // https://gist.github.com/sam016/4abe921b5a9ee27f67b3686910293026
        const device = await this.bluetoothNavigator.bluetooth.requestDevice({
            filters: [{ services: [0x180D] }],
            acceptAllDevices: false,
        });
        const server = await device.gatt.connect();
        const service = await server.getPrimaryService('0000180d-0000-1000-8000-00805f9b34fb');
        const char = await service.getCharacteristic('00002a37-0000-1000-8000-00805f9b34fb');
        char.oncharacteristicvaluechanged = props.onChange;
        char.startNotifications();

        return char
    }

    private async connectPower(props: any) {
        // 16-bit UUID Numbers Document, see https://www.bluetooth.com/specifications/assigned-numbers/
        // https://gist.github.com/sam016/4abe921b5a9ee27f67b3686910293026
        const device = await this.bluetoothNavigator.bluetooth.requestDevice({
            filters: [{ services: [0x1818] }],
            acceptAllDevices: false,
        });
        const server = await device.gatt.connect();
        const service = await server.getPrimaryService('00001818-0000-1000-8000-00805f9b34fb');
        const char = await service.getCharacteristic('00002a63-0000-1000-8000-00805f9b34fb');
        char.oncharacteristicvaluechanged = props.onChange;
        char.startNotifications();

        return char
    }

    private updateHr(current: number, previous: number): void {
        const root: ShadowRoot = this.getRoot();
        const hrCurrent: HTMLElement = root.querySelector('h2.hrCurrent');
        hrCurrent.innerText = `${current}bpm`;

        const hrDiff: HTMLElement = root.querySelector('h2.hrDiff');
        hrDiff.innerText = current === previous ? '⇿' : current > previous ? '⬆' : '⬇';
    }

    private updateHrChart(): void {
        const root: ShadowRoot = this.getRoot();
        const wrapper: HTMLElement = root.querySelector('#chartHr');
        if (!wrapper) {
            return;
        }

        // Clear previous state
        wrapper.innerHTML = '';

        const canvas: HTMLCanvasElement = document.createElement('canvas');
        canvas.width = 400;
        canvas.height = 50;
        wrapper.append(canvas);

        // Create new chart
        const ctx = canvas.getContext('2d');

        const labels = this._measurementsService.hrData.map(v => v.time);
        const values = this._measurementsService.hrData.map(v => v.hr);
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Heart rate',
                        data: values,
                        borderColor: 'red',
                        backgroundColor: 'white',
                    }
                ]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    }
                },
                animation: false,
                scales: {
                    y: {
                        min: 0
                    },
                    x: {
                        display: false
                    }
                }
            },
        });
    }

    private updatePowerChart(): void {
        const root: ShadowRoot = this.getRoot();
        const wrapper: HTMLElement = root.querySelector('#chartPower');
        if (!wrapper) {
            return;
        }

        // Clear previous state
        wrapper.innerHTML = '';

        const canvas: HTMLCanvasElement = document.createElement('canvas');
        canvas.width = 400;
        canvas.height = 50;
        wrapper.append(canvas);

        // Create new chart
        const ctx = canvas.getContext('2d');

        const labels = this._measurementsService.powerData.map(v => v.time);
        const values = this._measurementsService.powerData.map(v => v.power);
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Power',
                        data: values,
                        borderColor: 'blue',
                        backgroundColor: 'white',
                    }
                ]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    }
                },
                animation: false,
                scales: {
                    y: {
                        min: 0
                    },
                    x: {
                        display: false
                    }
                }
            },
        });
    }

    private getRoot(): ShadowRoot {
        return document.querySelector('home-component').shadowRoot;
    }
}