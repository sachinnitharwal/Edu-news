exports.handler = async function(event, context) {
    // Aapka Supabase Database URL aur Key
    const SUPABASE_URL = 'https://coeemddusgoafawggwsl.supabase.co/rest/v1/jobs?select=id,slug,created_at';
    const SUPABASE_KEY = 'sb_publishable_5k4N3lBwJ8QOS7sv1y11IA_uaqWCdt1';

    try {
        // Supabase se saari jobs fetch karna
        const response = await fetch(SUPABASE_URL, {
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`
            }
        });
        
        const jobs = await response.json();

        // Har job ke liye ek URL tag banana (Slug ya ID ke sath)
        let urls = jobs.map(job => {
            const linkParam = job.slug ? `slug=${job.slug}` : `id=${job.id}`;
            const date = new Date(job.created_at).toISOString().split('T')[0];
            
            return `
                <url>
                    <loc>https://edu-nuakri.netlify.app/job-details.html?${linkParam}</loc>
                    <lastmod>${date}</lastmod>
                    <changefreq>weekly</changefreq>
                    <priority>0.8</priority>
                </url>
            `;
        }).join('');

        // Master Sitemap XML Structure
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
                'Cache-Control': 'public, max-age=0, must-revalidate' // Google hamesha fresh data dekhega
            },
            body: sitemap
        };
    } catch (error) {
        return { statusCode: 500, body: "Error generating sitemap" };
    }
}
