
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

function TasksPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [goal, setGoal] = useState(null);
  const [loading, setLoading] = useState(true);


  const [title, setTitle] = useState("");
  const [deadline, setDeadline] = useState("");


  const [deadlineChanged, setDeadlineChanged] = useState(false);


  const [changesApplied, setChangesApplied] = useState(false);


  const [showMessage, setShowMessage] = useState(false);

  const fetchGoal = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/goals/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setGoal(data);
      setTitle(data.title);
      if (data.targetDate) {
        setDeadline(new Date(data.targetDate).toISOString().slice(0, 16));
      } else {
        setDeadline("");
      }
      setDeadlineChanged(false);
    } catch (err) {
      console.error("Failed to fetch goal", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoal();
  }, []);

  const handleMarkCompleted = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/goals/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ completed: true }),
      });
      const updated = await res.json();
      setGoal(updated);
      setChangesApplied(true);
    } catch (err) {
      console.error("Failed to update goal", err.message);
    }
  };

  const handleSaveChanges = async () => {
    try {
      const token = localStorage.getItem("token");
      const updateData = { title };

      if (deadlineChanged && deadline) {
        updateData.targetDate = deadline;
      }

      const res = await fetch(`http://localhost:5000/api/goals/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      });

      const updated = await res.json();
      setGoal(updated);
      setTitle(updated.title);
      if (updated.targetDate) {
        setDeadline(new Date(updated.targetDate).toISOString().slice(0, 16));
      } else {
        setDeadline("");
      }
      setDeadlineChanged(false);
      setChangesApplied(true);
    } catch (err) {
      console.error("Failed to save changes", err.message);
    }
  };

  const handleBackToDashboard = () => {
    if (changesApplied) {
      setShowMessage(true);
      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
    } else {
      navigate("/dashboard");
    }
  };

  if (loading) return <p>Loading goal...</p>;
  if (!goal) return <p>Goal not found</p>;

  return (
    <div className="container mt-4">
      {showMessage && (
        <div className="alert alert-success" role="alert">
          Changes applied. Redirecting to dashboard...
        </div>
      )}

      <h2>
        Goal:{" "}
        <input
          type="text"
          className="form-control d-inline-block w-auto"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={goal.completed}
        />
      </h2>

      <p>Status: {goal.completed ? "✅ Completed" : "❌ Pending"}</p>

      <div className="mb-3">
        <label>Update Deadline:</label>
        <input
          type="datetime-local"
          className="form-control"
          value={deadline}
          onChange={(e) => {
            setDeadline(e.target.value);
            setDeadlineChanged(true);
          }}
          disabled={goal.completed}
        />
      </div>

      {!goal.completed && (
        <>
          <button className="btn btn-primary me-2" onClick={handleSaveChanges}>
            Save Changes
          </button>
          <button className="btn btn-success" onClick={handleMarkCompleted}>
            Mark as Completed
          </button>
        </>
      )}

      <button className="btn btn-secondary ms-2" onClick={handleBackToDashboard}>
        Back to Dashboard
      </button>
    </div>
  );
}

export default TasksPage;
