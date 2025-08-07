import React, { useState } from 'react';

interface LoginViewProps {
  onLogin: (username: string, password: string) => boolean;
  onRegister: (username: string, password: string, email: string) => boolean;
}

const LoginView: React.FC<LoginViewProps> = ({ onLogin, onRegister }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isLogin) {
      if (!onLogin(username, password)) {
        setError('Usuario o contraseña incorrectos.');
      }
    } else {
      if (!/\S+@\S+\.\S+/.test(email)) {
        setError('Por favor, introduce un email válido.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Las contraseñas no coinciden.');
        return;
      }
      if (password.length < 4) {
        setError('La contraseña debe tener al menos 4 caracteres.');
        return;
      }
      if (!onRegister(username, password, email)) {
        setError('El nombre de usuario ya existe.');
      }
    }
  };
  
  const toggleForm = () => {
    setIsLogin(!isLogin);
    setError('');
    setUsername('');
    setPassword('');
    setEmail('');
    setConfirmPassword('');
  };


  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <div className="w-full max-w-md p-8 space-y-8 bg-gray-800 rounded-lg shadow-lg">
        <div>
           <h1 className="text-4xl font-bold text-center tracking-tight">
                <span className="text-white">CUR</span><span className="text-yellow-400">MOVE</span>
            </h1>
          <h2 className="mt-6 text-center text-2xl font-extrabold text-white">
            {isLogin ? 'Inicia sesión en tu cuenta' : 'Crea una nueva cuenta'}
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="username-input" className="sr-only">Usuario</label>
              <input
                id="username-input"
                name="username"
                type="text"
                autoComplete="username"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-600 bg-gray-700 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 focus:z-10 sm:text-sm rounded-t-md"
                placeholder="Usuario"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
             {!isLogin && (
              <div>
                <label htmlFor="email-input" className="sr-only">Email</label>
                <input
                  id="email-input"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-600 bg-gray-700 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 focus:z-10 sm:text-sm"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            )}
            <div>
              <label htmlFor="password-input" className="sr-only">Contraseña</label>
              <input
                id="password-input"
                name="password"
                type="password"
                autoComplete={isLogin ? "current-password" : "new-password"}
                required
                className={`appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-600 bg-gray-700 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 focus:z-10 sm:text-sm ${isLogin ? 'rounded-b-md' : ''}`}
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {!isLogin && (
              <div>
                <label htmlFor="confirm-password-input" className="sr-only">Confirmar Contraseña</label>
                <input
                  id="confirm-password-input"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-600 bg-gray-700 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 focus:z-10 sm:text-sm rounded-b-md"
                  placeholder="Confirmar Contraseña"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            )}
          </div>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 focus:ring-offset-gray-800"
            >
              {isLogin ? 'Iniciar Sesión' : 'Registrarse'}
            </button>
          </div>
        </form>
        <div className="text-sm text-center">
          <button
            onClick={toggleForm}
            className="font-medium text-yellow-500 hover:text-yellow-400"
          >
            {isLogin ? '¿No tienes una cuenta? Regístrate' : '¿Ya tienes una cuenta? Inicia sesión'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginView;
