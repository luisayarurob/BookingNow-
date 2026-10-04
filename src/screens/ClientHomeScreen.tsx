import React, { useState } from "react";
import { ServiceSearchScreen } from "./ServiceSearchScreen";
import { ServiceDetailScreen } from "./ServiceDetailScreen";
import { BookingRegisterScreen } from "./BookingRegisterScreen";
import type { ServiceDetail } from "../types/serviceDetail";
import type { Booking } from "../types/booking";

interface ClientHomeScreenProps {
  currentCustomer?: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
}

export const ClientHomeScreen: React.FC<ClientHomeScreenProps> = ({
  currentCustomer = {
    id: "cust-101",
    name: "Jhoan Sebastián Daza",
    email: "jhoan@ejemplo.com",
    phone: "3104509876",
  },
}) => {
  const [activeView, setActiveView] = useState<"search" | "detail" | "booking">("search");
  const [selectedService, setSelectedService] = useState<ServiceDetail | null>(null);

  const handleSelectService = (service: ServiceDetail) => {
    setSelectedService(service);
    setActiveView("detail");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleStartBooking = () => {
    setActiveView("booking");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBookingSuccess = (_booking: Booking) => {
    setTimeout(() => {
      setActiveView("search");
      setSelectedService(null);
    }, 2000);
  };

  return (
    <div className="w-full pb-16">
      {activeView === "search" && (
        <ServiceSearchScreen onSelectService={handleSelectService} />
      )}

      {activeView === "detail" && selectedService && (
        <ServiceDetailScreen
          service={selectedService}
          onBack={() => setActiveView("search")}
          onStartBooking={handleStartBooking}
        />
      )}

      {activeView === "booking" && selectedService && (
        <BookingRegisterScreen
          service={selectedService}
          customerId={currentCustomer.id}
          customerName={currentCustomer.name}
          customerEmail={currentCustomer.email}
          customerPhone={currentCustomer.phone}
          onBookingSuccess={handleBookingSuccess}
          onCancel={() => setActiveView("detail")}
        />
      )}
    </div>
  );
};