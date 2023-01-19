export declare global {
  var myId: string;
  var localBlockList: Block[];
  function showNotificationDot() : void
  function hideNotificationDot() : void
  var addConversationIds: (_ : string) => void
  var currentVideo: string | null | undefined
  var savedUsers : Record<string, {
    name: string,
    imageURL?: string | null,
    isFullSize?: boolean,
    status?: string | null,
    isVerified: boolean,
  }>;
  var addMyMessageToFriendsList: (_ : Post) => void
}