import React, { Component, ReactNode } from "react";
import { ServiceFactory } from "../../factories/serviceFactory";
import { IDBSizeMetric } from "../../models/websocket/IDBSizeMetric";
import { IStatus } from "../../models/websocket/IStatus";
import { ITpsMetrics } from "../../models/websocket/ITpsMetrics";
import { WebSocketTopic } from "../../models/websocket/webSocketTopic";
import { MetricsService } from "../../services/metricsService";
import { FormatHelper } from "../../utils/formatHelper";
import "./Header.scss";
import { HeaderState } from "./HeaderState";
import HealthIndicator from "./HealthIndicator";
import MicroGraph from "./MicroGraph";
import SearchInput from "./SearchInput";

/**
 * Header panel.
 */
class Header extends Component<unknown, HeaderState> {
    /**
     * The metrics service.
     */
    private readonly _metricsService: MetricsService;

    /**
     * The status subscription id.
     */
    private _statusSubscription?: string;

    /**
     * The database size metrics subscription id.
     */
    private _databaseSizeSubscription?: string;

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
            syncHealth: false,
            nodeHealth: false,
            mps: "-",
            mpsValues: [],
            memorySize: "-",
            memorySizeValues: [],
            databaseSize: "-",
            databaseSizeValues: []
        };
    }

    /**
     * The component mounted.
     */
    public componentDidMount(): void {
        this._statusSubscription = this._metricsService.subscribe<IStatus>(
            WebSocketTopic.Status,
            data => {
                const memorySizeFormatted = FormatHelper.size(this.calculateMemoryUsage(data), 1);

                if (memorySizeFormatted !== this.state.memorySize) {
                    this.setState({ memorySize: memorySizeFormatted });
                }
                if (data.is_healthy !== this.state.nodeHealth) {
                    this.setState({ nodeHealth: data.is_healthy });
                }
                if (data.is_synced !== this.state.syncHealth) {
                    this.setState({ syncHealth: data.is_synced });
                }
            },
            dataAll => {
                this.setState({ memorySizeValues: dataAll.map(d => this.calculateMemoryUsage(d)) });
            });

        this._databaseSizeSubscription = this._metricsService.subscribe<IDBSizeMetric>(
            WebSocketTopic.DBSizeMetric,
            undefined,
            dataAll => {
                const databaseSizeValues = dataAll.map(d => d.total);

                const databaseSizeFormatted = FormatHelper.size(databaseSizeValues[databaseSizeValues.length - 1]);

                if (databaseSizeFormatted !== this.state.databaseSize) {
                    this.setState({ databaseSize: databaseSizeFormatted });
                }
                this.setState({ databaseSizeValues });
            });

        this._mpsMetricsSubscription = this._metricsService.subscribe<ITpsMetrics>(
            WebSocketTopic.TPSMetrics, data => {
                const mpsValues = this.state.mpsValues.slice(-40);
                mpsValues.push(data.new);

                const mpsFormatted = mpsValues[mpsValues.length - 1].toString();

                if (mpsFormatted !== this.state.databaseSize) {
                    this.setState({ mps: mpsFormatted });
                }
                this.setState({ mpsValues });
            });
    }

    /**
     * The component will unmount.
     */
    public componentWillUnmount(): void {
        if (this._statusSubscription) {
            this._metricsService.unsubscribe(this._statusSubscription);
            this._statusSubscription = undefined;
        }

        if (this._databaseSizeSubscription) {
            this._metricsService.unsubscribe(this._databaseSizeSubscription);
            this._databaseSizeSubscription = undefined;
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
            <header className="header">
                <div className="content">
                    <SearchInput
                        onSearch={query => console.log(query)}
                        className="child child-fill"
                    />
                    <HealthIndicator
                        label="Health"
                        healthy={this.state.nodeHealth}
                        className="child"
                    />
                    <HealthIndicator
                        label="Sync"
                        healthy={this.state.syncHealth}
                        className="child"
                    />
                    <MicroGraph
                        label="MPS"
                        value={this.state.mps}
                        values={this.state.mpsValues}
                        className="child"
                    />
                    <MicroGraph
                        label="Database"
                        value={this.state.databaseSize}
                        values={this.state.databaseSizeValues}
                        className="child"
                    />
                    <MicroGraph
                        label="Memory"
                        value={this.state.memorySize}
                        values={this.state.memorySizeValues}
                        className="child"
                    />
                </div>
            </header>
        );
    }

    /**
     * Calculate the memory usage.
     * @param status The status.
     */
    private calculateMemoryUsage(status: IStatus): number {
        return status.mem.heap_inuse +
            (status.mem.heap_idle - status.mem.heap_released) +
            status.mem.m_span_inuse +
            status.mem.m_cache_inuse +
            status.mem.stack_sys;
    }
}

export default Header;
