import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";
import { getFirestore, getDoc, doc, updateDoc } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-storage.js";
const firebaseConfig = {
        apiKey: "AIzaSyBx5MoYd9YtWUQ4klpim_zjSMY1uvGlR6A",
        authDomain: "link-proyecto.firebaseapp.com",
        projectId: "link-proyecto",
        storageBucket: "link-proyecto.firebasestorage.app",
        messagingSenderId: "484177989232",
        appId: "1:484177989232:web:e7925ba0ce6841987f2eb5",
        measurementId: "G-40DEHSS2X2"
      };
      
      // Initialize Firebase
      const app = initializeApp(firebaseConfig);

  const auth = getAuth();
  const db = getFirestore();
  const storage = getStorage();

  let currentUserId = null;

  // Auth state observer
  onAuthStateChanged(auth, async (user) => {
      if (user) {
          currentUserId = user.uid;
          await loadUserData();
      } else {
          window.location.href = 'index.html';
      }
  });

  // Load user data
  async function loadUserData() {
      const docRef = doc(db, "users", currentUserId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
          const userData = docSnap.data();
          document.getElementById('loggedUserFName').textContent = userData.firstName;
          document.getElementById('loggedUserEmail').textContent = userData.email;
          
          if (userData.logo) {
              document.getElementById('logoPreview').src = userData.logo;
          }
          
          if (userData.links) {
              displayLinks(userData.links);
          }
          
          updateShareUrl();
      }
  }

  // Logo upload handler
  document.getElementById('logoUpload').addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (file) {
          const storageRef = ref(storage, `logos/${currentUserId}/${file.name}`);
          await uploadBytes(storageRef, file);
          const logoUrl = await getDownloadURL(storageRef);
          
          await updateDoc(doc(db, "users", currentUserId), {
              logo: logoUrl
          });
          
          document.getElementById('logoPreview').src = logoUrl;
      }
  });

  // Add link handler
  document.getElementById('addLinkBtn').addEventListener('click', async () => {
      const platform = document.getElementById('platformSelect').value;
      const title = document.getElementById('linkTitle').value;
      const url = document.getElementById('linkUrl').value;
      
      if (title && url) {
          const docRef = doc(db, "users", currentUserId);
          const docSnap = await getDoc(docRef);
          const userData = docSnap.data();
          const links = userData.links || [];
          
          links.push({ platform, title, url });
          await updateDoc(docRef, { links });
          
          displayLinks(links);
          clearLinkForm();
      }
  });

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

function displayLinks(links) {
    const container = document.getElementById('linksList');
    container.innerHTML = '';
    
    links.forEach((link, index) => {
        const iconClass = getIconClass(link.platform);
        const linkElement = document.createElement('div');
        linkElement.className = 'link-item';
        linkElement.innerHTML = `
            <i class="${iconClass}"></i>
            <span>${link.title}</span>
            <a href="${link.url}" target="_blank" class="link-url">${link.url}</a>
            <button class="btn-delete" onclick="deleteLink(${index})">
                <i class="fas fa-trash"></i>
            </button>
        `;
        container.appendChild(linkElement);

        // Añadir animación con delay
        setTimeout(() => {
            linkElement.style.opacity = '1';
            linkElement.style.transform = 'translateY(0)';
        }, index * 100);
    });
}

  // Copy share URL
  document.getElementById('copyLinkBtn').addEventListener('click', () => {
      const shareUrl = document.getElementById('shareUrl');
      shareUrl.select();
      document.execCommand('copy');
      alert('¡Enlace copiado!');
  });

  // Update share URL
  function updateShareUrl() {
      const baseUrl = window.location.origin;
      document.getElementById('shareUrl').value = `${baseUrl}/view.html?id=${currentUserId}`;
  }

  // Helper functions
  function clearLinkForm() {
      document.getElementById('linkTitle').value = '';
      document.getElementById('linkUrl').value = '';
  }

  // Make deleteLink available globally
  window.deleteLink = async function(index) {
      const docRef = doc(db, "users", currentUserId);
      const docSnap = await getDoc(docRef);
      const userData = docSnap.data();
      const links = userData.links || [];
      
      links.splice(index, 1);
      await updateDoc(docRef, { links });
      displayLinks(links);
  };

  const logoutButton=document.getElementById('logout');

  logoutButton.addEventListener('click',()=>{
    localStorage.removeItem('loggedInUserId');
    signOut(auth)
    .then(()=>{
        window.location.href='index.html';
    })
    .catch((error)=>{
        console.error('Error al cerrar sesión:', error);
    })
  })