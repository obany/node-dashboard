import React, { ReactNode } from "react";
import { Link, RouteComponentProps } from "react-router-dom";
import { ReactComponent as ChevronLeftIcon } from "../../../assets/chevron-left.svg";
import { ServiceFactory } from "../../../factories/serviceFactory";
import { TangleService } from "../../../services/tangleService";
import { ClipboardHelper } from "../../../utils/clipboardHelper";
import AsyncComponent from "../../components/layout/AsyncComponent";
import MessageButton from "../../components/layout/MessageButton";
import Spinner from "../../components/layout/Spinner";
import Confirmation from "../../components/tangle/Confirmation";
import InclusionState from "../../components/tangle/InclusionState";
import IndexationPayload from "../../components/tangle/IndexationPayload";
import MilestonePayload from "../../components/tangle/MilestonePayload";
import TransactionPayload from "../../components/tangle/TransactionPayload";
import "./Message.scss";
import { MessageRouteProps } from "./MessageRouteProps";
import { MessageState } from "./MessageState";

/**
 * Component which will show the message page.
 */
class Message extends AsyncComponent<RouteComponentProps<MessageRouteProps>, MessageState> {
    /**
     * Service for tangle requests.
     */
    private readonly _tangleService: TangleService;

    /**
     * Create a new instance of Message.
     * @param props The props.
     */
    constructor(props: RouteComponentProps<MessageRouteProps>) {
        super(props);

        this._tangleService = ServiceFactory.get<TangleService>("tangle");

        this.state = {
            childrenBusy: true
        };
    }

    /**
     * The component mounted.
     */
    public async componentDidMount(): Promise<void> {
        super.componentDidMount();

        const result = await this._tangleService.search(this.props.match.params.messageId);

        if (result?.message) {
            this.setState({
                message: result.message
            }, async () => {
                await this.updateMessageDetails();
            });
        } else {
            this.props.history.replace(`/explorer/search/${this.props.match.params.messageId}`);
        }
    }

