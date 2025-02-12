// Declare all the global variables here
const searchForm = document.getElementById('search-form');
const cookieModal = document.getElementById('cookie-modal');
const cookieBtn = document.getElementById('cookie-accept');
const loader = document.getElementById("loader");
const formPreference = document.getElementById('PREFERENCE');
const listings = document.getElementById("listings");
const listingHeading = document.getElementById("listing-heading");
const backToTopBtn = document.getElementById("btn-back-to-top");

window.onload = async () => {
    let contentType = getItemFromLocalStorage('content'); // Get content type from local storage

    // If url contains id of a job or internship, then change content type accordingly
    if (location.hash !== '') {
        if (!location.hash.includes('#listings')) contentType = location.hash.includes('#internship') ? 'internships' : 'jobs';
    }

    await changeContent(contentType); // Change content type

    let cookieConsent = getItemFromLocalStorage('cookie-accept'); // Get cookie consent from local storage
    if (JSON.parse(cookieConsent)) {
        cookieModal.classList.add('hidden');
    }

    // if url contains id of a job or internship, then scroll to that job or internship
    if (location.hash !== '') {
        document.getElementById(location.hash.replace('#', '')).scrollIntoView();
    }
}

// When the user scrolls down 20px from the top of the document, show the bottom to top button
window.onscroll = function () {
    scrollFunction();
};

// Job card html content generator
const jobsContentHtml = (job, id) => {
    let contentType = getItemFromLocalStorage('content');

    contentType = contentType === 'internships' ? 'internship' : 'job';

    let tags = '';

    job.tags.forEach(tag => {
        let tagBtn = `<button
        class="bg-transparent mb-2 mr-1 hover:bg-black text-xs text-black font-semibold hover:text-white py-2 px-4 border border-black hover:border-transparent rounded-full">
        ${tag}
        </button>`;

        tags += tagBtn;
    })

    let content = `<div class="main-card shadow border border-gray-900 my-5 rounded-lg" id=${contentType}-${id}>
    <div class="card shadow py-5 rounded-t-lg rounded-l-none  border-b-0" style='background:#${randColor()}'>
    <div class="row">
        <div class="column pl-9">
            <h2 class="text-xl font-semibold">${job.role}</h2>
            <p class="text-lg">${job.company}</p>
        </div>
        <div class="column pl-9 lg:pl-0">
            ${tags}
        </div>
        <div class="column column-first flex flex-col items-center justify-center">
            <a href=${job.apply_link}
                target="_blank"
                class="bg-red-400 hover:bg-red-500 shadow text-white font-bold py-2 px-8 rounded cursor-pointer">
                Apply
            </a>
            <p class="text-base mt-2">${job.posted_date}</p>
        </div>
    </div>
    </div>
    <div class="card flex items-center justify-center shadow py-2 bg-transparent">
        <a rel="noopener noreferrer" href='https://twitter.com/intent/tweet?text=Role%20-%20${job.role}%0ACompany%20-%20${job.company}%0ACheck%20out%20-%20https%3A%2F%2Ftheritikchoure.github.io%2FJobzQuest%2F%23${contentType}-${id}' target="_blank"
            title="Share on twitter" class="items-center p-1">
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 fill-current">
                <path
                    d="M23.954 4.569a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.691 8.094 4.066 6.13 1.64 3.161a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.061a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.937 4.937 0 004.604 3.417 9.868 9.868 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.054 0 13.999-7.496 13.999-13.986 0-.209 0-.42-.015-.63a9.936 9.936 0 002.46-2.548l-.047-.02z">
                </path>
            </svg>
        </a>
        <a onclick="copyToClipboard('https://theritikchoure.github.io/JobzQuest/#${contentType}-${id}')"
            title="Copy link" twitter" class="items-center p-1 cursor-pointer">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M9 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V15"></path>
            </svg>    
        </a>
    </div>
    </div>`;

    return content;
}

// Change content based on job type (jobs/internships), 
// if skill is provided then filter based on that skill on selected job type (jobs/internships)
async function changeContent(type = 'jobs', skill = null) {
    let str = '';
    let headingText = '';
    let jobs = [];
    let id;

    setItemToLocalStorage('content', type); // set content type to local storage

    // Set the job preference for subscribe form
    formPreference.value = type === 'internships' ? '2' : '1';

    loader.classList.toggle('hidden'); // loading starts

    // Remove all other listings before changing content 
    let cards = document.querySelectorAll(".main-card"); // existing cards
    for (let i = 0; i < cards.length; i++) {
        cards[i].remove();
    }

    if (type === 'internships') {
        id = internshipsData.length;
        jobs = internshipsData;
        headingText = 'Latest Internships';

        if(skill) {
            let filterInternships = internshipsData.filter((job) => {
                if (skill) {
                    return job.tags.find((tag) => tag.toLocaleLowerCase() === skill.toLocaleLowerCase());
                }
            })

            if(filterInternships.length > 0) {
                headingText = `Latest Internships with #${skill} skill`;
                jobs = filterInternships;
            } else {
                alert('No internship found for this skill. Showing all internships.');
            }

        }
    } else {
        id = jobsData.length;
        jobs = jobsData;
        headingText = 'Latest Jobs';

        if(skill) {
            let filterJobs = jobsData.filter((job) => {
                if (skill) {
                    return job.tags.find((tag) => tag.toLocaleLowerCase() === skill.toLocaleLowerCase());
                }
            })

            if(filterJobs.length > 0) {
                headingText = `Latest Jobs with #${skill} skill`;
                jobs = filterJobs;
            } else {
                alert('No jobs found for this skill. Showing all jobs.');
            }
        }
    }

    jobs.forEach((job) => {
        str += jobsContentHtml(job, id--);
    })

    listingHeading.innerText = headingText;
    listings.insertAdjacentHTML('beforeend', str); // Add all jobs card to the DOM 
    loader.classList.toggle('hidden'); // loading ends
}

// Cookie accept handle function
function cookieAccept() {
    setItemToLocalStorage('cookie-accept', true)
    cookieModal.classList.add('hidden');
}

// When the user scrolls down 20px from the top of the document, show the button
function scrollFunction() {
    if (
        document.body.scrollTop > 20 ||
        document.documentElement.scrollTop > 20
    ) {
        backToTopBtn.style.display = "block";
    } else {
        backToTopBtn.style.display = "none";
    }
}

// When the user clicks on the button, scroll to the top of the document
function backToTop() {
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
}

// Copy to clipboard 
async function copyToClipboard(text) {
    await navigator.clipboard.writeText(text);
    alert("Copied to clipboard")
}

// Search form submit event
searchForm.addEventListener('submit', (event) => {
    let contentType = getItemFromLocalStorage('content');
    let skill = searchForm['skill'];
    event.preventDefault();
    changeContent(contentType, skill.value);
});

// Search form reset event
searchForm.addEventListener('reset', (event) => {
    event.preventDefault();
    if (searchForm['skill'].value === '') return;
    searchForm['skill'].value = '';
    changeContent(getItemFromLocalStorage('content'), null);
})

// Generate random hex
function randHex() {
    return (Math.floor(Math.random() * 56) + 200).toString(16);
}

// Generate random color
function randColor() {
    return randHex() + "" + randHex() + "" + randHex();
}

// Get item from local storage
function getItemFromLocalStorage(key) {
    return localStorage.getItem(key);
}

// Set item to local storage
function setItemToLocalStorage(key, value) {
    return localStorage.setItem(key, value);
}