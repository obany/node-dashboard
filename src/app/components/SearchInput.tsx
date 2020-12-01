import classNames from "classnames";
import React, { Component, ReactNode } from "react";
import SearchIcon from "../../assets/search.svg";
import "./SearchInput.scss";
import { SearchInputProps } from "./SearchInputProps";
import { SearchInputState } from "./SearchInputState";

/**
 * Search Input panel.
 */
class SearchInput extends Component<SearchInputProps, SearchInputState> {
    /**
     * Create a new instance of SearchInput.
     * @param props The properties.
     */
    constructor(props: SearchInputProps) {
        super(props);

        this.state = {
            query: ""
        };
    }

    /**
     * Render the component.
     * @returns The node to render.
     */
    public render(): ReactNode {
        return (
            <div className={classNames("search-input", this.props.className)}>
                <img src={SearchIcon} />
                <input
                    type="text"
                    value={this.state.query}
                    onChange={e => this.setState({ query: e.target.value })}
                    onKeyDown={e => {
                        if (e.keyCode === 13) {
                            this.props.onSearch(this.state.query);
                        }
                    }}
                    placeholder="Search the Tangle"
                />
            </div>
        );
    }
}

export default SearchInput;
