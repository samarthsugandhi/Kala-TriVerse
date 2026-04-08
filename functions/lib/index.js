"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateTeamId = void 0;
const app_1 = require("firebase-admin/app");
const firestore_1 = require("firebase-admin/firestore");
const https_1 = require("firebase-functions/v2/https");
const options_1 = require("firebase-functions/v2/options");
(0, app_1.initializeApp)();
(0, options_1.setGlobalOptions)({ region: "asia-south1", maxInstances: 30 });
const db = (0, firestore_1.getFirestore)();
const COUNTER_REF = db.doc("settings/counters");
const TEAM_ID_PREFIX = "IS-KT";
const MIN_PADDING = 3;
const formatTeamId = (sequence) => {
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
exports.generateTeamId = (0, https_1.onCall)(async () => {
    try {
        const teamId = await db.runTransaction(async (transaction) => {
            const counterSnap = await transaction.get(COUNTER_REF);
            const currentCount = Number(counterSnap.get("registrationCount") ?? 0);
            const nextCount = currentCount + 1;
            transaction.set(COUNTER_REF, {
                registrationCount: nextCount,
                updatedAt: firestore_1.FieldValue.serverTimestamp(),
            }, { merge: true });
            return formatTeamId(nextCount);
        });
        return { teamId };
    }
    catch (error) {
        console.error("generateTeamId failed", error);
        throw new https_1.HttpsError("internal", "Failed to allocate Team ID");
    }
});
