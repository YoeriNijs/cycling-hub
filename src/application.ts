import {VApplication, VRouteNotFoundStrategy} from "vienna-ts";
import {HomeComponent} from "./component/home.component";

@VApplication({
    declarations: [
        HomeComponent
    ],
    routes: [
        { path: '/', component: HomeComponent }
    ],
    routeNotFoundStrategy: VRouteNotFoundStrategy.IGNORE,
    globalStyles: [
        {
            href: 'https://cdn.jsdelivr.net/npm/uikit@3.10.1/dist/css/uikit.min.css',
            integrity: 'sha384-4RKnJ6e5bjXk6m+pqLV/ENqRe3N2QIt8fIbuO+eICJyy+rUVfr9PDxmjcmuIriKV',
            crossOrigin: 'anonymous'
        }
    ]
})
export class Application {}

// Initialize app
new Application();