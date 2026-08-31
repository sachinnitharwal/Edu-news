// 1. Initialize Supabase Connection
const SUPABASE_URL = 'https://coeemddusgoafawggwsl.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_5k4N3lBwJ8QOS7sv1y11IA_uaqWCdt1';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Map HTML list IDs to Database Categories (PURANI VALUES USE KI GAYI HAIN)
const categoryMapping = {
    'jobsList': 'jobs',
    'admitList': 'admit-cards',
    'resultList': 'results',
    'othersList': 'answer-keys',       // Name 'Others' but DB value 'answer-keys'
    'admissionList': 'admission', 
    'syllabusList': 'syllabus'         // Name 'Sarkari Yojana' but DB value 'syllabus'
};

// Main function to fetch and render data for a specific column
async function fetchAndRender(dbCategory, listElementId, stateFilter, searchQuery = '') {
    const listElement = document.getElementById(listElementId);
    listElement.innerHTML = '<li style="padding: 16px 0; font-size: 14px;">Loading...</li>';
    
    let query = supabaseClient
        .from('jobs')
        .select('*')
        .eq('category', dbCategory)
        .order('created_at', { ascending: false })
        .limit(11); 
        
    if (stateFilter !== 'all') {
        query = query.eq('state', stateFilter);
    }
    
    if (searchQuery) {
        query = query.ilike('title', `%${searchQuery}%`);
    }
    
    const { data, error } = await query;
    
    if (error) {
        console.error(`Error fetching ${dbCategory}:`, error);
        listElement.innerHTML = '<li style="padding: 16px 0; font-size: 14px; color: red;">Error loading data</li>';
        return;
    }
    
    listElement.innerHTML = ''; 
    
    if (data.length === 0) {
        listElement.innerHTML = '<li style="padding: 16px 0; font-size: 14px; color: #667085;">No updates found.</li>';
        return;
    }
    
    const hasMore = data.length > 10;
    const postsToRender = hasMore ? data.slice(0, 10) : data; 
    
    postsToRender.forEach(item => {
        const li = document.createElement('li');
        const badge = item.is_new ? '<span class="new-badge">NEW</span>' : '';
        const dateObj = new Date(item.created_at);
        const monthYear = dateObj.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

        li.innerHTML = `
            <a href="job-details.html?id=${item.id}">${item.title} ${badge}</a>
            <span class="list-date">🗓️ ${monthYear}</span>
        `;
        listElement.appendChild(li);
    });

    if (hasMore) {
        const btnLi = document.createElement('li');
        btnLi.style.textAlign = 'center';
        btnLi.style.borderBottom = 'none';
        btnLi.style.paddingTop = '12px';
        
        // Display Text Change logic
        let readableCategory = dbCategory.replace('-', ' ').toUpperCase();
        if (dbCategory === 'answer-keys') readableCategory = 'OTHERS';
        if (dbCategory === 'syllabus') readableCategory = 'SARKARI YOJANA';
        
        const pageURLs = {
            'jobs': 'latest-jobs.html',
            'admit-cards': 'admit-cards.html',
            'results': 'results.html',
            'answer-keys': 'others.html',
            'admission': 'admission.html',
            'syllabus': 'sarkari-yojana.html'
        };
        
        const targetPage = pageURLs[dbCategory] || '#';
        
        btnLi.innerHTML = `<a href="${targetPage}" class="view-all-btn">View All ${readableCategory} ➔</a>`;
        listElement.appendChild(btnLi);
    }
}

async function loadAllColumns(searchQuery = '') {
    for (const [listId, dbCategory] of Object.entries(categoryMapping)) {
        const section = document.getElementById(listId).closest('.portal-column');
        const currentStateFilter = section.querySelector('.mini-filter').value;
        await fetchAndRender(dbCategory, listId, currentStateFilter, searchQuery);
    }
}

function searchJobs() {
    const q = document.getElementById('searchInput').value.trim();
    loadAllColumns(q); 
    document.getElementById('jobs').scrollIntoView({ behavior: 'smooth' });
}

function filterCategory(selectElement) {
    const selectedState = selectElement.value;
    const section = selectElement.closest('.portal-column');
    const listId = section.querySelector('.link-list').id;
    const dbCategory = categoryMapping[listId];
    const currentSearchQuery = document.getElementById('searchInput').value.trim();
    
    fetchAndRender(dbCategory, listId, selectedState, currentSearchQuery);
}

function subscribe(e) {
    e.preventDefault();
    const email = document.getElementById('email').value;
    alert('Thanks! Email subscription received for ' + email);
    document.getElementById('email').value = ''; 
}

document.addEventListener('DOMContentLoaded', () => {
    loadAllColumns();
});

// Mobile Hamburger Menu
const hamburger = document.getElementById('hamburgerMenu');
const navMenu = document.getElementById('navMenu');

if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
        navMenu.classList.toggle('show-menu');
        if (navMenu.classList.contains('show-menu')) {
            hamburger.innerHTML = '✕';
            hamburger.style.transform = 'rotate(90deg)';
        } else {
            hamburger.innerHTML = '☰';
            hamburger.style.transform = 'rotate(0deg)';
        }
    });

    document.querySelectorAll('.menu a').forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('show-menu');
            hamburger.innerHTML = '☰';
            hamburger.style.transform = 'rotate(0deg)';
        });
    });
}

// Scroll Reveal
function reveal() {
    var reveals = document.querySelectorAll(".reveal");
    for (var i = 0; i < reveals.length; i++) {
        var windowHeight = window.innerHeight;
        var elementTop = reveals[i].getBoundingClientRect().top;
        var elementVisible = 50; 
        if (elementTop < windowHeight - elementVisible) {
            reveals[i].classList.add("active");
        }
    }
}
window.addEventListener("scroll", reveal);
reveal();
