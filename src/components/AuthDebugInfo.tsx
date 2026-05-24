import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const AuthDebugInfo: React.FC = () => {
  console.log('AuthDebugInfo component is rendering');
  
  try {
    const { user, loading, isAdmin, logout } = useAuth();
    
    console.log('Auth state:', { user: user?.email, loading, isAdmin });

    const handleLogout = async () => {
      try {
        await logout();
        window.location.reload();
      } catch (error) {
        console.error('Error al cerrar sesión:', error);
      }
    };

    return (
      <>
        <div 
          className="fixed top-4 right-4 bg-red-500 border-4 border-yellow-400 text-white px-4 py-3 rounded max-w-sm shadow-2xl"
          style={{ 
            position: 'fixed', 
            top: '16px', 
            right: '16px', 
            zIndex: 9999,
            backgroundColor: '#ef4444',
            color: 'white',
            border: '4px solid #facc15',
            padding: '12px 16px',
            borderRadius: '8px',
            maxWidth: '384px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }}
        >
          <h3 style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '8px' }}>🔍 DEBUG AUTH INFO</h3>
          <div style={{ fontSize: '12px' }}>
            <div><strong>Loading:</strong> {String(loading)}</div>
            <div><strong>User:</strong> {user ? 'authenticated' : 'null'}</div>
            <div><strong>Email:</strong> {user?.email || 'N/A'}</div>
            <div><strong>Email Verified:</strong> {String(user?.emailVerified)}</div>
            <div><strong>UID:</strong> {user?.uid || 'N/A'}</div>
            <div><strong>IsAdmin:</strong> {String(isAdmin)}</div>
            <div><strong>Display Name:</strong> {user?.displayName || 'N/A'}</div>
            <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #facc15' }}>
              <strong>Admin Emails:</strong>
              <div style={{ fontSize: '10px', marginTop: '4px' }}>
                - diegogalmarini@gmail.com<br/>
                - admin@test.com<br/>
                - test@admin.com
              </div>
            </div>
            {user && (
              <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #facc15' }}>
                <button
                  onClick={handleLogout}
                  style={{
                    backgroundColor: '#eab308',
                    color: 'black',
                    fontSize: '12px',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontWeight: 'bold',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  Cerrar Sesión
                </button>
              </div>
            )}
          </div>
        </div>
        {/* Fallback visible element */}
        <div style={{
          position: 'fixed',
          top: '100px',
          right: '16px',
          backgroundColor: 'orange',
          color: 'black',
          padding: '8px',
          zIndex: 9999,
          fontSize: '12px'
        }}>
          DEBUG: Component Loaded
        </div>
      </>
    );
  } catch (error) {
    console.error('Error in AuthDebugInfo:', error);
    return (
      <div style={{
        position: 'fixed',
        top: '16px',
        right: '16px',
        backgroundColor: 'red',
        color: 'white',
        padding: '8px',
        zIndex: 9999
      }}>
        ERROR: {String(error)}
      </div>
    );
  }
};

export default AuthDebugInfo;