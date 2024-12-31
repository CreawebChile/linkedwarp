import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { getFirestore, getDoc, doc } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyBx5MoYd9YtWUQ4klpim_zjSMY1uvGlR6A",
    authDomain: "link-proyecto.firebaseapp.com",
    projectId: "link-proyecto",
    storageBucket: "link-proyecto.firebasestorage.app",
    messagingSenderId: "484177989232",
    appId: "1:484177989232:web:e7925ba0ce6841987f2eb5",
    measurementId: "G-40DEHSS2X2"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore();

async function loadUserProfile() {
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('id');

    if (!userId) {
        document.body.innerHTML = '<h1>Perfil no encontrado</h1>';
        return;
    }

    try {
        const docRef = doc(db, "users", userId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const userData = docSnap.data();
            
            // Actualizar nombre y logo
            document.getElementById('userName').textContent = userData.firstName;
            if (userData.logo) {
                document.getElementById('userLogo').src = userData.logo;
            }

            // Mostrar enlaces
            if (userData.links && userData.links.length > 0) {
                const container = document.getElementById('linksContainer');
                userData.links.forEach((link, index) => {
                    const linkElement = document.createElement('a');
                    linkElement.href = link.url;
                    linkElement.target = "_blank";
                    linkElement.className = 'link-button';
                    linkElement.style.animationDelay = `${index * 0.1}s`;
                    
                    // Obtener el ícono correcto según la plataforma
                    const iconClass = getIconClass(link.platform);
                    
                    linkElement.innerHTML = `
                        <i class="${iconClass}"></i>
                        <span>${link.title}</span>
                    `;
                    container.appendChild(linkElement);
                });
            }
        } else {
            document.body.innerHTML = '<h1>Perfil no encontrado</h1>';
        }
    } catch (error) {
        console.error("Error loading profile:", error);
        document.body.innerHTML = '<h1>Error al cargar el perfil</h1>';
    }
}

function getIconClass(platform) {
    const iconMap = {
        whatsapp: 'fab fa-whatsapp',
        instagram: 'fab fa-instagram',
        facebook: 'fab fa-facebook',
        twitter: 'fab fa-x-twitter',
        youtube: 'fab fa-youtube',
        linkedin: 'fab fa-linkedin',
        github: 'fab fa-github',
        custom: 'fas fa-globe'
    };
    return iconMap[platform] || iconMap.custom;
}

// Cargar perfil cuando se carga la página
document.addEventListener('DOMContentLoaded', loadUserProfile);
