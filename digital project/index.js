function digital(){
    const time = new Date()

    const hours = time.getHours().toString().padStart(2,'0')
    const minutes = time.getMinutes().toString().padStart(2,'0')
    const seconds = time.getSeconds().toString().padStart(2,'0')

    const days = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday"
    ]

    const dayName = days[time.getDay()]

    document.getElementById("clock").textContent =
        `${hours}:${minutes}:${seconds}`
    document.getElementById("day").textContent = dayName
}

setInterval(digital, 1000)
digital()
