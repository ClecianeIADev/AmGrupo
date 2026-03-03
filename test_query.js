import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
    const { data, error } = await supabase
        .from('opportunities')
        .select(`
      id,
      stage,
      client:clients(id, name, address, onde_esta),
      opportunity_origins(lead_origins(*)),
      opportunity_tags(tags(*))
    `)
        .limit(1);

    console.log(JSON.stringify(data, null, 2));
    console.log('Error:', error);
}

test();
