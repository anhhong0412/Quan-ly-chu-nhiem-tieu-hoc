/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://jwszourdzsmucbphrtub.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp3c3pvdXJkenNtdWNicGhydHViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODExNzc5OTksImV4cCI6MjA5Njc1Mzk5OX0.tNMO2RE3Ddf3NfeQ-ys8shL3L-AX8NmWbZVCIPaQAZU";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
