import { json } from '@sveltejs/kit';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import { createClient } from '@supabase/supabase-js';

// Create Supabase client
const supabase = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY);

// GET request handler
export async function GET() {
    try {
        // Fetch all products from Supabase
        const { data, error } = await supabase
            .from('allproducts')
            .select('*');

        // Handle errors
        if (error) {
            console.error('Supabase error:', error);
            return json(
                { error: 'Failed to fetch products', details: error.message },
                { status: 500 }
            );
        }

        // Return products as JSON
        return json({
            success: true,
            count: data.length,
            products: data
        });

    } catch (err) {
        console.error('API error:', err);
        return json(
            { error: 'Internal server error', details: err.message },
            { status: 500 }
        );
    }
}