import { z } from "zod";

export type StaffRole = "waiter" | "hookah";

export type StaffMember = {
  id: string;
  name: string;
  photoUrl?: string;
  enabled: boolean;
};

export type StaffOnShift = Record<StaffRole, StaffMember[]>;

export type CallableStaffEntry = {
  role: StaffRole;
  member: StaffMember;
};

const StaffMemberInputSchema = z.object({
  id: z.string().trim().min(1).optional(),
  name: z.string().trim().min(1),
  photoUrl: z.string().trim().optional(),
  enabled: z.boolean().optional().default(true)
});

const StaffRoleInputSchema = z.union([
  StaffMemberInputSchema,
  z.array(StaffMemberInputSchema).min(1)
]);

const StaffOnShiftInputSchema = z.object({
  waiter: StaffRoleInputSchema,
  hookah: StaffRoleInputSchema
});

const DEFAULT_STAFF: StaffOnShift = {
  waiter: [{ id: "waiter-0", name: "Waiter", enabled: true }],
  hookah: [{ id: "hookah-0", name: "Hookah master", enabled: true }]
};

export const STAFF_ROLE_LABEL: Record<StaffRole, string> = {
  waiter: "Waiters",
  hookah: "Hookah masters"
};

export const STAFF_ROLE_LABEL_SINGULAR: Record<StaffRole, string> = {
  waiter: "Waiter",
  hookah: "Hookah master"
};

function toMemberArray(
  input: z.infer<typeof StaffRoleInputSchema>,
  role: StaffRole
): StaffMember[] {
  const list = Array.isArray(input) ? input : [input];
  const usedIds = new Set<string>();

  return list.map((item, index) => {
    const baseId = item.id?.trim() || `${role}-${index}`;
    let id = baseId;
    let suffix = 1;
    while (usedIds.has(id)) {
      id = `${baseId}-${suffix}`;
      suffix += 1;
    }
    usedIds.add(id);

    return {
      id,
      name: item.name,
      photoUrl: item.photoUrl,
      enabled: item.enabled ?? true
    };
  });
}

export function getStaffOnShiftFromEnv(): StaffOnShift {
  const raw = process.env.STAFF_ON_SHIFT?.trim();
  if (!raw) return DEFAULT_STAFF;

  try {
    const parsed = StaffOnShiftInputSchema.safeParse(JSON.parse(raw));
    if (!parsed.success) return DEFAULT_STAFF;

    return {
      waiter: toMemberArray(parsed.data.waiter, "waiter"),
      hookah: toMemberArray(parsed.data.hookah, "hookah")
    };
  } catch {
    return DEFAULT_STAFF;
  }
}

export function isStaffCallable(member: StaffMember) {
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
