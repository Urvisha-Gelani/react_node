import React, { useEffect, useState } from "react";
import { Button, Modal, Form, Alert } from "react-bootstrap";
import { Formik, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import axiosInstance from "../../axiosInstance";
import StripeCheckoutModal from "./stripeCheckoutModel";
const Users = () => {
  const [usersData, setUsersData] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(1);
  const [payableUserId, setPayableUserId] = useState(0);

  const handleOpenPaymentModal = (id) => {
    setPaymentAmount(1);
    setPayableUserId(id);
    setShowPaymentModal(true);
  };
  const handleClosePaymentModal = () => {
    setShowPaymentModal(false);
  };
  const fetchUsers = async (pageNumber = 1) => {
    try {
      const limit = 10;
      const token = localStorage.getItem("token");
      if (!token) {
        // console.error("Token not found in localStorage");
        return;
      }
      const response = await axiosInstance.get(`/users`, {
        params: { page: pageNumber, limit },
      });

      // console.log(response);
      // const totalUsers = response.headers["total-users"];
      const totalPages = response.headers["total-pages"];
      const currentPage = response.headers["current-page"];
      // const perPage = response.headers["per-page"];
      setUsersData(response.data);
      setPage(currentPage);
      setTotalPages(totalPages);
    } catch (error) {
      // Handle error
      alert("Error fetching users", error);
      // console.error("Error fetching users:", error);
    }
  };

  useEffect(() => {
    fetchUsers(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleNext = () => {
    if (page < totalPages) {
      setPage((prev) => Number(prev) + 1);
    }
  };

  const handlePrev = () => {
    if (page > 1) {
      setPage((prev) => prev - 1);
    }
  };

  const handleAdd = () => {
    setEditingUser(null);
    setShowModal(true);
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setSelectedFiles([]);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    try {
      await axiosInstance.delete(`/users/${id}`);
      setUsersData((prevUsers) => prevUsers.filter((user) => user.id !== id));
    } catch (error) {
      alert("Error deleting user", error);
      // console.error("Error deleting user:", error);
    }
  };

  const handleCloseModal = () => setShowModal(false);

  const validationSchema = Yup.object({
    name: Yup.string().required("Name is required"),
    email: Yup.string()
      .email("Invalid email format")
      .required("Email is required"),
    age: Yup.number()
      .required("Age is required")
      .positive("Age must be a positive number")
      .min(18, "You must be at least 18 years old")
      .integer("Age must be an integer"),
  });

  const handleSubmit = async (values) => {
    const apiUrl = editingUser ? `/users/${editingUser.id}` : `/users`;
    const method = editingUser ? "patch" : "post";

    const formData = new FormData();
    formData.append("name", values.name);
    formData.append("email", values.email);
    formData.append("age", values.age);

    // 👇 Add selected files to FormData
    selectedFiles.forEach((file) => {
      formData.append("avatars", file);
    });

    try {
      const response = await axiosInstance({
        method,
        url: apiUrl,
        data: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (method === "post") {
        setUsersData([...usersData, response.data]);
      } else {
        setUsersData(
          usersData.map((user) =>
            user.id === editingUser.id ? response.data : user
          )
        );
      }
      handleCloseModal();
    } catch (err) {
      alert("Submit Error", err);
      // console.error("Submit Error:", err);
      setError(err.response?.data?.message || "Something went wrong.");
    }
  };

  const handleLogout = async () => {
    try {
      await axiosInstance.post(`/logout`, {
        email: localStorage.getItem("email"),
      });

      localStorage.removeItem("token");
    } catch (error) {
      alert("Logout failed. Please try again.", error);
      // console.error("Logout failed:", error);
    }
  };

  // const convertFilesToBase64 = (files) => {
  //   return Promise.all(
  //     Array.from(files).map((file) => {
  //       return new Promise((resolve, reject) => {
  //         const reader = new FileReader();
  //         reader.readAsDataURL(file);
  //         reader.onload = () => resolve(reader.result);
  //         reader.onerror = (error) => reject(error);
  //       });
  //     })
  //   );
  // };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center">
        <h2>Users List</h2>
        <div className="d-flex gap-2">
          <button className="btn btn-primary" onClick={handleAdd}>
            Add User
          </button>
          <button className="btn btn-danger" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
      <table className="table table-striped">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Age</th>
            <th>Avatars</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {usersData.map((user) => {
            const { id, name, email, age, avatars } = user;
            return (
              <tr key={id}>
                <td>{name}</td>
                <td>{email}</td>
                <td>{age}</td>
                <td>
                  {avatars && avatars.length > 0 ? (
                    avatars.map((avatar, index) => (
                      <img
                        key={index}
                        src={avatar}
                        alt={`Avatar ${index + 1}`}
                        style={{
                          width: "50px",
                          height: "50px",
                          objectFit: "cover",
                          marginRight: 5,
                        }}
                      />
                    ))
                  ) : (
                    <span>No Avatars</span>
                  )}
                </td>

                <td>
                  <button
                    className="btn btn-warning btn-sm me-2"
                    onClick={() => handleEdit(user)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-danger btn-sm me-2"
                    onClick={() => handleDelete(id)}
                  >
                    Delete
                  </button>
                  <button
                    className="btn btn-success btn-sm"
                    onClick={() => handleOpenPaymentModal(id)}
                  >
                    Payment
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Modal for Add/Edit User */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>{editingUser ? "Edit User" : "Add User"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          <Formik
            initialValues={{
              name: editingUser ? editingUser.name : "",
              email: editingUser ? editingUser.email : "",
              age: editingUser ? editingUser.age : "",
              // avatars: editingUser ? editingUser.avatars : [],
            }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ handleSubmit, values, handleChange, handleBlur }) => (
              <Form noValidate onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="formName">
                  <Form.Label>Name</Form.Label>
                  <Field
                    type="text"
                    name="name"
                    className="form-control"
                    value={values.name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                  <ErrorMessage
                    name="name"
                    component="div"
                    className="text-danger"
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formEmail">
                  <Form.Label>Email</Form.Label>
                  <Field
                    type="email"
                    name="email"
                    className="form-control"
                    value={values.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                  <ErrorMessage
                    name="email"
                    component="div"
                    className="text-danger"
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formAge">
                  <Form.Label>Age</Form.Label>
                  <Field
                    type="number"
                    name="age"
                    className="form-control"
                    value={values.age}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                  <ErrorMessage
                    name="age"
                    component="div"
                    className="text-danger"
                  />
                </Form.Group>

                {/* <Form.Group className="mb-3">
                    <Form.Label>Avatars</Form.Label>
                    <input
                      type="file"
                      name="avatars"
                      multiple
                      accept="image/*"
                      className="form-control"
                      onChange={async (e) => {
                        const files = e.target.files;
                        console.log(files, "*********");
                        const base64Images = await convertFilesToBase64(files);
                        // Save in state & Formik both
                        // setSelectedFiles(base64Images); // optional for preview
                        values.avatars = base64Images;
                      }}
                    />
                  </Form.Group> */}
                <Form.Group className="mb-3">
                  <Form.Label>Avatars</Form.Label>
                  <input
                    type="file"
                    name="avatars"
                    multiple
                    accept="image/*"
                    className="form-control"
                    onChange={(e) =>
                      setSelectedFiles(Array.from(e.target.files))
                    }
                  />
                </Form.Group>

                <Button type="submit" variant="primary">
                  {editingUser ? "Update User" : "Add User"}
                </Button>
              </Form>
            )}
          </Formik>
        </Modal.Body>
      </Modal>
      <div className="d-flex justify-content-between align-items-center mt-3 w-100">
        <button
          className="btn btn-secondary"
          disabled={page === 1}
          onClick={handlePrev}
        >
          Previous
        </button>
        <span>
          Page {page} of {totalPages}
        </span>
        <button
          className="btn btn-secondary"
          disabled={page === totalPages}
          onClick={handleNext}
        >
          Next
        </button>
      </div>
      {showPaymentModal && (
        <StripeCheckoutModal
          show={showPaymentModal}
          handleClose={handleClosePaymentModal}
          amount={paymentAmount}
          payableUserId={payableUserId}
        />
      )}
    </div>
  );
};

export default Users;
