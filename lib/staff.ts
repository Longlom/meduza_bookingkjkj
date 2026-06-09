import {
  fetchStaffFromSheet,
  getStaffSheetConfigFromEnv
} from "@/lib/staffSheet";

export type StaffRole = "waiter" | "hookah";

export type StaffMember = {
  id: string;
  name: string;
  photoUrl?: string;
  enabled: boolean;
  /** Built-in “any available” slot — not a specific person. */
  generic?: boolean;
};

export type StaffOnShift = Record<StaffRole, StaffMember[]>;

export type CallableStaffEntry = {
  role: StaffRole;
  member: StaffMember;
};

const EMPTY_STAFF: StaffOnShift = {
  waiter: [],
  hookah: []
};

export const GENERIC_STAFF_ID: Record<StaffRole, string> = {
  waiter: "_any_waiter",
  hookah: "_any_hookah"
};

export function isGenericStaffId(staffId: string) {
  return (
    staffId === GENERIC_STAFF_ID.waiter || staffId === GENERIC_STAFF_ID.hookah
  );
}

export function createGenericStaffMember(role: StaffRole): StaffMember {
  return {
    id: GENERIC_STAFF_ID[role],
    name: role === "waiter" ? "Waiter" : "Hookah master",
    enabled: true,
    generic: true
  };
}

/** Always prepend one generic waiter + hookah master (any free staff can respond). */
export function withGenericStaff(staff: StaffOnShift): StaffOnShift {
  const mergeRole = (role: StaffRole) => {
    const named = staff[role].filter(
      (m) => !m.generic && m.id !== GENERIC_STAFF_ID[role]
    );
    return [createGenericStaffMember(role), ...named];
  };

  return {
    waiter: mergeRole("waiter"),
    hookah: mergeRole("hookah")
  };
}

export const STAFF_ROLE_LABEL: Record<StaffRole, string> = {
  waiter: "Waiters",
  hookah: "Hookah masters"
};

export const STAFF_ROLE_LABEL_SINGULAR: Record<StaffRole, string> = {
  waiter: "Waiter",
  hookah: "Hookah master"
};

/** Load named staff from Google Sheet; generic call buttons are always added. */
export async function getStaffOnShift(): Promise<StaffOnShift> {
  const config = getStaffSheetConfigFromEnv();
  if (!config) {
    return withGenericStaff(EMPTY_STAFF);
  }

  const fromSheet = await fetchStaffFromSheet(config);
  return withGenericStaff(fromSheet ?? EMPTY_STAFF);
}

export function isStaffCallable(member: StaffMember) {
  if (member.generic) return true;
  return member.enabled && member.name.trim().length > 0;
}

export function getCallableStaff(staff: StaffOnShift): CallableStaffEntry[] {
  const entries: CallableStaffEntry[] = [];
  for (const role of ["waiter", "hookah"] as const) {
    for (const member of staff[role]) {
      if (isStaffCallable(member)) {
        entries.push({ role, member });
      }
    }
  }
  return entries;
}

export function findCallableMember(
  staff: StaffOnShift,
  role: StaffRole,
  staffId: string
) {
  if (isGenericStaffId(staffId) && staffId === GENERIC_STAFF_ID[role]) {
    return createGenericStaffMember(role);
  }

  const member = staff[role].find((m) => m.id === staffId);
  if (!member || !isStaffCallable(member)) return null;
  return member;
}

export function parseTableParam(value: string | string[] | undefined) {
  const raw = Array.isArray(value) ? value[0] : value;
  const table = raw?.trim();
  if (!table || !/^[a-zA-Z0-9]{1,12}$/.test(table)) return null;
  return table;
}
