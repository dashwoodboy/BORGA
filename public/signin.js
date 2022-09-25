window.onload = setup

function setup() {
    const username = document.getElementById('username')
    const password = document.getElementById('password')
    document.getElementById('signinbutton').addEventListener('click', () => handlerSignin(username, password))
}

async function handlerSignin(inUsername, password) {
    try {
        const passwordDigested = await digest(password.value)
        const resp = await fetch('/signin/', {
            method: 'POST',
            body: JSON.stringify({ username: inUsername.value, password: passwordDigested }),
            headers: { 'Content-Type': 'application/json' }
        })
        if (resp.status === 404) {
            document.location.href = `/signup/`
            return
        }
        if (resp.status != 200) {
            const body = await resp.text()
                //TODO: Check alert
            showAlert(resp.statusText)
            return
        }
        document.location.href = `/users/${inUsername.value}/groups/`
    } catch (err) {
        alert(err)
    }
}

async function digest(message) {
    const msgUint8 = new TextEncoder().encode(message) // encode as (utf-8) Uint8Array
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8) // hash the message
    const hashArray = Array.from(new Uint8Array(hashBuffer)) // convert buffer to byte array
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('') // convert bytes to hex string
    return hashHex
}

function showAlert(message) {
    const html = `<p class="error_text">${message}</p>`
    document
        .getElementById('alert')
        .innerHTML = html
}