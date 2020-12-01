import { IStatus } from "../models/websocket/IStatus";

/**
 * Class to help with processing of data.
 */
export class DataHelper {
    /**
     * Calculate the memory usage.
     * @param status The status.
     * @returns The calculate memory usage.
     */
    public static calculateMemoryUsage(status: IStatus): number {
        return status.mem.heap_inuse +
            (status.mem.heap_idle - status.mem.heap_released) +
            status.mem.m_span_inuse +
            status.mem.m_cache_inuse +
            status.mem.stack_sys;
    }
}