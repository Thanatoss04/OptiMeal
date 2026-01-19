import { useState } from 'react';
import { UtensilsCrossed, User, ChefHat, BarChart3, LogIn } from 'lucide-react';
import { useAuth, ROLES, ROLE_CONFIG } from '../context/AuthContext';

function LoginPage() {
    const { login } = useAuth();
    const [name, setName] = useState('');
    const [selectedRole, setSelectedRole] = useState(null);
    const [isAnimating, setIsAnimating] = useState(false);

    const handleLogin = () => {
        if (!selectedRole) return;

        setIsAnimating(true);
        setTimeout(() => {
            login(name, selectedRole);
        }, 400);
    };

    const getRoleIcon = (role) => {
        switch (role) {
            case ROLES.WAITER:
                return <UtensilsCrossed size={32} />;
            case ROLES.KITCHEN:
                return <ChefHat size={32} />;
            case ROLES.MANAGER:
                return <BarChart3 size={32} />;
            default:
                return null;
        }
    };

    return (
        <div className={`login-container ${isAnimating ? 'fade-out' : ''}`}>
            {/* Background Effects */}
            <div className="login-bg-effects">
                <div className="login-bg-gradient"></div>
                <div className="login-bg-pattern"></div>
            </div>

            {/* Login Card */}
            <div className="login-card">
                {/* Logo */}
                <div className="login-logo">
                    <UtensilsCrossed className="login-logo-icon" size={48} />
                    <h1 className="login-title">OptiMeal</h1>
                    <p className="login-subtitle">Select your role to continue</p>
                </div>

                {/* Name Input */}
                <div className="login-form">
                    <div className="input-group">
                        <label className="input-label">Your Name (Optional)</label>
                        <div className="login-input-wrapper">
                            <User size={18} className="login-input-icon" />
                            <input
                                type="text"
                                className="input login-input"
                                placeholder="Enter your name..."
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* Role Selection */}
                <div className="role-selection">
                    <label className="input-label">Select Your Role</label>
                    <div className="role-cards">
                        {Object.entries(ROLE_CONFIG).map(([role, config]) => (
                            <button
                                key={role}
                                className={`role-card ${selectedRole === role ? 'selected' : ''}`}
                                style={{ '--role-color': config.color }}
                                onClick={() => setSelectedRole(role)}
                            >
                                <div className="role-card-icon">
                                    {getRoleIcon(role)}
                                </div>
                                <div className="role-card-content">
                                    <span className="role-card-label">{config.label}</span>
                                    <span className="role-card-description">{config.description}</span>
                                </div>
                                {selectedRole === role && (
                                    <div className="role-card-check">✓</div>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Login Button */}
                <button
                    className={`btn btn-primary btn-lg btn-full login-btn ${selectedRole ? 'active' : 'disabled'}`}
                    onClick={handleLogin}
                    disabled={!selectedRole}
                >
                    <LogIn size={20} />
                    {selectedRole ? `Continue as ${ROLE_CONFIG[selectedRole].label}` : 'Select a Role'}
                </button>
            </div>

            {/* Footer */}
            <div className="login-footer">
                <p>© 2026 OptiMeal. All rights reserved.</p>
            </div>
        </div>
    );
}

export default LoginPage;
