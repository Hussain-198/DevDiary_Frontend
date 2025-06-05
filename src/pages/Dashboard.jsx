import React, { useEffect, useState, useRef } from "react";
import { Container, Card, ListGroup, Spinner } from "react-bootstrap";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useAuth } from "../context/AuthContext";

function Dashboard() {
  const { user } = useAuth();
  const [goals, setGoals] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const [newGoal, setNewGoal] = useState("");
  const [newDeadline, setNewDeadline] = useState("");

  const [editingGoalId, setEditingGoalId] = useState(null);
  const [editingGoalTitle, setEditingGoalTitle] = useState("");

  const [countdowns, setCountdowns] = useState({});
  const intervalRef = useRef(null);


  const fetchGoals = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/goals", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to fetch goals");
      }

      const data = await res.json();
      if (!Array.isArray(data)) throw new Error("Goals data is not an array");

      const today = new Date().toISOString().split("T")[0];
      const todaysGoals = data.filter(
        (goal) => goal.targetDate && goal.targetDate.slice(0, 10) >= today
      );

      setGoals(todaysGoals);
    } catch (err) {
      console.error("Failed to fetch goals:", err.message);
    }
  };


  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/tasks", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to fetch tasks");
      }

      const data = await res.json();
      if (!Array.isArray(data)) throw new Error("Tasks data is not an array");

      setTasks(data);
    } catch (err) {
      console.error("Failed to fetch tasks:", err.message);
    }
  };


  const handleAddGoal = async () => {
    if (!newGoal.trim() || !newDeadline) {
      alert("Please enter goal title and deadline");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/goals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: newGoal,
          targetDate: newDeadline,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to add goal");
      }

      const data = await res.json();
      setGoals((prev) => [...prev, data]);
      setNewGoal("");
      setNewDeadline("");
    } catch (err) {
      console.error("Failed to add goal:", err.message);
    }
  };


  const handleDeleteGoal = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await fetch(`http://localhost:5000/api/goals/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      setGoals((prev) => prev.filter((goal) => goal._id !== id));
      setCountdowns((prev) => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });
    } catch (err) {
      console.error("Failed to delete goal:", err.message);
    }
  };


  const handleUpdateGoal = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://localhost:5000/api/goals/${editingGoalId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ title: editingGoalTitle }),
        }
      );

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to update goal");
      }

      const updated = await res.json();
      setGoals((prev) =>
        prev.map((goal) => (goal._id === editingGoalId ? updated : goal))
      );
      setEditingGoalId(null);
      setEditingGoalTitle("");
    } catch (err) {
      console.error("Failed to update goal:", err.message);
    }
  };


  useEffect(() => {
    if (goals.length === 0) return;

    const updateCountdowns = () => {
      const now = new Date().getTime();
      const newCountdowns = {};

      goals.forEach((goal) => {
        if (goal.completed) {
          newCountdowns[goal._id] = "✅ Completed";
          return;
        }

        if (!goal.targetDate) {
          newCountdowns[goal._id] = "No deadline";
          return;
        }

        const targetTime = new Date(goal.targetDate).getTime();
        const diff = targetTime - now;

        if (diff <= 0) {
          newCountdowns[goal._id] = "⛔ Deadline passed";
        } else {
          const days = Math.floor(diff / (1000 * 60 * 60 * 24));
          const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
          const minutes = Math.floor((diff / (1000 * 60)) % 60);
          const seconds = Math.floor((diff / 1000) % 60);

          newCountdowns[
            goal._id
          ] = `${days}d ${hours}h ${minutes}m ${seconds}s`;
        }
      });

      setCountdowns(newCountdowns);
    };

    updateCountdowns();
    intervalRef.current = setInterval(updateCountdowns, 1000);

    return () => clearInterval(intervalRef.current);
  }, [goals]);

  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([fetchGoals(), fetchTasks()]);
      setLoading(false);
    };
    fetchData();
  }, []);


const goalStats = React.useMemo(() => {
  const completedCount = goals.filter((goal) => goal.completed).length;
  const pendingCount = goals.length - completedCount;

  return [
    { name: "Completed", count: completedCount },
    { name: "Pending", count: pendingCount },
  ];
}, [goals]);


  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center min-vh-100">
        <Spinner animation="border" />
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <h2 className="mb-4">Welcome, {user?.name || "Developer"}!</h2>


      <Card className="mb-4 p-3">
        <h4>📌 Today's Goals</h4>

        <div className="d-flex mb-3">
          <input
            type="text"
            className="form-control me-2"
            placeholder="Enter new goal"
            value={newGoal}
            onChange={(e) => setNewGoal(e.target.value)}
          />
          <input
            type="datetime-local"
            className="form-control me-2"
            value={newDeadline}
            onChange={(e) => setNewDeadline(e.target.value)}
          />
          <button className="btn btn-primary" onClick={handleAddGoal}>
            Add
          </button>
        </div>

        {goals.length > 0 ? (
          <ListGroup>
            {goals.map((goal) => (
              <ListGroup.Item
                key={goal._id}
                className="d-flex justify-content-between align-items-center"
              >
                {editingGoalId === goal._id ? (
                  <>
                    <input
                      type="text"
                      value={editingGoalTitle}
                      onChange={(e) => setEditingGoalTitle(e.target.value)}
                      className="form-control me-2"
                    />
                    <button
                      className="btn btn-success btn-sm me-2"
                      onClick={handleUpdateGoal}
                    >
                      Save
                    </button>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => setEditingGoalId(null)}
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <div>
                      <span>
                        {goal.title} -{" "}
                        {goal.completed ? "✅ Completed" : "❌ Pending"}
                      </span>
                      <br />
                      <small className="text-muted">
                        Deadline:{" "}
                        {goal.targetDate
                          ? new Date(goal.targetDate).toLocaleString()
                          : "No deadline"}
                      </small>
                      <br />
                      <small className="text-info">
                        Time Left: {countdowns[goal._id] || "Calculating..."}
                      </small>
                    </div>
                    <div>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDeleteGoal(goal._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </ListGroup.Item>
            ))}
          </ListGroup>
        ) : (
          <p className="text-muted">No goals set for today.</p>
        )}
      </Card>

      {/* Tasks Chart */}
      <Card className="p-3">
        <h4>📊 Goal Completion Overview</h4>
        {goals.length === 0 ? (
          <p className="text-muted">No goals to display.</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={goalStats}>
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#28a745" radius={[5, 5, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </Card>
    </Container>
  );
}

export default Dashboard;
