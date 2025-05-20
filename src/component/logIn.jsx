import React, { useState } from "react";
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Alert,
  Card,
} from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import axiosInstance from "../../axiosInstance";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState("login"); // "login" or "register"

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setIsLoading(true);

    try {
      const response = await axiosInstance.post(
        mode === "login" ? `/login` : `/register`,
        {
          email,
          password,
        }
      );
      console.log(response, "********login************");   
      const userEmail = response.data.email;
      const userToken = response.data.token;
      console.log("Token:", response.headers);
      const token = response.headers["authorization"];
      localStorage.setItem("token", token || userToken);
      localStorage.setItem("email", userEmail);
    } catch (err) {
      if (err.response && err.response.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container
      className="d-flex align-items-center justify-content-center"
      style={{ minHeight: "100vh" }}
    >
      <Row className="w-100">
        <Col md={{ span: 6, offset: 3 }} lg={{ span: 4, offset: 4 }}>
          <Card className="shadow">
            <Card.Body>
              <div className="text-center mb-4">
                <h2>{mode === "login" ? "Welcome Back" : "Create Account"}</h2>
                <p className="text-muted">
                  {mode === "login"
                    ? "Please sign in to continue"
                    : "Register to get started"}
                </p>
              </div>

              {error && <Alert variant="danger">{error}</Alert>}

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="formBasicEmail">
                  <Form.Label>Email address</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="Enter email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formBasicPassword">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </Form.Group>

                <div className="d-grid mb-3">
                  <Button variant="primary" type="submit" disabled={isLoading}>
                    {isLoading
                      ? mode === "login"
                        ? "Signing in..."
                        : "Registering..."
                      : mode === "login"
                      ? "Sign In"
                      : "Register"}
                  </Button>
                </div>

                <div className="text-center">
                  <Button
                    variant="link"
                    className="text-decoration-none p-0"
                    onClick={() =>
                      setMode(mode === "login" ? "register" : "login")
                    }
                  >
                    {mode === "login"
                      ? "Don't have an account? Sign up"
                      : "Already have an account? Sign in"}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default LoginPage;
