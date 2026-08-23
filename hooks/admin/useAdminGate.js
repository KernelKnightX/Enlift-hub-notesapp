import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import { doc, getDoc } from "firebase/firestore";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/firebase/config";

export default function useAdminGate() {
  const router = useRouter();
  const { user, authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
      setLoading(false);
      return;
    }
    if (!user) return;

    let cancelled = false;
    (async () => {
      try {
        const snap = await getDoc(doc(db, "users", user.uid));
        if (!snap.exists() || !snap.data()?.isAdmin) {
          toast.error("Admin access required.");
          if (!cancelled) router.replace("/");
          return;
        }
        if (!cancelled) setIsAdmin(true);
      } catch (error) {
        console.error(error);
        if (!cancelled) router.replace("/");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [authLoading, router, user]);

  return { user, authLoading, loading: loading || authLoading, isAdmin };
}
