import { Navigate, Route, Routes } from "react-router-dom";
import { ProjectProvider } from "./context/ProjectContext";
import ExecutivePage from "./pages/ExecutivePage";
import DisplayPage from "./pages/DisplayPage";

function App() {
  return (
    <Routes>
      <Route
        path="/executive"
        element={
          <ProjectProvider>
            <ExecutivePage />
          </ProjectProvider>
        }
      />
      <Route
        path="/display"
        element={
          <ProjectProvider>
            <DisplayPage />
          </ProjectProvider>
        }
      />
      <Route path="*" element={<Navigate to="/executive" replace />} />
    </Routes>
  );
}

export default App;
