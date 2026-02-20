import { Score } from '../types';

/**
 * Calculate score per RIFT spec:
 * - Base: 100 points
 * - Speed bonus: +10 if total time < 5 minutes (300 seconds)
 * - Efficiency penalty: -2 per commit over 20
 */
export function calculateScore(
    totalTimeSeconds: number,
    totalCommits: number,
): Score {
    const base = 100;
    const speedBonus = totalTimeSeconds < 300 ? 10 : 0;
    const efficiencyPenalty =
        totalCommits > 20 ? -2 * (totalCommits - 20) : 0;

    return {
        base,
        speed_bonus: speedBonus,
        efficiency_penalty: efficiencyPenalty,
        total: base + speedBonus + efficiencyPenalty,
        total_commits: totalCommits,
    };
}
