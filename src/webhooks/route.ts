import { processWebhook } from 'corsair';
import { corsair } from '../corsair.js';

// export async function handleWebhook(req: Request) {
// 	const url = new URL(req.url);

//     const result = await processWebhook(
//         corsair, // corsair instance
//         Object.fromEntries(req.headers), // headers
//         await req.json(), // body
//         {
//             tenantId: url.searchParams.get('tenantId') // tenant id
//         }
//     );

//     if (result.plugin) {
//         console.log(`Handled by ${result.plugin}.${result.action}`);
//     }

//     return result.response;
// }


// export async function POST(request: Request) {
// 	const headers: Record<string, string> = {};
// 	request.headers.forEach((value, key) => {
// 		headers[key] = value;
// 	});

// 	const contentType = request.headers.get('content-type');

// 	let body: string | Record<string, unknown>;

// 	if (contentType?.includes('application/json')) {
// 		body = await request.json();
// 	} else {
// 		const text = await request.text();
// 		body = text && text.trim() ? text : {};
// 	}

// 	const tenantId = 'dev'

// 	const result = await processWebhook(corsair, headers, body, { tenantId });

// 	console.info('Plugin Processed:', result.plugin, result.action);

// 	// Build response headers (e.g. Asana X-Hook-Secret handshake)
// 	// any/unknown cast needed since responseHeaders is a newer field not yet in the installed type definitions
// 	const responseHeaders = result.responseHeaders
// 	const nextHeaders = new Headers();
// 	if (responseHeaders) {
// 		for (const [key, value] of Object.entries(responseHeaders)) {
// 			nextHeaders.set(key, value);
// 		}
// 	}

// 	// Handle case where no webhook matched
// 	if (!result.response) {
// 		return NextResponse.json(
// 			{
// 				success: false,
// 				message: 'No matching webhook handler found',
// 			},
// 			{ status: 404 },
// 		);
// 	}

// 	if (result.response !== undefined) {
// 		return NextResponse.json(result.response, { headers: nextHeaders });
// 	}

// 	// Webhook processed successfully, but no data to return to sender
// 	return new NextResponse(null, { status: 200, headers: nextHeaders });
// }

// export async function GET() {
// 	return NextResponse.json({
// 		status: 'ok',
// 		message: 'Webhook endpoint is active',
// 		timestamp: new Date().toISOString(),
// 	});
// }


import express, { type Router } from "express";

export const webhooksRouter: Router = express.Router();

webhooksRouter.post("/", async (req, res) => {
  // const tenantId = (req.query.tenantId as string) ?? "ankit"; // or from auth later
  const tenantId = (req.query.tenantId as string); // or from auth later

  const result = await processWebhook(
    corsair,
    req.headers as Record<string, string | string[] | undefined>,
    req.body,
    { tenantId },
  );

  if (result.responseHeaders) {
    for (const [key, value] of Object.entries(result.responseHeaders)) {
      res.setHeader(key, value);
    }
  }

  if (!result.response) {
    return res.status(404).json({
      success: false,
      message: "No matching webhook handler found",
    });
  }
  console.log(result);

  return res.status(200).json(result.response);
});

webhooksRouter.get("/", (_req, res) => {
  console.log("Webhook endpoint is active");
  res.json({ status: "ok", message: "Webhook endpoint is active" });
});