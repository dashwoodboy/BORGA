window.onload = setup

function setup() {
    //Update
    const inName = document.getElementById('inName')
    const inDescription = document.getElementById('inDescription')

    document
        .querySelectorAll('.edit__button')
        .forEach(btn => btn.addEventListener('click', () => handlerEditGroup(btn)))

    const button = document.getElementById('editButtonPopup')
    button
        .addEventListener('click', () => handlerSubmitEdit(button, inName, inDescription))

    document
        .getElementById('closeButton')
        .addEventListener('click', () => { document.getElementById('popup').style.display = "none" })

    //Delete
    document
        .querySelectorAll('.delete__button')
        .forEach(btn => btn.addEventListener('click', () => handlerDeleteGroup(btn)))
}

/**
 * 
 * @param {Element} button 
 */
function handlerEditGroup(button) {
    const popup = document.getElementById('popup')
    popup.style.display = 'flex'
    popup.style.flexDirection = 'column'

    document.getElementById('editButtonPopup').dataset.groupId = button.dataset.groupId

}

/**
 * 
 * @param {Element} button 
 */
async function handlerSubmitEdit(button, inName, inDescription) {
    try {
        const path = document.location.href.replace('/users', '/api/users') + button.dataset.groupId
        const resp = await fetch(path, {
            method: 'PUT',
            body: JSON.stringify({ name: inName.value, description: inDescription.value }),
            headers: { 'Content-Type': 'application/json' }
        })

        if (resp.status != 200) {
            const body = await resp.text()
            alert(resp.status)
            return
        }
        button.parentElement.remove()
        location.reload()
    } catch (err) {
        alert("here")
    }
}

/**
 * 
 * @param {Element} button 
 */
async function handlerDeleteGroup(button) {
    try {
        const path = document.location.href.replace('/users', '/api/users') + button.dataset.groupId
        const resp = await fetch(path, { method: 'DELETE', body: JSON.stringify({}), headers: { 'Content-Type': 'application/json' } })

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