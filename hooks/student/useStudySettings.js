import { useCallback, useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/firebase/config";
import { useAuth } from "@/contexts/AuthContext";
import { saveStudySettings } from "@/lib/weaknessMastery";

const DEFAULT_SETTINGS = {
  dailyStudyHours: 4,
  monthlyGoals: [],
  timetable: { templateKey: "full-time", checked: {}, notes: "" },
};

export default function useStudySettings() {
  const { user } = useAuth();
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) {
      setSettings(DEFAULT_SETTINGS);
      setLoading(false);
      return undefined;
    }

    const ref = doc(db, "users", user.uid, "studySettings", "settings");
    const unsubscribe = onSnapshot(
      ref,
      (snap) => {
        if (snap.exists()) {
          setSettings({ ...DEFAULT_SETTINGS, ...snap.data() });
        } else {
          setSettings(DEFAULT_SETTINGS);
        }
        setLoading(false);
      },
      () => {
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user?.uid]);

  const updateSettings = useCallback(
    async (patch) => {
      if (!user?.uid) return;
      const merged = { ...settings, ...patch };
      await saveStudySettings(user.uid, merged);
      setSettings(merged);
    },
    [user?.uid, settings]
  );

  return { settings, loading, updateSettings };
}
