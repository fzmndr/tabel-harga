async function loginAdmin(event) {
  event.preventDefault();

  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value.trim();

  if (!email || !password) {
    alert("Email dan password wajib diisi.");
    return;
  }

  const { data, error } = await supabaseClient.auth.signInWithPassword({
    email: email,
    password: password
  });

  if (error) {
    alert("Login gagal: " + error.message);
    return;
  }

  window.location.href = "index.html";
}

async function cekLogin() {
  const { data, error } = await supabaseClient.auth.getSession();

  if (error || !data.session) {
    window.location.href = "login.html";
    return;
  }
}

async function logoutAdmin() {
  const { error } = await supabaseClient.auth.signOut();

  if (error) {
    alert("Logout gagal: " + error.message);
    return;
  }

  window.location.href = "login.html";
}