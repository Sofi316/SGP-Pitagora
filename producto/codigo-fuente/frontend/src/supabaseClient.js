import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vlxifaqppbwnuhgnnxhr.supabase.co';
const supabaseKey = 'sb_publishable_bJgfwo776NAwuQgrEi8dOQ_0It-FaXu';

export const supabase = createClient(supabaseUrl, supabaseKey);