import { createClient } from "@supabase/supabase-js";

module.exports = {
  async init() {
    // Create a single supabase client for interacting with your database
    const supabase = createClient(
      "https://lplukctgmlugrzodcbkx.supabase.co",
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlhdCI6MTY0MTI0NzU0NiwiZXhwIjoxOTU2ODIzNTQ2fQ.aMatDY5HWuAKNkm_i__Jkud5_gUYL1bDDA85PWEwFb4"
    );

    return supabase;
  
  	type User = {
  		name: string;
  		address: string;
  	}

  	const response = await supabase
  		.from<User>('Users') // Message maps to the type of the row in your database.
  		.select('*')
  	response.data // Response data will be of type Array<Message>.
    },
};
