import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function AllTasksPage() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this goal?");
    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`https://dd-backend-m1ic.onrender.com/api/goals/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        alert("Goal deleted successfully!");
        setGoals(goals.filter(goal => goal._id !== id));
      } else {
        const errorData = await res.json();
        alert(`Failed to delete: ${errorData.error}`);
      }
    } catch (err) {
      console.error("Error deleting goal:", err.message);
      alert("An error occurred while deleting the goal.");
    }
  };

  useEffect(() => {
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
            <div className="card-body d-flex justify-content-between align-items-center">
              <div>
                <h5>{goal.title}</h5>
                <p>Status: {goal.completed ? "✅ Completed" : "❌ Pending"}</p>
              </div>
              <div>
                <button
                  className="btn btn-sm btn-primary me-2"
                  onClick={() => navigate(`/tasks/${goal._id}`)}
                >
                  View Tasks
                </button>
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => handleDelete(goal._id)}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default AllTasksPage;
