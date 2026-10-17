// Supabase browser client — project URL/key and category values are preserved.
const SUPABASE_URL = 'https://coeemddusgoafawggwsl.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_5k4N3lBwJ8QOS7sv1y11IA_uaqWCdt1';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const categoryMapping = {
  jobsList: 'jobs',
  admitList: 'admit-cards',
  resultList: 'results',
  othersList: 'answer-keys',
  admissionList: 'admission',
  syllabusList: 'syllabus'
};

const categoryLabels = {
  jobs: 'Job Notification',
  'admit-cards': 'Admit Card',
  results: 'Result',
  'answer-keys': 'Others',
  admission: 'Admission',
  syllabus: 'Govt Scheme'
};
const pageURLs = {
  jobs: 'latest-jobs.html',
  'admit-cards': 'admit-cards.html',
  results: 'results.html',
  'answer-keys': 'answer-keys.html',
  admission: 'admission.html',
  syllabus: 'sarkari-yojana.html'
};

function detailUrl(item) {
  return item.slug ? `/post/${encodeURIComponent(item.slug)}` : `job-details.html?id=${encodeURIComponent(item.id)}`;
}

function createPostRow(item, includeCategory = false) {
  const li = document.createElement('li');
  const link = document.createElement('a');
  link.href = detailUrl(item);
  link.className = 'post-title';
  link.append(document.createTextNode(item.title || 'Untitled notification'));
  if (item.is_new) {
    const badge = document.createElement('span');
    badge.className = 'new-badge';
    badge.textContent = 'NEW';
    link.append(' ', badge);
  }
  const meta = document.createElement('span');
  meta.className = 'list-date';
  const date = new Date(item.created_at);
  meta.textContent = Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
  if (includeCategory) {
    li.classList.add('update-card');
    const category = document.createElement('span');
    category.className = 'update-category';
    category.textContent = categoryLabels[item.category] || item.category || 'Update';
    li.append(category, link);

    const parsedContent = new DOMParser().parseFromString(item.content_html || '', 'text/html');
    parsedContent.querySelectorAll('script, style, iframe').forEach(node => node.remove());
    const summaryText = (parsedContent.body.textContent || '').replace(/\s+/g, ' ').trim();
    if (summaryText) {
      const summary = document.createElement('p');
      summary.className = 'update-summary';
      summary.textContent = summaryText.length > 118 ? `${summaryText.slice(0, 115).trimEnd()}…` : summaryText;
      li.append(summary);
    }

    const footer = document.createElement('div');
    footer.className = 'update-meta';
    footer.append(meta);
    const readMore = document.createElement('a');
    readMore.href = link.href;
    readMore.className = 'update-readmore';
    readMore.textContent = 'Read More →';
    footer.append(readMore);
    li.append(footer);
  } else {
    li.append(link, meta);
  }
  return li;
}

function showMessage(list, text, type = 'empty') {
  list.replaceChildren();
  const li = document.createElement('li');
  li.className = `list-message ${type}`;
  li.textContent = text;
  if (type === 'error') {
    const retry = document.createElement('button');
    retry.type = 'button';
    retry.className = 'retry-button';
    retry.textContent = 'Try again';
    retry.addEventListener('click', () => loadAllColumns(document.getElementById('searchInput').value.trim()));
    li.append(' ', retry);
  }
  list.append(li);
}

async function fetchAndRender(dbCategory, listElementId, stateFilter = 'all', searchQuery = '', categoryFilter = 'all') {
  const list = document.getElementById(listElementId);
  if (!list) return;
  list.classList.add('is-loading');
  showMessage(list, 'अपडेट लोड हो रहे हैं…', 'loading');

  let query = supabaseClient.from('jobs').select('*').eq('category', dbCategory)
    .order('created_at', { ascending: false }).limit(6);
  if (stateFilter !== 'all') query = query.eq('state', stateFilter);
  if (searchQuery) query = query.ilike('title', `%${searchQuery}%`);
  if (categoryFilter !== 'all' && categoryFilter !== dbCategory) {
    showMessage(list, 'इस श्रेणी में कोई अपडेट नहीं मिला।');
    list.classList.remove('is-loading');
    return;
  }

  const { data, error } = await query;
  list.classList.remove('is-loading');
  if (error) {
    console.error(`Error fetching ${dbCategory}:`, error);
    showMessage(list, 'अपडेट लोड नहीं हो सके।', 'error');
    return;
  }
  list.replaceChildren();
  const posts = (data || []).slice(0, 5);
  if (!posts.length) {
    showMessage(list, searchQuery ? 'आपकी खोज से मेल खाती पोस्ट नहीं मिली।' : 'अभी कोई अपडेट उपलब्ध नहीं है।');
    return;
  }
  posts.forEach(item => list.append(createPostRow(item)));
  if ((data || []).length > 5) {
    const moreRow = document.createElement('li');
    moreRow.className = 'view-all-row';
    const more = document.createElement('a');
    more.href = pageURLs[dbCategory];
    more.className = 'view-all-btn';
    more.textContent = `View All ${categoryLabels[dbCategory]} →`;
    moreRow.append(more);
    list.append(moreRow);
  }
}

