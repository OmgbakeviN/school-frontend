import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { store } from "./app/store";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import "./index.css";
import Protected from "./components/Protected";
import RegistrarHome from "./pages/registrar/RegistrarHome";
import YearsTerms from "./pages/registrar/YearsTerms";
import SubjectsMaster from "./pages/registrar/SubjectsMaster";
import Classes from "./pages/registrar/Classes";
import Students from "./pages/registrar/Students";
import Enrollments from "./pages/registrar/Enrollments";
import EnrollmentSubjects from "./pages/registrar/EnrollmentSubjects";
import TeacherHome from "./pages/teacher/TeacherHome";
import MyAssignments from "./pages/teacher/MyAssignments";
import GradeEditor from "./pages/teacher/GradeEditor";

const router = createBrowserRouter([
  { path: "/", element: <LoginPage /> },
  { path: "/dashboard", element: <Dashboard /> },
  {
    path: "/registrar",
    element: <Protected roles={["REGISTRAR","ADMIN","PRINCIPAL"]}><RegistrarHome/></Protected>,
    children: [
      { path: "years", element: <YearsTerms/> },
      { path: "subjects", element: <SubjectsMaster/> },
      { path: "classes", element: <Classes/> },
      { path: "students", element: <Students/> },
      { path: "enrollments", element: <Enrollments/> },
      { path: "enrollment-subjects", element: <EnrollmentSubjects/> },
    ]
  },
  {
    path: "/teacher",
    element: <Protected roles={["TEACHER","ADMIN","PRINCIPAL"]}><TeacherHome/></Protected>,
    children: [
      { path: "assignments", element: <MyAssignments/> },
      { path: "grade", element: <GradeEditor/> },
    ]
  }
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </React.StrictMode>
);
