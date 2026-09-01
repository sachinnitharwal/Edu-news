exports.handler = async function(event, context) {
    // FIX: URL mein se 'slug' hata diya gaya hai kyunki wo column abhi nahi bana hai
    const SUPABASE_URL = 'https://coeemddusgoafawggwsl.supabase.co/rest/v1/jobs?select=id,created_at';
    const SUPABASE_KEY = 'sb_publishable_5k4N3lBwJ8QOS7sv1y11IA_uaqWCdt1';

    try {
        const response = await fetch(SUPABASE_URL, {
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`
            }
        });
        
        if (!response.ok) {
            throw new Error("Database fetch error");
        }
        
        const jobs = await response.json();

        // Sirf ID use karke links banayenge
        let urls = jobs.map(job => {
            const date = new Date(job.created_at).toISOString().split('T')[0];
            return `
                <url>
                    <loc>https://edu-nuakri.netlify.app/job-details.html?id=${job.id}</loc>
                    <lastmod>${date}</lastmod>
                    <changefreq>weekly</changefreq>
                    <priority>0.8</priority>
                </url>
            `;
        }).join('');

        const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
        <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
            <url>
                <loc>https://edu-nuakri.netlify.app/</loc>
                <changefreq>always</changefreq>
                <priority>1.0</priority>
            </url>
            <url>
                <loc>https://edu-nuakri.netlify.app/about.html</loc>
                <changefreq>monthly</changefreq>
                <priority>0.5</priority>
            </url>
            <url>
                <loc>https://edu-nuakri.netlify.app/contact.html</loc>
                <changefreq>monthly</changefreq>
                <priority>0.5</priority>
            </url>
            ${urls}
        </urlset>`;

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/xml',
                'Cache-Control': 'public, max-age=0, must-revalidate'
            },
            body: sitemap
        };
    } catch (error) {
        return { statusCode: 500, body: "Error generating sitemap: " + error.message };
    }
}
