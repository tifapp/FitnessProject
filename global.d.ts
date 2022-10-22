export declare global {
  var myId: string;
  function showNotificationDot() : void
  function hideNotificationDot() : void
  var localBlockList: Block[];
  var savedUsers : Record<string, {name: string, imageURL: string, isFullSize: boolean}>
}