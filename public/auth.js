// auth.js
const auth = firebase.auth();

document.getElementById('signup-btn').addEventListener('click', () => {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  auth.createUserWithEmailAndPassword(email, password)
    .then(userCredential => {
      alert("Sign up successful!");
      console.log(userCredential.user);
      window.location.href = "index.html";
    })
    .catch(error => {
      alert("Error: " + error.message);
    });
});

document.getElementById('login-btn').addEventListener('click', () => {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  auth.signInWithEmailAndPassword(email, password)
    .then(userCredential => {
      alert("Login successful!");
      console.log(userCredential.user);
      window.location.href = "index.html";
    })
    .catch(error => {
      alert("Error: " + error.message);
    });
});
