import { useState, useEffect } from "react";
import { BUSINESS_NAME } from "./config/app";
import Register from "./screens/Register";
import Login from "./screens/Login";
import BusinessRegister from "./screens/BusinessRegister";
import ServiceRegister from "./screens/ServiceRegister";
import ServiceList from "./screens/ServiceList";
import DemoNav from "./components/navigation/DemoNav";
import ProviderNav from "./components/navigation/ProviderNav";
import ClientNav from "./components/navigation/ClientNav";

import { ClientHomeScreen } from "./screens/ClientHomeScreen";
import { ResourceRegister as ResourceRegisterScreen } from "./screens/ResourceRegisterScreen";
import { EmployeeRegisterScreen } from "./screens/EmployeeRegisterScreen";
import { BusinessScheduleScreen } from "./screens/BusinessScheduleScreen";
import { ServiceAssignmentScreen } from "./screens/ServiceAssignmentScreen";
import { ClientReservationsScreen } from "./screens/ClientReservationsScreen";
import { ReportsScreen } from "./screens/ReportsScreen";

import type { Role, Screen } from "./types/navigation";
import { listarServicios, obtenerMiNegocio } from "./services/apiService";
import type { Business, BusinessService } from "./services/apiService";

export interface BusinessWithServices extends Business {
  services: BusinessService[];
}

export default function App() {
  const [screen, setScreen] = useState<Screen>(() => {
    return localStorage.getItem("token")
      ? (localStorage.getItem("app_screen") as Screen) || "login"
      : "login";
  });
  const [role, setRole] = useState<Role>(() => {
    return (localStorage.getItem("app_role") as Role) || "proveedor";
  });
  const [, setServices] = useState<BusinessService[]>([]);
  const [businesses, setBusinesses] = useState<BusinessWithServices[]>([]);
  const [businessName, setBusinessName] = useState<string>(() => {
    return localStorage.getItem("nombreNegocio") || BUSINESS_NAME;
  });
  const [businessCategory, setBusinessCategory] = useState<string | undefined>();
  const [activeBusinessId, setActiveBusinessId] = useState<number>(() =>
    Number(localStorage.getItem("idNegocio")) || 0
  );

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
    setBusinessCategory(loadedBusinesses[0]?.categoria);
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

  function handleLogout() {
    localStorage.clear();
    setServices([]);
    setBusinesses([]);
    setScreen("login");
  }

  async function handleLoginSuccess(r: Role) {
    setRole(r);
    localStorage.setItem("app_role", r);
    if (r === "proveedor") {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No se recibió el token de autenticación.");

        const loadedBusinesses = await loadProviderBusinesses(token);
        setScreen(loadedBusinesses.length ? "service-list" : "business-register");
      } catch (error) {
        console.error("No fue posible cargar el negocio del proveedor:", error);
        setScreen(localStorage.getItem("token") ? "business-register" : "login");
      }
    } else if (r === "cliente") {
      setBusinessName(BUSINESS_NAME);
      setScreen("client-home");
    } else {
      setScreen("reports");
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
          onSuccess={(registeredName, registeredCategory, registeredBusinessId) => {
            const storedName = registeredName || localStorage.getItem("nombreNegocio") || BUSINESS_NAME;
            localStorage.setItem("idNegocio", String(registeredBusinessId));
            sessionStorage.setItem("createdBusinessId", String(registeredBusinessId));
            setActiveBusinessId(registeredBusinessId);
            localStorage.setItem("nombreNegocio", storedName);
            setBusinessName(storedName);
            setBusinessCategory(registeredCategory);
            if (registeredBusinessId > 0) {
              setBusinesses([
                {
                  idNegocio: registeredBusinessId,
                  nombre: storedName,
                  categoria: registeredCategory,
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
          businessId={activeBusinessId}
          onBusinessChange={(registeredBusinessId, registeredBusinessName) => {
            localStorage.setItem("idNegocio", String(registeredBusinessId));
            localStorage.setItem("nombreNegocio", registeredBusinessName);
            setActiveBusinessId(registeredBusinessId);
            setBusinessName(registeredBusinessName);
          }}
          onSaved={() => setScreen("service-list")}
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
          businessCategory={businessCategory}
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
          businesses={businesses}
          onAddBusiness={() => setScreen("business-register")}
          onAddService={(businessId: number, name: string, category?: string) => {
            localStorage.setItem("idNegocio", String(businessId));
            setBusinessName(name);
            setBusinessCategory(category);
            setServices(
              businesses.find((b) => (b.idNegocio || b.id) === businessId)?.services || []
            );
            setScreen("service-register");
          }}
        />
      )}

      {(screen === "home" || screen === "client-home") && (
        <ClientHomeScreen />
      )}
      {screen === "client-reservations" && (
        <ClientReservationsScreen view="active" onCreateReservation={() => setScreen("client-home")} />
      )}
      {screen === "client-history" && (
        <ClientReservationsScreen view="history" onCreateReservation={() => setScreen("client-home")} />
      )}
      {screen === "reports" && (role === "proveedor" || role === "administrador") && (
        <ReportsScreen />
      )}

      {!localStorage.getItem("token") && (
        <DemoNav screen={screen} onNavigate={setScreen} />
      )}
      {localStorage.getItem("token") && (role === "proveedor" || role === "administrador") && (
        <ProviderNav screen={screen} onNavigate={setScreen} onLogout={handleLogout} role={role} />
      )}
      {localStorage.getItem("token") && role === "cliente" && (
        <ClientNav screen={screen} onNavigate={setScreen} onLogout={handleLogout} />
      )}
    </div>
  );
}