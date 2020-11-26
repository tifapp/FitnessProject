export default function computeDistance([lat1, long1], [lat2, long2]) {
    const prevLatInRad = toRad(lat1);
    const prevLongInRad = toRad(long1);
    const latInRad = toRad(lat2);
    const longInRad = toRad(long2);

    const distance = 3963 * //3963 miles is the radius of earth
        Math.acos(
            Math.sin(prevLatInRad) * Math.sin(latInRad) +
            Math.cos(prevLatInRad) * Math.cos(latInRad) * Math.cos(longInRad - prevLongInRad),
        )

    return (
        // In kilometers
        distance.toFixed(0)
    );
}

function toRad(angle) {
    return (angle * Math.PI) / 180;
}