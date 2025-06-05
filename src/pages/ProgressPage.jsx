import React, { useEffect, useState } from "react";
import { Container, Card, ProgressBar } from "react-bootstrap";

function ProgressPage() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);


  const isThisWeek = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    return date >= startOfWeek && date <= endOfWeek;
  };

  const isThisMonth = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  };

  useEffect(() => {
    const fetchGoals = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("https://dd-backend-m1ic.onrender.com/api/goals", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setGoals(data);
      } catch (error) {
        console.error("Failed to fetch goals", error);
      } finally {
        setLoading(false);
      }
    };
    fetchGoals();
  }, []);

  if (loading) return <p>Loading progress...</p>;
  if (goals.length === 0) return <p>No goals found.</p>;

  const totalGoals = goals.length;
  const completedGoals = goals.filter((g) => g.completed).length;
  const pendingGoals = goals.filter((g) => !g.completed).length;


  const completedThisWeek = goals.filter(
    (g) => g.completed && g.completedAt && isThisWeek(g.completedAt)
  ).length;

  const completedThisMonth = goals.filter(
    (g) => g.completed && g.completedAt && isThisMonth(g.completedAt)
  ).length;


  const completedGoalsWithDates = goals.filter(
    (g) => g.completed && g.completedAt && g.createdAt
  );

  const avgDaysToComplete =
    completedGoalsWithDates.length > 0
      ? (
          completedGoalsWithDates.reduce((sum, g) => {
            const created = new Date(g.createdAt);
            const completed = new Date(g.completedAt);
            return sum + (completed - created) / (1000 * 60 * 60 * 24);
          }, 0) / completedGoalsWithDates.length
        ).toFixed(1)
      : "N/A";

  let message = "Keep going! Every step counts.";
  const progressPercent = Math.round((completedGoals / totalGoals) * 100);

  if (progressPercent === 100) {
    message = "Awesome! You completed all your goals 🎉";
  } else if (progressPercent >= 75) {
    message = "Great job! You're almost there.";
  } else if (progressPercent >= 50) {
    message = "Good progress! Keep pushing.";
  } else if (progressPercent >= 25) {
    message = "You're getting started. Stay consistent.";
  }

  return (
    <Container className="mt-4">
      <Card className="p-4">
        <h2>Motivational Progress Summary</h2>
        <p>Total Goals: {totalGoals}</p>
        <p>Completed Goals: {completedGoals}</p>
        <p>Pending Goals: {pendingGoals}</p>
        <p>Completed This Week: {completedThisWeek}</p>
        <p>Completed This Month: {completedThisMonth}</p>
        <p>Average Days to Complete Goals: {avgDaysToComplete}</p>

        <ProgressBar
          now={progressPercent}
          label={`${progressPercent}% Completed`}
          className="mt-3"
        />

        <h5 className="mt-4 text-primary">{message}</h5>
      </Card>
    </Container>
  );
}

export default ProgressPage;
