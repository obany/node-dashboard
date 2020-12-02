import { Bech32Helper, Converter, IMessageMetadata, MessageHelper, SingleNodeClient } from "@iota/iota2.js";
import { ISearchResponse } from "../models/tangle/ISearchResponse";

/**
 * Service to handle api requests.
 */
export class TangleService {
    /**
     * The api client.
     */
    private readonly _client: SingleNodeClient;

    /**
     * Create a new instance of ApiService.
     */
    constructor() {
        this._client = new SingleNodeClient(`${window.location.protocol}//${window.location.host}`, "/api/v1/");
    }

    /**
     * Query the node.
     * @param query The query to search for.
     * @returns The response data.
     */
    public async search(query: string): Promise<ISearchResponse> {
        const queryLower = query.toLowerCase();

        try {
            if (/^\d+$/.test(query)) {
                const milestone = await this._client.milestone(Number.parseInt(query, 10));

                return {
                    milestone
                };
            }
        } catch { }

        try {
            if (Converter.isHex(queryLower) && queryLower.length === 64) {
                const message = await this._client.message(queryLower);

                return {
                    message
                };
            }
        } catch { }

        try {
            const messages = await this._client.messagesFind(query);

            if (messages.count > 0) {
                return {
                    indexMessageIds: messages.messageIds
                };
            }
        } catch { }

        try {
            if (Bech32Helper.matches(queryLower)) {
                const address = await this._client.address(queryLower);

                if (address.count > 0) {
                    const addressOutputs = await this._client.addressOutputs(queryLower);

                    return {
                        address,
                        addressOutputIds: addressOutputs.outputIds
                    };
                }
            } else if (Converter.isHex(queryLower)) {
                const address = await this._client.addressEd25519(queryLower);

                if (address.count > 0) {
                    const addressOutputs = await this._client.addressEd25519Outputs(queryLower);

                    return {
                        address,
                        addressOutputIds: addressOutputs.outputIds
                    };
                }
            }
        } catch { }

        try {
            if (Converter.isHex(queryLower) && queryLower.length === 68) {
                const output = await this._client.output(queryLower);

                return {
                    output
                };
            }
        } catch { }

        return {};
    }

    /**
     * Get the message metadata.
     * @param messageId The message if to get the metadata for.
     * @returns The details response.
     */
    public async messageDetails(messageId: string): Promise<{
            metadata?: IMessageMetadata;
            validations?: string[];
            childrenIds?: string[];
        } | undefined> {
        try {
            const metadata = await this._client.messageMetadata(messageId);
            const children = await this._client.messageChildren(messageId);
            let validations;

            if (metadata.ledgerInclusionState === "conflicting") {
                const message = await this._client.message(messageId);
                validations = await MessageHelper.validateTransaction(this._client, message);
            }

            return {
                metadata,
                childrenIds: children ? children.childrenMessageIds : undefined,
                validations
            };
        } catch { }
    }
}
