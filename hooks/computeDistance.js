import getLocation from 'hooks/useLocation';

export default function computeDistance(otherLocation) {
    const location = getLocation(true);
    const prevLatInRad = toRad(location.latitude);
    const prevLongInRad = toRad(location.longitude);
    const latInRad = toRad(otherLocation.latitude);
    const longInRad = toRad(otherLocation.longitude);

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