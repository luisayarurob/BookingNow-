const API_URL = "http://localhost:8080";

export async function iniciarSesion(correo, contrasena) {
    const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            correo: correo,
            contrasena: contrasena
        })
    });

    if (!response.ok) {
        throw new Error("Credenciales incorrectas");
    }

    return await response.json();
}

export async function registrarNegocio(datos) {
    const token = localStorage.getItem("token");

    if (!token) {
        throw new Error("No hay una sesión iniciada");
    }

    const response = await fetch(`${API_URL}/api/negocios`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(datos)
    });

    if (!response.ok) {
        const mensaje = await response.text();
        throw new Error(mensaje || "No se pudo registrar el negocio");
    }

    return await response.json();
}