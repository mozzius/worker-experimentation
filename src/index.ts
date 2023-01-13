const html = (count: string) => `<!DOCTYPE html>
<html>
	<head>
		<meta charset="utf-8">
		<title>My First Cloudflare Workers Site</title>
		<meta name="viewport" content="width=device-width, initial-scale=1">
	</head>
	<body>
		<h1>Hello World!</h1>
		<p>I have been seen <strong>${count}</strong> times.</p>
	</body>
</html>`;

export interface Env {
	DB: D1Database;
}

export default {
	async fetch(
		request: Request,
		env: Env
		// ctx: ExecutionContext
	): Promise<Response> {
		const url = new URL(request.url);

		switch (url.pathname) {
			case "/": {
				const insert = env.DB.prepare(
					"INSERT INTO Visits (VisitTime) VALUES (?)"
				).bind(Date.now());
				const select = env.DB.prepare("SELECT COUNT(*) FROM Visits");

				console.log("view");

				const result = await env.DB.batch([insert, select]);

				if (!result[1].results || !result[1].results[0])
					throw new Error("No results");

				const count = (result[1].results[0] as { "COUNT(*)": number })[
					"COUNT(*)"
				];

				return new Response(html(String(count)), {
					headers: { "content-type": "text/html;charset=UTF-8" },
				});
			}
			default:
				return new Response("Not found", { status: 404 });
		}
	},
};
