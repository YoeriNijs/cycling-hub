import {VApplication, VRouteNotFoundStrategy} from "vienna-ts";
import {HomeComponent} from "./component/home.component";

@VApplication({
    declarations: [
        HomeComponent
    ],
    routes: [
        { path: '/', component: HomeComponent }
    ],
    routeNotFoundStrategy: VRouteNotFoundStrategy.IGNORE
})
export class Application {}

// Initialize app
new Application();