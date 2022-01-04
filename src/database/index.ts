import { createClient } from "@supabase/supabase-js";

// Create a single supabase client for interacting with your database
const supabase = createClient(
  "https://lplukctgmlugrzodcbkx.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlhdCI6MTY0MTI0NzU0NiwiZXhwIjoxOTU2ODIzNTQ2fQ.aMatDY5HWuAKNkm_i__Jkud5_gUYL1bDDA85PWEwFb4"
);

export default supabase;
