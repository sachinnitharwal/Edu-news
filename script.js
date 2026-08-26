// 1. Initialize Supabase Connection
const SUPABASE_URL = 'https://coeemddusgoafawggwsl.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_5k4N3lBwJ8QOS7sv1y11IA_uaqWCdt1';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Map HTML list IDs to Database Categories
const categoryMapping = {
    'jobsList': 'jobs',
    'admitList': 'admit-cards',
    'resultList': 'results',
    'answerList': 'answer-keys',
    'admissionList': 'admission', // NEW
    'syllabusList': 'syllabus'    // NEW
};


// Main function to fetch and render data for a specific column
async function fetchAndRender(dbCategory, listElementId, stateFilter, searchQuery = '') {
    const listElement = document.getElementById(listElementId);
    listElement.innerHTML = '<li style="padding: 14px 5px; font-size: 14px;">Loading...</li>';
    
    // Start building the query
    let query = supabaseClient
        .from('jobs')
        .select('*')
        .eq('category', dbCategory)
        .order('created_at', { ascending: false });
        
    // Apply state filter if not "all"
    if (stateFilter !== 'all') {
        query = query.eq('state', stateFilter);
    }
    
    // Apply text search if present
    if (searchQuery) {
        query = query.ilike('title', `%${searchQuery}%`);
    }
    
    const { data, error } = await query;
    
    if (error) {
        console.error(`Error fetching ${dbCategory}:`, error);
        listElement.innerHTML = '<li style="padding: 14px 5px; font-size: 14px; color: red;">Error loading data</li>';
        return;
    }
    
    listElement.innerHTML = ''; // Clear loading text
    
    // If no posts match the query/filter
    if (data.length === 0) {
        listElement.innerHTML = '<li style="padding: 14px 5px; font-size: 14px; color: #667085;">No updates found.</li>';
        return;
    }
    
    // Loop through the data and build list items
    data.forEach(item => {
        const li = document.createElement('li');
        const badge = item.is_new ? ' <span class="new-badge">NEW</span>' : '';
        // Create link passing the post ID to a details page
        li.innerHTML = `<a href="job-details.html?id=${item.id}">${item.title}${badge}</a>`;
        listElement.appendChild(li);
    });
}

// Loads all columns at once (used on page load or full search)
async function loadAllColumns(searchQuery = '') {
    for (const [listId, dbCategory] of Object.entries(categoryMapping)) {
        const section = document.getElementById(listId).closest('.portal-column');
        const currentStateFilter = section.querySelector('.mini-filter').value;
        await fetchAndRender(dbCategory, listId, currentStateFilter, searchQuery);
    }
}

// Handles the main top search bar
function searchJobs() {
    const q = document.getElementById('searchInput').value.trim();
    loadAllColumns(q); // Re-fetch all columns with the search keyword
    document.getElementById('jobs').scrollIntoView({ behavior: 'smooth' });
}

// Handles the mini dropdown filters in each column
function filterCategory(selectElement) {
    const selectedState = selectElement.value;
    const section = selectElement.closest('.portal-column');
    const listId = section.querySelector('.link-list').id;
    const dbCategory = categoryMapping[listId];
    
    const currentSearchQuery = document.getElementById('searchInput').value.trim();
    
    // Only re-fetch the specific column that was filtered
    fetchAndRender(dbCategory, listId, selectedState, currentSearchQuery);
}

// Handles the email subscription footer
function subscribe(e) {
    e.preventDefault();
    const email = document.getElementById('email').value;
    alert('Thanks! Email subscription received for ' + email);
    document.getElementById('email').value = ''; 
}

// Automatically load data when the page opens
document.addEventListener('DOMContentLoaded', () => {
    loadAllColumns();
});
// --- Mobile Hamburger Menu Logic ---
const hamburger = document.getElementById('hamburgerMenu');
const navMenu = document.getElementById('navMenu');

if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
        // Toggle the menu visibility
        navMenu.classList.toggle('show-menu');
        
        // Change icon from Hamburger (☰) to Close (✕)
        if (navMenu.classList.contains('show-menu')) {
            hamburger.innerHTML = '✕';
            hamburger.style.transform = 'rotate(90deg)';
        } else {
            hamburger.innerHTML = '☰';
            hamburger.style.transform = 'rotate(0deg)';
        }
    });

    // Close the menu automatically when any link is clicked
    document.querySelectorAll('.menu a').forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('show-menu');
            hamburger.innerHTML = '☰';
            hamburger.style.transform = 'rotate(0deg)';
        });
    });
}
