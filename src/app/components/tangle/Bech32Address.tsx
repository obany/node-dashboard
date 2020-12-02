import React, { Component, ReactNode } from "react";
import { Link } from "react-router-dom";
import { ClipboardHelper } from "../../../utils/clipboardHelper";
import MessageButton from "../layout/MessageButton";
import { Bech32AddressProps } from "./Bech32AddressProps";

/**
 * Component which will display an Bech32Address.
 */
class Bech32Address extends Component<Bech32AddressProps> {
    /**
     * Render the component.
     * @returns The node to render.
     */
    public render(): ReactNode {
        return (
            <div className="bech32-address">
                {this.props.addressDetails?.bech32 && (
                    <React.Fragment>
                        <div className="card--label">
                            Address
                        </div>
                        <div className="card--value row">
                            {this.props.activeLinks && (
                                <Link
                                    className="margin-r-t"
                                    to={`/explorer/address/${this.props.addressDetails?.bech32}`}
                                >
                                    {this.props.addressDetails.bech32}
                                </Link>
                            )}
                            {!this.props.activeLinks && (
                                <span className="margin-r-t">{this.props.addressDetails.bech32}</span>
                            )}
                            <MessageButton
                                onClick={() => ClipboardHelper.copy(this.props.addressDetails?.bech32)}
                                buttonType="copy"
                                labelPosition="top"
                            />
                        </div>
                    </React.Fragment>
                )}
                {this.props.addressDetails?.typeLabel && this.props.addressDetails?.hex && (
                    <React.Fragment>
                        <div className="card--label">
                            {this.props.addressDetails.typeLabel} Address
                        </div>
                        <div className="card--value row">
                            {this.props.activeLinks && (
                                <Link
                                    className="margin-r-t"
                                    to={`/explorer/address/${this.props.addressDetails?.hex}`}
                                >
                                    {this.props.addressDetails?.hex}
                                </Link>
                            )}
                            {!this.props.activeLinks && (
                                <span className="margin-r-t">{this.props.addressDetails?.hex}</span>
                            )}
                            <MessageButton
                                onClick={() => ClipboardHelper.copy(this.props.addressDetails?.hex)}
                                buttonType="copy"
                                labelPosition="top"
                            />
                        </div>
                    </React.Fragment>
                )}
            </div>
        );
    }
}

export default Bech32Address;
