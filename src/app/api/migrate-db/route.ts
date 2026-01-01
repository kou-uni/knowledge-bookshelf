
import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        // Change storage_path from VARCHAR(500) to TEXT to allow Base64 image strings
        await sql`ALTER TABLE inputs ALTER COLUMN storage_path TYPE TEXT;`;

        return NextResponse.json({ message: 'Migration successful: storage_path is now TEXT' });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
