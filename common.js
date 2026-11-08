//Local Storage//

const STORAGE_KEY = 'imybook_readinglist';
const STATUSES = ['To be read', 'Reading', 'Finished' ];

//Load the saved list
function loadList() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        const data = raw ? JSON.parse(raw) : [];
        return Array.isArray(data) ? data : [];
    } catch (error) {
        console.error('Could not read reading list: ', error);
        return [];
    }
}

//save semua list dalam local storage sebagai JSON text
function saveList(list) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

function isInList(id) {
    return loadList().some(item => item.id === id);
}

function addBook(book) {
    const list = loadList();

    if (list.some(item => item.id === book.id)) {
        return { ok: false, message: `"${book.title}" is already in your list.`};
    }

    list.push({
        id: book.id,
        title: book.title,
        author: book.author,
        year: book.year,
        coverId: book.coverId,
        status: 'To be read',
        pages: book.pages || '',
        notes: '',
        addedAt: new Date().toISOString()
    });

    saveList(list);
    return { ok: true, message: `"${book.title}" added to your reading list.` };
}

//Update
function updateBook(id, changes) {
    if (!STATUSES.includes(changes.status)) {
        return { ok: false, message: 'Choose a valid status.'};
    }

    let pages = '';
    if (changes.pages !== '') {
        const number = Number(changes.pages);
        if (!Number.isInteger(number) || number < 1 || number > 10000) {
            return { ok: false, message: 'Pages must be a whole number between 1 and 10000.'};
        }
        pages = number;
    }

    if (changes.notes.length > 200 ) {
        return {ok: false, message: 'Notes must be 200 characters or less.'};
    }

    const list = loadList();
    const index = list.findIndex(item => item.id === id);
    if (index === -1) {
        return {ok: false, message: 'Book not found in your list.'};
    }

    list[index].status = changes.status;
    list[index].pages = pages;
    list[index].notes = changes.notes;
    saveList(list);

    return {ok: true, message: `"${list[index].title}" updated.`};
}

//Delete
function deleteBook(id) {
    const list = loadList();
    const target = list.find(item => item.id === id);
    if (!target) {
        return { ok: false, message: 'Book not found in list.'};
    }

    saveList(list.filter(item => item.id !== id));
    return { ok: false, message: `"${target.title}" removed from list.`};
}

//UI Helpers
function coverUrl(coverId) {
    return `https://covers.openlibrary.org/b/id/${coverId}-M.jpg`;
}

function makePlaceholder(titleText) {
    const box = document.createElement('div');
    box.className = 'placeholder';
    box.textContent = titleText;
    return box;
}

function makeButton(text, className, onclick) {
    const button = document.createElement('button');
    button.textContent = text;
    button.className = className;
    button.addEventListener('click', onclick);
    return button;
}

let messageTimer;
function showMessage(element, text, type) {
    element.textContent = text;
    element.className = type === 'error' ? 'msg-error' : 'msg-ok';
    clearTimeout(messageTimer);
    messageTimer = setTimeout(() => { element.textContent = '';}, 3500);
}