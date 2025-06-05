import React from "react";
import { Navbar, Nav, Container, Button } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function NavigationBar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <Navbar style={{position:"fixed", top:0, width:"100%", zIndex:1}} bg="dark" variant="dark" expand="lg">
      <Container>
        <Navbar.Brand>
          DevDiary
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          {user && (
            <>
              <Nav className="me-auto">
                <Nav.Link as={Link} to="/dashboard">
                  Dashboard
                </Nav.Link>
                <Nav.Link as={Link} to="/allgoals">
                  All Goals
                </Nav.Link>
                <Nav.Link as={Link} to="/progress">
                  Progress
                </Nav.Link>
              </Nav>

              <Nav className="ms-auto align-items-center">
                <Navbar.Text className="me-3">
                  Signed in as: <span className="fw-bold">{user.name}</span>
                </Navbar.Text>
                <Button
                  variant="outline-light"
                  size="sm"
                  onClick={handleLogout}
                >
                  Logout
                </Button>
              </Nav>
            </>
          )}
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default NavigationBar;
