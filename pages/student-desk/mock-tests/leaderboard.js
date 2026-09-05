import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { collection, limit, onSnapshot, orderBy, query, where } from "firebase/firestore";
import StudentLayout from "@/layouts/StudentLayout";
import { db } from "@/firebase/config";
import { useAuth } from "@/contexts/AuthContext";

export default function MockTestLeaderboardPage() {
  const { user } = useAuth();
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, "mockAttempts"),
      orderBy("createdAt", "desc"),
      limit(200)
    );

    const unsubscribe = onSnapshot(
      q,
      (snap) => {
        setAttempts(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoading(false);
      },
      () => setLoading(false)
    );

    return () => unsubscribe();
  }, []);

  const latestTestId = attempts[0]?.testId;

  const leaderboard = useMemo(() => {
    if (!latestTestId) return [];
    return attempts
      .filter((a) => a.testId === latestTestId && Number.isFinite(Number(a.scorePct)))
      .sort((a, b) => Number(b.scorePct) - Number(a.scorePct))
      .slice(0, 25)
      .map((row, index) => ({
        rank: index + 1,
        userId: row.userId,
        score: Math.round(Number(row.scorePct)),
        isYou: row.userId === user?.uid,
      }));
  }, [attempts, latestTestId, user?.uid]);

  return (
    <StudentLayout title="Mock leaderboard">
      <div className="card p-6 md:p-8">
        <div className="flex items-center justify-between mb-6">
          <p className="text-[13px]" style={{ color: "var(--color-ink-muted)" }}>
            {latestTestId ? `Test: ${latestTestId}` : "Complete a mock test to appear on the board."}
          </p>
          <Link href="/student-desk/mock-tests" style={{ color: "var(--color-primary)", fontSize: 13 }}>
            ← All mocks
          </Link>
        </div>

        {loading && (
          <p className="text-[13px] text-center py-10" style={{ color: "var(--color-ink-faint)" }}>
            Loading leaderboard…
          </p>
        )}

        {!loading && leaderboard.length === 0 && (
          <p className="text-[13px] text-center py-10" style={{ color: "var(--color-ink-faint)" }}>
            No scores yet for the latest mock. Attempt a test to see rankings.
          </p>
        )}

        {leaderboard.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px]">
              <thead>
                <tr style={{ color: "var(--color-ink-muted)", borderBottom: "1px solid var(--color-border)" }}>
                  <th className="py-2 pr-4">Rank</th>
                  <th className="py-2 pr-4">Aspirant</th>
                  <th className="py-2">Score</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((row) => (
                  <tr
                    key={`${row.userId}-${row.rank}`}
                    style={{
                      borderBottom: "1px solid var(--color-border)",
                      background: row.isYou ? "var(--color-primary-tint)" : "transparent",
                    }}
                  >
                    <td className="py-3 pr-4 font-mono">#{row.rank}</td>
                    <td className="py-3 pr-4">
                      {row.isYou ? "You" : `Aspirant ${row.userId.slice(0, 6)}`}
                    </td>
                    <td className="py-3 font-semibold">{row.score}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </StudentLayout>
  );
}
