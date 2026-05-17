// UI-side proof preview. Mirrors the Compact circuit's assertions exactly so
// the dashboard can show whether thresholds would pass before paying for a
// real proof. The on-chain truth still comes from the circuit.

import type { PrivateReputationData } from "@/types/agent";
import type { ProofPreview, PublicProofThresholds } from "@/types/proof";

export function evaluateProofPreview(
  rep: PrivateReputationData,
  thresholds: PublicProofThresholds,
): ProofPreview {
  const completedTasks = rep.completedTasks >= thresholds.minCompletedTasks;
  // successfulTasks * 100 >= completedTasks * minSuccessRate
  const successRate =
    rep.successfulTasks * 100 >=
    rep.completedTasks * thresholds.minSuccessRate;
  const safetyScore = rep.safetyScore >= thresholds.minSafetyScore;
  const noActiveSlashes =
    !thresholds.requireNoActiveSlashes || rep.activeSlashes === 0;

  return {
    verified: completedTasks && successRate && safetyScore && noActiveSlashes,
    checks: { completedTasks, successRate, safetyScore, noActiveSlashes },
  };
}
