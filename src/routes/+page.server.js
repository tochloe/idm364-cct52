import { supabase } from "$lib/supabase";

export async function load() {
  const { data } = await supabase.from("allproducts").select();
  return {
    allproducts: data ?? [],
  };
}