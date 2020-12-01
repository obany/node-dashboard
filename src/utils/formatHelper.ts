import humanize from "humanize-duration";

/**
 * Class to help formatting values.
 */
export class FormatHelper {
    /**
     * Format the duration as human readable.
     * @param milliseconds The milliseconds total for the duration.
     * @returns The formatted duration.
     */
    public static duration(milliseconds: number): string {
        if (milliseconds < 3600000) {
            return humanize(milliseconds, { largest: 1, round: true });
        }

        return humanize(milliseconds, { largest: 2, maxDecimalPoints: 1 });
    }

    /**
     * Format the bytes to a human readable size.
     * @param bytes The bytes to format.
     * @param decimalPlaces The number of decimal places.
     * @returns The formatted string.
     */
    public static size(bytes: number, decimalPlaces: number = 2): string {
        if (bytes === 0) {
            return "0 Bytes";
        }

        const index = Math.floor(Math.log(bytes) / Math.log(1024));
        const units = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

        const value = Number((bytes / Math.pow(1024, index)).toFixed(decimalPlaces));
        let unit = units[index];

        if (unit === "Bytes" && (value === 0 || value === 1)) {
            unit = unit.slice(0, -1);
        }

        if (unit === undefined) {
            return bytes.toFixed(decimalPlaces).toString();
        }

        return `${value} ${unit}`;
    }
}
