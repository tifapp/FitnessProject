import { Auth } from "aws-amplify"

async function setMyId () {
  const query = await Auth.currentUserInfo()
  // @ts-ignore
  global.id = query.attributes.sub
}

export default function getMyId () {
  // @ts-ignore
  if (global.id == null) {
    setMyId()
  }

  // @ts-ignore
  return global.id
}
