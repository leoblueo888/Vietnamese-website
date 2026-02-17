import { createClient } from '@supabase/supabase-js';

// User-provided Supabase credentials to fix the connection issue.
const supabaseUrl = 'https://cozurlqxkkppculjbnjk.supabase.co';
const supabaseKey = 'sb_publishable_MeK6qwPmetPuCIsdnn4UDg_zw964gxC';

// The createClient function initializes the connection.
// The application's error handling in userProfileService.ts will manage
// any connection issues, preventing a blank screen as requested.
export const supabase = createClient(supabaseUrl, supabaseKey);
