import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import crypto from "crypto"


export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { text } = body;
    const url = new URL("https://obay-developer--sd-demo-model-generate-image.modal.run/")

    url.searchParams.set("prompt", text)
    console.log("Requested Url : ", url.toString())

    const response = await fetch(url.toString(),{
      method: "GET",
      headers: {
        "X-API-Key": process.env.API_KEY || "",
        Accept: "image/jpeg"
      },}
    )

    if (!response.ok){
		const errorText = await response.text
		console.log("Error Message :", errorText)
		throw new Error(`HTTP Erorr status: ${response.status} Error Message: ${errorText}`)
	}

	const imageBuffer = await response.arrayBuffer()
	const filename = `${crypto.randomUUID}`
	const blob = await put(filename, imageBuffer,{
		access: "public",
		contentType: "image/jpeg"
	})

    return NextResponse.json({
      success: true,
      imageUrl: blob.url,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to process request" },
      { status: 500 }
    );
  }
}