export function random(min, max) {
    return Math.round(min + (Math.random() * (max - min)));
}

export function randomChoice(array) {
    return array[Math.round(random(0, array.length - 1))];
}
