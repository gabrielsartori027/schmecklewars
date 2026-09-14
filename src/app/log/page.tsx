import type { Metadata } from "next";
import { WarLog } from "@/components/log/WarLog";

export const metadata: Metadata = { title: "War Log", alternates: { canonical: "/log" } };

export default function LogPage() {
  return <WarLog />;
}
