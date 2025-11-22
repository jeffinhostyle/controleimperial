// Configuração do Firebase
const firebaseConfig = {
    apiKey: "AIzaSyAov25ElXd5r8OQvoa2jYbNcWFJkG29Xxc",
    authDomain: "controle-imperial.firebaseapp.com",
    projectId: "controle-imperial",
    storageBucket: "controle-imperial.firebasestorage.app",
    messagingSenderId: "185211158628",
    appId: "1:185211158628:web:8f3efc04fe6eab95da9f71"
};

// Inicializar Firebase
try {
    firebase.initializeApp(firebaseConfig);
    console.log("Firebase inicializado com sucesso");
} catch (error) {
    console.error("Erro ao inicializar Firebase:", error);
}

const auth = firebase.auth();
const db = firebase.firestore();

// Sistema de notificações
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
        <button class="close-notification">&times;</button>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
    
    notification.querySelector('.close-notification').addEventListener('click', () => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    });
}

// Verificar se o usuário está logado
auth.onAuthStateChanged(async (user) => {
    if (user) {
        // Verificar se é administrador
        try {
            const adminSnapshot = await db.collection('admins')
                .where('email', '==', user.email)
                .get();
            
            const isAdmin = !adminSnapshot.empty;
            
            // Salvar informações no localStorage
            localStorage.setItem('userEmail', user.email);
            localStorage.setItem('isAdmin', isAdmin);
            
            // Redirecionar para o painel
            window.location.href = 'painel.html';
        } catch (error) {
            console.error("Erro ao verificar administrador:", error);
            showNotification('Erro ao verificar permissões!', 'error');
        }
    }
});

// Login
document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    auth.signInWithEmailAndPassword(email, password)
        .then(() => {
            showNotification('Login realizado com sucesso!');
        })
        .catch((error) => {
            let errorMessage = 'Erro ao fazer login: ';
            switch(error.code) {
                case 'auth/user-not-found':
                    errorMessage += 'Usuário não encontrado!';
                    break;
                case 'auth/wrong-password':
                    errorMessage += 'Senha incorreta!';
                    break;
                case 'auth/invalid-email':
                    errorMessage += 'Email inválido!';
                    break;
                case 'auth/user-disabled':
                    errorMessage += 'Usuário desativado!';
                    break;
                default:
                    errorMessage += error.message;
            }
            
            showNotification(errorMessage, 'error');
        });
});

// Registro
document.getElementById('registerForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('registerConfirmPassword').value;
    
    if (password !== confirmPassword) {
        showNotification('As senhas não coincidem!', 'error');
        return;
    }
    
    auth.createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            // Salvar informações adicionais do usuário
            return db.collection('users').doc(userCredential.user.uid).set({
                name: name,
                email: email,
                plan: 'mensal',
                expires: new Date(new Date().setMonth(new Date().getMonth() + 1)),
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        })
        .then(() => {
            showNotification('Conta criada com sucesso!');
            document.getElementById('registerScreen').style.display = 'none';
            document.getElementById('loginScreen').style.display = 'flex';
        })
        .catch((error) => {
            showNotification('Erro ao criar conta: ' + error.message, 'error');
            console.error(error);
        });
});

// Alternar entre login e registro
document.getElementById('registerLink').addEventListener('click', function(e) {
    e.preventDefault();
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('registerScreen').style.display = 'flex';
});

document.getElementById('loginLink').addEventListener('click', function(e) {
    e.preventDefault();
    document.getElementById('registerScreen').style.display = 'none';
    document.getElementById('loginScreen').style.display = 'flex';
});
