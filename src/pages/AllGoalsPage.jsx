
import React, { useEffect, useState } from "react";

function AllTasksPage() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGoals = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("https://dd-backend-m1ic.onrender.com/api/goals", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setGoals(data);
      } catch (err) {
        console.error("Failed to fetch goals", err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchGoals();
  }, []);

  if (loading) return <p>Loading all goals and tasks...</p>;

  return (
    <div className="container mt-4">
      <h2>All Goals and Their Tasks</h2>
      {goals.length === 0 ? (
        <p>No goals found.</p>
      ) : (
        goals.map((goal) => (
          <div key={goal._id} className="card mb-3">
            <div className="card-body">
              <h5>{goal.title}</h5>
              <p>Status: {goal.completed ? "✅" : "❌"}</p>
              <a href={`/tasks/${goal._id}`} className="btn btn-sm btn-primary">
                View Goal Tasks
              </a>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default AllTasksPage;
