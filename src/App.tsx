import { useState, useEffect } from "react";
import { BUSINESS_NAME } from "./config/app";
import Register from "./screens/Register";
import Login from "./screens/Login";
import BusinessRegister from "./screens/BusinessRegister";
import ServiceRegister from "./screens/ServiceRegister";
import ServiceList from "./screens/ServiceList";
import Home from "./screens/Home";
import type { Role, Screen } from "./types/navigation";
import { listarServicios, obtenerMiNegocio } from "./services/apiService.ts";
import type { BusinessService } from "./services/apiService.ts";

export default function App() {
  const [screen, setScreen] = useState<Screen>(() => {
    return (localStorage.getItem("app_screen") as Screen) || "login";
  });
  const [role, setRole] = useState<Role>(() => {
    return (localStorage.getItem("app_role") as Role) || "proveedor";
  });
  const [services, setServices] = useState<BusinessService[]>([]);
  const [businessName, setBusinessName] = useState<string>(() => {
    return localStorage.getItem("nombreNegocio") || BUSINESS_NAME;
  });

  useEffect(() => {
    localStorage.setItem("app_screen", screen);
  }, [screen]);

  useEffect(() => {
    localStorage.setItem("app_role", role);
  }, [role]);

  useEffect(() => {
    const businessId = localStorage.getItem("idNegocio");
    if (businessId && screen === "service-list") {
      listarServicios(Number(businessId))
        .then(setServices)
        .catch(console.error);
    }
  }, [screen]);

  function handleLogout() {
    localStorage.clear();
    setServices([]);
    setScreen("login");
  }

  async function handleLoginSuccess(r: Role) {
    setRole(r);
    if (r === "proveedor") {
      try {
        const result = await obtenerMiNegocio();
        const business = result.negocio;
        const businessId = business?.idNegocio || business?.id;
        const resolvedBusinessName = business?.nombre || BUSINESS_NAME;

        setBusinessName(resolvedBusinessName);
        localStorage.setItem("nombreNegocio", resolvedBusinessName);

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
      setBusinessName(BUSINESS_NAME);
      setScreen("home");
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
      {screen === "home" && <Home onLogout={handleLogout} />}
      {screen === "register" && (
        <Register onGoLogin={() => setScreen("login")} />
      )}
      {screen === "business-register" && (
        <BusinessRegister
          onSuccess={(registeredBusinessName) => {
            const nextBusinessName = registeredBusinessName || BUSINESS_NAME;
            setBusinessName(nextBusinessName);
            localStorage.setItem("nombreNegocio", nextBusinessName);
            setScreen("service-register");
          }}
        />
      )}
      {screen === "service-register" && (
        <ServiceRegister
          businessName={businessName}
          onSuccess={() => setScreen("service-list")}
        />
      )}
      {screen === "service-list" && (
        <ServiceList
          businessName={businessName}
          services={services}
          onAddService={() => setScreen("service-register")}
          onLogout={handleLogout}
        />
      )}
    </div>
  );
}