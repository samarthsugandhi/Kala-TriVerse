import {
  Firestore,
  addDoc,
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";

export const TEAM_ID_PREFIX = "IS-KT";
const MAX_WRITE_RETRIES = 4;
const TEAM_ID_SUFFIX_LENGTH = 3;

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
 * Get the next sequential Team ID by querying existing registrations.
 * Reads all registrations, finds the highest IS-KT-XXX number, and returns next.
 * Example: If IS-KT-042 exists, returns IS-KT-043
 */
export const getNextSequentialTeamId = async (
  db: Firestore,
  prefix = TEAM_ID_PREFIX
): Promise<string> => {
  try {
    const regsSnapshot = await getDocs(collection(db, "registrations"));
    
    let maxNumber = 0;
    regsSnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const teamId = data?.teamId;
      
      if (teamId && typeof teamId === "string" && teamId.startsWith(prefix)) {
        const suffix = teamId.substring(prefix.length + 1);
        const num = parseInt(suffix, 10);
        
        if (!isNaN(num) && num > maxNumber) {
          maxNumber = num;
        }
      }
    });
    
    const nextNumber = maxNumber + 1;
    const suffix = String(nextNumber).padStart(TEAM_ID_SUFFIX_LENGTH, "0");
    return `${prefix}-${suffix}`;
  } catch (error) {
    console.warn("Failed to get next sequential ID, falling back to 001", error);
    return `${prefix}-001`;
  }
};

/**
 * Derive a human-readable Team ID from Firestore auto document ID.
 * Example: aB3xYz9kLm -> IS-KT-042781
 */
export const generateTeamIdFromDocId = (docId: string, prefix = TEAM_ID_PREFIX) => {
  const compact = (docId || "").replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  let rolling = 0;

  for (let index = 0; index < compact.length; index += 1) {
    rolling = (rolling * 36 + compact.charCodeAt(index)) % 1_000_000;
  }

  const suffix = String(rolling).padStart(TEAM_ID_SUFFIX_LENGTH, "0");
  return `${prefix}-${suffix}`;
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
  const teamId = await getNextSequentialTeamId(db);

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
