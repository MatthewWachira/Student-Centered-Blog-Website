import './Login.css';

function Login() {
  return (
    <div className="login-container">
      <h1>Strathmore Blog</h1>
      <h2>Member Login</h2>
      <form action="#" method="post">
        <div className="input-group">
          <label htmlFor="email">Email</label>
          <input type="email" id="email" name="email" required />
        </div>
        <div className="input-group">
          <label htmlFor="password">Password</label>
          <input type="password" id="password" name="password" required />
        </div>
        <button type="submit">Login</button>
        <p className="options">
          <a href="#">Forgot Password?</a> | <a href="#">Create Account</a>
        </p>
      </form>
    </div>
  );
}

export default Login;
