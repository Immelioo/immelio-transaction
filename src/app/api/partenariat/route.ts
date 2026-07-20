import { NextResponse } from "next/server";

// Endpoint déprécié — utiliser POST /api/devenir-partenaire à la place.
export function POST() {
  return NextResponse.json(
    { error: "Endpoint déprécié. Utiliser /api/devenir-partenaire." },
    { status: 410 }
  );
}
