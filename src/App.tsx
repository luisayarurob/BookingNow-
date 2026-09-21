import { useState } from "react";
import DemoNav from "./components/navigation/DemoNav";
import { BUSINESS_NAME } from "./config/app";
import Register from "./screens/Register";
import Login from "./screens/Login";
import BusinessRegister from "./screens/BusinessRegister";
import ServiceRegister from "./screens/ServiceRegister";
import ServiceList from "./screens/ServiceList";
import type { Role, Screen } from "./types/navigation";
import { listarServicios, obtenerMiNegocio } from "./services/apiService.ts";
import type { BusinessService } from "./services/apiService.ts";

export default function App() {
  const [screen, setScreen] = useState<Screen>("login");
  const [role, setRole] = useState<Role>("proveedor");
  const [services, setServices] = useState<BusinessService[]>([]);

  async function handleLoginSuccess(r: Role) {
    setRole(r);
    if (r === "proveedor") {
      try {
        const result = await obtenerMiNegocio();
        const businessId = result.negocio?.idNegocio || result.negocio?.id;

        if (!businessId) {
          setScreen("business-register");
          return;
        }

        localStorage.setItem("idNegocio", String(businessId));
        const businessServices = await listarServicios(businessId);
        setServices(businessServices);
        setScreen(businessServices.length ? "service-list" : "service-register");
      } catch (error) {
        console.error("No fue posible cargar el negocio del proveedor:", error);
        setScreen("business-register");
      }
    } else {
      setScreen("service-list");
    }
  }

  return (
    <div className="size-full relative">
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
        <BusinessRegister onSuccess={() => setScreen("service-register")} />
      )}
      {screen === "service-register" && (
        <ServiceRegister
          businessName={BUSINESS_NAME}
          onSuccess={() => setScreen("service-list")}
        />
      )}
      {screen === "service-list" && (
        <ServiceList
          businessName={BUSINESS_NAME}
          services={services}
          onAddService={() => setScreen("service-register")}
        />
      )}

      <DemoNav screen={screen} onNavigate={setScreen} />
    </div>
  );
}
