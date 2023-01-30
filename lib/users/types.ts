import { Tagged } from "../Tagged";
import { User } from "src/models";

export class UserID extends Tagged<User, string> {}
