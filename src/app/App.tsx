import React, { Component, ReactNode } from "react";
import { Route, RouteComponentProps, Switch, withRouter } from "react-router-dom";
import { ReactComponent as AnalyticsIcon } from "../assets/analytics.svg";
import { ReactComponent as ExplorerIcon } from "../assets/explorer.svg";
import { ReactComponent as HomeIcon } from "../assets/home.svg";
import { ReactComponent as PeersIcon } from "../assets/peers.svg";
import { ReactComponent as SettingsIcon } from "../assets/settings.svg";
import { ReactComponent as VisualizerIcon } from "../assets/visualizer.svg";
import "./App.scss";
import Header from "./components/Header";
import NavPanel from "./components/NavPanel";
import Analytics from "./routes/Analytics";
import Explorer from "./routes/Explorer";
import Home from "./routes/Home";
import Peers from "./routes/Peers";
import Settings from "./routes/Settings";
import Visualizer from "./routes/Visualizer";

/**
 * Main application class.
 */
class App extends Component<RouteComponentProps> {
    /**
     * Render the component.
     * @returns The node to render.
     */
    public render(): ReactNode {
        return (
            <div className="app">
                <NavPanel buttons={[
                    {
                        label: "Home",
                        icon: <HomeIcon />,
                        route: "/"
                    },
                    {
                        label: "Analytics",
                        icon: <AnalyticsIcon />,
                        route: "/analytics"
                    },
                    {
                        label: "Peers",
                        icon: <PeersIcon />,
                        route: "/peers"
                    },
                    {
                        label: "Explorer",
                        icon: <ExplorerIcon />,
                        route: "/explorer"
                    },
                    {
                        label: "Visualizer",
                        icon: <VisualizerIcon />,
                        route: "/visualizer"
                    },
                    {
                        label: "Settings",
                        icon: <SettingsIcon />,
                        route: "/settings"
                    }
                ]}
                />
                <div className="col fill">
                    <Header />
                    <div className="fill">
                        <Switch>
                            <Route
                                exact={true}
                                path="/"
                                component={() => (<Home />)}
                            />
                            <Route
                                path="/analytics"
                                component={() => (<Analytics />)}
                            />
                            <Route
                                path="/peers"
                                component={() => (<Peers />)}
                            />
                            <Route
                                path="/explorer"
                                component={() => (<Explorer />)}
                            />
                            <Route
                                path="/visualizer"
                                component={() => (<Visualizer />)}
                            />
                            <Route
                                path="/settings"
                                component={() => (<Settings />)}
                            />
                        </Switch>
                    </div>
                </div>
            </div>
        );
    }
}

export default withRouter(App);
