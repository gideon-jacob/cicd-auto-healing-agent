/**
 * Generate branch name following RIFT spec:
 * ALL UPPERCASE, spaces → underscores, ends with _AI_Fix
 *
 * Example: ("RIFT ORGANISERS", "Saiyam Kumar") → "RIFT_ORGANISERS_SAIYAM_KUMAR_AI_Fix"
 */
export function generateBranchName(teamName: string, leaderName: string): string {
    const sanitize = (str: string): string =>
        str
            .toUpperCase()
            .trim()
            .replace(/[^A-Z0-9\s]/g, '')
            .replace(/\s+/g, '_');

    const team = sanitize(teamName);
    const leader = sanitize(leaderName);

    return `${team}_${leader}_AI_Fix`;
}
