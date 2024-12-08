const firebaseConfig = {
    apiKey: "AIzaSyDpPFlzh_lD4HsihzXOa0qyPvqQBNiN-mI",
    authDomain: "test-id-40164.firebaseapp.com",
    databaseURL: "https://test-id-40164-default-rtdb.firebaseio.com",
    projectId: "test-id-40164",
    storageBucket: "test-id-40164.firebasestorage.app",
    messagingSenderId: "644298757769",
    appId: "1:644298757769:web:27e548f74254f50a2f5858"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const provider = new firebase.auth.GoogleAuthProvider();

// Event listener for the Sign-Up button
document.querySelector('.btn_signup').addEventListener('click', () => {
    auth.signInWithPopup(provider)
        .then((result) => {
            // Successfully signed in
            const user = result.user;
            window.location.href = ('main.html')
        })
        .catch((error) => {
            // Handle errors
            console.error("Error during sign-in:", error.message);
            alert("Sign-in failed: " + error.message);
        });
});

firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        window.location.href = 'main.html'
    }
});