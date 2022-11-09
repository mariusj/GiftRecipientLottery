import { saveInstructions } from "../../api/instr";

export async function post({ params, request }) {
    const data = await request.formData();
    const body = data.get("instructions") as string;
    await saveInstructions(body);
    return new Response("ok", {
        headers: { Location: '/' },
        status: 302
    })
}
