// scripts/supabase-client.js

const SUPABASE_URL = 'https://ngzfolgtdygekxzpmefk.supabase.co'; // Cole sua Project URL aqui
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5nemZvbGd0ZHlnZWt4enBtZWZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2Nzk3NjgsImV4cCI6MjA3MzI1NTc2OH0.78CLRp0Cqf-gQhWuxvnzEOSrneFpVHjL0Y7_Y4qGUpE'; // Cole sua chave anon (public) aqui

// Inicializa o cliente Supabase
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Exporta o cliente para ser usado em outros lugares
export default supabase;