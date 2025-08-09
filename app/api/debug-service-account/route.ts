import { NextResponse } from "next/server"
import { google } from "googleapis"

export async function GET() {
  const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID
  const credsRaw = process.env.GOOGLE_SERVICE_ACCOUNT_CREDENTIALS

  if (!spreadsheetId) {
    return NextResponse.json(
      {
        ok: false,
        error: "Missing GOOGLE_SPREADSHEET_ID",
        hint: "Add GOOGLE_SPREADSHEET_ID to your .env.local and restart the dev server",
      },
      { status: 400 },
    )
  }

  if (!credsRaw) {
    return NextResponse.json(
      {
        ok: false,
        error: "Missing GOOGLE_SERVICE_ACCOUNT_CREDENTIALS",
        hint:
          "Paste the full JSON of your service account into GOOGLE_SERVICE_ACCOUNT_CREDENTIALS and share the sheet with its client_email.",
      },
      { status: 400 },
    )
  }

  try {
    const creds = JSON.parse(credsRaw)

    const clientEmail: string | undefined = creds.client_email
    const privateKey: string | undefined = creds.private_key

    if (!clientEmail || !privateKey) {
      return NextResponse.json(
        {
          ok: false,
          error: "Malformed GOOGLE_SERVICE_ACCOUNT_CREDENTIALS",
          hint: "Ensure the JSON contains client_email and private_key fields",
        },
        { status: 400 },
      )
    }

    const auth = new google.auth.JWT({
      email: clientEmail,
      key: privateKey.replace(/\\n/g, "\n"),
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    })

    const sheets = google.sheets({ version: "v4", auth })

    // Try reading metadata
    const meta = await sheets.spreadsheets.get({ spreadsheetId })
    const title = meta.data.properties?.title
    const sheetTitles = (meta.data.sheets || []).map((s) => s.properties?.title)

    // Try reading a small range
    const range = "A1:Z5"
    const valuesResp = await sheets.spreadsheets.values.get({ spreadsheetId, range })

    return NextResponse.json({
      ok: true,
      spreadsheetId,
      serviceAccountEmail: clientEmail,
      spreadsheetTitle: title,
      sheets: sheetTitles,
      sample: valuesResp.data.values || [],
      hint:
        "If this is 403, share the sheet with the above serviceAccountEmail (Viewer for read-only, Editor for writes).",
    })
  } catch (error: any) {
    const status = error?.code || error?.response?.status || 500
    return NextResponse.json(
      {
        ok: false,
        error: error?.message || "Unknown error",
        raw: error?.response?.data || undefined,
        hint:
          status === 403
            ? "403 PERMISSION_DENIED: Share the sheet with the service account email (from GOOGLE_SERVICE_ACCOUNT_CREDENTIALS)"
            : undefined,
      },
      { status },
    )
  }
}


