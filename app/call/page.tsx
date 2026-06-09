import CallStaffForm from "./CallStaffForm";
import {
  getCallableStaff,
  getStaffOnShiftFromEnv,
  parseTableParam
} from "@/lib/staff";

type CallPageProps = {
  searchParams: Promise<{ table?: string | string[] }>;
};

export default async function CallPage({ searchParams }: CallPageProps) {
  const params = await searchParams;
  const table = parseTableParam(params.table);
  const staff = getStaffOnShiftFromEnv();
  const callableStaff = getCallableStaff(staff);

  return <CallStaffForm table={table} callableStaff={callableStaff} />;
}
