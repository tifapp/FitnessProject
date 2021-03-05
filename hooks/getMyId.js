import { Auth, } from "aws-amplify";

async function setMyId() {
  const query = await Auth.currentUserInfo();
  global.id = query.attributes.sub;
}

export default function getMyId() {
  if (global.id == null) {
    setMyId();
  }

  return global.id;
}