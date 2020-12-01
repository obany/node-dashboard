import React, { ReactNode } from "react";
import curve from "../../assets/curve-light.svg";
import { ReactComponent as MemoryIcon } from "../../assets/memory.svg";
import { ReactComponent as MilestoneIcon } from "../../assets/milestone.svg";
import { ReactComponent as PruningIcon } from "../../assets/pruning.svg";
import { ReactComponent as UptimeIcon } from "../../assets/uptime.svg";
import { ServiceFactory } from "../../factories/serviceFactory";
import { IStatus } from "../../models/websocket/IStatus";
import { ISyncStatus } from "../../models/websocket/ISyncStatus";
import { ITpsMetrics } from "../../models/websocket/ITpsMetrics";
import { WebSocketTopic } from "../../models/websocket/webSocketTopic";
import { MetricsService } from "../../services/metricsService";
import { BrandHelper } from "../../utils/brandHelper";
import { FormatHelper } from "../../utils/formatHelper";
import AsyncComponent from "../components/AsyncComponent";
import Graph from "../components/Graph";
import PeersSummaryPanel from "../components/PeersSummaryPanel";
import "./Home.scss";
import { HomeState } from "./HomeState";

/**
 * Home panel.
 */
class Home extends AsyncComponent<unknown, HomeState> {
    /**
     * The metrics service.
     */
    private readonly _metricsService: MetricsService;

    /**
     * The status subscription id.
     */
    private _statusSubscription?: string;

    /**
     * The sync status subscription id.
     */
    private _syncStatusSubscription?: string;

    /**
     * The mps metrics subscription id.
     */
    private _mpsMetricsSubscription?: string;

    /**
     * Create a new instance of Home.
     * @param props The props.
     */
    constructor(props: unknown) {
        super(props);

        this._metricsService = ServiceFactory.get<MetricsService>("metrics");

        this.state = {
            nodeName: "",
            autoPeeringId: "No auto peering id",
            version: "",
            lmi: "-",
            lsmi: "-",
            pruningIndex: "-",
            memory: "-",
            uptime: "-",
            mpsIncoming: [],
            mpsOutgoing: []
        };
    }

    /**
     * The component mounted.
     */
    public componentDidMount(): void {
        super.componentDidMount();
        this._statusSubscription = this._metricsService.subscribe<IStatus>(
            WebSocketTopic.Status, data => {
                const nodeName = data.node_alias ? data.node_alias : BrandHelper.getConfiguration().name;
                const version = data.version;
                const autoPeeringId = data.autopeering_id || "No autopeering Id";
                const pruningIndex = data.pruning_index.toString();
                const uptime = FormatHelper.duration(data.uptime);
                const memory = FormatHelper.size(
                    data.mem.heap_inuse +
                    (data.mem.heap_idle - data.mem.heap_released) +
                    data.mem.m_span_inuse +
                    data.mem.m_cache_inuse +
                    data.mem.stack_sys);

                if (nodeName !== this.state.nodeName) {
                    this.setState({ nodeName });
                }

                if (version !== this.state.version) {
                    this.setState({ version });
                }

                if (autoPeeringId !== this.state.autoPeeringId) {
                    this.setState({ autoPeeringId });
                }

                if (pruningIndex !== this.state.pruningIndex) {
                    this.setState({ pruningIndex });
                }

                if (uptime !== this.state.uptime) {
                    this.setState({ uptime });
                }

                if (memory !== this.state.memory) {
                    this.setState({ memory });
                }
            });

        this._syncStatusSubscription = this._metricsService.subscribe<ISyncStatus>(
            WebSocketTopic.SyncStatus,
            data => {
                const lmi = data.lmi ? data.lmi.toString() : "";
                const lsmi = data.lsmi ? data.lsmi.toString() : "";

                if (lmi !== this.state.lmi) {
                    this.setState({ lmi });
                }

                if (lsmi !== this.state.lsmi) {
                    this.setState({ lsmi });
                }
            });

        this._mpsMetricsSubscription = this._metricsService.subscribe<ITpsMetrics>(
            WebSocketTopic.TPSMetrics,
            undefined,
            allData => {
                const mpsIncoming = allData.map(m => m.incoming);
                const mpsOutgoing = allData.map(m => m.outgoing);

                this.setState({ mpsIncoming, mpsOutgoing });
            }
        );
    }

    /**
     * The component will unmount.
     */
    public componentWillUnmount(): void {
        super.componentWillUnmount();

        if (this._statusSubscription) {
            this._metricsService.unsubscribe(this._statusSubscription);
            this._statusSubscription = undefined;
        }

        if (this._syncStatusSubscription) {
            this._metricsService.unsubscribe(this._syncStatusSubscription);
            this._syncStatusSubscription = undefined;
        }

        if (this._mpsMetricsSubscription) {
            this._metricsService.unsubscribe(this._mpsMetricsSubscription);
            this._mpsMetricsSubscription = undefined;
        }
    }

    /**
     * Render the component.
     * @returns The node to render.
     */
    public render(): ReactNode {
        return (
            <div className="home">
                <div className="content">
                    <div className="card">
                        <div className="banner row">
                            <div className="node-info">
                                <div>
                                    <h1>{this.state.nodeName}</h1>
                                    <p className="secondary margin-t-t">{this.state.autoPeeringId}</p>
                                </div>
                                <p className="secondary">v{this.state.version}</p>
                            </div>
                            <img src={curve} />
                            <div className="banner-image">
                                <img src={BrandHelper.getBanner()} />
                            </div>
                        </div>
                    </div>
                    <div className="row fill margin-t-s">
                        <div className="col">
                            <div className="row">
                                <div className="card info">
                                    <div className="icon-background icon-background--milestone">
                                        <MilestoneIcon />
                                    </div>
                                    <div className="col">
                                        <h4 className="margin-t-s">LSMI / LMI</h4>
                                        <div className="value">{this.state.lsmi} / {this.state.lmi}</div>
                                    </div>
                                </div>
                                <div className="card info">
                                    <div className="icon-background icon-background--pruning">
                                        <PruningIcon />
                                    </div>
                                    <div className="col">
                                        <h4 className="margin-t-s">Pruning Index</h4>
                                        <div className="value">{this.state.pruningIndex}</div>
                                    </div>
                                </div>
                            </div>
                            <div className="row margin-t-s">
                                <div className="card info">
                                    <div className="icon-background icon-background--uptime">
                                        <UptimeIcon />
                                    </div>
                                    <div className="col">
                                        <h4 className="margin-t-s">Uptime</h4>
                                        <div className="value">{this.state.uptime}</div>
                                    </div>
                                </div>
                                <div className="card info">
                                    <div className="icon-background icon-background--memory">
                                        <MemoryIcon />
                                    </div>
                                    <div className="col">
                                        <h4 className="margin-t-s">Memory Usage</h4>
                                        <div className="value">{this.state.memory}</div>
                                    </div>
                                </div>
                            </div>
                            <div className="row margin-t-s">
                                <div className="card fill messages-graph-panel margin-r-s">
                                    <Graph
                                        caption="Messages Per Second"
                                        seriesMaxLength={40}
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
                            </div>
                        </div>
                        <div className="card peers-summary-panel">
                            <PeersSummaryPanel />
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default Home;
