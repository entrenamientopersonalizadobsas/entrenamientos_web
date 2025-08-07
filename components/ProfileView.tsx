import React, { useState } from 'react';
import type { UserProfile } from '../types';

interface ProfileViewProps {
  profile: UserProfile;
  onUpdateProfile: (name: string, email: string) => void;
  onChangePassword: (currentPassword: string, newPassword: string) => boolean;
}

const ProfileView: React.FC<ProfileViewProps> = ({ profile, onUpdateProfile, onChangePassword }) => {
  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [profileMessage, setProfileMessage] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile(name, email);
    setProfileMessage('Perfil actualizado exitosamente.');
    setTimeout(() => setProfileMessage(''), 3000);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMessage('');

    if (newPassword !== confirmNewPassword) {
      setPasswordMessage('Las nuevas contraseñas no coinciden.');
      return;
    }
    if (newPassword.length < 4) {
      setPasswordMessage('La nueva contraseña debe tener al menos 4 caracteres.');
      return;
    }
    const success = onChangePassword(currentPassword, newPassword);
    if (success) {
      setPasswordMessage('Contraseña cambiada exitosamente.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } else {
      setPasswordMessage('La contraseña actual es incorrecta.');
    }
     setTimeout(() => setPasswordMessage(''), 3000);
  };

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-yellow-400">Perfil de Usuario</h1>

      {/* Profile Info Form */}
      <section className="bg-gray-800 p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold mb-4 text-white">Información Personal</h2>
        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Usuario</label>
            <input
              type="text"
              value={profile.username}
              disabled
              className="w-full bg-gray-700/50 border-gray-600 rounded-md p-2 text-gray-400 cursor-not-allowed"
            />
          </div>
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-400 mb-1">Nombre</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-gray-700 border-gray-600 rounded-md p-2 focus:ring-yellow-500 focus:border-yellow-500"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-400 mb-1">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-gray-700 border-gray-600 rounded-md p-2 focus:ring-yellow-500 focus:border-yellow-500"
            />
          </div>
          <div className="flex items-center justify-between">
            <button
              type="submit"
              className="bg-yellow-600 text-white font-bold py-2 px-6 rounded-lg shadow-lg hover:bg-yellow-700 transition-all"
            >
              Actualizar Perfil
            </button>
            {profileMessage && <p className="text-green-400 text-sm">{profileMessage}</p>}
          </div>
        </form>
      </section>

      {/* Change Password Form */}
      <section className="bg-gray-800 p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold mb-4 text-white">Cambiar Contraseña</h2>
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div>
            <label htmlFor="current-password" className="block text-sm font-medium text-gray-400 mb-1">Contraseña Actual</label>
            <input
              id="current-password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full bg-gray-700 border-gray-600 rounded-md p-2 focus:ring-yellow-500 focus:border-yellow-500"
            />
          </div>
          <div>
            <label htmlFor="new-password" className="block text-sm font-medium text-gray-400 mb-1">Nueva Contraseña</label>
            <input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full bg-gray-700 border-gray-600 rounded-md p-2 focus:ring-yellow-500 focus:border-yellow-500"
            />
          </div>
          <div>
            <label htmlFor="confirm-new-password" className="block text-sm font-medium text-gray-400 mb-1">Confirmar Nueva Contraseña</label>
            <input
              id="confirm-new-password"
              type="password"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              className="w-full bg-gray-700 border-gray-600 rounded-md p-2 focus:ring-yellow-500 focus:border-yellow-500"
            />
          </div>
          <div className="flex items-center justify-between">
            <button
              type="submit"
              className="bg-violet-600 text-white font-bold py-2 px-6 rounded-lg shadow-lg hover:bg-violet-700 transition-all"
            >
              Cambiar Contraseña
            </button>
            {passwordMessage && <p className={`text-sm ${passwordMessage.includes('exitosa') ? 'text-green-400' : 'text-red-400'}`}>{passwordMessage}</p>}
          </div>
        </form>
      </section>
    </div>
  );
};

export default ProfileView;
