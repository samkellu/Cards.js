import { serve } from "https://deno.land/std@0.184.0/http/server.ts";

const handler = async (req: Request) => {
    const filePath = "." + new URL(req.url).pathname;
    const body = (await Deno.open(filePath)).readable;
    return new Response(body);
};

console.log("Listening on http://localhost:8000");
serve(handler, { port: 8080 });