async function loadLatestUpdates(searchQuery = '') {
  const list = document.getElementById('latestUpdatesList');
  if (!list) return;
  list.classList.add('is-loading');
  showMessage(list, 'नए अपडेट लोड हो रहे हैं…', 'loading');
  let query = supabaseClient.from('jobs').select('*').order('created_at', { ascending: false }).limit(4);
  if (searchQuery) query = query.ilike('title', `%${searchQuery}%`);
  const { data, error } = await query;
  list.classList.remove('is-loading');
  if (error) {
    console.error('Error fetching latest updates:', error);
    showMessage(list, 'नए अपडेट लोड नहीं हो सके।', 'error');
    return;
  }
  list.replaceChildren();
  if (!data || !data.length) {
    showMessage(list, searchQuery ? 'आपकी खोज से मेल खाती पोस्ट नहीं मिली।' : 'अभी कोई अपडेट उपलब्ध नहीं है।');
    return;
  }
  data.forEach(item => list.append(createPostRow(item, true)));
}

async function loadAllColumns(searchQuery = '') {
  const categoryFilter = document.getElementById('category').value;
  await Promise.all(Object.entries(categoryMapping).map(([listId, dbCategory]) => {
    const section = document.getElementById(listId)?.closest('.portal-column');
    if (section) section.hidden = categoryFilter !== 'all' && dbCategory !== categoryFilter;
    const state = section?.querySelector('.mini-filter')?.value || 'all';
    return fetchAndRender(dbCategory, listId, state, searchQuery, categoryFilter);
  }));
  await loadLatestUpdates(searchQuery);
}

function searchJobs() {
  loadAllColumns(document.getElementById('searchInput').value.trim());
  document.getElementById('latest-updates').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function filterCategory(selectElement) {
  const section = selectElement.closest('.portal-column');
  const listId = section.querySelector('.link-list').id;
  const query = document.getElementById('searchInput').value.trim();
  fetchAndRender(categoryMapping[listId], listId, selectElement.value, query, document.getElementById('category').value);
}

function subscribe(event) {
  event.preventDefault();
  const email = document.getElementById('email').value;
  alert('Thanks! Email subscription received for ' + email);
  document.getElementById('email').value = '';
}
window.searchJobs = searchJobs;
window.filterCategory = filterCategory;
window.subscribe = subscribe;

document.addEventListener('DOMContentLoaded', () => {
  loadAllColumns();
  const searchInput = document.getElementById('searchInput');
  const categorySelect = document.getElementById('category');
  searchInput.addEventListener('keydown', event => {
    if (event.key === 'Enter') searchJobs();
  });
  categorySelect.addEventListener('change', () => loadAllColumns(searchInput.value.trim()));

  const hamburger = document.getElementById('hamburgerMenu');
  const navMenu = document.getElementById('navMenu');
  if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
      const expanded = navMenu.classList.toggle('show-menu');
      hamburger.textContent = expanded ? '×' : '☰';
      hamburger.setAttribute('aria-expanded', String(expanded));
    });
    navMenu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
      navMenu.classList.remove('show-menu');
      hamburger.textContent = '☰';
      hamburger.setAttribute('aria-expanded', 'false');
    }));
  }
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('active');
      observer.unobserve(entry.target);
    }
  }), { threshold: 0.08 });
  document.querySelectorAll('.reveal').forEach(element => observer.observe(element));
});
