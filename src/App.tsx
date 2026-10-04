import { useState } from "react";
import DemoNav from "./components/navigation/DemoNav";
import { BUSINESS_NAME } from "./config/app";
import Register from "./screens/Register";
import Login from "./screens/Login";
import BusinessRegister from "./screens/BusinessRegister";
import ServiceRegister from "./screens/ServiceRegister";
import ServiceList from "./screens/ServiceList";
import { ClientHomeScreen } from "./screens/ClientHomeScreen";
import { ResourceRegister as ResourceRegisterScreen } from "./screens/ResourceRegisterScreen";
import { EmployeeRegisterScreen } from "./screens/EmployeeRegisterScreen";
import { BusinessScheduleScreen } from "./screens/BusinessScheduleScreen";
import { ServiceAssignmentScreen } from "./screens/ServiceAssignmentScreen";
import type { Role, Screen } from "./types/navigation";

export default function App() {
  const [screen, setScreen] = useState<Screen>("login");
  const [, setRole] = useState<Role>("proveedor");

  function handleLoginSuccess(r: Role) {
    setRole(r);
    if (r === "proveedor") {
      setScreen("business-register");
    } else {
      setScreen("client-home");
    }
  }

  return (
    <div className="size-full relative min-h-screen">
      {screen === "login" && (
        <Login
          onGoRegister={() => setScreen("register")}
          onSuccess={handleLoginSuccess}
        />
      )}
      {screen === "register" && (
        <Register onGoLogin={() => setScreen("login")} />
      )}
      {screen === "business-register" && (
        <BusinessRegister onSuccess={() => setScreen("business-schedule")} />
      )}
      {screen === "business-schedule" && (
        <BusinessScheduleScreen
          businessName={BUSINESS_NAME}
          onBack={() => setScreen("business-register")}
        />
      )}
      {screen === "resource-register" && (
        <ResourceRegisterScreen businessName={BUSINESS_NAME} />
      )}
      {screen === "employee-register" && (
        <EmployeeRegisterScreen businessName={BUSINESS_NAME} />
      )}
      {screen === "service-register" && (
        <ServiceRegister
          businessName={BUSINESS_NAME}
          onSuccess={() => setScreen("service-assignment")}
        />
      )}
      {screen === "service-assignment" && (
        <ServiceAssignmentScreen
          businessName={BUSINESS_NAME}
          onSaved={() => setScreen("service-list")}
        />
      )}
      {screen === "service-list" && (
        <ServiceList
          businessName={BUSINESS_NAME}
          onAddService={() => setScreen("service-register")}
        />
      )}
      {screen === "client-home" && (
        <ClientHomeScreen />
      )}

      <DemoNav screen={screen} onNavigate={setScreen} />
    </div>
  );
}