    /**
     * Render the component.
     * @returns The node to render.
     */
    public render(): ReactNode {
        return (
            <div className="message">
                <div className="content">
                    <Link
                        to="/explorer"
                        className="row"
                    >
                        <ChevronLeftIcon className="secondary" />
                        <h3 className="secondary margin-l-s">Back to Explorer</h3>
                    </Link>
                    <div className="card margin-t-m padding-l">
                        <div className="row">
                            <h2>
                                Message
                            </h2>
                            {this.state.confirmationState && (
                                <Confirmation
                                    state={this.state.confirmationState}
                                    milestoneIndex={this.state.metadata?.referencedByMilestoneIndex}
                                    onClick={this.state.metadata?.referencedByMilestoneIndex
                                        ? () => this.props.history.push(
                                            `/search/${this.state.metadata?.referencedByMilestoneIndex}`)
                                        : undefined}
                                />
                            )}
                        </div>
                        <div className="card--label">
                            Id
                        </div>
                        <div className="card--value row">
                            <span className="margin-r-t">{this.props.match.params.messageId}</span>
                            <MessageButton
                                onClick={() => ClipboardHelper.copy(
                                    this.props.match.params.messageId
                                )}
                                buttonType="copy"
                                labelPosition="top"
                            />
                        </div>
                        {this.state.message && (
                            <React.Fragment>
                                <div className="card--label">
                                    Parent Message 1
                                </div>
                                <div className="card--value row">
                                    {this.state.message?.parent1MessageId !== "0".repeat(64) && (
                                        <React.Fragment>
                                            <Link
                                                className="margin-r-t"
                                                to={
                                                    `/explorer/message/${this.state.message?.parent1MessageId}`
                                                }
                                            >
                                                {this.state.message?.parent1MessageId}
                                            </Link>
                                            <MessageButton
                                                onClick={() => ClipboardHelper.copy(
                                                    this.state.message?.parent1MessageId
                                                )}
                                                buttonType="copy"
                                                labelPosition="top"
                                            />
                                        </React.Fragment>
                                    )}
                                    {this.state.message?.parent1MessageId === "0".repeat(64) && (
                                        <span>Genesis</span>
                                    )}
                                </div>
                                <div className="card--label">
                                    Parent Message 2
                                </div>
                                <div className="card--value row">
                                    {this.state.message?.parent2MessageId !== "0".repeat(64) && (
                                        <React.Fragment>
                                            <Link
                                                className="margin-r-t"
                                                to={
                                                    `/explorer/message/${this.state.message?.parent2MessageId}`
                                                }
                                            >
                                                {this.state.message?.parent2MessageId}
                                            </Link>
                                            <MessageButton
                                                onClick={() => ClipboardHelper.copy(
                                                    this.state.message?.parent2MessageId
                                                )}
                                                buttonType="copy"
                                                labelPosition="top"
                                            />
                                        </React.Fragment>
                                    )}
                                    {this.state.message?.parent2MessageId === "0".repeat(64) && (
                                        <span>Genesis</span>
                                    )}
                                </div>
                            </React.Fragment>
                        )}
                        <div className="card--label">
                            Nonce
                        </div>
                        <div className="card--value row">
                            <span className="margin-r-t">{this.state.message?.nonce}</span>
                        </div>
                    </div>
                    <div className="card margin-t-m padding-l">
                        <h2>
                            Metadata
                        </h2>
                        {!this.state.metadata && (
                            <Spinner />
                        )}
                        {this.state.metadata && (
                            <React.Fragment>
                                <div className="card--label">
                                    Is Solid
                                </div>
                                <div className="card--value row">
                                    <span className="margin-r-t">
                                        {this.state.metadata?.isSolid ? "Yes" : "No"}
                                    </span>
                                </div>
                                <div className="card--label">
                                    Ledger Inclusion
                                </div>
                                <div className="card--value row">
                                    <InclusionState state={this.state.metadata?.ledgerInclusionState} />
                                </div>
                                {this.state.validations && this.state.validations.length > 0 && (
                                    <React.Fragment>
                                        <div className="card--label">
                                            Conflicts
                                        </div>
                                        <div className="card--value row">
                                            <span className="margin-r-t">
                                                {this.state.validations.map((v, idx) => (
                                                    <div key={idx}>{v}</div>
                                                ))}
                                            </span>
                                        </div>
                                    </React.Fragment>
                                )}
                            </React.Fragment>
                        )}
                    </div>
                    {this.state.message?.payload && (
                        <React.Fragment>
                            {this.state.message.payload.type === 0 && (
                                <TransactionPayload payload={this.state.message.payload} />
                            )}
                            {this.state.message.payload.type === 1 && (
                                <div className="card margin-t-m padding-l">
                                    <MilestonePayload payload={this.state.message.payload} />
                                </div>
                            )}
                            {this.state.message.payload.type === 2 && (
                                <div className="card margin-t-m padding-l">
                                    <IndexationPayload payload={this.state.message.payload} />
                                </div>
                            )}

                            {this.state.message.payload.type === 0 &&
                                this.state.message.payload.essence.payload && (
                                    <div className="card margin-t-m padding-l">
                                        <IndexationPayload
                                            payload={this.state.message.payload.essence.payload}
                                        />
                                    </div>
                                )}
                        </React.Fragment>
                    )}
                    <div className="card margin-t-s padding-l">
                        <div className="row margin-b-s">
                            <h2>Child Messages</h2>
                            {this.state.childrenIds !== undefined && (
                                <span className="card--header-count">
                                    {this.state.childrenIds.length}
                                </span>
                            )}
                        </div>
                        {this.state.childrenBusy && (<Spinner />)}
                        {this.state.childrenIds?.map(childId => (
                            <div className="card--value margin-b-s" key={childId}>
                                <Link
                                    to={
                                        `/explorer/message/${childId}`
                                    }
                                >
                                    {childId}
                                </Link>
                            </div>
                        ))}
                        {!this.state.childrenBusy &&
                            this.state.childrenIds &&
                            this.state.childrenIds.length === 0 && (
                                <p>There are no children for this message.</p>
                            )}
                    </div>
                </div>
            </div>
        );
    }

    /**
     * Update the message details.
     */
    private async updateMessageDetails(): Promise<void> {
        const details = await this._tangleService.messageDetails(this.props.match.params.messageId);

        this.setState({
            metadata: details?.metadata,
            childrenIds: details?.childrenIds,
            validations: details?.validations,
            confirmationState: details?.metadata?.referencedByMilestoneIndex !== undefined
                ? "referenced" : "pending",
            childrenBusy: false
        });

        if (!details?.metadata?.referencedByMilestoneIndex) {
            setTimeout(async () => {
                await this.updateMessageDetails();
            }, 10000);
        }
    }
}

export default Message;
