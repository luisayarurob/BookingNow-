import { useState, useEffect } from "react";
import { BUSINESS_NAME } from "./config/app";
import Register from "./screens/Register";
import Login from "./screens/Login";
import BusinessRegister from "./screens/BusinessRegister";
import ServiceRegister from "./screens/ServiceRegister";
import ServiceList from "./screens/ServiceList";
import DemoNav from "./components/navigation/DemoNav";

import { ClientHomeScreen } from "./screens/ClientHomeScreen";
import { ResourceRegister as ResourceRegisterScreen } from "./screens/ResourceRegisterScreen";
import { EmployeeRegisterScreen } from "./screens/EmployeeRegisterScreen";
import { BusinessScheduleScreen } from "./screens/BusinessScheduleScreen";
import { ServiceAssignmentScreen } from "./screens/ServiceAssignmentScreen";

import type { Role, Screen } from "./types/navigation";
import { listarServicios, obtenerMiNegocio } from "./services/apiService";
import type { Business, BusinessService } from "./services/apiService";

export interface BusinessWithServices extends Business {
  services: BusinessService[];
}

export default function App() {
  const [screen, setScreen] = useState<Screen>(() => {
    return (localStorage.getItem("app_screen") as Screen) || "login";
  });
  const [role, setRole] = useState<Role>(() => {
    return (localStorage.getItem("app_role") as Role) || "proveedor";
  });
  const [, setServices] = useState<BusinessService[]>([]);
  const [businesses, setBusinesses] = useState<BusinessWithServices[]>([]);
  const [businessName, setBusinessName] = useState<string>(() => {
    return localStorage.getItem("nombreNegocio") || BUSINESS_NAME;
  });

  useEffect(() => {
    localStorage.setItem("app_screen", screen);
  }, [screen]);

  useEffect(() => {
    localStorage.setItem("app_role", role);
  }, [role]);

  async function loadProviderBusinesses(token: string) {
    const result = await obtenerMiNegocio(token);
    const availableBusinesses: Business[] = result.negocios?.length
      ? result.negocios
      : result.negocio
        ? [result.negocio]
        : [];

    const loadedBusinesses = await Promise.all(
      availableBusinesses.map(async (business: Business) => ({
        ...business,
        services: await listarServicios(Number(business.idNegocio || business.id), token),
      }))
    );

    setBusinesses(loadedBusinesses);
    if (loadedBusinesses[0]?.nombre) {
      setBusinessName(loadedBusinesses[0].nombre);
      localStorage.setItem("nombreNegocio", loadedBusinesses[0].nombre);
    }
    if (loadedBusinesses[0]?.idNegocio || loadedBusinesses[0]?.id) {
      localStorage.setItem("idNegocio", String(loadedBusinesses[0].idNegocio || loadedBusinesses[0].id));
    }
    setServices(loadedBusinesses[0]?.services || []);
    return loadedBusinesses;
  }

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (role === "proveedor" && token && screen === "service-list") {
      loadProviderBusinesses(token).catch((error) => {
        console.error("No fue posible restaurar los negocios del proveedor:", error);
      });
    }
  }, [role, screen]);

  async function handleLoginSuccess(r: Role) {
    setRole(r);
    if (r === "proveedor") {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No se recibió el token de autenticación.");

        const loadedBusinesses = await loadProviderBusinesses(token);
        setScreen(loadedBusinesses.length ? "service-list" : "business-register");
      } catch (error) {
        console.error("No fue posible cargar el negocio del proveedor:", error);
        setScreen("business-register");
      }
    } else {
      setBusinessName(BUSINESS_NAME);
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
        <BusinessRegister
          onSuccess={() => {
            const storedName = localStorage.getItem("nombreNegocio") || BUSINESS_NAME;
            const registeredBusinessId = Number(localStorage.getItem("idNegocio"));
            setBusinessName(storedName);
            if (registeredBusinessId > 0) {
              setBusinesses([
                {
                  idNegocio: registeredBusinessId,
                  nombre: storedName,
                  services: [],
                },
              ]);
            }
            setScreen("business-schedule");
          }}
        />
      )}
      {screen === "business-schedule" && (
        <BusinessScheduleScreen
          businessName={businessName}
          onBack={() => setScreen("business-register")}
        />
      )}
      {screen === "resource-register" && (
        <ResourceRegisterScreen businessName={businessName} />
      )}
      {screen === "employee-register" && (
        <EmployeeRegisterScreen businessName={businessName} />
      )}
      {screen === "service-register" && (
        <ServiceRegister
          businessName={businessName}
          onSuccess={() => setScreen("service-assignment")}
        />
      )}
      {screen === "service-assignment" && (
        <ServiceAssignmentScreen
          businessName={businessName}
          onSaved={() => setScreen("service-list")}
        />
      )}
      {screen === "service-list" && (
        <ServiceList
          businessName={businessName}
          onAddService={() => setScreen("service-register")}
        />
      )}

      {screen === "client-home" && <ClientHomeScreen />}

      <DemoNav screen={screen} onNavigate={setScreen} />
    </div>
  );
}