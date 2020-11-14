//get the user's latitude and longitude and pass it here

export default function computeDistanceFromUser([lat, long]) {
    const prevLatInRad = toRad(user.Lat);
    const prevLongInRad = toRad(user.Long);
    const latInRad = toRad(lat);
    const longInRad = toRad(long);

    return (
        // In kilometers
        6377.830272 *
        Math.acos(
            Math.sin(prevLatInRad) * Math.sin(latInRad) +
            Math.cos(prevLatInRad) * Math.cos(latInRad) * Math.cos(longInRad - prevLongInRad),
        )
    );
}

function toRad(angle) {
    return (angle * Math.PI) / 180;
}