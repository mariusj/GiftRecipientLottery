import { drawUsers } from "../../api/draw";

export async function post({ params, request }) {
    await drawUsers();
    return new Response("ok", {
        headers: { Location: '/' },
        status: 302
    })
}
