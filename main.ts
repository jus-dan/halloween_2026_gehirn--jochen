
let gehirn = neopixel.create(DigitalPin.P14, 59, NeoPixelMode.RGB)
let herz = neopixel.create(DigitalPin.P2, 30, NeoPixelMode.RGB)

gehirn.setBrightness(180)
herz.setBrightness(180)

// =======================================
// GEHIRN: CHAOTISCHE NERVENIMPULSE
// =======================================

let anzahlLEDs = 59
let impulsePosition = [5, 25, 45, 12]
let impulseRichtung = [1, -1, 1, -1]
let impulseRest = [0, 0, 0, 0]
let impulseTempo = [1, 2, 1, 3]
let impulseFarbe = [0, 1, 2, 0]

let frame = 0
let naechsterGeistesblitz = input.runningTime() +
    randint(2000, 5000)
let geistesblitzPosition = -1
let geistesblitzRichtung = 1
let gesamtblitz = 0

// =======================================
// GROVE CHAINABLE RGB
// Clock P1 / Data P15
// =======================================

let clockPin = DigitalPin.P1
let dataPin = DigitalPin.P15

let rot = [0, 0, 0]
let gruen = [0, 0, 0]
let blau = [0, 0, 0]

let pulsPhase = [0, 0.35, 0.7]
let pulsSchritt = [0.025, 0.019, 0.015]
let maxHelligkeit = [1, 0.85, 0.95]

let aktuelleRot = [35, 150, 10]
let aktuelleGruen = [170, 25, 230]
let aktuelleBlau = [255, 255, 190]

let zielRot = [35, 150, 10]
let zielGruen = [170, 25, 230]
let zielBlau = [255, 255, 190]

pins.digitalWritePin(clockPin, 0)
pins.digitalWritePin(dataPin, 0)

// =======================================
// GROVE P9813 PROTOKOLL
// =======================================

function sendeBit(bit: number) {
    pins.digitalWritePin(clockPin, 0)
    pins.digitalWritePin(dataPin, bit)
    pins.digitalWritePin(clockPin, 1)
}

function sendeByte(wert: number) {
    for (let b = 7; b >= 0; b--) {
        sendeBit((wert >> b) & 1)
    }
}

function sendeFarbe(r: number, g: number, b: number) {
    let prefix = 0xC0
    prefix |= ((~b >> 6) & 3) << 4
    prefix |= ((~g >> 6) & 3) << 2
    prefix |= ((~r >> 6) & 3)

    sendeByte(prefix)
    sendeByte(b)
    sendeByte(g)
    sendeByte(r)
}

function zeigeGeister() {
    for (let i = 0; i < 4; i++) {
        sendeByte(0)
    }

    for (let i = 0; i < 3; i++) {
        sendeFarbe(rot[i], gruen[i], blau[i])
    }

    for (let i = 0; i < 4; i++) {
        sendeByte(0)
    }
}

// =======================================
// ZUFÄLLIGE GEISTERFARBEN
// =======================================

function neueGeisterFarbe(i: number) {
    let farbe = randint(0, 6)

    if (farbe == 0) {
        zielRot[i] = 35
        zielGruen[i] = 170
        zielBlau[i] = 255
    } else if (farbe == 1) {
        zielRot[i] = 150
        zielGruen[i] = 25
        zielBlau[i] = 255
    } else if (farbe == 2) {
        zielRot[i] = 10
        zielGruen[i] = 230
        zielBlau[i] = 190
    } else if (farbe == 3) {
        zielRot[i] = 220
        zielGruen[i] = 35
        zielBlau[i] = 190
    } else if (farbe == 4) {
        zielRot[i] = 170
        zielGruen[i] = 215
        zielBlau[i] = 255
    } else if (farbe == 5) {
        zielRot[i] = 25
        zielGruen[i] = 255
        zielBlau[i] = 35
    } else {
        zielRot[i] = 15
        zielGruen[i] = 200
        zielBlau[i] = 90
    }
}

// =======================================
// GEHIRN: NEUEN IMPULS STARTEN
// =======================================

function neuerImpuls(i: number) {
    impulsePosition[i] = randint(0, 58)

    if (randint(0, 1) == 0) {
        impulseRichtung[i] = -1
    } else {
        impulseRichtung[i] = 1
    }

    // Kurze oder längere Teilstrecken
    impulseRest[i] = randint(5, 22)

    // Unterschiedliche Geschwindigkeiten
    impulseTempo[i] = randint(1, 3)

    // 0 = Pink, 1 = Violett, 2 = Eisblau
    impulseFarbe[i] = randint(0, 2)
}

// =======================================
// GEHIRN: CHAOTISCHES NEURONENFEUER
// P14 / 59 LEDs
// =======================================

