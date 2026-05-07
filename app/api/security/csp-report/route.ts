import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const rapport = await req.json()
    // Logger les violations CSP pour audit
    console.warn('[CSP Violation]', JSON.stringify(rapport))
    // On pourrait aussi ajouter les rapports CSP dans JournalSecurite
    // ou une table dédiée "CSPReport"
  } catch {}
  return NextResponse.json({ ok: true }, { status: 204 })
}
