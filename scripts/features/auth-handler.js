// scripts/features/auth-handler.js
import supabaseClient from '../lib/supabase-client.js';

export async function signUp(email, password) {
    const { data, error } = await supabaseClient.auth.signUp({ email, password });
    if (error) return { error };
    return { user: data.user };
}

export async function signIn(email, password) {
    const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
    if (error) return { error };
    return { user: data.user };
}

export async function signOut() {
    await supabaseClient.auth.signOut();
}

export async function getUser() {
    const { data, error } = await supabaseClient.auth.getUser();
    if (error) return null;
    return data.user;
}