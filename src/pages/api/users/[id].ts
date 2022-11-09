import { deleteUser } from "../../../api/users";

export async function del({params, request}) {
    await deleteUser(parseInt(params.id));
}
