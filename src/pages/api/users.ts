import { addUser } from "../../api/users";

export async function post({ params, request }) {
    const data = await request.json();
    await addUser(data);
    return new Response("ok", {
        headers: { Location: '/' },
        status: 302
    })
}
