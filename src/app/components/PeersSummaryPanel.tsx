import React, { Component, ReactNode } from "react";
import HealthBadIcon from "../../assets/health-bad.svg";
import HealthGoodIcon from "../../assets/health-good.svg";
import { ServiceFactory } from "../../factories/serviceFactory";
import { IPeerMetric } from "../../models/websocket/IPeerMetric";
import { WebSocketTopic } from "../../models/websocket/webSocketTopic";
import { MetricsService } from "../../services/metricsService";
import "./PeersSummaryPanel.scss";
import { PeersSummaryState } from "./PeersSummaryState";

/**
 * Display a list of the peers.
 */
class PeersSummaryPanel extends Component<unknown, PeersSummaryState> {
    /**
     * The metrics service.
     */
    private readonly _metricsService: MetricsService;

    /**
     * The peer subscription id.
     */
    private _peerSubscription?: string;

    /**
     * Create a new instance of PeersSummaryPanel.
     * @param props The props.
     */
    constructor(props: unknown) {
        super(props);

        this._metricsService = ServiceFactory.get<MetricsService>("metrics");

        this.state = {
        };
    }

    /**
     * The component mounted.
     */
    public componentDidMount(): void {
        this._peerSubscription = this._metricsService.subscribe<IPeerMetric[]>(
            WebSocketTopic.PeerMetric,
            data => {
                this.handleData(data);
            });
    }

    /**
     * The component will unmount.
     */
    public componentWillUnmount(): void {
        if (this._peerSubscription) {
            this._metricsService.unsubscribe(this._peerSubscription);
            this._peerSubscription = undefined;
        }
    }

    /**
     * Render the component.
     * @returns The node to render.
     */
    public render(): ReactNode {
        return (
            <div className="peers-summary">
                <h4 className="margin-b-m">Peers</h4>
                {!this.state.peers && (
                    <p>There are no peers.</p>
                )}
                {this.state.peers?.map((p, idx) => (
                    <div key={idx} className="peer">
                        <img src={p.connected ? HealthGoodIcon : HealthBadIcon} />
                        <span className="peer-id">
                            {p.name}
                            {p.address && (
                                <React.Fragment>
                                    <br />
                                    {p.address}
                                </React.Fragment>
                            )}
                        </span>
                    </div>
                ))}
            </div>
        );
    }

    /**
     * Handle the peer data.
     * @param data The data to handle.
     */
    private handleData(data: IPeerMetric[]): void {
        this.setState({
            peers: data
                ? data.map(p => ({
                    connected: p.connected,
                    name: this.formatPeerName(p),
                    address: this.formatPeerAddress(p)
                })).sort((a, b) => {
                    if (a.connected && !b.connected) {
                        return -1;
                    } else if (!a.connected && b.connected) {
                        return 1;
                    }

                    return a.name.localeCompare(b.name);
                })
                : undefined
        });
    }

    /**
     * Format the name for the peer.
     * @param peer The peer.
     * @returns The formatted name.
     */
    private formatPeerName(peer: IPeerMetric): string {
        let name = "";

        if (peer.alias) {
            name += peer.alias;
        } else if (peer.identity) {
            name += peer.identity;
        }

        return name;
    }

    /**
     * Format the address for the peer.
     * @param peer The peer.
     * @returns The formatted address.
     */
    private formatPeerAddress(peer: IPeerMetric): string | undefined {
        let address;

        if (peer.origin_addr) {
            address = this.extractIp4(peer.origin_addr);
        }

        if (!address && peer.info.address.length > 0) {
            address = this.extractIp4(peer.info.address[0]);
        }

        return address;
    }

    /**
     * Extract and format an IPv4 address.
     * @param addr The address to extract.
     * @returns The formatted address.
     */
    private extractIp4(addr: string): string | undefined {
        const parts = /ip4\/((?:\d{1,3}.){3}\d{1,3})\/tcp\/(\d*)/.exec(addr);

        if (parts && parts.length === 3) {
            return `${parts[1]}:${parts[2]}`;
        }
    }
}

export default PeersSummaryPanel;
