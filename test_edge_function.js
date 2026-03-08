require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    console.log('Invoking function fetch_gmail_inbox...');
    try {
        const { data, error } = await supabase.functions.invoke('fetch_gmail_inbox', {
            body: { providerToken: 'dummy_token' }
        });
        console.log('Data:', data);
        console.log('Error:', error);
    } catch (err) {
        console.error('Exception:', err);
    }
}

run();
