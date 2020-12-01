import React, { ReactNode } from "react";
import { RouteComponentProps, withRouter } from "react-router-dom";
import { ServiceFactory } from "../../factories/serviceFactory";
import { IConfirmedMsMetrics } from "../../models/websocket/IConfirmedMsMetrics";
import { IDBSizeMetric } from "../../models/websocket/IDBSizeMetric";
import { IStatus } from "../../models/websocket/IStatus";
import { ITpsMetrics } from "../../models/websocket/ITpsMetrics";
import { WebSocketTopic } from "../../models/websocket/webSocketTopic";
import { MetricsService } from "../../services/metricsService";
import { DataHelper } from "../../utils/dataHelper";
import AsyncComponent from "../components/AsyncComponent";
import Graph from "../components/Graph";
import TabPanel from "../components/TabPanel";
import "./Analytics.scss";
import { AnalyticsState } from "./AnalyticsState";

/**
 * Analytics panel.
 */
class Analytics extends AsyncComponent<RouteComponentProps, AnalyticsState> {
    /**
     * The metrics service.
     */
    private readonly _metricsService: MetricsService;

    /**
     * The mps metrics subscription id.
     */
    private _mpsMetricsSubscription?: string;

    /**
     * The confirmed ms subscription id.
     */
    private _confirmedMsMetricsSubscription?: string;

    /**
     * The status subscription id.
     */
    private _statusSubscription?: string;

    /**
     * The database size metrics subscription id.
     */
    private _databaseSizeSubscription?: string;

    /**
     * Create a new instance of Analytics.
     * @param props The props.
     */
    constructor(props: RouteComponentProps) {
        super(props);

        this._metricsService = ServiceFactory.get<MetricsService>("metrics");

        this.state = {
            mpsIncoming: [],
            mpsOutgoing: [],
            milestoneTiming: [],
            mps: [],
            cmps: [],
            memorySize: [],
            databaseSize: []
        };
    }

    /**
     * The component mounted.
     */
    public componentDidMount(): void {
        super.componentDidMount();

        this._mpsMetricsSubscription = this._metricsService.subscribe<ITpsMetrics>(
            WebSocketTopic.TPSMetrics,
            undefined,
            allData => {
                this.setState({
                    mpsIncoming: allData.map(m => m.incoming),
                    mpsOutgoing: allData.map(m => m.outgoing)
                });
            }
        );

        this._confirmedMsMetricsSubscription = this._metricsService.subscribe<IConfirmedMsMetrics>(
            WebSocketTopic.ConfirmedMsMetrics,
            undefined,
            allData => {
                this.setState({
                    milestoneTiming: allData.map(m => m.time_since_last_ms),
                    mps: allData.map(m => m.mps),
                    cmps: allData.map(m => m.cmps)
                });
            }
        );

        this._statusSubscription = this._metricsService.subscribe<IStatus>(
            WebSocketTopic.Status,
            undefined,
            dataAll => {
                this.setState({ memorySize: dataAll.map(d => DataHelper.calculateMemoryUsage(d) / 1024 / 1024) });
            });

        this._databaseSizeSubscription = this._metricsService.subscribe<IDBSizeMetric>(
            WebSocketTopic.DBSizeMetric,
            undefined,
            dataAll => {
                this.setState({ databaseSize: dataAll.map(d => d.total / 1024 / 1024) });
            });
    }

    /**
     * The component will unmount.
     */
    public componentWillUnmount(): void {
        super.componentWillUnmount();

        if (this._mpsMetricsSubscription) {
            this._metricsService.unsubscribe(this._mpsMetricsSubscription);
            this._mpsMetricsSubscription = undefined;
        }

        if (this._confirmedMsMetricsSubscription) {
            this._metricsService.unsubscribe(this._confirmedMsMetricsSubscription);
            this._confirmedMsMetricsSubscription = undefined;
        }

        if (this._statusSubscription) {
            this._metricsService.unsubscribe(this._statusSubscription);
            this._statusSubscription = undefined;
        }

        if (this._databaseSizeSubscription) {
            this._metricsService.unsubscribe(this._databaseSizeSubscription);
            this._databaseSizeSubscription = undefined;
        }
    }

    /**
     * Render the component.
     * @returns The node to render.
     */
    public render(): ReactNode {
        return (
            <div className="analytics">
                <div className="content">
                    <TabPanel labels={["Tangle", "Node", "Log"]}>
                        <div className="fill">
                            <div className="card fill margin-r-s">
                                <Graph
                                    caption="Messages Per Second"
                                    seriesMaxLength={60}
                                    series={[
                                        {
                                            className: "bar-color-1",
                                            label: "Incoming",
                                            values: this.state.mpsIncoming
                                        },
                                        {
                                            className: "bar-color-2",
                                            label: "Outgoing",
                                            values: this.state.mpsOutgoing
                                        }
                                    ]}
                                />
                            </div>
                            <div className="card fill margin-r-s margin-t-s">
                                <Graph
                                    caption="Messages Per Milestone"
                                    seriesMaxLength={60}
                                    series={[
                                        {
                                            className: "bar-color-1",
                                            label: "Messages",
                                            values: this.state.mps
                                        },
                                        {
                                            className: "bar-color-2",
                                            label: "Confirmed Messages",
                                            values: this.state.cmps
                                        }
                                    ]}
                                />
                            </div>
                            <div className="card fill margin-r-s margin-t-s">
                                <Graph
                                    caption="Time Between Milestones"
                                    seriesMaxLength={60}
                                    series={[
                                        {
                                            className: "bar-color-1",
                                            label: "Incoming",
                                            values: this.state.milestoneTiming
                                        }
                                    ]}
                                />
                            </div>
                        </div>
                        <div className="fill">
                            <div className="card fill margin-r-s">
                                <Graph
                                    caption="Database (MB)"
                                    seriesMaxLength={60}
                                    series={[
                                        {
                                            className: "bar-color-1",
                                            label: "Size",
                                            values: this.state.databaseSize
                                        }
                                    ]}
                                />
                            </div>
                            <div className="card fill margin-r-s margin-t-s">
                                <Graph
                                    caption="Memory (MB)"
                                    seriesMaxLength={60}
                                    series={[
                                        {
                                            className: "bar-color-1",
                                            label: "Memory",
                                            values: this.state.memorySize
                                        }
                                    ]}
                                />
                            </div>
                        </div>
                        <div className="fill">
                            <p>What should we show for the log?</p>
                        </div>
                    </TabPanel>
                </div>
            </div>
        );
    }
}

export default withRouter(Analytics);
