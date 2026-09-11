exports.handler = async function(event, context) {
    // FIX 1: URL mein 'slug' add kiya gaya hai taaki naye URLs fetch ho sakein
    const SUPABASE_URL = 'https://coeemddusgoafawggwsl.supabase.co/rest/v1/jobs?select=id,slug,created_at';
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

        // FIX 2: Slug hai toh clean URL, warna purana ID wala URL (Naye Domain ke sath)
        let urls = jobs.map(job => {
            const date = new Date(job.created_at).toISOString().split('T')[0];
            const postUrl = job.slug 
                ? `https://edunaukri.in/post/${job.slug}` 
                : `https://edunaukri.in/job-details.html?id=${job.id}`;
            
            return `
                <url>
                    <loc>${postUrl}</loc>
                    <lastmod>${date}</lastmod>
                    <changefreq>weekly</changefreq>
                    <priority>0.8</priority>
                </url>`;
        }).join('');

        // FIX 3: Saare missing category pages NAYE DOMAIN ke sath add kar diye gaye hain
        const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
        <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
            <url><loc>https://edunaukri.in/</loc><changefreq>always</changefreq><priority>1.0</priority></url>
            <url><loc>https://edunaukri.in/latest-jobs.html</loc><changefreq>daily</changefreq><priority>0.9</priority></url>
            <url><loc>https://edunaukri.in/admit-cards.html</loc><changefreq>daily</changefreq><priority>0.9</priority></url>
            <url><loc>https://edunaukri.in/results.html</loc><changefreq>daily</changefreq><priority>0.9</priority></url>
            <url><loc>https://edunaukri.in/others.html</loc><changefreq>daily</changefreq><priority>0.9</priority></url>
            <url><loc>https://edunaukri.in/admission.html</loc><changefreq>daily</changefreq><priority>0.9</priority></url>
            <url><loc>https://edunaukri.in/sarkari-yojana.html</loc><changefreq>daily</changefreq><priority>0.9</priority></url>
            <url><loc>https://edunaukri.in/about.html</loc><changefreq>monthly</changefreq><priority>0.5</priority></url>
            <url><loc>https://edunaukri.in/contact.html</loc><changefreq>monthly</changefreq><priority>0.5</priority></url>
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
