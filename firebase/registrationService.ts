import {
  Firestore,
  addDoc,
  collection,
  doc,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";

export const TEAM_ID_PREFIX = "IS-KT";
const MAX_WRITE_RETRIES = 4;
const TEAM_ID_SLICE_LENGTH = 6;

export type AuditAction = "CREATE_TEAM" | "DELETE_TEAM" | "RESTORE_TEAM";

export interface MemberPayload {
  name: string;
  usn: string;
  semester: string;
  branch: string;
  email: string;
  phone: string;
  stay: string;
  hostelName: string;
}

export interface RegistrationPayload {
  teamName: string;
  act: string;
  leadName: string;
  usn: string;
  semester: string;
  branch: string;
  email: string;
  phone: string;
  stay: string;
  hostelName: string;
  members: MemberPayload[];
  placement?: string;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const shouldRetry = (error: any) => {
  const retryableCodes = new Set([
    "unavailable",
    "deadline-exceeded",
    "resource-exhausted",
    "cancelled",
    "internal",
  ]);
  return retryableCodes.has(error?.code);
};

const jitter = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

const withRetry = async <T>(
  operation: () => Promise<T>,
  maxRetries: number,
  baseDelayMs = 120
) => {
  let attempt = 0;
  while (true) {
    try {
      return await operation();
    } catch (error: any) {
      attempt += 1;
      if (attempt > maxRetries || !shouldRetry(error)) {
        throw error;
      }
      const delay = baseDelayMs * 2 ** (attempt - 1) + jitter(20, 90);
      await sleep(delay);
    }
  }
};

/**
 * Derive a human-readable Team ID from Firestore auto document ID.
 * Example: aB3xYz9kLm -> IS-KT-AB3XYZ
 */
export const generateTeamIdFromDocId = (docId: string, prefix = TEAM_ID_PREFIX) => {
  const compact = (docId || "").replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  const slice = compact.slice(0, TEAM_ID_SLICE_LENGTH);
  return `${prefix}-${slice || "UNKNOWN"}`;
};

export const appendAuditLog = async (
  db: Firestore,
  action: AuditAction,
  teamId: string,
  performedBy: string
) => {
  await addDoc(collection(db, "logs"), {
    action,
    teamId,
    performedBy,
    timestamp: serverTimestamp(),
  });
};

export const createRegistrationWithGeneratedId = async (
  db: Firestore,
  payload: RegistrationPayload,
  performedBy = "public"
): Promise<string> => {
  const regRef = doc(collection(db, "registrations"));
  const teamId = generateTeamIdFromDocId(regRef.id);

  await withRetry(
    () =>
      setDoc(regRef, {
        ...payload,
        teamId,
        isDeleted: false,
        deletedAt: null,
        deletedBy: null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }),
    MAX_WRITE_RETRIES
  );

  try {
    await appendAuditLog(db, "CREATE_TEAM", teamId, performedBy);
  } catch (error) {
    console.warn("Audit log failed for CREATE_TEAM", error);
  }

  return teamId;
};

export const softDeleteRegistration = async (
  db: Firestore,
  teamId: string,
  performedBy: string
) => {
  await updateDoc(doc(db, "registrations", teamId), {
    isDeleted: true,
    deletedAt: serverTimestamp(),
    deletedBy: performedBy,
    updatedAt: serverTimestamp(),
  });

  try {
    await appendAuditLog(db, "DELETE_TEAM", teamId, performedBy);
  } catch (error) {
    console.warn("Audit log failed for DELETE_TEAM", error);
  }
};

export const restoreRegistration = async (
  db: Firestore,
  teamId: string,
  performedBy: string
) => {
  await updateDoc(doc(db, "registrations", teamId), {
    isDeleted: false,
    deletedAt: null,
    deletedBy: null,
    updatedAt: serverTimestamp(),
  });

  try {
    await appendAuditLog(db, "RESTORE_TEAM", teamId, performedBy);
  } catch (error) {
    console.warn("Audit log failed for RESTORE_TEAM", error);
  }
};
