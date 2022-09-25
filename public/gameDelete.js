window.onload = setup

function setup() {
    document
        .querySelectorAll('.delete__button')
        .forEach(btn => btn.addEventListener('click', () => handlerDeleteGame(btn)))
}

/**
 * 
 * @param {Element} button 
 */
async function handlerDeleteGame(button) {
    try {
        const path = document.location.href.replace('/users', '/api/users') + 'games/' + button.dataset.gameName
        const resp = await fetch(path, { method: 'DELETE' })

        if (resp.status != 204) {
            const body = await resp.text()
            alert(resp.status)
            return
        }
        button.parentElement.remove()
    } catch (err) {
        alert("here")
    }
}