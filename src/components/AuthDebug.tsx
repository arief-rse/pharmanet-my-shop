import { useAuth } from '@/hooks/useAuth';

const AuthDebug = () => {
  const { user, userProfile, loading, session } = useAuth();

  return (
    <div className="fixed top-4 right-4 bg-yellow-100 border border-yellow-400 p-4 rounded-lg text-xs max-w-xs z-50">
      <h3 className="font-bold text-yellow-800 mb-2">🐛 Auth Debug</h3>
      <div className="space-y-1 text-yellow-700">
        <p><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</p>
        <p><strong>User:</strong> {user ? user.email : 'None'}</p>
        <p><strong>Session:</strong> {session ? 'Exists' : 'None'}</p>
        <p><strong>Profile:</strong> {userProfile ? 'Loaded' : 'None'}</p>
        {userProfile && (
          <>
            <p><strong>Role:</strong> {userProfile.role || 'None'}</p>
            <p><strong>Name:</strong> {userProfile.full_name || 'None'}</p>
            <p><strong>Approved:</strong> {userProfile.is_approved ? 'Yes' : 'No'}</p>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthDebug; 