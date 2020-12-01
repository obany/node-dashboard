export interface HeaderState {
    /**
     * The sync health.
     */
    syncHealth: boolean;

    /**
     * The node health.
     */
    nodeHealth: boolean;

    /**
     * Mps for micro graph.
     */
    mps: string;

    /**
     * Mps values for micro graph.
     */
    mpsValues: number[];

    /**
     * Database size for micro graph.
     */
    databaseSize: string;

    /**
     * Database size values for micro graph.
     */
    databaseSizeValues: number[];

    /**
     * Memory size for micro graph.
     */
    memorySize: string;

    /**
     * Memory size values for micro graph.
     */
    memorySizeValues: number[];
}