basic.forever(function () {
    frame += 1

    // Sehr dunkler Hintergrund
    gehirn.showColor(neopixel.rgb(2, 0, 3))

    // Vier unabhängige Nervenimpulse
    for (let i = 0; i < 4; i++) {

        if (impulseRest[i] <= 0) {
            // Zufällig neue Aktivität starten
            if (randint(0, 8) == 0) {
                neuerImpuls(i)
            }
        } else {

            // Bewegung unterschiedlich schnell
            if (frame % impulseTempo[i] == 0) {
                impulsePosition[i] += impulseRichtung[i]
                impulseRest[i] -= 1
            }

            let p = impulsePosition[i]

            if (p >= 0 && p < 59) {

                // Pinker Nervenimpuls
                if (impulseFarbe[i] == 0) {
                    gehirn.setPixelColor(
                        p, neopixel.rgb(255, 15, 125)
                    )
                }

                // Violetter Nervenimpuls
                if (impulseFarbe[i] == 1) {
                    gehirn.setPixelColor(
                        p, neopixel.rgb(130, 0, 255)
                    )
                }

                // Eisblauer Nervenimpuls
                if (impulseFarbe[i] == 2) {
                    gehirn.setPixelColor(
                        p, neopixel.rgb(70, 180, 255)
                    )
                }

                // Kurzer Schweif entgegen der Laufrichtung
                let schweif = p - impulseRichtung[i]
                if (schweif >= 0 && schweif < 59) {
                    gehirn.setPixelColor(
                        schweif, neopixel.rgb(45, 0, 75)
                    )
                }
            }

            // Am Ende des Streifens stoppen
            if (p < 0 || p >= 59) {
                impulseRest[i] = 0
            }

            // Seltene Richtungsumkehr
            if (randint(0, 35) == 0) {
                impulseRichtung[i] *= -1
            }
        }
    }

    // ===================================
    // GEISTESBLITZ: ZUFÄLLIG
    // ===================================

    if (geistesblitzPosition < 0 &&
        gesamtblitz == 0 &&
        input.runningTime() >= naechsterGeistesblitz) {

        // Zufällige Richtung
        if (randint(0, 1) == 0) {
            geistesblitzPosition = 0
            geistesblitzRichtung = 1
        } else {
            geistesblitzPosition = 58
            geistesblitzRichtung = -1
        }
    }

    if (geistesblitzPosition >= 0 &&
        geistesblitzPosition < 59) {

        // Heller Blitz mit blauem Schweif
        for (let k = 0; k < 7; k++) {
            let p = geistesblitzPosition -
                k * geistesblitzRichtung

            if (p >= 0 && p < 59) {
                if (k == 0) {
                    gehirn.setPixelColor(
                        p, neopixel.rgb(255, 255, 255)
                    )
                } else if (k < 3) {
                    gehirn.setPixelColor(
                        p, neopixel.rgb(100, 210, 255)
                    )
                } else {
                    gehirn.setPixelColor(
                        p, neopixel.rgb(15, 40, 160)
                    )
                }
            }
        }

        geistesblitzPosition +=
            geistesblitzRichtung * 5

        if (geistesblitzPosition < 0 ||
            geistesblitzPosition >= 59) {

            geistesblitzPosition = -1
            gesamtblitz = 2
        }
    }

    // Kurzer Blitz durch den ganzen Kopf
    if (gesamtblitz > 0) {
        if (gesamtblitz == 2) {
            gehirn.showColor(neopixel.rgb(170, 210, 255))
        } else {
            gehirn.showColor(neopixel.rgb(25, 35, 80))
        }

        gesamtblitz -= 1

        if (gesamtblitz == 0) {
            naechsterGeistesblitz =
                input.runningTime() + randint(2000, 5000)
        }
    }

    gehirn.show()
    basic.pause(35)
})

// =======================================
// HERZ: ROTER DOPPEL-HERZSCHLAG
// P2 / 30 LEDs
// =======================================

basic.forever(function () {
    herz.showColor(neopixel.rgb(20, 0, 0))
    basic.pause(180)

    for (let i = 20; i <= 220; i += 25) {
        herz.showColor(neopixel.rgb(i, 0, 0))
        basic.pause(15)
    }

    for (let i = 220; i >= 40; i -= 30) {
        herz.showColor(neopixel.rgb(i, 0, 0))
        basic.pause(15)
    }

    for (let i = 40; i <= 255; i += 40) {
        herz.showColor(neopixel.rgb(i, 0, 0))
        basic.pause(12)
    }

    for (let i = 255; i >= 25; i -= 15) {
        herz.showColor(neopixel.rgb(i, 0, 0))
        basic.pause(20)
    }

    herz.showColor(neopixel.rgb(20, 0, 0))
    basic.pause(350)
})

// =======================================
// GESPENSTER: UNREGELMÄSSIGES GLIMMEN
// P1 Clock / P15 Data
// =======================================

basic.forever(function () {
    for (let i = 0; i < 3; i++) {

        pulsPhase[i] += pulsSchritt[i]

        if (pulsPhase[i] >= 1) {
            pulsPhase[i] -= 1
            pulsSchritt[i] = 1 / randint(33, 67)
            maxHelligkeit[i] = randint(75, 100) / 100
            neueGeisterFarbe(i)
        }

        let puls = (1 - Math.cos(
            pulsPhase[i] * 2 * Math.PI
        )) / 2

        let hell = 0.02 + puls *
            (maxHelligkeit[i] - 0.02)

        aktuelleRot[i] +=
            (zielRot[i] - aktuelleRot[i]) * 0.10

        aktuelleGruen[i] +=
            (zielGruen[i] - aktuelleGruen[i]) * 0.10

        aktuelleBlau[i] +=
            (zielBlau[i] - aktuelleBlau[i]) * 0.10

        rot[i] = Math.round(aktuelleRot[i] * hell)
        gruen[i] = Math.round(aktuelleGruen[i] * hell)
        blau[i] = Math.round(aktuelleBlau[i] * hell)
    }

    zeigeGeister()
    basic.pause(30)
})
