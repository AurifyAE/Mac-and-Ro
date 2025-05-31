import { createSlice } from '@reduxjs/toolkit';

const getInitialAuthState = () => {
    const role = localStorage.getItem('role');
    return {
        isAuthenticated: !!role,
        role: role, // 'admin' or 'superadmin' or null
    };
};

const initialState = getInitialAuthState();

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        login(state, action) {
            state.isAuthenticated = true;
            state.role = action.payload;
            localStorage.setItem('role', action.payload); // persist role
        },
        logout(state) {
            state.isAuthenticated = false;
            state.role = null;
            localStorage.removeItem('role'); // remove from storage
        },
    },
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;