import React, { Component, ReactNode } from "react";
import { RouteComponentProps, withRouter } from "react-router-dom";

/**
 * Analytics panel.
 */
class Analytics extends Component<RouteComponentProps> {
    /**
     * Render the component.
     * @returns The node to render.
     */
    public render(): ReactNode {
        return (
            <div>
                Analytics
            </div>
        );
    }
}

export default withRouter(Analytics);
