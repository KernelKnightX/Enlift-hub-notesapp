import { useEffect } from "react";
import { useRouter } from "next/router";

export default function IndiaStatesAlias() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/admin/maps/india-map');
  }, [router]);
  return null;
}
