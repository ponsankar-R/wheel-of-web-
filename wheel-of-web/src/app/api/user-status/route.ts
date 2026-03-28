import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const regNumber = searchParams.get('regNumber');

  if (!regNumber) {
    return NextResponse.json({ error: 'Registration number is required' }, { status: 400 });
  }

  try {
    const db = await getDb();
    const user = await db.collection('users').findOne({ regNumber });

    if (!user) {
      return NextResponse.json({ exists: false });
    }

    return NextResponse.json({
      exists: true,
      user: {
        name: user.name,
        regNumber: user.regNumber,
        assignedQuestion: user.assignedQuestion,
        hasUploaded: !!user.zipFile
      }
    });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
