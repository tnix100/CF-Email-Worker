export default {
    async fetch(request, env) {
        // check token
        if (!request.headers.get("Authorization") || request.headers.get("Authorization") !== env.AUTH_TOKEN) {
            return new Response(JSON.stringify({
                error: "Token invalid"
            }), {
                status: 401,
                statusText: "Unauthorized"
            });
        }

        // extract request body
        let body = await request.json();

        // create MailChannels request body
        let mailChannelsBody = {
            from: { email: env.SENDER_EMAIL, name: env.SENDER_NAME },
            personalizations: [{
                    to: [{ email: body.email, name: body.name }],
                    dkim_domain: env.DOMAIN,
                    dkim_selector: env.DKIM_SELECTOR,
                    dkim_private_key: env.DKIM_KEY
                                        .replaceAll("-----BEGIN PRIVATE KEY-----", "")
                                        .replaceAll("-----END PRIVATE KEY-----", "")
                                        .replaceAll("\n", ""),
            }],
            subject: body.subject,
            content: [],
        };
        if (body.text) {
            mailChannelsBody.content.push({
                type: "text/plain",
                value: body.text,
            });
        }
        if (body.html) {
            mailChannelsBody.content.push({
                type: "text/html",
                value: body.html,
            });
        }

        // make request to MailChannels API
        return fetch("https://api.mailchannels.net/tx/v1/send", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(mailChannelsBody),
        });
    }
};