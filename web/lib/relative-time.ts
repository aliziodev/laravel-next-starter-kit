const DIVISIONS: { amount: number; unit: Intl.RelativeTimeFormatUnit }[] = [
    { amount: 60, unit: "seconds" },
    { amount: 60, unit: "minutes" },
    { amount: 24, unit: "hours" },
    { amount: 7, unit: "days" },
    { amount: 4.34524, unit: "weeks" },
    { amount: 12, unit: "months" },
    { amount: Number.POSITIVE_INFINITY, unit: "years" },
];

const formatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

/**
 * Human-readable relative time from an ISO timestamp, e.g. "2 days ago".
 * The API returns raw timestamps; formatting is a presentation concern, so it
 * happens on the client. Returns an empty string for missing/invalid input.
 */
export function timeAgo(value: string | null | undefined): string {
    if (!value) return "";
    const time = new Date(value).getTime();
    if (Number.isNaN(time)) return "";

    let duration = (time - Date.now()) / 1000;
    for (const division of DIVISIONS) {
        if (Math.abs(duration) < division.amount) {
            return formatter.format(Math.round(duration), division.unit);
        }
        duration /= division.amount;
    }
    return "";
}
