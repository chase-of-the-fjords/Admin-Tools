import { query } from '@/lib/db';

// Always revalidates data when accessed.
export const revalidate = 0;

// Gets all the data from the orders database in an interval.
export async function GET (request, { params }) {
    
    // Format: 'YYYY-MM-DD:YYYY-MM-DD'
    const interval = await params.interval;
    const start_date = interval.substring(0, 10);
    const end_date = interval.substring(11, 21);

    // Gets all orders that existed during the interval
    const orders = await query ({
        // The SQL query:
        query: `SELECT * FROM orders WHERE (start <= '${end_date} 00:00:00' + INTERVAL 24 HOUR) AND ((end is NULL) OR (end >= ('${start_date} 00:00:00' - INTERVAL 5 MINUTE)))`,
        values: [],
    });

    // Returns a JSON representation of the data.
    return new Response(JSON.stringify(orders, null, 2));
}