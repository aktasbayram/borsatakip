import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query) {
        return NextResponse.json({ suggestions: [] });
    }

    try {
        // Fetch suggestions from Google Autocomplete API
        // client=firefox returns JSON format which is easier to parse
        const response = await fetch(
            `http://suggestqueries.google.com/complete/search?client=firefox&ds=yt&q=${encodeURIComponent(query)}&hl=tr`
        );

        if (!response.ok) {
            throw new Error("Google API error");
        }

        // Google Suggest API sometimes returns ISO-8859-1 or other encodings
        // We need to ensure we handle the buffer correctly as UTF-8 or specific encoding
        const arrayBuffer = await response.arrayBuffer();
        const decoder = new TextDecoder("iso-8859-9"); // Turkish charset often used
        const text = decoder.decode(arrayBuffer);

        // If JSON parse fails, try UTF-8 fallback
        let data;
        try {
            data = JSON.parse(text);
        } catch (e) {
            const utf8Decoder = new TextDecoder("utf-8");
            data = JSON.parse(utf8Decoder.decode(arrayBuffer));
        }

        // data format: ["query", ["suggestion1", "suggestion2", ...]]
        const suggestions = data[1] || [];

        return NextResponse.json({ suggestions });
    } catch (error) {
        console.error("Keyword suggestion error:", error);
        return NextResponse.json({ suggestions: [] }, { status: 500 });
    }
}
