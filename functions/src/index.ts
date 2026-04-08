import { initializeApp } from "firebase-admin/app";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import { HttpsError, onCall } from "firebase-functions/v2/https";
import { setGlobalOptions } from "firebase-functions/v2/options";

initializeApp();
setGlobalOptions({ region: "asia-south1", maxInstances: 30 });

const db = getFirestore();
const COUNTER_REF = db.doc("settings/counters");
const TEAM_ID_PREFIX = "IS-KT";
const MIN_PADDING = 3;

const formatTeamId = (sequence: number) => {
  const dynamicPadding = Math.max(MIN_PADDING, String(sequence).length);
  return `${TEAM_ID_PREFIX}-${String(sequence).padStart(dynamicPadding, "0")}`;
};

/**
 * Server-side Team-ID allocator.
 *
 * Guarantees:
 * - Atomic increment using Firestore transaction
 * - Sequential, immutable IDs
 * - Never reuses old/deleted IDs
 */
export const generateTeamId = onCall(async () => {
  try {
    const teamId = await db.runTransaction(async (transaction) => {
      const counterSnap = await transaction.get(COUNTER_REF);
      const currentCount = Number(counterSnap.get("registrationCount") ?? 0);
      const nextCount = currentCount + 1;

      transaction.set(
        COUNTER_REF,
        {
          registrationCount: nextCount,
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
      );

      return formatTeamId(nextCount);
    });

    return { teamId };
  } catch (error) {
    console.error("generateTeamId failed", error);
    throw new HttpsError("internal", "Failed to allocate Team ID");
  }
});
