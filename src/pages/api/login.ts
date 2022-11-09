import { login } from "../../api/users";

export async function post({ params, request }) {
    const data = await request.formData();
    const email = data.get("email") as string;
    const user = await login(email);
    if (user) {
        return new Response("ok", {
            headers: { 
                Location: '/',
                "Set-Cookie": "session=" + user.id + "; expires=0; path=/; HttpOnly; SameSite=Strict"
            },
            status: 302
        });
    } else {
        return new Response("failed", {
            headers: { Location: '/login' },
            status: 302
        });
    }
}
